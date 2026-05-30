import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppContext } from '../store';
import { ShieldAlert, Trophy, Layout, Palette, Code, Award, X, Sparkles, Star } from 'lucide-react';
import confetti from 'canvas-confetti';

const getBadgeIcon = (iconName: string) => {
  switch (iconName) {
    case 'Trophy': return <Trophy className="w-8 h-8" />;
    case 'Layout': return <Layout className="w-8 h-8" />;
    case 'Palette': return <Palette className="w-8 h-8" />;
    case 'Code': return <Code className="w-8 h-8" />;
    case 'ShieldAlert': return <ShieldAlert className="w-8 h-8" />;
    default: return <Award className="w-8 h-8" />;
  }
};

const getBadgeColors = (id: string) => {
  if (id === 'first_blood') return 'from-yellow-300 via-yellow-400 to-yellow-600 shadow-yellow-500/50 text-yellow-900 border-yellow-200';
  if (id === 'html_master') return 'from-rose-400 via-red-500 to-rose-700 shadow-red-500/50 text-white border-red-300';
  if (id === 'css_master') return 'from-cyan-400 via-blue-500 to-indigo-600 shadow-blue-500/50 text-white border-cyan-300';
  if (id === 'js_ninja') return 'from-yellow-300 via-amber-400 to-orange-500 shadow-amber-500/50 text-slate-900 border-amber-200';
  return 'from-slate-300 via-slate-400 to-slate-500 shadow-slate-500/50 text-white border-slate-200';
};

const getBadgeRarity = (id: string) => {
  if (id === 'first_blood') return { label: 'Common', iconColor: 'text-slate-400', border: 'border-slate-600', glow: 'from-slate-500/10' };
  if (id === 'html_master' || id === 'css_master') return { label: 'Rare', iconColor: 'text-blue-400', border: 'border-blue-500/60', glow: 'from-blue-500/20' };
  if (id === 'js_ninja') return { label: 'Epic', iconColor: 'text-purple-400', border: 'border-purple-500/60', glow: 'from-purple-500/20' };
  return { label: 'Legendary', iconColor: 'text-yellow-400', border: 'border-yellow-500/60', glow: 'from-yellow-500/30' };
};

function ToastItem({ badge, onDismiss }: { badge: any, onDismiss: (id: string) => void }) {
  const [isHovered, setIsHovered] = useState(false);
  const rarity = getBadgeRarity(badge.id);

  useEffect(() => {
    confetti({
      particleCount: 50,
      spread: 70,
      origin: { x: 0.85, y: 0.9 },
      colors: ['#facc15', '#3b82f6', '#eab308', '#ec4899', '#8b5cf6'],
      ticks: 150,
      gravity: 0.8,
      scalar: 0.8,
      zIndex: 1000
    });
  }, []);

  useEffect(() => {
    if (isHovered) return;
    const timer = setTimeout(() => {
      onDismiss(badge.id);
    }, 5000);
    return () => clearTimeout(timer);
  }, [badge, onDismiss, isHovered]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 100, scale: 0.9 }}
      animate={{ 
        opacity: 1, 
        x: 0, 
        scale: 1,
        rotate: [0, 0, -3, 3, -3, 3, 0]
      }}
      exit={{ opacity: 0, scale: 0.9, x: 100, transition: { duration: 0.2 } }}
      transition={{ 
        type: "spring", stiffness: 400, damping: 25,
        rotate: { delay: 0.2, duration: 0.5, ease: "easeInOut" }
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`bg-slate-900 border ${rarity.border} shadow-2xl rounded-2xl p-4 pr-10 relative overflow-hidden flex items-center gap-4 min-w-[320px]`}
    >
      {/* Background effects */}
      <div className={`absolute inset-0 bg-gradient-to-r ${rarity.glow} to-transparent pointer-events-none`}></div>
      <div className="absolute inset-0 border border-white/5 rounded-2xl pointer-events-none"></div>

      <button
        onClick={() => onDismiss(badge.id)}
        className="absolute top-2 right-2 text-slate-500 hover:text-slate-300 transition-colors z-20"
      >
        <X size={16} />
      </button>

      {/* Badge Icon */}
      <div className={`relative w-16 h-16 shrink-0 flex items-center justify-center rounded-full bg-gradient-to-br ${getBadgeColors(badge.id)} border-4 shadow-lg shrink-0`}>
        {/* Subtle inner ring */}
        <div className="absolute inset-1 rounded-full border-2 border-white/30 mix-blend-overlay pointer-events-none"></div>
        {/* Glossy reflection */}
        <div className="absolute inset-x-2 top-2 h-1/2 bg-gradient-to-b from-white/60 to-transparent rounded-t-full z-0 opacity-70 pointer-events-none"></div>
        
        <div className="relative z-10 drop-shadow-md">
           {getBadgeIcon(badge.icon)}
        </div>
        <Sparkles className="absolute -top-2 -right-1 text-white/50 w-4 h-4 animate-pulse duration-700 z-20" />
      </div>

      {/* Content */}
      <div className="flex-1 relative z-10">
        <div className="flex items-center gap-2 mb-1">
          <Star className={`w-3 h-3 ${rarity.iconColor} fill-current`} />
          <span className={`text-[10px] uppercase font-bold ${rarity.iconColor} tracking-wider`}>{rarity.label}</span>
        </div>
        <h4 className="font-bold text-slate-50">{badge.name}</h4>
        <p className="text-xs text-slate-400 mt-1">{badge.description}</p>
      </div>
    </motion.div>
  );
}

export default function BadgeToast() {
  const { newEarnedBadges, clearNewEarnedBadge } = useAppContext();

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-3">
      <AnimatePresence mode="popLayout">
        {newEarnedBadges.map((badge) => (
          <ToastItem key={badge.id} badge={badge} onDismiss={clearNewEarnedBadge} />
        ))}
      </AnimatePresence>
    </div>
  );
}

