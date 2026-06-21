import { PromptTemplate } from "./types";

export const CUSTOM_PRESETS: PromptTemplate[] = [
  {
    title: "തമാശ ചോദിക്കാം",
    subtitle: "Oru adipoli thamaasha para",
    prompt: "എനിക്ക് ഒരു കിടിലൻ മലയാളം തമാശ പറഞ്ഞു തരാമോ? നല്ല ചിരിക്കാൻ പറ്റുന്ന ഒന്നായിരിക്കണം!",
    category: "fun"
  },
  {
    title: "സുഖവിവരം ചോദിക്കാം",
    subtitle: "Sukhamaano bro?",
    prompt: "Sukhamaano bro? Enthaanu innathe visheshangal? Clean Chat-ine patti parayu.",
    category: "manglish"
  },
  {
    title: "യാത്രാ പ്ലാൻ",
    subtitle: "Kerala travel itinerary",
    prompt: "കേരളത്തിൽ 3 ദിവസം കൊണ്ട് കണ്ടുതീർക്കാവുന്ന ഒരു അടിപൊളി യാത്രാ പ്ലാൻ ഉണ്ടാക്കി തരാമോ?",
    category: "malayalam"
  },
  {
    title: "നാടൻ പാചകം",
    subtitle: "Traditional recipe idea",
    prompt: "ഒരു നാടൻ പായസം ഉണ്ടാക്കുന്ന രീതി എനിക്ക് പറഞ്ഞു തരാമോ? നല്ല ലളിതമായിരിക്കണം.",
    category: "malayalam"
  },
  {
    title: "Creative Story",
    subtitle: "Manglish mini-story",
    prompt: "Oru cheriya katha parayu - sheelavathiyaya oru poocha and oru kurumbi eliyum thammilulla katha. Manglishil parayaamo?",
    category: "manglish"
  },
  {
    title: "English Assistant",
    subtitle: "Skill enhancement",
    prompt: "Can you help me write a polite appreciation message in English for my colleague who always supports me?",
    category: "english"
  }
];

export const WELCOME_CHIPS = [
  { text: "സുഖമാണോ?", icon: "😊" },
  { text: "Oru thamaasha para!", icon: "😂" },
  { text: "Food recipe ideakal", icon: "🍛" },
  { text: "Help me write", icon: "✍️" }
];
