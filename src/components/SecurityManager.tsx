import { useEffect } from "react";

/**
 * SecurityManager handles client-side "protection" measures.
 * Note: No client-side code is 100% hidden, but these measures deter casual inspection.
 */
export function SecurityManager() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;

    // 1. Disable Right-Click
    const preventContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    // 2. Disable Common Inspection Shortcuts
    const preventDevTools = (e: KeyboardEvent) => {
      // F12
      if (e.key === 'F12') {
        e.preventDefault();
        return;
      }

      // Ctrl+Shift+I (Windows/Linux) or Cmd+Option+I (Mac)
      // Ctrl+Shift+J (Windows/Linux) or Cmd+Option+J (Mac)
      // Ctrl+Shift+C (Windows/Linux) or Cmd+Option+C (Mac)
      // Ctrl+U (View Source)
      if (
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) ||
        (e.ctrlKey && e.key === 'u') ||
        (e.metaKey && e.altKey && (e.key === 'i' || e.key === 'j' || e.key === 'c'))
      ) {
        e.preventDefault();
      }
    };

    // 3. Console Warning
    const showSecurityWarning = () => {
      console.clear();
      console.log(
        "%cSTOP!",
        "color: #2563eb; font-family: sans-serif; font-size: 4.5em; font-weight: bolder; text-shadow: #000 1px 1px;"
      );
      console.log(
        "%cThis is a browser feature intended for developers. If someone told you to copy and paste something here to enable a feature, it is a scam and will give them access to your account.",
        "font-family: sans-serif; font-size: 1.5em; color: #4b5563;"
      );
      console.log(
        "%cSecurity measures are active.",
        "font-family: sans-serif; font-size: 1em; color: #9ca3af;"
      );
    };

    // 4. Infinite Debugger Trap
    // When devtools are open, this will trigger and pause the website execution constantly
    const debuggerTrap = setInterval(() => {
      (function() { 
        // @ts-ignore
        (function a() { try { (function b(i) { if (('' + (i / i)).length !== 1 || i % 20 === 0) { (function() {}).constructor('debugger')(); } else { debugger; } b(++i); })(0); } catch (e) { setTimeout(a, 5000); } })(); 
      })();
    }, 1000);

    // 5. Detect Window Resizing (often happens when DevTools are opened)
    let lastWidth = window.innerWidth;
    let lastHeight = window.innerHeight;
    const detectResize = () => {
      const threshold = 160;
      const widthDiff = Math.abs(window.innerWidth - lastWidth);
      const heightDiff = Math.abs(window.innerHeight - lastHeight);
      
      if (widthDiff > threshold || heightDiff > threshold) {
        showSecurityWarning();
      }
      
      lastWidth = window.innerWidth;
      lastHeight = window.innerHeight;
    };

    window.addEventListener("contextmenu", preventContextMenu);
    window.addEventListener("keydown", preventDevTools);
    window.addEventListener("resize", detectResize);
    
    const warningInterval = setInterval(showSecurityWarning, 5000);
    showSecurityWarning();

    return () => {
      window.removeEventListener("contextmenu", preventContextMenu);
      window.removeEventListener("keydown", preventDevTools);
      window.removeEventListener("resize", detectResize);
      clearInterval(warningInterval);
      clearInterval(debuggerTrap);
    };
  }, []);

  return null;
}
