"use client";

import { useState, useEffect } from "react";
import { Shield, X } from "lucide-react";

// Realistic-looking names and locations
const notifications = [
  { name: "Sarah M.", location: "Los Angeles, CA", action: "started their free scan" },
  { name: "Michael R.", location: "New York, NY", action: "removed 47 exposures" },
  { name: "Jennifer L.", location: "Austin, TX", action: "started their free scan" },
  { name: "David K.", location: "Chicago, IL", action: "upgraded to Pro" },
  { name: "Emily W.", location: "Seattle, WA", action: "removed 82 exposures" },
  { name: "James T.", location: "Miami, FL", action: "started their free scan" },
  { name: "Amanda P.", location: "Denver, CO", action: "upgraded to Enterprise" },
  { name: "Robert H.", location: "Phoenix, AZ", action: "removed 156 exposures" },
  { name: "Lisa M.", location: "Portland, OR", action: "started their free scan" },
  { name: "Chris B.", location: "San Diego, CA", action: "upgraded to Pro" },
  { name: "Nicole S.", location: "Atlanta, GA", action: "removed 63 exposures" },
  { name: "Kevin D.", location: "Boston, MA", action: "started their free scan" },
];

function getRandomNotification() {
  const index = Math.floor(Math.random() * notifications.length);
  const notification = notifications[index];
  // Add a random time ago (1-15 minutes)
  const minutesAgo = Math.floor(Math.random() * 14) + 1;
  return { ...notification, minutesAgo };
}

export function SocialProofNotifications() {
  const [notification, setNotification] = useState<{
    name: string;
    location: string;
    action: string;
    minutesAgo: number;
  } | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Don't show on mobile (too intrusive)
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      return;
    }

    const showNotificationHandler = () => {
      setNotification(getRandomNotification());
      setIsVisible(true);

      // Auto-hide after 5 seconds
      setTimeout(() => {
        setIsVisible(false);
      }, 5000);
    };

    // Show first notification after 8 seconds
    const initialTimer = setTimeout(() => {
      showNotificationHandler();
    }, 8000);

    // Then show every 25-45 seconds
    const interval = setInterval(() => {
      const randomDelay = Math.floor(Math.random() * 20000) + 25000;
      setTimeout(showNotificationHandler, randomDelay);
    }, 45000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, []);

  const handleClose = () => {
    setIsVisible(false);
  };

  if (!isVisible || !notification) return null;

  return (
    <div className="fixed bottom-4 left-4 z-40 animate-in slide-in-from-left-full duration-500">
      <div className="bg-white rounded-lg shadow-2xl border border-slate-200 p-4 max-w-sm">
        <button
          onClick={handleClose}
          className="absolute top-2 right-2 p-1 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X className="h-3 w-3" />
        </button>

        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
            <Shield className="h-5 w-5 text-emerald-600" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <p className="text-sm text-slate-900">
              <span className="font-semibold">{notification.name}</span> from{" "}
              <span className="font-medium">{notification.location}</span>
            </p>
            <p className="text-sm text-slate-600">{notification.action}</p>
            <p className="text-xs text-slate-400 mt-1">
              {notification.minutesAgo} minute{notification.minutesAgo !== 1 ? "s" : ""} ago
            </p>
          </div>
        </div>

        {/* Verified badge */}
        <div className="mt-2 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <svg
              className="h-3 w-3 text-emerald-500"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            Verified by GhostMyData
          </div>
        </div>
      </div>
    </div>
  );
}
