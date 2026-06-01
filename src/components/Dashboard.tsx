import React from 'react';
import { useAppContext } from '../store';
import { LEVEL_THRESHOLDS } from '../data';
import { formatName } from '../lib/nameUtils';
import { Trophy, Star, ShieldAlert, Zap, Flame, User, Layout, Palette, Code, Award, Sparkles, Medal, Crown, Search, CheckCircle2, Circle, X, BookOpen, Filter } from 'lucide-react';
import { motion } from 'motion/react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { cn } from '../lib/utils';
import Markdown from 'react-markdown';

const getBadgeIcon = (iconName: string) => {
  switch (iconName) {
    case 'Trophy': return <Trophy className="w-8 h-8" />;
    case 'Layout': return <Layout className="w-8 h-8" />;
    case 'Palette': return <Palette className="w-8 h-8" />;
    case 'Code': return <Code className="w-8 h-8" />;
    case 'Flame': return <Flame className="w-8 h-8" />;
    case 'Star': return <Star className="w-8 h-8" />;
    case 'Crown': return <Crown className="w-8 h-8" />;
    default: return <Award className="w-8 h-8" />;
  }
};

const getBadgeColors = (id: string) => {
  if (id === 'first_blood') return 'from-yellow-300 via-yellow-400 to-yellow-600 shadow-yellow-500/50 text-yellow-900 border-yellow-200';
  if (id === 'html_master') return 'from-rose-400 via-red-500 to-rose-700 shadow-red-500/50 text-white border-red-300';
  if (id === 'css_master') return 'from-cyan-400 via-blue-500 to-indigo-600 shadow-blue-500/50 text-white border-cyan-300';
  if (id === 'js_ninja') return 'from-yellow-300 via-amber-400 to-orange-500 shadow-amber-500/50 text-slate-900 border-amber-200';
  if (id === 'streak_7') return 'from-orange-400 via-orange-500 to-red-500 shadow-orange-500/50 text-white border-orange-300';
  if (id === 'streak_30') return 'from-yellow-300 via-yellow-500 to-amber-600 shadow-yellow-500/50 text-slate-900 border-yellow-200';
  if (id === 'streak_100') return 'from-fuchsia-400 via-purple-500 to-indigo-600 shadow-purple-500/50 text-white border-fuchsia-300';
  return 'from-slate-300 via-slate-400 to-slate-500 shadow-slate-500/50 text-white border-slate-200';
};

