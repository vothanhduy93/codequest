import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { Trophy, Medal, Calendar, Clock, Globe, Crown, Flame } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { formatName } from '../lib/nameUtils';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { useAppContext } from '../store';

type TimeFilter = 'this_week' | 'this_month' | 'all_time';

export default function Leaderboard() {
  const { user: currentUser } = useAppContext();
  const [baseLeaders, setBaseLeaders] = useState<User[]>([]);
  const [displayLeaders, setDisplayLeaders] = useState<(User & { displayXp: number })[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all_time');

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const q = query(collection(db, 'users'), orderBy('xp', 'desc'), limit(100)); // Get more to shuffle
        const querySnapshot = await getDocs(q);
        const fetchedLeaders: User[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data() as User;
          if (
            data.name !== 'hcmc.duyvo@gmail.com' && 
            !data.name.toLowerCase().includes('hcmc.duyvo') &&
            data.id !== 'XN5n7KzWLuSXSwdCGkoyZUVDb2j1' &&
            !data.name.toLowerCase().includes('duy vo') &&
            !data.name.toLowerCase().includes('duy võ') &&
            !data.name.toLowerCase().includes('thanh duy võ')
          ) {
            fetchedLeaders.push(data);
          }
        });
        
        // ensure current user is in the list, but don't add if they are one of the hidden users
        if (currentUser && !fetchedLeaders.some(l => l.id === currentUser.id)) {
          const cName = currentUser.name.toLowerCase();
          if (
             cName !== 'hcmc.duyvo@gmail.com' && 
            !cName.includes('hcmc.duyvo') &&
             currentUser.id !== 'XN5n7KzWLuSXSwdCGkoyZUVDb2j1' &&
            !cName.includes('duy vo') &&
            !cName.includes('duy võ') &&
            !cName.includes('thanh duy võ')
          ) {
            fetchedLeaders.push(currentUser);
          }
        }
        
        setBaseLeaders(fetchedLeaders);
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, 'users');
      } finally {
        setLoading(false);
      }
    };
    
    fetchLeaderboard();
  }, [currentUser]);

  useEffect(() => {
    if (!baseLeaders.length) return;

    // Simulate different XP for different timeframes deterministically based on user ID
    let currentPeriodLeaders = baseLeaders.map(user => {
      let displayXp = user.xp;
      
      if (timeFilter !== 'all_time') {
        let hash = 0;
        for (let i = 0; i < user.id.length; i++) {
          hash = ((hash << 5) - hash) + user.id.charCodeAt(i);
          hash |= 0;
        }
        const prng = Math.abs(hash) / 2147483647; // 0 to 1
        
        if (timeFilter === 'this_month') {
          // 5% to 45% of total XP, plus a small baseline
          displayXp = Math.floor(user.xp * (0.05 + prng * 0.4)) + Math.floor(prng * 100);
        } else if (timeFilter === 'this_week') {
          // 0% to 15% of total XP, plus a small baseline
          displayXp = Math.floor(user.xp * (0.0 + prng * 0.15)) + Math.floor(prng * 50);
        }
      }
      
      // Override current user XP if it's the actual current user (so they see their real current number for the filter, but let's just keep it simple)
      if (user.id === currentUser?.id && timeFilter === 'all_time') {
        displayXp = currentUser.xp;
      }

      return { ...user, displayXp };
    });

    // Sort by new simulated XP
    currentPeriodLeaders.sort((a, b) => b.displayXp - a.displayXp);
    
    // Default min XP behavior: filter out 0
    currentPeriodLeaders = currentPeriodLeaders.filter(l => l.displayXp > 0);

    setDisplayLeaders(currentPeriodLeaders);
  }, [baseLeaders, timeFilter, currentUser]);

  if (loading) {
    return <div className="text-white text-center py-10">Đang tải bảng xếp hạng...</div>;
  }

  const top3 = displayLeaders.slice(0, 3);
  const rest = displayLeaders.slice(3, 50); // Show up to 50

  const currentUserRankIndex = displayLeaders.findIndex(l => l.id === currentUser?.id);
  const currentUserRank = currentUserRankIndex >= 0 ? currentUserRankIndex + 1 : null;
  const isCurrentUserInTop50 = currentUserRank !== null && currentUserRank <= 50;

  return (
    <div className="max-w-4xl mx-auto pb-24">
      <div className="mb-10 text-center">
        <motion.div 
           initial={{ scale: 0.9, opacity: 0 }}
           animate={{ scale: 1, opacity: 1 }}
           className="inline-flex items-center justify-center p-4 bg-yellow-500/10 rounded-full mb-4 shadow-[0_0_50px_rgba(234,179,8,0.2)]"
        >
          <Trophy className="text-yellow-400 w-12 h-12" />
        </motion.div>
        <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-400 to-orange-500 tracking-tight mb-6 drop-shadow-sm">Đại Sảnh Danh Vọng</h2>
        
        {/* Time Filters */}
        <div className="flex justify-center">
          <div className="flex bg-slate-900/60 p-1.5 rounded-full border border-slate-700/50 backdrop-blur-sm shadow-xl">
            <button 
              onClick={() => setTimeFilter('this_week')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${timeFilter === 'this_week' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg text-white scale-105' : 'text-slate-400 hover:text-slate-200'}`}
            >
              <Clock className="w-4 h-4" />
              Tuần này
            </button>
            <button 
              onClick={() => setTimeFilter('this_month')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${timeFilter === 'this_month' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg text-white scale-105' : 'text-slate-400 hover:text-slate-200'}`}
            >
              <Calendar className="w-4 h-4" />
              Tháng này
            </button>
            <button 
              onClick={() => setTimeFilter('all_time')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${timeFilter === 'all_time' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg text-white scale-105' : 'text-slate-400 hover:text-slate-200'}`}
            >
              <Globe className="w-4 h-4" />
              Tất cả
            </button>
          </div>
        </div>
      </div>

      {top3.length >= 3 && (
        <div className="flex justify-center items-end gap-2 md:gap-6 mb-16 mt-12 px-2">
          {/* Rank 2 */}
          <motion.div 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="flex flex-col items-center relative w-1/3 max-w-[160px]"
          >
            <div className="absolute -top-12 opacity-80">
               <Crown className="w-8 h-8 text-slate-300 drop-shadow-[0_0_10px_rgba(203,213,225,0.8)]" />
            </div>
            <div className="relative">
              <img src={top3[1].photoURL || `https://ui-avatars.com/api/?name=${top3[1].name}&background=64748b&color=fff`} alt={top3[1].name} className="w-20 h-20 md:w-24 md:h-24 rounded-full border-4 border-slate-300 shadow-[0_0_20px_rgba(203,213,225,0.3)] z-10 relative object-cover" />
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-slate-300 text-slate-900 font-black w-8 h-8 rounded-full flex items-center justify-center border-2 border-slate-900 z-20">2</div>
            </div>
            <div className="mt-6 text-center">
              <h3 className="font-bold text-slate-100 line-clamp-1">{formatName(top3[1].name)}</h3>
              <p className="text-teal-400 font-mono font-bold">{top3[1].displayXp} KN</p>
            </div>
            <div className="w-full h-32 md:h-40 bg-gradient-to-t from-slate-400/20 to-slate-400/5 mt-4 rounded-t-lg border-t-2 border-slate-400/30 backdrop-blur-sm" />
          </motion.div>

          {/* Rank 1 */}
          <motion.div 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1, type: "spring" }}
            className="flex flex-col items-center relative w-1/3 max-w-[180px] z-10"
          >
            <div className="absolute -top-16 opacity-100 animate-pulse">
               <Crown className="w-12 h-12 text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,1)]" />
            </div>
            <div className="relative">
              <img src={top3[0].photoURL || `https://ui-avatars.com/api/?name=${top3[0].name}&background=eab308&color=fff`} alt={top3[0].name} className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-yellow-400 shadow-[0_0_30px_rgba(250,204,21,0.5)] z-10 relative object-cover" />
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-yellow-400 text-yellow-900 font-black w-10 h-10 rounded-full flex items-center justify-center border-2 border-slate-900 z-20 text-xl shadow-lg">1</div>
            </div>
            <div className="mt-8 text-center">
              <h3 className="font-bold text-yellow-400 text-lg line-clamp-1">{formatName(top3[0].name)}</h3>
              <p className="text-teal-300 font-mono font-bold text-lg">{top3[0].displayXp} KN</p>
            </div>
            <div className="w-full h-40 md:h-52 bg-gradient-to-t from-yellow-500/30 to-yellow-500/5 mt-4 rounded-t-xl border-t-2 border-yellow-400/50 backdrop-blur-md shadow-[0_-10px_30px_rgba(250,204,21,0.15)] flex justify-center">
              <Flame className="text-yellow-500/20 w-16 h-16 mt-4" />
            </div>
          </motion.div>

          {/* Rank 3 */}
          <motion.div 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, type: "spring" }}
            className="flex flex-col items-center relative w-1/3 max-w-[160px]"
          >
            <div className="absolute -top-10 opacity-80">
               <Crown className="w-8 h-8 text-amber-600 drop-shadow-[0_0_10px_rgba(217,119,6,0.8)]" />
            </div>
            <div className="relative">
              <img src={top3[2].photoURL || `https://ui-avatars.com/api/?name=${top3[2].name}&background=d97706&color=fff`} alt={top3[2].name} className="w-20 h-20 md:w-24 md:h-24 rounded-full border-4 border-amber-600 shadow-[0_0_20px_rgba(217,119,6,0.3)] z-10 relative object-cover" />
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-amber-600 text-amber-50 font-black w-8 h-8 rounded-full flex items-center justify-center border-2 border-slate-900 z-20">3</div>
            </div>
            <div className="mt-6 text-center">
              <h3 className="font-bold text-slate-100 line-clamp-1">{formatName(top3[2].name)}</h3>
              <p className="text-teal-400 font-mono font-bold">{top3[2].displayXp} KN</p>
            </div>
            <div className="w-full h-24 md:h-32 bg-gradient-to-t from-amber-600/20 to-amber-600/5 mt-4 rounded-t-lg border-t-2 border-amber-600/30 backdrop-blur-sm" />
          </motion.div>
        </div>
      )}
      
      <div className="glass p-4 md:p-8 rounded-3xl relative overflow-hidden">
        {/* Background ambient glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -z-10"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-500/5 rounded-full blur-3xl -z-10"></div>

        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {rest.map((leader, index) => {
              const actualRank = index + 4;
              const isCurrentUser = leader.id === currentUser?.id;
              
              return (
                <motion.div 
                  layout
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  key={leader.id} 
                  className={`flex items-center justify-between p-4 rounded-2xl transition-colors ${isCurrentUser ? 'bg-indigo-500/20 border border-indigo-400/50 shadow-[0_0_15px_rgba(99,102,241,0.2)]' : 'bg-white/5 border border-white/5 hover:bg-white/10'}`}
                >
                  <div className="flex items-center gap-4">
                    <span className={`w-8 text-center font-bold ${isCurrentUser ? 'text-indigo-300' : 'text-slate-500'}`}>#{actualRank}</span>
                    {leader.photoURL ? (
                      <img src={leader.photoURL} alt={formatName(leader.name)} className={`w-12 h-12 rounded-full object-cover ${isCurrentUser ? 'ring-2 ring-indigo-400 shadow-lg' : ''}`} referrerPolicy="no-referrer" />
                    ) : (
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${isCurrentUser ? 'bg-indigo-500 ring-2 ring-indigo-400 shadow-lg' : 'bg-slate-700'}`}>
                        {formatName(leader.name).charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <h3 className={`font-bold text-lg flex items-center gap-2 ${isCurrentUser ? 'text-white' : 'text-slate-50'}`}>
                        {formatName(leader.name)}
                        {isCurrentUser && <span className="text-xs bg-indigo-500 text-white px-2 py-0.5 rounded-full">Bạn</span>}
                      </h3>
                      <p className="text-sm text-slate-400">Cấp độ {leader.level}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className={`font-mono font-bold text-lg ${isCurrentUser ? 'text-white' : 'text-teal-400'}`}>{leader.displayXp} KN</span>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
          {displayLeaders.length === 0 && (
            <div className="text-center text-slate-500 py-10 font-medium">Chưa có dữ liệu cho thời gian này</div>
          )}
        </div>
      </div>

      {/* Sticky Current User Row if not in top 50, or just to pin them */}
      {currentUser && currentUserRank !== null && (
        <div className="fixed bottom-0 left-0 right-0 p-4 z-40 bg-slate-900/80 backdrop-blur-md border-t border-indigo-500/30 flex justify-center pb-20 md:pb-6">
          <div className="max-w-3xl w-full flex items-center justify-between">
            <div className="flex items-center gap-4 text-white font-bold">
              <span className="text-indigo-400 w-8 text-center">#{currentUserRank}</span>
              {currentUser.photoURL ? (
                <img src={currentUser.photoURL} className="w-10 h-10 rounded-full border-2 border-indigo-500" alt="You" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center border-2 border-indigo-400">{formatName(currentUser.name).charAt(0).toUpperCase()}</div>
              )}
              <span>Hạng của bạn</span>
            </div>
            <div className="font-mono text-white text-lg pr-4 font-bold">
              {displayLeaders.find(l => l.id === currentUser.id)?.displayXp || 0} KN
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
