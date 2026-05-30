import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, query, where, getDocs, limit, addDoc, updateDoc, doc, onSnapshot, serverTimestamp, orderBy } from 'firebase/firestore';
import { useAppContext } from '../store';
import { CHALLENGES } from '../data';
import BattleArena from './BattleArena';
import { Swords, Loader2, User as UserIcon } from 'lucide-react';
import { motion } from 'motion/react';

export default function BattleTab() {
  const { user } = useAppContext();
  const [matchId, setMatchId] = useState<string | null>(null);
  const [matchData, setMatchData] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (!matchId) return;
    const unsub = onSnapshot(doc(db, 'matches', matchId), (docSnap) => {
      if (docSnap.exists()) {
        setMatchData({ id: docSnap.id, ...docSnap.data() });
      } else {
        setMatchId(null);
        setMatchData(null);
        setIsSearching(false);
      }
    });
    return () => unsub();
  }, [matchId]);

  const startMatchmaking = async () => {
    if (!user) return;
    setIsSearching(true);
    
    try {
      const matchesRef = collection(db, 'matches');
      const q = query(
        matchesRef, 
        where('status', '==', 'waiting'),
        orderBy('createdAt'),
        limit(1)
      );
      
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        // Found a match to join
        const matchDoc = snapshot.docs[0];
        const match = matchDoc.data();
        
        // Prevent joining our own match mistakenly if multiple tabs
        if (match.player1.uid === user.id) {
           setMatchId(matchDoc.id);
           return;
        }

        const randomChallenge = CHALLENGES[Math.floor(Math.random() * CHALLENGES.length)];

        await updateDoc(doc(db, 'matches', matchDoc.id), {
          status: 'playing',
          player2: {
            uid: user.id,
            name: user.name,
            photoURL: user.photoURL || null,
            xp: user.xp
          },
          challengeId: randomChallenge.id,
          startedAt: Date.now() + 5000 // Start in 5 seconds
        });
        
        setMatchId(matchDoc.id);
      } else {
        // Create a new match
        const newMatchInfo = {
          status: 'waiting',
          createdAt: serverTimestamp(),
          player1: {
            uid: user.id,
            name: user.name,
            photoURL: user.photoURL || null,
            xp: user.xp
          }
        };
        const docRef = await addDoc(matchesRef, newMatchInfo);
        setMatchId(docRef.id);
      }
    } catch (e) {
      console.error("Matchmaking error:", e);
      setIsSearching(false);
    }
  };

  const cancelMatchmaking = () => {
    // If waiting, could delete the match or just abandon it. We will abandon it for now.
    // In production we should update status to cancelled or delete it.
    if (matchId && matchData?.status === 'waiting') {
      updateDoc(doc(db, 'matches', matchId), { status: 'cancelled' }).catch(console.error);
    }
    setMatchId(null);
    setMatchData(null);
    setIsSearching(false);
  };

  if (matchData && (matchData.status === 'playing' || matchData.status === 'finished')) {
    return <BattleArena matchData={matchData} onLeave={() => { setMatchId(null); setMatchData(null); setIsSearching(false); }} />;
  }

  return (
    <div className="flex flex-col items-center justify-center h-full max-w-4xl mx-auto p-6">
      <div className="glass p-8 rounded-3xl border border-white/10 flex flex-col items-center text-center max-w-md w-full relative overflow-hidden">
        
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-b from-red-500/10 to-transparent pointer-events-none"></div>

        <div className="w-20 h-20 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center mb-6 border border-red-500/30">
          <Swords size={40} />
        </div>
        
        <h2 className="text-3xl font-black text-slate-50 mb-2 font-display">Đấu Trường 1vs1</h2>
        <p className="text-slate-300 mb-8">Cuộc chiến lập trình thời gian thực. Ai giải đúng trước sẽ giành được chiến thắng bằng tốc độ và kỹ năng!</p>
        
        {isSearching && matchData?.status === 'waiting' ? (
          <div className="flex flex-col items-center w-full">
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }} className="mb-4">
              <Loader2 size={32} className="text-red-400" />
            </motion.div>
            <p className="text-red-400 font-bold animate-pulse mb-6">Đang tìm đối thủ...</p>
            
            <button 
              onClick={cancelMatchmaking}
              className="bg-white/5 hover:bg-white/10 text-slate-300 font-bold py-3 px-8 rounded-xl transition w-full"
            >
              Huỷ
            </button>
          </div>
        ) : (
          <button 
            onClick={startMatchmaking}
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-4 px-12 rounded-xl text-lg shadow-[0_0_20px_rgba(239,68,68,0.4)] transition-transform hover:scale-105 active:scale-95 w-full flex items-center justify-center gap-2"
          >
            <Swords size={20} /> Tìm Đối Thủ
          </button>
        )}
      </div>
    </div>
  );
}
