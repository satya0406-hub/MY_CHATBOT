import { motion } from "motion/react";
import { Users, Target, Eye, Award } from "lucide-react";

export const About = () => {
  return (
    <div className="mx-auto max-w-7xl px-6 py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-20"
      >
        <h1 className="mb-6 font-serif text-6xl font-bold text-white">About PRINCE STAR</h1>
        <p className="mx-auto max-w-2xl text-lg text-zinc-400 font-medium leading-relaxed">
          We are on a mission to democratize advanced AI intelligence, making it an accessible 
          and powerful tool for everyone, everywhere.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-center mb-32">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-serif font-bold text-white mb-6 italic">Our Vision</h2>
          <p className="text-zinc-400 font-medium leading-relaxed mb-6">
            At PRINCE STAR, we believe that the intersection of human creativity and artificial 
            intelligence is where the most profound breakthroughs happen. Our platform is built 
            to be the catalyst for those breakthroughs.
          </p>
          <p className="text-zinc-400 font-medium leading-relaxed">
            Whether you're a student tackling complex subjects, a developer optimizing code, 
            or a professional drafting strategic plans, PRINCE STAR is designed to be your 
            most reliable and insightful partner.
          </p>
        </motion.div>
        <div className="relative aspect-video rounded-3xl bg-blue-600/10 border border-white/5 flex items-center justify-center">
           <Target size={80} className="text-blue-500 opacity-20" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-32">
        {[
          { icon: Users, title: "User-Centric", desc: "Every feature is built with our users' needs and feedback at the core." },
          { icon: Eye, title: "Transparency", desc: "We are open about our AI's capabilities and limitations." },
          { icon: Award, title: "Excellence", desc: "We strive for the highest quality in our models and user experience." },
          { icon: Target, title: "Innovation", desc: "We are constantly pushing the boundaries of what AI can achieve." }
        ].map((item, i) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            viewport={{ once: true }}
            className="rounded-2xl border border-white/5 bg-white/5 p-8 text-center"
          >
            <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white">
              <item.icon size={20} />
            </div>
            <h3 className="text-lg font-bold text-white mb-3">{item.title}</h3>
            <p className="text-zinc-500 text-sm font-medium leading-relaxed">{item.desc}</p>
          </motion.div>
        ))}
      </div>

      <div className="rounded-[40px] bg-white/5 border border-white/5 p-12 text-center">
        <h2 className="text-3xl font-serif font-bold text-white mb-6">Join Our Journey</h2>
        <p className="mx-auto max-w-2xl text-zinc-400 font-medium leading-relaxed mb-10">
          We are just getting started. As AI continues to evolve, PRINCE STAR will be at the 
          forefront, ensuring you have the tools you need to succeed in an AI-driven world.
        </p>
        <div className="flex justify-center gap-6">
           <div className="text-center">
              <div className="text-3xl font-bold text-white mb-1">50K+</div>
              <div className="text-xs font-bold uppercase tracking-widest text-zinc-600">Active Users</div>
           </div>
           <div className="h-12 w-px bg-white/10" />
           <div className="text-center">
              <div className="text-3xl font-bold text-white mb-1">1M+</div>
              <div className="text-xs font-bold uppercase tracking-widest text-zinc-600">Chats Daily</div>
           </div>
           <div className="h-12 w-px bg-white/10" />
           <div className="text-center">
              <div className="text-3xl font-bold text-white mb-1">99%</div>
              <div className="text-xs font-bold uppercase tracking-widest text-zinc-600">Uptime</div>
           </div>
        </div>
      </div>
    </div>
  );
};
