import { useState, useRef, useEffect } from "react";
import { motion } from "motion/react";
import { SendHorizontal, Square, Paperclip, Mic } from "lucide-react";
import { APP_CONFIG } from "../config";

interface ChatInputProps {
  onSend: (message: string) => void;
  onStop: () => void;
  isLoading: boolean;
}

export function ChatInput({ onSend, onStop, isLoading }: ChatInputProps) {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (isLoading) {
      onStop();
      return;
    }
    if (input.trim()) {
      onSend(input.trim());
      setInput("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  return (
    <div className="p-4 md:p-6">
      <form onSubmit={handleSubmit} className="mx-auto max-w-3xl relative group">
        <div className="absolute inset-0 bg-blue-600/5 blur-3xl rounded-[32px] opacity-0 group-focus-within:opacity-100 transition-opacity" />
        
        <div className="relative flex items-end gap-2 glass rounded-[32px] p-2 pr-3 shadow-2xl transition-all group-focus-within:border-white/20 group-focus-within:bg-white/[0.08]">
          <motion.button
            whileTap={{ scale: 0.9 }}
            type="button"
            className="p-3 text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
          >
            <Paperclip size={20} />
          </motion.button>
          
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Message ${APP_CONFIG.name}...`}
            className="flex-1 resize-none bg-transparent py-3.5 text-[15px] text-white placeholder:text-zinc-500 focus:outline-none disabled:opacity-50"
            disabled={isLoading}
          />

          <div className="flex items-center gap-1 pb-1">
            <motion.button
              whileTap={{ scale: 0.9 }}
              type="button"
              className="p-2.5 text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
            >
              <Mic size={20} />
            </motion.button>
            
            <motion.button
              whileTap={{ scale: 0.9 }}
              type="submit"
              disabled={!input.trim() && !isLoading}
              className={`flex items-center justify-center rounded-2xl transition-all shadow-lg cursor-pointer ${isLoading ? "bg-red-500 text-white shadow-red-500/20 px-5 h-10" : "bg-white text-black shadow-white/10 disabled:opacity-20 w-10 h-10"}`}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Square size={12} className="fill-current" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Stop</span>
                </div>
              ) : (
                <SendHorizontal className="h-5 w-5" />
              )}
            </motion.button>
          </div>
        </div>
      </form>
      <p className="mt-3 text-center text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-600">
        AI-Powered Intelligence • {APP_CONFIG.name} {APP_CONFIG.version}
      </p>
    </div>
  );
}
