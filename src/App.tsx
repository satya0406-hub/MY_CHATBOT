import { Routes, Route, useLocation } from "react-router-dom";
import { useEffect, useState, lazy, Suspense } from "react";
import { Layout } from "./components/Layout/Layout";
import { SplashScreen } from "./components/SplashScreen";
import { SecurityManager } from "./components/SecurityManager";
import { AnimatePresence, motion } from "motion/react";
import { APP_CONFIG } from "./config";
import { Bot } from "lucide-react";

// Lazy load pages for better performance
const Home = lazy(() => import("./pages/Home").then(m => ({ default: m.Home })));
const Blog = lazy(() => import("./pages/Blog").then(m => ({ default: m.Blog })));
const BlogPost = lazy(() => import("./pages/BlogPost").then(m => ({ default: m.BlogPost })));
const ChatAssistant = lazy(() => import("./pages/ChatAssistant"));
const About = lazy(() => import("./pages/About").then(m => ({ default: m.About })));
const Contact = lazy(() => import("./pages/Contact").then(m => ({ default: m.Contact })));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy").then(m => ({ default: m.PrivacyPolicy })));
const TermsConditions = lazy(() => import("./pages/TermsConditions").then(m => ({ default: m.TermsConditions })));
const Disclaimer = lazy(() => import("./pages/Disclaimer").then(m => ({ default: m.Disclaimer })));

const PageLoader = () => (
  <div className="flex h-screen w-full items-center justify-center bg-black">
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
    >
      <Bot className="text-blue-600" size={32} />
    </motion.div>
  </div>
);

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Set document title and description from config
    document.title = APP_CONFIG.seo.title;
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute("content", APP_CONFIG.description);
    } else {
      const meta = document.createElement('meta');
      meta.name = "description";
      meta.content = APP_CONFIG.description;
      document.head.appendChild(meta);
    }

    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 3500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <SecurityManager />
      <AnimatePresence>
        {showSplash && <SplashScreen />}
      </AnimatePresence>
      
      <ScrollToTop />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Chat Assistant has its own layout/sidebar, so we don't wrap it in the main Layout */}
          <Route path="/chat" element={<ChatAssistant />} />
          
          {/* All other pages use the main Layout with Navbar and Footer */}
          <Route
            path="/*"
            element={
              <Layout>
                <Suspense fallback={<PageLoader />}>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/blog" element={<Blog />} />
                    <Route path="/blog/:id" element={<BlogPost />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/privacy" element={<PrivacyPolicy />} />
                    <Route path="/terms" element={<TermsConditions />} />
                    <Route path="/disclaimer" element={<Disclaimer />} />
                  </Routes>
                </Suspense>
              </Layout>
            }
          />
        </Routes>
      </Suspense>
    </>
  );
}
