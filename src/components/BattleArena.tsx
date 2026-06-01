import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { updateDoc, doc } from 'firebase/firestore';
import { useAppContext } from '../store';
import { playSound } from '../lib/audio';
import Editor from '@monaco-editor/react';
import { Play, CheckCircle, XCircle, Swords, ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { formatName } from '../lib/nameUtils';
import confetti from 'canvas-confetti';

export default function BattleArena({ matchData, onLeave }: { matchData: any, onLeave: () => void }) {
  const { user, challenges, resolvePvP } = useAppContext();
  
  const [htmlCode, setHtmlCode] = useState('');
  const [cssCode, setCssCode] = useState('');
  const [jsCode, setJsCode] = useState('');
  const [debouncedCode, setDebouncedCode] = useState<string>('');
  const [activeEditorTab, setActiveEditorTab] = useState<'html' | 'css' | 'js'>('html');
  const [pvpResult, setPvpResult] = useState<'win' | 'lose' | null>(null);

  const activeChallenge = challenges.find(c => c.id === matchData.challengeId);
  const isPlayer1 = matchData.player1.uid === user?.id;
  const me = isPlayer1 ? matchData.player1 : matchData.player2;
  const opponent = isPlayer1 ? matchData.player2 : matchData.player1;
  const opponentState = isPlayer1 ? matchData.player2State : matchData.player1State;

  // countdown
  const [countdown, setCountdown] = useState(5);
  const isStarted = countdown <= 0;

  useEffect(() => {
    if (!matchData.startedAt) return;
    const updateCountdown = () => {
      const remainingMs = matchData.startedAt - Date.now();
      if (remainingMs <= 0) {
        setCountdown(0);
      } else {
        setCountdown(Math.ceil(remainingMs / 1000));
      }
    };
    updateCountdown();
    const timer = setInterval(updateCountdown, 100);
    return () => clearInterval(timer);
  }, [matchData.startedAt]);

  // Sync to firestore
  useEffect(() => {
    if (matchData.status !== 'playing' || !user) return;
    
    // Quick debounce for syncing state to opponent
    const timer = setTimeout(() => {
      const updatePayload = isPlayer1 ? {
        player1State: { html: htmlCode, css: cssCode, js: jsCode, activeTab: activeEditorTab }
      } : {
        player2State: { html: htmlCode, css: cssCode, js: jsCode, activeTab: activeEditorTab }
      };
      updateDoc(doc(db, 'matches', matchData.id), updatePayload).catch(console.error);
    }, 500);

    return () => clearTimeout(timer);
  }, [htmlCode, cssCode, jsCode, activeEditorTab, matchData.id, matchData.status, user, isPlayer1]);

  useEffect(() => {
    if (matchData.status === 'finished' && matchData.winner) {
      if (matchData.winner === user?.id) {
        if (!pvpResult) {
           setPvpResult('win');
           resolvePvP(true);
           playSound('success');
           
           // Confetti effect
           const duration = 3000;
           const end = Date.now() + duration;

           const frame = () => {
             confetti({
               particleCount: 5,
               angle: 60,
               spread: 55,
               origin: { x: 0 },
               colors: ['#facc15', '#3b82f6', '#ec4899', '#10b981']
             });
             confetti({
               particleCount: 5,
               angle: 120,
               spread: 55,
               origin: { x: 1 },
               colors: ['#facc15', '#3b82f6', '#ec4899', '#10b981']
             });

             if (Date.now() < end) {
               requestAnimationFrame(frame);
             }
           };
           frame();
        }
      } else {
        if (!pvpResult) {
           setPvpResult('lose');
           resolvePvP(false);
        }
      }
    }
  }, [matchData.status, matchData.winner, user, pvpResult, resolvePvP]);

  // Set default code
  useEffect(() => {
    if (activeChallenge) {
      const fullCode = activeChallenge.defaultCode || '';
      const matchStyle = fullCode.match(/<style>\n?([\s\S]*?)\n?<\/style>/i);
      const css = matchStyle ? matchStyle[1] : '';
      const matchScript = fullCode.match(/<script>\n?([\s\S]*?)\n?<\/script>/i);
      const js = matchScript ? matchScript[1] : '';
      const html = fullCode.replace(/<style>[\s\S]*?<\/style>/gi, '').replace(/<script>[\s\S]*?<\/script>/gi, '').trim();

      setHtmlCode(html);
      setCssCode(css);
      setJsCode(js);
      setActiveEditorTab(activeChallenge.type as 'html' | 'css' | 'js');
    }
  }, [activeChallenge]);

  useEffect(() => {
    const timer = setTimeout(() => {
      let combined = htmlCode;
      if (cssCode.trim()) combined += `\n<style>\n${cssCode}\n</style>`;
      if (jsCode.trim()) combined += `\n<script>\n${jsCode}\n</script>`;
      setDebouncedCode(combined);
    }, 400);
    return () => clearTimeout(timer);
  }, [htmlCode, cssCode, jsCode]);

  // Validate Code
  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      if (event.data?.type === 'validation_result') {
        if (event.data.success && matchData.status === 'playing') {
          // WE WIN! Update DB immediately
          await updateDoc(doc(db, 'matches', matchData.id), {
            status: 'finished',
            winner: user?.id
          });
        }
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [debouncedCode, matchData.id, matchData.status, user]);

  const handleEditorMount = async (editor: any, monaco: any) => {
    // Auto-format on blur
    editor.onDidBlurEditorText(() => {
      editor.getAction('editor.action.formatDocument')?.run();
    });
  };

  const validateCode = () => {
    playSound('click');
    const iframe = document.getElementById('pvp-preview-frame') as HTMLIFrameElement;
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.postMessage('validate', '*');
    }
  };

  const srcDoc = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>body { font-family: sans-serif; padding: 1rem; color: #333; background: #fff; }</style>
      <script>
        window.onerror = function() { return true; };
        function __validate() {
          try {
            ${activeChallenge?.validationSnippet}
          } catch(e) {
            return false;
          }
        }
        window.addEventListener('message', (event) => {
          if (event.data === 'validate') {
            const result = __validate();
            window.parent.postMessage({ type: 'validation_result', success: result }, '*');
          }
        });
      </script>
    </head>
    <body>${debouncedCode}</body>
    </html>
  `;

  if (!activeChallenge) return null;

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] p-4 relative pt-12">
      <button 
        onClick={onLeave}
        className="absolute top-0 left-4 bg-slate-800 text-white hover:bg-slate-700 px-4 py-1.5 rounded-full text-sm font-bold flex items-center gap-2 z-50 shadow-lg transition-colors border border-slate-600"
      >
        <ArrowLeft size={16} /> Thoát Hàng Chờ
      </button>

      {/* Header: Player vs Player */}
      <div className="glass p-4 rounded-xl flex items-center justify-between mb-4 border-red-500/20">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-teal-400">
            {me?.photoURL ? <img src={me.photoURL} alt="Me" /> : <div className="bg-teal-500 w-full h-full flex items-center justify-center font-bold text-[10px]">{formatName(me?.name)}</div>}
          </div>
          <div>
            <div className="font-bold text-slate-50">{me?.name} (Bạn)</div>
            <div className="text-teal-400 text-sm font-bold">{me?.xp} KN</div>
          </div>
        </div>

        <div className="flex flex-col items-center">
          <Swords size={32} className="text-red-500" />
          <div className="text-xl font-bold text-slate-50">VS</div>
        </div>

        <div className="flex items-center gap-4 text-right">
          <div>
            <div className="font-bold text-slate-50">{opponent?.name || 'Đang tìm...'}</div>
            {opponent && <div className="text-red-400 text-sm font-bold">{opponent.xp} KN</div>}
          </div>
          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-red-400 bg-red-900/50">
            {opponent?.photoURL ? <img src={opponent.photoURL} alt="Opponent" /> : <div className="bg-red-500 w-full h-full flex items-center justify-center font-bold text-[10px]">{formatName(opponent?.name || '?')}</div>}
          </div>
        </div>
      </div>

      {pvpResult && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/90 backdrop-blur-sm">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass p-12 rounded-3xl flex flex-col items-center max-w-md w-full border border-white/10 text-center"
          >
            {pvpResult === 'win' ? (
              <>
                <CheckCircle size={80} className="text-green-500 mb-6" />
                <h2 className="text-4xl font-black text-slate-50 mb-2">CHIẾN THẮNG!</h2>
                <p className="text-slate-300 mb-6">Tốc độ là sức mạnh! Bạn đã đánh bại đối thủ.</p>
                <div className="text-3xl font-bold text-teal-400 mb-8">+50 KN</div>
              </>
            ) : (
              <>
                <XCircle size={80} className="text-red-500 mb-6" />
                <h2 className="text-4xl font-black text-slate-50 mb-2">THẤT BẠI</h2>
                <p className="text-slate-300 mb-6">Đối thủ đã giải xong trước bạn. Hãy cố gắng lần sau!</p>
                <div className="text-3xl font-bold text-red-500 mb-8">-20 KN</div>
              </>
            )}
            <button onClick={onLeave} className="w-full py-4 bg-white/10 hover:bg-white/20 font-bold rounded-xl transition">Tiếp Tục</button>
          </motion.div>
        </div>
      )}

      {/* Editor & Preview Workspace */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Opponent Editor (Read-Only) */}
        <div className="glass rounded-xl overflow-hidden flex flex-col relative border-white/10 opacity-80 pointer-events-none">
          <div className="p-4 bg-slate-800 border-b border-white/5 pb-0 flex gap-2">
            {['html', 'css', 'js'].map(tab => (
              <button
                key={`opp-${tab}`}
                className={cn(
                  "px-4 py-2 font-mono text-sm font-medium border-b-2 transition-colors uppercase",
                  opponentState?.activeTab === tab
                    ? "border-red-400 text-red-400"
                    : "border-transparent text-slate-400 hover:text-slate-200"
                )}
              >
                {tab}
              </button>
            ))}
            <div className="ml-auto text-xs text-red-400 italic flex items-center mb-2">Đang code...</div>
          </div>
          <div className="flex-1 relative">
            <div className={cn("w-full h-full", opponentState?.activeTab !== 'html' && "hidden")}>
              <Editor path="\opp_pvp.html" height="100%" language="html" theme="vs-dark" value={opponentState?.html || ''} options={{ minimap: { enabled: false }, fontSize: 12, readOnly: true }} />
            </div>
            <div className={cn("w-full h-full", opponentState?.activeTab !== 'css' && "hidden")}>
               <Editor path="\opp_pvp.css" height="100%" language="css" theme="vs-dark" value={opponentState?.css || ''} options={{ minimap: { enabled: false }, fontSize: 12, readOnly: true }} />
            </div>
            <div className={cn("w-full h-full", opponentState?.activeTab !== 'js' && "hidden")}>
               <Editor path="\opp_pvp.js" height="100%" language="javascript" theme="vs-dark" value={opponentState?.js || ''} options={{ minimap: { enabled: false }, fontSize: 12, readOnly: true }} />
            </div>
          </div>
        </div>

        {/* My Editor */}
        <div className="glass rounded-xl overflow-hidden flex flex-col relative border-teal-500/30 ring-1 ring-teal-500/20 shadow-[0_0_15px_rgba(20,184,166,0.15)]">
          {!isStarted ? (
            <div className="absolute inset-0 z-40 bg-slate-900/90 flex flex-col items-center justify-center backdrop-blur-sm">
              <h2 className="text-2xl font-bold text-slate-50 mb-4">Chuẩn bị!</h2>
              <div className="text-7xl font-black text-red-500 animate-pulse">{countdown}</div>
            </div>
          ) : null}
          
          <div className="p-4 bg-slate-800 border-b border-white/5 pb-0 flex gap-2">
            {['html', 'css', 'js'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveEditorTab(tab as any)}
                className={cn(
                  "px-4 py-2 font-mono text-sm font-medium border-b-2 transition-colors uppercase",
                  activeEditorTab === tab
                    ? "border-teal-400 text-teal-400"
                    : "border-transparent text-slate-400 hover:text-slate-200"
                )}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex-1 relative">
            <div className={cn("w-full h-full", activeEditorTab !== 'html' && "hidden")}>
              <Editor 
                path="\pvp.html" 
                height="100%" 
                language="html" 
                theme="vs-dark" 
                onChange={(v) => setHtmlCode(v || '')} 
                value={htmlCode} 
                onMount={handleEditorMount} 
                options={{ 
                  minimap: { enabled: false }, 
                  fontSize: 14,
                  quickSuggestions: false,
                  suggestOnTriggerCharacters: false,
                  acceptSuggestionOnEnter: "off",
                  tabCompletion: "off",
                  wordBasedSuggestions: "off",
                  snippetSuggestions: "none",
                  inlineSuggest: { enabled: false },
                  parameterHints: { enabled: false },
                  autoClosingBrackets: "never",
                  autoClosingQuotes: "never"
                }} 
              />
            </div>
            <div className={cn("w-full h-full", activeEditorTab !== 'css' && "hidden")}>
               <Editor 
                path="\pvp.css" 
                height="100%" 
                language="css" 
                theme="vs-dark" 
                onChange={(v) => setCssCode(v || '')} 
                value={cssCode} 
                onMount={handleEditorMount} 
                options={{ 
                  minimap: { enabled: false }, 
                  fontSize: 14,
                  quickSuggestions: false,
                  suggestOnTriggerCharacters: false,
                  acceptSuggestionOnEnter: "off",
                  tabCompletion: "off",
                  wordBasedSuggestions: "off",
                  snippetSuggestions: "none",
                  inlineSuggest: { enabled: false },
                  parameterHints: { enabled: false },
                  autoClosingBrackets: "never",
                  autoClosingQuotes: "never"
                }} 
              />
            </div>
            <div className={cn("w-full h-full", activeEditorTab !== 'js' && "hidden")}>
               <Editor 
                path="\pvp.js" 
                height="100%" 
                language="javascript" 
                theme="vs-dark" 
                onChange={(v) => setJsCode(v || '')} 
                value={jsCode} 
                onMount={handleEditorMount} 
                options={{ 
                  minimap: { enabled: false }, 
                  fontSize: 14,
                  quickSuggestions: false,
                  suggestOnTriggerCharacters: false,
                  acceptSuggestionOnEnter: "off",
                  tabCompletion: "off",
                  wordBasedSuggestions: "off",
                  snippetSuggestions: "none",
                  inlineSuggest: { enabled: false },
                  parameterHints: { enabled: false },
                  autoClosingBrackets: "never",
                  autoClosingQuotes: "never"
                }} 
              />
            </div>
          </div>
          
          <div className="p-4 bg-slate-800 border-t border-white/5">
             <button onClick={validateCode} className="w-full py-3 bg-teal-500 hover:bg-teal-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition">
               <Play size={18} /> Cập Nhật Kết Quả
             </button>
          </div>
        </div>

        {/* Preview & Prompt */}
        <div className="flex flex-col gap-4">
          <div className="glass p-6 max-h-48 overflow-y-auto">
             <h2 className="font-bold text-red-400 uppercase tracking-wider text-sm mb-2">{activeChallenge.title}</h2>
             <p className="text-slate-300 text-sm whitespace-pre-wrap">{activeChallenge.instructions}</p>
          </div>
          <div className="glass bg-white/90 flex-1 overflow-hidden relative">
            <iframe id="pvp-preview-frame" srcDoc={srcDoc} className="w-full h-full border-none" sandbox="allow-scripts allow-same-origin" />
          </div>
        </div>

      </div>
    </div>
  );
}
