import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { 
  MessageSquare, 
  Plus, 
  Settings, 
  Trash2, 
  Bot, 
  LogOut, 
  User as UserIcon, 
  Info, 
  Menu, 
  Share2, 
  Key, 
  CheckCircle2, 
  X, 
  History, 
  UserCircle, 
  Mail, 
  Award, 
  Zap, 
  ShieldCheck, 
  Star,
  ExternalLink,
  MoreVertical,
  Trash,
  Home,
  ArrowLeft
} from "lucide-react";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  serverTimestamp, 
  doc, 
  setDoc,
  deleteDoc,
  writeBatch,
  getDocs,
  increment,
  arrayUnion
} from "firebase/firestore";
import { ChatMessage } from "../components/ChatMessage";
import { ChatInput } from "../components/ChatInput";
import { Login } from "../components/Login";
import { auth, db } from "../firebase";
import { Message, streamChat } from "../services/gemini";
import { getAccessToken, QuotaExceededError, UnauthorizedError, GlobalQuotaExceededError } from "../services/auth-utils";
import { APP_CONFIG } from "../config";
import { BadgeLogo, ChatbotLogo } from "../components/Logos";

const TrashIcon = Trash2;

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface ChatSession {
  id: string;
  title: string;
  createdAt: any;
  updatedAt: any;
  userId: string;
}

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
    <span className="inline whitespace-pre-wrap min-h-[1.5em]">
      {currentText}
      <motion.span
        animate={{ opacity: [1, 0] }}
        transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
        className="inline-block h-[1.1em] w-[3px] bg-blue-500 align-middle ml-0.5"
      />
    </span>
  );
};

