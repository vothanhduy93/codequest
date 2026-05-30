import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { Trophy, Medal } from 'lucide-react';
import { motion } from 'motion/react';
import { formatName } from '../lib/nameUtils';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';

export default function Leaderboard() {
  const [leaders, setLeaders] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const q = query(collection(db, 'users'), orderBy('xp', 'desc'), limit(50));
        const querySnapshot = await getDocs(q);
        const fetchedLeaders: User[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data() as User;
          if (
            data.name !== 'hcmc.duyvo@gmail.com' && 
            !data.name.toLowerCase().includes('hcmc.duyvo') &&
            data.id !== 'XN5n7KzWLuSXSwdCGkoyZUVDb2j1' &&
            !data.name.toLowerCase().includes('duy vo') &&
            !data.name.toLowerCase().includes('duy võ')
          ) {
            fetchedLeaders.push(data);
          }
        });
        setLeaders(fetchedLeaders);
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, 'users');
      } finally {
        setLoading(false);
      }
    };
    
    fetchLeaderboard();
  }, []);

  if (loading) {
    return <div className="text-white text-center py-10">Đang tải bảng xếp hạng...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="glass p-8">
        <div className="flex items-center justify-center gap-3 mb-8">
          <Trophy className="text-yellow-400 w-10 h-10" />
          <h2 className="text-3xl font-bold text-slate-50">Top Cao Thủ</h2>
        </div>
        
        <div className="space-y-4">
          {leaders.map((leader, index) => (
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              key={leader.id} 
              className="flex items-center justify-between bg-white/5 p-4 rounded-xl border border-white/10"
            >
              <div className="flex items-center gap-4">
                {leader.photoURL ? (
                  <img src={leader.photoURL} alt={formatName(leader.name)} className="w-10 h-10 rounded-full shadow-lg" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold shadow-lg">
                    {formatName(leader.name).charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <h3 className="font-bold text-slate-50 text-lg">
                    {formatName(leader.name)}
                  </h3>
                  <p className="text-sm text-slate-400">Cấp độ {leader.level}</p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <span className="font-mono text-teal-400 font-bold">{leader.xp} KN</span>
                {index === 0 && <Medal className="text-yellow-400 w-6 h-6" />}
                {index === 1 && <Medal className="text-slate-300 w-6 h-6" />}
                {index === 2 && <Medal className="text-amber-600 w-6 h-6" />}
                {index > 2 && <span className="w-6 h-6 text-center text-slate-500 font-bold block">#{index + 1}</span>}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
