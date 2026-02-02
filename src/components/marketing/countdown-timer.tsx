"use client";

import { useState, useEffect } from "react";
import { Clock } from "lucide-react";

interface CountdownTimerProps {
  endDate?: Date;
  className?: string;
}

// Default: Sale ends at the end of the current month
function getDefaultEndDate(): Date {
  const now = new Date();
  // End of current month, 11:59:59 PM
  return new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
}

export function CountdownTimer({ endDate, className = "" }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const targetDate = endDate || getDefaultEndDate();

    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const target = targetDate.getTime();
      const difference = target - now;

      if (difference <= 0) {
        setIsExpired(true);
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000),
      };
    };

    // Initial calculation
    setTimeLeft(calculateTimeLeft());

    // Update every second
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [endDate]);

  if (isExpired) {
    return null;
  }

  const TimeBlock = ({ value, label }: { value: number; label: string }) => (
    <div className="flex flex-col items-center">
      <div className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 min-w-[3.5rem]">
        <span className="text-2xl font-bold text-white tabular-nums">
          {String(value).padStart(2, "0")}
        </span>
      </div>
      <span className="text-xs text-slate-500 mt-1 uppercase tracking-wider">{label}</span>
    </div>
  );

  return (
    <div className={`inline-flex items-center gap-4 ${className}`}>
      <div className="flex items-center gap-1 text-orange-400">
        <Clock className="h-4 w-4" />
        <span className="text-sm font-medium">Sale ends in:</span>
      </div>
      <div className="flex items-center gap-2">
        <TimeBlock value={timeLeft.days} label="Days" />
        <span className="text-2xl text-slate-500 font-light">:</span>
        <TimeBlock value={timeLeft.hours} label="Hrs" />
        <span className="text-2xl text-slate-500 font-light">:</span>
        <TimeBlock value={timeLeft.minutes} label="Min" />
        <span className="text-2xl text-slate-500 font-light">:</span>
        <TimeBlock value={timeLeft.seconds} label="Sec" />
      </div>
    </div>
  );
}

// Compact version for smaller spaces
export function CountdownTimerCompact({ endDate, className = "" }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState("");
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const targetDate = endDate || getDefaultEndDate();

    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const target = targetDate.getTime();
      const difference = target - now;

      if (difference <= 0) {
        setIsExpired(true);
        return "";
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      if (days > 0) {
        return `${days}d ${hours}h ${minutes}m`;
      }
      return `${hours}h ${minutes}m ${seconds}s`;
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [endDate]);

  if (isExpired) {
    return null;
  }

  return (
    <span className={`inline-flex items-center gap-1.5 text-orange-400 font-medium ${className}`}>
      <Clock className="h-3.5 w-3.5" />
      <span className="tabular-nums">{timeLeft}</span>
    </span>
  );
}
