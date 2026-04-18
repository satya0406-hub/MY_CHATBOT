import { motion } from "motion/react";
import { Bot } from "lucide-react";
import { APP_CONFIG } from "../config";
import { ChatbotLogo } from "./Logos";

export function SplashScreen() {
  return (
    <motion.div 
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#0a0a0a] overflow-hidden"
    >
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] h-[40%] w-[40%] rounded-full bg-blue-600/10 blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] h-[40%] w-[40%] rounded-full bg-blue-400/10 blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="relative z-10 flex flex-col items-center"
      >
        <motion.div 
          animate={{ 
            y: [0, -10, 0],
          }}
          transition={{ 
            duration: 4, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
          className={`mb-8 flex h-20 w-20 items-center justify-center rounded-3xl ${!APP_CONFIG.branding.chatbotLogo ? 'bg-blue-600' : 'bg-transparent'} text-white shadow-2xl shadow-blue-600/20 overflow-hidden`}
        >
          <ChatbotLogo size={40} fill={!!APP_CONFIG.branding.chatbotLogo} />
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="font-serif text-6xl font-bold tracking-tighter text-white sm:text-7xl"
        >
          {APP_CONFIG.name.split(' ')[0]} <span className="text-blue-500 italic">{APP_CONFIG.name.split(' ').slice(1).join(' ')}</span>
        </motion.h1>
      </motion.div>

      {/* Bottom Text */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-12 flex flex-col items-center gap-2"
      >
        <div className="h-px w-12 bg-white/10 mb-4" />
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-zinc-500">
          {APP_CONFIG.tagline}
        </p>
      </motion.div>

    </motion.div>
  );
}
