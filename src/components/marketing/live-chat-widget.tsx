"use client";

import { useEffect } from "react";

// Crisp is free for up to 50 conversations/month
// Get your website ID from: https://app.crisp.chat/settings/website/
const CRISP_WEBSITE_ID = process.env.NEXT_PUBLIC_CRISP_WEBSITE_ID;

declare global {
  interface Window {
    $crisp: unknown[];
    CRISP_WEBSITE_ID: string;
  }
}

export function LiveChatWidget() {
  useEffect(() => {
    // Skip if no website ID configured
    if (!CRISP_WEBSITE_ID) {
      console.log("[Chat] Crisp not configured. Set NEXT_PUBLIC_CRISP_WEBSITE_ID to enable.");
      return;
    }

    // Initialize Crisp
    window.$crisp = [];
    window.CRISP_WEBSITE_ID = CRISP_WEBSITE_ID;

    // Load Crisp script
    const script = document.createElement("script");
    script.src = "https://client.crisp.chat/l.js";
    script.async = true;
    document.head.appendChild(script);

    // Style customization after Crisp loads
    script.onload = () => {
      // Wait for Crisp to initialize
      setTimeout(() => {
        if (window.$crisp && Array.isArray(window.$crisp)) {
          // Set color to match brand
          window.$crisp.push(["config", "color:theme", ["emerald"]]);
          // Set position
          window.$crisp.push(["config", "position:reverse", [false]]);
          // Hide by default on mobile (less intrusive)
          if (window.innerWidth < 768) {
            window.$crisp.push(["do", "chat:hide"]);
          }
        }
      }, 1000);
    };

    return () => {
      // Cleanup on unmount
      const existingScript = document.querySelector('script[src="https://client.crisp.chat/l.js"]');
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, []);

  return null;
}
