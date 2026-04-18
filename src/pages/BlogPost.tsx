import { useParams, Link, Navigate } from "react-router-dom";
import { motion } from "motion/react";
import { Calendar, User, ArrowLeft, Clock, Share2, Bookmark } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { articles } from "../data/articles";

export const BlogPost = () => {
  const { id } = useParams();
  const post = articles.find((a) => a.id === id);

  if (!post) {
    return <Navigate to="/blog" replace />;
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Link
          to="/blog"
          className="mb-12 inline-flex cursor-pointer items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-500 hover:text-white transition-colors"
        >
          <ArrowLeft size={14} />
          Back to Blog
        </Link>

        <header className="mb-12">
          <div className="mb-6 flex items-center gap-6 text-xs font-bold uppercase tracking-widest text-zinc-500">
            <span className="flex items-center gap-2">
              <Calendar size={14} className="text-blue-500" />
              {post.date}
            </span>
            <span className="flex items-center gap-2">
              <User size={14} className="text-blue-500" />
              {post.author}
            </span>
            <span className="flex items-center gap-2">
              <Clock size={14} className="text-blue-500" />
              {post.readTime}
            </span>
          </div>
          <h1 className="mb-8 font-serif text-5xl font-bold leading-tight text-white sm:text-6xl">
            {post.title}
          </h1>
          <div className="flex items-center justify-between border-y border-white/5 py-6">
            <div className="flex items-center gap-4">
               <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                 {post.author[0]}
               </div>
               <div>
                 <p className="text-sm font-bold text-white">{post.author}</p>
                 <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">AI Specialist</p>
               </div>
            </div>
            <div className="flex gap-4">
              <button className="text-zinc-500 hover:text-white transition-colors cursor-pointer">
                <Share2 size={18} />
              </button>
              <button className="text-zinc-500 hover:text-white transition-colors cursor-pointer">
                <Bookmark size={18} />
              </button>
            </div>
          </div>
        </header>

        <div className="aspect-[16/9] mb-12 overflow-hidden rounded-[40px] border border-white/5">
          <img 
            src={`https://picsum.photos/seed/${post.id}/1200/800`} 
            alt={post.title} 
            referrerPolicy="no-referrer"
            className="h-full w-full object-cover"
          />
        </div>

        <div className="markdown-body">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {post.content}
          </ReactMarkdown>
        </div>

        <footer className="mt-20 border-t border-white/5 pt-12">
          <div className="rounded-3xl bg-white/5 p-8 flex flex-col sm:flex-row items-center gap-8">
            <div className="h-24 w-24 shrink-0 rounded-2xl bg-blue-600 flex items-center justify-center text-white text-3xl font-bold">
              {post.author[0]}
            </div>
            <div className="text-center sm:text-left">
              <h4 className="text-xl font-bold text-white mb-2">About the Author</h4>
              <p className="text-zinc-500 text-sm font-medium leading-relaxed mb-4">
                {post.author} is a senior AI researcher and technology evangelist with over a decade of experience 
                in natural language processing and student productivity tools.
              </p>
              <div className="flex justify-center sm:justify-start gap-4">
                <Link to="/contact" className="text-xs font-bold uppercase tracking-widest text-blue-500 hover:text-blue-400 cursor-pointer">
                  Contact Author
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </motion.div>
    </div>
  );
};
