import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Bot, Home, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../firebase";
import { APP_CONFIG } from "../config";
import { ChatbotLogo } from "./Logos";

const Typewriter = ({ text, delay = 30 }: { text: string; delay?: number }) => {
  const [currentText, setCurrentText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isStarted, setIsStarted] = useState(false);

  useEffect(() => {
    const startTimeout = setTimeout(() => setIsStarted(true), 600);
    return () => clearTimeout(startTimeout);
  }, []);

  useEffect(() => {
    if (isStarted && currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setCurrentText(text.slice(0, currentIndex + 1));
        setCurrentIndex((prevIndex) => prevIndex + 1);
      }, delay);

      return () => clearTimeout(timeout);
    }
  }, [currentIndex, delay, text, isStarted]);

  return (
    <span className="inline whitespace-pre-wrap">
      {currentText}
      <motion.span
        animate={{ opacity: [1, 0] }}
        transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
        className="inline-block h-[1.1em] w-[3px] bg-blue-500 align-middle ml-0.5"
      />
    </span>
  );
};

export function Login() {
  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0a0a0a] p-6 atmosphere-bg">
      {/* Home Button */}
      <Link 
        to="/" 
        className="fixed top-6 left-6 z-[100] flex items-center gap-2 rounded-xl bg-zinc-900 border border-white/10 px-4 py-2 text-xs font-bold text-white shadow-2xl hover:bg-zinc-800 hover:scale-105 active:scale-95 transition-all group cursor-pointer"
      >
        <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
        Back to Home
      </Link>

      {/* Decorative elements */}
      <div className="absolute top-[-10%] left-[-10%] h-[40%] w-[40%] rounded-full bg-blue-600/10 blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] h-[40%] w-[40%] rounded-full bg-blue-400/10 blur-[120px]" />

      <div className="relative z-10 w-full max-w-5xl">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className={`mb-6 flex h-12 w-12 items-center justify-center rounded-2xl ${!APP_CONFIG.branding.chatbotLogo ? 'bg-blue-600' : 'bg-transparent'} text-white shadow-xl shadow-blue-600/20 overflow-hidden`}>
              <ChatbotLogo size={24} fill={!!APP_CONFIG.branding.chatbotLogo} />
            </div>
            <h1 className="font-serif text-5xl font-bold leading-[0.9] tracking-tighter text-white sm:text-8xl lg:text-9xl">
              {APP_CONFIG.name.split(' ')[0]} <br />
              <span className="text-blue-500 italic">{APP_CONFIG.name.split(' ').slice(1).join(' ')}</span>
            </h1>
            <div className="mt-6 max-w-md text-base sm:text-lg text-zinc-400 leading-relaxed min-h-[4em]">
              <Typewriter text="Experience the next generation of conversational AI. Built for speed, designed for clarity, and powered by the world's most capable models." />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="glass rounded-[40px] p-8 lg:p-12"
          >
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white">Get Started</h2>
              <p className="mt-2 text-zinc-400">Sign in to sync your chats across all your devices.</p>
            </div>

            <div className="space-y-4">
              <button
                onClick={handleGoogleLogin}
                className="group relative flex w-full cursor-pointer items-center justify-center gap-3 overflow-hidden rounded-2xl bg-white py-4 text-sm font-bold text-black transition-all hover:bg-zinc-100 active:scale-[0.98]"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Continue with Google
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-500 group-hover:translate-x-full" />
              </button>
              
              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase tracking-widest">
                  <span className="bg-[#0a0a0a] px-4 text-zinc-500 font-bold">Secure Access</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-2xl border border-white/5 bg-white/5 p-4 text-center">
                  <div className="text-xl font-bold text-white">{APP_CONFIG.version}</div>
                  <div className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">{APP_CONFIG.shortName} LITE</div>
                </div>
                <div className="rounded-2xl border border-white/5 bg-white/5 p-4 text-center">
                  <div className="text-xl font-bold text-white">∞</div>
                  <div className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Persistence</div>
                </div>
              </div>
            </div>

            <p className="mt-8 text-center text-[11px] text-zinc-500 leading-relaxed">
              By continuing, you agree to our <span className="text-zinc-300 underline cursor-pointer">Terms of Service</span> and <span className="text-zinc-300 underline cursor-pointer">Privacy Policy</span>.
            </p>
          </motion.div>
        </div>
      </div>
      
      {/* Footer info */}
      <div className="absolute bottom-8 left-8 hidden lg:block">
        <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-600">
          <span>v{APP_CONFIG.version}.0</span>
          <div className="h-1 w-1 rounded-full bg-zinc-800" />
          <span>Production Grade</span>
          <div className="h-1 w-1 rounded-full bg-zinc-800" />
          <span>Encrypted</span>
        </div>
      </div>
    </div>
  );
}
