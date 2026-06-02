import React, { useState, lazy, Suspense } from 'react';
import { AppProvider, useAppContext } from './store';
import AuthModal from './components/AuthModal';
import { LayoutDashboard, Code2, Trophy, MessageSquare, Swords, LogOut, Loader2, BookOpen, Menu, ShieldAlert, Bookmark, Medal } from 'lucide-react';
import { cn } from './lib/utils';
import { formatName } from './lib/nameUtils';
import { motion, AnimatePresence } from 'motion/react';

import BadgeToast from './components/BadgeToast';
import LevelUpModal from './components/LevelUpModal';

const Dashboard = lazy(() => import('./components/Dashboard'));
const Arena = lazy(() => import('./components/Arena'));
const LearnTab = lazy(() => import('./components/LearnTab'));
const Leaderboard = lazy(() => import('./components/Leaderboard'));
const BattleTab = lazy(() => import('./components/BattleTab'));
const NotebookTab = lazy(() => import('./components/NotebookTab'));
const BadgesTab = lazy(() => import('./components/BadgesTab'));

const AdminTab = lazy(() => import('./components/AdminTab'));

type Tab = 'dashboard' | 'learn' | 'badges' | 'notebook' | 'time_attack' | 'battle' | 'leaderboard' | 'admin';

