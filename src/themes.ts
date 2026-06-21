export interface ThemeConfig {
  id: string;
  nameMalayalam: string; // Will store Manglish/Latin transliteration now
  nameEnglish: string;
  bgClass: string;
  sidebarBg: string; // The Sidebar container background classes
  panelBg: string; // Main center panels
  textPrimary: string;
  textSecondary: string;
  borderClass: string; // standard border style
  accentBg: string; // Active buttons (e.g. "Plus / Send" styled with beautiful ChatGPT emerald)
  accentHoverBg: string; // Active button hovers
  userBubbleBg: string; // Chat balloon - User
  botBubbleBg: string; // Chat balloon - Companion
  inputBg: string; // Input containment
  glowClass: string;
  icon: string;
}

export const THEMES: ThemeConfig[] = [
  {
    id: "chatgpt-light",
    nameMalayalam: "Colorful Light 🌈",
    nameEnglish: "Rainbow Light",
    // Beautiful glassmorphic colorful animated mesh coordinates
    bgClass: "bg-colorful-light text-slate-900",
    sidebarBg: "bg-white/55 backdrop-blur-md text-slate-900 border-r border-pink-200/40 shadow-sm", 
    panelBg: "bg-white/45 backdrop-blur-md border border-white/70 shadow-lg rounded-2xl",
    textPrimary: "text-slate-900",
    textSecondary: "text-slate-705",
    borderClass: "border-pink-200/50",
    accentBg: "bg-gradient-to-tr from-pink-500 via-purple-500 to-indigo-500 text-white hover:opacity-95 shadow-md border-none transition-all duration-350",
    accentHoverBg: "hover:scale-105 hover:shadow-lg active:scale-95",
    userBubbleBg: "bg-gradient-to-r from-pink-100/90 via-purple-100/90 to-indigo-100/90 text-slate-900 border border-pink-200/50 shadow-xs", 
    botBubbleBg: "bg-white/55 backdrop-blur-xs border border-white/70 text-slate-800 shadow-xxs",
    inputBg: "bg-white/80 backdrop-blur-md border border-purple-250 focus-within:ring-4 focus-within:ring-pink-300/25 focus-within:border-pink-400 shadow-md",
    glowClass: "from-pink-500 via-purple-500 to-indigo-500",
    icon: "🌈"
  },
  {
    id: "chatgpt-dark",
    nameMalayalam: "GPT Dark (Noir)",
    nameEnglish: "GPT Sleek Dark",
    // Pristine high-contrast slate dark aesthetics
    bgClass: "bg-[#212121] text-slate-100",
    sidebarBg: "bg-[#171717] text-slate-100 border-r border-[#2f2f2f]",
    panelBg: "bg-[#2f2f2f] border border-[#3e3e3e] shadow-md",
    textPrimary: "text-slate-50",
    textSecondary: "text-slate-400",
    borderClass: "border-[#2f2f2f]",
    accentBg: "bg-[#10a37f] text-white hover:bg-[#0d8c6c] border border-transparent shadow-xs transition-colors",
    accentHoverBg: "hover:scale-[1.01] hover:shadow-md",
    userBubbleBg: "bg-[#2f2f2f] text-slate-100 border border-[#3f3f3f] shadow-sm",
    botBubbleBg: "bg-transparent text-slate-200",
    inputBg: "bg-[#2f2f2f]/90 border border-[#4f4f4f] focus-within:border-[#10a37f] focus-within:ring-4 focus-within:ring-[#10a37f]/20 shadow-lg",
    glowClass: "from-[#10a37f] to-emerald-400",
    icon: "⚫"
  },
  {
    id: "chatgpt-emerald",
    nameMalayalam: "Kerala Mint",
    nameEnglish: "Keralite Emerald",
    // Emerald green accents and soft mint background
    bgClass: "bg-[#f4faf7] text-slate-800",
    sidebarBg: "bg-[#0b2921] text-emerald-50 border-r border-[#123e32]",
    panelBg: "bg-white border border-emerald-100 shadow-sm",
    textPrimary: "text-[#0d3c30]",
    textSecondary: "text-emerald-700/80",
    borderClass: "border-emerald-100/80",
    accentBg: "bg-[#10a37f] text-white hover:bg-[#0d8c6c] border border-transparent shadow-xs transition-colors",
    accentHoverBg: "hover:scale-[1.01] hover:shadow-md",
    userBubbleBg: "bg-[#e2f4ed] text-emerald-950 border border-emerald-250 shadow-xxs",
    botBubbleBg: "bg-white/80 border border-emerald-100/60 text-slate-850",
    inputBg: "bg-white border border-[#b2ded0] focus-within:border-[#10a37f] focus-within:ring-4 focus-within:ring-emerald-400/10 shadow-sm",
    glowClass: "from-[#10a37f] to-teal-400",
    icon: "🌱"
  },
  {
    id: "chatgpt-orange",
    nameMalayalam: "Sunset Gold",
    nameEnglish: "Sunset Amber",
    // Warm sunny tones
    bgClass: "bg-[#faf8f5] text-slate-800",
    sidebarBg: "bg-[#2d1a0d] text-amber-50 border-r border-[#412918]",
    panelBg: "bg-white border border-amber-100 shadow-sm",
    textPrimary: "text-[#3e1f0e]",
    textSecondary: "text-amber-800/80",
    borderClass: "border-amber-100/80",
    accentBg: "bg-[#ea580c] text-white hover:bg-[#c2410c] border border-transparent shadow-xs transition-colors",
    accentHoverBg: "hover:scale-[1.01] hover:shadow-md",
    userBubbleBg: "bg-[#fef1e6] text-amber-950 border border-amber-200 shadow-xxs",
    botBubbleBg: "bg-white/80 border border-amber-100/60 text-slate-850",
    inputBg: "bg-white border border-[#eed4bd] focus-within:border-[#ea580c] focus-within:ring-4 focus-within:ring-orange-400/15 shadow-sm",
    glowClass: "from-[#ea580c] to-amber-400",
    icon: "🌅"
  },
  {
    id: "chatgpt-lavender",
    nameMalayalam: "Royal Lilac",
    nameEnglish: "Royal Lavender",
    // Indigo/Lavender pastel tones
    bgClass: "bg-[#f8f7fc] text-slate-800",
    sidebarBg: "bg-[#1c1833] text-indigo-50 border-r border-[#2b254d]",
    panelBg: "bg-white border border-indigo-100 shadow-sm",
    textPrimary: "text-[#1d1254]",
    textSecondary: "text-indigo-700/80",
    borderClass: "border-indigo-100/80",
    accentBg: "bg-[#6366f1] text-white hover:bg-[#4f46e5] border border-transparent shadow-xs transition-colors",
    accentHoverBg: "hover:scale-[1.01] hover:shadow-md",
    userBubbleBg: "bg-[#eef0ff] text-indigo-950 border border-indigo-200 shadow-xxs",
    botBubbleBg: "bg-white/80 border border-indigo-100/60 text-slate-850",
    inputBg: "bg-white border border-[#cbd5e1] focus-within:border-[#6366f1] focus-within:ring-4 focus-within:ring-indigo-400/15 shadow-sm",
    glowClass: "from-[#6366f1] to-purple-400",
    icon: "🌸"
  },
  {
    id: "copilot",
    nameMalayalam: "Copilot-Theme",
    nameEnglish: "Windows Copilot",
    // Stunning Glassmorphic, ambient mesh gradient representing the image provided by user
    bgClass: "bg-copilot-mesh text-slate-900",
    sidebarBg: "bg-[#121215]/95 text-slate-100 border-r border-slate-800/60 backdrop-blur-md",
    panelBg: "bg-white/35 backdrop-blur-md border border-white/60 shadow-xl rounded-2xl",
    textPrimary: "text-slate-950",
    textSecondary: "text-slate-800/80",
    borderClass: "border-white/40",
    accentBg: "bg-gradient-to-tr from-pink-500 via-indigo-500 to-amber-500 text-white hover:opacity-95 shadow-md border-none transition-all duration-300",
    accentHoverBg: "hover:scale-105 hover:shadow-lg active:scale-95",
    userBubbleBg: "bg-white/80 text-indigo-950 border border-white/80 shadow-md",
    botBubbleBg: "bg-white/45 backdrop-blur-sm border border-white/60 text-slate-900 shadow-sm",
    inputBg: "bg-white/75 backdrop-blur-md border border-white/75 focus-within:ring-4 focus-within:ring-pink-300/20 focus-within:border-pink-300 shadow-md",
    glowClass: "from-pink-500 via-purple-500 to-indigo-500",
    icon: "🌀"
  }
];