const ChatAssistant = () => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(localStorage.getItem("gemini_access_token"));
  const [showQuotaError, setShowQuotaError] = useState(false);
  const [showGlobalQuotaError, setShowGlobalQuotaError] = useState(false);
  const [chats, setChats] = useState<ChatSession[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [isHistoryExpanded, setIsHistoryExpanded] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; chatId: string } | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleClickOutside = () => setContextMenu(null);
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, []);

  const handleContextMenu = (e: React.MouseEvent, chatId: string) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, chatId });
  };

  const handleTouchStart = (chatId: string) => {
    longPressTimer.current = setTimeout(() => {
      // For mobile, we might want to show the menu in the center or near the touch
      setContextMenu({ x: window.innerWidth / 2 - 80, y: window.innerHeight / 2 - 50, chatId });
    }, 600);
  };

  const handleTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
  };

  const handleShare = async (chatId: string) => {
    const chat = chats.find(c => c.id === chatId);
    if (!chat) return;
    
    const shareText = `Check out my conversation on ${APP_CONFIG.name}: ${chat.title}`;
    const shareUrl = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `${APP_CONFIG.name} Conversation`,
          text: shareText,
          url: shareUrl,
        });
      } catch (error) {
        console.error("Error sharing:", error);
      }
    } else {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      } catch (error) {
        console.error("Error copying to clipboard:", error);
      }
    }
  };

  const deleteAllChats = async () => {
    if (!user) return;
    setIsDeleting(true);
    try {
      const q = query(collection(db, "chats"), where("userId", "==", user.uid));
      const snapshot = await getDocs(q);
      
      // We delete each chat one by one to ensure messages are also deleted
      // This is safer than a single batch that might exceed limits
      for (const chatDoc of snapshot.docs) {
        await deleteChat(chatDoc.id);
      }
      
      setActiveChatId(null);
      setMessages([]);
      setShowDeleteAllConfirm(false);
    } catch (error) {
      console.error("Error deleting all chats:", error);
    } finally {
      setIsDeleting(false);
    }
  };
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAuthReady(true);
      if (currentUser) {
        setDoc(doc(db, "users", currentUser.uid), {
          uid: currentUser.uid,
          email: currentUser.email,
          displayName: currentUser.displayName,
          photoURL: currentUser.photoURL,
          lastLogin: serverTimestamp(),
        }, { merge: true });
      }
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!user) {
      setUserData(null);
      return;
    }
    return onSnapshot(doc(db, "users", user.uid), (doc) => {
      setUserData(doc.data());
    });
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "chats"), where("userId", "==", user.uid), orderBy("updatedAt", "desc"));
    return onSnapshot(q, (snapshot) => {
      setChats(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as ChatSession[]);
    }, (error) => {
      if (error.code !== 'permission-denied') {
        console.error("Chats listener error:", error);
      }
    });
  }, [user]);

  useEffect(() => {
    if (!activeChatId) {
      setMessages([]);
      return;
    }
    const q = query(collection(db, "chats", activeChatId, "messages"), orderBy("timestamp", "asc"));
    return onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({
        id: doc.id,
        role: doc.data().role,
        content: doc.data().content,
        timestamp: doc.data().timestamp?.toDate() || new Date(),
      })) as Message[]);
    }, (error) => {
      if (error.code !== 'permission-denied') {
        console.error("Messages listener error:", error);
      }
    });
  }, [activeChatId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (content: string) => {
    if (!user) return;
    
    // We no longer require accessToken immediately. 
    // We try the global key first, or use accessToken if it exists.
    
    let chatId = activeChatId;
    
    // Create new abort controller for this request
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      setError(null);
      if (!chatId) {
        const docRef = await addDoc(collection(db, "chats"), {
          userId: user.uid,
          title: content.slice(0, 30) + "...",
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        chatId = docRef.id;
        setActiveChatId(chatId);
      }
      const messagesPath = `chats/${chatId}/messages`;
      await addDoc(collection(db, messagesPath), { role: "user", content, timestamp: serverTimestamp() });
      
      // Track milestones and history
      const currentCount = userData?.messageCount || 0;
      const newCount = currentCount + 1;
      
      // New logic: Every 20 messages = 1 Badge
      const BADGE_INTERVAL = 20;
      const earnedNewBadge = newCount % BADGE_INTERVAL === 0;

      const userUpdate: any = { 
        messageCount: increment(1) 
      };

      if (earnedNewBadge) {
        const chatTitle = chats.find(c => c.id === chatId)?.title || content.slice(0, 30);
        const badgeLevel = Math.floor(newCount / BADGE_INTERVAL);
        const badgeNames = ["Novice", "Inquisitive", "Expert", "AI Master", "Elite"];
        const badgeName = badgeLevel <= 4 ? badgeNames[badgeLevel - 1] : `Elite ${badgeLevel}`;
        
        userUpdate.badgeHistory = arrayUnion({
          badgeName: badgeName,
          timestamp: new Date().toISOString(),
          chatTitle: chatTitle,
          chatId: chatId
        });
      }

      await setDoc(doc(db, "users", user.uid), userUpdate, { merge: true });

      const chatUpdate: any = { updatedAt: serverTimestamp() };
      if (messages.length === 0) {
        chatUpdate.title = content.slice(0, 40);
      }
      await setDoc(doc(db, "chats", chatId), chatUpdate, { merge: true });
      
      setIsLoading(true);
      const history = messages.map(m => ({ role: m.role, content: m.content }));
      history.push({ role: "user", content });
      
      let fullContent = "";
      const stream = streamChat(history as any, accessToken, controller.signal);
      const aiMsgRef = await addDoc(collection(db, messagesPath), { role: "model", content: "", timestamp: serverTimestamp() });
      
      // Add the message locally immediately to avoid flickering when onSnapshot fires
      const tempId = aiMsgRef.id;
      setMessages(prev => {
        const exists = prev.find(m => m.id === tempId);
        if (exists) return prev;
        return [...prev, { id: tempId, role: "model", content: "", timestamp: new Date() } as Message];
      });

      for await (const chunk of stream) {
        fullContent += chunk;
        setMessages(prev => prev.map(m => m.id === tempId ? { ...m, content: fullContent } : m));
      }
      await setDoc(aiMsgRef, { content: fullContent }, { merge: true });
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log("Chat generation cancelled by user");
      } else if (error instanceof QuotaExceededError) {
        setShowQuotaError(true);
      } else if (error instanceof GlobalQuotaExceededError) {
        setShowGlobalQuotaError(true);
      } else if (error instanceof UnauthorizedError) {
        setAccessToken(null);
        localStorage.removeItem("gemini_access_token");
        setError("Your session has expired. Please click 'Connect Gemini' to continue.");
      } else {
        console.error("Chat error:", error);
        setError(error.message || "An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  const handleFirestoreError = (error: any, operation: string, path: string) => {
    if (error.code === 'permission-denied') {
      console.error(`Permission denied for ${operation} on ${path}. Check security rules.`);
    } else {
      console.error(`Firestore error during ${operation} on ${path}:`, error);
    }
  };

  const handleConnectGemini = async () => {
    const clientId = (import.meta as any).env.VITE_CLIENT_ID;
    
    if (!clientId || clientId === "YOUR_GOOGLE_OAUTH_CLIENT_ID") {
      setError("OAuth Client ID is not configured. Please add VITE_CLIENT_ID to your environment variables.");
      return;
    }

    setIsConnecting(true);
    try {
      setError(null);
      const token = await getAccessToken();
      setAccessToken(token);
      localStorage.setItem("gemini_access_token", token);
    } catch (err: any) {
      setError("Failed to connect Gemini. Please try again.");
    } finally {
      setIsConnecting(false);
    }
  };

  const deleteChat = async (id: string) => {
    setIsDeleting(true);
    try {
      // Delete messages first
      const messagesRef = collection(db, "chats", id, "messages");
      const messagesSnapshot = await getDocs(messagesRef).catch(err => {
        handleFirestoreError(err, "list", `chats/${id}/messages`);
        throw err;
      });
      
      const batch = writeBatch(db);
      messagesSnapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });
      
      // Delete the chat document
      batch.delete(doc(db, "chats", id));
      
      await batch.commit().catch(err => {
        handleFirestoreError(err, "batch-delete", `chats/${id}`);
        throw err;
      });
      
      if (activeChatId === id) setActiveChatId(null);
      setShowDeleteConfirm(null);
    } catch (error) {
      // Error already logged by handleFirestoreError
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isAuthReady) return <div className="flex h-screen items-center justify-center"><ChatbotLogo className="animate-spin text-blue-600" /></div>;
  if (!user) return <Login />;

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#050505]">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-md md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-[70] w-[85vw] max-w-[320px] flex-col border-r border-white/5 bg-[#0a0a0a] transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1) md:relative md:flex md:translate-x-0 ${isMobileMenuOpen ? "translate-x-0 shadow-[20px_0_50px_rgba(0,0,0,0.5)]" : "-translate-x-full md:translate-x-0"}`}>
        <div className="p-6">
          <motion.button 
            whileTap={{ scale: 0.98 }}
            onClick={() => { setActiveChatId(null); setMessages([]); setIsMobileMenuOpen(false); }} 
            className="flex w-full cursor-pointer items-center justify-center gap-3 rounded-2xl bg-white p-4 text-sm font-bold text-black hover:bg-zinc-200 transition-all shadow-xl shadow-white/5"
          >
            <Plus size={18} /> New Chat
          </motion.button>
        </div>
        <div className="flex-1 overflow-y-auto px-4 custom-scrollbar">
          <div className="space-y-2">
            {chats.map((chat) => (
              <div 
                key={chat.id} 
                onClick={() => { setActiveChatId(chat.id); setIsMobileMenuOpen(false); }} 
                onContextMenu={(e) => handleContextMenu(e, chat.id)}
                onTouchStart={() => handleTouchStart(chat.id)}
                onTouchEnd={handleTouchEnd}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { setActiveChatId(chat.id); setIsMobileMenuOpen(false); } }}
                className={`group relative flex w-full cursor-pointer items-center gap-2 rounded-xl p-2 text-xs transition-all border ${activeChatId === chat.id ? "bg-white/10 border-white/10 text-white" : "text-zinc-400 border-transparent hover:bg-white/5"}`}
              >
                <MessageSquare size={14} />
                <span className="truncate flex-1 text-left">{chat.title}</span>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(chat.id); }}
                    className="opacity-0 group-hover:opacity-100 hover:text-red-400 transition-opacity cursor-pointer"
                  >
                    <TrashIcon size={14} />
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleContextMenu(e as any, chat.id); }}
                    className="opacity-0 group-hover:opacity-100 hover:text-white transition-opacity md:hidden cursor-pointer"
                  >
                    <MoreVertical size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          {chats.length > 0 && (
            <div className="mt-4 px-2">
              <button 
                onClick={() => setShowDeleteAllConfirm(true)}
                className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-red-500/20 bg-red-500/5 py-2 text-[10px] font-bold text-red-500 transition-all hover:bg-red-500/10"
              >
                <Trash size={12} />
                Delete All Chats
              </button>
            </div>
          )}
        </div>
        <div className="p-4 border-t border-white/5">
           <div className="flex flex-col gap-2 mb-4">
              {/* Desktop Badge Progress */}
              <div 
                onClick={() => setShowProfileModal(true)}
                className="hidden md:flex flex-col gap-2 p-3 rounded-xl bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 transition-all mb-2 group/progress"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 group-hover/progress:text-blue-400 transition-colors">Badge Progress</span>
                  <span className="text-[9px] font-bold text-blue-500">{(userData?.messageCount || 0) % 20} / 20</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((((userData?.messageCount || 0) % 20) / 20) * 100, 100)}%` }}
                    className="h-full bg-gradient-to-r from-blue-600 to-blue-400 shadow-[0_0_10px_rgba(37,99,235,0.3)]"
                  />
                </div>
                <div className="flex items-center gap-1.5 mt-1">
                   {Array.from({ length: userData?.badgeHistory?.length || 0 }).map((_, i) => (
                     <BadgeLogo key={i} size={16} />
                   ))}
                   {(userData?.badgeHistory?.length || 0) < 1 && <span className="text-[8px] text-zinc-600 italic">Chat to earn your first badge</span>}
                </div>
              </div>

              {accessToken ? (
                <div className="flex items-center gap-2 rounded-xl bg-green-500/10 px-3 py-2 text-[10px] font-bold text-green-500 border border-green-500/20">
                  <CheckCircle2 size={14} />
                  <span>Gemini Connected</span>
                </div>
              ) : (
                <button 
                  onClick={handleConnectGemini}
                  disabled={isConnecting}
                  className="flex cursor-pointer items-center gap-2 rounded-xl bg-blue-600 px-3 py-2 text-[10px] font-bold text-white hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isConnecting ? <Bot size={14} className="animate-spin" /> : <Key size={14} />}
                  <span>{isConnecting ? "Connecting..." : "Connect Gemini"}</span>
                </button>
              )}
           </div>

           <div 
              onClick={() => setShowProfileModal(true)}
              className="flex items-center gap-3 rounded-xl bg-white/5 p-2 cursor-pointer hover:bg-white/10 transition-all group/profile"
            >
              <div className="h-8 w-8 overflow-hidden rounded-lg bg-blue-600 flex items-center justify-center text-white">
                {user.photoURL ? <img src={user.photoURL} referrerPolicy="no-referrer" /> : <UserIcon size={16} />}
              </div>
              <div className="flex-1 overflow-hidden">
                <div className="flex items-center gap-1.5">
                  <p className="truncate text-[10px] font-bold text-white">{user.displayName}</p>
                  {/* Mini Badges for Sidebar */}
                  <div className="flex items-center gap-0.5">
                    {(userData?.messageCount || 0) >= 1 && <BadgeLogo size={12} />}
                    {(userData?.messageCount || 0) >= 10 && <BadgeLogo size={12} />}
                    {(userData?.messageCount || 0) >= 50 && <BadgeLogo size={12} />}
                    {(userData?.messageCount || 0) >= 100 && <BadgeLogo size={12} />}
                  </div>
                </div>
                <p className="truncate text-[9px] text-zinc-500">{user.email}</p>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); setShowLogoutConfirm(true); }} 
                className="p-1.5 text-zinc-500 hover:text-red-400 transition-colors cursor-pointer opacity-0 group-hover/profile:opacity-100"
                title="Logout"
              >
                <LogOut size={16} />
              </button>
           </div>
        </div>
      </aside>

      {/* Chat Area */}
      <main className="flex flex-1 flex-col relative bg-[#050505] w-full pb-[72px] md:pb-0">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-white/5 bg-[#050505]/80 px-4 py-3 backdrop-blur-xl md:px-6">
          <div className="flex items-center gap-3">
            <motion.button 
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsMobileMenuOpen(true)}
              className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl bg-white/5 text-white md:hidden hover:bg-white/10 transition-colors"
            >
              <History size={20} />
            </motion.button>
            <Link to="/" className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-zinc-500 hover:text-white transition-colors cursor-pointer" title="Go to Home">
              <Home size={18} />
            </Link>
            <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${!APP_CONFIG.branding.chatbotLogo ? `bg-blue-600` : 'bg-transparent'} text-white shadow-lg shadow-blue-600/20 shrink-0 overflow-hidden`}>
              <ChatbotLogo size={18} fill={!!APP_CONFIG.branding.chatbotLogo} />
            </div>
            <div className="overflow-hidden">
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-bold text-white truncate max-w-[120px] sm:max-w-[200px] md:max-w-none">
                  {activeChatId ? chats.find(c => c.id === activeChatId)?.title : "New Chat"}
                </h1>
              </div>
              <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-500">{APP_CONFIG.name} {APP_CONFIG.version}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {activeChatId && (
              <motion.button 
                whileTap={{ scale: 0.9 }}
                onClick={() => handleShare(activeChatId)}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-zinc-500 hover:text-white transition-colors cursor-pointer"
              >
                <Share2 size={18} />
              </motion.button>
            )}
            <Link to="/about" className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-zinc-500 hover:text-white transition-colors cursor-pointer sm:w-auto sm:px-4 sm:gap-2 sm:text-xs sm:font-bold">
              <Info size={18} /> <span className="hidden sm:inline">Help</span>
            </Link>

            {/* Header Badges */}
            <motion.button 
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setShowProfileModal(true);
                setIsHistoryExpanded(true);
              }}
              className="flex items-center gap-2 ml-2 border-l border-white/10 pl-4 cursor-pointer group/badges"
            >
              <div className="flex items-center -space-x-2">
                {userData?.badgeHistory?.map((_: any, i: number) => (
                  <div key={i} className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 border border-white/10 shadow-lg backdrop-blur-sm group-hover/badges:scale-110 transition-transform overflow-hidden" style={{ zIndex: 10 - i }}>
                    <BadgeLogo size={18} fill={!!APP_CONFIG.branding.badgeLogo} />
                  </div>
                ))}
              </div>
              
              <div className="flex flex-col items-start">
                <div className="flex items-center gap-1">
                  <span className="text-[10px] font-bold text-white leading-none">
                    {userData?.badgeHistory?.length || 0}
                  </span>
                  <BadgeLogo size={14} />
                </div>
                <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-tighter">View History</span>
              </div>
            </motion.button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center p-8 text-center">
              <div className={`mb-6 h-20 w-20 flex items-center justify-center rounded-3xl ${!APP_CONFIG.branding.chatbotLogo ? `bg-blue-600` : 'bg-transparent'} text-white shadow-2xl shadow-blue-600/20 overflow-hidden`}>
                <ChatbotLogo size={48} fill={!!APP_CONFIG.branding.chatbotLogo} />
              </div>
              <h2 className="text-3xl font-serif font-bold text-white mb-4">{APP_CONFIG.name}</h2>
              <motion.p 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="max-w-lg text-zinc-500 font-medium leading-relaxed"
              >
                {APP_CONFIG.tagline}
              </motion.p>
            </div>
          ) : (
            <div className="mx-auto max-w-4xl py-4 md:py-8 px-2 md:px-6">
              <AnimatePresence initial={false}>
                {messages.map((msg, index) => (
                  <ChatMessage 
                    key={msg.id} 
                    message={msg} 
                    isGenerating={isLoading && index === messages.length - 1}
                    onStop={handleStop}
                  />
                ))}
              </AnimatePresence>
              {error && (
                <div className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex flex-col sm:flex-row items-start sm:items-center gap-3 animate-in slide-in-from-bottom-2">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse shrink-0" />
                    <p>{error}</p>
                  </div>
                  <div className="flex items-center gap-3 ml-auto sm:ml-0">
                    <button 
                      onClick={() => {
                        const lastUserMsg = [...messages].reverse().find(m => m.role === "user");
                        if (lastUserMsg) handleSend(lastUserMsg.content);
                      }}
                      className="whitespace-nowrap cursor-pointer rounded-lg bg-red-500/20 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider hover:bg-red-500/30 transition-colors"
                    >
                      Retry
                    </button>
                    <button 
                      onClick={() => setError(null)}
                      className="text-[10px] cursor-pointer uppercase font-bold tracking-widest hover:text-white transition-colors"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        <div className="p-0">
          <AnimatePresence>
            {showGlobalQuotaError && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="mx-auto max-w-3xl px-6 mb-4"
              >
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 relative">
                  <button 
                    onClick={() => setShowGlobalQuotaError(false)}
                    className="absolute top-4 right-4 text-amber-500/50 hover:text-amber-500 cursor-pointer"
                  >
                    <X size={18} />
                  </button>
                  <div className="flex items-start gap-3">
                    <Info className="mt-1 flex-shrink-0" size={18} />
                    <div>
                      <h3 className="text-sm font-bold mb-1">Global API Key Limit Reached</h3>
                      <p className="text-sm opacity-90 mb-4">
                        The main API key is currently busy and will take a minute to reset. You can wait, or connect your own Google account to continue chatting immediately for free.
                      </p>
                      <button 
                        onClick={() => {
                          setShowGlobalQuotaError(false);
                          handleConnectGemini();
                        }}
                        className="bg-amber-500 cursor-pointer text-black px-4 py-2 rounded-lg text-xs font-bold hover:bg-amber-400 transition-colors"
                      >
                        Connect My Own Key
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {showQuotaError && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="mx-auto max-w-3xl px-6 mb-4"
              >
                <div className="p-[1px] rounded-2xl bg-[conic-gradient(from_0deg_at_50%_50%,#323336_19.35%,#4285F4_31.96%,#1AA64A_53.75%,#323336_74.94%,#FCBD00_81.08%,#DB372D_89.49%,#323336_100%)]">
                  <div className="bg-white dark:bg-[#141414] rounded-2xl p-6 relative">
                    <button 
                      onClick={() => setShowQuotaError(false)}
                      className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-300 cursor-pointer"
                    >
                      <X size={18} />
                    </button>
                    <h3 className="text-gray-900 dark:text-[#d4d4d4] text-sm font-normal mb-2">Upgrade to continue your flow</h3>
                    <p className="text-gray-600 dark:text-[#8c8c8c] text-sm font-normal mb-6">
                      You’ve reached your AI usage limit for the day, you can wait for it to reset or upgrade to continue and unlock even more.
                    </p>
                    <a 
                      href="https://one.google.com/ai?utm_source=ai_studio" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-block cursor-pointer bg-gray-100 dark:bg-[#323232] text-gray-900 dark:text-[#fcfcfc] px-4 py-2 rounded-lg text-sm font-medium hover:opacity-80 transition-opacity"
                    >
                      Continue to upgrade
                    </a>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <ChatInput onSend={handleSend} onStop={handleStop} isLoading={isLoading} />
        </div>

        {/* Mobile Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around border-t border-white/5 bg-black/80 p-2 backdrop-blur-xl md:hidden">
          <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsMobileMenuOpen(true)}
            className="flex flex-col items-center gap-1 p-2 text-zinc-500"
          >
            <History size={20} />
            <span className="text-[9px] font-bold uppercase tracking-widest">History</span>
          </motion.button>
          
          <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={() => { setActiveChatId(null); setMessages([]); }}
            className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/20"
          >
            <Plus size={24} />
          </motion.button>
          
          <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowProfileModal(true)}
            className="flex flex-col items-center gap-1 p-2 text-zinc-500"
          >
            <UserCircle size={20} />
            <span className="text-[9px] font-bold uppercase tracking-widest">Profile</span>
          </motion.button>
        </div>
      </main>

      {/* Profile Modal */}
      <AnimatePresence>
        {showProfileModal && (
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-md p-0 sm:p-4">
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="w-full max-w-md rounded-t-[32px] sm:rounded-[32px] border border-white/10 bg-[#0a0a0a] p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold text-white">Your Profile</h2>
                <button onClick={() => setShowProfileModal(false)} className="p-2 text-zinc-500 hover:text-white cursor-pointer">
                  <X size={20} />
                </button>
              </div>

              <div className="flex items-center gap-4 mb-8 p-4 rounded-2xl bg-white/5 border border-white/5">
                <div className="h-14 w-14 overflow-hidden rounded-xl bg-blue-600 flex items-center justify-center text-white text-xl font-bold">
                  {user.photoURL ? <img src={user.photoURL} referrerPolicy="no-referrer" /> : user.displayName?.[0] || "U"}
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="truncate text-lg font-bold text-white">{user.displayName}</p>
                  <p className="truncate text-sm text-zinc-500">{user.email}</p>
                </div>
              </div>

              {/* User Badges */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-600">Your Achievements</p>
                  <div className="flex items-center gap-1.5 rounded-full bg-blue-500/10 px-2.5 py-1 border border-blue-500/20">
                    <span className="text-[10px] font-bold text-blue-500">
                      {userData?.messageCount || 0} Questions
                    </span>
                    <BadgeLogo size={14} />
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <div className="flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 border border-amber-500/20">
                    <BadgeLogo size={16} />
                    <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider">Early Adopter</span>
                  </div>
                  
                  {userData?.badgeHistory?.map((entry: any, i: number) => (
                    <div key={i} className="flex items-center gap-1.5 rounded-full bg-blue-500/10 px-3 py-1 border border-blue-500/20">
                      <BadgeLogo size={16} />
                      <span className="text-[10px] font-bold text-blue-500 uppercase tracking-wider">{entry.badgeName}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Badge History Toggle */}
              <div className="mb-8">
                <button 
                  onClick={() => setIsHistoryExpanded(!isHistoryExpanded)}
                  className="flex w-full cursor-pointer items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all group/history"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
                      <Award size={20} />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-bold text-white">Badge History</p>
                      <p className="text-[10px] text-zinc-500">View all your conversation milestones</p>
                    </div>
                  </div>
                  <motion.div
                    animate={{ rotate: isHistoryExpanded ? 180 : 0 }}
                    className="text-zinc-500 group-hover/history:text-white transition-colors"
                  >
                    <ArrowLeft size={16} className="-rotate-90" />
                  </motion.div>
                </button>

                <AnimatePresence>
                  {isHistoryExpanded && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-4 space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-2 pt-2">
                        {userData?.badgeHistory && userData.badgeHistory.length > 0 ? (
                          userData.badgeHistory.slice().reverse().map((entry: any, i: number) => {
                            const badgesInThisChat = userData.badgeHistory.filter((b: any) => b.chatId === entry.chatId).length;
                            
                            return (
                              <div key={i} className="flex flex-col gap-2 rounded-xl bg-white/5 p-3 border border-white/5 hover:bg-white/[0.08] transition-colors">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <div className="h-9 w-9 rounded-xl flex items-center justify-center shadow-lg bg-white/5 border border-white/10 shadow-black/20 overflow-hidden">
                                      <BadgeLogo size={24} fill={!!APP_CONFIG.branding.badgeLogo} />
                                    </div>
                                    <div>
                                      <p className="text-[11px] font-bold text-white">{entry.badgeName} Badge</p>
                                      <div className="flex items-center gap-2">
                                        <span className="text-[9px] text-zinc-500 font-medium">Earned in Chat</span>
                                        <span className="h-1 w-1 rounded-full bg-zinc-800" />
                                        <span className="text-[9px] font-bold text-blue-400 truncate max-w-[120px]">{entry.chatTitle}</span>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-[9px] font-bold text-zinc-400">
                                      {new Date(entry.timestamp).toLocaleDateString()}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center justify-between border-t border-white/5 pt-2 mt-1">
                                  <span className="text-[8px] font-bold uppercase tracking-widest text-zinc-600">Conversation Milestone</span>
                                  <div className="flex items-center gap-1.5 rounded-full bg-white/5 px-2 py-0.5 border border-white/5">
                                    <span className="text-[8px] font-bold text-zinc-400">
                                      {badgesInThisChat} {badgesInThisChat === 1 ? 'Badge' : 'Badges'}
                                    </span>
                                    <BadgeLogo size={12} />
                                  </div>
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <div className="p-8 text-center rounded-xl border border-dashed border-white/10">
                            <Bot size={24} className="mx-auto text-zinc-700 mb-2" />
                            <p className="text-xs text-zinc-500">No badges earned yet. Keep chatting!</p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="space-y-6">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-600 mb-3">Connection</p>
                  {accessToken ? (
                    <div className="flex items-center justify-between rounded-xl bg-green-500/10 px-4 py-3 text-xs font-bold text-green-500 border border-green-500/20">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 size={16} />
                        <span>Gemini Connected</span>
                      </div>
                    </div>
                  ) : (
                    <button 
                      onClick={() => { handleConnectGemini(); setShowProfileModal(false); }}
                      disabled={isConnecting}
                      className="flex w-full cursor-pointer items-center justify-between rounded-xl bg-blue-600 px-4 py-3 text-xs font-bold text-white hover:bg-blue-500 transition-all disabled:opacity-50"
                    >
                      <div className="flex items-center gap-2">
                        <Key size={16} />
                        <span>{isConnecting ? "Connecting..." : "Connect Gemini"}</span>
                      </div>
                      <Bot size={16} className={isConnecting ? "animate-spin" : ""} />
                    </button>
                  )}
                </div>

                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-600 mb-3">Data Management</p>
                  <button 
                    onClick={() => { setShowDeleteAllConfirm(true); setShowProfileModal(false); }}
                    className="flex w-full cursor-pointer items-center gap-3 rounded-xl bg-red-500/10 px-4 py-3 text-xs font-bold text-red-500 hover:bg-red-500/20 transition-all border border-red-500/10"
                  >
                    <Trash2 size={16} />
                    <span>Delete All Conversations</span>
                  </button>
                </div>

                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-600 mb-3">Support</p>
                  <div className="grid grid-cols-2 gap-3">
                    <Link to="/about" className="flex items-center justify-center gap-2 rounded-xl bg-white/5 py-3 text-xs font-bold text-zinc-300 hover:text-white transition-all">
                      <Info size={16} /> About
                    </Link>
                    <Link to="/contact" className="flex items-center justify-center gap-2 rounded-xl bg-white/5 py-3 text-xs font-bold text-zinc-300 hover:text-white transition-all">
                      <Mail size={16} /> Contact
                    </Link>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-white/5">
                <button
                  onClick={() => { setShowLogoutConfirm(true); setShowProfileModal(false); }}
                  className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-white py-3.5 text-sm font-bold text-black transition-all hover:bg-zinc-200 active:scale-[0.98]"
                >
                  <LogOut size={18} />
                  Sign Out
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm rounded-[24px] border border-white/10 bg-zinc-900 p-6 shadow-2xl"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10 text-red-500">
                <LogOut size={20} />
              </div>
              <h3 className="mb-1 text-xl font-bold text-white">Sign Out?</h3>
              <p className="mb-6 text-xs text-zinc-400 leading-relaxed">
                Are you sure you want to log out of your account? Your active session will be ended.
              </p>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => {
                    signOut(auth);
                    setShowLogoutConfirm(false);
                  }}
                  className="w-full cursor-pointer rounded-lg bg-white py-2.5 text-xs font-bold text-black transition-all hover:bg-zinc-100 active:scale-[0.98]"
                >
                  Logout
                </button>
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="w-full cursor-pointer rounded-lg border border-white/10 bg-white/5 py-2.5 text-xs font-bold text-white transition-all hover:bg-white/10 active:scale-[0.98]"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Chat Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm rounded-[24px] border border-white/10 bg-zinc-900 p-6 shadow-2xl"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10 text-red-500">
                <TrashIcon size={20} />
              </div>
              <h3 className="mb-1 text-xl font-bold text-white">Delete Chat?</h3>
              <p className="mb-6 text-xs text-zinc-400 leading-relaxed">
                This action cannot be undone. All messages in this conversation will be permanently removed.
              </p>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => deleteChat(showDeleteConfirm)}
                  disabled={isDeleting}
                  className="w-full cursor-pointer rounded-lg bg-red-500 py-2.5 text-xs font-bold text-white transition-all hover:bg-red-600 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isDeleting && <Bot size={14} className="animate-spin" />}
                  {isDeleting ? "Deleting..." : "Delete"}
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  disabled={isDeleting}
                  className="w-full cursor-pointer rounded-lg border border-white/10 bg-white/5 py-2.5 text-xs font-bold text-white transition-all hover:bg-white/10 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete All Chats Confirmation Modal */}
      <AnimatePresence>
        {showDeleteAllConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm rounded-[24px] border border-white/10 bg-zinc-900 p-6 shadow-2xl"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10 text-red-500">
                <Trash size={20} />
              </div>
              <h3 className="mb-1 text-xl font-bold text-white">Delete All Chats?</h3>
              <p className="mb-6 text-xs text-zinc-400 leading-relaxed">
                Are you absolutely sure? This will permanently delete all your conversation history. This action is irreversible.
              </p>
              <div className="flex flex-col gap-2">
                <button
                  onClick={deleteAllChats}
                  disabled={isDeleting}
                  className="w-full cursor-pointer rounded-lg bg-red-500 py-2.5 text-xs font-bold text-white transition-all hover:bg-red-600 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isDeleting && <Bot size={14} className="animate-spin" />}
                  {isDeleting ? "Deleting All..." : "Delete All"}
                </button>
                <button
                  onClick={() => setShowDeleteAllConfirm(false)}
                  disabled={isDeleting}
                  className="w-full cursor-pointer rounded-lg border border-white/10 bg-white/5 py-2.5 text-xs font-bold text-white transition-all hover:bg-white/10 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Context Menu */}
      <AnimatePresence>
        {contextMenu && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            style={{ top: contextMenu.y, left: contextMenu.x }}
            className="fixed z-[60] w-48 rounded-2xl border border-white/10 bg-zinc-900/90 p-2 shadow-2xl backdrop-blur-xl"
          >
            <button
              onClick={() => {
                setActiveChatId(contextMenu.chatId);
                setContextMenu(null);
              }}
              className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-zinc-300 hover:bg-white/5 hover:text-white transition-all"
            >
              <ExternalLink size={16} />
              Open Chat
            </button>
            <button
              onClick={() => {
                handleShare(contextMenu.chatId);
                setContextMenu(null);
              }}
              className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-zinc-300 hover:bg-white/5 hover:text-white transition-all"
            >
              <Share2 size={16} />
              Share Conversation
            </button>
            <button
              onClick={() => {
                setShowDeleteConfirm(contextMenu.chatId);
                setContextMenu(null);
              }}
              className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-all"
            >
              <TrashIcon size={16} />
              Delete Chat
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Toast Notification */}
      <AnimatePresence>
        {copySuccess && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-24 left-1/2 z-[100] -translate-x-1/2 rounded-full bg-blue-600 px-6 py-2 text-sm font-bold text-white shadow-xl"
          >
            Link copied to clipboard!
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChatAssistant;