export default function Dashboard({ onNavigate }: { onNavigate?: (tab: string) => void }) {
  const { user, resetProgress, claimQuest, buyStreakFreeze, challenges, setSelectedChallengeId } = useAppContext();

  const [searchTerm, setSearchTerm] = React.useState('');
  const [subjectFilter, setSubjectFilter] = React.useState<'all' | 'html' | 'css' | 'js'>('all');
  const [statusFilter, setStatusFilter] = React.useState<'all' | 'todo' | 'done'>('all');
  const [showMoreLimit, setShowMoreLimit] = React.useState(8);

  const currentLevelXp = LEVEL_THRESHOLDS[user.level - 1] || 0;
  const nextLevelXp = LEVEL_THRESHOLDS[user.level] || currentLevelXp + 1000;
  const progressPercent = Math.min(100, Math.max(0, ((user.xp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100));

  const removeVietnameseTones = (str: string) => {
    str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
    str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
    str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
    str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
    str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
    str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
    str = str.replace(/đ/g, "d");
    str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A");
    str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E");
    str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, "I");
    str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O");
    str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U");
    str = str.replace(/Ỳ|Ý|Ỹ|Ỷ|Ỹ/g, "Y");
    str = str.replace(/Đ/g, "D");
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  };

  const lessonChallenges = challenges.filter(c => c.kind === 'lesson');

  const filteredLessons = React.useMemo(() => {
    return lessonChallenges.filter(lesson => {
      // 1. Term Match
      if (searchTerm.trim() !== '') {
        const cleanTerm = removeVietnameseTones(searchTerm);
        const cleanTitle = removeVietnameseTones(lesson.title || '');
        const cleanDesc = removeVietnameseTones(lesson.description || '');
        if (!cleanTitle.includes(cleanTerm) && !cleanDesc.includes(cleanTerm)) {
          return false;
        }
      }

      // 2. Subject Filter
      if (subjectFilter !== 'all' && lesson.type !== subjectFilter) {
        return false;
      }

      // 3. Status Filter
      const isCompleted = user.completedChallenges.includes(lesson.id);
      if (statusFilter === 'todo' && isCompleted) return false;
      if (statusFilter === 'done' && !isCompleted) return false;

      return true;
    });
  }, [searchTerm, subjectFilter, statusFilter, challenges, user.completedChallenges]);

  const nextChallenge = challenges.find(c => c.kind === 'lesson' && !user.completedChallenges.includes(c.id));

  const htmlScore = user.completedChallenges.filter(id => id.startsWith('html')).length * 10;
  const cssScore = user.completedChallenges.filter(id => id.startsWith('css')).length * 10;
  const jsScore = user.completedChallenges.filter(id => id.startsWith('js')).length * 10;

  const radarData = [
    { subject: 'HTML', score: Math.max(htmlScore, 10), fullMark: 100 },
    { subject: 'CSS', score: Math.max(cssScore, 10), fullMark: 100 },
    { subject: 'JS', score: Math.max(jsScore, 10), fullMark: 100 },
  ];

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center glass p-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-50 mb-2">Xin chào, {formatName(user.name)}!</h1>
          <p className="text-slate-400">Sẵn sàng chinh phục thử thách lập trình hôm nay chưa?</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Lộ trình tiếp theo */}
        {nextChallenge && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="md:col-span-2 glass p-6 bg-teal-400/10 border-teal-400/30">
             <div className="flex flex-col md:flex-row justify-between items-center gap-4">
               <div>
                  <h3 className="text-teal-400 font-bold flex items-center gap-2 mb-1"><Zap size={20} /> Bài học gợi ý tiếp theo</h3>
                  <div className="text-slate-50 text-xl font-bold">
                    <Markdown components={{ p: ({node, ...props}) => <span {...props} />, code: ({node, ...props}) => <code className="bg-black/30 px-1 py-0.5 rounded text-teal-300 font-mono text-base" {...props} /> }}>
                      {nextChallenge.title}
                    </Markdown>
                  </div>
                  <p className="text-slate-400 text-sm mt-1">{nextChallenge.description}</p>
               </div>
               <button 
                 onClick={() => onNavigate?.('learn')}
                 className="whitespace-nowrap px-6 py-3 bg-teal-400 hover:bg-teal-500 text-slate-900 font-bold rounded-xl shadow-lg shadow-teal-500/20 transition-all"
               >
                 Học ngay bây giờ
               </button>
             </div>
          </motion.div>
        )}

        {/* Tìm kiếm bài học nhanh */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="md:col-span-2 glass p-6 border-white/10"
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
            <div>
              <h2 className="text-xl font-bold text-slate-50 flex items-center gap-2">
                <Search className="text-teal-400 w-5 h-5 animate-pulse" /> Tìm kiếm bài tập & bài học nhanh
              </h2>
              <p className="text-slate-400 text-sm mt-0.5">Tìm kiếm nhanh bài học HTML, CSS, JS và luyện tập tức thì</p>
            </div>
            <span className="text-xs bg-teal-400/10 text-teal-300 font-mono px-2.5 py-1 rounded-full border border-teal-400/20 self-start lg:self-center">
              Tổng số: {lessonChallenges.length} bài học
            </span>
          </div>

          <div className="flex flex-col gap-4">
            {/* Input Bar */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Nhập từ khóa bài tập cần tìm... (Ví dụ: header, button, div, flexbox, Doctype...)"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setShowMoreLimit(8);
                }}
                className="w-full bg-white/5 hover:bg-white/10 focus:bg-slate-900/40 border border-white/10 focus:border-teal-400/50 rounded-xl px-4 py-3.5 pl-12 pr-11 text-slate-50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400/20 transition-all font-medium text-sm md:text-base shadow-inner"
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')} 
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-50 p-1 rounded-full hover:bg-white/10 transition-colors"
                  title="Xóa tìm kiếm"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Filter chips rows */}
            <div className="flex flex-col md:flex-row md:items-center gap-4 pt-1 border-t border-white/5">
              {/* Language Filters */}
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs font-semibold text-slate-400 tracking-wider uppercase">Ngôn ngữ:</span>
                <div className="flex flex-wrap gap-1.5">
                  {(['all', 'html', 'css', 'js'] as const).map(sub => (
                    <button
                      key={sub}
                      onClick={() => {
                        setSubjectFilter(sub);
                        setShowMoreLimit(8);
                      }}
                      className={cn(
                        "text-xs px-3 py-1.5 rounded-lg border font-medium transition-all duration-200 capitalize",
                        subjectFilter === sub
                          ? "bg-teal-400/20 text-teal-400 border-teal-400/40 font-semibold"
                          : "bg-white/5 text-slate-400 border-transparent hover:text-slate-200 hover:bg-white/10"
                      )}
                    >
                      {sub === 'all' ? 'Tất cả' : sub.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Vertical divider */}
              <div className="hidden md:block w-px h-5 bg-white/10" />

              {/* Status Filters */}
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs font-semibold text-slate-400 tracking-wider uppercase">Trạng thái:</span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { id: 'all', label: 'Tất cả' },
                    { id: 'todo', label: 'Chưa học' },
                    { id: 'done', label: 'Đã hoàn thành' }
                  ].map(stat => (
                    <button
                      key={stat.id}
                      onClick={() => {
                        setStatusFilter(stat.id as any);
                        setShowMoreLimit(8);
                      }}
                      className={cn(
                        "text-xs px-3 py-1.5 rounded-lg border font-medium transition-all duration-200",
                        statusFilter === stat.id
                          ? "bg-purple-400/20 text-purple-400 border-purple-400/40 font-semibold"
                          : "bg-white/5 text-slate-400 border-transparent hover:text-slate-200 hover:bg-white/10"
                      )}
                    >
                      {stat.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Results Block */}
          <div className="mt-4 pt-4 border-t border-white/5">
            {filteredLessons.length > 0 ? (
              <div>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-semibold text-slate-400">
                    {searchTerm || subjectFilter !== 'all' || statusFilter !== 'all' 
                      ? `Tìm thấy ${filteredLessons.length} bài học:` 
                      : "Gợi ý lộ trình tiếp theo của bạn:"}
                  </span>
                  {filteredLessons.length > showMoreLimit && (
                    <span className="text-xs text-teal-400/80">
                      Hiển thị {showMoreLimit} / {filteredLessons.length} bài
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {filteredLessons.slice(0, showMoreLimit).map((lesson) => {
                    const isCompleted = user.completedChallenges.includes(lesson.id);
                    const isHTML = lesson.type === 'html';
                    const isCSS = lesson.type === 'css';
                    
                    return (
                      <motion.div
                        key={lesson.id}
                        onClick={() => {
                          setSelectedChallengeId(lesson.id);
                          onNavigate?.('learn');
                        }}
                        whileHover={{ y: -2 }}
                        className="bg-white/5 hover:bg-teal-400/10 border border-white/10 hover:border-teal-400/30 p-4 rounded-xl flex items-center justify-between cursor-pointer transition-all duration-300 shadow-md group"
                      >
                        <div className="flex items-center gap-3 overflow-hidden pr-2">
                          {/* Type Tag */}
                          <div className={cn(
                            "w-10 h-10 rounded-lg flex items-center justify-center font-bold font-mono text-xs shrink-0 border",
                            isHTML 
                              ? "bg-orange-500/10 text-orange-400 border-orange-500/20 group-hover:bg-orange-500/20" 
                              : isCSS 
                                ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/20 group-hover:bg-cyan-500/20" 
                                : "bg-yellow-500/10 text-yellow-400 border-yellow-500/20 group-hover:bg-yellow-500/20"
                          )}>
                            {lesson.type.toUpperCase()}
                          </div>
                          
                          {/* Title / Description */}
                          <div className="overflow-hidden">
                            <h4 className="font-bold text-slate-100 group-hover:text-teal-400 transition-colors text-sm md:text-base truncate">
                              <Markdown components={{ p: ({node, ...props}) => <span {...props} />, code: ({node, ...props}) => <code className="bg-black/30 px-1 py-0.5 rounded text-teal-300 font-mono text-xs" {...props} /> }}>
                                {lesson.title}
                              </Markdown>
                            </h4>
                            <p className="text-slate-400 text-xs truncate mt-0.5">
                              {lesson.description || 'Chinh phục bài học này để lấy thêm kinh nghiệm!'}
                            </p>
                          </div>
                        </div>

                        {/* Right Stats */}
                        <div className="flex items-center gap-3 shrink-0">
                          <div className="hidden sm:flex flex-col items-end gap-1 font-mono text-right">
                            <span className={cn(
                              "text-[8px] md:text-[9px] uppercase font-bold px-2 py-0.5 rounded-full border",
                              lesson.difficulty === 'Khó' 
                                ? "text-red-400 bg-red-400/10 border-red-400/20" 
                                : lesson.difficulty === 'Trung bình' 
                                  ? "text-orange-400 bg-orange-400/10 border-orange-400/20" 
                                  : "text-green-400 bg-green-400/10 border-green-400/20"
                            )}>
                              {lesson.difficulty || 'Dễ'}
                            </span>
                            <span className="text-[10px] text-teal-400">+{lesson.xpReward || 100} XP</span>
                          </div>

                          {/* Completed Checklist */}
                          <div>
                            {isCompleted ? (
                              <div className="w-8 h-8 rounded-full bg-emerald-500/15 flex items-center justify-center border border-emerald-500/40" title="Đã hoàn thành">
                                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                              </div>
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-white/5 group-hover:bg-teal-400/20 flex items-center justify-center border border-white/10 group-hover:border-teal-400/40 transition-all" title="Chưa hoàn thành">
                                <Circle className="w-5 h-5 text-slate-500 group-hover:text-teal-400 transition-colors" />
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Show more button */}
                {filteredLessons.length > showMoreLimit && (
                  <div className="text-center mt-4">
                    <button
                      onClick={() => setShowMoreLimit(prev => prev + 12)}
                      className="px-5 py-2 hover:bg-teal-400/15 hover:text-teal-400 border border-white/10 hover:border-teal-400/40 text-slate-300 font-bold rounded-xl text-xs sm:text-sm transition-all shadow-md active:scale-95"
                    >
                      Xem thêm {filteredLessons.length - showMoreLimit} bài tập khác
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                <span className="text-3xl">🧩</span>
                <p className="text-slate-200 font-bold text-lg mt-3">Không tìm thấy bài học phù hợp</p>
                <p className="text-slate-400 text-sm max-w-sm mt-1">
                  Hãy thử gõ từ khóa khác hoặc thiết lập lại bộ lọc để tìm được nhiều bài tập hơn.
                </p>
                {(searchTerm || subjectFilter !== 'all' || statusFilter !== 'all') && (
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setSubjectFilter('all');
                      setStatusFilter('all');
                      setShowMoreLimit(8);
                    }}
                    className="mt-4 text-xs font-semibold px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-slate-100 rounded-lg border border-white/10 transition-colors"
                  >
                    Xóa bộ lọc tìm kiếm
                  </button>
                )}
              </div>
            )}
          </div>
        </motion.div>

        {/* Chuỗi ngày học tập (Streak) */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="md:col-span-1 glass p-6 bg-orange-400/10 border-orange-400/30 flex flex-col justify-between">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-orange-400/20 pb-4 mb-4">
            <div className="flex items-center gap-4">
              <div className="bg-orange-500/20 p-4 rounded-full text-orange-400 relative">
                <Flame size={32} className={user.streak && user.streak > 0 ? "animate-pulse" : ""} />
                {user.streakFreezes ? (
                  <div className="absolute -bottom-2 -right-2 bg-blue-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full border-2 border-slate-900 shadow-md flex items-center gap-1">
                    ❄️ {user.streakFreezes}
                  </div>
                ) : null}
              </div>
              <div>
                <h3 className="text-orange-400 font-bold mb-1">Chuỗi ngày học tập</h3>
                <p className="text-slate-50 text-2xl font-bold">{user.streak || 0} ngày</p>
                <p className="text-slate-400 text-sm mt-1">
                  {user.streak && user.streak > 0 
                    ? `Tuyệt vời! Cố gắng duy trì nhé.` 
                    : 'Bắt đầu luyện tập ngay!'}
                </p>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-400 font-medium flex items-center gap-1">❄️ Khóa bảo vệ</span>
              <span className="font-bold text-slate-200">{user.streakFreezes || 0} / 3</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-400 font-medium flex items-center gap-1">💰 Xu hiện tại</span>
              <span className="font-bold text-yellow-400">{user.coins || 0}</span>
            </div>
            <button 
              onClick={() => buyStreakFreeze()}
              id="buy-freeze-btn"
              disabled={(user.coins || 0) < 50 || (user.streakFreezes || 0) >= 3}
              className="mt-2 w-full py-2 bg-blue-500/20 hover:bg-blue-500/40 text-blue-300 font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-blue-500/30 text-sm flex justify-center items-center gap-2"
            >
              Mua Khóa (50 xu)
            </button>
            <p className="text-xs text-slate-400 mt-2">
              💡 <span className="italic">Hoàn thành bài tập (2 XP = 1 Xu) hoặc <br/>làm nhiệm vụ hàng ngày để nhận xu!</span>
            </p>
          </div>
        </motion.div>

        {/* Nhiệm vụ hàng ngày */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="md:col-span-1 glass p-6 bg-purple-400/10 border-purple-400/30">
          <h2 className="text-xl font-bold text-slate-50 mb-4 flex items-center gap-2"><Trophy className="text-purple-400"/> Nhiệm vụ hàng ngày</h2>
          <div className="space-y-4">
            {/* Quest 1 */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-50 text-sm font-medium">Hoàn thành 3 bài tập</p>
                <p className="text-slate-400 text-xs mt-1">
                  {Math.min((user.questProgress?.challengesCompleted || 0), 3)} / 3 bài
                </p>
              </div>
              {user.questProgress?.claimed?.includes("quest_challs") ? (
                <span className="text-xs font-bold text-green-400 bg-green-400/10 px-3 py-1 rounded-full">Đã nhận</span>
              ) : (user.questProgress?.challengesCompleted || 0) >= 3 ? (
                <button onClick={() => claimQuest("quest_challs", 50)} className="text-xs font-bold text-slate-900 bg-purple-400 hover:bg-purple-500 px-3 py-1 rounded-full transition-colors flex items-center gap-1"><Zap size={12}/> Nhận thưởng</button>
              ) : (
                <span className="text-xs font-medium text-slate-500 bg-white/5 px-3 py-1 rounded-full">Chưa đạt</span>
              )}
            </div>
            {/* Quest 2 */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-50 text-sm font-medium">Đạt 150 KN trong ngày</p>
                <p className="text-slate-400 text-xs mt-1">
                  {Math.min((user.questProgress?.xpGained || 0), 150)} / 150 KN
                </p>
              </div>
              {user.questProgress?.claimed?.includes("quest_xp") ? (
                <span className="text-xs font-bold text-green-400 bg-green-400/10 px-3 py-1 rounded-full">Đã nhận</span>
              ) : (user.questProgress?.xpGained || 0) >= 150 ? (
                <button onClick={() => claimQuest("quest_xp", 100)} className="text-xs font-bold text-slate-900 bg-purple-400 hover:bg-purple-500 px-3 py-1 rounded-full transition-colors flex items-center gap-1"><Zap size={12}/> Nhận thưởng</button>
              ) : (
                <span className="text-xs font-medium text-slate-500 bg-white/5 px-3 py-1 rounded-full">Chưa đạt</span>
              )}
            </div>
          </div>
        </motion.div>

        {/* Cấp độ & Kinh nghiệm */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-slate-50 flex items-center gap-2"><Star className="text-yellow-400"/> Cấp độ {user.level}</h2>
            <div className="flex gap-1 items-center">
              <motion.span 
                 key={user.xp}
                 initial={{ scale: 1.5, color: '#facc15' }}
                 animate={{ scale: 1, color: '#2dd4bf' }}
                 transition={{ duration: 0.5 }}
                 className="text-teal-400 font-mono font-bold inline-block"
              >
                 {user.xp}
              </motion.span>
              <span className="text-teal-400 font-mono font-bold"> / {nextLevelXp} KN</span>
            </div>
          </div>
          <div className="h-4 w-full bg-white/10 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              className="h-full bg-gradient-to-r from-teal-400 to-blue-500"
            />
          </div>
        </motion.div>

        {/* Biểu đồ Sức Mạnh Kỹ Năng */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass p-6 flex flex-col items-center">
          <h2 className="text-xl font-bold text-slate-50 mb-2 flex items-center gap-2 self-start"><User className="text-purple-400"/> Biểu đồ Kỹ năng</h2>
          <div className="w-full h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid stroke="rgba(255,255,255,0.2)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 'bold' }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar name="Kỹ năng" dataKey="score" stroke="#2dd4bf" fill="#2dd4bf" fillOpacity={0.5} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-slate-400 text-xs text-center mt-2">Hoàn thành bài học để tăng chỉ số kỹ năng của bạn nhé!</p>
        </motion.div>

        {/* Thống kê học tập */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass p-6">
          <h2 className="text-xl font-bold text-slate-50 mb-6 flex items-center gap-2"><Trophy className="text-green-400"/> Thành tích</h2>
          <div className="flex gap-4">
            <div className="flex-1 bg-white/5 border border-white/10 p-4 rounded-xl text-center">
              <span className="block text-3xl font-bold text-slate-50">{user.completedChallenges.length}</span>
              <span className="text-sm text-slate-400">Bài học</span>
            </div>
            <div className="flex-1 bg-white/5 border border-white/10 p-4 rounded-xl text-center">
              <span className="block text-3xl font-bold text-slate-50">{user.badges.length}</span>
              <span className="text-sm text-slate-400">Huy hiệu</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Huy hiệu */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass p-6 mb-20 md:mb-0">
        <h2 className="text-xl font-bold text-slate-50 mb-6 flex items-center gap-2"><Medal className="text-yellow-400" /> Bộ sưu tập Huy Hiệu</h2>
        {user.badges.length === 0 ? (
          <p className="text-slate-500 italic">Bạn chưa có huy hiệu nào. Hãy hoàn thành thử thách để nhận!</p>
        ) : (
          <div className="flex flex-wrap gap-6 pt-4 pb-10">
            {user.badges.map((badge, idx) => (
              <motion.div 
                key={badge.id}
                initial={{ scale: 0, rotate: -45, opacity: 0 }}
                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 15, delay: idx * 0.1 }}
                whileHover={{ scale: 1.1, rotate: 5, y: -5 }}
                className="relative group flex flex-col items-center cursor-default"
              >
                {/* Badge Container */}
                <div className={`relative w-24 h-24 flex items-center justify-center rounded-full bg-gradient-to-br ${getBadgeColors(badge.id)} border-4 shadow-lg z-10`}>
                  
                  {/* Subtle inner ring */}
                  <div className="absolute inset-1 rounded-full border-2 border-white/30 mix-blend-overlay"></div>
                  
                  {/* Glossy reflection */}
                  <div className="absolute inset-x-2 top-2 h-1/2 bg-gradient-to-b from-white/60 to-transparent rounded-t-full z-0 opacity-70"></div>

                  {/* Icon */}
                  <div className="relative z-10 drop-shadow-md">
                     {getBadgeIcon(badge.icon)}
                  </div>

                  {/* Sparkles on hover */}
                  <Sparkles className="absolute -top-3 -right-2 text-yellow-200 w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity animate-pulse duration-700 delay-100 z-20 drop-shadow-md" />
                  <Star className="absolute -bottom-1 -left-2 text-white w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity animate-bounce duration-500 z-20 drop-shadow-md" />
                  <Star className="absolute top-4 -left-3 text-white/80 w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity animate-pulse duration-1000 delay-300 z-20" />
                </div>
                
                {/* Tooltip Content */}
                <div className="absolute top-28 opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-y-0 translate-y-2 z-20 pointer-events-none w-56 text-center">
                  <div className="bg-slate-900 border border-slate-600/50 rounded-xl p-4 shadow-2xl relative">
                     <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-slate-900 border-t border-l border-slate-600/50 rotate-45"></div>
                     <div className="relative z-10">
                       <h4 className="font-bold text-slate-50 text-sm mb-1">{badge.name}</h4>
                       <p className="text-xs text-slate-300 leading-relaxed mb-2">{badge.description}</p>
                       <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-slate-500 to-transparent opacity-50 mb-2"></div>
                       <span className="text-[10px] uppercase font-bold text-yellow-400 tracking-wider">🌟 Đã sở hữu</span>
                     </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      <button onClick={resetProgress} className="text-red-500 text-sm hover:underline" data-html2canvas-ignore>
        Xóa toàn bộ tiến trình (Chỉ dùng khi thử nghiệm)
      </button>

    </div>
  );
}
