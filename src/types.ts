export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  imageUrl?: string;
  videoUrl?: string;
  videoOperationName?: string;
  videoStatus?: "pending" | "processing" | "done" | "failed";
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: string;
  messages: Message[];
  primaryLanguage: "all" | "malayalam" | "manglish" | "english";
}

export interface PromptTemplate {
  title: string;
  subtitle: string;
  prompt: string;
  category: "malayalam" | "manglish" | "english" | "fun";
}
