/// <reference types="vite/client" />
import { Bot, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { APP_CONFIG } from "../config";

export const BadgeLogo = ({ size = 16, className = "", fill = false }: { size?: number; className?: string; fill?: boolean }) => {
  const [hasError, setHasError] = useState(false);
  const badgeImg = APP_CONFIG.branding.badgeLogo;

  if (badgeImg && !hasError) {
    const src = badgeImg.startsWith('http') ? badgeImg : `${import.meta.env.BASE_URL}${badgeImg.replace(/^\//, '')}`;
    return (
      <img 
        src={src} 
        alt="Badge" 
        width={fill ? undefined : size} 
        height={fill ? undefined : size} 
        className={`${fill ? "w-full h-full object-cover block" : "object-contain block"} ${className}`}
        style={{ imageRendering: 'high-quality' as any }}
        onError={() => setHasError(true)}
        referrerPolicy="no-referrer"
        decoding="async"
      />
    );
  }

  // Fallback to a simple icon if the image fails or isn't provided
  return <ShieldCheck size={size} className={className} />;
};

export const ChatbotLogo = ({ size = 24, className = "", fill = false }: { size?: number; className?: string; fill?: boolean }) => {
  const [hasError, setHasError] = useState(false);
  const logoImg = APP_CONFIG.branding.chatbotLogo;

  if (logoImg && !hasError) {
    const src = logoImg.startsWith('http') ? logoImg : `${import.meta.env.BASE_URL}${logoImg.replace(/^\//, '')}`;
    return (
      <img 
        src={src} 
        alt={APP_CONFIG.name} 
        width={fill ? undefined : size} 
        height={fill ? undefined : size} 
        className={`${fill ? "w-full h-full object-cover block" : "object-contain block"} ${className}`}
        style={{ imageRendering: 'high-quality' as any }}
        onError={() => setHasError(true)}
        referrerPolicy="no-referrer"
        decoding="async"
      />
    );
  }

  // Fallback to a simple Bot icon if the image fails or isn't provided
  return <Bot size={size} className={className} />;
};
