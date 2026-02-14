"use client";

import { AnimateOnScroll } from "@/components/ui/animate-on-scroll";
import type { ReactNode } from "react";

interface AnimatedSectionProps {
  children: ReactNode;
  className?: string;
  animation?: string;
}

export function AnimatedSection({
  children,
  className = "",
  animation = "animate-fade-in-up",
}: AnimatedSectionProps) {
  return (
    <AnimateOnScroll animation={animation} className={className}>
      {children}
    </AnimateOnScroll>
  );
}

interface AnimatedCardProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export function AnimatedCard({
  children,
  className = "",
  delay = 0,
}: AnimatedCardProps) {
  const delayClass = delay > 0 ? `animation-delay-${delay}` : "";

  return (
    <AnimateOnScroll
      animation="animate-fade-in-up"
      className={`${delayClass} ${className}`}
    >
      {children}
    </AnimateOnScroll>
  );
}
