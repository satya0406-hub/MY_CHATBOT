import { Link } from "react-router-dom";
import { Bot, Twitter, Github, Linkedin, Mail } from "lucide-react";
import { APP_CONFIG } from "../../config";
import { ChatbotLogo } from "../Logos";

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    company: [
      { name: "About Us", path: "/about" },
      { name: "Contact", path: "/contact" },
      { name: "Chat Assistant", path: "/chat" },
    ],
    legal: [
      { name: "Privacy Policy", path: "/privacy" },
      { name: "Terms & Conditions", path: "/terms" },
      { name: "Disclaimer", path: "/disclaimer" },
    ],
    social: [
      { name: "Twitter", icon: Twitter, href: "#" },
      { name: "GitHub", icon: Github, href: "#" },
      { name: "LinkedIn", icon: Linkedin, href: "#" },
    ],
  };

  return (
    <footer className="bg-black border-t border-white/5 pt-20 pb-10">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center gap-3 mb-6 cursor-pointer">
              <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${!APP_CONFIG.branding.chatbotLogo ? `bg-${APP_CONFIG.branding.primaryColor}` : 'bg-transparent'} text-white shadow-2xl shadow-${APP_CONFIG.branding.primaryColor}/20 overflow-hidden`}>
                <ChatbotLogo size={32} fill={!!APP_CONFIG.branding.chatbotLogo} />
              </div>
              <span className="font-serif text-2xl font-bold tracking-tighter text-white">
                {APP_CONFIG.name.split(' ')[0]} <span className={`text-${APP_CONFIG.branding.primaryColor} italic`}>{APP_CONFIG.name.split(' ').slice(1).join(' ')}</span>
              </span>
            </Link>
            <p className="max-w-sm text-zinc-500 leading-relaxed mb-8">
              Empowering students and professionals with advanced AI-driven conversational intelligence. 
              Built for speed, accuracy, and productivity.
            </p>
            <div className="flex gap-4">
              {footerLinks.social.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl bg-white/5 text-zinc-500 hover:bg-blue-600 hover:text-white transition-all"
                >
                  <item.icon size={18} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-white font-bold uppercase tracking-widest text-xs mb-6">Platform</h4>
            <ul className="space-y-4">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link to={link.path} className="text-zinc-500 hover:text-white transition-colors text-sm font-medium cursor-pointer">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold uppercase tracking-widest text-xs mb-6">Legal</h4>
            <ul className="space-y-4">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link to={link.path} className="text-zinc-500 hover:text-white transition-colors text-sm font-medium cursor-pointer">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between border-t border-white/5 pt-10">
          <p className="text-zinc-600 text-xs font-medium mb-4 md:mb-0">
            © {currentYear} {APP_CONFIG.name}. All rights reserved.
          </p>
          <p className="text-zinc-600 text-[10px] uppercase tracking-[0.2em] font-bold">
            AI-Powered Intelligence • Version {APP_CONFIG.version}
          </p>
        </div>
      </div>
    </footer>
  );
};