function AppContent() {
  const { user, loading, signOut } = useAppContext();
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  if (loading) {
    return (
      <div className="h-screen text-slate-50 font-sans flex items-center justify-center">
        <div className="mesh-bg"></div>
        <Loader2 className="w-12 h-12 text-teal-400 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-screen text-slate-50 font-sans flex overflow-hidden">
        <div className="mesh-bg"></div>
        <AuthModal />
      </div>
    );
  }

  const isAdmin = user.email === 'hcmc.duyvo@gmail.com' || user.name === 'Thanh Duy Võ';

  const tabs = [
    { id: 'dashboard', label: 'Tiến độ', icon: LayoutDashboard },
    { id: 'learn', label: 'Học tập', icon: BookOpen },
    { id: 'badges', label: 'Huy hiệu', icon: Medal },
    { id: 'notebook', label: 'Sổ tay', icon: Bookmark },
    { id: 'time_attack', label: 'Đấu trường', icon: ShieldAlert },
    { id: 'battle', label: 'Thách đấu 1vs1', icon: Swords },
    { id: 'leaderboard', label: 'Xếp hạng', icon: Trophy },
  ];

  if (isAdmin) {
    tabs.push({ id: 'admin', label: 'Quản lý bài học', icon: Code2 });
  }

  return (
    <div className="h-screen text-slate-50 font-sans flex flex-col overflow-hidden">
      <div className="mesh-bg"></div>
      
      {/* Top Banner (Header) */}
      <header className="w-full bg-teal-500/10 backdrop-blur-md border-b border-white/5 text-slate-300 py-2 py-3 px-4 z-20 flex items-center justify-between shrink-0">
        <div className="flex items-center">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
            className="p-1.5 hover:bg-white/10 rounded-lg text-slate-300 transition-colors mr-3"
          >
            <Menu size={20} />
          </button>
          {!isSidebarOpen && (
             <div className="flex items-center gap-2">
                 <div className="w-8 h-8 bg-teal-400 rounded-lg flex items-center justify-center font-bold text-slate-900 text-sm">CQ</div>
             </div>
          )}
        </div>
        <span className="flex-1 text-center text-xs md:text-sm font-medium tracking-wide">
          1 sản phẩm của{' '}
          <a
            href="https://vothanhduy.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-teal-400 hover:underline"
          >
            vothanhduy.com
          </a>{' '}
          - Đang phát triển. Áp dụng nội bộ cho học viên Aptech
        </span>
        <div className="w-10"></div> {/* Spacer for symmetry */}
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar Navigation */}
        <AnimatePresence initial={false}>
          {isSidebarOpen && (
            <motion.nav 
              initial={{ width: 0, opacity: 0, margin: 0 }}
              animate={{ width: 256, opacity: 1, marginLeft: 16, marginRight: 16 }}
              exit={{ width: 0, opacity: 0, margin: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="glass flex flex-col py-6 my-4 h-[calc(100vh-6rem)] shrink-0 overflow-hidden whitespace-nowrap z-20 absolute lg:relative left-0 lg:left-auto"
            >
              <div className="flex items-center justify-between px-6 mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-teal-400 rounded-xl flex items-center justify-center font-bold text-slate-900 text-lg shadow-[0_0_20px_rgba(45,212,191,0.5)] shrink-0">
                    CQ
                  </div>
                  <span className="font-bold text-xl tracking-tight text-teal-400">CodeQuest</span>
                </div>
              </div>

              {/* User Profile Summary */}
              <div className="flex items-center gap-3 px-6 mb-8 text-left">
                <img src={user.photoURL || `https://api.dicebear.com/7.x/notionists/svg?seed=${formatName(user.name)}&backgroundColor=0d1117`} alt="avatar" className="w-12 h-12 rounded-full border-2 border-teal-400/50 shrink-0 bg-slate-900 object-cover" />
                <div className="flex flex-col flex-1 overflow-hidden">
                  <span className="font-bold text-slate-50 truncate">{formatName(user.name)}</span>
                  <span className="text-teal-400 text-sm font-mono truncate">{user.xp} EXP</span>
                </div>
              </div>

              <div className="flex flex-col gap-2 w-full px-4 flex-1 overflow-y-auto">
                {tabs.map(tab => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id as Tab);
                        // Optional: hide sidebar on mobile after selecting
                        if (window.innerWidth < 1024) setIsSidebarOpen(false);
                      }}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-xl transition-all duration-200 group relative",
                        isActive 
                          ? "bg-teal-400/20 text-teal-400 border border-teal-400/30" 
                          : "text-slate-400 hover:text-slate-50 hover:bg-white/5 border border-transparent"
                      )}
                    >
                      <Icon size={22} className={cn("transition-transform shrink-0", isActive && "scale-110")} />
                      <span className={cn("font-medium", isActive && "font-bold")}>{tab.label}</span>
                      
                      {isActive && (
                        <motion.div 
                          layoutId="active-nav-indicator"
                          className="absolute left-0 w-1 h-8 bg-teal-400 rounded-r-full"
                        />
                      )}
                    </button>
                  )
                })}
              </div>

              {/* Logout */}
              <div className="w-full px-4 mt-auto border-t border-white/10 pt-4">
                <button 
                  onClick={signOut}
                  className="flex w-full items-center gap-3 p-3 rounded-xl transition-all duration-200 text-slate-400 hover:text-red-400 hover:bg-red-400/10"
                >
                  <LogOut size={22} className="shrink-0" />
                  <span className="font-medium">Đăng xuất</span>
                </button>
              </div>
            </motion.nav>
          )}
        </AnimatePresence>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 z-10 relative h-full">
          <div className="max-w-7xl mx-auto min-h-full">
            <AnimatePresence mode="popLayout">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className="h-full"
              >
                <Suspense fallback={
                  <div className="flex h-64 items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-teal-400" />
                  </div>
                }>
                  {activeTab === 'dashboard' && <Dashboard onNavigate={(tab) => setActiveTab(tab as Tab)} />}
                  {activeTab === 'learn' && <LearnTab />}
                  {activeTab === 'badges' && <BadgesTab />}
                  {activeTab === 'notebook' && <NotebookTab />}
                  {activeTab === 'time_attack' && <Arena kind="lesson" mode="time_attack" />}
                  {activeTab === 'battle' && <BattleTab />}
                  {activeTab === 'leaderboard' && <Leaderboard />}
                  {activeTab === 'admin' && isAdmin && <AdminTab />}
                </Suspense>
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
      <BadgeToast />
      <LevelUpModal />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

