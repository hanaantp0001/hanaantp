import React from "react";
import { ThemeConfig } from "../themes";

interface CleanChatLogoProps {
  className?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "custom";
  currentTheme: ThemeConfig;
  customSizeClass?: string;
}

export function CleanChatLogo({
  className = "",
  size = "md",
  currentTheme,
  customSizeClass = ""
}: CleanChatLogoProps) {
  
  // Custom theme backdrop background according to the branding specifications of each theme
  // Combining rich mesh gradients, fluid waves, and glossy glassmorphic overlays
  const getBackgroundClass = () => {
    switch (currentTheme.id) {
      case "chatgpt-light":
        return "bg-gradient-to-tr from-pink-400 via-purple-405 to-indigo-400 shadow-[0_4px_14px_rgba(236,72,153,0.25)] border border-white/50";
      case "chatgpt-dark":
        return "bg-gradient-to-b from-[#1b1b1f] to-[#111112] shadow-[0_4px_20px_rgba(16,163,127,0.15)] border border-emerald-500/25 ring-1 ring-emerald-500/10";
      case "chatgpt-emerald":
        return "bg-gradient-to-tr from-[#022c22] via-[#10a37f] to-[#34d399] shadow-[0_4px_12px_rgba(16,163,127,0.3)] border border-emerald-400/20";
      case "chatgpt-orange":
        return "bg-gradient-to-tr from-[#7c2d12] via-[#ea580c] to-[#fcd34d] shadow-[0_4px_12px_rgba(234,88,12,0.35)] border border-orange-400/20";
      case "chatgpt-lavender":
        return "bg-gradient-to-tr from-[#1e1b4b] via-[#4f46e5] to-[#a5b4fc] shadow-[0_4px_12px_rgba(99,102,241,0.3)] border border-indigo-400/20";
      case "copilot":
        // This is the gorgeous custom liquid glass mesh gradient matching the exact user wallpaper in the picture!
        return "bg-gradient-to-tr from-[#003bff] via-[#00c8ff] to-[#7000ff] shadow-[0_6px_18px_rgba(0,200,255,0.4)] border border-white/30 animate-pulse-slow";
      default:
        return "bg-gradient-to-tr from-emerald-500 to-teal-600 shadow-md";
    }
  };

  // Dimensions helper
  const sizeClasses = {
    xs: "w-6 h-6",
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
    xl: "w-16 h-16",
    custom: customSizeClass
  };

  const currentSizeClass = sizeClasses[size] || sizeClasses.sm;

  return (
    <div 
      className={`rounded-full flex items-center justify-center shrink-0 overflow-hidden relative group/logo p-1 ${getBackgroundClass()} ${currentSizeClass} ${className}`}
    >
      {/* Glossy overlay reflection for glassmorphism */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-transparent opacity-80 pointer-events-none rounded-full" />
      
      {/* 8-loop interlocking star rosette curve reconstructed exactly in vector SVG */}
      <svg 
        viewBox="0 0 100 100" 
        className="w-full h-full text-white pointer-events-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.15)] relative z-10 transition-transform duration-500 group-hover/logo:rotate-45"
        fill="none"
      >
        <defs>
          {/* Custom linear gradients for the brand icon paths to give it depth */}
          <linearGradient id="logo-stroke-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="50%" stopColor="#f3f4f6" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#e5e7eb" stopOpacity="0.8" />
          </linearGradient>
          
          {/* Drop shadow for the path itself for depth illustration */}
          <filter id="logo-path-shadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="1.5" stdDeviation="1.2" floodColor="#000000" floodOpacity="0.18" />
          </filter>
        </defs>

        {/* Outer Circular faint rim */}
        <circle 
          cx="50" 
          cy="50" 
          r="41" 
          stroke="url(#logo-stroke-grad)" 
          strokeWidth="0.8" 
          strokeDasharray="2 3"
          className="opacity-40" 
        />

        {/* 8 Interconnected loops rotated around 50,50 */}
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
          <path
            key={i}
            d="M 50 17.5 C 37 13.5, 34 33, 42 43.5 C 45 47, 55 47, 58 43.5 C 66 33, 63 13.5, 50 17.5 Z"
            transform={`rotate(${i * 45} 50 50)`}
            stroke="url(#logo-stroke-grad)"
            strokeWidth="3.3"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#logo-path-shadow)"
            className="transition-all duration-300 group-hover/logo:opacity-95"
          />
        ))}

        {/* Central Core mini star / octagon anchor */}
        <circle 
          cx="50" 
          cy="50" 
          r="6.5" 
          stroke="url(#logo-stroke-grad)" 
          strokeWidth="1.2" 
          fill="rgba(255,255,255,0.08)"
          className="opacity-80"
        />
      </svg>
    </div>
  );
}
