import React from 'react';
import { LogIn } from 'lucide-react';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../firebase';
import { motion } from 'motion/react';

export default function AuthModal() {

  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Lỗi đăng nhập:', error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass p-8 w-full max-w-md flex flex-col items-center justify-center text-center"
      >
        <div className="w-16 h-16 bg-teal-400 rounded-2xl flex items-center justify-center font-bold text-slate-900 text-3xl shadow-[0_0_30px_rgba(45,212,191,0.5)] mb-6">
          CQ
        </div>
        <h2 className="text-3xl font-bold text-slate-50 mb-2">CodeQuest</h2>
        <p className="text-slate-400 mb-8">Nền tảng học lập trình qua thử thách</p>

        <button 
          onClick={handleLogin}
          className="w-full flex items-center justify-center gap-3 bg-white text-slate-900 hover:bg-slate-100 font-bold py-3 px-4 rounded-xl transition"
        >
          <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
          Đăng nhập với Google
        </button>
      </motion.div>
    </div>
  );
}
