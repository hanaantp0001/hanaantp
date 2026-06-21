import { useState, useEffect, useRef } from "react";
import { 
  Sparkles, 
  Send, 
  Plus, 
  Trash2, 
  MessageSquare, 
  AlertCircle,
  Menu,
  ChevronRight,
  RefreshCw,
  Clock,
  ExternalLink,
  Bot,
  User,
  Info,
  Mic,
  MicOff,
  Image,
  Video,
  X,
  Paperclip,
  PlusCircle,
  Cloud,
  CheckCircle,
  Check,
  LogOut,
  Sparkle,
  Settings
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Message, ChatSession } from "./types";
import { Sidebar } from "./components/Sidebar";
import { WelcomeScreen } from "./components/WelcomeScreen";
import { THEMES, ThemeConfig } from "./themes";
import { CleanChatLogo } from "./components/CleanChatLogo";
import { onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";
import { auth, googleProvider } from "./firebase";
import { getUserSessions, saveUserSession, deleteUserSession, saveAllUserSessions } from "./db";


export interface GoogleAccountProfile {
  email: string;
  displayName: string;
  photoURL?: string;
  createdAt: string;
}

export default function App() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string>("");
  const [activeThemeId, setActiveThemeId] = useState<string>(() => {
    return localStorage.getItem("swantham_gemini_theme") || "chatgpt-light";
  });
  const [inputMessage, setInputMessage] = useState<string>("");
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isApiKeyConfigured, setIsApiKeyConfigured] = useState<boolean>(true);
  const [systemStatus, setSystemStatus] = useState<"connected" | "checking" | "error">("checking");
  const [currentUtcTime, setCurrentUtcTime] = useState<string>("");

  // In-App Google Profiles database
  const [googleAccounts, setGoogleAccounts] = useState<GoogleAccountProfile[]>([]);
  const [activeAccount, setActiveAccount] = useState<GoogleAccountProfile | null>(null);
  // Align with existing components and hooks that expect a Firebase-like user object with .uid
  const user = activeAccount ? {
    ...activeAccount,
    uid: activeAccount.email.replace(/[^a-zA-Z0-9]/g, "_") // safe firebase-compatible uid
  } : null;
  
  const [isFirebaseLoading, setIsFirebaseLoading] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [showSignInModal, setShowSignInModal] = useState<boolean>(false);
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);

  // States for account registration form
  const [newAccountEmail, setNewAccountEmail] = useState<string>("");
  const [newAccountName, setNewAccountName] = useState<string>("");
  const [isAddingNewProfile, setIsAddingNewProfile] = useState<boolean>(false);

  // Modern input elements (Attachments, voice dictation, plus menu)
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isPlusMenuOpen, setIsPlusMenuOpen] = useState<boolean>(false);
  const [recognitionInstance, setRecognitionInstance] = useState<any>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeSession = sessions.find(s => s.id === activeSessionId) || sessions[0];

  // Helper to create an initial session for a Google account
  const createInitialSessionForAccount = (email: string, langMode: "all" | "malayalam" | "manglish" | "english" = "all") => {
    const defaultSession: ChatSession = {
      id: "session_" + Date.now(),
      title: langMode === "all" ? "Aadhya Chat" : `New ${langMode.toUpperCase()} Chat`,
      createdAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      messages: [],
      primaryLanguage: langMode
    };
    setSessions([defaultSession]);
    setActiveSessionId(defaultSession.id);
    localStorage.setItem("swantham_gemini_sessions_" + email, JSON.stringify([defaultSession]));
  };

  const handleSelectAccountProfile = (account: GoogleAccountProfile) => {
    setActiveAccount(account);
    localStorage.setItem("swantham_gemini_last_active_email", account.email);
    
    // Load sessions belonging to this email
    const sessionKey = "swantham_gemini_sessions_" + account.email;
    const stored = localStorage.getItem(sessionKey);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        setSessions(parsed);
        setActiveSessionId(parsed[0].id);
      } else {
        createInitialSessionForAccount(account.email);
      }
    } else {
      createInitialSessionForAccount(account.email);
    }
  };

  const handleAddAndSelectAccount = (email: string, name: string) => {
    const trimmedEmail = email.trim();
    const trimmedName = name.trim();
    if (!trimmedEmail || !trimmedName) return;
    
    const newProfile: GoogleAccountProfile = {
      email: trimmedEmail,
      displayName: trimmedName,
      photoURL: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(trimmedName)}`,
      createdAt: new Date().toLocaleDateString()
    };
    
    // Check if account already exists
    const exists = googleAccounts.find(p => p.email.toLowerCase() === trimmedEmail.toLowerCase());
    if (exists) {
      handleSelectAccountProfile(exists);
      return;
    }
    
    const updatedProfiles = [...googleAccounts, newProfile];
    setGoogleAccounts(updatedProfiles);
    localStorage.setItem("swantham_gemini_google_profiles", JSON.stringify(updatedProfiles));
    
    handleSelectAccountProfile(newProfile);
  };

  // Google Sign-In and Sign-Out actions (triggers custom selector inside app)
  const handleSignIn = async () => {
    setShowSignInModal(true);
  };

  const handleSignOut = async () => {
    // Treat "Logout" as triggering account switcher choice
    setShowSignInModal(true);
  };

  // Load chat sessions based on current active Google account
  useEffect(() => {
    try {
      // Load accounts saved locally
      const savedProfiles = localStorage.getItem("swantham_gemini_google_profiles");
      let parsedProfiles: GoogleAccountProfile[] = savedProfiles ? JSON.parse(savedProfiles) : [];
      
      const lastActiveEmail = localStorage.getItem("swantham_gemini_last_active_email");
      
      // If none, pre-register the user's primary metadata email (Hanaan TP)
      if (!Array.isArray(parsedProfiles) || parsedProfiles.length === 0) {
        const defaultProfile: GoogleAccountProfile = {
          email: "hanaantp0001@gmail.com",
          displayName: "Hanaan TP",
          photoURL: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
          createdAt: new Date().toLocaleDateString()
        };
        parsedProfiles = [defaultProfile];
        localStorage.setItem("swantham_gemini_google_profiles", JSON.stringify(parsedProfiles));
      }
      
      setGoogleAccounts(parsedProfiles);
      
      // Select the active account (or default to hanaan)
      const currentActive = parsedProfiles.find(p => p.email === lastActiveEmail) || parsedProfiles[0];
      setActiveAccount(currentActive);
      localStorage.setItem("swantham_gemini_last_active_email", currentActive.email);
      
      // Load sessions for this specific active account
      const sessionKey = "swantham_gemini_sessions_" + currentActive.email;
      const stored = localStorage.getItem(sessionKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSessions(parsed);
          setActiveSessionId(parsed[0].id);
        } else {
          createInitialSessionForAccount(currentActive.email);
        }
      } else {
        // Migration of legacy sessions if they exist
        const legacyStored = localStorage.getItem("swantham_gemini_sessions");
        if (legacyStored) {
          const parsed = JSON.parse(legacyStored);
          setSessions(parsed);
          setActiveSessionId(parsed[0].id);
          localStorage.setItem(sessionKey, legacyStored);
        } else {
          createInitialSessionForAccount(currentActive.email);
        }
      }
      
      // Trigger onboarding Gmail selection pop-up on first load if not skipped before
      const hasSkipped = localStorage.getItem("swantham_gemini_skipped_signin");
      if (hasSkipped !== "true" && parsedProfiles.length <= 1 && !lastActiveEmail) {
        setTimeout(() => {
          setShowSignInModal(true);
        }, 800);
      }
    } catch (err) {
      console.error("Local database account initialization error", err);
      // fallback safe profiles
      const fallbackAccount: GoogleAccountProfile = {
        email: "hanaantp0001@gmail.com",
        displayName: "Hanaan TP",
        createdAt: new Date().toLocaleDateString()
      };
      setGoogleAccounts([fallbackAccount]);
      setActiveAccount(fallbackAccount);
      createInitialSessionForAccount(fallbackAccount.email);
    }

    // Check backend state & API Key config status
    checkConfigStatus();

    // Set dynamic system clock display
    const updateTime = () => {
      const now = new Date();
      setCurrentUtcTime(now.toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit', hour12: true }));
    };
    updateTime();
    const interval = setInterval(updateTime, 15000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  // Save sessions to local storage whenever they change (with account isolation)
  useEffect(() => {
    if (sessions.length > 0 && activeAccount) {
      const sessionKey = "swantham_gemini_sessions_" + activeAccount.email;
      localStorage.setItem(sessionKey, JSON.stringify(sessions));
      // Standard local fallback
      localStorage.setItem("swantham_gemini_sessions", JSON.stringify(sessions));
    }
  }, [sessions, activeAccount]);

  // Scroll to bottom when messages are added or loading state changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [sessions, activeSessionId, isLoading]);

  // Support real speech recognition & immersive simulated fallback
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      
      const currentLang = activeSession?.primaryLanguage || "all";
      rec.lang = currentLang === "malayalam" ? "ml-IN" : "en-IN";

      rec.onstart = () => {
        setIsListening(true);
      };

      rec.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        if (text) {
          setInputMessage(prev => prev ? prev + " " + text : text);
        }
      };

      rec.onerror = (e: any) => {
        console.error("Speech recognition error status:", e);
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      setRecognitionInstance(rec);
    }
  }, [activeSession?.primaryLanguage]);

  const toggleListening = () => {
    if (isListening) {
      if (recognitionInstance) {
        recognitionInstance.stop();
      }
      setIsListening(false);
    } else {
      if (recognitionInstance) {
        try {
          recognitionInstance.start();
        } catch (err) {
          console.error("Failed to start speech instance:", err);
          // Auto recover
          try { recognitionInstance.stop(); } catch(e){}
        }
      } else {
        // High fidelity simulated dictation helper for iframe constraints
        const speechSimulations = [
          "Sugamaano bro? Enthanu vishesham? Nalla oru painting cheithu tharumo?",
          "Can you write a cool recipe for Malabar Biryani in Malayalam script?",
          "Check standard Gemini capabilities regarding Keralite cultural elements.",
          "Nalla oru joke parayoo machane! Sirippikkuna onnu!",
          "Create a scenic image of a houseboat in Alappuzha backwaters.",
          "Generate a brief video of a traditional houseboat sailing in heavy Kerala rain"
        ];
        const randomPhrase = speechSimulations[Math.floor(Math.random() * speechSimulations.length)];
        
        let progress = "";
        let i = 0;
        const typingInterval = setInterval(() => {
          if (i < randomPhrase.length) {
            progress += randomPhrase[i];
            setInputMessage(progress);
            i++;
          } else {
            clearInterval(typingInterval);
          }
        }, 22);
      }
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        alert("Please select a valid image file.");
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setAttachedImage(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
    // Clear value to allow same-file selection again
    if (e.target) e.target.value = "";
  };

  // Poll background video status and auto-download once processing completes
  useEffect(() => {
    const processingMsg = activeSession?.messages.find(m => m.videoStatus === "processing" && m.videoOperationName);
    if (!processingMsg) return;

    const intervalId = setInterval(async () => {
      try {
        const res = await fetch("/api/video-status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ operationName: processingMsg.videoOperationName })
        });
        if (!res.ok) return;
        const data = await res.json();
        
        if (data.done) {
          const videoUrl = data.videoUrl || `/api/video-download?operationName=${encodeURIComponent(processingMsg.videoOperationName!)}`;
          setSessions(prev => prev.map(s => {
            if (s.id === activeSessionId) {
              return {
                ...s,
                messages: s.messages.map(m => {
                  if (m.id === processingMsg.id) {
                    return {
                      ...m,
                      videoStatus: "done",
                      videoUrl: videoUrl,
                      content: m.content + "\n\n🎉 **Ente video fully render aayittundu! Enjoy the video, machane!**"
                    };
                  }
                  return m;
                })
              };
            }
            return s;
          }));
          clearInterval(intervalId);
        }
      } catch (err) {
        console.error("Error polling video operation status:", err);
      }
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(intervalId);
  }, [sessions, activeSessionId, activeSession?.messages]);

  const checkConfigStatus = async () => {
    try {
      setSystemStatus("checking");
      const res = await fetch("/api/config-status");
      if (res.ok) {
        const data = await res.json();
        setIsApiKeyConfigured(data.isApiKeyConfigured);
        setSystemStatus("connected");
      } else {
        setSystemStatus("error");
      }
    } catch {
      setSystemStatus("error");
    }
  };

  const handleNewSession = (langMode?: "all" | "malayalam" | "manglish" | "english") => {
    const selectedMode = langMode || "all";
    let title = "Puthiya Sambhashanam";
    if (selectedMode === "malayalam") title = "മലയാളം ചാറ്റ്";
    if (selectedMode === "manglish") title = "Manglish Chat 💬";
    if (selectedMode === "english") title = "English Guide 🇺🇸";

    const newSession: ChatSession = {
      id: "session_" + Date.now(),
      title,
      createdAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      messages: [],
      primaryLanguage: selectedMode
    };

    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newSession.id);

    if (user) {
      saveUserSession(user.uid, newSession).catch(err => 
        console.error("Failed to save new session on Firestore", err)
      );
    }
  };

  const handleSelectSession = (id: string) => {
    setActiveSessionId(id);
  };

  const handleDeleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const filtered = sessions.filter(s => s.id !== id);
    setSessions(filtered);
    
    if (user) {
      deleteUserSession(user.uid, id).catch(err => 
        console.error("Failed to delete session on Firestore", err)
      );
    }

    if (activeSessionId === id) {
      if (filtered.length > 0) {
        setActiveSessionId(filtered[0].id);
      } else {
        const defaultSession: ChatSession = {
          id: "session_" + Date.now(),
          title: "New Chat",
          createdAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }),
          messages: [],
          primaryLanguage: "all"
        };
        setSessions([defaultSession]);
        setActiveSessionId(defaultSession.id);
        
        if (user) {
          saveUserSession(user.uid, defaultSession).catch(err => 
            console.error("Failed to save default session on Firestore", err)
          );
        }
      }
    }
  };

  const handleUpdateSessionLanguage = (sessionId: string, lang: "all" | "malayalam" | "manglish" | "english") => {
    setSessions(prev => {
      const updated = prev.map(s => {
        if (s.id === sessionId) {
          let defaultTitle = s.title;
          if (s.messages.length === 0) {
            if (lang === "malayalam") defaultTitle = "മലയാളം ചാറ്റ്";
            else if (lang === "manglish") defaultTitle = "Manglish Chat 💬";
            else if (lang === "english") defaultTitle = "English Guide 🇺🇸";
          }
          const updatedSession = { ...s, primaryLanguage: lang, title: defaultTitle };
          
          if (user) {
            saveUserSession(user.uid, updatedSession).catch(err => 
              console.error("Failed to update session language on Firestore:", err)
            );
          }

          return updatedSession;
        }
        return s;
      });
      return updated;
    });
  };

  const currentTheme = THEMES.find(t => t.id === activeThemeId) || THEMES[0];

  const handleThemeChange = (themeId: string) => {
    setActiveThemeId(themeId);
    localStorage.setItem("swantham_gemini_theme", themeId);
  };

  const handleSendMessage = async (customPrompt?: string) => {
    const messageToSend = (customPrompt || inputMessage).trim();
    if (!messageToSend && !attachedImage) return;

    if (!isApiKeyConfigured) {
      alert("Missing GEMINI_API_KEY. Please set this secret inside Key/Secrets UI on top before chatting!");
      return;
    }

    const newUserMessage: Message = {
      id: "msg_" + Date.now(),
      role: "user",
      content: messageToSend || "Njaan oru image select cheythitund. Enthelaanu ithil ullathenn parayan tharumo?",
      imageUrl: attachedImage || undefined,
      timestamp: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
    };

    // Statically clear the image preview
    setAttachedImage(null);

    // Append to active session
    let updatedSession = { ...activeSession };
    updatedSession.messages = [...updatedSession.messages, newUserMessage];
    
    // Auto name the session title if it's the first message
    if (updatedSession.messages.length === 1) {
      const displayTitle = messageToSend || "Image Analysis 🖼️";
      updatedSession.title = displayTitle.length > 25 
        ? displayTitle.substring(0, 25) + "..."
        : displayTitle;
    }

    setSessions(prev => prev.map(s => s.id === activeSessionId ? updatedSession : s));
    if (user) {
      saveUserSession(user.uid, updatedSession).catch(err => 
        console.error("Failed to sync user message on Firestore:", err)
      );
    }

    setInputMessage("");
    setIsPlusMenuOpen(false); // Close quick actions menu if open
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updatedSession.messages })
      });

      if (!response.ok) {
        throw new Error("API call response was not ok");
      }

      const data = await response.json();
      
      const newAssistantMessage: Message = {
        id: "msg_" + (Date.now() + 1),
        role: "assistant",
        content: data.content,
        imageUrl: data.imageUrl,
        videoUrl: data.videoUrl,
        videoOperationName: data.videoOperationName,
        videoStatus: data.videoStatus,
        timestamp: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
      };

      updatedSession.messages = [...updatedSession.messages, newAssistantMessage];
      setSessions(prev => prev.map(s => s.id === activeSessionId ? updatedSession : s));
      
      if (user) {
        saveUserSession(user.uid, updatedSession).catch(err => 
          console.error("Failed to sync assistant message on Firestore:", err)
        );
      }
    } catch (err: any) {
      console.error(err);
      const errorMessage: Message = {
        id: "msg_err" + Date.now(),
        role: "assistant",
        content: "🔴 **Oops! Connect aayilla.**\n\nGmail API limits athava config status check cheyyuka. API request pathil error undayirikkanam. Settings-il `GEMINI_API_KEY` register cheythittundennurappu varuthuka. Veendum try cheyyoo!",
        timestamp: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
      };
      updatedSession.messages = [...updatedSession.messages, errorMessage];
      setSessions(prev => prev.map(s => s.id === activeSessionId ? updatedSession : s));
      
      if (user) {
        saveUserSession(user.uid, updatedSession).catch(err => 
          console.error("Failed to sync error message on Firestore:", err)
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Check language selection active states
  const currentLangMode = activeSession?.primaryLanguage || "all";

  return (
    <div className={`flex h-screen w-full ${currentTheme.bgClass} ${currentTheme.textPrimary} font-sans overflow-hidden`}>
      
      {/* Sidebar - Fully Styled with theme background parameters */}
      <Sidebar 
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={handleSelectSession}
        onNewSession={handleNewSession}
        onDeleteSession={handleDeleteSession}
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        isApiKeyConfigured={isApiKeyConfigured}
        currentTheme={currentTheme}
        user={user}
        onSignIn={handleSignIn}
        onSignOut={handleSignOut}
        isSyncing={isSyncing}
      />

      {/* Main Container View */}
      <main className="flex-1 flex flex-col relative h-full overflow-hidden">
        
        {/* Upper Dashboard Widget bar (Bento Style) */}
        <header className={`h-16 flex items-center justify-between px-6 border-b ${currentTheme.borderClass} bg-white/45 backdrop-blur-md shrink-0`}>
          <div className="flex items-center gap-4">
            <button 
              id="btn-sidebar-toggle"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-xl text-slate-550 hover:text-slate-900 hover:bg-black/5 transition md:hidden cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>
            
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${systemStatus === "connected" ? "bg-green-500 shadow-md shadow-green-500/50 animate-pulse" : "bg-orange-500"}`}></span>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 hidden sm:inline-block">
                {systemStatus === "connected" ? "Private Engine: Connected" : "Connecting..."}
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 sm:hidden animate-pulse">
                Live
              </span>
            </div>
          </div>

          {/* Quick Active Config Information */}
          <div className="flex items-center gap-3">
            <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-white/70 border border-slate-200/50 rounded-lg text-xs font-mono text-slate-550 shadow-xxs">
              <Clock className="w-3.5 h-3.5 text-blue-500" />
              <span>{currentUtcTime || "Live"}</span>
            </div>
            
            <button
              id="btn-clear-chat-thread"
              onClick={() => {
                if (window.confirm("Are you sure you want to clear this chat history?")) {
                  const clearedSession = { ...activeSession, messages: [] };
                  setSessions(prev => prev.map(s => s.id === activeSessionId ? clearedSession : s));
                  if (user) {
                    saveUserSession(user.uid, clearedSession).catch(err => 
                      console.error("Failed to clear chat feed on Firestore:", err)
                    );
                  }
                }
              }}
              className="px-3 py-1.5 text-xs font-extrabold bg-white/45 hover:bg-white/70 backdrop-blur-md border border-white/60 text-slate-705 rounded-xl transition shadow-xxs cursor-pointer"
            >
              Clear Feed
            </button>

            <button
              id="btn-new-thread-header"
              onClick={() => handleNewSession()}
              className={`px-3 py-1.5 text-xs font-extrabold ${currentTheme.accentBg} ${currentTheme.accentHoverBg} rounded-xl transition active:scale-95 cursor-pointer`}
            >
              New Thread
            </button>

            <button
              id="btn-app-settings"
              onClick={() => setShowSettingsModal(true)}
              className="p-2 text-slate-500 hover:text-slate-900 hover:bg-black/5 dark:hover:text-white dark:hover:bg-white/10 rounded-xl transition active:scale-95 cursor-pointer"
              title="Settings (ക്രമീകരണങ്ങൾ / Theme / Language)"
            >
              <Settings className="w-5 h-5 transition-transform duration-300 hover:rotate-45" />
            </button>
          </div>
        </header>

        {/* Bento Grid layout containing interactive chat feed */}
        <div id="bento-workspace" className="flex-1 overflow-x-hidden overflow-y-auto flex flex-col p-4 sm:p-6 gap-4">

          {/* Chat Feed Segment */}
          <div className={`flex-1 ${currentTheme.panelBg} border ${currentTheme.borderClass} rounded-2xl flex flex-col overflow-hidden min-h-[350px]`}>
            
            {activeSession?.messages.length === 0 ? (
              /* Welcome screen if there are no messages in the active thread */
              <div className="flex-1 overflow-y-auto">
                <WelcomeScreen 
                  onSelectPrompt={(p) => {
                    setInputMessage(p);
                    // Autofocus and trigger sending if clicked
                    setTimeout(() => handleSendMessage(p), 50);
                  }}
                  langMode={currentLangMode}
                  currentTheme={currentTheme}
                  inputMessage={inputMessage}
                  setInputMessage={setInputMessage}
                  onSendMessage={handleSendMessage}
                  attachedImage={attachedImage}
                  setAttachedImage={setAttachedImage}
                  fileInputRef={fileInputRef}
                  isListening={isListening}
                  toggleListening={toggleListening}
                  isPlusMenuOpen={isPlusMenuOpen}
                  setIsPlusMenuOpen={setIsPlusMenuOpen}
                  handleImageUpload={handleImageUpload}
                  isLoading={isLoading}
                />
              </div>
            ) : (
              /* Interactive Chat Feed */
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 animate-fade-in">
                {activeSession?.messages.map((msg) => {
                  const isUser = msg.role === "user";
                  return (
                    <div 
                      key={msg.id} 
                      id={`chat-msg-row-${msg.id}`}
                      className={`flex flex-col ${isUser ? "items-end text-right" : "items-start text-left"}`}
                    >
                      <div className={`flex gap-3 max-w-[85%] ${isUser ? "flex-row-reverse" : "flex-row"}`}>
                        {/* Avatar bubble */}
                        {isUser ? (
                          <div className="w-8 h-8 rounded-full bg-slate-700 text-slate-100 flex items-center justify-center shrink-0">
                            <User className="w-4.5 h-4.5" />
                          </div>
                        ) : (
                          <CleanChatLogo currentTheme={currentTheme} size="sm" />
                        )}

                        {/* Content text block inside Bento card */}
                        <div className={`px-5 py-3.5 rounded-2xl shadow-xxs leading-relaxed transition-all text-sm ${
                          isUser 
                            ? `${currentTheme.userBubbleBg} rounded-tr-none text-left` 
                            : `${currentTheme.botBubbleBg} rounded-tl-none text-left`
                        }`}>
                          <div className={`prose max-w-none text-sm space-y-1.5 ${
                            isUser 
                              ? currentTheme.id === 'chatgpt-dark' ? 'text-white prose-invert' : 'text-slate-900'
                              : currentTheme.id === 'chatgpt-dark' ? 'text-slate-200 prose-invert' : 'text-slate-800'
                          }`}>
                            <ReactMarkdown>{msg.content}</ReactMarkdown>

                            {/* Generated image renderer */}
                            {msg.imageUrl && (
                              <div className="mt-3.5 relative overflow-hidden rounded-xl border border-slate-200/50 dark:border-slate-800 group/img max-w-md shadow-sm">
                                <img 
                                  src={msg.imageUrl} 
                                  alt="AI Generated Artwork" 
                                  className="w-full h-auto object-cover max-h-96 hover:scale-101 transition-transform duration-200"
                                  referrerPolicy="no-referrer"
                                />
                                <div className="absolute top-2 right-2 opacity-0 group-hover/img:opacity-100 transition-opacity bg-black/60 backdrop-blur-xs text-white p-1.5 rounded-lg text-xs flex gap-1.5">
                                  <a 
                                    href={msg.imageUrl} 
                                    download={`CleanChat_${msg.id}.jpg`}
                                    className="hover:scale-105 active:scale-95 transition"
                                    title="Download Image"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                    </svg>
                                  </a>
                                </div>
                              </div>
                            )}

                            {/* Generated video renderer */}
                            {msg.videoUrl && (
                              <div className="mt-3.5 relative overflow-hidden rounded-xl border border-slate-200/50 dark:border-slate-800 max-w-lg shadow-md bg-black">
                                <video 
                                  src={msg.videoUrl} 
                                  controls 
                                  playsInline
                                  className="w-full h-auto rounded-xl max-h-96"
                                />
                                <div className="p-2.5 bg-slate-900/90 text-[10px] text-slate-300 font-mono flex items-center justify-between border-t border-slate-800">
                                  <span>720p AI Video Stream</span>
                                  <a 
                                    href={msg.videoUrl.includes('?') ? `${msg.videoUrl}&download=true` : `${msg.videoUrl}?download=true`} 
                                    download={`CleanChat_Video_${msg.id}.mp4`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-emerald-400 hover:underline font-bold flex items-center gap-1"
                                    title="Open video in a new tab to play or download directly"
                                  >
                                    <span>Download MP4 ↗</span>
                                  </a>
                                </div>
                              </div>
                            )}

                            {/* Polling / Video rendering progress tracker */}
                            {msg.videoStatus === "processing" && (
                              <div className="mt-3.5 bg-black/5 dark:bg-white/5 border border-dashed border-emerald-500/40 rounded-xl p-4 flex flex-col items-center gap-3 max-w-sm">
                                <div className="relative flex items-center justify-center">
                                  <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-20 animate-ping"></span>
                                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center">
                                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                  </div>
                                </div>
                                <div className="text-center">
                                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-widest">Rendering Video...</h4>
                                  <p className="text-[10px] text-slate-400 mt-1">Generating scene movement & frames. Please wait, this takes up to 1-2 minutes...</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Sub timestamp signature label */}
                      <span className="text-[10px] text-gray-500 mt-1.5 mx-11 uppercase font-mono tracking-wider">
                        {isUser ? "You" : "Clean Chat"} • {msg.timestamp || "Just now"}
                      </span>
                    </div>
                  );
                })}

                {/* Simulated live loader thinking indicator */}
                {isLoading && (
                  <div className="flex flex-col items-start" id="thinking-indicator">
                    <div className="flex gap-3 max-w-[85%]">
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${currentTheme.glowClass} flex items-center justify-center text-white text-xs font-bold animate-pulse`}>
                        AI
                      </div>
                      <div className={`${currentTheme.botBubbleBg} px-6 py-4 rounded-2xl rounded-tl-none flex items-center gap-3`}>
                        <div className="flex gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: "0ms" }}></span>
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: "150ms" }}></span>
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: "300ms" }}></span>
                        </div>
                        <span className="text-xs text-gray-400 font-mono italic">Gemini type cheyyukayanu...</span>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            )}

            {/* Bottom active status / suggestion banner */}
            <div className={`px-6 py-2.5 bg-white/[0.01] border-t ${currentTheme.borderClass} shrink-0 flex flex-wrap items-center justify-between text-[11px] text-gray-500 gap-2`}>
              <span className="flex items-center gap-1.5 text-slate-400">
                <Info className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Selected style: <strong>{currentLangMode === "all" ? "Multi-lingual Prompt Friendly" : currentLangMode.toUpperCase()}</strong></span>
              </span>
              <span className="hidden sm:inline text-gray-650 uppercase font-mono tracking-wide">
                No external tools connected • 100% Personal Assistant
              </span>
            </div>
          </div>

        </div>

        {/* Interactive Chat Input Area (Styled in sleek modern Gemini capsule format) */}
        {!((currentTheme.id === "copilot" || currentTheme.id === "chatgpt-light") && activeSession?.messages.length === 0) && (
          <div className="mt-auto p-2 sm:p-4 shrink-0 relative">
            <div className={`relative ${currentTheme.inputBg} rounded-2xl p-3.5 transition-all shadow-md max-w-4xl mx-auto border ${currentTheme.borderClass}`}>
              
              {/* Invisible File Input for Attachment uploads */}
              <input 
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                className="hidden"
              />

              {/* Staged Attached Image Preview Badge (Gemini Style) */}
              {attachedImage && (
                <div className="mb-3 flex items-center gap-3 bg-slate-100 dark:bg-slate-805 bg-opacity-70 dark:bg-opacity-70 p-2 rounded-xl max-w-xs animate-fade-in border border-slate-200/55 dark:border-slate-700/50">
                  <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-slate-300 dark:border-slate-600">
                    <img 
                      src={attachedImage} 
                      alt="Staged attachment preview" 
                      className="w-full h-full object-cover" 
                    />
                    <button 
                      onClick={() => setAttachedImage(null)}
                      className="absolute -top-1 -right-1 bg-red-500 hover:bg-red-605 text-white rounded-full p-0.5 shadow-sm transition cursor-pointer"
                      title="Remove Attachment"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="text-left">
                    <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block truncate max-w-[150px]">Gemini Image Attached</span>
                    <span className="text-[9px] font-mono text-slate-450 block uppercase">Ready to send</span>
                  </div>
                </div>
              )}

              {/* Speech sound wave pulse indicator */}
              {isListening && (
                <div className="mb-3.5 px-3 py-2 bg-red-500/10 border border-red-500/25 rounded-xl flex items-center justify-between animate-pulse">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                    <span className="text-xs font-bold text-red-500 font-mono uppercase tracking-wider">Listening to Mic...</span>
                  </div>
                  <span className="text-[11px] text-red-550 italic">Samsarikkoo machane (e.g. "Hi bro")</span>
                </div>
              )}

              {/* Prompters textarea field */}
              <textarea
                id="chat-textarea-field"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                className={`w-full bg-transparent border-none outline-none focus:ring-0 text-sm ${currentTheme.id === 'chatgpt-dark' ? 'text-slate-100 placeholder-slate-500' : 'text-slate-800 placeholder-slate-400'} resize-none px-2.5 py-1.5 h-16`}
                placeholder="Ask Clean Chat"
              />

              <div className="flex items-center justify-between px-2 pt-2.5 border-t border-slate-200/10 mt-1">
                {/* Mode label pills */}
                <div className="flex items-center gap-2">
                  <span className={`text-[9px] ${currentTheme.id === 'chatgpt-dark' ? 'bg-[#212121] border-[#3e3e3e] text-slate-350' : 'bg-slate-100 border-slate-200 text-slate-700'} border px-2.5 py-1 rounded-md uppercase font-black tracking-wider`}>
                    {currentLangMode === 'all' ? 'Auto-Detect' : currentLangMode} Mode
                  </span>
                  
                  {isListening && (
                    <span className="text-[10px] text-red-500 font-mono animate-bounce">
                      🎤 Audio Live
                    </span>
                  )}
                </div>
                
                {/* Circle Action buttons matching screenshot style side by side */}
                <div className="flex items-center gap-2 relative">
                  
                  {/* Microphone Toggle circle button */}
                  <button
                    type="button"
                    onClick={toggleListening}
                    className={`w-10 h-10 rounded-full border transition-all duration-200 flex items-center justify-center cursor-pointer ${
                      isListening
                        ? "bg-red-500 border-red-500 text-white animate-pulse"
                        : currentTheme.id === 'chatgpt-dark'
                          ? "bg-[#212121] border-[#3e3e3e] text-slate-300 hover:bg-[#2e2e2e]"
                          : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}
                    title={isListening ? "Stop listening" : "Voice Input (Speak Malayalathil / English)"}
                  >
                    {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </button>

                  {/* Plus button with float action menus container */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsPlusMenuOpen(!isPlusMenuOpen)}
                      className={`w-10 h-10 rounded-full border transition-all duration-200 flex items-center justify-center cursor-pointer ${
                        isPlusMenuOpen
                          ? "bg-[#10a37f] border-[#10a37f] text-white"
                          : currentTheme.id === 'chatgpt-dark'
                            ? "bg-[#212121] border-[#3e3e3e] text-slate-350 hover:bg-[#2e2e2e]"
                            : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                      }`}
                      title="Plus menu features"
                    >
                      <Plus className="w-4 h-4" />
                    </button>

                    {/* Gemini inspired Quick Action Float Popover menu */}
                    {isPlusMenuOpen && (
                      <div className={`absolute bottom-12 right-0 w-64 ${currentTheme.id === 'chatgpt-dark' ? 'bg-[#212121] border-[#3e3e3e]' : 'bg-white border-slate-200'} border rounded-2xl p-2.5 shadow-xl z-50 animate-fade-in text-left`}>
                        <div className="px-2.5 py-1.5 border-b border-slate-200/10 mb-1.5 flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Gemini Options</span>
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        </div>
                        
                        <div className="space-y-1">
                          {/* Choose photo file */}
                          <button
                            type="button"
                            onClick={() => {
                              fileInputRef.current?.click();
                              setIsPlusMenuOpen(false);
                            }}
                            className={`w-full text-left px-2.5 py-2 text-xs rounded-xl flex items-center gap-2.5 transition cursor-pointer ${
                              currentTheme.id === 'chatgpt-dark' ? 'hover:bg-[#2e2e2e] text-slate-200' : 'hover:bg-slate-50 text-slate-700'
                            }`}
                          >
                            <Image className="w-4 h-4 text-sky-500 shrink-0" />
                            <div className="truncate">
                              <p className="font-bold leading-none">Photo / Image</p>
                              <p className="text-[9px] text-slate-400 mt-0.5">Prompt Gemini with images</p>
                            </div>
                          </button>

                          {/* Quick Malayalam Sunsets helper prompt */}
                          <button
                            type="button"
                            onClick={() => {
                              setInputMessage("Machane, generate a beautiful painting of Kerala backwaters during sunset with a traditional houseboat sail.");
                              setIsPlusMenuOpen(false);
                            }}
                            className={`w-full text-left px-2.5 py-2 text-xs rounded-xl flex items-center gap-2.5 transition cursor-pointer ${
                              currentTheme.id === 'chatgpt-dark' ? 'hover:bg-[#2e2e2e] text-slate-200' : 'hover:bg-slate-50 text-slate-700'
                            }`}
                          >
                            <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                            <div className="truncate">
                              <p className="font-bold leading-none">Paint Backwaters</p>
                              <p className="text-[9px] text-slate-400 mt-0.5">Quick AI artwork generator</p>
                            </div>
                          </button>

                          {/* Quick Video generation prompt */}
                          <button
                            type="button"
                            onClick={() => {
                              setInputMessage("Generate a modern cinematically detailed 3D video of a traditional wooden houseboat sailing on heavy Kerala rain.");
                              setIsPlusMenuOpen(false);
                            }}
                            className={`w-full text-left px-2.5 py-2 text-xs rounded-xl flex items-center gap-2.5 transition cursor-pointer ${
                              currentTheme.id === 'chatgpt-dark' ? 'hover:bg-[#2e2e2e] text-slate-200' : 'hover:bg-slate-50 text-slate-700'
                            }`}
                          >
                            <Video className="w-4 h-4 text-purple-500 shrink-0" />
                            <div className="truncate">
                              <p className="font-bold leading-none">Houseboat Video</p>
                              <p className="text-[9px] text-slate-400 mt-0.5">Quick AI video cinematic tool</p>
                            </div>
                          </button>

                          {/* Quick Malayalam conversational greeting helper */}
                          <button
                            type="button"
                            onClick={() => {
                              setInputMessage("Sugamaano bro? Enthanu puthiya visheshangal?");
                              setIsPlusMenuOpen(false);
                            }}
                            className={`w-full text-left px-2.5 py-2 text-xs rounded-xl flex items-center gap-2.5 transition cursor-pointer ${
                              currentTheme.id === 'chatgpt-dark' ? 'hover:bg-[#2e2e2e] text-slate-200' : 'hover:bg-slate-50 text-slate-700'
                            }`}
                          >
                            <MessageSquare className="w-4 h-4 text-emerald-500 shrink-0" />
                            <div className="truncate">
                              <p className="font-bold leading-none">Friendly Greeting</p>
                              <p className="text-[9px] text-slate-400 mt-0.5">Trigger Manglish chit-chat</p>
                            </div>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Send / Up-Arrow Circle send button */}
                  <button
                    type="submit"
                    id="btn-chat-submit"
                    onClick={() => handleSendMessage()}
                    disabled={isLoading || (!inputMessage.trim() && !attachedImage)}
                    className={`w-10 h-10 rounded-full transition-all duration-200 flex items-center justify-center cursor-pointer ${
                      isLoading || (!inputMessage.trim() && !attachedImage)
                        ? "bg-transparent text-slate-400 cursor-not-allowed border border-slate-200 dark:border-slate-800"
                        : "bg-[#10a37f] hover:bg-[#0c8567] text-white hover:scale-105 active:scale-95 shadow-md border border-emerald-600"
                    }`}
                    title="Send message"
                  >
                    <Send className="w-3.5 h-3.5 transform rotate-[-45deg] translate-x-[1px] translate-y-[-1px]" />
                  </button>

                </div>
              </div>
            </div>
            
            <p className="text-center text-[10px] text-slate-400 mt-2 font-medium tracking-wide">
              Clean Chat Personal Assistant • Chat with Malayalam voice dictation, file uploads, in-place AI tools.
            </p>
          </div>
        )}

        {/* IN-APP GORGEOUS GOOGLE ACCOUNT SWITCHER & CHOOSER MODAL */}
        {showSignInModal && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-lg transition-all duration-300">
            <div className={`relative max-w-md w-full border rounded-3xl p-6 text-center shadow-2xl flex flex-col items-center gap-4 transform scale-100 transition duration-300 ${
              currentTheme.id === 'chatgpt-light'
                ? 'bg-white border-pink-100 text-slate-800'
                : 'bg-[#18181a] border-[#2e2e30] text-slate-100'
            }`}>
              
              {/* Decorative Aura */}
              <div className="absolute -top-10 left-12 w-48 h-48 bg-gradient-to-tr from-pink-500/10 to-purple-500/10 blur-2xl rounded-full pointer-events-none" />
              <div className="absolute -bottom-10 right-12 w-48 h-48 bg-gradient-to-tr from-cyan-500/10 to-indigo-500/10 blur-2xl rounded-full pointer-events-none" />

              {/* Google Brand Logo Mockups */}
              <div className="flex items-center gap-1.5 z-10">
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v3.92h6.69c-.29 1.5-1.14 2.78-2.4 3.63v3.02h3.89c2.28-2.1 3.56-5.19 3.56-8.5z"/>
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.89-3.02C14.96 18.8 13.59 19.3 12 19.3c-3.11 0-5.75-2.1-6.69-4.93H1.28v3.13C3.26 21.39 7.37 24 12 24z"/>
                  <path fill="#FBBC05" d="M5.31 14.37c-.24-.72-.38-1.5-.38-2.37s.14-1.65.38-2.37V6.51H1.28c-.82 1.63-1.28 3.47-1.28 5.49s.46 3.86 1.28 5.49L5.31 14.37z"/>
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.44-3.44C17.95 1.19 15.24 0 12 0 7.37 0 3.26 2.61 1.28 6.51l4.03 3.13C6.25 6.85 8.89 4.75 12 4.75z"/>
                </svg>
                <span className="text-sm font-black tracking-tight text-slate-500 dark:text-slate-400">Google Accounts</span>
              </div>

              {/* Header Title with localized translation */}
              <div className="space-y-0.5 z-10 mt-1">
                <h2 className="text-xl font-extrabold tracking-tight">
                  Choose an Account
                </h2>
                <h3 className="text-xs font-bold text-slate-450 dark:text-emerald-450">
                  ഒരു അക്കൗണ്ട് തിരഞ്ഞെടുക്കുക 💬
                </h3>
              </div>

              {/* Description explanation */}
              <div className="z-10 text-xs sm:text-xs leading-relaxed max-h-[80px] overflow-y-auto px-2 text-slate-450">
                <p>
                  To backup chats and support switching, specify your Google ID. Sessions are safely sandbox-isolated for each email.
                </p>
              </div>

              {/* List of saved accounts (Switcher Area) */}
              <div className="w-full space-y-2 z-10 max-h-[170px] overflow-y-auto pr-1">
                {googleAccounts.map((account) => {
                  const isActive = account.email.toLowerCase() === activeAccount?.email.toLowerCase();
                  return (
                    <div 
                      key={account.email}
                      className={`group w-full flex items-center justify-between p-2.5 rounded-2xl border text-left transition duration-200 cursor-pointer ${
                        isActive 
                          ? 'bg-emerald-500/10 border-emerald-500/35 text-slate-800 dark:text-slate-100 ring-2 ring-emerald-500/20'
                          : 'bg-slate-500/5 hover:bg-slate-500/10 border-slate-200 dark:border-slate-800'
                      }`}
                      onClick={() => {
                        handleSelectAccountProfile(account);
                        setShowSignInModal(false);
                      }}
                    >
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        {account.photoURL ? (
                          <img 
                            src={account.photoURL} 
                            alt={account.displayName} 
                            className="w-8 h-8 rounded-full object-cover border border-slate-200/50"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 text-white flex items-center justify-center font-bold text-sm shrink-0">
                            {account.displayName[0].toUpperCase()}
                          </div>
                        )}
                        <div className="overflow-hidden leading-tight">
                          <p className="text-xs font-bold truncate">
                            {account.displayName}
                          </p>
                          <p className="text-[10px] text-slate-450 truncate">
                            {account.email}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {isActive ? (
                          <span className="text-[9px] font-black uppercase text-emerald-600 dark:text-emerald-400 bg-emerald-500/15 px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                            <Check className="w-2.5 h-2.5" /> sjeevam
                          </span>
                        ) : (
                          <span className="text-[9px] font-bold text-slate-400 hover:text-slate-600 transition">
                            Switch
                          </span>
                        )}

                        {googleAccounts.length > 1 && (
                          <button
                            id={`btn-remove-profile-${account.email}`}
                            title="Remove account from device list"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (window.confirm(`Unregister ${account.email} on this local app?`)) {
                                const updated = googleAccounts.filter(p => p.email !== account.email);
                                setGoogleAccounts(updated);
                                localStorage.setItem("swantham_gemini_google_profiles", JSON.stringify(updated));
                                if (isActive && updated.length > 0) {
                                  handleSelectAccountProfile(updated[0]);
                                }
                              }
                            }}
                            className="p-1 rounded-md hover:bg-rose-500/10 text-slate-400 hover:text-rose-500 transition"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Add New Account Form Expandable area */}
              <div className="w-full border-t border-slate-250/20 pt-3 z-10">
                {!isAddingNewProfile ? (
                  <button
                    id="btn-trigger-add-new-chooser"
                    onClick={() => setIsAddingNewProfile(true)}
                    className="flex items-center justify-center gap-1.5 mx-auto text-xs font-extrabold text-[#10a37f] hover:underline cursor-pointer py-1"
                  >
                    <PlusCircle className="w-3.5 h-3.5" /> Another Account (മറ്റൊരു അക്കൗണ്ട് ചേർക്കുക)
                  </button>
                ) : (
                  <div className={`p-3 rounded-2xl border text-left space-y-2.5 ${
                    currentTheme.id === 'chatgpt-light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/40 border-slate-800'
                  }`}>
                    <p className="text-[10px] font-extrabold text-slate-450 uppercase tracking-widest">
                      Register Another Gmail Profile
                    </p>
                    
                    <div className="grid grid-cols-1 gap-2">
                      <div>
                        <label className="text-[10px] font-bold text-slate-450 block mb-0.5">Full Name (പേര്)</label>
                        <input 
                          type="text" 
                          placeholder="Hanaan TP"
                          value={newAccountName}
                          onChange={(e) => setNewAccountName(e.target.value)}
                          className="w-full text-xs p-2 rounded-xl border border-slate-350 dark:border-slate-800 bg-transparent text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-450 block mb-0.5">Gmail Address (ജിമെയിൽ മേൽവിലാസം)</label>
                        <input 
                          type="email" 
                          placeholder="hanaantp0001@gmail.com"
                          value={newAccountEmail}
                          onChange={(e) => setNewAccountEmail(e.target.value)}
                          className="w-full text-xs p-2 rounded-xl border border-slate-350 dark:border-slate-800 bg-transparent text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-1 font-bold">
                      <button
                        onClick={() => {
                          setIsAddingNewProfile(false);
                          setNewAccountEmail("");
                          setNewAccountName("");
                        }}
                        className="text-[10px] px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-800 text-slate-500 hover:text-slate-700 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => {
                          if (!newAccountEmail.trim() || !newAccountName.trim()) {
                            alert("Please fill name and Gmail fields to sign in!");
                            return;
                          }
                          if (!newAccountEmail.includes("@")) {
                            alert("Please enter a valid Google Account/Gmail!");
                            return;
                          }
                          handleAddAndSelectAccount(newAccountEmail, newAccountName);
                          setNewAccountEmail("");
                          setNewAccountName("");
                          setIsAddingNewProfile(false);
                          setShowSignInModal(false);
                        }}
                        className="text-[10px] bg-gradient-to-tr from-emerald-600 to-teal-500 text-white px-3 py-1.5 rounded-lg cursor-pointer hover:opacity-90"
                      >
                        Add & Switch
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Close/Skip Button */}
              <div className="w-full mt-1.5 z-10 flex flex-col gap-1.5">
                <button
                  id="btn-modal-skip-signin"
                  onClick={() => {
                    localStorage.setItem("swantham_gemini_skipped_signin", "true");
                    setShowSignInModal(false);
                  }}
                  className="w-full text-xs text-slate-450 hover:text-slate-800 dark:hover:text-white underline cursor-pointer transition font-bold"
                >
                  Close & Continue / പിന്നീട് ചെയ്യാം
                </button>
                
                <p className="text-[9px] text-slate-450 dark:text-slate-400 leading-snug">
                  🔒 Saved locally. No outside website redirection or popup blocks!
                </p>
              </div>

            </div>
          </div>
        )}

        {/* APP PREMIUM SETTINGS DRAWER / MODAL */}
        {showSettingsModal && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-lg transition-all duration-300">
            <div className={`relative max-w-2xl w-full border rounded-3xl p-6 shadow-2xl flex flex-col gap-6 transform scale-100 transition duration-300 ${
              currentTheme.id === 'chatgpt-light'
                ? 'bg-white border-pink-100 text-slate-800'
                : 'bg-[#18181a] border-[#2e2e30] text-slate-100'
            }`}>
              
              {/* Header with Title and close button */}
              <div className="flex items-center justify-between border-b border-slate-200/20 pb-3">
                <div className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-[#10a37f]" />
                  <div className="text-left">
                    <h2 className="text-lg font-black tracking-tight">App Settings</h2>
                    <p className="text-xs text-slate-450">ക്രമീകരണങ്ങൾ മാറ്റുക</p>
                  </div>
                </div>
                <button
                  id="btn-close-settings"
                  onClick={() => setShowSettingsModal(false)}
                  className="p-1 px-2.5 rounded-xl bg-slate-500/10 hover:bg-slate-500/20 text-slate-400 hover:text-slate-650 dark:hover:text-white transition text-xs font-bold font-mono cursor-pointer"
                >
                  Close ✕
                </button>
              </div>

              {/* Grid Content section */}
              <div className="space-y-6 overflow-y-auto max-h-[70vh] pr-1">
                
                {/* 1. CHOOSE THEME SECTION */}
                <div className="space-y-2.5 text-left">
                  <div className="flex flex-col">
                    <h3 className="text-xs font-extrabold uppercase tracking-widest text-[#10a37f]">1. Choose Theme (യോജിച്ച തീം)</h3>
                    <p className="text-[11px] text-slate-400">Select application visual skins</p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {THEMES.map((theme) => {
                      const isSelected = activeThemeId === theme.id;
                      return (
                        <button
                          key={theme.id}
                          id={`settings-theme-${theme.id}`}
                          onClick={() => {
                            handleThemeChange(theme.id);
                          }}
                          className={`p-2.5 rounded-xl border flex items-center gap-2.5 text-left transition-all duration-200 cursor-pointer ${
                            isSelected
                              ? (theme.id === 'copilot' || theme.id === 'chatgpt-light')
                                ? "bg-gradient-to-tr from-pink-500 via-purple-500 to-indigo-500 border-none text-white shadow-md font-bold"
                                : "bg-[#10a37f] border-[#10a37f] text-white shadow-xs font-bold"
                              : (currentTheme.id === 'copilot' || currentTheme.id === 'chatgpt-light')
                                ? "bg-white/45 border-white/60 text-slate-800 hover:bg-white/70 hover:border-white"
                                : currentTheme.id === 'chatgpt-dark'
                                  ? "bg-[#212121] border-[#3e3e3e] text-slate-300 hover:border-[#4e4e4e]"
                                  : "bg-white border-slate-200 hover:border-slate-300 text-slate-600 hover:bg-slate-50"
                          }`}
                        >
                          <span className="text-lg shrink-0">{theme.icon}</span>
                          <div className="truncate pointer-events-none">
                            <span className={`text-[9px] uppercase font-extrabold block leading-none ${isSelected ? 'text-white/80' : 'text-slate-450'}`}>{theme.nameEnglish.split(" ")[0]}</span>
                            <span className={`text-[10px] font-bold block truncate mt-0.5 ${isSelected ? 'text-white' : currentTheme.id === 'chatgpt-dark' ? 'text-slate-200' : 'text-slate-750'}`}>{theme.nameMalayalam}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. CHAT LANGUAGE SECTION */}
                <div className="space-y-2.5 text-left">
                  <div className="flex flex-col">
                    <h3 className="text-xs font-extrabold uppercase tracking-widest text-[#10a37f]">2. Conversational Language (സംസാരിക്കേണ്ട രീതി)</h3>
                    <p className="text-[11px] text-slate-400">Change Response accent dialect for current window</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {/* ภาษา English Button */}
                    <button
                      id="settings-lang-english"
                      onClick={() => handleUpdateSessionLanguage(activeSessionId, "english")}
                      className={`p-3 rounded-xl border flex items-center justify-between text-left transition duration-200 cursor-pointer ${
                        currentLangMode === "english"
                          ? (currentTheme.id === 'copilot' || currentTheme.id === 'chatgpt-light')
                            ? "bg-gradient-to-tr from-pink-500 to-indigo-500 border-none text-white shadow-md font-bold"
                            : "bg-[#10a37f] border-[#10a37f] text-white shadow-sm font-bold"
                          : (currentTheme.id === 'copilot' || currentTheme.id === 'chatgpt-light')
                            ? "bg-white/45 border-white/60 text-slate-800 hover:bg-white/70"
                            : currentTheme.id === 'chatgpt-dark'
                              ? "bg-[#212121] border-[#3e3e3e] text-slate-300 hover:border-[#4e4e4e]"
                              : "bg-white border-slate-200 hover:border-slate-300 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <div>
                        <span className={`text-[9px] font-black block leading-none mb-1 ${currentLangMode === 'english' ? 'text-white/80' : 'text-slate-450'}`}>🇺🇸 ENGLISH</span>
                        <span className="text-xs font-bold">Only English</span>
                      </div>
                      {currentLangMode === "english" && <span className="w-2 h-2 rounded-full bg-white shadow-sm animate-pulse"></span>}
                    </button>

                    {/* ภาษา Malayalam Button */}
                    <button
                      id="settings-lang-malayalam"
                      onClick={() => handleUpdateSessionLanguage(activeSessionId, "malayalam")}
                      className={`p-3 rounded-xl border flex items-center justify-between text-left transition duration-200 cursor-pointer ${
                        currentLangMode === "malayalam"
                          ? (currentTheme.id === 'copilot' || currentTheme.id === 'chatgpt-light')
                            ? "bg-gradient-to-tr from-pink-500 to-indigo-500 border-none text-white shadow-md font-bold"
                            : "bg-[#10a37f] border-[#10a37f] text-white shadow-sm font-bold"
                          : (currentTheme.id === 'copilot' || currentTheme.id === 'chatgpt-light')
                            ? "bg-white/45 border-white/60 text-slate-800 hover:bg-white/70"
                            : currentTheme.id === 'chatgpt-dark'
                              ? "bg-[#212121] border-[#3e3e3e] text-slate-300 hover:border-[#4e4e4e]"
                              : "bg-white border-slate-200 hover:border-slate-300 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <div>
                        <span className={`text-[9px] font-black block leading-none mb-1 ${currentLangMode === 'malayalam' ? 'text-white/80' : 'text-slate-450'}`}>❤️ KERALA</span>
                        <span className="text-xs font-bold">Malayalam Lipi</span>
                      </div>
                      {currentLangMode === "malayalam" && <span className="w-2 h-2 rounded-full bg-white shadow-sm animate-pulse"></span>}
                    </button>

                    {/* ภาษา Manglish Button */}
                    <button
                      id="settings-lang-manglish"
                      onClick={() => handleUpdateSessionLanguage(activeSessionId, "manglish")}
                      className={`p-3 rounded-xl border flex items-center justify-between text-left transition duration-200 cursor-pointer ${
                        currentLangMode === "manglish"
                          ? (currentTheme.id === 'copilot' || currentTheme.id === 'chatgpt-light')
                            ? "bg-gradient-to-tr from-pink-500 to-indigo-500 border-none text-white shadow-md font-bold"
                            : "bg-[#10a37f] border-[#10a37f] text-white shadow-sm font-bold"
                          : (currentTheme.id === 'copilot' || currentTheme.id === 'chatgpt-light')
                            ? "bg-white/45 border-white/60 text-slate-800 hover:bg-white/70"
                            : currentTheme.id === 'chatgpt-dark'
                              ? "bg-[#212121] border-[#3e3e3e] text-slate-300 hover:border-[#4e4e4e]"
                              : "bg-white border-slate-200 hover:border-slate-300 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <div>
                        <span className={`text-[9px] font-black block leading-none mb-1 ${currentLangMode === 'manglish' ? 'text-white/80' : 'text-slate-450'}`}>💬 MANGLISH</span>
                        <span className="text-xs font-bold">Sukhamaano</span>
                      </div>
                      {currentLangMode === "manglish" && <span className="w-2 h-2 rounded-full bg-white shadow-sm animate-pulse"></span>}
                    </button>
                  </div>
                </div>

                {/* 3. CLOUD SYNC & ACCOUNTS SECTION */}
                <div className="p-3.5 rounded-2xl border border-dashed border-slate-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-left">
                  <div className="space-y-1">
                    <h4 className="text-xs font-extrabold text-[#10a37f] uppercase">3. Active Account Profile</h4>
                    <p className="text-[10px] text-slate-450">
                      Active: <strong className="text-slate-700 dark:text-slate-200">{activeAccount?.email}</strong>
                    </p>
                  </div>
                  <button
                    id="btn-settings-trigger-accounts"
                    onClick={() => {
                      setShowSettingsModal(false);
                      setShowSignInModal(true);
                    }}
                    className="px-3 py-1.5 rounded-xl text-[10px] font-extrabold bg-[#10a37f] hover:bg-[#10a37f]/95 text-white active:scale-95 transition cursor-pointer shrink-0"
                  >
                    Switch Account (ജിമെയിൽ മാറ്റുക)
                  </button>
                </div>

              </div>

              {/* Informative Footer */}
              <div className="text-center pt-2 border-t border-slate-200/10">
                <p className="text-[10px] text-slate-450">
                  Settings are immediately saved to application session memory.
                </p>
              </div>

            </div>
          </div>
        )}

      </main>
    </div>
  );
}
