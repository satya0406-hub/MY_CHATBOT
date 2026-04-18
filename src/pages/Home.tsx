import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { Zap, Shield, Cpu, ArrowRight, MessageSquare, BookOpen, Users } from "lucide-react";
import { APP_CONFIG } from "../config";
import { ChatbotLogo } from "../components/Logos";

export const Home = () => {
  return (
    <div className="flex flex-col mesh-gradient">
      {/* Hero Section */}
      <section className="relative flex min-h-[80vh] items-center justify-center overflow-hidden px-6 py-20">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-blue-600/20 blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-blue-400/10 blur-[120px]" />
        </div>

        <div className="relative z-10 mx-auto max-w-5xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 backdrop-blur-md">
              <ChatbotLogo size={24} className="text-blue-500" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">Next-Gen AI Intelligence</span>
            </div>
            <h1 className="mb-8 font-serif text-6xl font-bold leading-[1.1] tracking-tighter text-white sm:text-8xl lg:text-9xl">
              Think <span className="text-blue-500 italic">Bigger</span>.<br />
              Chat <span className="text-zinc-500">Smarter</span>.
            </h1>
            <p className="mx-auto mb-12 max-w-2xl text-lg text-zinc-400 leading-relaxed sm:text-xl">
              {APP_CONFIG.name} is more than just a chatbot. It's your strategic partner for productivity, 
              learning, and creative problem-solving. Powered by advanced AI models.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link
                to="/chat"
                className="group relative flex w-full sm:w-auto cursor-pointer items-center justify-center gap-3 overflow-hidden rounded-2xl bg-white px-10 py-5 text-sm font-bold text-black transition-all hover:scale-105 active:scale-95 shimmer"
              >
                Launch Assistant
                <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                to="/blog"
                className="flex w-full sm:w-auto cursor-pointer items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-10 py-5 text-sm font-bold text-white transition-all hover:bg-white/10 active:scale-95"
              >
                Explore Blog
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="bg-black/40 py-32 px-6 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl">
          <div className="mb-20 text-center">
            <h2 className="mb-4 font-serif text-4xl font-bold text-white sm:text-5xl">Engineered for Excellence</h2>
            <p className="text-zinc-500 font-medium">Why thousands of users trust {APP_CONFIG.name} for their daily workflows.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Zap,
                title: "Instant Intelligence",
                desc: "Get lightning-fast responses to complex queries, from coding bugs to philosophical debates.",
                color: "text-yellow-500",
                bg: "bg-yellow-500/10"
              },
              {
                icon: Shield,
                title: "Secure & Private",
                desc: "Your data is encrypted and protected. We prioritize your privacy in every interaction.",
                color: "text-green-500",
                bg: "bg-green-500/10"
              },
              {
                icon: Cpu,
                title: "Advanced Models",
                desc: `Powered by ${APP_CONFIG.name} ${APP_CONFIG.version}, our most capable model yet for reasoning and creativity.`,
                color: `text-${APP_CONFIG.branding.primaryColor}`,
                bg: `bg-${APP_CONFIG.branding.primaryColor}/10`
              }
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="group rounded-3xl border border-white/5 bg-white/[0.02] p-10 transition-all hover:border-white/10 hover:bg-white/[0.04]"
              >
                <div className={`mb-8 flex h-14 w-14 items-center justify-center rounded-2xl ${feature.bg} ${feature.color}`}>
                  <feature.icon size={28} />
                </div>
                <h3 className="mb-4 text-xl font-bold text-white">{feature.title}</h3>
                <p className="text-zinc-500 leading-relaxed font-medium">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Value Prop Section */}
      <section className="py-32 px-6">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="mb-8 font-serif text-5xl font-bold leading-tight text-white">
                How {APP_CONFIG.name} <br />
                <span className="text-blue-500 italic">Empowers</span> Your Journey
              </h2>
              <div className="space-y-8">
                {[
                  {
                    icon: MessageSquare,
                    title: "Dynamic Conversations",
                    desc: "Engage in deep, context-aware dialogues that feel natural and insightful."
                  },
                  {
                    icon: BookOpen,
                    title: "Knowledge Hub",
                    desc: "Access a vast repository of information through our curated blog and AI assistant."
                  },
                  {
                    icon: Users,
                    title: "Collaborative Growth",
                    desc: "Share insights and learn from a community of forward-thinking individuals."
                  }
                ].map((item) => (
                  <div key={item.title} className="flex gap-6">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
                      <item.icon size={20} />
                    </div>
                    <div>
                      <h4 className="mb-2 text-lg font-bold text-white">{item.title}</h4>
                      <p className="text-zinc-500 leading-relaxed font-medium">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative aspect-square rounded-[60px] bg-gradient-to-br from-blue-600/20 to-transparent border border-white/5 p-8"
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-64 w-64 rounded-full bg-blue-500/10 blur-[80px] animate-pulse" />
              </div>
              <div className="relative h-full w-full rounded-[40px] bg-black/40 backdrop-blur-xl border border-white/10 p-10 flex flex-col justify-center">
                <div className={`mb-6 flex h-12 w-12 items-center justify-center rounded-2xl ${!APP_CONFIG.branding.chatbotLogo ? 'bg-white text-black' : 'bg-transparent'} overflow-hidden shadow-xl`}>
                  <ChatbotLogo size={32} fill={!!APP_CONFIG.branding.chatbotLogo} />
                </div>
                <h3 className="text-3xl font-serif font-bold text-white mb-4 italic">"The future of AI is personal."</h3>
                <p className="text-zinc-400 font-medium leading-relaxed">
                  We believe that AI should be an extension of human potential, not a replacement. 
                  {APP_CONFIG.name} is designed to amplify your unique voice and vision.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6">
        <div className="mx-auto max-w-5xl rounded-[60px] bg-blue-600 px-10 py-20 text-center relative overflow-hidden shadow-2xl shadow-blue-600/20">
          <div className="absolute top-0 left-0 h-full w-full opacity-10 pointer-events-none">
             <div className="absolute top-[-50%] left-[-50%] h-[200%] w-[200%] bg-[radial-gradient(circle,white_1px,transparent_1px)] [background-size:40px_40px]" />
          </div>
          <div className="relative z-10">
            <h2 className="mb-8 font-serif text-5xl font-bold text-white sm:text-6xl">Ready to start?</h2>
            <p className="mx-auto mb-12 max-w-xl text-lg font-medium text-blue-100">
              Join thousands of users who are already using {APP_CONFIG.name} to transform their work and life.
            </p>
            <Link
              to="/chat"
              className="inline-flex items-center gap-3 cursor-pointer rounded-2xl bg-white px-12 py-6 text-sm font-bold text-blue-600 transition-all hover:scale-105 active:scale-95 shadow-xl shimmer"
            >
              Get Started for Free
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
