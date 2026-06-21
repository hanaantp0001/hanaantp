import { ChatSession } from "../types";
import { ThemeConfig } from "../themes";
import { CleanChatLogo } from "./CleanChatLogo";
import { 
  MessageSquare, 
  Plus, 
  Trash2, 
  Languages, 
  Sparkles, 
  X,
  User,
  AlertCircle,
  LogOut,
  Cloud,
  Check
} from "lucide-react";

interface SidebarProps {
  sessions: ChatSession[];
  activeSessionId: string;
  onSelectSession: (id: string) => void;
  onNewSession: (languageMode?: "all" | "malayalam" | "manglish" | "english") => void;
  onDeleteSession: (id: string, e: React.MouseEvent) => void;
  isOpen: boolean;
  onToggle: () => void;
  isApiKeyConfigured: boolean;
  currentTheme: ThemeConfig;
  user: any;
  onSignIn: () => void;
  onSignOut: () => void;
  isSyncing: boolean;
}

export function Sidebar({
  sessions,
  activeSessionId,
  onSelectSession,
  onNewSession,
  onDeleteSession,
  isOpen,
  onToggle,
  isApiKeyConfigured,
  currentTheme,
  user,
  onSignIn,
  onSignOut,
  isSyncing
}: SidebarProps) {
  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-40 md:hidden transition-opacity"
          onClick={onToggle}
          id="mobile-backdrop"
        />
      )}

      {/* Actual Sidebar Drawer with ChatGPT dark sidebar styles or glassmorphic gradients */}
      <aside 
        id="sidebar-container"
        className={`fixed inset-y-0 left-0 z-45 w-76 ${
          (currentTheme.id === 'copilot' || currentTheme.id === 'chatgpt-light') 
            ? currentTheme.sidebarBg 
            : 'bg-[#171717] text-slate-200'
        } flex flex-col border-r ${
          currentTheme.id === 'chatgpt-light' 
            ? 'border-pink-200/40' 
            : currentTheme.id === 'copilot' 
              ? 'border-white/10' 
              : 'border-[#2d2d2d]'
        } transition-transform duration-300 md:translate-x-0 md:static ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header Branding with beautiful OpenAI style logo */}
        <div className={`p-4 border-b flex items-center justify-between ${
          currentTheme.id === 'chatgpt-light' 
            ? 'border-pink-200/45' 
            : currentTheme.id === 'copilot' 
              ? 'border-white/10' 
              : 'border-[#2d2d2d]'
        }`}>
          <div className="flex items-center gap-2.5">
            <CleanChatLogo currentTheme={currentTheme} size="custom" customSizeClass="w-9 h-9" />
            <div>
              <h1 className={`font-sans font-black tracking-tight text-base leading-none ${
                currentTheme.id === 'chatgpt-light' ? 'text-slate-900' : 'text-white'
              }`}>Clean Chat</h1>
              <span className={`text-[11px] font-bold block mt-1 ${
                currentTheme.id === 'chatgpt-light' ? 'text-slate-600' : 'text-slate-400'
              }`}>Clean Chat AI {currentTheme.icon}</span>
            </div>
          </div>
          
          {/* Close button on mobile */}
          <button 
            id="btn-close-sidebar"
            onClick={onToggle} 
            className={`md:hidden p-1.5 rounded-lg transition ${
              currentTheme.id === 'chatgpt-light' 
                ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50' 
                : 'text-slate-400 hover:text-white hover:bg-[#2d2d2d]'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Create Chat Actions with premium liquid glass and theme-adaptive coloring */}
        <div className="p-3.5 space-y-2.5">
          <button
            id="btn-new-chat-general"
            onClick={() => {
              onNewSession("all");
              if (window.innerWidth < 768) onToggle();
            }}
            className={`w-full flex items-center justify-center gap-2 text-white font-extrabold py-3 px-4 rounded-xl transition-all duration-300 active:scale-95 cursor-pointer text-xs uppercase tracking-wider relative overflow-hidden group hover:scale-[1.02] ${
              (currentTheme.id === 'copilot' || currentTheme.id === 'chatgpt-light')
                ? 'bg-gradient-to-tr from-pink-500 via-purple-500 to-indigo-500 shadow-[0_4px_15px_rgba(236,72,153,0.35)] border border-white/20'
                : 'bg-[#10a37f] hover:bg-[#0c8567] shadow-sm'
            }`}
          >
            <Plus className="w-4 h-4 text-white shrink-0 group-hover:rotate-90 transition-transform duration-300" />
            <span className="font-extrabold leading-none">New Chat / പുതിയ ചാറ്റ്</span>
          </button>

          {/* Quick Language Quick Actions */}
          <div className="grid grid-cols-3 gap-1.5 text-[11px] font-bold mt-2.5">
            <button
              id="preset-only-malayalam"
              onClick={() => {
                onNewSession("malayalam");
                if (window.innerWidth < 768) onToggle();
              }}
              className={`py-2 px-1 text-xs border rounded-xl transition duration-200 cursor-pointer text-center font-bold ${
                currentTheme.id === 'chatgpt-light'
                  ? 'bg-white/50 hover:bg-white/80 border-pink-200/50 text-slate-800 shadow-xs'
                  : currentTheme.id === 'copilot'
                    ? 'bg-white/10 hover:bg-white/20 border-white/10 text-white'
                    : 'bg-[#212121] hover:bg-[#2d2d2d] text-slate-350 border border-[#303030]'
              }`}
              title="Start a Malayalam-only chat session"
            >
              Malayalam
            </button>
            <button
              id="preset-only-manglish"
              onClick={() => {
                onNewSession("manglish");
                if (window.innerWidth < 768) onToggle();
              }}
              className={`py-2 px-1 text-xs border rounded-xl transition duration-200 cursor-pointer text-center font-bold ${
                currentTheme.id === 'chatgpt-light'
                  ? 'bg-white/50 hover:bg-white/80 border-pink-200/50 text-slate-800 shadow-xs'
                  : currentTheme.id === 'copilot'
                    ? 'bg-white/10 hover:bg-white/20 border-white/10 text-white'
                    : 'bg-[#212121] hover:bg-[#2d2d2d] text-slate-350 border border-[#303030]'
              }`}
              title="Start a Manglish-only chat session"
            >
              Manglish
            </button>
            <button
              id="preset-only-english"
              onClick={() => {
                onNewSession("english");
                if (window.innerWidth < 768) onToggle();
              }}
              className={`py-2 px-1 text-xs border rounded-xl transition duration-200 cursor-pointer text-center font-bold ${
                currentTheme.id === 'chatgpt-light'
                  ? 'bg-white/50 hover:bg-white/80 border-pink-200/50 text-slate-800 shadow-xs'
                  : currentTheme.id === 'copilot'
                    ? 'bg-white/10 hover:bg-white/20 border-white/10 text-white'
                    : 'bg-[#212121] hover:bg-[#2d2d2d] text-slate-350 border border-[#303030]'
              }`}
              title="Start an English-only chat session"
            >
              English
            </button>
          </div>
        </div>

        {/* Sessions Recents Navigation */}
        <div className="flex-1 overflow-y-auto px-2 py-3 space-y-1">
          <div className="px-3 py-1.5 text-[11px] font-extrabold text-slate-500 uppercase tracking-widest flex items-center justify-between">
            <span>Recent Chats</span>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
              currentTheme.id === 'chatgpt-light'
                ? 'bg-white/80 text-pink-600 border-pink-200/50 shadow-xxs'
                : 'bg-[#2d2d2d] text-slate-300 border-[#3d3d3d]'
            }`}>
              {sessions.length}
            </span>
          </div>

          {sessions.length === 0 ? (
            <div className="p-4 text-center text-slate-500 text-xs italic">
              Sambhashanangal lbyamalla
            </div>
          ) : (
            sessions.map((session) => {
              const isActive = session.id === activeSessionId;
              let langBadge = "";
              if (session.primaryLanguage === "malayalam") langBadge = "ML";
              if (session.primaryLanguage === "manglish") langBadge = "MG";
              if (session.primaryLanguage === "english") langBadge = "EN";

              return (
                <div
                  key={session.id}
                  id={`chat-item-${session.id}`}
                  onClick={() => {
                    onSelectSession(session.id);
                    if (window.innerWidth < 768) onToggle();
                  }}
                  className={`group relative flex items-center gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer transition-all border ${
                    isActive
                      ? currentTheme.id === 'chatgpt-light'
                        ? "bg-white border-pink-200/60 text-slate-900 shadow-md font-bold"
                        : currentTheme.id === 'copilot'
                          ? "bg-white/15 border-white/20 text-white shadow-xs"
                          : "bg-[#212121] border-[#353535] text-white shadow-xs"
                      : currentTheme.id === 'chatgpt-light'
                        ? "border-transparent text-slate-700 hover:bg-white/35 hover:text-slate-950"
                        : currentTheme.id === 'copilot'
                          ? "border-transparent text-slate-350 hover:bg-white/5 hover:text-white"
                          : "border-transparent text-slate-400 hover:bg-[#212121]/60 hover:text-white"
                  }`}
                >
                  <MessageSquare className={`w-4 h-4 shrink-0 ${
                    isActive 
                      ? (currentTheme.id === 'chatgpt-light' ? "text-pink-500" : currentTheme.id === 'copilot' ? "text-pink-400" : "text-[#10a37f]") 
                      : (currentTheme.id === 'chatgpt-light' ? "text-slate-500" : "text-slate-550")
                  }`} />
                  
                  <div className="flex-1 overflow-hidden">
                    <p className={`text-xs font-semibold truncate leading-tight pr-6 ${
                      isActive 
                        ? (currentTheme.id === 'chatgpt-light' ? "text-slate-950 font-extrabold" : "text-white") 
                        : (currentTheme.id === 'chatgpt-light' ? "text-slate-800 font-medium" : "text-slate-300")
                    }`}>
                      {session.title || "Untitled Chat"}
                    </p>
                    <span className={`text-[10px] ${currentTheme.id === 'chatgpt-light' ? 'text-slate-600' : 'text-slate-500'} block mt-0.5 font-medium`}>
                      {session.createdAt} {langBadge && `• ${langBadge}`}
                    </span>
                  </div>

                  {/* Delete Button */}
                  <button
                    id={`btn-delete-${session.id}`}
                    onClick={(e) => onDeleteSession(session.id, e)}
                    className="absolute right-2 opacity-0 group-hover:opacity-100 p-1 rounded-md text-slate-500 hover:text-rose-450 hover:bg-rose-955/20 transition cursor-pointer"
                    title="Delete Chat"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Sidebar Info Section (Bottom Footer with developer profile styling) */}
        <div className={`p-3.5 border-t space-y-3 shrink-0 ${
          currentTheme.id === 'chatgpt-light' 
            ? 'bg-white/45 border-pink-200/40 shadow-[0_-2px_10px_rgba(236,72,153,0.05)]' 
            : 'bg-[#111111]/90 border-[#2d2d2d]'
        }`}>
          {/* Google Sign-In state handler */}
          {user ? (
            <div className={`p-2.5 rounded-xl border flex flex-col gap-2 ${
              currentTheme.id === 'chatgpt-light'
                ? 'bg-white/70 border-pink-100 shadow-xxs text-slate-800'
                : 'bg-[#181818] border-[#2c2c2c] text-slate-200'
            }`}>
              <div className="flex items-center gap-2">
                {user.photoURL ? (
                  <img 
                    src={user.photoURL} 
                    alt={user.displayName || "User Profile"} 
                    className="w-7 h-7 rounded-full object-cover border border-pink-400"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-pink-500 text-white flex items-center justify-center font-bold text-xs">
                    {(user.displayName || user.email || "G")[0].toUpperCase()}
                  </div>
                )}
                <div className="flex-1 overflow-hidden">
                  <p className="text-xs font-bold truncate leading-none">
                    {user.displayName || "Google User"}
                  </p>
                  <p className={`text-[10px] truncate ${currentTheme.id === 'chatgpt-light' ? 'text-slate-500' : 'text-slate-400'} mt-1`}>
                    {user.email}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <span className="flex h-2 w-2 relative" title="Cloud Synced!">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-450 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                  <Cloud className="w-3.5 h-3.5 text-green-500" />
                </div>
              </div>
              
              <div className="flex items-center justify-between border-t border-dashed pt-2 mt-1 border-slate-300/30">
                <span className="text-[9px] font-bold text-green-600 uppercase tracking-wider flex items-center gap-1">
                  <Check className="w-3 h-3" /> Chats Synced
                </span>
                <button
                  onClick={onSignOut}
                  className={`flex items-center gap-1 text-[10px] px-2 py-1 rounded-md transition duration-250 cursor-pointer font-bold ${
                    currentTheme.id === 'chatgpt-light'
                      ? 'bg-rose-50 text-rose-600 hover:bg-rose-100'
                      : 'bg-[#291415] text-rose-400 hover:bg-[#3d1a1d]'
                  }`}
                  title="Sign out of Google"
                >
                  <LogOut className="w-3 h-3" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          ) : (
            <div className={`p-2.5 rounded-xl border flex flex-col gap-2 ${
              currentTheme.id === 'chatgpt-light'
                ? 'bg-pink-50/50 border-pink-100 text-slate-800'
                : 'bg-[#212121]/50 border-[#2e2e2e] text-slate-300'
            }`}>
              <p className="text-[10px] font-bold leading-normal text-center">
                💬 Chats permanent aayi save cheyyaൻ Google Account use cheyyoo!
              </p>
              <button
                id="btn-sidebar-google-signin"
                onClick={onSignIn}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-tr from-pink-500 via-purple-500 to-indigo-500 hover:scale-[1.02] active:scale-95 text-white font-extrabold py-2.5 px-3 rounded-xl transition duration-300 shadow-md text-xs cursor-pointer"
              >
                <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                  <path d="M12.24 10.285V13.4h6.887C18.2 15.614 15.645 18 12.24 18c-3.29 0-5.97-2.68-5.97-5.97S8.95 6.06 12.24 6.06c1.47 0 2.81.5 3.86 1.425l2.43-2.43C16.895 3.51 14.73 2.64 12.24 2.64c-5.17 0-9.36 4.19-9.36 9.36s4.19 9.36 9.36 9.36c5.4 0 8.98-3.8 8.98-9.135 0-.54-.048-1.07-.135-1.55H12.24z"/>
                </svg>
                <span>Gmail / Google Sign In</span>
              </button>
            </div>
          )}

          {/* API Key warning if not set */}
          {!isApiKeyConfigured && (
            <div className="p-2.5 bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 rounded-lg text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>API Key needed</span>
              </div>
              <p className="text-[10px] leading-snug">
                Put your key in <strong>Settings &gt; Secrets</strong> list.
              </p>
            </div>
          )}

          <div className={`flex items-center gap-2 text-xs ${
            currentTheme.id === 'chatgpt-light' 
              ? 'text-slate-800 font-semibold' 
              : 'text-slate-450'
          }`}>
            <Languages className="w-4 h-4 text-[#10a37f]" />
            <span>Malayalam • Manglish • English</span>
          </div>

          <div className={`flex items-center gap-2 text-[11px] border-t pt-2 shrink-0 ${
            currentTheme.id === 'chatgpt-light' 
              ? 'text-slate-800 border-pink-200/45' 
              : 'text-slate-400 border-[#2d2d2d]'
          }`}>
            <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
              currentTheme.id === 'chatgpt-light' ? 'bg-pink-500' : 'bg-[#10a37f]'
            }`}>
              <User className="w-3 h-3 text-white" />
            </div>
            <span className="truncate font-medium">Personal Assistant Engine</span>
          </div>
        </div>
      </aside>
    </>
  );
}
