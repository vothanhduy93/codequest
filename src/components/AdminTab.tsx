import React, { useState, useMemo } from 'react';
import { useAppContext } from '../store';
import { Challenge } from '../types';
import { Search, Save, List, Edit } from 'lucide-react';
import { cn } from '../lib/utils';

export default function AdminTab() {
  const { challenges, updateChallenge } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  
  // Local state for editing
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [instructions, setInstructions] = useState('');
  const [hint, setHint] = useState('');
  const [solution, setSolution] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const filteredChallenges = useMemo(() => {
    return challenges.filter(c => 
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      c.id.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [challenges, searchTerm]);

  const selectChallenge = (c: Challenge) => {
    setSelectedChallenge(c);
    setTitle(c.title || '');
    setDescription(c.description || '');
    setInstructions(c.instructions || '');
    setHint(c.hint || '');
    setSolution(c.solution || '');
  };

  const saveChallenge = async () => {
    if (!selectedChallenge) return;
    setIsSaving(true);
    try {
      await updateChallenge(selectedChallenge.id, {
        title,
        description,
        instructions,
        hint,
        solution
      });
      // Optionally show a toast here
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex gap-6 h-[calc(100vh-8rem)]">
      {/* Sidebar: List of challenges */}
      <div className="w-1/3 glass rounded-2xl flex flex-col overflow-hidden">
        <div className="p-4 border-b border-white/5 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <List className="w-5 h-5 text-teal-400" />
            <h2 className="text-xl font-bold">Bài học ({filteredChallenges.length})</h2>
          </div>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Tìm kiếm theo ID hoặc tiêu đề..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900/50 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-teal-400/50 text-slate-200 placeholder:text-slate-500"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {filteredChallenges.map(c => {
             const isSelected = selectedChallenge?.id === c.id;
             return (
               <button
                 key={c.id}
                 onClick={() => selectChallenge(c)}
                 className={cn(
                   "w-full text-left p-3 rounded-lg mb-1 transition-colors flex flex-col gap-1",
                   isSelected ? "bg-teal-500/20 border border-teal-500/30" : "hover:bg-white/5 border border-transparent"
                 )}
               >
                 <span className="text-xs text-slate-400 font-mono">{c.id}</span>
                 <span className={cn("font-medium", isSelected ? "text-teal-300" : "text-slate-300")}>{c.title}</span>
               </button>
             );
          })}
        </div>
      </div>

      {/* Main editor */}
      <div className="flex-1 glass rounded-2xl p-6 flex flex-col overflow-hidden">
        {selectedChallenge ? (
          <>
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <Edit className="w-5 h-5 text-teal-400" />
                <h2 className="text-xl font-bold">Chỉnh sửa nội dung</h2>
              </div>
              <button 
                onClick={saveChallenge} 
                disabled={isSaving}
                className="btn-primary py-2 flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar flex flex-col gap-6">
              
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-slate-300">Tiêu đề (Title)</label>
                <input 
                  type="text" 
                  value={title} 
                  onChange={e => setTitle(e.target.value)}
                  className="bg-slate-900/50 border border-white/10 rounded-lg p-3 focus:outline-none focus:border-teal-400/50 font-medium"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-slate-300">Nội dung (Description - Markdown)</label>
                <textarea 
                  value={description} 
                  onChange={e => setDescription(e.target.value)}
                  rows={10}
                  className="bg-slate-900/50 border border-white/10 rounded-lg p-3 focus:outline-none focus:border-teal-400/50 font-mono text-sm leading-relaxed"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-slate-300">Hướng dẫn (Instructions - Markdown)</label>
                <textarea 
                  value={instructions} 
                  onChange={e => setInstructions(e.target.value)}
                  rows={4}
                  className="bg-slate-900/50 border border-white/10 rounded-lg p-3 focus:outline-none focus:border-teal-400/50 font-mono text-sm leading-relaxed"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-slate-300">Gợi ý (Hint)</label>
                <input 
                  type="text"
                  value={hint} 
                  onChange={e => setHint(e.target.value)}
                  className="bg-slate-900/50 border border-white/10 rounded-lg p-3 focus:outline-none focus:border-teal-400/50 text-sm"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-slate-300">Đáp án (Solution - Code)</label>
                <textarea 
                  value={solution} 
                  onChange={e => setSolution(e.target.value)}
                  rows={8}
                  className="bg-slate-900/50 border border-white/10 rounded-lg p-3 focus:outline-none focus:border-teal-400/50 font-mono text-sm leading-relaxed"
                />
              </div>

            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-4">
            <Edit className="w-12 h-12 opacity-20" />
            <p>Chọn một bài học từ danh sách để bắt đầu chỉnh sửa</p>
          </div>
        )}
      </div>
    </div>
  );
}
