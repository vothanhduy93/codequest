import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppContext } from '../store';
import { Trophy, Star, ChevronUp } from 'lucide-react';
import confetti from 'canvas-confetti';

const playLevelUpSound = () => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    
    const playTone = (freq: number, startTime: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + startTime);
      
      gain.gain.setValueAtTime(0, ctx.currentTime + startTime);
      gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + startTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + startTime + duration);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(ctx.currentTime + startTime);
      osc.stop(ctx.currentTime + startTime + duration);
    };

    // Fanfare: C4, E4, G4, C5
    playTone(261.63, 0, 0.2); // C4
    playTone(329.63, 0.15, 0.2); // E4
    playTone(392.00, 0.3, 0.2); // G4
    playTone(523.25, 0.45, 0.6); // C5
  } catch (e) {
    console.error("Audio playback failed", e);
  }
};

export default function LevelUpModal() {
  const { levelUpData, clearLevelUp } = useAppContext();

  useEffect(() => {
    if (levelUpData !== null) {
      playLevelUpSound();
      
      const duration = 3000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 5,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#facc15', '#fbbf24', '#f59e0b']
        });
        confetti({
          particleCount: 5,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#facc15', '#fbbf24', '#f59e0b']
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();
      
      // Optional: Auto dismiss could go here, but manual clear feels more rewarding
      // const timer = setTimeout(() => { ... }, 5000);
    }
  }, [levelUpData]);

  if (levelUpData === null) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
          onClick={clearLevelUp}
        />

        {/* Modal */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0, y: 50, rotate: 0 }}
          animate={{ 
            scale: 1, 
            opacity: 1, 
            y: 0,
            rotate: [0, -3, 3, -3, 3, 0]
          }}
          exit={{ scale: 0.8, opacity: 0, y: 20 }}
          transition={{ 
            type: "spring", bounce: 0.5, duration: 0.8,
            rotate: { delay: 0.1, duration: 0.4, ease: "easeInOut" }
          }}
          className="relative w-full max-w-md"
        >
          {/* Confetti Glow Behind */}
          <div className="absolute -inset-10 bg-gradient-to-r from-yellow-500/30 via-orange-500/30 to-rose-500/30 blur-3xl rounded-full opacity-50 animate-pulse pointer-events-none"></div>

          <div className="bg-slate-900 border-2 border-yellow-500/50 rounded-3xl p-8 text-center shadow-2xl relative overflow-hidden">
            {/* Glossy overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none"></div>

            {/* Glowing Icon Container */}
            <div className="relative mx-auto w-32 h-32 mb-6">
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 rounded-full border-4 border-dashed border-yellow-500/30"
              />
              <div className="absolute inset-2 bg-gradient-to-br from-yellow-400 to-amber-600 rounded-full shadow-lg shadow-yellow-500/50 flex items-center justify-center border-4 border-yellow-200">
                <ChevronUp className="w-16 h-16 text-white drop-shadow-md" strokeWidth={3} />
              </div>
              <Star className="absolute -top-4 -right-4 text-yellow-300 w-10 h-10 animate-bounce delay-100" />
              <Star className="absolute bottom-0 -left-6 text-yellow-500 w-8 h-8 animate-bounce delay-300" />
            </div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-yellow-400 to-amber-500 mb-2 uppercase tracking-tight">
                Level Up!
              </h2>
              <p className="text-slate-300 text-lg mb-8">
                Chúc mừng bạn đã đạt <strong className="text-yellow-400">Cấp độ {levelUpData}</strong>
              </p>
            </motion.div>

            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={clearLevelUp}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-600 font-bold text-white shadow-lg shadow-yellow-500/25 hover:shadow-yellow-500/40 border border-yellow-400/50 transition-all flex items-center justify-center gap-2 text-lg"
            >
              Tiếp Tục Chinh Phục <Trophy className="w-5 h-5" />
            </motion.button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
