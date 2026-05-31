import React, { useState } from 'react';
import { CHALLENGES } from '../data';
import { useAppContext } from '../store';
import { Lock, Star, Check, Bot, Loader2, Sparkles, ChevronRight } from 'lucide-react';
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
    setIsGenerating(true);
    
    try {
      const response = await fetch('/api/generate-challenge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        alert(`Lỗi máy chủ (Vercel): Không thể nhận JSON. Nội dung: ${text.slice(0, 100)}...`);
        setIsGenerating(false);
        return;
      }

      if (response.ok && data && !data.error) {
         data.id = `inf_${Date.now()}`;
         data.kind = 'lesson';
         data.difficulty = 'Trung bình';
         if (onStartAIChallenge) onStartAIChallenge(data);
         setShowAIModal(false);
      } else {
        alert(data.error || 'Có lỗi xảy ra');
      }
    } catch (e: any) {
      console.error(e);
      alert(`Không thể kết nối đến máy chủ: ${e?.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const grouped = {
    html: CHALLENGES.filter(c => c.type === 'html'),
    css: CHALLENGES.filter(c => c.type === 'css'),
    js: CHALLENGES.filter(c => c.type === 'js'),
  };

  const isHtmlPassed = user.completedChallenges.includes('html_40');
  const isCssPassed = user.completedChallenges.includes('css_55');

  const renderList = (categoryKey: 'html' | 'css' | 'js', title: string, colorClass: string, isUnlocked: boolean) => {
    const challenges = grouped[categoryKey];
    
    return (
      <div className="mb-12">
        <h3 className={cn("text-xl font-bold mb-4 flex items-center gap-2", colorClass)}>
          {title}
          {!isUnlocked && <Lock size={18} className="text-slate-500" />}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 border-l-2 border-slate-800/50 pl-4 py-2">
          {challenges.map((challenge, index) => {
            const isCompleted = user.completedChallenges.includes(challenge.id);
            const isLocked = !isUnlocked || (index > 0 && !user.completedChallenges.includes(challenges[index - 1].id));
            const isCurrent = !isLocked && !isCompleted && (index === 0 || user.completedChallenges.includes(challenges[index - 1].id));

            return (
              <button
                key={challenge.id}
                onClick={() => !isLocked && onSelectChallenge(challenge.id)}
                disabled={isLocked}
                className={cn(
                  "flex items-center text-left py-3 px-4 rounded-xl border transition-all relative overflow-hidden group",
                  isLocked ? "bg-slate-900 border-slate-800 text-slate-500 cursor-not-allowed opacity-60" :
                  isCompleted ? "bg-slate-800/50 border-slate-700 text-slate-300 hover:bg-slate-800 hover:border-slate-500" :
                  isCurrent ? "bg-slate-800 border-slate-500 text-white shadow-lg relative hover:border-slate-400 z-10" : "bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500"
                )}
              >
                {isCurrent && <div className={cn("absolute inset-0 opacity-10 pointer-events-none animate-pulse", colorClass.replace('text-', 'bg-'))} />}
                
                <div className={cn(
                  "w-10 h-10 shrink-0 rounded-full flex items-center justify-center mr-4",
                  isLocked ? "bg-slate-800 text-slate-600" :
                  isCompleted ? cn("text-white", colorClass.replace('text-', 'bg-')) :
                  isCurrent ? cn("text-white shadow-lg", colorClass.replace('text-', 'bg-'), colorClass.replace('text-', 'shadow-').replace('400', '500/50')) :
                  "bg-slate-800 text-slate-400"
                )}>
                  {isLocked ? <Lock size={16} /> : isCompleted ? <Check size={18} /> : <Star size={18} className={cn("fill-current", isCurrent ? "" : "opacity-30")} />}
                </div>
                
                <div className="flex-1 min-w-0 pr-4">
                  <div className={cn("text-xs font-bold uppercase tracking-wider mb-1 opacity-70", isCurrent ? colorClass : "")}>
                    Bài {index + 1}
                  </div>
                  <div className={cn("font-medium truncate transition-colors", isCurrent ? "text-white" : "", isLocked ? "text-slate-500" : "")}>
                    {challenge.title}
                  </div>
                </div>
                
                {!isLocked && (
                  <ChevronRight size={18} className={cn("opacity-0 transition-all -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 text-slate-400", isCurrent ? "opacity-100 translate-x-0" : "")} />
                )}
              </button>
            )
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-5xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-50 font-sans">Lộ Trình Học Tập</h2>
        <p className="text-slate-400 mt-2 text-sm max-w-xl">Hoàn thành các bài tập theo thứ tự để mở khóa các kỹ năng mới. Vượt qua thử thách HTML để mở khóa CSS, và hoàn thành CSS để vươn tới Javascript.</p>
      </div>
      
      <div className="flex flex-col pb-24">
        {renderList('html', 'Vùng đất HTML', 'text-orange-400', true)}
        {renderList('css', 'Ảo thuật CSS', 'text-blue-400', isHtmlPassed)}
        {renderList('js', 'Ma thuật JS', 'text-yellow-400', isCssPassed)}
      </div>
      
      {/* Infinite Lesson Floating Button */}
      <div className="fixed bottom-8 right-8 z-50">
        <button 
          onClick={() => setShowAIModal(true)}
          className="bg-indigo-500/80 hover:bg-indigo-500 text-white p-4 rounded-2xl shadow-[0_4px_20px_rgba(99,102,241,0.5)] border border-indigo-400/50 backdrop-blur-sm transition-all hover:-translate-y-1 group flex items-center gap-3"
        >
          <Sparkles size={28} className="group-hover:rotate-12 transition-transform" />
          <div className="text-left hidden md:block">
            <div className="text-sm font-bold leading-tight">Bài Học Tự Động</div>
            <div className="text-xs text-indigo-200">Không giới hạn</div>
          </div>
        </button>
      </div>

      {/* Infinite Modal */}
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
                    <h2 className="text-2xl font-bold text-white">Thử Thách Vô Hạn</h2>
                    <p className="text-indigo-200 text-sm">Tạo bài tập tự động, không giới hạn</p>
                  </div>
                </div>

                <form onSubmit={handleGenerateAIChallenge} className="space-y-6">
                  <div className="bg-white/5 p-4 rounded-xl border border-white/10 text-slate-300 text-sm">
                    Luyện tập các thử thách cấu hình CSS liên tục hàng ngày để lên level. Hệ thống sẽ sinh bài tập ngẫu nhiên dựa theo thuật toán nội bộ thủ tục.
                  </div>
                  
                  <button 
                    type="submit"
                    disabled={isGenerating}
                    className="w-full py-4 bg-indigo-500 hover:bg-indigo-600 disabled:bg-indigo-500/50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition flex items-center justify-center gap-2 text-lg shadow-[0_0_20px_rgba(99,102,241,0.3)]"
                  >
                    {isGenerating ? (
                      <><Loader2 className="animate-spin" size={24} /> Đang tạo bài học...</>
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
