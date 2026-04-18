import { useState } from "react";
import { motion } from "motion/react";
import { Mail, MessageSquare, Send, CheckCircle2, Instagram, Linkedin, Github, Facebook, Clock } from "lucide-react";
import { APP_CONFIG } from "../config";

export const Contact = () => {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    // In a real app, you'd send this to a backend
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-20">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h1 className="mb-6 font-serif text-6xl font-bold text-white tracking-tighter">Get in <span className="text-blue-500 italic">Touch</span>.</h1>
          <p className="mb-12 text-lg text-zinc-400 font-medium leading-relaxed">
            Have questions, feedback, or just want to say hello? We'd love to hear from you. 
            Our team is here to help you get the most out of PRINCE STAR.
          </p>

          <div className="space-y-8">
            <div className="flex gap-6">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-600/10 text-blue-500">
                <Mail size={20} />
              </div>
              <div>
                <h4 className="text-white font-bold mb-1">Email Us</h4>
                <p className="text-zinc-500 font-medium">support@princestar.ai</p>
              </div>
            </div>
            <div className="flex gap-6">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-600/10 text-blue-500">
                <Clock size={20} />
              </div>
              <div>
                <h4 className="text-white font-bold mb-1">Response Time</h4>
                <p className="text-zinc-500 font-medium">Usually within 24-48 hours</p>
              </div>
            </div>

            <div className="pt-10 border-t border-white/5">
              <h4 className="text-white font-bold mb-6 flex items-center gap-2">
                Connect with Us
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <a 
                  href={APP_CONFIG.links.instagram} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 rounded-2xl bg-white/[0.03] border border-white/5 text-zinc-400 hover:text-pink-500 hover:border-pink-500/50 hover:bg-pink-500/5 transition-all group"
                >
                  <Instagram size={20} className="group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-bold uppercase tracking-wider">Instagram</span>
                </a>
                <a 
                  href={APP_CONFIG.links.linkedin} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 rounded-2xl bg-white/[0.03] border border-white/5 text-zinc-400 hover:text-blue-400 hover:border-blue-400/50 hover:bg-blue-400/5 transition-all group"
                >
                  <Linkedin size={20} className="group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-bold uppercase tracking-wider">LinkedIn</span>
                </a>
                <a 
                  href={APP_CONFIG.links.github} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 rounded-2xl bg-white/[0.03] border border-white/5 text-zinc-400 hover:text-white hover:border-white/20 hover:bg-white/5 transition-all group"
                >
                  <Github size={20} className="group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-bold uppercase tracking-wider">GitHub</span>
                </a>
                <a 
                  href={APP_CONFIG.links.facebook} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 rounded-2xl bg-white/[0.03] border border-white/5 text-zinc-400 hover:text-blue-600 hover:border-blue-600/50 hover:bg-blue-600/5 transition-all group"
                >
                  <Facebook size={20} className="group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-bold uppercase tracking-wider">Facebook</span>
                </a>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="rounded-[40px] bg-white/5 border border-white/5 p-10 backdrop-blur-xl"
        >
          {submitted ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-500/10 text-green-500">
                <CheckCircle2 size={40} />
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">Message Sent!</h2>
              <p className="text-zinc-500 font-medium">
                Thank you for reaching out. We'll get back to you as soon as possible.
              </p>
              <button 
                onClick={() => setSubmitted(false)}
                className="mt-8 cursor-pointer text-sm font-bold text-blue-500 hover:text-blue-400 transition-colors"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 ml-1">Full Name</label>
                  <input 
                    required
                    type="text" 
                    placeholder="John Doe"
                    className="w-full rounded-2xl bg-white/5 border border-white/10 px-5 py-4 text-white placeholder:text-zinc-600 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 ml-1">Email Address</label>
                  <input 
                    required
                    type="email" 
                    placeholder="john@example.com"
                    className="w-full rounded-2xl bg-white/5 border border-white/10 px-5 py-4 text-white placeholder:text-zinc-600 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 ml-1">Subject</label>
                <select className="w-full rounded-2xl bg-white/5 border border-white/10 px-5 py-4 text-white focus:outline-none focus:border-blue-500 transition-colors appearance-none">
                  <option className="bg-zinc-900">General Inquiry</option>
                  <option className="bg-zinc-900">Technical Support</option>
                  <option className="bg-zinc-900">Billing Question</option>
                  <option className="bg-zinc-900">Partnership</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 ml-1">Message</label>
                <textarea 
                  required
                  rows={5}
                  placeholder="How can we help you?"
                  className="w-full rounded-2xl bg-white/5 border border-white/10 px-5 py-4 text-white placeholder:text-zinc-600 focus:outline-none focus:border-blue-500 transition-colors resize-none"
                />
              </div>
              <button 
                type="submit"
                className="flex w-full cursor-pointer items-center justify-center gap-3 rounded-2xl bg-blue-600 py-5 text-sm font-bold text-white transition-all hover:bg-blue-500 active:scale-[0.98] shadow-xl shadow-blue-600/20"
              >
                Send Message
                <Send size={18} />
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  );
};
