import React, { useState } from 'react';
import { useAppContext } from '../store';
import { motion, AnimatePresence } from 'motion/react';
import { Bookmark, Code2, Copy, Check, Trash2, X } from 'lucide-react';
import Editor from '@monaco-editor/react';

export default function NotebookTab() {
  const { user, deleteSnippet } = useAppContext();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [viewingSnippet, setViewingSnippet] = useState<any>(null);

  const snippets = user?.snippets || [];

  const handleCopy = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getLanguageColor = (lang: string) => {
    switch(lang) {
      case 'html': return 'text-orange-400 bg-orange-400/10 border-orange-400/20';
      case 'css': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      case 'javascript': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      default: return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
          <Bookmark className="text-indigo-400" size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-50 font-display">Sổ Tay Của Tôi</h1>
          <p className="text-slate-400 text-sm">Lưu trữ các cấu trúc hay, component tái sử dụng được.</p>
        </div>
      </div>

      {snippets.length === 0 ? (
        <div className="glass p-12 text-center flex flex-col items-center justify-center rounded-2xl border border-white/5">
          <Bookmark className="text-slate-600 mb-4" size={48} />
          <h2 className="text-xl font-bold text-slate-300 mb-2">Chưa có ghi chú nào</h2>
          <p className="text-slate-500 max-w-md">Trong quá trình học hoặc làm bài, hãy bấm "Lưu vào sổ tay" để lưu lại những cấu trúc code hay nhé!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {snippets.map((snippet) => (
              <motion.div
                key={snippet.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="glass p-5 rounded-2xl border border-white/10 hover:border-indigo-500/30 transition-all flex flex-col group cursor-pointer"
                onClick={() => setViewingSnippet(snippet)}
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="font-bold text-slate-200 line-clamp-2 pr-4">{snippet.title}</h3>
                  <div className={`px-2 py-1 rounded text-xs font-bold border uppercase tracking-wider ${getLanguageColor(snippet.language)}`}>
                    {snippet.language === 'javascript' ? 'JS' : snippet.language}
                  </div>
                </div>

                <div className="bg-slate-900 rounded-lg p-3 text-xs font-mono text-slate-400 line-clamp-4 mb-4 border border-white/5 group-hover:border-indigo-500/20 transition-colors">
                  {snippet.code}
                </div>

                <div className="mt-auto flex items-center justify-between">
                  <div className="text-xs text-slate-500">
                    {new Date(snippet.createdAt).toLocaleDateString('vi-VN')}
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleCopy(snippet.id, snippet.code); }}
                      className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-slate-300 transition-colors"
                      title="Copy"
                    >
                      {copiedId === snippet.id ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); deleteSnippet(snippet.id); }}
                      className="p-2 bg-white/5 hover:bg-red-500/20 hover:text-red-400 rounded-lg text-slate-300 transition-colors"
                      title="Xoá"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* View Modal */}
      <AnimatePresence>
        {viewingSnippet && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 p-12">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
              onClick={() => setViewingSnippet(null)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.9, y: 20 }} 
              className="relative w-full max-w-4xl max-h-full glass rounded-3xl border border-white/10 flex flex-col overflow-hidden shadow-2xl z-10"
            >
              <div className="p-4 sm:p-6 border-b border-white/10 flex items-center justify-between bg-slate-900/50">
                <div className="flex items-center gap-4">
                  <div className={`px-2 py-1 rounded text-xs font-bold border uppercase tracking-wider ${getLanguageColor(viewingSnippet.language)}`}>
                    {viewingSnippet.language === 'javascript' ? 'JS' : viewingSnippet.language}
                  </div>
                  <h2 className="text-xl font-bold text-slate-100">{viewingSnippet.title}</h2>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => handleCopy(viewingSnippet.id, viewingSnippet.code)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-sm font-medium transition-colors"
                  >
                    {copiedId === viewingSnippet.id ? <Check size={16} className="text-green-400" /> : <Copy size={16} />} 
                    <span className="hidden sm:inline">{copiedId === viewingSnippet.id ? 'Đã copy' : 'Copy'}</span>
                  </button>
                  <button 
                    onClick={() => setViewingSnippet(null)}
                    className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-slate-300 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>
              
              <div className="flex-1 min-h-[400px] bg-slate-950">
                <Editor 
                  height="100%" 
                  language={viewingSnippet.language} 
                  theme="vs-dark" 
                  value={viewingSnippet.code} 
                  options={{ readOnly: true, minimap: { enabled: false }, fontSize: 14, padding: { top: 16, bottom: 16 } }} 
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
