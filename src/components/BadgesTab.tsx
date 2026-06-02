import React, { useState } from 'react';
import { useAppContext } from '../store';
import { BADGES } from '../data';
import { Badge } from '../types';
import { 
  Trophy, 
  Layout, 
  Palette, 
  Code, 
  Flame, 
  Star, 
  Crown, 
  Award, 
  Lock, 
  Sparkles, 
  Medal, 
  CheckCircle2, 
  ArrowRight,
  TrendingUp,
  X,
  Target,
  Zap,
  Bookmark,
  ShieldCheck,
  Compass
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

// Helper to render badge icons with gorgeous styling
const getBadgeIcon = (iconName: string, sizeClass = "w-12 h-12") => {
  switch (iconName) {
    case 'Trophy': return <Trophy className={sizeClass} />;
    case 'Layout': return <Layout className={sizeClass} />;
    case 'Palette': return <Palette className={sizeClass} />;
    case 'Code': return <Code className={sizeClass} />;
    case 'Flame': return <Flame className={sizeClass} />;
    case 'Star': return <Star className={sizeClass} />;
    case 'Crown': return <Crown className={sizeClass} />;
    default: return <Award className={sizeClass} />;
  }
};

// Rich metallic gradients for unlocked badges
const getBadgeStyles = (id: string) => {
  switch (id) {
    case 'first_blood':
      return {
        grad: 'from-amber-300 via-yellow-400 to-orange-600',
        border: 'border-amber-200/50',
        text: 'text-amber-950',
        shadow: 'shadow-amber-500/20',
        glow: 'bg-amber-400/10',
        title: 'Dũng Sĩ Tiên Phong ⚔️',
        subtitle: 'Khai sơn phá thạch',
        perk: '+100 XP thưởng nóng & Huy hiệu đồng hành vàng',
        quote: 'Hành trình vạn dặm luôn bắt đầu từ những dòng code đầu tiên.'
      };
    case 'html_master':
      return {
        grad: 'from-orange-400 via-rose-500 to-red-700',
        border: 'border-rose-400/50',
        text: 'text-white',
        shadow: 'shadow-rose-600/30',
        glow: 'bg-rose-500/10',
        title: 'Kiến Trúc Sư Vĩ Đại 📐',
        subtitle: 'Định hình không gian Web',
        perk: 'Mở khóa Danh hiệu "Kiến Trúc Sư" & Giao diện Đỏ Lửa',
        quote: 'Làm chủ thẻ div và cấu trúc ngữ nghĩa ngữ cảnh tối cao.'
      };
    case 'css_master':
      return {
        grad: 'from-cyan-400 via-sky-500 to-blue-700',
        border: 'border-sky-350/50',
        text: 'text-white',
        shadow: 'shadow-sky-500/30',
        glow: 'bg-sky-500/10',
        title: 'Phù Thủy Sắc Màu 🔮',
        subtitle: 'Thổi linh hồn thẩm mỹ',
        perk: 'Biểu tượng Hào quang xanh rực và Giao diện Ma Thuật',
        quote: 'Khiển vạn vật canh lề, bẻ cong khối hộp và thấu hiểu Flexbox thế gian.'
      };
    case 'js_ninja':
      return {
        grad: 'from-yellow-300 via-amber-400 to-yellow-600',
        border: 'border-yellow-200/50',
        text: 'text-slate-900',
        shadow: 'shadow-amber-400/20',
        glow: 'bg-yellow-400/10',
        title: 'Ninja Thuật Toán ⚡',
        subtitle: 'Bậc thầy tái sinh mã nguồn',
        perk: 'Sở hữu Viền bài tập Hoàng Kim & Tước hiệu "JS Ninja"',
        quote: 'Chạy đua với thời gian, thuần hóa callbacks và nắm giữ trục không đồng bộ.'
      };
    case 'streak_7':
      return {
        grad: 'from-orange-400 via-orange-500 to-red-600',
        border: 'border-orange-350/50',
        text: 'text-white',
        shadow: 'shadow-orange-500/20',
        glow: 'bg-orange-500/10',
        title: 'Ngọn Lửa Kiên Định 🔥',
        subtitle: 'Chiến sĩ rèn giáp',
        perk: 'Tăng 5% XP nhận được khi giải bài trong ngày',
        quote: '7 ngày rèn luyện bền bỉ là bước đệm biến thói quen thành phản xạ thép.'
      };
    case 'streak_30':
      return {
        grad: 'from-yellow-300 via-amber-500 to-amber-700',
        border: 'border-yellow-200/50',
        text: 'text-slate-900',
        shadow: 'shadow-yellow-500/20',
        glow: 'bg-yellow-500/10',
        title: 'Kỷ Luật Thép 🛡️',
        subtitle: 'Kẻ chinh phục bền bỉ',
        perk: 'Hồi phục Streak miễn phí (Tặng 1 Khe Đóng Băng miễn phí)',
        quote: 'Thành tựu vĩ đại không đến từ sự bộc phát ngẫu nhiên, mà đến từ sự lặp lại kiên trì.'
      };
    case 'streak_100':
      return {
        grad: 'from-fuchsia-400 via-purple-500 to-indigo-600',
        border: 'border-fuchsia-350/50',
        text: 'text-white',
        shadow: 'shadow-fuchsia-500/35',
        glow: 'bg-fuchsia-500/15',
        title: 'Đại Huyền Thoại Toàn Năng 👑',
        subtitle: 'Bất biến giữa vạn biến',
        perk: 'Khắc tên lên bảng Vinh Danh Toàn Thư & Icon Vương Miện Thần',
        quote: 'Trăm ngày tôi luyện, vượt qua thử thách giới hạn để chạm tới đỉnh cao vĩnh hằng.'
      };
    default:
      return {
        grad: 'from-slate-300 via-slate-400 to-slate-500',
        border: 'border-slate-200/50',
        text: 'text-white',
        shadow: 'shadow-slate-500/20',
        glow: 'bg-slate-500/10',
        title: 'Huy Chương Vinh Dự 🏅',
        subtitle: 'Chiến thắng đặc biệt',
        perk: 'Học hỏi thêm thật nhiều thử thách hào hùng',
        quote: 'Vượt qua bài tập tự chọn cực đỉnh.'
      };
  }
};

// Requirement for locked/unlocked badges
const getBadgeRequirement = (id: string) => {
  switch (id) {
    case 'first_blood':
      return 'Hoàn thành bất kỳ 1 bài học hoặc bài thực hành đầu tiên trong hệ thống.';
    case 'html_master':
      return 'Hoàn thành toàn bộ lộ trình HTML (Bao gồm Doctype, các thẻ hiển thị, biểu mẫu Form, thẻ hình ảnh và cấu trúc bảng học đầu đời).';
    case 'css_master':
      return 'Chinh phục toàn bộ dải ngân hà CSS (Thuộc lòng định dạng màu sắc, thuộc tính flexbox kì diệu, bo góc và bẻ viền vạn năng).';
    case 'js_ninja':
      return 'Càn quét xuất sắc dòng lệnh JavaScript cổ xưa (Xử lý chuỗi dữ liệu rậm rạp, mảng phức tạp, Async/Await vượt thời gian).';
    case 'streak_7':
      return 'Học tập không gián đoạn liên tục 7 ngày (Thắp sáng ngọn lửa rèn luyện đầu tiên).';
    case 'streak_30':
      return 'Theo đuổi ngọn lửa bền bỉ rực cháy trong 30 ngày vàng ngọc liên hoàn.';
    case 'streak_100':
      return 'Bất bại tuyệt đối với 100 ngày thắp sáng đèn luyện đêm ngày, đạt đỉnh vinh quang.';
    default:
      return 'Luyện tập chăm chỉ hàng ngày và đạt kỳ tích.';
  }
};

// Collector rank system base on badges count
const getCollectorRank = (earnedCount: number) => {
  if (earnedCount === 0) {
    return {
      title: 'Tân Binh Học Việc 🪵',
      next: 'Kiếm chiếc huy hiệu đầu tiên để thăng lên Học Giả Giao Diện!',
      color: 'text-stone-400',
      bg: 'bg-stone-500/10 border-stone-500/20',
      req: 1
    };
  }
  if (earnedCount <= 2) {
    return {
      title: 'Học Giả Giao Diện 🎖️',
      next: 'Tích lũy 3 huy hiệu để đột phá lên Bậc Thầy Sưu Tầm!',
      color: 'text-cyan-400',
      bg: 'bg-cyan-500/10 border-cyan-500/20',
      req: 3
    };
  }
  if (earnedCount <= 4) {
    return {
      title: 'Bậc Thầy Sưu Tầm 🏆',
      next: 'Chỉ còn một chút nữa để chạm tới Ngự Bảo Thần Tướng (5 huy hiệu)!',
      color: 'text-amber-400',
      bg: 'bg-amber-500/10 border-amber-500/20',
      req: 5
    };
  }
  if (earnedCount <= 6) {
    return {
      title: 'Chiến Thần Chinh Phục 💎',
      next: 'Lấy chiếc huy hiệu vương miện cuối cùng để trở thành Đạo Sĩ Toàn Năng Huyền Thoại!',
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10 border-emerald-500/20',
      req: 7
    };
  }
  return {
    title: 'Đại Đạo Sĩ Toàn Năng 👑',
    next: 'Tuyệt trần! Bạn đã ngự trị tại đỉnh vinh quang của bộ sưu tập huy hiệu!',
    color: 'text-fuchsia-400',
    bg: 'bg-fuchsia-500/10 border-fuchsia-500/20',
    req: 7
  };
};

export default function BadgesTab() {
  const { user } = useAppContext();
  const [filter, setFilter] = useState<'all' | 'earned' | 'locked'>('all');
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);

  const allBadges = Object.values(BADGES);
  const earnedBadgeIds = (user.badges || []).map(b => b.id);
  const totalBadgesCount = allBadges.length;
  const earnedBadgesCount = earnedBadgeIds.length;
  const progressPercentage = Math.round((earnedBadgesCount / totalBadgesCount) * 100);

  const rankInfo = getCollectorRank(earnedBadgesCount);

  const filteredBadges = allBadges.filter(badge => {
    const isEarned = earnedBadgeIds.includes(badge.id);
    if (filter === 'earned') return isEarned;
    if (filter === 'locked') return !isEarned;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Upper Brand Showcase */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass p-6 md:p-8 border-teal-500/20 relative overflow-hidden shadow-[0_0_35px_rgba(20,184,166,0.05)] bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950"
      >
        {/* Colorful ambient blobs */}
        <div className="absolute -right-12 -top-12 w-64 h-64 bg-teal-500/10 blur-3xl rounded-full pointer-events-none animate-pulse" />
        <div className="absolute right-1/4 -bottom-16 w-80 h-32 bg-purple-600/10 blur-3xl rounded-full pointer-events-none" />
        <div className="absolute left-10 top-1/2 -translate-y-1/2 w-40 h-40 bg-pink-500/5 blur-3xl rounded-full pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          <div className="lg:col-span-7 space-y-3.5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-br from-amber-400 to-yellow-600 rounded-2xl border border-yellow-300/40 text-slate-950 shadow-lg shadow-yellow-500/10">
                <Crown className="w-7 h-7 text-white animate-pulse" />
              </div>
              <div>
                <span className="text-xs text-teal-400 font-extrabold uppercase tracking-widest block font-mono">Hệ Thống Thành Tựu</span>
                <h1 className="text-2xl md:text-3.5xl font-extrabold tracking-tight text-white font-sans [text-shadow:0_2px_10px_rgba(0,0,0,0.5)]">
                  Đại Điện Vinh Danh Học Giả
                </h1>
              </div>
            </div>
            <p className="text-slate-300 leading-relaxed text-sm md:text-base max-w-2xl">
              Nơi ghi dấu từng bước tiến phi thường của bạn. Mỗi huy hiệu đều sở hữu một chân lý, dải màu hào quang đặc trưng và sức mạnh truyền cảm hứng bất tận. Hãy chinh phục tất cả để đạt tước vị tối thượng!
            </p>

            {/* General tips */}
            <div className="flex flex-wrap gap-2.5 pt-2">
              <div className="flex items-center gap-1.5 text-xs text-teal-300 bg-teal-500/10 border border-teal-500/20 px-3 py-1.5 rounded-xl font-medium">
                <Zap className="w-3.5 h-3.5 animate-pulse text-amber-300" /> +XP Thưởng Đỉnh Cao
              </div>
              <div className="flex items-center gap-1.5 text-xs text-purple-300 bg-purple-500/10 border border-purple-500/20 px-3 py-1.5 rounded-xl font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-purple-400" /> Tôn Vinh Danh Hiệu Độc Quyền
              </div>
            </div>
          </div>

          {/* User Achievement Rank Card */}
          <div className="lg:col-span-5 w-full">
            <div className="bg-slate-950/60 backdrop-blur-md border border-white/10 hover:border-teal-400/30 p-5 rounded-2xl transition-all duration-300 shadow-2xl flex flex-col justify-between">
              
              <div className="flex justify-between items-center pb-3 border-b border-white/5 mb-3.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">Cấp Độ Sưu Tập:</span>
                </div>
                <div className={cn("text-xs font-mono font-extrabold px-3 py-1 rounded-full border shadow-inner", rankInfo.bg, rankInfo.color)}>
                  {rankInfo.title}
                </div>
              </div>

              {/* Stats Counters */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-white/5 p-3 rounded-xl border border-white/5 hover:bg-white/10 transition-colors text-center">
                  <span className="text-xs text-slate-400 block mb-0.5">Đã Thắp Sáng</span>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-2xl font-extrabold text-emerald-400 font-mono">{earnedBadgesCount}</span>
                    <span className="text-slate-500 font-mono">/ {totalBadgesCount}</span>
                  </div>
                </div>

                <div className="bg-white/5 p-3 rounded-xl border border-white/5 hover:bg-white/10 transition-colors text-center">
                  <span className="text-xs text-slate-400 block mb-0.5">Tỷ Lệ Sở Hữu</span>
                  <span className="text-2xl font-extrabold text-teal-400 font-mono">{progressPercentage}%</span>
                </div>
              </div>

              {/* Progress bar with neon glow */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-slate-400">
                  <span className="truncate max-w-[80%] text-[11px] font-medium text-slate-300 italic">{rankInfo.next}</span>
                  {earnedBadgesCount < totalBadgesCount && (
                    <span className="font-mono text-teal-300">{earnedBadgesCount}/{rankInfo.req}</span>
                  )}
                </div>
                <div className="w-full h-3 bg-slate-900 border border-white/5 rounded-full overflow-hidden relative shadow-inner">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercentage}%` }}
                    transition={{ duration: 1.2, ease: 'easeOut' }}
                    className="h-full bg-gradient-to-r from-teal-400 via-emerald-500 to-indigo-500 rounded-full relative"
                  >
                    {/* Pulsing light effect */}
                    <div className="absolute inset-0 bg-white/20 animate-pulse pointer-events-none" />
                  </motion.div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </motion.div>

      {/* Navigation Filtering Section */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-2.5 bg-slate-900/40 rounded-2xl border border-white/5">
        <div className="flex bg-slate-950 p-1.5 rounded-xl border border-white/10 self-start">
          <button
            onClick={() => setFilter('all')}
            className={cn(
              "px-4 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all duration-250",
              filter === 'all' 
                ? "bg-gradient-to-r from-slate-800 to-slate-700 text-teal-300 border border-white/5 shadow-lg" 
                : "text-slate-400 hover:text-slate-200"
            )}
          >
            Tất cả ({totalBadgesCount})
          </button>
          
          <button
            onClick={() => setFilter('earned')}
            className={cn(
              "px-4 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all duration-250 flex items-center gap-1.5",
              filter === 'earned' 
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/20 shadow-md" 
                : "text-slate-400 hover:text-emerald-400"
            )}
          >
            Đã Thắp Sáng ({earnedBadgesCount})
          </button>
          
          <button
            onClick={() => setFilter('locked')}
            className={cn(
              "px-4 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all duration-250 flex items-center gap-1.5",
              filter === 'locked' 
                ? "bg-purple-500/20 text-purple-300 border border-purple-500/20 shadow-md" 
                : "text-slate-400 hover:text-purple-300"
            )}
          >
            Chưa Đạt ({totalBadgesCount - earnedBadgesCount})
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400 font-medium px-2 py-1 self-start sm:self-center">
          <Compass className="w-4 h-4 text-rose-400 animate-spin" style={{ animationDuration: '6s' }} />
          <span>Click vào từng chiếc kỷ vật để khám phá thần thoại & kỹ năng vinh quang</span>
        </div>
      </div>

      {/* Grid of Badges */}
      <motion.div 
        layout
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      >
        <AnimatePresence mode="popLayout">
          {filteredBadges.map((badge, idx) => {
            const isEarned = earnedBadgeIds.includes(badge.id);
            const style = getBadgeStyles(badge.id);
            
            return (
              <motion.div
                layout
                key={badge.id}
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                transition={{ type: "spring", damping: 20, stiffness: 200, delay: idx * 0.04 }}
                whileHover={{ y: -8, scale: 1.03 }}
                onClick={() => setSelectedBadge(badge)}
                className={cn(
                  "p-6 rounded-2xl flex flex-col items-center text-center cursor-pointer relative border transition-all duration-500 overflow-hidden group shadow-lg",
                  isEarned 
                    ? `border-white/10 hover:border-teal-400/40 bg-slate-900/50 hover:shadow-[0_15px_30px_rgba(20,184,166,0.15)] animate-card-float`
                    : "border-slate-900/60 bg-slate-950/40 hover:border-purple-500/30 shadow-none saturate-[0.8] hover:shadow-[0_10px_20px_rgba(168,85,247,0.05)]"
                )}
                style={{ animationDelay: `${idx * 0.4}s` }}
              >
                {/* Visual Glow Core - Unlocked has colorful halo, locked has dark violet core */}
                {isEarned ? (
                  <div className={cn("absolute -top-12 -left-12 w-32 h-32 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none", style.glow)} />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-purple-950/10 pointer-events-none" />
                )}

                {/* Status Badge in corner */}
                <div className="absolute top-4 right-4 z-20">
                  {isEarned ? (
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 border border-emerald-400/40 shadow-lg text-emerald-400 animate-pulse">
                      <CheckCircle2 className="w-4 h-4" />
                    </span>
                  ) : (
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 border border-white/5 shadow-inner text-slate-500">
                      <Lock className="w-3.5 h-3.5 text-slate-500" />
                    </span>
                  )}
                </div>

                {/* Badge Medal Visual Design */}
                <div className="relative mb-6 mt-2 flex justify-center items-center">
                  
                  {/* Holographic glowing ring around the medal if earned */}
                  {isEarned && (
                    <div className="absolute -inset-4 rounded-full bg-teal-500/20 blur-md opacity-30 group-hover:scale-125 transition-transform duration-500 -z-10" />
                  )}

                  {/* Medal frame */}
                  <div className={cn(
                    "w-22 h-22 rounded-full flex items-center justify-center border-4 shadow-2xl transition-all duration-500 relative z-10 overflow-hidden",
                    isEarned 
                      ? `bg-gradient-to-br ${style.grad} ${style.border} scale-100 group-hover:scale-110 group-hover:rotate-[12deg] text-slate-950` 
                      : "bg-slate-950 border-slate-800 text-slate-600 grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-60 group-hover:scale-105"
                  )}>
                    {/* Metallic gloss diagonal sweep (Light Reflection Effect) */}
                    {isEarned && (
                      <div className="absolute inset-0 w-full h-full bg-transparent overflow-hidden pointer-events-none rounded-full">
                        <div className="w-[40%] h-full bg-gradient-to-r from-transparent via-white/40 to-transparent -skew-x-12 animate-sweep absolute" />
                      </div>
                    )}

                    {/* Classic medallion inner boundary */}
                    <div className="absolute inset-1 rounded-full border border-black/10 flex items-center justify-center">
                      {getBadgeIcon(badge.icon, "w-10 h-10 drop-shadow-[0_2px_4px_rgba(0,0,0,0.35)]")}
                    </div>
                  </div>

                  {/* Unlocked background shiny elements */}
                  {isEarned && (
                    <>
                      <Sparkles className="absolute -top-3 -right-2 text-yellow-300 w-6 h-6 opacity-90 animate-pulse" />
                      <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-amber-400 to-teal-400 blur-lg -z-20 opacity-15 animate-slow-spin" />
                    </>
                  )}
                </div>

                {/* Badge Metadata Labels */}
                <div className="space-y-2 relative z-10 flex-grow flex flex-col justify-between w-full">
                  <div>
                    <h3 className={cn(
                      "font-extrabold text-base tracking-tight transition-colors duration-300",
                      isEarned ? "text-slate-100 group-hover:text-teal-300" : "text-slate-400"
                    )}>
                      {badge.name}
                    </h3>
                    
                    {/* Interactive Lore Subtitle for Unlocked, mysterious placeholder for Locked */}
                    <p className={cn(
                      "text-[11px] font-semibold italic mt-0.5 uppercase tracking-wide",
                      isEarned ? "text-teal-400" : "text-purple-400"
                    )}>
                      {isEarned ? style.subtitle : "Kỷ vật đang ẩn giấu"}
                    </p>

                    <p className="text-slate-300 text-xs mt-2.5 leading-relaxed line-clamp-3">
                      {isEarned ? badge.description : `??? - Đóng khóa tinh hoa để giải mã sức mạnh.`}
                    </p>
                  </div>

                  {/* Action/Loot Button in bottom */}
                  <div className="pt-4 mt-auto">
                    {isEarned ? (
                      <div className="inline-flex items-center gap-1 text-[10px] uppercase font-black tracking-widest text-emerald-400 bg-emerald-500/15 py-1.5 px-3.5 rounded-xl border border-emerald-500/30 group-hover:bg-emerald-500/25 transition-all">
                        ĐÃ THẮP SÁNG ⚡
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-widest text-purple-400 bg-purple-500/10 hover:bg-purple-500/20 py-1.5 px-3.5 rounded-xl border border-purple-500/20 group-hover:border-purple-400/40 transition-all font-mono [word-spacing:1px]">
                        XEM BÍ KIẾP <ArrowRight className="w-3 h-3 text-purple-400 group-hover:translate-x-1 transition-transform" />
                      </div>
                    )}
                  </div>
                </div>

              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>

      {/* Extreme Detail Celebration Modal */}
      <AnimatePresence>
        {selectedBadge && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Dark background blur */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedBadge(null)}
              className="absolute inset-0 bg-slate-950/85 backdrop-blur-md"
            />

            {/* Modal glass box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 22, stiffness: 300 }}
              className="glass max-w-lg w-full p-6 md:p-8 border-teal-400/20 relative z-10 overflow-hidden text-left bg-slate-950 shadow-[0_0_60px_rgba(20,184,166,0.1)] rounded-3xl"
            >
              {/* Escape Button with hover highlight */}
              <button 
                onClick={() => setSelectedBadge(null)}
                className="absolute top-5 right-5 text-slate-400 hover:text-slate-100 p-1.5 hover:bg-white/10 rounded-full transition-all duration-200"
                title="Đóng cửa sổ"
              >
                <X className="w-5.5 h-5.5" />
              </button>

              {/* Colorful decorative corner splashes */}
              <div className="absolute -right-16 -top-16 w-48 h-48 bg-teal-400/10 blur-3xl rounded-full" />
              <div className="absolute -left-16 -bottom-16 w-52 h-52 bg-indigo-500/10 blur-3xl rounded-full" />

              {/* Large celebratory layout */}
              <div className="flex flex-col items-center text-center mt-3">
                
                {/* Beautiful larger badge preview */}
                <div className="relative mb-6">
                  {earnedBadgeIds.includes(selectedBadge.id) ? (
                    <>
                      {/* Golden spinning shield behind medal */}
                      <div className="absolute -inset-6 rounded-full bg-yellow-400/10 blur-xl opacity-60 animate-pulse" />
                      <div className="absolute -inset-3 rounded-full border border-dashed border-teal-400/35 animate-slow-spin" />
                      
                      {/* Large premium card medal holding gradient background states */}
                      <div className={`w-36 h-36 rounded-full flex items-center justify-center border-4 shadow-2xl bg-gradient-to-br ${getBadgeStyles(selectedBadge.id).grad} ${getBadgeStyles(selectedBadge.id).border} z-10 relative`}>
                        <div className="absolute inset-x-2.5 top-1.5 h-[42%] bg-gradient-to-b from-white/40 to-transparent rounded-t-full opacity-60 pointer-events-none" />
                        {getBadgeIcon(selectedBadge.icon, "w-16 h-16 drop-shadow-[0_4px_6px_rgba(0,0,0,0.45)]")}
                      </div>
                      
                      <Sparkles className="absolute -top-3 -right-3 text-yellow-300 w-10 h-10 animate-bounce" style={{ animationDuration: '4s' }} />
                      <Star className="absolute -bottom-2 -left-2 text-sky-400 w-8 h-8 animate-pulse" />
                    </>
                  ) : (
                    <div className="relative">
                      <div className="w-36 h-36 rounded-full flex items-center justify-center border-4 border-dashed border-slate-700 bg-slate-900 shadow-inner text-slate-600 relative z-10">
                        <Lock className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 text-purple-400/30" />
                        <div className="opacity-20 grayscale">
                          {getBadgeIcon(selectedBadge.icon, "w-16 h-16")}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Badge Name & Legendary Titles */}
                <h2 className="text-2xl md:text-3xl font-black text-white leading-tight">
                  {selectedBadge.name}
                </h2>
                
                <div className="mt-2.5 flex items-center gap-2">
                  {earnedBadgeIds.includes(selectedBadge.id) ? (
                    <>
                      <span className="text-xs font-bold leading-none bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 px-3 py-1.5 rounded-full flex items-center gap-1 shadow-inner font-mono tracking-wider">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Thắp Sáng Vinh Quang
                      </span>
                      <span className="text-xs bg-amber-400/10 text-amber-300 border border-amber-400/25 px-3 py-1.5 rounded-full font-mono font-bold">
                        {getBadgeStyles(selectedBadge.id).title}
                      </span>
                    </>
                  ) : (
                    <span className="text-xs font-semibold leading-none bg-purple-500/15 text-purple-300 border border-purple-500/30 px-4 py-1.5 rounded-full flex items-center gap-1.5 font-mono tracking-wider">
                      <Lock className="w-3.5 h-3.5" /> Báu Vật Đang Bị Phong Ấn
                    </span>
                  )}
                </div>

                {/* Quote details */}
                {earnedBadgeIds.includes(selectedBadge.id) && (
                  <p className="text-slate-400 text-xs italic mt-4 px-6 text-center max-w-sm">
                    "{getBadgeStyles(selectedBadge.id).quote}"
                  </p>
                )}

                <div className="w-full h-px bg-white/10 my-5" />

                {/* Descriptive segments */}
                <div className="w-full space-y-4">
                  
                  {/* Descriptions block */}
                  <div className="text-left">
                    <span className="text-[10px] uppercase font-black tracking-widest text-slate-500 block mb-1.5">
                      Sức mạnh / Giai thoại:
                    </span>
                    <div className="p-3.5 bg-white/5 border border-white/5 rounded-2xl">
                      <p className="text-slate-300 text-xs md:text-sm leading-relaxed">
                        {selectedBadge.description}
                      </p>
                    </div>
                  </div>

                  {/* Requirements / Quest block */}
                  <div className="text-left">
                    <span className="text-[10px] uppercase font-black tracking-widest text-slate-500 block mb-1.5 flex items-center gap-1">
                      🎯 Thể Lệ Tôi Luyện:
                    </span>
                    <div className="p-3.5 bg-teal-400/5 hover:bg-teal-400/10 border border-teal-500/20 text-teal-300 text-xs md:text-sm font-medium leading-relaxed rounded-2xl transition-colors">
                      {getBadgeRequirement(selectedBadge.id)}
                    </div>
                  </div>

                  {/* Exclusive Rewards Perk block */}
                  {earnedBadgeIds.includes(selectedBadge.id) && (
                    <div className="text-left">
                      <span className="text-[10px] uppercase font-black tracking-widest text-slate-500 block mb-1.5 flex items-center gap-1">
                        🎁 Đặc quyền chiến phẩm đã nhận:
                      </span>
                      <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-bold leading-normal rounded-2xl rounded-tl-none">
                        {getBadgeStyles(selectedBadge.id).perk}
                      </div>
                    </div>
                  )}

                </div>

                {/* Confirm/Accept Button with visual pulse */}
                <button
                  onClick={() => setSelectedBadge(null)}
                  className="mt-7 w-full py-3.5 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-black rounded-xl text-sm transition-all duration-200 shadow-lg shadow-teal-500/10 hover:shadow-teal-400/25 hover:scale-[1.01] active:scale-[0.99] uppercase tracking-wider"
                >
                  {earnedBadgeIds.includes(selectedBadge.id) ? "Nhận vinh quang" : "Ta hiểu rồi, bắt đầu chiến tập!"}
                </button>
                
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
