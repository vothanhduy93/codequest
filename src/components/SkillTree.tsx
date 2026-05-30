import React, { useState } from 'react';
import { CHALLENGES } from '../data';
import { useAppContext } from '../store';
import { Lock, Star, Check, Bot, Loader2, Sparkles } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export default function SkillTree({ onSelectChallenge, onStartAIChallenge }: { onSelectChallenge: (id: string) => void, onStartAIChallenge?: (challenge: any) => void }) {
  const { user } = useAppContext();
  
  const [showAIModal, setShowAIModal] = useState(false);
  const [aiTopic, setAiTopic] = useState('');
  const [aiWeakness, setAiWeakness] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateAIChallenge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiTopic && !aiWeakness) return;
    setIsGenerating(true);
    
    try {
      const response = await fetch('/api/generate-challenge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: aiTopic, weakness: aiWeakness })
      });
      const data = await response.json();
      if (response.ok && data) {
         // Data is the challenge object, give it a random ID
         data.id = `ai_${Date.now()}`;
         data.kind = 'lesson';
         data.difficulty = 'Trung bình';
         if (onStartAIChallenge) onStartAIChallenge(data);
         setShowAIModal(false);
      } else {
        alert(data.error || 'Có lỗi xảy ra');
      }
    } catch (e) {
      console.error(e);
      alert('Không thể kết nối đến máy chủ AI');
    } finally {
      setIsGenerating(false);
    }
  };

  // Categories
  const categories = [
    { id: 'html', title: 'HTML', color: 'text-orange-400', bg: 'bg-orange-500' },
    { id: 'css', title: 'CSS', color: 'text-blue-400', bg: 'bg-blue-500' },
    { id: 'js', title: 'JavaScript', color: 'text-yellow-400', bg: 'bg-yellow-500' }
  ];

  const grouped = {
    html: CHALLENGES.filter(c => c.type === 'html'),
    css: CHALLENGES.filter(c => c.type === 'css'),
    js: CHALLENGES.filter(c => c.type === 'js'),
  };

  // Logic: Must complete all non-generated HTML lessons (or at least some) to unlock CSS/JS?
  // Let's require just "html_6" (the last basic HTML one) to be completed to unlock CSS & JS.
  // Or require ALL html challenges? There are 106 HTML challenges!
  // It's better to require a specific node, e.g., the last manual HTML challenge (html_6).
  const isHtmlPassed = user.completedChallenges.includes('html_6');

  // We could draw them as long lists of nodes
  return (
    <div className="w-full max-w-5xl mx-auto py-8">
      <h2 className="text-3xl font-bold text-center text-slate-50 mb-8 font-sans">Bản Đồ Kỹ Năng</h2>
      
      <div className="relative flex flex-col items-center pb-24">
        {/* Draw path line in background */}
        <div className="absolute top-0 bottom-0 w-2 bg-slate-800 rounded-full left-1/2 -translate-x-1/2 -z-10" />

        {/* HTML Section */}
        <div className="w-full flex flex-col items-center">
          <div className="bg-orange-500/20 text-orange-400 font-bold px-6 py-2 rounded-full mb-6 border border-orange-500/50">Vùng đất HTML</div>
          {grouped.html.slice(0, 15).map((challenge, index) => {
            const isCompleted = user.completedChallenges.includes(challenge.id);
            const globalIndex = grouped.html.findIndex(c => c.id === challenge.id);
            const isLocked = globalIndex > 0 && !user.completedChallenges.includes(grouped.html[globalIndex - 1].id);
            
            // Winding path layout
            const offset = (index % 2 === 0) ? -60 : 60;
            const delay = index * 0.05;

            return (
              <motion.div 
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay }}
                key={challenge.id} 
                className="relative mb-8"
                style={{ left: offset }}
              >
                <button
                  onClick={() => !isLocked && onSelectChallenge(challenge.id)}
                  className={cn(
                    "w-16 h-16 rounded-full flex items-center justify-center border-4 shadow-[0_0_15px_rgba(0,0,0,0.5)] transition-transform hover:scale-110 relative group",
                    isLocked ? "bg-slate-800 border-slate-700 text-slate-500 cursor-not-allowed" :
                    isCompleted ? "bg-orange-500 border-orange-300 text-white" :
                    (globalIndex === 0 || user.completedChallenges.includes(grouped.html[globalIndex - 1].id)) ? "bg-orange-600 border-orange-400 text-white animate-pulse shadow-[0_0_25px_rgba(234,88,12,0.6)]" : "bg-orange-600 border-orange-400 text-white"
                  )}
                >
                  {isLocked ? <Lock size={24} /> : isCompleted ? <Check size={28} /> : <Star size={28} className="fill-current" />}
                  
                  {/* Tooltip Title */}
                  <div className={cn(
                    "absolute top-1/2 -translate-y-1/2 w-48 text-center px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs font-bold pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity whitespace-normal z-20",
                    offset < 0 ? "left-[120%]" : "right-[120%]"
                  )}>
                    {challenge.title}
                  </div>
                </button>
              </motion.div>
            )
          })}
          {grouped.html.length > 15 && (
             <div className="text-slate-500 text-sm italic mb-12">... và {grouped.html.length - 15} bài luyện tập khác</div>
          )}
        </div>

        {/* Branching CSS and JS */}
        <div className="w-full relative mt-8">
           {/* Branching Lines */}
           <div className="absolute -top-12 left-1/4 right-1/4 h-12 border-t-2 border-l-2 border-r-2 border-slate-800 rounded-t-3xl -z-10" />
           <div className="absolute top-0 left-1/4 h-full w-2 bg-slate-800 -translate-x-1/2 -z-10" />
           <div className="absolute top-0 right-1/4 h-full w-2 bg-slate-800 translate-x-1/2 -z-10" />

           <div className="flex justify-between w-full px-12 md:px-32">
              {/* CSS Branch */}
              <div className="flex flex-col items-center w-1/2">
                <div className={cn("px-6 py-2 rounded-full mb-6 border font-bold", isHtmlPassed ? "bg-blue-500/20 text-blue-400 border-blue-500/50" : "bg-slate-800 text-slate-500 border-slate-700")}>
                  Ảo thuật CSS
                </div>
                {grouped.css.slice(0, 15).map((challenge, index) => {
                  const isCompleted = user.completedChallenges.includes(challenge.id);
                  const globalIndex = grouped.css.findIndex(c => c.id === challenge.id);
                  const isLocked = !isHtmlPassed || (globalIndex > 0 && !user.completedChallenges.includes(grouped.css[globalIndex - 1].id));
                  
                  return (
                    <motion.div key={challenge.id} className="relative mb-8" style={{ left: (index % 2 === 0) ? -20 : 20 }}>
                      <button
                        onClick={() => !isLocked && onSelectChallenge(challenge.id)}
                        className={cn(
                          "w-14 h-14 rounded-full flex items-center justify-center border-4 shadow-lg transition-transform hover:scale-110 group",
                          isLocked ? "bg-slate-800 border-slate-700 text-slate-500 cursor-not-allowed" :
                          isCompleted ? "bg-blue-500 border-blue-300 text-white" :
                          (globalIndex === 0 || user.completedChallenges.includes(grouped.css[globalIndex - 1].id)) ? "bg-blue-600 border-blue-400 text-white animate-pulse shadow-[0_0_20px_rgba(59,130,246,0.6)]" : "bg-blue-600 border-blue-400 text-white"
                        )}
                      >
                        {isLocked ? <Lock size={20} /> : isCompleted ? <Check size={24} /> : <Star size={24} className="fill-current" />}
                        
                        <div className={cn(
                          "absolute top-1/2 -translate-y-1/2 w-48 text-center px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs font-bold pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity whitespace-normal z-20",
                          (index % 2 === 0) ? "left-[120%]" : "right-[120%]"
                        )}>
                          {challenge.title}
                        </div>
                      </button>
                    </motion.div>
                  )
                })}
              </div>

              {/* JS Branch */}
              <div className="flex flex-col items-center w-1/2">
                <div className={cn("px-6 py-2 rounded-full mb-6 border font-bold", isHtmlPassed ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/50" : "bg-slate-800 text-slate-500 border-slate-700")}>
                  Ma thuật JS
                </div>
                {grouped.js.slice(0, 15).map((challenge, index) => {
                  const isCompleted = user.completedChallenges.includes(challenge.id);
                  const globalIndex = grouped.js.findIndex(c => c.id === challenge.id);
                  const isLocked = !isHtmlPassed || (globalIndex > 0 && !user.completedChallenges.includes(grouped.js[globalIndex - 1].id));
                  
                  return (
                    <motion.div key={challenge.id} className="relative mb-8" style={{ left: (index % 2 === 0) ? -20 : 20 }}>
                      <button
                        onClick={() => !isLocked && onSelectChallenge(challenge.id)}
                        className={cn(
                          "w-14 h-14 rounded-full flex items-center justify-center border-4 shadow-lg transition-transform hover:scale-110 group",
                          isLocked ? "bg-slate-800 border-slate-700 text-slate-500 cursor-not-allowed" :
                          isCompleted ? "bg-yellow-500 border-yellow-300 text-white" :
                          (globalIndex === 0 || user.completedChallenges.includes(grouped.js[globalIndex - 1].id)) ? "bg-yellow-600 border-yellow-400 text-white animate-pulse shadow-[0_0_20px_rgba(234,179,8,0.6)]" : "bg-yellow-600 border-yellow-400 text-white"
                        )}
                      >
                        {isLocked ? <Lock size={20} /> : isCompleted ? <Check size={24} /> : <Star size={24} className="fill-current" />}
                        
                        <div className={cn(
                          "absolute top-1/2 -translate-y-1/2 w-48 text-center px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs font-bold pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity whitespace-normal z-20",
                          (index % 2 === 0) ? "left-[120%]" : "right-[120%]"
                        )}>
                          {challenge.title}
                        </div>
                      </button>
                    </motion.div>
                  )
                })}
              </div>
           </div>
        </div>
      </div>
      
      {/* AI Floating Button */}
      <div className="fixed bottom-8 right-8 z-50">
        <button 
          onClick={() => setShowAIModal(true)}
          className="bg-indigo-500/80 hover:bg-indigo-500 text-white p-4 rounded-2xl shadow-[0_4px_20px_rgba(99,102,241,0.5)] border border-indigo-400/50 backdrop-blur-sm transition-all hover:-translate-y-1 group flex items-center gap-3"
        >
          <Bot size={28} className="group-hover:rotate-12 transition-transform" />
          <div className="text-left hidden md:block">
            <div className="text-sm font-bold leading-tight">AI Sinh Đề Bài</div>
            <div className="text-xs text-indigo-200">Luyện tập vô hạn</div>
          </div>
        </button>
      </div>

      {/* AI Modal */}
      <AnimatePresence>
        {showAIModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" 
              onClick={() => !isGenerating && setShowAIModal(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.9, y: 20 }} 
              className="relative w-full max-w-lg glass rounded-3xl border border-white/10 flex flex-col overflow-hidden shadow-2xl z-10"
            >
              <div className="p-6 sm:p-8 bg-gradient-to-br from-indigo-500/10 to-purple-500/10">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 bg-indigo-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
                    <Sparkles size={28} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">AI Sinh Đề Bài</h2>
                    <p className="text-indigo-200 text-sm">Luyện tập điểm yếu hoặc chủ đề bất kỳ</p>
                  </div>
                </div>

                <form onSubmit={handleGenerateAIChallenge} className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-300 mb-2">Chủ đề bạn muốn luyện tập:</label>
                    <input 
                      type="text" 
                      value={aiTopic}
                      onChange={(e) => { setAiTopic(e.target.value); setAiWeakness(''); }}
                      placeholder="Ví dụ: Flexbox căn giữa, Tạo Form Login..."
                      className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50"
                      disabled={isGenerating || !!aiWeakness}
                    />
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex-1 h-px bg-white/10"></div>
                    <div className="text-slate-500 text-sm font-medium">HOẶC</div>
                    <div className="flex-1 h-px bg-white/10"></div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-300 mb-2">Điểm yếu của bạn là gì?</label>
                    <input 
                      type="text" 
                      value={aiWeakness}
                      onChange={(e) => { setAiWeakness(e.target.value); setAiTopic(''); }}
                      placeholder="Ví dụ: Tôi hay nhầm justify-content và align-items..."
                      className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50"
                      disabled={isGenerating || !!aiTopic}
                    />
                  </div>
                  
                  <button 
                    type="submit"
                    disabled={isGenerating || (!aiTopic && !aiWeakness)}
                    className="w-full py-4 bg-indigo-500 hover:bg-indigo-600 disabled:bg-indigo-500/50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition flex items-center justify-center gap-2 text-lg shadow-[0_0_20px_rgba(99,102,241,0.3)]"
                  >
                    {isGenerating ? (
                      <><Loader2 className="animate-spin" size={24} /> Đang tạo bằng Gemini...</>
                    ) : (
                      'Tạo Đề Bài Ngay'
                    )}
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
