export interface VideoMetadata {
  videoId: string;
  title: string;
  author: string;
  thumbnailUrl: string;
  duration?: string;
  category?: string;
}

export interface SubtitleLine {
  time: string;
  text: string;
}

export interface AISummaryData {
  summary: string;
  takeaways: string[];
  subtitles: SubtitleLine[];
}

export interface HistoryItem {
  id: string;
  type: "youtube" | "text-translate";
  timestamp: string;
  inputUrl?: string;
  inputText?: string;
  title?: string;
  targetLanguage: string;
  data: any;
}

export type SupportedLanguage = {
  code: string;
  name: string;
  flag: string;
  myLabel: string; // Myanmar name label
};

export const SUPPORTED_LANGUAGES: SupportedLanguage[] = [
  { code: "Myanmar", name: "Myanmar (မြန်မာ)", flag: "🇲🇲", myLabel: "မြန်မာဘာသာ" },
  { code: "English", name: "English (အင်္ဂလိပ်)", flag: "🇺🇸", myLabel: "အင်္ဂလိပ်ဘာသာ" },
  { code: "Japanese", name: "Japanese (ဂျပန်)", flag: "🇯🇵", myLabel: "ဂျပန်ဘာသာ" },
  { code: "Thai", name: "Thai (ထိုင်း)", flag: "🇹🇭", myLabel: "ထိုင်းဘာသာ" },
  { code: "Korean", name: "Korean (ကိုရီးယား)", flag: "🇰🇷", myLabel: "ကိုရီးယားဘာသာ" },
  { code: "Chinese", name: "Chinese (တရုတ်)", flag: "🇨🇳", myLabel: "တရုတ်ဘာသာ" },
  { code: "Spanish", name: "Spanish (စပိန်)", flag: "🇪🇸", myLabel: "စပိန်ဘာသာ" },
  { code: "French", name: "French (ပြင်သစ်)", flag: "🇫🇷", myLabel: "ပြင်သစ်ဘာသာ" },
];

export type ToneStyle = {
  id: string;
  name: string;
  myLabel: string;
  description: string;
};

export const TONE_STYLES: ToneStyle[] = [
  { id: "Standard", name: "Standard (ပုံမှန်)", myLabel: "ပုံမှန်ဘာသာပြန်", description: "Natural, direct, balanced translations" },
  { id: "Polite/Formal", name: "Polite & Formal (ယဉ်ကျေး/တရားဝင်)", myLabel: "ယဉ်ကျေးစွာ / တရားဝင်", description: "Use polite prefixes, formal grammar, and respectful honorifics" },
  { id: "Casual/Friendly", name: "Casual & Friendly (ရင်းနှီးသော)", myLabel: "ရင်းရင်းနှီးနှီး", description: "Natural everyday speech and expressive conversational patterns" },
  { id: "Academic/Literary", name: "Academic & Literary (စာပေအသုံးအနှုန်း)", myLabel: "စာပေသုံးဟန်", description: "Precise word choice, narrative prose, or scholarly structures" },
  { id: "Slang/Urban", name: "Slang & Urban (နောက်ပြောင်/ခေတ်စားသော)", myLabel: "ခေတ်ပေါ်စကား", description: "Colloquial terminology, idioms, and trendy modern youth slangs" },
];
