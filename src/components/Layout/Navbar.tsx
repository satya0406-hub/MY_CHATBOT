import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { Bot, Menu, X, MessageSquare, BookOpen, Info, Mail, Home } from "lucide-react";
import { auth } from "../../firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { APP_CONFIG } from "../../config";
import { ChatbotLogo } from "../Logos";

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      unsubscribe();
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const navLinks = [
    { name: "Home", path: "/", icon: Home },
    { name: "Blog", path: "/blog", icon: BookOpen },
    { name: "Chat Assistant", path: "/chat", icon: MessageSquare },
    { name: "About", path: "/about", icon: Info },
    { name: "Contact", path: "/contact", icon: Mail },
  ];

  return (
    <nav className={`fixed top-0 z-50 w-full transition-all duration-300 ${scrolled ? "bg-black/80 backdrop-blur-xl border-b border-white/5 py-3" : "bg-transparent py-5"}`}>
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group cursor-pointer">
            <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${!APP_CONFIG.branding.chatbotLogo ? `bg-${APP_CONFIG.branding.primaryColor}` : 'bg-transparent'} text-white shadow-2xl shadow-${APP_CONFIG.branding.primaryColor}/20 group-hover:scale-110 transition-transform overflow-hidden`}>
              <ChatbotLogo size={32} fill={!!APP_CONFIG.branding.chatbotLogo} />
            </div>
            <span className="font-serif text-xl font-bold tracking-tighter text-white">
              {APP_CONFIG.name.split(' ')[0]} <span className={`text-${APP_CONFIG.branding.primaryColor} italic`}>{APP_CONFIG.name.split(' ').slice(1).join(' ')}</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-bold uppercase tracking-widest transition-colors hover:text-white cursor-pointer ${location.pathname === link.path ? "text-white" : "text-zinc-500"}`}
              >
                {link.name}
              </Link>
            ))}
            {user ? (
              <Link to="/chat" className="flex items-center gap-2 rounded-full bg-white px-5 py-2 text-xs font-bold text-black transition-all hover:scale-105 active:scale-95 cursor-pointer">
                Go to Chat
              </Link>
            ) : (
              <Link to="/chat" className="flex items-center gap-2 rounded-full bg-blue-600 px-5 py-2 text-xs font-bold text-white transition-all hover:bg-blue-500 hover:scale-105 active:scale-95 cursor-pointer">
                Get Started
              </Link>
            )}
          </div>

          {/* Mobile Toggle */}
          <button onClick={() => setIsOpen(!isOpen)} className="md:hidden text-white p-2 cursor-pointer">
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 w-full bg-black/95 backdrop-blur-2xl border-b border-white/5 p-6 md:hidden"
          >
            <div className="flex flex-col gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-4 text-lg font-bold text-zinc-400 hover:text-white cursor-pointer"
                >
                  <link.icon size={20} className="text-blue-500" />
                  {link.name}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
