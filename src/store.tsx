import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Badge } from './types';
import { LEVEL_THRESHOLDS, BADGES } from './data';
import { auth, db, handleFirestoreError, OperationType } from './firebase';
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';

interface AppContextType {
  user: User | null;
  loading: boolean;
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
  resetProgress: () => void;
  signOut: () => void;
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
  const [newEarnedBadges, setNewEarnedBadges] = useState<Badge[]>([]);
  const [levelUpData, setLevelUpData] = useState<number | null>(null);

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

            // Streak check - if more than 1 day missed, break streak
            const lastActive = data.lastActiveDate || '';
            let newStreak = data.streak || 0;
            
            if (lastActive && lastActive !== today) {
              const lastDate = new Date(lastActive);
              const currentDate = new Date(today);
              const diffTime = Math.abs(currentDate.getTime() - lastDate.getTime());
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
              
              if (diffDays > 1) {
                newStreak = 0;
                needsUpdate = true;
                updatedData.streak = 0;
              }
            }

            if (data.lastLoginDate !== today) {
              updatedData.lastLoginDate = today;
              needsUpdate = true;
            }

            if (!data.questProgress || data.questProgress.date !== today) {
              updatedData.questProgress = {
                challengesCompleted: 0,
                xpGained: 0,
                date: today,
                claimed: []
              };
              needsUpdate = true;
            }

            // Update photoURL if it doesn't exist but authUser has one
            if (!data.photoURL && authUser.photoURL) {
              updatedData.photoURL = authUser.photoURL;
              needsUpdate = true;
            }

            if (needsUpdate) {
               await setDoc(userRef, updatedData, { merge: true });
            }

            setUser(updatedData);
          } else {
            const newUser = defaultUser(authUser.uid, authUser.displayName || 'Học viên', authUser.photoURL);
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

    if (newlyEarnedThisTurn.length > 0) {
      setNewEarnedBadges(prev => [...prev, ...newlyEarnedThisTurn]);
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
    }

    saveUser({
      ...user,
      xp: newXp,
      level: newLevel,
      completedChallenges: newCompleted,
      badges: newBadges,
      questProgress,
      streak: newStreak,
      lastActiveDate: newLastActiveDate
    });
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

  return (
    <AppContext.Provider value={{ user, loading, newEarnedBadges, clearNewEarnedBadge, levelUpData, clearLevelUp, addXp, completeChallenge, claimQuest, resolvePvP, saveSnippet, deleteSnippet, resetProgress, signOut }}>
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
