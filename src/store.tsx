import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Badge, Challenge } from './types';
import { LEVEL_THRESHOLDS, BADGES, CHALLENGES as LOCAL_CHALLENGES } from './data';
import { auth, db, handleFirestoreError, OperationType } from './firebase';
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { doc, getDoc, setDoc, collection, getDocs } from 'firebase/firestore';

interface AppContextType {
  user: User | null;
  loading: boolean;
  challenges: Challenge[];
  newEarnedBadges: Badge[];
  clearNewEarnedBadge: (badgeId: string) => void;
  levelUpData: number | null;
  clearLevelUp: () => void;
  addXp: (xp: number) => void;
  completeChallenge: (challengeId: string, xpReward?: number) => void;
  claimQuest: (questId: string, xpReward: number) => void;
  resolvePvP: (won: boolean) => void;
  saveSnippet: (title: string, code: string, language: 'html' | 'css' | 'javascript') => void;
  deleteSnippet: (id: string) => void;
  buyStreakFreeze: () => void;
  resetProgress: () => void;
  signOut: () => void;
  updateChallenge: (id: string, partial: Partial<Challenge>) => void;
  selectedChallengeId: string | null;
  setSelectedChallengeId: (id: string | null) => void;
}

const defaultUser = (uid: string, name: string, photoURL: string | null): User => {
  const today = new Date().toISOString().split('T')[0];
  return ({
    id: uid,
    name: name,
    photoURL: photoURL || undefined,
    xp: 0,
    level: 1,
    badges: [],
    completedChallenges: [],
    streak: 0,
    streakFreezes: 0,
    coins: 0,
    lastActiveDate: '',
    lastLoginDate: today,
    questProgress: {
      challengesCompleted: 0,
      xpGained: 0,
      date: today,
      claimed: []
    }
  });
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [challenges, setChallenges] = useState<Challenge[]>(LOCAL_CHALLENGES);
  const [newEarnedBadges, setNewEarnedBadges] = useState<Badge[]>([]);
  const [levelUpData, setLevelUpData] = useState<number | null>(null);
  const [selectedChallengeId, setSelectedChallengeId] = useState<string | null>(null);

  useEffect(() => {
    const loadChallenges = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'challenges'));
        let dbChallenges: Challenge[] = [];
        querySnapshot.forEach((doc) => {
          dbChallenges.push(doc.data() as Challenge);
        });

        if (dbChallenges.length < 230) {
          // Sync from API if missing some lessons
          const res = await fetch('/api/fcc-sync');
          if (res.ok) {
            const apiChallenges = await res.json();
            if (Array.isArray(apiChallenges) && apiChallenges.length > 0) {
              const cleanedApi = apiChallenges.map((c: any) => ({ ...c, title: c.title.replace(/^FCC:\s*/, '') }));
              setChallenges([...LOCAL_CHALLENGES, ...cleanedApi]);
              // Save to Firestore
              for (const c of cleanedApi) {
                try { await setDoc(doc(db, 'challenges', c.id), c); } catch (e) {}
              }
            }
          }
        } else {
          // Sort by id assuming they follow fcc_1... or something similar
          dbChallenges.sort((a, b) => a.id.localeCompare(b.id));
          dbChallenges = dbChallenges.map(c => ({ ...c, title: c.title.replace(/^FCC:\s*/, '') }));
          setChallenges([...LOCAL_CHALLENGES, ...dbChallenges]);
        }
      } catch (e) {
        console.error('Failed to load challenges', e);
      }
    };
    loadChallenges();
  }, []);

  const clearNewEarnedBadge = (badgeId: string) => {
    setNewEarnedBadges(prev => prev.filter(b => b.id !== badgeId));
  };

  const clearLevelUp = () => setLevelUpData(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (authUser) {
        const userRef = doc(db, 'users', authUser.uid);
        try {
          const docSnap = await getDoc(userRef);
          if (docSnap.exists()) {
            const data = docSnap.data() as User;
            
            const today = new Date().toISOString().split('T')[0];
            let needsUpdate = false;
            let updatedData = { ...data };

            if (updatedData.email === undefined && authUser.email) {
              updatedData.email = authUser.email;
              needsUpdate = true;
            }

            // Initialize new fields
            if (updatedData.coins === undefined) {
              updatedData.coins = 0;
              needsUpdate = true;
            }
            if (updatedData.streakFreezes === undefined) {
              updatedData.streakFreezes = 0;
              needsUpdate = true;
            }

            // Streak check - if more than 1 day missed, break streak or consume freeze
            const lastActive = updatedData.lastActiveDate || '';
            let newStreak = updatedData.streak || 0;
            let newFreezes = updatedData.streakFreezes || 0;
            
            if (lastActive && lastActive !== today) {
              const lastDate = new Date(lastActive);
              const currentDate = new Date(today);
              // calculate diff in days precisely by comparing midnight times
              lastDate.setHours(0,0,0,0);
              currentDate.setHours(0,0,0,0);
              const diffTime = Math.abs(currentDate.getTime() - lastDate.getTime());
              const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
              
              if (diffDays > 1) {
                const missedDays = diffDays - 1;
                if (newFreezes >= missedDays) {
                  newFreezes -= missedDays;
                  updatedData.streakFreezes = newFreezes;
                  // Set lastActiveDate to yesterday so they still have to complete a task today to keep it
                  const yesterday = new Date(currentDate.getTime() - 86400000).toISOString().split('T')[0];
                  updatedData.lastActiveDate = yesterday;
                  needsUpdate = true;
                } else {
                  newStreak = 0;
                  updatedData.streak = 0;
                  updatedData.streakFreezes = 0;
                  needsUpdate = true;
                }
              }
            }

            if (updatedData.lastLoginDate !== today) {
              updatedData.lastLoginDate = today;
              needsUpdate = true;
            }

            if (!updatedData.questProgress || updatedData.questProgress.date !== today) {
              updatedData.questProgress = {
                challengesCompleted: 0,
                xpGained: 0,
                date: today,
                claimed: []
              };
              needsUpdate = true;
            }

            // Update photoURL if it doesn't exist but authUser has one
            if (!updatedData.photoURL && authUser.photoURL) {
              updatedData.photoURL = authUser.photoURL;
              needsUpdate = true;
            }

            let correctLevel = 1;
            for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
              if (updatedData.xp >= LEVEL_THRESHOLDS[i]) {
                correctLevel = i + 1;
                break;
              }
            }
            if (updatedData.level !== correctLevel) {
              updatedData.level = correctLevel;
              needsUpdate = true;
            }

            if (updatedData.name === 'Thanh Duy Võ' || authUser.displayName === 'Thanh Duy Võ' || authUser.email === 'hcmc.duyvo@gmail.com') {
              const allIds = LOCAL_CHALLENGES.map(c => c.id);
              if (updatedData.completedChallenges.length !== allIds.length && allIds.length > 0) {
                updatedData.completedChallenges = allIds;
                needsUpdate = true;
              }
            }

            if (needsUpdate) {
               await setDoc(userRef, updatedData, { merge: true });
            }

            setUser(updatedData);
          } else {
            const newUser = defaultUser(authUser.uid, authUser.displayName || 'Học viên', authUser.photoURL);
            if (authUser.email) {
              newUser.email = authUser.email;
            }
            
            if (newUser.name === 'Thanh Duy Võ' || authUser.displayName === 'Thanh Duy Võ' || authUser.email === 'hcmc.duyvo@gmail.com') {
              newUser.completedChallenges = LOCAL_CHALLENGES.map(c => c.id);
            }

            await setDoc(userRef, newUser);
            setUser(newUser);
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.GET, `users/${authUser.uid}`);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const saveUser = async (updatedUser: User) => {
    setUser(updatedUser);
    if (auth.currentUser) {
      try {
        const userRef = doc(db, 'users', auth.currentUser.uid);
        await setDoc(userRef, updatedUser);
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `users/${auth.currentUser.uid}`);
      }
    }
  };

  const addXp = (amount: number) => {
    if (!user) return;
    
    let newXp = user.xp + amount;
    let newLevel = user.level;
    
    for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
      if (newXp >= LEVEL_THRESHOLDS[i]) {
        newLevel = i + 1;
        break;
      }
    }

    if (newLevel > user.level) {
      setLevelUpData(newLevel);
    }

    const today = new Date().toISOString().split('T')[0];
    const questProgress = user.questProgress && user.questProgress.date === today
      ? { ...user.questProgress, xpGained: user.questProgress.xpGained + amount }
      : { challengesCompleted: 0, xpGained: amount, date: today, claimed: [] };
    
    saveUser({ ...user, xp: newXp, level: newLevel, questProgress });
  };

  const completeChallenge = (challengeId: string, xpReward?: number) => {
    if (!user) return;
    if (user.completedChallenges.includes(challengeId)) return;
    
    const newCompleted = [...user.completedChallenges, challengeId];
    const newBadges = [...user.badges];
    const newlyEarnedThisTurn: Badge[] = [];

    if (newCompleted.length === 1 && !newBadges.find(b => b.id === 'first_blood')) {
      newBadges.push(BADGES.first_blood);
      newlyEarnedThisTurn.push(BADGES.first_blood);
    }
    
    const hasHtml1 = newCompleted.includes('c1_1');
    const hasHtml2 = newCompleted.includes('c1_2');
    if (hasHtml1 && hasHtml2 && !newBadges.find(b => b.id === 'html_master')) {
      newBadges.push(BADGES.html_master);
      newlyEarnedThisTurn.push(BADGES.html_master);
    }

    const hasCss1 = newCompleted.includes('c2_1');
    const hasCss2 = newCompleted.includes('c2_2');
    if (hasCss1 && hasCss2 && !newBadges.find(b => b.id === 'css_master')) {
      newBadges.push(BADGES.css_master);
      newlyEarnedThisTurn.push(BADGES.css_master);
    }

    const hasJs1 = newCompleted.includes('c3_1');
    const hasJs2 = newCompleted.includes('c3_2');
    if (hasJs1 && hasJs2 && !newBadges.find(b => b.id === 'js_ninja')) {
      newBadges.push(BADGES.js_ninja);
      newlyEarnedThisTurn.push(BADGES.js_ninja);
    }

    let newXp = user.xp + (xpReward || 0);
    let newLevel = user.level;
    
    if (xpReward) {
      for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
        if (newXp >= LEVEL_THRESHOLDS[i]) {
          newLevel = i + 1;
          break;
        }
      }
    }

    if (newLevel > user.level) {
      setLevelUpData(newLevel);
    }

    const today = new Date().toISOString().split('T')[0];
    const questProgress = user.questProgress && user.questProgress.date === today
      ? { 
          ...user.questProgress, 
          challengesCompleted: user.questProgress.challengesCompleted + 1,
          xpGained: user.questProgress.xpGained + (xpReward || 0)
        }
      : { challengesCompleted: 1, xpGained: xpReward || 0, date: today, claimed: [] };

    let newStreak = user.streak || 0;
    let newLastActiveDate = user.lastActiveDate || '';

    if (newLastActiveDate !== today) {
      newStreak += 1;
      newLastActiveDate = today;

      // Check streak milestones
      if (newStreak === 7 && !newBadges.find(b => b.id === 'streak_7')) {
        newBadges.push(BADGES.streak_7);
        newlyEarnedThisTurn.push(BADGES.streak_7);
      } else if (newStreak === 30 && !newBadges.find(b => b.id === 'streak_30')) {
        newBadges.push(BADGES.streak_30);
        newlyEarnedThisTurn.push(BADGES.streak_30);
      } else if (newStreak === 100 && !newBadges.find(b => b.id === 'streak_100')) {
        newBadges.push(BADGES.streak_100);
        newlyEarnedThisTurn.push(BADGES.streak_100);
      }
    }

    if (newlyEarnedThisTurn.length > 0) {
      setNewEarnedBadges(prev => [...prev, ...newlyEarnedThisTurn]);
    }

    const newCoins = (user.coins || 0) + Math.floor((xpReward || 0) / 2); // 1 coin per 2 XP

    saveUser({
      ...user,
      xp: newXp,
      coins: newCoins,
      level: newLevel,
      completedChallenges: newCompleted,
      badges: newBadges,
      questProgress,
      streak: newStreak,
      lastActiveDate: newLastActiveDate
    });
  };

  const buyStreakFreeze = () => {
    if (!user) return;
    const currentCoins = user.coins || 0;
    const currentFreezes = user.streakFreezes || 0;

    if (currentCoins >= 50 && currentFreezes < 3) {
      saveUser({
        ...user,
        coins: currentCoins - 50,
        streakFreezes: currentFreezes + 1
      });
    }
  };

  const claimQuest = (questId: string, xpReward: number) => {
    if (!user || !user.questProgress) return;
    if (user.questProgress.claimed.includes(questId)) return;

    const questProgress = {
      ...user.questProgress,
      claimed: [...user.questProgress.claimed, questId]
    };

    let newXp = user.xp + xpReward;
    let newLevel = user.level;
    
    for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
      if (newXp >= LEVEL_THRESHOLDS[i]) {
        newLevel = i + 1;
        break;
      }
    }

    if (newLevel > user.level) {
      setLevelUpData(newLevel);
    }

    saveUser({ ...user, xp: newXp, level: newLevel, questProgress });
  };

  const resolvePvP = (won: boolean) => {
    if (!user) return;
    
    // Win: +50 XP, Lose: -20 XP
    const xpChange = won ? 50 : -20;
    
    let newXp = Math.max(0, user.xp + xpChange);
    let newLevel = user.level;
    
    // Check level up or down
    for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
      if (newXp >= LEVEL_THRESHOLDS[i]) {
        newLevel = i + 1;
        break;
      }
    }

    if (newLevel > user.level) {
      setLevelUpData(newLevel);
    }

    saveUser({ ...user, xp: newXp, level: newLevel });
  };

  const saveSnippet = (title: string, code: string, language: 'html' | 'css' | 'javascript') => {
    if (!user) return;
    const snippets = user.snippets || [];
    const newSnippet = {
      id: Date.now().toString(),
      title,
      code,
      language,
      createdAt: Date.now()
    };
    saveUser({ ...user, snippets: [...snippets, newSnippet] });
  };

  const deleteSnippet = (id: string) => {
    if (!user) return;
    const snippets = user.snippets || [];
    saveUser({ ...user, snippets: snippets.filter(s => s.id !== id) });
  };

  const resetProgress = async () => {
    if (auth.currentUser) {
      const resetUser = defaultUser(auth.currentUser.uid, auth.currentUser.displayName || 'Học viên', auth.currentUser.photoURL);
      await saveUser(resetUser);
    }
  };

  const signOut = () => {
    firebaseSignOut(auth);
  };

  const updateChallenge = async (id: string, partial: Partial<Challenge>) => {
    setChallenges(prev => prev.map(c => c.id === id ? { ...c, ...partial } : c));
    try {
      await setDoc(doc(db, 'challenges', id), partial, { merge: true });
    } catch (e) {
      console.error('Failed to update challenge remotely', e);
    }
  };

  return (
    <AppContext.Provider value={{ user, loading, challenges, newEarnedBadges, clearNewEarnedBadge, levelUpData, clearLevelUp, addXp, completeChallenge, claimQuest, resolvePvP, saveSnippet, deleteSnippet, buyStreakFreeze, resetProgress, signOut, updateChallenge, selectedChallengeId, setSelectedChallengeId }}>
      {children}
    </AppContext.Provider>
  );
};


export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
