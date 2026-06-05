import React, { useState, useEffect } from 'react';
import { useAppContext } from '../store';
import { Play, CheckCircle, Lightbulb, Lock, BookmarkPlus, X, Bot, ChevronRight, Loader2, Wand2, Info } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import Editor, { useMonaco } from '@monaco-editor/react';
import confetti from 'canvas-confetti';
import { playSound } from '../lib/audio';
import { customFormat } from '../lib/formatter';
import Markdown from 'react-markdown';

import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { createPortal } from 'react-dom';

export default function Arena({ kind, mode = 'learn', initialChallengeId, customChallenge, onChallengeComplete }: { kind: 'lesson' | 'challenge', mode?: 'learn' | 'time_attack', initialChallengeId?: string, customChallenge?: any, onChallengeComplete?: () => void }) {
  const { user, challenges, completeChallenge, addXp } = useAppContext();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  const filteredChallenges = challenges.filter(c => c.kind === kind);
  const [activeChallengeId, setActiveChallengeId] = useState<string>(initialChallengeId || filteredChallenges[0]?.id || '');
  
  const activeChallenge = customChallenge || filteredChallenges.find(c => c.id === activeChallengeId) || filteredChallenges[0];
  
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [gameOver, setGameOver] = useState<boolean>(false);

  // Reset active challenge if kind changes and current is invalid
  useEffect(() => {
    if (mode === 'learn') {
      if (!filteredChallenges.find(c => c.id === activeChallengeId)) {
        setActiveChallengeId(filteredChallenges[0]?.id || '');
        setSelectedCategory('all');
      }
    }
  }, [kind, filteredChallenges, activeChallengeId, mode]);

  const [htmlCode, setHtmlCode] = useState<string>('');
  const [cssCode, setCssCode] = useState<string>('');
  const [jsCode, setJsCode] = useState<string>('');
  const [activeEditorTab, setActiveEditorTab] = useState<'html' | 'css' | 'js'>('html');

  const htmlEditorRef = React.useRef<any>(null);
  const cssEditorRef = React.useRef<any>(null);
  const jsEditorRef = React.useRef<any>(null);

  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const clickedInsideEditor = target.closest('.monaco-editor') || target.closest('.monaco-editor-background');
      
      if (!clickedInsideEditor) {
        if (activeEditorTab === 'html' && htmlEditorRef.current) {
          const currentValue = htmlEditorRef.current.getValue();
          const formattedValue = customFormat(currentValue, 'html');
          if (formattedValue !== currentValue) {
            const position = htmlEditorRef.current.getPosition();
            htmlEditorRef.current.setValue(formattedValue);
            if (position) htmlEditorRef.current.setPosition(position);
          }
        } else if (activeEditorTab === 'css' && cssEditorRef.current) {
          const currentValue = cssEditorRef.current.getValue();
          const formattedValue = customFormat(currentValue, 'css');
          if (formattedValue !== currentValue) {
            const position = cssEditorRef.current.getPosition();
            cssEditorRef.current.setValue(formattedValue);
            if (position) cssEditorRef.current.setPosition(position);
          }
        } else if (activeEditorTab === 'js' && jsEditorRef.current) {
          const currentValue = jsEditorRef.current.getValue();
          const formattedValue = customFormat(currentValue, 'js');
          if (formattedValue !== currentValue) {
            const position = jsEditorRef.current.getPosition();
            jsEditorRef.current.setValue(formattedValue);
            if (position) jsEditorRef.current.setPosition(position);
          }
        }
      }
    };

    document.addEventListener('mousedown', handleGlobalClick);
    return () => {
      document.removeEventListener('mousedown', handleGlobalClick);
    };
  }, [activeEditorTab]);

  const [debouncedCode, setDebouncedCode] = useState<string>('');
  const [showHint, setShowHint] = useState(false);
  const [success, setSuccess] = useState(false);
  const [xpGainedAmt, setXpGainedAmt] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string>('');
  
  const [showSnippetModal, setShowSnippetModal] = useState(false);
  const [snippetTitle, setSnippetTitle] = useState('');


  useEffect(() => {
    if (mode === 'time_attack' && isPlaying && !gameOver && !success) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
             setGameOver(true);
             setIsPlaying(false);
             return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [mode, isPlaying, gameOver, success]);

  // Handle randomly picking a challenge for time attack
  const startTimeAttack = () => {
    const randomChallenge = filteredChallenges[Math.floor(Math.random() * filteredChallenges.length)];
    setActiveChallengeId(randomChallenge.id);
    setTimeLeft(60);
    setIsPlaying(true);
    setGameOver(false);
    setSuccess(false);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      let combined = htmlCode;
      const version = Date.now().toString();
      combined = combined
        .replace(/href=(["'])(?:\.\/)?style\.css(?:\?v=[^"']*)?\1/gi, `href=$1style.css?v=${version}$1`)
        .replace(/src=(["'])(?:\.\/)?script\.js(?:\?v=[^"']*)?\1/gi, `src=$1script.js?v=${version}$1`);

      if (cssCode.trim()) combined += `\n<style>\n${cssCode}\n</style>`;
      if (jsCode.trim()) combined += `\n<script>\n${jsCode}\n</script>`;
      setDebouncedCode(combined);
      setErrorMsg('');
    }, 400);
    return () => clearTimeout(timer);
  }, [htmlCode, cssCode, jsCode]);

  const defaultValues = React.useMemo(() => {
    const fullCode = activeChallenge?.defaultCode || '';
    const matchStyle = fullCode.match(/<style>\n?([\s\S]*?)\n?<\/style>/i);
    const css = matchStyle ? matchStyle[1] : '';
    const matchScript = fullCode.match(/<script>\n?([\s\S]*?)\n?<\/script>/i);
    const js = matchScript ? matchScript[1] : '';
    const html = fullCode.replace(/<style>[\s\S]*?<\/style>/gi, '').replace(/<script>[\s\S]*?<\/script>/gi, '').trim();
    return { html, css, js };
  }, [activeChallengeId, activeChallenge]);

  useEffect(() => {
    if (activeChallenge && (!isPlaying || mode === 'learn' || (isPlaying && mode === 'time_attack'))) {
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
      
      // Compute combined code for debounce to reset immediately
      let combined = html;
      const version = Date.now().toString();
      combined = combined
        .replace(/href=(["'])(?:\.\/)?style\.css(?:\?v=[^"']*)?\1/gi, `href=$1style.css?v=${version}$1`)
        .replace(/src=(["'])(?:\.\/)?script\.js(?:\?v=[^"']*)?\1/gi, `src=$1script.js?v=${version}$1`);

      if (css.trim()) combined += `\n<style>\n${css}\n</style>`;
      if (js.trim()) combined += `\n<script>\n${js}\n</script>`;
      setDebouncedCode(combined);

      setShowHint(false);
      setSuccess(false);
      setErrorMsg('');
      setXpGainedAmt(0);
    }
  }, [activeChallengeId, activeChallenge]);

  const handleNextChallenge = () => {
    setSuccess(false);
    setErrorMsg('');
    
    if (customChallenge && onChallengeComplete) {
      onChallengeComplete();
      return;
    }

    if (mode === 'learn') {
      const currentIndex = filteredChallenges.findIndex(c => c.id === activeChallengeId);
      const next = filteredChallenges[currentIndex + 1];
      if (next) {
        setActiveChallengeId(next.id);
        if (selectedCategory !== 'all' && selectedCategory !== next.type) {
          setSelectedCategory(next.type);
        }
      } else {
        if (onChallengeComplete) onChallengeComplete(); // Fallback if no next
      }
    } else if (mode === 'time_attack') {
      setTimeLeft(prev => Math.min(prev + 10, 60));
      const randomChallenge = filteredChallenges[Math.floor(Math.random() * filteredChallenges.length)];
      setActiveChallengeId(randomChallenge.id);
    }
  };

  useEffect(() => {
    let timeout: any;
    if (success && mode === 'time_attack') {
      timeout = setTimeout(() => {
        handleNextChallenge();
      }, 1500);
    }
    return () => clearTimeout(timeout);
  }, [success, activeChallengeId, filteredChallenges, selectedCategory, mode]);

  const { saveSnippet, updateChallenge } = useAppContext();



  const handleSaveSnippet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!snippetTitle.trim() || !activeChallenge) return;
    
    let codeToSave = '';
    if (activeEditorTab === 'html') codeToSave = htmlCode;
    else if (activeEditorTab === 'css') codeToSave = cssCode;
    else if (activeEditorTab === 'js') codeToSave = jsCode;

    saveSnippet(snippetTitle, codeToSave, activeEditorTab === 'js' ? 'javascript' : activeEditorTab);
    setSnippetTitle('');
    setShowSnippetModal(false);
  };

  if (!activeChallenge) {
    return (
      <div className="flex bg-[#0f172a] h-full overflow-hidden items-center justify-center">
        <Loader2 className="animate-spin text-indigo-500 w-12 h-12" />
      </div>
    );
  }

  const srcDoc = `
    <!DOCTYPE html>
    <html lang="en" translate="no">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>body { font-family: sans-serif; padding: 1rem; color: #333; background: #fff; }</style>
      <script>
        window.onerror = function() { return true; };
        function __validate() {
          const code = ${JSON.stringify(debouncedCode).replace(/<\/script>/gi, '<\\/script>')};
          const assert = function(condition, msg) { if(!condition) throw new Error(msg || 'Assertion failed'); };
          try {
            ${activeChallenge.validationSnippet}
          } catch(e) {
            console.error(e);
            return false;
          }
        }
        window.addEventListener('message', (event) => {
          if (event.data === 'validate') {
            const result = !!__validate();
            window.parent.postMessage({ type: 'validation_result', success: result }, '*');
          }
        });
      </script>
    </head>
    <body>${debouncedCode}</body>
    </html>
  `;

  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      if (event.data?.type === 'validation_result') {
        if (event.data.success && !success) {
          playSound('success');
          setSuccess(true);
          confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 }
          });
          if (!user.completedChallenges.includes(activeChallenge.id)) {
            completeChallenge(activeChallenge.id, activeChallenge.xpReward);
            setXpGainedAmt(activeChallenge.xpReward);
          } else if (mode === 'time_attack') {
            addXp(20); // 20 XP per correct attack
            setXpGainedAmt(20);
          } else {
            setXpGainedAmt(0);
          }
        } else if (!event.data.success) {
          playSound('pop');
          setErrorMsg('Oops! Đáp án chưa chính xác, hãy thử lại nhé.');
        }
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [success, activeChallenge?.id, activeChallenge?.title, activeChallenge?.instructions, debouncedCode, activeChallenge?.xpReward, completeChallenge, addXp, user.completedChallenges]);

  const handleBeautify = () => {
    playSound('pop');
    let currentValue = '';
    let type: 'html' | 'css' | 'js' = 'html';
    
    if (activeEditorTab === 'html' && htmlEditorRef.current) {
      currentValue = htmlEditorRef.current.getValue();
      type = 'html';
    } else if (activeEditorTab === 'css' && cssEditorRef.current) {
      currentValue = cssEditorRef.current.getValue();
      type = 'css';
    } else if (activeEditorTab === 'js' && jsEditorRef.current) {
      currentValue = jsEditorRef.current.getValue();
      type = 'js';
    }

    if (!currentValue) return;

    const formattedValue = customFormat(currentValue, type);
    if (formattedValue !== currentValue) {
      if (activeEditorTab === 'html') {
        const position = htmlEditorRef.current.getPosition();
        htmlEditorRef.current.setValue(formattedValue);
        if (position) htmlEditorRef.current.setPosition(position);
      } else if (activeEditorTab === 'css') {
        const position = cssEditorRef.current.getPosition();
        cssEditorRef.current.setValue(formattedValue);
        if (position) cssEditorRef.current.setPosition(position);
      } else if (activeEditorTab === 'js') {
        const position = jsEditorRef.current.getPosition();
        jsEditorRef.current.setValue(formattedValue);
        if (position) jsEditorRef.current.setPosition(position);
      }
    }
  };

  const validateCode = () => {
    playSound('click');
    setErrorMsg('');

    if (activeChallenge) {
      // Tự động cập nhật phiên bản của style.css và script.js trong HTML của học viên
      const version = Date.now().toString();
      let changed = false;
      const updatedHtml = htmlCode
        .replace(/href=(["'])style\.css(?:\?v=[^"']*)?\1/gi, () => {
          changed = true;
          return `href="style.css?v=${version}"`;
        })
        .replace(/src=(["'])script\.js(?:\?v=[^"']*)?\1/gi, () => {
          changed = true;
          return `src="script.js?v=${version}"`;
        });
      if (changed) {
        setHtmlCode(updatedHtml);
      }

      const normalize = (s: string) => s.replace(/\s+/g, '').trim();
      const normalizeClean = (s: string) => {
        if (!s) return '';
        return s.toLowerCase()
          .replace(/[\s\.,!\?]/g, '')
          .replace(/['"`]/g, '')
          .replace(/;\s*$/g, '')
          .trim();
      };
      
      // 1. Check if user hasn't modified default code
      if (activeChallenge.defaultCode && normalizeClean(debouncedCode) === normalizeClean(activeChallenge.defaultCode)) {
        setErrorMsg('Bạn chưa thay đổi code. Hãy thử làm bài nhé!');
        return;
      }

      // 2. If validation is completely empty or just "return true;", use solution string matching as fallback
      const hasMeaningfulValidation = activeChallenge.validationSnippet && activeChallenge.validationSnippet.trim() !== 'return true;';
      if (!hasMeaningfulValidation && activeChallenge.solution) {
          const solutionFull = activeChallenge.solution || '';
          
          let isMatch = false;

          // 1. Exact match in HTML tab
          if (normalizeClean(htmlCode) === normalizeClean(solutionFull)) {
            isMatch = true;
          }

          if (!isMatch) {
            const solMatchStyle = solutionFull.match(/<style>\n?([\s\S]*?)\n?<\/style>/i);
            const solCss = solMatchStyle ? solMatchStyle[1] : '';
            const solMatchScript = solutionFull.match(/<script>\n?([\s\S]*?)\n?<\/script>/i);
            const solJs = solMatchScript ? solMatchScript[1] : '';
            const solHtml = solutionFull.replace(/<style>[\s\S]*?<\/style>/gi, '').replace(/<script>[\s\S]*?<\/script>/gi, '').trim();

            const userHtmlRaw = htmlCode.replace(/<style>[\s\S]*?<\/style>/gi, '').replace(/<script>[\s\S]*?<\/script>/gi, '').trim();
            const userMatchStyle = htmlCode.match(/<style>\n?([\s\S]*?)\n?<\/style>/i);
            // combine from both tab and inline
            const userCss = (cssCode.trim() + '\n' + (userMatchStyle ? userMatchStyle[1] : '')).trim();
            
            const userMatchScript = htmlCode.match(/<script>\n?([\s\S]*?)\n?<\/script>/i);
            const userJs = (jsCode.trim() + '\n' + (userMatchScript ? userMatchScript[1] : '')).trim();

            if (normalizeClean(userHtmlRaw) === normalizeClean(solHtml) && 
                normalizeClean(userCss) === normalizeClean(solCss) && 
                normalizeClean(userJs) === normalizeClean(solJs)) {
                isMatch = true;
            }
          }

          if (!isMatch) {
            // Chạy phân tích lỗi thông minh (Diagnostic)
            let diagnostic = '';
            
            const hasDoctype = /<!doctype\s+html>/i.test(debouncedCode);
            const expectDoctype = /<!doctype\s+html>/i.test(activeChallenge.solution);
            
            if (expectDoctype && !hasDoctype) {
              diagnostic = 'Bạn chưa khai báo loại tài liệu `<!DOCTYPE html>` ở dòng đầu tiên của tài liệu.';
            } else {
              const openHtml = /<html[^>]*>/i.test(debouncedCode);
              const closeHtml = /<\/html>/i.test(debouncedCode);
              
              if (closeHtml && !openHtml) {
                diagnostic = 'Bạn có thẻ đóng `</html>` ở cuối nhưng đang THIẾU thẻ mở `<html>` nằm ngay sau khai báo Doctype!';
              } else if (openHtml && !closeHtml) {
                diagnostic = 'Bạn có thẻ mở `<html>` nhưng đang THIẾU thẻ đóng `</html>` ở cuối tài liệu!';
              } else if (!openHtml && !closeHtml && /html/i.test(activeChallenge.solution)) {
                diagnostic = 'Bạn cần bao bọc toàn bộ mã tiêu đề (<h1>...) bên trong cặp thẻ mở `<html>` và đóng `</html>`.';
              } else {
                const hasH1 = /<h1[^>]*>[\s\S]*?<\/h1>/i.test(debouncedCode);
                const expectH1 = /<h1[^>]*>[\s\S]*?<\/h1>/i.test(activeChallenge.solution);
                
                if (expectH1 && !hasH1) {
                  diagnostic = 'Bạn chưa tạo thẻ heading `<h1>` hoặc chưa viết đúng cấu trúc tiêu đề `<h1>đáp án</h1>`.';
                }
              }
            }
            
            if (diagnostic) {
              setErrorMsg(`Code chưa chính xác: ${diagnostic}`);
            } else {
              setErrorMsg('Code chưa chính xác so với yêu cầu đề bài. Gợi ý: Hãy đọc lại đề hoặc sử dụng "Xem đáp án" để tham khảo nhé.');
            }
            return;
         }
      }
    }

    const iframe = document.getElementById('preview-frame') as HTMLIFrameElement;
    if (iframe && iframe.contentWindow) {
      setTimeout(() => {
        iframe.contentWindow?.postMessage('validate', '*');
      }, 10);
    }
  };

  const handleEditorMount = async (editor: any, monaco: any) => {
    const { emmetHTML, emmetCSS } = await import('emmet-monaco-es');
    emmetHTML(monaco);
    emmetCSS(monaco);

    const performMyFormat = () => {
      const currentValue = editor.getValue();
      const uri = editor.getModel()?.uri?.toString() || '';
      let type: 'html' | 'css' | 'js' = 'html';
      if (uri.endsWith('.css')) type = 'css';
      else if (uri.endsWith('.js') || uri.endsWith('.javascript')) type = 'js';
      
      const formattedValue = customFormat(currentValue, type);
      if (formattedValue !== currentValue) {
        const position = editor.getPosition();
        editor.setValue(formattedValue);
        if (position) {
          editor.setPosition(position);
        }
      }
    };

    // Auto-format on focus change (blur events) representing editor blur state transitions
    editor.onDidBlurEditorText(() => {
      editor.getAction('editor.action.formatDocument')?.run();
      performMyFormat();
    });

    editor.onDidBlurEditorWidget(() => {
      editor.getAction('editor.action.formatDocument')?.run();
      performMyFormat();
    });
  };

  return (
    <div className={cn("grid gap-6 min-h-[calc(100vh-8rem)] h-auto pb-12", mode === 'time_attack' ? "grid-cols-1 lg:grid-cols-4" : "grid-cols-1")}>
      {/* Sidebar chọn bài học / Time Attack Info */}
      {mode === 'time_attack' && (
        <div className="glass p-4 overflow-y-auto flex flex-col gap-4 h-full">
          <>
            <h2 className="font-bold text-xl text-orange-400 flex items-center gap-2">
              <Play className="fill-orange-400"/> Thời Gian Sinh Tử
            </h2>
            <div className="text-slate-300 text-sm">
              <p className="mb-2">Hoàn thành bài tập càng nhanh càng tốt. Mỗi câu trả lời đúng được cộng 10 giây!</p>
              <p>Mục tiêu: Đạt điểm KN cao nhất trước khi hết giờ.</p>
            </div>
            
            <div className="bg-slate-900 rounded-xl p-6 border flex flex-col items-center justify-center text-center shadow-inner relative overflow-hidden h-40">
              {isPlaying ? (
                <>
                  <div className={cn(
                    "text-6xl font-black tabular-nums transition-colors z-10",
                    timeLeft <= 10 ? "text-red-500 animate-pulse" : "text-teal-400"
                  )}>
                    {timeLeft}s
                  </div>
                </>
              ) : (
                <div className="z-10 flex flex-col items-center">
                  {gameOver ? (
                    <>
                      <div className="text-red-400 font-bold mb-2 text-xl">Hết Giờ!</div>
                      <button onClick={startTimeAttack} className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-6 rounded-lg w-full transition-transform hover:scale-105 active:scale-95">Chơi lại</button>
                    </>
                  ) : (
                    <button onClick={startTimeAttack} className="bg-teal-500 hover:bg-teal-600 text-slate-900 font-bold py-3 px-6 rounded-lg w-full text-lg shadow-[0_0_15px_rgba(45,212,191,0.5)] transition-transform hover:scale-105 active:scale-95">Bắt Đầu Mã Hoá</button>
                  )}
                </div>
              )}
              {/* Background gradient pulses when low time */}
              {isPlaying && timeLeft <= 10 && (
                <div className="absolute inset-0 bg-red-500/10 animate-pulse pointer-events-none"></div>
              )}
            </div>

            {isPlaying && (
              <div className="bg-white/5 p-4 rounded-xl border border-white/10 text-center">
                <div className="text-slate-400 text-sm mb-1">Nhiệm vụ tiếp theo sau:</div>
                <div className="text-orange-400 font-bold text-lg">{user.xp} KN (Tổng)</div>
              </div>
            )}
          </>
        </div>
      )}

      {/* Main Workspace */}
      <div className={cn("flex flex-col h-auto gap-6 relative", mode === 'time_attack' ? "lg:col-span-3" : "col-span-1")}>
        {mode === 'time_attack' && (!isPlaying) && (
          <div className="absolute inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center rounded-2xl border border-white/10">
            <div className="text-center">
              <h2 className="text-3xl font-black text-white mb-4">Sẵn Sàng Chưa?</h2>
              <button onClick={startTimeAttack} className="bg-teal-500 hover:bg-teal-600 text-slate-900 font-bold py-3 px-8 rounded-lg text-lg shadow-[0_0_15px_rgba(45,212,191,0.5)] transition-transform hover:scale-105 active:scale-95">Bắt Đầu Mã Hoá</button>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="glass p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold text-slate-50">
                  <Markdown components={{ p: ({node, ...props}) => <span {...props} />, code: ({node, ...props}) => <code className="bg-black/30 px-1 py-0.5 rounded text-teal-300 font-mono text-lg" {...props} /> }}>
                    {activeChallenge.title}
                  </Markdown>
                </h2>
                {/* Translation button removed */}
              </div>
              <div className="text-slate-400 mt-2 text-sm leading-relaxed">
                <div className="whitespace-pre-wrap font-sans">
                  <Markdown components={{
                    code: ({node, className, children, ...props}: any) => {
                      const match = /language-(\w+)/.exec(className || '');
                      const str = String(children).replace(/\n$/, '');
                      const isBlock = str.includes('\n') || !!match;
                      const lang = match ? match[1] : (activeChallenge.type === 'js' ? 'javascript' : activeChallenge.type === 'html' ? 'html' : 'css');
                      
                      if (!isBlock) {
                        return (
                          <SyntaxHighlighter
                            PreTag="span"
                            language={lang}
                            style={atomDark}
                            customStyle={{ padding: '0.1rem 0.3rem', borderRadius: '0.25rem', display: 'inline', background: 'rgba(0,0,0,0.4)', fontFamily: 'monospace' }}
                            {...props}
                          >
                            {str}
                          </SyntaxHighlighter>
                        );
                      }
                      
                      return (
                        <SyntaxHighlighter
                          PreTag="div"
                          language={lang}
                          style={atomDark}
                          customStyle={{ margin: '0.5rem 0', padding: '1rem', borderRadius: '0.5rem', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)' }}
                          {...props}
                        >
                          {str}
                        </SyntaxHighlighter>
                      );
                    }
                  }}>
                    {activeChallenge.description}
                  </Markdown>
                </div>
              </div>
            </div>
            <div className="bg-white/10 px-3 py-1 rounded-full text-sm text-teal-400 font-bold border border-white/10 shrink-0">
              +{activeChallenge.xpReward} KN
            </div>
          </div>
          <div className="bg-blue-500/10 p-4 rounded-xl text-slate-300 text-sm border-l-4 border-blue-500">
            {activeChallenge.instructions && activeChallenge.instructions.toLowerCase().includes('style') && (
              <div className="mb-3 text-xs text-orange-300 font-bold block">
                <Info className="inline w-4 h-4 mr-1 pb-[2px]"/>Mẹo: Trình biên tập của ứng dụng hỗ trợ đa cửa sổ. Thay vì viết thẻ &lt;style&gt; bên trong HTML, hãy chuyển sang tab <span className="underline">style.css</span> để làm toán các thay đổi về CSS nhé. Cửa sổ này tự động gộp file cho bạn lúc chấm điểm!
              </div>
            )}
            <div className="whitespace-pre-wrap font-sans flex items-start flex-wrap gap-x-2">
              <strong>Nhiệm vụ:</strong> <Markdown components={{
                p: ({node, ...props}: any) => <span {...props} />,
                code: ({node, className, children, ...props}: any) => {
                  const match = /language-(\w+)/.exec(className || '');
                  const str = String(children).replace(/\n$/, '');
                  const isBlock = str.includes('\n') || !!match;
                  const lang = match ? match[1] : (activeChallenge.type === 'js' ? 'javascript' : activeChallenge.type === 'html' ? 'html' : 'css');
                  
                  if (!isBlock) {
                    return (
                      <SyntaxHighlighter
                        PreTag="span"
                        language={lang}
                        style={atomDark}
                        customStyle={{ padding: '0.1rem 0.3rem', borderRadius: '0.25rem', display: 'inline', background: 'rgba(0,0,0,0.4)', fontFamily: 'monospace' }}
                        {...props}
                      >
                        {str}
                      </SyntaxHighlighter>
                    );
                  }
                  
                  return (
                    <SyntaxHighlighter
                      PreTag="div"
                      language={lang}
                      style={atomDark}
                      customStyle={{ margin: '0.5rem 0', padding: '1rem', borderRadius: '0.5rem', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)' }}
                      {...props}
                    >
                      {str}
                    </SyntaxHighlighter>
                  );
                }
              }}>{activeChallenge.instructions}</Markdown>
            </div>
          </div>
        </div>

        {/* Editor & Preview */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 min-h-[800px] lg:min-h-[600px] lg:h-[850px] mb-8">
          <div className="glass flex flex-col overflow-hidden relative min-h-[400px]">
            <div className="bg-white/5 flex flex-col sm:flex-row sm:items-center border-b border-white/10">
              <div className="flex gap-1 p-2 flex-1 overflow-x-auto whitespace-nowrap">
                {(['html', 'css', 'js'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveEditorTab(tab)}
                    className={cn(
                      "px-3 py-1.5 text-xs font-mono rounded-md transition-colors",
                      activeEditorTab === tab 
                        ? "bg-white/10 text-teal-400" 
                        : "text-slate-400 hover:bg-white/5 hover:text-slate-300"
                    )}
                  >
                    {tab === 'html' ? 'index.html' : tab === 'css' ? 'style.css' : 'script.js'}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-1 overflow-x-auto whitespace-nowrap px-2 pb-2 sm:pb-0 sm:px-0">
                <button onClick={handleBeautify} title="Format / Làm đẹp cấu trúc Code (Shift+Alt+F)" className="text-pink-400 hover:text-pink-300 flex items-center gap-1 text-xs font-medium pr-3 transition-colors shrink-0">
                  <Wand2 size={14} /> Beautify
                </button>
                <button onClick={() => setShowSnippetModal(true)} className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 text-xs font-medium pr-3 transition-colors shrink-0">
                  <BookmarkPlus size={14} /> Lưu Snippet
                </button>
                {mode !== 'time_attack' && (
                  <button onClick={() => { playSound('pop'); setShowHint(!showHint); }} className="text-yellow-500 hover:text-yellow-400 flex items-center gap-1 text-xs font-medium pr-4 transition-colors shrink-0">
                    <Lightbulb size={14} /> {showHint ? 'Ẩn đáp án' : 'Xem đáp án'}
                  </button>
                )}
              </div>
            </div>
            <div 
              className="flex-1 w-full relative min-h-0"
            >
              {showHint && mode !== 'time_attack' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 z-[60] bg-slate-900/95 backdrop-blur-md p-6 text-sm flex flex-col gap-4 overflow-y-auto border-t border-white/10 shadow-2xl">
                  {activeChallenge.solution && (
                    <div className="mt-2 text-left">
                      <span className="font-bold text-teal-400 text-base">✅ Đáp án tham khảo:</span>
                      <div className="mt-2 rounded-xl bg-black/50 border border-white/10 overflow-hidden shadow-inner text-sm">
                        <SyntaxHighlighter
                          language={activeChallenge.type === 'js' ? 'javascript' : activeChallenge.type === 'html' ? 'html' : 'css'}
                          style={atomDark}
                          wrapLines={true}
                          wrapLongLines={true}
                          customStyle={{ margin: 0, padding: '1rem', background: 'transparent' }}
                        >
                          {activeChallenge.solution}
                        </SyntaxHighlighter>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
              <div className={cn("w-full h-full", activeEditorTab !== 'html' && "hidden")}>
                <Editor
                  key={`${activeChallenge.id}-html`}
                  path={activeChallenge.id + '.html'}
                  height="100%"
                  language="html"
                  theme="vs-dark"
                  defaultValue={defaultValues.html}
                  onChange={(value) => setHtmlCode(value || '')}
                  onMount={(editor, monaco) => {
                    htmlEditorRef.current = editor;
                    handleEditorMount(editor, monaco);
                  }}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    wordWrap: 'on',
                    formatOnType: true,
                    formatOnPaste: true,
                    padding: { top: 16 },
                    quickSuggestions: true,
                    suggestOnTriggerCharacters: true,
                    acceptSuggestionOnEnter: "on",
                    tabCompletion: "on",
                    wordBasedSuggestions: "off",
                    snippetSuggestions: "inline",
                    inlineSuggest: { enabled: true },
                    parameterHints: { enabled: false },
                    autoClosingBrackets: "languageDefined",
                    autoClosingQuotes: "languageDefined"
                  }}
                />
              </div>
              <div className={cn("w-full h-full", activeEditorTab !== 'css' && "hidden")}>
                <Editor
                  key={`${activeChallenge.id}-css`}
                  path={activeChallenge.id + '.css'}
                  height="100%"
                  language="css"
                  theme="vs-dark"
                  defaultValue={defaultValues.css}
                  onChange={(value) => setCssCode(value || '')}
                  onMount={(editor, monaco) => {
                    cssEditorRef.current = editor;
                    handleEditorMount(editor, monaco);
                  }}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    wordWrap: 'on',
                    formatOnType: true,
                    formatOnPaste: true,
                    padding: { top: 16 },
                    quickSuggestions: true,
                    suggestOnTriggerCharacters: true,
                    acceptSuggestionOnEnter: "on",
                    tabCompletion: "on",
                    wordBasedSuggestions: "off",
                    snippetSuggestions: "inline",
                    inlineSuggest: { enabled: true },
                    parameterHints: { enabled: false },
                    autoClosingBrackets: "languageDefined",
                    autoClosingQuotes: "languageDefined"
                  }}
                />
              </div>
              <div className={cn("w-full h-full", activeEditorTab !== 'js' && "hidden")}>
                <Editor
                  key={`${activeChallenge.id}-js`}
                  path={activeChallenge.id + '.js'}
                  height="100%"
                  language="javascript"
                  theme="vs-dark"
                  defaultValue={defaultValues.js}
                  onChange={(value) => setJsCode(value || '')}
                  onMount={(editor, monaco) => {
                    jsEditorRef.current = editor;
                    handleEditorMount(editor, monaco);
                  }}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    wordWrap: 'on',
                    formatOnType: true,
                    formatOnPaste: true,
                    padding: { top: 16 },
                    quickSuggestions: true,
                    suggestOnTriggerCharacters: true,
                    acceptSuggestionOnEnter: "on",
                    tabCompletion: "on",
                    wordBasedSuggestions: "off",
                    snippetSuggestions: "inline",
                    inlineSuggest: { enabled: true },
                    parameterHints: { enabled: false },
                    autoClosingBrackets: "languageDefined",
                    autoClosingQuotes: "languageDefined"
                  }}
                />
              </div>
            </div>
            <div className="p-4 bg-white/5 border-t border-white/10">
              <button 
                onClick={validateCode}
                className="w-full py-3 bg-teal-400 hover:bg-teal-500 text-slate-900 font-bold rounded-xl flex items-center justify-center gap-2 transition"
              >
                <Play size={18} /> Chạy Code & Kiểm tra
              </button>
              {errorMsg && (
                <div className="mt-3 text-red-400 text-sm font-medium text-left bg-red-400/10 p-3 rounded-lg border border-red-400/20 whitespace-pre-wrap">
                  {errorMsg}
                </div>
              )}
            </div>
          </div>

          <div className="glass bg-white/90 !border-0 overflow-hidden relative min-h-[400px]">
            <iframe
              id="preview-frame"
              srcDoc={srcDoc}
              title="preview"
              className="w-full h-full border-none"
              sandbox="allow-scripts allow-same-origin"
            />

            {success && createPortal((
               <motion.div 
               initial={{ opacity: 0, scale: 0.9 }} 
               animate={{ opacity: 1, scale: 1 }} 
               className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm pointer-events-auto flex flex-col items-center justify-center z-[100] p-4"
             >
               <div className="bg-green-600 shadow-[0_0_80px_rgba(34,197,94,0.4)] rounded-3xl p-10 flex flex-col items-center text-white pointer-events-auto border-4 border-green-400 min-w-[300px]">
                 <CheckCircle size={80} className="mb-4 text-green-200" />
                 <h3 className="text-4xl font-bold mb-2">Tuyệt vời!</h3>
                 {mode === 'time_attack' ? (
                   <>
                     <p className="text-xl font-bold text-yellow-300">🔥 +10 Giây</p>
                     <motion.p 
                       initial={{ scale: 0.5, y: 20 }}
                       animate={{ scale: 1.5, y: 0 }}
                       transition={{ duration: 0.5, type: 'spring', bounce: 0.6 }}
                       className="text-yellow-300 font-extrabold text-3xl mt-4 drop-shadow-md"
                     >
                       + {xpGainedAmt > 0 ? xpGainedAmt : 0} KN
                     </motion.p>
                   </>
                 ) : (
                   <div className="flex flex-col items-center w-full max-w-3xl">
                      <div className="mt-4 mb-8">
                        {xpGainedAmt > 0 ? (
                          <motion.p 
                            initial={{ scale: 0.5, y: 20 }}
                            animate={{ scale: 1.5, y: 0 }}
                            transition={{ duration: 0.5, type: 'spring', bounce: 0.6 }}
                            className="text-yellow-300 font-extrabold text-3xl drop-shadow-[0_0_15px_rgba(253,224,71,0.5)]"
                          >
                            + {xpGainedAmt} KN
                          </motion.p>
                        ) : (
                          <p className="text-green-100/90 italic text-lg">(Thực hành lại - Không cộng thêm điểm)</p>
                        )}
                      </div>
                     
                     <div className="flex flex-col sm:flex-row gap-4 mt-2">
                       <button onClick={() => { playSound('click'); handleNextChallenge(); }} className="py-4 px-10 bg-white hover:bg-slate-100 text-green-700 rounded-full font-black text-xl shadow-2xl flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95">
                         Tiếp tục <ChevronRight size={24} className="stroke-[4px]" />
                       </button>
                     </div>
                   </div>
                 )}
               </div>
             </motion.div>
            ), document.body)}
          </div>
        </div>
      </div>
      
      {/* Snippet Modal */}
      {showSnippetModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={() => setShowSnippetModal(false)}></div>
          <div className="relative glass p-6 rounded-2xl w-full max-w-md border border-white/10 shadow-2xl flex flex-col items-center">
            <button onClick={() => setShowSnippetModal(false)} className="absolute top-4 right-4 p-1 bg-white/5 hover:bg-white/10 rounded-full text-slate-400">
              <X size={16} />
            </button>
            <div className="w-12 h-12 bg-indigo-500/20 text-indigo-400 rounded-full flex items-center justify-center border border-indigo-500/30 mb-4">
              <BookmarkPlus size={24} />
            </div>
            <h3 className="text-xl font-bold text-slate-100 mb-2">Lưu vào Sổ tay</h3>
            <p className="text-slate-400 text-sm text-center mb-6">Bạn đang lưu file <strong>{activeEditorTab === 'html' ? 'index.html' : activeEditorTab === 'css' ? 'style.css' : 'script.js'}</strong></p>
            
            <form onSubmit={handleSaveSnippet} className="w-full flex flex-col gap-4">
              <input 
                type="text" 
                value={snippetTitle}
                onChange={(e) => setSnippetTitle(e.target.value)}
                placeholder="Ví dụ: Flexbox căn giữa"
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50"
                autoFocus
              />
              <button 
                type="submit"
                disabled={!snippetTitle.trim()}
                className="w-full py-3 bg-indigo-500 hover:bg-indigo-600 disabled:bg-indigo-500/50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition"
              >
                Lưu Snippet
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
