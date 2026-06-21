import React from "react";
import { Sparkles, MessageSquare, Flame, ChevronRight, FileSpreadsheet, User, Calendar, Mic, Image, X, ArrowUpRight } from "lucide-react";
import { CUSTOM_PRESETS } from "../constants";
import { PromptTemplate } from "../types";
import { ThemeConfig } from "../themes";
import { CleanChatLogo } from "./CleanChatLogo";

interface WelcomeScreenProps {
  onSelectPrompt: (prompt: string) => void;
  langMode: string;
  currentTheme: ThemeConfig;
  
  // High fidelity input block references managed inside Welcome body
  inputMessage: string;
  setInputMessage: (val: string) => void;
  onSendMessage: (val?: string) => void;
  attachedImage: string | null;
  setAttachedImage: (val: string | null) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  isListening: boolean;
  toggleListening: () => void;
  isPlusMenuOpen: boolean;
  setIsPlusMenuOpen: (val: boolean) => void;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isLoading: boolean;
}

export function WelcomeScreen({ 
  onSelectPrompt, 
  langMode, 
  currentTheme,
  inputMessage,
  setInputMessage,
  onSendMessage,
  attachedImage,
  setAttachedImage,
  fileInputRef,
  isListening,
  toggleListening,
  isPlusMenuOpen,
  setIsPlusMenuOpen,
  handleImageUpload,
  isLoading
}: WelcomeScreenProps) {
  
  // Filter presets based on language mode for context relevance
  const filteredPresets = langMode === "all" 
    ? CUSTOM_PRESETS 
    : CUSTOM_PRESETS.filter(p => p.category === langMode);

  const isCopilot = currentTheme.id === "copilot" || currentTheme.id === "chatgpt-light";

  if (isCopilot) {
    return (
      <div id="welcome-stage" className="max-w-4xl mx-auto py-10 px-4 sm:px-6 flex-1 flex flex-col justify-center animate-fade-in relative">
        
        {/* Soft atmospheric background glows representing Copilot studio */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-tr from-pink-400/10 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-gradient-to-tr from-indigo-400/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        {/* Outer Presentation Stage framing the interactive glass block */}
        <div className="relative p-1 sm:p-5">
          
          {/* Main Glassmorphic Container styling updated to use our premium 3D Liquid Glass class */}
          <div className="relative liquid-glass-card rounded-[32px] p-6 sm:p-10 overflow-hidden">
            
            {/* Top Row: Copilot Logo launcher and "Try GPT-5" capsule pill */}
            <div className="flex items-center justify-between mb-8 sm:mb-12">
              
              {/* Left Side: Glossy logo card with custom design */}
              <CleanChatLogo currentTheme={currentTheme} size="lg" className="transition-transform duration-300 hover:scale-105" />

              {/* Right Side: Interactive "Try GPT-5" button with customized Liquid Glass specular reflections */}
              <button 
                onClick={() => onSelectPrompt("Tell me about the upcoming GPT-5 models or artificial general intelligence updates!")}
                className="liquid-glass-button liquid-glass-shine text-slate-800 font-sans font-extrabold text-xs px-6 py-3.5 rounded-2xl flex items-center gap-1.5 cursor-pointer shadow-md leading-none"
              >
                <span>Try GPT-5</span>
              </button>
            </div>

            {/* Middle Section: Clean Typography and Header */}
            <div className="text-center space-y-2 mb-8">
              <h1 className="text-2xl sm:text-3xl font-sans font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
                Hi, how can I help you?
              </h1>
            </div>

            {/* Center Capsule Message Input (Strictly modeled after user picture layout with inner actions) */}
            <div className="max-w-2xl mx-auto mb-8 relative">
              <div className="bg-white/65 dark:bg-slate-900/40 border-2 border-white/90 dark:border-white/15 rounded-[24px] p-2.5 pl-4 pr-3.5 flex items-center justify-between shadow-lg focus-within:ring-4 focus-within:ring-pink-300/20 focus-within:border-pink-300 focus-within:bg-white/80 transition-all duration-350">
                <div className="flex items-center gap-3 flex-1">
                  
                  {/* Invisible File Input for Attachment uploads */}
                  <input 
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/*"
                    className="hidden"
                  />

                  {/* Plus button inside the capsule EXACTLY like the photo! */}
                  <button
                    type="button"
                    onClick={() => setIsPlusMenuOpen(!isPlusMenuOpen)}
                    className="w-8 h-8 rounded-full hover:bg-slate-200/20 flex items-center justify-center text-slate-500 hover:text-slate-950 dark:text-slate-300 font-bold text-xl cursor-pointer transition shrink-0"
                    title="Add attachment"
                  >
                    +
                  </button>

                  {/* Text Input area with Message Copilot exactly */}
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        onSendMessage();
                      }
                    }}
                    className="w-full bg-transparent border-none outline-none focus:ring-0 text-slate-800 dark:text-white text-sm placeholder-slate-400 font-semibold py-1.5"
                    placeholder="Message Copilot"
                  />
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {/* Mic icon button */}
                  <button
                    type="button"
                    onClick={toggleListening}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition cursor-pointer ${
                      isListening ? "bg-red-500 text-white animate-pulse" : "text-slate-500 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/5"
                    }`}
                    title="Speech dictation"
                  >
                    <Mic className="w-4 h-4" />
                  </button>

                  {/* Submit arrow button, shown inside the capsule if typing */}
                  {(inputMessage.trim() || attachedImage) && (
                    <button
                      onClick={() => onSendMessage()}
                      disabled={isLoading}
                      className="w-8 h-8 rounded-full bg-gradient-to-tr from-pink-550 to-indigo-550 text-white flex items-center justify-center hover:scale-110 active:scale-95 transition shadow-md cursor-pointer"
                    >
                      <ArrowUpRight className="w-4 h-4 text-white" />
                    </button>
                  )}
                </div>
              </div>

              {/* Float popover inside the welcome capsule */}
              {isPlusMenuOpen && (
                <div className="absolute top-14 left-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-white dark:border-slate-800 rounded-2xl p-2 shadow-xl z-50 animate-fade-in text-left w-60">
                  <div className="px-2.5 py-1 border-b border-slate-200/5 mb-1 flex items-center justify-between">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Attachments</span>
                  </div>
                  <div className="space-y-0.5">
                    <button
                      type="button"
                      onClick={() => {
                        fileInputRef.current?.click();
                        setIsPlusMenuOpen(false);
                      }}
                      className="w-full text-left px-2.5 py-1.5 text-xs rounded-xl flex items-center gap-2.5 hover:bg-slate-50 dark:hover:bg-white/5 text-slate-705 dark:text-slate-200 transition"
                    >
                      <Image className="w-3.5 h-3.5 text-sky-505 shrink-0" />
                      <div>
                        <p className="font-bold leading-none">Upload Image</p>
                        <p className="text-[9px] text-slate-400 mt-0.5">Prompt with pictures</p>
                      </div>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => {
                        setInputMessage("Sukhamaano bro? Enthanu puthiya visheshangal?");
                        setIsPlusMenuOpen(false);
                      }}
                      className="w-full text-left px-2.5 py-1.5 text-xs rounded-xl flex items-center gap-2.5 hover:bg-slate-50 dark:hover:bg-white/5 text-slate-705 text-slate-250 transition"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-emerald-505 shrink-0" />
                      <div>
                        <p className="font-bold leading-none">Chit-Chat greeting</p>
                        <p className="text-[9px] text-slate-400 mt-0.5">Ask Kerala status</p>
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {/* Show Staged image preview */}
              {attachedImage && (
                <div className="absolute top-14 left-4 flex items-center gap-2 bg-white p-1.5 rounded-xl shadow-md border border-slate-200 z-40 animate-fade-in">
                  <div className="relative w-8 h-8 rounded overflow-hidden">
                    <img src={attachedImage} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-700 pr-2">File Attached</span>
                  <button 
                    onClick={() => setAttachedImage(null)}
                    className="bg-red-500 hover:bg-red-600 text-white rounded-full p-0.5"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Bottom Section: Three custom items replicated exactly with Liquid Glass style from the design image */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
              
              {/* Item 1: Excel spreadsheet prompt */}
              <button
                onClick={() => onSelectPrompt("Identify the primary benefits of the quarterly report dataset and summarize the end of quarter numbers for me in Malayalam/Manglish or English.")}
                className="group p-4 rounded-2xl liquid-glass-button liquid-glass-shine hover:border-pink-300 hover:shadow-md cursor-pointer text-left flex flex-col justify-between h-32"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/10 flex items-center justify-center mb-1">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-xs sm:text-[13px] font-bold text-slate-800 dark:text-white leading-snug line-clamp-2">
                    Identify the primary benefits in End of Quarter Numbers...
                  </p>
                  <span className="text-[10px] text-slate-400 mt-1 block font-medium">
                    You updated this
                  </span>
                </div>
              </button>

              {/* Item 2: User profile prompt */}
              <button
                onClick={() => onSelectPrompt("What is new from Daisy Phillips? Retrieve notifications or latest summaries in friendly conversation style!")}
                className="group p-4 rounded-2xl liquid-glass-button liquid-glass-shine hover:border-pink-300 hover:shadow-md cursor-pointer text-left flex flex-col justify-between h-32"
              >
                <div className="w-8 h-8 rounded-full bg-violet-500/10 dark:bg-violet-500/10 flex items-center justify-center mb-1">
                  <User className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                </div>
                <div>
                  <p className="text-xs sm:text-[13px] font-bold text-slate-800 dark:text-white leading-snug line-clamp-2">
                    What's new from Daisy Phillips?
                  </p>
                  <span className="text-[10px] text-slate-400 mt-1 block font-medium">
                    Your close connection
                  </span>
                </div>
              </button>

              {/* Item 3: Calendar indicator prompt */}
              <button
                onClick={() => onSelectPrompt("List action items for me from Feature review session today. Enikk detail aayi parayaamo?")}
                className="group p-4 rounded-2xl liquid-glass-button liquid-glass-shine hover:border-pink-300 hover:shadow-md cursor-pointer text-left flex flex-col justify-between h-32"
              >
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 dark:bg-indigo-500/10 flex items-center justify-center mb-1">
                  <Calendar className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <p className="text-xs sm:text-[13px] font-bold text-slate-800 dark:text-white leading-snug line-clamp-2">
                    List actions items for me from Feature review
                  </p>
                  <span className="text-[10px] text-slate-400 mt-1 block font-medium">
                    Upcoming today at 9:35 PM
                  </span>
                </div>
              </button>

            </div>

          </div>

          {/* Aesthetic 3D glossy wedge cursor arrow overlapping the right boundary exactly like the presentation screenshot! */}
          <div className="absolute right-[-15px] top-[42%] hidden lg:flex items-center justify-center pointer-events-none transform translate-x-4 select-none z-30 filter drop-shadow-[0_15px_30px_rgba(0,0,0,0.15)]">
            <div className="w-20 h-16 bg-white border border-white/90 rounded-2xl flex items-center justify-center transform rotate-[18deg] shadow-xl relative overflow-hidden">
               {/* 3D Reflection Gloss highlight */}
               <div className="absolute inset-x-0 top-0 h-[40%] bg-gradient-to-b from-white to-transparent opacity-90"></div>
               {/* Glossy sleek white polygon path resembling the exact 3D arrow of the picture */}
               <svg viewBox="0 0 40 40" className="w-14 h-14" fill="none">
                 <path d="M12 10 L30 20 L12 30 Z" fill="url(#glossy-wedge-grad)" />
                 <defs>
                   <linearGradient id="glossy-wedge-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                     <stop offset="0%" stopColor="#ffffff" />
                     <stop offset="40%" stopColor="#f8fafc" />
                     <stop offset="100%" stopColor="#cbd5e1" />
                   </linearGradient>
                 </defs>
               </svg>
            </div>
          </div>

        </div>

        {/* Traditional prompt recommendations list grouped at bottom of container */}
        <div id="presets-drawer" className="mt-8">
          <h3 className="text-[11px] font-extrabold text-slate-550 uppercase tracking-widest flex items-center gap-1.5 px-1 mb-3.5">
            <MessageSquare className="w-3.5 h-3.5 text-pink-500 animate-pulse" />
            <span>Chila udaharanangal (Quick Presets)</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filteredPresets.slice(0, 4).map((preset: PromptTemplate, idx: number) => {
              const isMalayalam = preset.category === "malayalam";
              const isManglish = preset.category === "manglish";

              return (
                <button
                  key={idx}
                  id={`preset-card-${idx}`}
                  onClick={() => onSelectPrompt(preset.prompt)}
                  className="text-left p-3.5 rounded-xl bg-white/45 dark:bg-slate-900/10 hover:bg-white/85 dark:hover:bg-slate-900/40 border border-white/60 dark:border-white/15 hover:border-pink-300 transition-all duration-200 shadow-xxs hover:shadow-xs group cursor-pointer"
                >
                  <div className="flex items-center justify-between pointer-events-none mb-1">
                    <span className={`text-[9px] uppercase font-black px-2 py-0.5 rounded-md ${
                      isMalayalam ? "bg-rose-50 text-rose-705 border border-rose-100/50" :
                      isManglish ? "bg-amber-50 text-amber-705 border border-amber-100/50" :
                      "bg-blue-50 text-blue-705 border border-blue-100/50"
                    }`}>
                      {preset.category}
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-pink-500 transition-all duration-200" />
                  </div>
                  <h4 className="font-bold text-xs mb-0.5 text-slate-800 dark:text-white truncate group-hover:text-pink-600 transition-colors">
                    {preset.title}
                  </h4>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1">
                    "{preset.subtitle}"
                  </p>
                </button>
              );
            })}
          </div>
        </div>

      </div>
    );
  }

  return (
    <div id="welcome-stage" className="max-w-3xl mx-auto py-10 px-6 flex-1 flex flex-col justify-center">
      
      {/* Decorative center logo reminiscent of clean ChatGPT Minimalist style */}
      <div className="text-center space-y-4 mb-8">
        <div className="inline-flex justify-center w-full">
          <CleanChatLogo currentTheme={currentTheme} size="xl" />
        </div>
        
        <h2 className="text-2xl sm:text-3xl font-sans font-black tracking-tight text-slate-850">
          Engane sahayikkanam?
        </h2>
        <p className="text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
          Malayalam • Manglish • English reethikalil marupadi nalkunna ningalude swantham personal assistant.
        </p>
      </div>

      {/* Language capabilities overview in sleek minimalist ChatGPT slate boxes */}
      <div className="bg-slate-50/50 border border-slate-200/60 rounded-2xl p-4 mb-8 shadow-xs">
        <h4 className="font-bold text-slate-600 text-[11px] uppercase tracking-wider mb-3 flex items-center gap-2 justify-center sm:justify-start">
          <Flame className="w-4 h-4 text-[#10a37f]" />
          <span>Languages Supported (Samsarikkenda Reethikal)</span>
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs leading-relaxed">
          <div className="bg-white p-4 rounded-xl border border-slate-200/60 shadow-xxs font-sans">
            <span className="font-extrabold text-[#10a37f] block mb-1">❤️ Malayalam Lipi</span>
            <span className="text-slate-500 text-[11px] leading-snug block">Nalla Malayalam lipiyil chodikkam, marupadiyum Malayalam script-il labhikkum.</span>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200/60 shadow-xxs font-sans">
            <span className="font-extrabold text-blue-600 block mb-1">💬 Manglish Mode</span>
            <span className="text-slate-500 text-[11px] leading-snug block">English aksharangal vechu ('Sukhamaano bro?') ennu chodichaal thirichu athu pole marupadi tharum.</span>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200/60 shadow-xxs font-sans">
            <span className="font-extrabold text-[#374151] block mb-1">🇺🇸 English Guide</span>
            <span className="text-slate-500 text-[11px] leading-snug block">Ask letters, programming codes, essays or academic translation details in clean English.</span>
          </div>
        </div>
      </div>

      {/* Suggestion cards in pristine, clean slate-border ChatGPT grid style */}
      <div className="space-y-3.5">
        <h3 className="text-[11px] font-extrabold text-slate-500 uppercase tracking-widest flex items-center gap-1.5 px-1">
          <MessageSquare className="w-3.5 h-3.5 text-[#10a37f]" />
          <span>Udaharanangal (Quick Prompt Suggestions)</span>
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" id="preset-grid">
          {filteredPresets.map((preset: PromptTemplate, idx: number) => {
            const isMalayalam = preset.category === "malayalam";
            const isManglish = preset.category === "manglish";
            const isEnglish = preset.category === "english";

            return (
              <button
                key={idx}
                id={`preset-card-${idx}`}
                onClick={() => onSelectPrompt(preset.prompt)}
                className="text-left p-4 rounded-xl bg-white hover:bg-slate-50 border border-slate-200/80 hover:border-[#10a37f]/50 transition-all duration-200 shadow-xxs hover:shadow-xs group cursor-pointer"
              >
                <div className="flex items-center justify-between pointer-events-none mb-1.5">
                  <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded-md ${
                    isMalayalam ? "bg-rose-50 text-rose-700 border border-rose-100/60" :
                    isManglish ? "bg-amber-50 text-amber-700 border border-amber-100/60" :
                    isEnglish ? "bg-blue-50 text-blue-700 border border-blue-100/60" :
                    "bg-slate-100 text-slate-700 border border-slate-200"
                  }`}>
                    {preset.category}
                  </span>
                  <span className="text-slate-400 group-hover:text-[#10a37f] transition-colors">
                    <ChevronRight className="w-4 h-4" />
                  </span>
                </div>
                <h4 className="font-bold text-xs mb-0.5 text-slate-800 pointer-events-none group-hover:text-[#10a37f]">
                  {preset.title}
                </h4>
                <p className="text-[11px] text-slate-500 line-clamp-1 pointer-events-none">
                  "{preset.subtitle}"
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
