import { motion } from "motion/react";
import { User, Bot, Copy, Check, FileText, Download, Square, Loader2 } from "lucide-react";
import { ChatbotLogo } from "./Logos";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { useState, memo } from "react";
import { saveAs } from "file-saver";
import { Document, Packer, Paragraph, TextRun } from "docx";
import { Message } from "../services/gemini";
import { APP_CONFIG } from "../config";

interface ChatMessageProps {
  message: Message;
  isGenerating?: boolean;
  onStop?: () => void;
}

export const ChatMessage = memo(({ message, isGenerating, onStop }: ChatMessageProps) => {
  const isUser = message.role === "user";
  const [copied, setCopied] = useState(false);
  const [exporting, setExporting] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const exportToWord = async () => {
    setExporting(true);
    try {
      const doc = new Document({
        sections: [
          {
            properties: {},
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: `${APP_CONFIG.name} AI Response`,
                    bold: true,
                    size: 32,
                  }),
                ],
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: `Generated on: ${message.timestamp.toLocaleString()}`,
                    italics: true,
                    size: 20,
                  }),
                ],
              }),
              new Paragraph({ text: "" }),
              ...message.content.split("\n").map(
                (line) =>
                  new Paragraph({
                    children: [new TextRun({ text: line, size: 24 })],
                  })
              ),
            ],
          },
        ],
      });

      const blob = await Packer.toBlob(doc);
      saveAs(blob, `${APP_CONFIG.name.replace(/\s+/g, '_')}_Response_${Date.now()}.docx`);
    } catch (error) {
      console.error("Error exporting to Word:", error);
    } finally {
      setExporting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`group flex w-full gap-3 md:gap-4 p-4 md:p-6 transition-colors ${isUser ? "bg-white/[0.02]" : "bg-transparent"}`}
    >
      <div className={`flex h-9 w-9 md:h-10 md:w-10 shrink-0 select-none items-center justify-center rounded-xl md:rounded-2xl border shadow-lg overflow-hidden ${isUser ? "bg-zinc-800 border-white/10 text-zinc-400" : (!APP_CONFIG.branding.chatbotLogo ? "bg-blue-600 border-blue-500 text-white shadow-blue-500/20" : "border-white/10")}`}>
        {isUser ? <User className="h-5 w-5" /> : <ChatbotLogo size={32} fill={!!APP_CONFIG.branding.chatbotLogo} />}
      </div>
      
      <div className="flex-1 overflow-hidden">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <span className={`text-[11px] font-bold uppercase tracking-widest ${isUser ? "text-zinc-500" : `text-${APP_CONFIG.branding.primaryColor}`}`}>
              {isUser ? "You" : APP_CONFIG.name}
            </span>
            <span className="text-[10px] text-zinc-600 font-mono">
              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
          </div>
          
          {!isUser && (
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 md:opacity-0 transition-opacity md:group-hover:opacity-100">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => copyToClipboard(message.content)}
                className="flex cursor-pointer items-center gap-1.5 rounded-lg bg-white/5 px-3 py-1.5 text-[10px] font-bold text-zinc-400 hover:bg-white/10 hover:text-white transition-all"
                title="Copy full message"
              >
                {copied ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
                <span className="hidden sm:inline">{copied ? "Copied" : "Copy"}</span>
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={exportToWord}
                disabled={exporting}
                className="flex cursor-pointer items-center gap-1.5 rounded-lg bg-blue-600/10 px-3 py-1.5 text-[10px] font-bold text-blue-400 hover:bg-blue-600/20 hover:text-blue-300 transition-all disabled:opacity-50"
                title="Export to Word (.docx)"
              >
                {exporting ? <Download size={12} className="animate-bounce" /> : <FileText size={12} />}
                <span className="hidden sm:inline">{exporting ? "Exporting..." : "Word"}</span>
              </motion.button>
            </div>
          )}
        </div>
        
        <div className="markdown-body">
          {message.content ? (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({ node, inline, className, children, ...props }: any) {
                  const match = /language-(\w+)/.exec(className || "");
                  const codeString = String(children).replace(/\n$/, "");
                  
                  return !inline && match ? (
                    <div className="relative group/code my-4">
                      <div className="absolute right-2 top-2 z-10 opacity-0 group-hover/code:opacity-100 transition-opacity">
                        <button
                          onClick={() => copyToClipboard(codeString)}
                          className="rounded-md cursor-pointer bg-zinc-800/80 p-1.5 text-zinc-400 hover:text-white backdrop-blur-sm border border-white/5"
                        >
                          <Copy size={14} />
                        </button>
                      </div>
                      <SyntaxHighlighter
                        style={atomDark as any}
                        language={match[1]}
                        PreTag="div"
                        className="rounded-xl !bg-zinc-900/50 !p-4 !m-0 border border-white/5"
                        {...props}
                      >
                        {codeString}
                      </SyntaxHighlighter>
                    </div>
                  ) : (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  );
                },
              }}
            >
              {message.content}
            </ReactMarkdown>
          ) : (
            <div className="flex flex-col gap-3 py-2">
              <div className="flex items-center gap-2">
                <Loader2 className="h-3 w-3 text-blue-500 animate-spin" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                  Thinking...
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
});
