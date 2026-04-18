import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { Calendar, User, ArrowRight, BookOpen } from "lucide-react";
import { articles } from "../data/articles";

export const Blog = () => {
  return (
    <div className="mx-auto max-w-7xl px-6 py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-20"
      >
        <h1 className="mb-6 font-serif text-6xl font-bold text-white">Insights & <span className="text-blue-500 italic">Innovations</span></h1>
        <p className="mx-auto max-w-2xl text-lg text-zinc-400 font-medium leading-relaxed">
          Explore our latest articles on AI, productivity, and technology trends. 
          Stay ahead of the curve with PRINCE STAR.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {articles.map((post, i) => (
          <motion.article
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            viewport={{ once: true }}
            className="group flex flex-col rounded-[32px] border border-white/5 bg-white/[0.02] overflow-hidden transition-all hover:border-white/10 hover:bg-white/[0.04] hover:shadow-2xl"
          >
            <Link to={`/blog/${post.id}`} className="block cursor-pointer aspect-[16/10] overflow-hidden">
              <img 
                src={`https://picsum.photos/seed/${post.id}/800/500`} 
                alt={post.title} 
                referrerPolicy="no-referrer"
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
            </Link>
            <div className="flex flex-1 flex-col p-8">
              <div className="mb-4 flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                <span className="flex items-center gap-1.5">
                  <Calendar size={12} className="text-blue-500" />
                  {post.date}
                </span>
                <span className="flex items-center gap-1.5">
                  <User size={12} className="text-blue-500" />
                  {post.author}
                </span>
              </div>
              <h3 className="mb-4 text-xl font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-2">
                <Link to={`/blog/${post.id}`} className="cursor-pointer">
                  {post.title}
                </Link>
              </h3>
              <p className="mb-8 text-sm text-zinc-500 font-medium leading-relaxed line-clamp-3">
                {post.excerpt}
              </p>
              <Link
                to={`/blog/${post.id}`}
                className="mt-auto flex cursor-pointer items-center gap-2 text-xs font-bold uppercase tracking-widest text-white transition-all group-hover:gap-3"
              >
                Read Article
                <ArrowRight size={14} className="text-blue-500" />
              </Link>
            </div>
          </motion.article>
        ))}
      </div>
    </div>
  );
};
