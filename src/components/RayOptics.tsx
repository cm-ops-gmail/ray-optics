import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Microscope, FlaskConical, Target, X, RotateCcw, Chrome as Home, Lightbulb, Info, ChevronRight, ChevronDown, ChevronUp, Trophy, Star, Eye, ArrowDown, SlidersHorizontal, GraduationCap, Sparkles } from "lucide-react";
import { useLang } from "@/context/LangContext";

type Mode = "convexLens" | "concaveLens" | "convexMirror" | "concaveMirror";

// ============== LEARNING OUTCOMES ==============
interface LearningOutcome {
  mode: Mode;
  title: string;
  message: string;
  tips: string[];
}

const LEARNING_OUTCOMES: Record<Mode, LearningOutcome> = {
  convexLens: {
    mode: "convexLens",
    title: "উত্তল লেন্স",
    message: "উত্তল লেন্স নিয়ে শিখলে তুমি বুঝবে কীভাবে ক্যামেরা এবং প্রজেক্টর কাজ করে।",
    tips: [
      "বস্তু ২F-এর বাইরে রাখলে ছোট উল্টো প্রতিবিম্ব হয় (ক্যামেরার মতো)",
      "বস্তু F-এর মধ্যে রাখলে বড় সোজা প্রতিবিম্ব হয় (ম্যাগনিফাইং গ্লাসের মতো)",
      "বস্তু F এবং ২F-এর মধ্যে রাখলে বড় উল্টো প্রতিবিম্ব হয় (প্রজেক্টরের মতো)",
    ],
  },
  concaveLens: {
    mode: "concaveLens",
    title: "অবতল লেন্স",
    message: "অবতল লেন্স সবসময় ছোট এবং সোজা প্রতিবিম্ব তৈরি করে।",
    tips: [
      "অবতল লেন্স কখনও বাস্তব প্রতিবিম্ব তৈরি করে না",
      "এটি চশমায় ব্যবহৃত হয় যারা কাছের জিনিস ভালো দেখতে পায় না",
      "প্রতিবিম্ব সবসময় অভাসী এবং সোজা থাকে",
    ],
  },
  convexMirror: {
    mode: "convexMirror",
    title: "উত্তল দর্পণ",
    message: "উত্তল দর্পণ গাড়ির পেছনের আয়নায় ব্যবহৃত হয় বিস্তৃত দৃশ্য দেখার জন্য।",
    tips: [
      "উত্তল দর্পণ সবসময় ছোট এবং সোজা প্রতিবিম্ব তৈরি করে",
      "এটি ব্যাপক ক্ষেত্র দৃশ্যমান করতে পারে",
      "প্রতিবিম্ব সবসময় দর্পণের পেছনে থাকে",
    ],
  },
  concaveMirror: {
    mode: "concaveMirror",
    title: "অবতল দর্পণ",
    message: "অবতল দর্পণ বিভিন্ন ধরনের প্রতিবিম্ব তৈরি করে যা বস্তুর অবস্থানের উপর নির্ভর করে।",
    tips: [
      "বস্তু F-এর মধ্যে রাখলে বড় সোজা প্রতিবিম্ব হয় (মেকআপ আয়নার মতো)",
      "বস্তু F এবং ২F-এর মধ্যে রাখলে বড় উল্টো প্রতিবিম্ব হয় (প্রজেক্টরের মতো)",
      "বস্তু ২F-এর বাইরে রাখলে ছোট উল্টো প্রতিবিম্ব হয় (টেলিস্কোপের মতো)",
    ],
  },
};

// ============== LAB TEST QUEST SYSTEM ==============
interface Quest {
  id: number;
  instruction: string;
  targetMode: Mode;
  targetURange: [number, number]; // min, max uMag
  targetModeLabel: string; // Bengali label for the mode user must select
  quiz: {
    question: string;
    options: string[];
    correctIndex: number;
  };
  hint: string;
}

const QUEST_POOL: Quest[] = [
  {
    id: 1,
    instruction: "উত্তল লেন্স ব্যবহার করে বস্তুকে F ও 2F-এর মাঝে রাখো। একটি বড় উল্টো প্রতিবিম্ব তৈরি করো।",
    targetMode: "convexLens",
    targetModeLabel: "উত্তল লেন্স",
    targetURange: [85, 155],
    quiz: { question: "এই অবস্থানে কোন যন্ত্র কাজ করে?", options: ["প্রজেক্টর", "ক্যামেরা", "ম্যাগনিফাইং গ্লাস", "টেলিস্কোপ"], correctIndex: 0 },
    hint: "বস্তু ফোকালের বাইরে (৮১ u) আছে",
  },
  {
    id: 2,
    instruction: "উত্তল লেন্স ব্যবহার করে বস্তুকে 2F-এর বাইরে রাখো। একটি ছোট উল্টো প্রতিবিম্ব তৈরি করো।",
    targetMode: "convexLens",
    targetModeLabel: "উত্তল লেন্স",
    targetURange: [165, 350],
    quiz: { question: "এটি কোন যন্ত্রের কাজের মতো?", options: ["টর্চলাইট", "প্রজেক্টর", "ক্যামেরা", "ম্যাগনিফাইং গ্লাস"], correctIndex: 2 },
    hint: "বস্তু 2F-এর বাইরে রাখো",
  },
  {
    id: 3,
    instruction: "উত্তল লেন্স ব্যবহার করে বস্তুকে F-এর ভেতরে রাখো। একটি বড় সোজা অভাসী প্রতিবিম্ব দেখো।",
    targetMode: "convexLens",
    targetModeLabel: "উত্তল লেন্স",
    targetURange: [5, 75],
    quiz: { question: "F-এর ভেতরে রাখলে প্রতিবিম্ব কেমন হয়?", options: ["বাস্তব ও উল্টো", "অভাসী ও সোজা ও বড়", "সমান আকার", "প্রতিবিম্ব হয় না"], correctIndex: 1 },
    hint: "ম্যাগনিফাইং গ্লাসের মতো কাজ করে",
  },
  {
    id: 4,
    instruction: "অবতল দর্পণ ব্যবহার করে আয়নার পেছনে একটি বিশাল প্রতিবিম্ব তৈরি করো। (বস্তু F এর ভেতরে আনো)",
    targetMode: "concaveMirror",
    targetModeLabel: "অবতল দর্পণ",
    targetURange: [5, 75],
    quiz: { question: "অবতল দর্পণে F-এর ভেতরে প্রতিবিম্ব কোথায় হয়?", options: ["আয়নার সামনে", "আয়নার পেছনে (অভাসী)", "অসীমে", "F-এ"], correctIndex: 1 },
    hint: "মেকআপ আয়নার মতো কাজ করে",
  },
  {
    id: 5,
    instruction: "উত্তল লেন্সে বস্তুকে ঠিক 2F-এ রাখো। সমান আকারের উল্টো প্রতিবিম্ব তৈরি করো।",
    targetMode: "convexLens",
    targetModeLabel: "উত্তল লেন্স",
    targetURange: [155, 165],
    quiz: { question: "2F-এ বস্তু রাখলে বিবর্ধন (m) কত?", options: ["0.5×", "1×", "2×", "∞"], correctIndex: 1 },
    hint: "u = 2f হলে v = 2f",
  },
  {
    id: 6,
    instruction: "উত্তল লেন্সে বস্তুকে ঠিক F-এ রাখো। দেখো কী হয়!",
    targetMode: "convexLens",
    targetModeLabel: "উত্তল লেন্স",
    targetURange: [76, 84],
    quiz: { question: "F-এ বস্তু রাখলে কী হয়?", options: ["ছোট প্রতিবিম্ব", "সমান প্রতিবিম্ব", "রশ্মি সমান্তরাল — প্রতিবিম্ব অসীমে", "উল্টো ও বড়"], correctIndex: 2 },
    hint: "টর্চলাইটের নীতি",
  },
  {
    id: 7,
    instruction: "অবতল লেন্স ব্যবহার করো। যেকোনো জায়গায় বস্তু রাখো এবং প্রতিবিম্বের ধরন পর্যবেক্ষণ করো।",
    targetMode: "concaveLens",
    targetModeLabel: "অবতল লেন্স",
    targetURange: [5, 350],
    quiz: { question: "অবতল লেন্সে প্রতিবিম্ব সবসময় কেমন?", options: ["বাস্তব ও বড়", "অভাসী, সোজা ও ছোট", "সমান আকার", "অসীমে"], correctIndex: 1 },
    hint: "চশমায় (মায়োপিয়া) এটি ব্যবহার হয়",
  },
  {
    id: 8,
    instruction: "উত্তল দর্পণ ব্যবহার করো এবং প্রতিবিম্ব দেখো।",
    targetMode: "convexMirror",
    targetModeLabel: "উত্তল দর্পণ",
    targetURange: [5, 350],
    quiz: { question: "উত্তল দর্পণ কোথায় ব্যবহার হয়?", options: ["প্রজেক্টরে", "গাড়ির পেছনের আয়নায়", "ক্যামেরায়", "টর্চলাইটে"], correctIndex: 1 },
    hint: "বড় দৃষ্টিক্ষেত্র দেখায়",
  },
  {
    id: 9,
    instruction: "অবতল দর্পণে বস্তুকে 2F-এর বাইরে রাখো।",
    targetMode: "concaveMirror",
    targetModeLabel: "অবতল দর্পণ",
    targetURange: [165, 350],
    quiz: { question: "অবতল দর্পণে 2F-এর বাইরে রাখলে প্রতিবিম্ব কেমন?", options: ["বড় ও সোজা", "ছোট, উল্টো ও বাস্তব", "সমান আকার", "অভাসী"], correctIndex: 1 },
    hint: "ক্যামেরার মতো",
  },
  {
    id: 10,
    instruction: "অবতল দর্পণে বস্তুকে F ও 2F-এর মাঝে রাখো।",
    targetMode: "concaveMirror",
    targetModeLabel: "অবতল দর্পণ",
    targetURange: [85, 155],
    quiz: { question: "এই অবস্থানে প্রতিবিম্ব কেমন?", options: ["ছোট ও সোজা", "বড়, উল্টো ও বাস্তব", "অভাসী ও ছোট", "তৈরি হয় না"], correctIndex: 1 },
    hint: "প্রজেক্টরের মতো",
  },
];

const MODES: { id: Mode; label: string; isLens: boolean; fSign: 1 | -1 }[] = [
  { id: "convexLens", label: "উত্তল লেন্স", isLens: true, fSign: 1 },
  { id: "concaveLens", label: "অবতল লেন্স", isLens: true, fSign: -1 },
  { id: "convexMirror", label: "উত্তল দর্পণ", isLens: false, fSign: 1 },
  { id: "concaveMirror", label: "অবতল দর্পণ", isLens: false, fSign: -1 },
];

const RAY_COLORS = {
  ray1: "#FF6B35",
  ray2: "#FFD23F",
  ray3: "#06D6A0",
};

// ============== IN-SIMULATOR CONCEPT ONBOARDING ==============
// The first time a student lands on a mode, everything but the bare canvas
// hides, and they're walked through it right there in 4 steps: 0 identify
// the element (MCQ, explained either way), 1 a prediction MCQ picked at
// random from a small pool per mode (auto-driven live once answered), then
// 2-3 two hands-on placement tasks — also picked at random from a pool of
// zones — where they drag the real candle themselves; the moment they get
// there, the light comes on and the real result explains itself. After
// each placement task, the real-world-use and learning-outcome modals
// chain in before moving on. Only after all 4 steps does the rest of the
// page reveal.
interface OnboardOption { bn: string; en: string; }

const IDENTIFY_QUESTION: OnboardOption = {
  bn: "উপরের ছবিতে যে জিনিসটা দেখছো, এটা আসলে কী?",
  en: "What is the thing you see in the picture above?",
};
// Same 4 options everywhere, in MODES order — correct answer is whichever
// index matches the current mode.
const IDENTIFY_OPTIONS: OnboardOption[] = [
  { bn: "উত্তল লেন্স", en: "Convex Lens" },
  { bn: "অবতল লেন্স", en: "Concave Lens" },
  { bn: "উত্তল দর্পণ", en: "Convex Mirror" },
  { bn: "অবতল দর্পণ", en: "Concave Mirror" },
];
const IDENTIFY_EXPLAIN: Record<Mode, OnboardOption> = {
  convexLens: { bn: "এটি একটি উত্তল লেন্স — মাঝখানে মোটা, প্রান্তে পাতলা। এটি আলোকরশ্মিকে একত্রিত (converge) করে।", en: "This is a convex lens — thick in the middle, thin at the edges. It converges light rays together." },
  concaveLens: { bn: "এটি একটি অবতল লেন্স — মাঝখানে পাতলা, প্রান্তে মোটা। এটি আলোকরশ্মিকে ছড়িয়ে (diverge) দেয়।", en: "This is a concave lens — thin in the middle, thick at the edges. It spreads (diverges) light rays apart." },
  convexMirror: { bn: "এটি একটি উত্তল দর্পণ — বাইরের দিকে ফোলা প্রতিফলক পৃষ্ঠ। এটি আলোকরশ্মিকে ছড়িয়ে দেয়।", en: "This is a convex mirror — its reflective surface bulges outward. It spreads light rays apart." },
  concaveMirror: { bn: "এটি একটি অবতল দর্পণ — ভেতরের দিকে বাঁকানো প্রতিফলক পৃষ্ঠ। এটি আলোকরশ্মিকে একত্রিত করে।", en: "This is a concave mirror — its reflective surface curves inward. It converges light rays together." },
};

// Step 1: a prediction MCQ, picked at random per mode so it's not the same
// question every time — checked, explained either way, then the simulator
// is driven live so the student sees the real answer right after guessing.
interface OnboardMcq {
  question: OnboardOption;
  options: OnboardOption[];
  correctIdx: number;
  targetRatio: number; // u/f ratio to drive the simulator to once answered
}
const PHYSICS_MCQ_POOL: Record<Mode, OnboardMcq[]> = {
  convexLens: [
    {
      question: { bn: "বস্তুকে ঠিক 2F বিন্দুতে রাখলে প্রতিবিম্ব কেমন হবে?", en: "If you place the object exactly at 2F, what will the image be like?" },
      options: [
        { bn: "বাস্তব, উল্টো ও সমান আকারের", en: "Real, inverted and the same size" },
        { bn: "অভাসী, সোজা ও বড়", en: "Virtual, upright and larger" },
        { bn: "কোনো প্রতিবিম্ব তৈরি হবে না", en: "No image will form at all" },
      ],
      correctIdx: 0,
      targetRatio: 2,
    },
    {
      question: { bn: "বস্তুকে F-এর ভেতরে (লেন্সের কাছে) আনলে প্রতিবিম্ব কেমন হবে?", en: "If you bring the object inside F (close to the lens), what will the image be like?" },
      options: [
        { bn: "অভাসী, সোজা ও বড় (ম্যাগনিফাইং গ্লাসের মতো)", en: "Virtual, upright and larger (like a magnifying glass)" },
        { bn: "বাস্তব, উল্টো ও ছোট", en: "Real, inverted and smaller" },
        { bn: "কোনো প্রতিবিম্ব তৈরি হবে না", en: "No image will form at all" },
      ],
      correctIdx: 0,
      targetRatio: 0.5,
    },
    {
      question: { bn: "বস্তুকে 2F-এর অনেক বাইরে রাখলে প্রতিবিম্ব কেমন হবে?", en: "If you place the object well beyond 2F, what will the image be like?" },
      options: [
        { bn: "বাস্তব, উল্টো ও ছোট (ক্যামেরার মতো)", en: "Real, inverted and smaller (like a camera)" },
        { bn: "অভাসী, সোজা ও বড়", en: "Virtual, upright and larger" },
        { bn: "কোনো প্রতিবিম্ব তৈরি হবে না", en: "No image will form at all" },
      ],
      correctIdx: 0,
      targetRatio: 3,
    },
  ],
  concaveLens: [
    {
      question: { bn: "বস্তুকে 2F বিন্দুতে (আরও দূরে) সরালে প্রতিবিম্বের ধরন কি বদলে যাবে?", en: "If you move the object out to 2F (farther away), will the image type change?" },
      options: [
        { bn: "না, তখনও অভাসী ও সোজা থাকবে", en: "No, it'll still be Virtual and Upright" },
        { bn: "হ্যাঁ, তখন বাস্তব হয়ে যাবে", en: "Yes, it'll become Real" },
        { bn: "হ্যাঁ, তখন উল্টো হয়ে যাবে", en: "Yes, it'll become Inverted" },
      ],
      correctIdx: 0,
      targetRatio: 2,
    },
    {
      question: { bn: "বস্তুকে লেন্সের একদম কাছে আনলে প্রতিবিম্বের ধরন কি বদলে যাবে?", en: "If you bring the object very close to the lens, will the image type change?" },
      options: [
        { bn: "না, তখনও অভাসী ও সোজা থাকবে", en: "No, it'll still be Virtual and Upright" },
        { bn: "হ্যাঁ, তখন বাস্তব হয়ে যাবে", en: "Yes, it'll become Real" },
        { bn: "হ্যাঁ, তখন উল্টো হয়ে যাবে", en: "Yes, it'll become Inverted" },
      ],
      correctIdx: 0,
      targetRatio: 0.5,
    },
    {
      question: { bn: "বস্তুকে সবচেয়ে দূরে (প্রায় অসীমে) সরালে প্রতিবিম্ব কেমন হবে?", en: "If you move the object as far away as possible (near infinity), what will the image be like?" },
      options: [
        { bn: "তখনও অভাসী, সোজা ও ছোট", en: "Still Virtual, Upright and smaller" },
        { bn: "তখন বাস্তব ও উল্টো হয়ে যাবে", en: "It'll become Real and Inverted" },
        { bn: "কোনো প্রতিবিম্ব তৈরি হবে না", en: "No image will form at all" },
      ],
      correctIdx: 0,
      targetRatio: 3,
    },
  ],
  convexMirror: [
    {
      question: { bn: "বস্তুকে 2F দূরত্বে সরালে প্রতিবিম্বের ধরন কি বদলে যাবে?", en: "If you move the object out to 2F, will the image type change?" },
      options: [
        { bn: "না, সবসময় অভাসী ও সোজাই থাকবে", en: "No, it'll always stay Virtual and Upright" },
        { bn: "হ্যাঁ, তখন বাস্তব হয়ে যাবে", en: "Yes, it'll become Real" },
        { bn: "হ্যাঁ, তখন উল্টো হয়ে যাবে", en: "Yes, it'll become Inverted" },
      ],
      correctIdx: 0,
      targetRatio: 2,
    },
    {
      question: { bn: "বস্তুকে আয়নার একদম কাছে আনলে প্রতিবিম্বের ধরন কি বদলে যাবে?", en: "If you bring the object very close to the mirror, will the image type change?" },
      options: [
        { bn: "না, সবসময় অভাসী ও সোজাই থাকবে", en: "No, it'll always stay Virtual and Upright" },
        { bn: "হ্যাঁ, তখন বাস্তব হয়ে যাবে", en: "Yes, it'll become Real" },
        { bn: "হ্যাঁ, তখন উল্টো হয়ে যাবে", en: "Yes, it'll become Inverted" },
      ],
      correctIdx: 0,
      targetRatio: 0.5,
    },
    {
      question: { bn: "বস্তু আয়না থেকে অনেক দূরে থাকলেও প্রতিবিম্বের ধরন একই থাকে কেন?", en: "Even with the object very far from the mirror, why does the image type stay the same?" },
      options: [
        { bn: "কারণ উত্তল দর্পণ সবসময় অভাসী প্রতিবিম্ব তৈরি করে", en: "Because a convex mirror always forms a virtual image" },
        { bn: "কারণ আলো বেঁকে যায় না", en: "Because light doesn't bend" },
        { bn: "কারণ দর্পণটি সমতল", en: "Because the mirror is flat" },
      ],
      correctIdx: 0,
      targetRatio: 3,
    },
  ],
  concaveMirror: [
    {
      question: { bn: "বস্তুকে ঠিক 2F বিন্দুতে রাখলে প্রতিবিম্ব কেমন হবে?", en: "If you place the object exactly at 2F, what will the image be like?" },
      options: [
        { bn: "বাস্তব, উল্টো ও সমান আকারের", en: "Real, inverted and the same size" },
        { bn: "অভাসী, সোজা ও বড়", en: "Virtual, upright and larger" },
        { bn: "কোনো প্রতিবিম্ব তৈরি হবে না", en: "No image will form at all" },
      ],
      correctIdx: 0,
      targetRatio: 2,
    },
    {
      question: { bn: "বস্তুকে ফোকাসের (F) ভেতরে রাখলে প্রতিবিম্ব কেমন হবে?", en: "If you place the object inside the focus (F), what will the image be like?" },
      options: [
        { bn: "অভাসী, সোজা ও বড় (মেকআপ আয়নার মতো)", en: "Virtual, upright and larger (like a makeup mirror)" },
        { bn: "বাস্তব, উল্টো ও ছোট", en: "Real, inverted and smaller" },
        { bn: "কোনো প্রতিবিম্ব তৈরি হবে না", en: "No image will form at all" },
      ],
      correctIdx: 0,
      targetRatio: 0.5,
    },
    {
      question: { bn: "বস্তুকে 2F-এর বাইরে রাখলে প্রতিবিম্ব কেমন হবে?", en: "If you place the object beyond 2F, what will the image be like?" },
      options: [
        { bn: "বাস্তব, উল্টো ও ছোট (টেলিস্কোপের মতো)", en: "Real, inverted and smaller (like a telescope)" },
        { bn: "অভাসী, সোজা ও বড়", en: "Virtual, upright and larger" },
        { bn: "কোনো প্রতিবিম্ব তৈরি হবে না", en: "No image will form at all" },
      ],
      correctIdx: 0,
      targetRatio: 3,
    },
  ],
};

// Steps 2-3: hands-on placement TASKS, picked at random (2 of 3 zones, in a
// random order) so the pair isn't identical every visit — the student
// grabs the real candle and drags it there themselves. Detected live off
// the actual uMag/fMag ratio, so it fires the moment they get there.
interface PlacementTask {
  label: OnboardOption;
  inZone: (ratio: number) => boolean;
}
const PLACEMENT_ZONE_POOL: PlacementTask[] = [
  { label: { bn: "টেনে অনেকটা বাইরে (2F-এর ওপারে)", en: "well out, past 2F" }, inZone: (r) => r > 2.15 },
  { label: { bn: "টেনে মাঝামাঝি (F ও 2F-এর মধ্যে)", en: "to the middle, between F and 2F" }, inZone: (r) => r > 1.15 && r < 1.85 },
  { label: { bn: "টেনে ভেতরে (F-এর কাছে)", en: "back in, close to F" }, inZone: (r) => r < 0.85 },
];

// ============== PER-MODE: focal-length sign explanation ==============
const F_SIGN_EXPLAIN: Record<Mode, { titleBn: string; titleEn: string; bodyBn: string; bodyEn: string }> = {
  convexLens: {
    titleBn: "f ধনাত্মক (positive) কেন?",
    titleEn: "Why is f positive?",
    bodyBn: "উত্তল লেন্স একটি অভিসারী (converging) লেন্স — এটি আলোকরশ্মিকে একত্রিত করে। এর ফোকাস বিন্দু লেন্সের যে পাশে আলো যাচ্ছে, সেই পাশে (বাস্তব পাশে) থাকে। প্রচলিত সাইন কনভেনশন অনুযায়ী, আলো যেদিকে অগ্রসর হয় সেই দিকের দূরত্বকে ধনাত্মক ধরা হয় — তাই উত্তল লেন্সের ফোকাস দূরত্ব (f) সবসময় ধনাত্মক (positive) ধরা হয়।",
    bodyEn: "A convex lens is a converging lens — it brings light rays together. Its focal point sits on the side the light is travelling toward (the real side). By the standard sign convention, distances measured in the direction light travels are taken as positive — so a convex lens's focal length (f) is always taken as positive.",
  },
  concaveLens: {
    titleBn: "f ঋণাত্মক (negative) কেন?",
    titleEn: "Why is f negative?",
    bodyBn: "অবতল লেন্স একটি অপসারী (diverging) লেন্স — এটি আলোকরশ্মিকে ছড়িয়ে দেয়, একত্রিত করে না। এর ফোকাস বিন্দু লেন্সের যে পাশ থেকে আলো আসে সেই একই (অভাসী) পাশে থাকে, উল্টো পাশে নয়। প্রচলিত চিহ্ন নিয়ম (sign convention) অনুযায়ী, আলো যেদিক থেকে আসে তার বিপরীত দিকের দূরত্বকে ধনাত্মক ধরা হয় — তাই অবতল লেন্সের ফোকাস দূরত্ব (f) সবসময় ঋণাত্মক (negative) ধরা হয়।",
    bodyEn: "A concave lens is a diverging lens — it spreads light rays apart instead of bringing them together. Its focal point sits on the same side the light comes from (the virtual side), not the opposite side. By the standard sign convention, distances measured opposite to the direction light travels are taken as positive — so a concave lens's focal length (f) is always taken as negative.",
  },
  convexMirror: {
    titleBn: "f ধনাত্মক (positive) কেন?",
    titleEn: "Why is f positive?",
    bodyBn: "উত্তল দর্পণ একটি অপসারী (diverging) দর্পণ — এটি আলোকরশ্মিকে ছড়িয়ে দেয়। এর ফোকাস বিন্দু দর্পণের পেছনে (অভাসী পাশে) থাকে, অর্থাৎ আলো যেদিক থেকে আসে তার বিপরীত দিকে। প্রচলিত সাইন কনভেনশন অনুযায়ী এই দিকের দূরত্বকে ধনাত্মক ধরা হয় — তাই উত্তল দর্পণের ফোকাস দূরত্ব (f) সবসময় ধনাত্মক (positive) ধরা হয়।",
    bodyEn: "A convex mirror is a diverging mirror — it spreads light rays apart. Its focal point sits behind the mirror (the virtual side), opposite to the direction the light comes from. By the standard sign convention, distances on that side are taken as positive — so a convex mirror's focal length (f) is always taken as positive.",
  },
  concaveMirror: {
    titleBn: "f ঋণাত্মক (negative) কেন?",
    titleEn: "Why is f negative?",
    bodyBn: "অবতল দর্পণ একটি অভিসারী (converging) দর্পণ — এটি আলোকরশ্মিকে একত্রিত করে। এর ফোকাস বিন্দু দর্পণের সামনে থাকে, ঠিক যেদিক থেকে আলো আসে সেদিকেই। প্রচলিত সাইন কনভেনশন অনুযায়ী, আলো যেদিক থেকে আসে সেই দিকের দূরত্বকে ঋণাত্মক ধরা হয় — তাই অবতল দর্পণের ফোকাস দূরত্ব (f) সবসময় ঋণাত্মক (negative) ধরা হয়।",
    bodyEn: "A concave mirror is a converging mirror — it brings light rays together. Its focal point sits in front of the mirror, on the same side the light comes from. By the standard sign convention, distances on that side are taken as negative — so a concave mirror's focal length (f) is always taken as negative.",
  },
};

const toBn = (n: number | string) => {
  const map = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return String(n).replace(/[0-9]/g, (d) => map[+d]);
};
const fmtNum = (n: number, decimals = 0) => {
  if (!isFinite(n)) return "∞";
  const sign = n < 0 ? "−" : n > 0 ? "+" : "";
  const abs = Math.abs(n).toFixed(decimals);
  return sign + toBn(abs);
};

// Use case data with icons and descriptions
const USE_CASES: Record<string, { icon: string; title: string; desc: string; animation: string }[]> = {
  projector: [
    { icon: "projector", title: "প্রজেক্টর", desc: "ছোট স্লাইড থেকে বড় পর্দায় ছবি তৈরি করে", animation: "projector" },
  ],
  camera: [
    { icon: "camera", title: "ক্যামেরা", desc: "বড় দৃশ্য থেকে ছোট ফিল্মে ছবি ধরে", animation: "camera" },
  ],
  magnifier: [
    { icon: "magnifier", title: "ম্যাগনিফাইং গ্লাস", desc: "ছোট জিনিস বড় করে দেখায়", animation: "magnifier" },
  ],
  torch: [
    { icon: "torch", title: "টর্চলাইট", desc: "আলো সমান্তরাল রশ্মিতে পাঠায়", animation: "torch" },
  ],
  glasses: [
    { icon: "glasses", title: "চশমা (Myopia)", desc: "দূরের জিনিস স্পষ্ট দেখায়", animation: "glasses" },
  ],
  rearview: [
    { icon: "rearview", title: "গাড়ির পেছনের আয়না", desc: "পিছনের বড় দৃষ্টিক্ষেত্র এক ছোট আয়নায় দেখায়", animation: "rearview" },
  ],
  shaving: [
    { icon: "shaving", title: "মেকআপ আয়না", desc: "মুখ বড় করে দেখায়", animation: "shaving" },
  ],
  equal: [
    { icon: "equal", title: "সমান প্রতিবিম্ব", desc: "বস্তুর সমান আকারের উল্টো ছবি", animation: "equal" },
  ],
};

const PATH_TO_MODE: Record<string, Mode> = {
  "/lens-mirror/convex-lens": "convexLens",
  "/lens-mirror/concave-lens": "concaveLens",
  "/lens-mirror/convex-mirror": "convexMirror",
  "/lens-mirror/concave-mirror": "concaveMirror",
};
const MODE_TO_PATH: Record<Mode, string> = {
  convexLens: "/lens-mirror/convex-lens",
  concaveLens: "/lens-mirror/concave-lens",
  convexMirror: "/lens-mirror/convex-mirror",
  concaveMirror: "/lens-mirror/concave-mirror",
};

export default function RayOptics({ hideNav = false, celebrateSignal, onConceptOnboardingChange }: { hideNav?: boolean; celebrateSignal?: number; onConceptOnboardingChange?: (active: boolean) => void }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { t, lang } = useLang();
  const [showCongrats, setShowCongrats] = useState(false);
  const [showUseCaseModal, setShowUseCaseModal] = useState(false);
  const [showLearningModal, setShowLearningModal] = useState(false);
  const [showFNegativeExplain, setShowFNegativeExplain] = useState(false);
  const [highlightActionButtons, setHighlightActionButtons] = useState(false);
  // Sliders/presets/toggles live in an on-demand floating toolkit now
  // instead of a permanent side panel — collapsed by default so the canvas
  // gets the full screen; tap the toolkit button to open it.
  const [showControlsPanel, setShowControlsPanel] = useState(false);
  const closeCongrats = () => {
    setShowCongrats(false);
    setHighlightActionButtons(true);
    setTimeout(() => setHighlightActionButtons(false), 3000);
  };
  // Only pop the congrats modal when celebrateSignal actually increments —
  // not on every fresh mount (e.g. switching back to this tab from Refraction),
  // where the prop would already be carrying a stale nonzero value from before.
  const seenCelebrateSignalRef = useRef(celebrateSignal);
  useEffect(() => {
    if (celebrateSignal && celebrateSignal !== seenCelebrateSignalRef.current) {
      setShowCongrats(true);
    }
    seenCelebrateSignalRef.current = celebrateSignal;
  }, [celebrateSignal]);
  const toNum = (n: number | string) => lang === "en" ? String(n) : toBn(n);
  // locale-aware number formatter for display (uses Bengali digits in bn mode)
  const fmtNumL = (n: number, decimals = 0) => {
    if (!isFinite(n)) return "∞";
    const sign = n < 0 ? "−" : n > 0 ? "+" : "";
    const abs = Math.abs(n).toFixed(decimals);
    return sign + (lang === "en" ? abs : toBn(abs));
  };
  const queryMode = searchParams.get("mode") as Mode;
  const validModes = Object.keys(MODE_TO_PATH) as Mode[];
  const initialMode: Mode = queryMode && validModes.includes(queryMode)
    ? queryMode
    : (PATH_TO_MODE[location.pathname] ?? "convexLens");
  const [mode, setMode] = useState<Mode>(initialMode);

  // Sync mode when URL changes (e.g. back/forward or query param change)
  useEffect(() => {
    const qm = searchParams.get("mode") as Mode;
    if (qm && qm !== mode) {
      setMode(qm);
    } else {
      const m = PATH_TO_MODE[location.pathname];
      if (m && m !== mode) setMode(m);
    }
  }, [location.pathname, searchParams]);

  const [uMag, setUMag] = useState(() => {
    const q = searchParams.get("u");
    return q ? parseInt(q) : 150;
  });
  const [fMag, setFMag] = useState(() => {
    const q = searchParams.get("f");
    return q ? parseInt(q) : 80;
  });
  const [yObj, setYObj] = useState(() => {
    const q = searchParams.get("y");
    return q ? parseInt(q) : 50;
  });
  const [lightOn, setLightOn] = useState(false);
  const [allRays, setAllRays] = useState(false);
  const [animProgress, setAnimProgress] = useState(0);
  const [showUseCase, setShowUseCase] = useState<string | null>(null);
  const [useCaseAnim, setUseCaseAnim] = useState(0);

  // ============== IN-SIMULATOR CONCEPT ONBOARDING ==============
  // First time a student lands on a mode (ever — persisted per mode in
  // localStorage, not just this session): everything but the bare canvas
  // hides, and the student is walked through it right there in 4 steps —
  // 0: identify the element (MCQ), 1: a prediction MCQ picked at random
  // from a small pool (auto-driven live once answered), 2-3: two hands-on
  // placement tasks — also picked at random — where they drag the real
  // candle themselves; the moment they get there, the light comes on and
  // the real result explains itself, then chains into the real-world-use
  // and learning-outcome modals. Only after all 4 steps does the rest of
  // the page reveal.
  // One global flag, not per-mode — whichever mode a student first lands on
  // (via a direct link or the default) gets its own onboarding content, but
  // completing it once is enough; switching tabs afterward should never
  // trigger onboarding again for a different mode.
  const conceptKey = () => `ros_concept_onboarding_done_v1`;
  const [showConceptOnboarding, setShowConceptOnboarding] = useState(false);
  const [conceptStep, setConceptStep] = useState(0); // 0 = identify, 1 = prediction MCQ, 2-3 = placement tasks
  const [conceptSelectedIdx, setConceptSelectedIdx] = useState<number | null>(null); // steps 0 & 1 only
  const [conceptChecked, setConceptChecked] = useState(false); // steps 0/1: answer checked; steps 2/3: task achieved
  const [conceptMcq, setConceptMcq] = useState<OnboardMcq | null>(null);
  const [conceptTasks, setConceptTasks] = useState<PlacementTask[]>([]);
  const conceptStartedRef = useRef<Set<Mode>>(new Set());
  useEffect(() => {
    if (conceptStartedRef.current.has(mode)) return;
    conceptStartedRef.current.add(mode);
    try {
      if (localStorage.getItem(conceptKey())) return;
    } catch {}
    // Shuffle: one random prediction MCQ, and 2 of the 3 placement zones
    // in a random order — so it's not the exact same 4 steps every visit.
    const mcqPool = PHYSICS_MCQ_POOL[mode];
    setConceptMcq(mcqPool[Math.floor(Math.random() * mcqPool.length)]);
    setConceptTasks([...PLACEMENT_ZONE_POOL].sort(() => Math.random() - 0.5).slice(0, 2));
    setConceptStep(0);
    setConceptSelectedIdx(null);
    setConceptChecked(false);
    setLightOn(false);
    setAnimProgress(0);
    // Start every mode's onboarding from a neutral position (right at F) —
    // outside all placement zones — so the placement tasks always need an
    // actual drag, never auto-satisfied by wherever u/f were left.
    setUMag(Math.round(fMag));
    setShowConceptOnboarding(true);
  }, [mode]);

  const conceptIdentifyCorrectIdx = MODES.findIndex((m) => m.id === mode);
  const conceptTask = conceptStep >= 2 ? conceptTasks[conceptStep - 2] : null;

  // Live-detect the placement task: the moment the student drags the candle
  // into the named zone, the task completes on its own — no "check" button.
  useEffect(() => {
    if (!showConceptOnboarding || conceptStep < 2 || conceptChecked || !conceptTask) return;
    const ratio = uMag / fMag;
    if (conceptTask.inZone(ratio)) {
      setConceptChecked(true);
      setLightOn(true);
      setAnimProgress(0);
    }
  }, [uMag, fMag, conceptStep, conceptChecked, conceptTask, showConceptOnboarding]);

  const checkIdentifyAnswer = () => {
    if (conceptSelectedIdx === null) return;
    setConceptChecked(true);
  };
  const checkPhysicsMcqAnswer = () => {
    if (conceptSelectedIdx === null || !conceptMcq) return;
    setConceptChecked(true);
    // Drive the simulator live, right next to the question, so the student
    // sees the real answer immediately after committing to a guess.
    setUMag(Math.round(fMag * conceptMcq.targetRatio));
    setLightOn(true);
    setAnimProgress(0);
  };
  const nextConceptStep = () => {
    if (conceptStep >= 3) {
      try { localStorage.setItem(conceptKey(), "1"); } catch {}
      setShowConceptOnboarding(false);
      return;
    }
    setConceptStep((s) => s + 1);
    setConceptSelectedIdx(null);
    setConceptChecked(false);
  };
  // After the two hands-on placement tasks (steps 2 & 3) — once the student
  // has dragged the candle in and seen the live explanation — chain into
  // the existing "real-world use" and "learning outcome" modals before
  // moving on, instead of jumping straight to the next step.
  const [conceptModalChain, setConceptModalChain] = useState<"none" | "usecase" | "learning">("none");
  const startPostDragSequence = () => {
    if (currentUseCases.length > 0) {
      setConceptModalChain("usecase");
      setShowUseCaseModal(true);
    } else {
      setConceptModalChain("learning");
      setShowLearningModal(true);
    }
  };
  const closeConceptUseCaseModal = () => {
    setShowUseCaseModal(false);
    if (conceptModalChain === "usecase") {
      setConceptModalChain("learning");
      setShowLearningModal(true);
    }
  };
  const closeConceptLearningModal = () => {
    setShowLearningModal(false);
    if (conceptModalChain === "learning") {
      setConceptModalChain("none");
      nextConceptStep();
    }
  };
  // Let the page shell (SimulatorPage) know onboarding is running, so it can
  // hide its own header/top nav too — full immersion, nothing but the
  // simulator on screen until the student finishes all 4 steps.
  useEffect(() => {
    onConceptOnboardingChange?.(showConceptOnboarding);
  }, [showConceptOnboarding, onConceptOnboardingChange]);
  // Live readout of where the candle currently sits, shown while a
  // placement task is in progress so the student can see themselves
  // getting closer as they drag.
  const conceptRatio = uMag / fMag;
  const conceptCurrentZoneLabel = conceptRatio > 2.15
    ? t("2F-এর বাইরে", "beyond 2F")
    : conceptRatio > 1.85
    ? t("প্রায় 2F-তে", "near 2F")
    : conceptRatio > 1.15
    ? t("F ও 2F-এর মাঝে", "between F and 2F")
    : conceptRatio > 0.85
    ? t("প্রায় F-তে", "near F")
    : t("F-এর ভেতরে", "inside F");

  // Lab test state
  const [labMode, setLabMode] = useState<"off" | "name" | "playing" | "quiz" | "result">("off");
  const [playerName, setPlayerName] = useState("");
  const [labScore, setLabScore] = useState(0);
  const [labRound, setLabRound] = useState(0);
  const [labQuests, setLabQuests] = useState<Quest[]>([]);
  const [questCompleted, setQuestCompleted] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answerResult, setAnswerResult] = useState<"correct" | "wrong" | null>(null);
  // User must physically grab the candle at least once before the quiz pops up.
  const [candleTouched, setCandleTouched] = useState(false);
  // The quest/quiz panel floats over the page so the user never has to scroll
  // to reach the simulation — minimizing it collapses it to a small pill.
  const [labPanelMinimized, setLabPanelMinimized] = useState(false);
  useEffect(() => {
    if (labMode === "playing" || labMode === "quiz") setLabPanelMinimized(false);
  }, [labMode, labRound]);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const useCaseCanvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number | null>(null);
  const dragRef = useRef<{ active: boolean; offset: number; offsetY: number; targetU: number; cx: number; cy: number; scale: number; lastCommit: number; pendingU: number }>({
    active: false,
    offset: 0,
    offsetY: 0,
    targetU: 150,
    cx: 0,
    cy: 0,
    scale: 1,
    lastCommit: 0,
    pendingU: 150,
  });
  const flameTimeRef = useRef(0);
  const layoutRef = useRef({ cx: 0, cy: 0, scale: 1, W: 0, H: 0, maxRange: 1 });
  const smoothURef = useRef(150);

  // Quest translations lookup
  const QUEST_EN: Record<number, { instruction: string; targetModeLabel: string; question: string; options: string[]; hint: string }> = {
    1: { instruction: "Using a convex lens, place the object between F and 2F. Create a large, inverted image.", targetModeLabel: "Convex Lens", question: "Which device works at this position?", options: ["Projector","Camera","Magnifying Glass","Telescope"], hint: "Object is outside the focal length (81u)" },
    2: { instruction: "Using a convex lens, place the object beyond 2F. Create a small, inverted image.", targetModeLabel: "Convex Lens", question: "This works like which device?", options: ["Flashlight","Projector","Camera","Magnifying Glass"], hint: "Place the object beyond 2F" },
    3: { instruction: "Using a convex lens, place the object inside F. Observe a large, erect virtual image.", targetModeLabel: "Convex Lens", question: "What kind of image forms when the object is inside F?", options: ["Real & inverted","Virtual, erect & large","Same size","No image"], hint: "Works like a magnifying glass" },
    4: { instruction: "Using a concave mirror, create a large image behind the mirror. (Bring object inside F)", targetModeLabel: "Concave Mirror", question: "Where does the image form inside F for a concave mirror?", options: ["In front of mirror","Behind mirror (virtual)","At infinity","At F"], hint: "Works like a makeup mirror" },
    5: { instruction: "Place the object exactly at 2F in a convex lens. Create an equal-size, inverted image.", targetModeLabel: "Convex Lens", question: "What is the magnification (m) when the object is at 2F?", options: ["0.5×","1×","2×","∞"], hint: "When u = 2f, then v = 2f" },
    6: { instruction: "Place the object exactly at F in a convex lens. See what happens!", targetModeLabel: "Convex Lens", question: "What happens when the object is at F?", options: ["Small image","Equal-size image","Rays become parallel — image at infinity","Inverted & large"], hint: "Principle of a flashlight" },
    7: { instruction: "Use a concave lens. Place the object anywhere and observe the image type.", targetModeLabel: "Concave Lens", question: "What is the image always like in a concave lens?", options: ["Real & large","Virtual, erect & small","Same size","At infinity"], hint: "Used in glasses (myopia)" },
    8: { instruction: "Use a convex mirror and observe the image.", targetModeLabel: "Convex Mirror", question: "Where is a convex mirror used?", options: ["In a projector","In car rear-view mirrors","In a camera","In a flashlight"], hint: "Shows a wide field of view" },
    9: { instruction: "Place the object beyond 2F in a concave mirror.", targetModeLabel: "Concave Mirror", question: "What is the image like beyond 2F in a concave mirror?", options: ["Large & erect","Small, inverted & real","Same size","Virtual"], hint: "Like a camera" },
    10: { instruction: "Place the object between F and 2F in a concave mirror.", targetModeLabel: "Concave Mirror", question: "What is the image like at this position?", options: ["Small & erect","Large, inverted & real","Virtual & small","Not formed"], hint: "Like a projector" },
  };
  const tq = (quest: Quest) => lang === "en" && QUEST_EN[quest.id] ? QUEST_EN[quest.id] : { instruction: quest.instruction, targetModeLabel: quest.targetModeLabel, question: quest.quiz.question, options: quest.quiz.options, hint: quest.hint };

  const modeInfo = MODES.find((m) => m.id === mode)!;
  const isLens = modeInfo.isLens;
  const u = -uMag;
  const f = modeInfo.fSign * fMag;

  // Sync search params when state changes
  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    params.set("mode", mode);
    params.set("u", uMag.toString());
    params.set("f", fMag.toString());
    params.set("y", yObj.toString());
    
    if (params.toString() !== searchParams.toString()) {
      setSearchParams(params, { replace: true });
    }
  }, [mode, uMag, fMag, yObj, setSearchParams, searchParams]);

  const { v, m: mag } = useMemo(() => {
    let vv: number;
    if (isLens) {
      const inv = 1 / f + 1 / u;
      vv = Math.abs(inv) < 1e-6 ? Infinity : 1 / inv;
    } else {
      const inv = 1 / f - 1 / u;
      vv = Math.abs(inv) < 1e-6 ? Infinity : 1 / inv;
    }
    const mm = isFinite(vv) ? vv / u : Infinity;
    return { v: vv, m: mm };
  }, [u, f, isLens]);

  const isReal = isLens ? v > 0 : v < 0;
  const isErect = isLens ? mag > 0 : mag < 0;
  const sizeText = Math.abs(mag) > 1.05 ? t("বড়", "Large") : Math.abs(mag) < 0.95 ? t("ছোট", "Small") : t("সমান আকার", "Same size");

  // Smooth drag interpolation
  useEffect(() => {
    dragRef.current.targetU = uMag;
  }, [uMag]);

  // Animation loop
  useEffect(() => {
    let last = performance.now();
    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      flameTimeRef.current += dt;

      // Smooth interpolation for drag
      if (!dragRef.current.active) {
        // Only interpolate when not actively dragging
        const target = dragRef.current.targetU;
        const current = smoothURef.current;
        const diff = target - current;
        if (Math.abs(diff) > 0.5) {
          smoothURef.current = current + diff * Math.min(1, dt * 12);
        } else {
          smoothURef.current = target;
        }
      }

      if (lightOn) {
        setAnimProgress((p) => Math.min(1, p + dt * 0.55));
      }
      animRef.current = requestAnimationFrame(tick);
    };
    animRef.current = requestAnimationFrame(tick);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [lightOn]);

  // Use case animation loop
  useEffect(() => {
    if (!showUseCase) { setUseCaseAnim(0); return; }
    let raf: number;
    let start = performance.now();
    const loop = (now: number) => {
      setUseCaseAnim((now - start) / 1000);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [showUseCase]);

  // Draw use case canvas
  useEffect(() => {
    if (!showUseCase) return;
    const canvas = useCaseCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const W = canvas.width / dpr;
    const H = canvas.height / dpr;
    drawUseCaseAnimation(ctx, W, H, showUseCase, useCaseAnim, t);
  }, [showUseCase, useCaseAnim, t]);

  useEffect(() => {
    setAnimProgress(0);
  }, [mode, uMag, fMag, yObj, allRays]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const W = canvas.width / dpr;
    const H = canvas.height / dpr;

    const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
    bgGrad.addColorStop(0, "#0B1220");
    bgGrad.addColorStop(1, "#1A2238");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    // Subtle grid
    ctx.strokeStyle = "rgba(255,255,255,0.04)";
    ctx.lineWidth = 1;
    for (let x = 0; x < W; x += 24) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }
    for (let yy = 0; yy < H; yy += 24) {
      ctx.beginPath(); ctx.moveTo(0, yy); ctx.lineTo(W, yy); ctx.stroke();
    }

    const smoothU = -smoothURef.current;
    const smoothUMag = smoothURef.current;
    const smoothInv = isLens ? 1 / f + 1 / smoothU : 1 / f - 1 / smoothU;
    const drawV = Math.abs(smoothInv) < 1e-6 ? Infinity : 1 / smoothInv;
    // Mirrors: magnification = -v/u (note the minus sign); lenses: m = v/u
    const drawMag = isFinite(drawV) ? (isLens ? drawV / smoothU : -(drawV / smoothU)) : Infinity;
    const drawIsReal = isLens ? drawV > 0 : drawV < 0;

    const cx = W / 2;
    const cy = H / 2;
    const maxRange = 390;
    const scale = (W / 2 - 30) / maxRange;
    layoutRef.current = { cx, cy, scale, W, H, maxRange };

    const X = (x: number) => cx + x * scale;
    const Y = (y: number) => cy - y * scale;

    // Principal axis
    ctx.strokeStyle = "rgba(255,255,255,0.25)";
    ctx.setLineDash([4, 4]);
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(10, cy); ctx.lineTo(W - 10, cy); ctx.stroke();
    ctx.setLineDash([]);

    // Element (lens/mirror)
    const elemHeight = H * 0.72;
    const top = cy - elemHeight / 2;
    const bot = cy + elemHeight / 2;

    if (isLens) {
      const isConvex = mode === "convexLens";
      const bulge = 14;
      const grad = ctx.createLinearGradient(cx - 24, 0, cx + 24, 0);
      grad.addColorStop(0, "rgba(120,180,255,0.15)");
      grad.addColorStop(0.5, "rgba(180,220,255,0.35)");
      grad.addColorStop(1, "rgba(120,180,255,0.15)");
      ctx.fillStyle = grad;
      ctx.strokeStyle = "rgba(180,220,255,0.85)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      if (isConvex) {
        // Biconvex: both surfaces bulge outward
        ctx.moveTo(cx, top);
        ctx.quadraticCurveTo(cx + bulge, cy, cx, bot);
        ctx.quadraticCurveTo(cx - bulge, cy, cx, top);
      } else {
        // Biconcave: thick edges, thin middle. Outline is a rectangle whose
        // left and right sides curve INWARD toward the optical axis.
        const halfW = bulge + 4; // edge thickness
        ctx.moveTo(cx - halfW, top);
        ctx.lineTo(cx + halfW, top);
        ctx.quadraticCurveTo(cx + halfW - bulge * 1.6, cy, cx + halfW, bot);
        ctx.lineTo(cx - halfW, bot);
        ctx.quadraticCurveTo(cx - halfW + bulge * 1.6, cy, cx - halfW, top);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "rgba(180,220,255,0.85)";
      const tri = (tx: number, ty: number, up: boolean) => {
        ctx.beginPath();
        ctx.moveTo(tx - 4, ty);
        ctx.lineTo(tx + 4, ty);
        ctx.lineTo(tx, ty + (up ? -6 : 6));
        ctx.closePath(); ctx.fill();
      };
      tri(cx, top, true); tri(cx, bot, false);
    } else {
      const bulge = mode === "concaveMirror" ? 20 : -20;
      const cpBulge = bulge * 2; // Control point relative shift
      
      // Draw the reflective surface
      // We shift the mirror so its vertex (center) is at cx, where rays reflect
      ctx.beginPath();
      ctx.moveTo(cx - bulge, top);
      ctx.quadraticCurveTo(cx + bulge, cy, cx - bulge, bot);
      ctx.stroke();

      // Draw the silvered (covered) side markings
      ctx.strokeStyle = "rgba(180,220,255,0.4)";
      ctx.lineWidth = 1.5;
      const step = 8;
      for (let yy = top; yy <= bot; yy += step) {
        const t = (yy - top) / (bot - top);
        // Calculate curveX so it matches the shifted quadratic curve
        const curveX = cx - bulge * Math.pow(1 - 2 * t, 2);
        
        ctx.beginPath();
        ctx.moveTo(curveX, yy);
        ctx.lineTo(curveX + 8, yy + 4);
        ctx.stroke();
      }
    }

    // F, 2F labels
    ctx.fillStyle = "rgba(255,255,255,0.55)";
    ctx.font = "11px Inter, sans-serif";
    ctx.textAlign = "center";
    [
      { x: -fMag, label: "F" }, { x: fMag, label: "F" },
      { x: -2 * fMag, label: "2F" }, { x: 2 * fMag, label: "2F" },
      { x: 0, label: isLens ? "O" : "P" },
    ].forEach((mk) => {
      const px = X(mk.x);
      ctx.fillStyle = "rgba(255,210,63,0.9)";
      ctx.beginPath(); ctx.arc(px, cy, 2.5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.6)";
      ctx.fillText(mk.label, px, cy + 14);
    });

    // === REALISTIC CANDLE ===
    const candleVisualH = 65;
    const objTipY = yObj; // object tip height above axis (can be negative)
    const objBaseY = yObj - candleVisualH; // candle base position
    const candleX = X(smoothU);
    const candleBaseY = Y(objBaseY);
    const candleTopY = Y(objTipY);
    const candleW = Math.max(7, 14 * scale * 0.42);
    drawRealisticCandle(ctx, candleX, candleBaseY, candleTopY, candleW, flameTimeRef.current, lightOn);

    // === RAYS ===
    const oy = objTipY;
    const ox = smoothU;
    const Fx = f;

    type Path = { points: { x: number; y: number }[]; dashed?: boolean }[];
    const buildRays = (): { color: string; segments: Path }[] => {
      const result: { color: string; segments: Path }[] = [];

      if (isLens) {
        const r1: Path = [{ points: [{ x: ox, y: oy }, { x: 0, y: oy }] }];
        if (isFinite(drawV)) {
          if (drawV > 0) r1.push({ points: [{ x: 0, y: oy }, { x: drawV, y: drawMag * oy }] });
          else {
            const slope = -oy / f;
            r1.push({ points: [{ x: 0, y: oy }, { x: maxRange, y: oy + slope * maxRange }] });
            r1.push({ points: [{ x: 0, y: oy }, { x: drawV, y: drawMag * oy }], dashed: true });
          }
        } else {
          r1.push({ points: [{ x: 0, y: oy }, { x: maxRange, y: oy + (-oy / f) * maxRange }] });
        }
        result.push({ color: RAY_COLORS.ray1, segments: r1 });

        const r2: Path = [];
        if (isFinite(drawV) && drawV > 0) {
          r2.push({ points: [{ x: ox, y: oy }, { x: drawV, y: drawMag * oy }] });
        } else {
          r2.push({ points: [{ x: ox, y: oy }, { x: maxRange, y: (oy / ox) * maxRange }] });
          if (isFinite(drawV) && drawV < 0)
            r2.push({ points: [{ x: 0, y: 0 }, { x: drawV, y: drawMag * oy }], dashed: true });
        }
        result.push({ color: RAY_COLORS.ray2, segments: r2 });

        const slopeInc = -oy / (-f - ox);
        const yAtLens = oy + slopeInc * (0 - ox);
        const r3: Path = [
          { points: [{ x: ox, y: oy }, { x: 0, y: yAtLens }] },
          { points: [{ x: 0, y: yAtLens }, { x: maxRange, y: yAtLens }] },
        ];
        if (isFinite(drawV) && drawV < 0)
          r3.push({ points: [{ x: 0, y: yAtLens }, { x: drawV, y: drawMag * oy }], dashed: true });
        result.push({ color: RAY_COLORS.ray3, segments: r3 });
      } else {
        const r1: Path = [{ points: [{ x: ox, y: oy }, { x: 0, y: oy }] }];
        const slope1 = -oy / Fx;
        const xEnd = -maxRange;
        r1.push({ points: [{ x: 0, y: oy }, { x: xEnd, y: oy + slope1 * xEnd }] });
        if (mode === "convexMirror") r1.push({ points: [{ x: 0, y: oy }, { x: Fx, y: 0 }], dashed: true });
        result.push({ color: RAY_COLORS.ray1, segments: r1 });

        const r2: Path = [
          { points: [{ x: ox, y: oy }, { x: 0, y: 0 }] },
          { points: [{ x: 0, y: 0 }, { x: -maxRange, y: (maxRange * oy) / ox }] },
        ];
        if (!drawIsReal && isFinite(drawV))
          r2.push({ points: [{ x: 0, y: 0 }, { x: drawV, y: drawMag * oy }], dashed: true });
        result.push({ color: RAY_COLORS.ray2, segments: r2 });

        const slopeInc3 = (0 - oy) / (Fx - ox);
        const yAtMirror = oy + slopeInc3 * (0 - ox);
        const r3: Path = [
          { points: [{ x: ox, y: oy }, { x: 0, y: yAtMirror }] },
          { points: [{ x: 0, y: yAtMirror }, { x: -maxRange, y: yAtMirror }] },
        ];
        if (!drawIsReal && isFinite(drawV)) {
          r3.push({ points: [{ x: 0, y: yAtMirror }, { x: drawV, y: drawMag * oy }], dashed: true });
          if (mode === "convexMirror")
            r3.push({ points: [{ x: 0, y: yAtMirror }, { x: Fx, y: 0 }], dashed: true });
        }
        result.push({ color: RAY_COLORS.ray3, segments: r3 });
      }
      return result;
    };

    const rays = buildRays();
    const segLen = (a: { x: number; y: number }, b: { x: number; y: number }) =>
      Math.hypot((b.x - a.x) * scale, (b.y - a.y) * scale);

    rays.forEach((ray) => {
      let totalSolid = 0;
      ray.segments.forEach((s) => {
        if (s.dashed) return;
        for (let i = 1; i < s.points.length; i++) totalSolid += segLen(s.points[i - 1], s.points[i]);
      });
      const allowed = animProgress * totalSolid;
      let consumed = 0;

      const drawSegment = (pts: { x: number; y: number }[], dashed: boolean, _fullLen: number, takeLen: number) => {
        if (takeLen <= 0) return;
        let remaining = takeLen;
        const drawPts: { x: number; y: number }[] = [pts[0]];
        for (let i = 1; i < pts.length; i++) {
          const L = segLen(pts[i - 1], pts[i]);
          if (remaining >= L) {
            drawPts.push(pts[i]);
            remaining -= L;
          } else {
            const t = remaining / L;
            drawPts.push({
              x: pts[i - 1].x + (pts[i].x - pts[i - 1].x) * t,
              y: pts[i - 1].y + (pts[i].y - pts[i - 1].y) * t,
            });
            break;
          }
        }
        ctx.save();
        ctx.shadowColor = ray.color;
        ctx.shadowBlur = 12;
        ctx.strokeStyle = ray.color;
        ctx.lineWidth = dashed ? 1.5 : 2.4;
        ctx.setLineDash(dashed ? [6, 5] : []);
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(X(drawPts[0].x), Y(drawPts[0].y));
        for (let i = 1; i < drawPts.length; i++) ctx.lineTo(X(drawPts[i].x), Y(drawPts[i].y));
        ctx.stroke();
        ctx.restore();
      };

      ray.segments.forEach((s) => {
        if (s.dashed) return;
        let segTotal = 0;
        for (let i = 1; i < s.points.length; i++) segTotal += segLen(s.points[i - 1], s.points[i]);
        const take = Math.max(0, Math.min(segTotal, allowed - consumed));
        drawSegment(s.points, false, segTotal, take);
        consumed += segTotal;
      });

      if (animProgress > 0.95) {
        ray.segments.forEach((s) => {
          if (!s.dashed) return;
          let segTotal = 0;
          for (let i = 1; i < s.points.length; i++) segTotal += segLen(s.points[i - 1], s.points[i]);
          drawSegment(s.points, true, segTotal, segTotal);
        });
      }
    });

    // === ALL RAYS MODE: emit many rays from candle tip in all directions ===
    if (allRays) {
      const elementHalfH = (elemHeight / 2) / scale;
      const N = 14;
      const imgX = isFinite(drawV) ? drawV : null;
      const imgY = isFinite(drawV) ? drawMag * oy : null;
      ctx.save();
      ctx.globalAlpha = Math.min(1, animProgress * 1.2) * 0.85;
      for (let i = 0; i < N; i++) {
        const t = i / (N - 1);
        const h = -elementHalfH + t * elementHalfH * 2;
        const hue = 30 + t * 200;
        const color = `hsla(${hue}, 90%, 60%, 0.9)`;
        ctx.strokeStyle = color;
        ctx.shadowColor = color;
        ctx.shadowBlur = 8;
        ctx.lineWidth = 1.4;
        ctx.lineCap = "round";

        // (incident length not needed; progress drives interpolation directly)
        let outX: number, outY: number;
        let virtualBack = false;
        if (imgX !== null && imgY !== null) {
          if (isLens) {
            if (drawV > 0) { outX = imgX; outY = imgY; }
            else {
              const dx = 0 - imgX, dy = h - imgY;
              const norm = Math.hypot(dx, dy) || 1;
              const k = (maxRange * 1.2) / norm;
              outX = 0 + dx * k; outY = h + dy * k;
              virtualBack = true;
            }
          } else {
            if (drawV < 0) { outX = imgX; outY = imgY; }
            else {
              const dx = 0 - imgX, dy = h - imgY;
              const norm = Math.hypot(dx, dy) || 1;
              const k = (maxRange * 1.2) / norm;
              outX = 0 + dx * k; outY = h + dy * k;
              virtualBack = true;
            }
            // Solid reflected rays stay on the object side (x ≤ surfaceWorldX)
            // surfaceWorldX is ≤ 0 for concave mirror, so this is safe.
            // We reference surfaceWorldX later after it's computed; use 0 as the conservative bound here.
            if (!virtualBack) outX = Math.min(-0.001, outX);
          }
        } else {
          const slope = (h - oy) / (0 - ox);
          const xEnd = isLens ? maxRange : -maxRange;
          outX = xEnd; outY = h + slope * (xEnd - 0);
        }

        // Compute the actual mirror/lens surface x at this height.
        // For a mirror drawn as a quadratic bezier with the given bulge,
        // the surface x in canvas pixels = cx - bulge * hNorm².
        // Lenses use the thin-lens approximation (all refraction at x = cx).
        const hNorm = elementHalfH > 0 ? Math.max(-1, Math.min(1, h / elementHalfH)) : 0;
        const surfaceBulge = isLens ? 0 : (mode === "concaveMirror" ? 20 : -20);
        const surfaceCanvasX = cx - surfaceBulge * hNorm * hNorm;
        const surfaceWorldX = (surfaceCanvasX - cx) / scale;

        const incProg = Math.min(1, animProgress * 1.5);
        // Incoming ray ends at the true surface point, not at the axis (cx)
        const incEndX = X(ox) + (surfaceCanvasX - X(ox)) * incProg;
        const incEndY = Y(oy) + (Y(h) - Y(oy)) * incProg;
        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.moveTo(X(ox), Y(oy));
        ctx.lineTo(incEndX, incEndY);
        ctx.stroke();

        if (animProgress > 0.5) {
          const outProg = Math.min(1, (animProgress - 0.5) / 0.5);
          // Reflected ray starts at the true surface point
          const ex = surfaceWorldX + (outX - surfaceWorldX) * outProg;
          const ey = h + (outY - h) * outProg;
          ctx.beginPath();
          ctx.moveTo(surfaceCanvasX, Y(h));
          ctx.lineTo(X(ex), Y(ey));
          ctx.stroke();

          if (virtualBack && imgX !== null && imgY !== null && animProgress > 0.9) {
            ctx.save();
            ctx.setLineDash([5, 4]);
            ctx.lineWidth = 1;
            ctx.globalAlpha *= 0.7;
            ctx.beginPath();
            ctx.moveTo(surfaceCanvasX, Y(h));
            ctx.lineTo(X(imgX), Y(imgY));
            ctx.stroke();
            ctx.restore();
          }
        }
      }
      ctx.restore();
    }
    if (isFinite(drawV) && Math.abs(drawV) > 2 && animProgress > 0.85) {
      const imgAlpha = Math.min(1, (animProgress - 0.85) / 0.15);
      ctx.save();
      ctx.globalAlpha = imgAlpha;
      const ix = X(drawV);
      const isInverted = drawMag < 0;
      const imgCandleW = candleW * Math.min(2, Math.abs(drawMag));
      // Scale image base/top relative to axis using magnification, preserving
      // the candle's vertical offset.
      const imgBaseYWorld = drawMag * objBaseY;
      const imgTipYWorld = drawMag * objTipY;
      const baseY = Y(imgBaseYWorld);
      const topY = Y(imgTipYWorld);
      drawRealisticCandle(
        ctx, ix, baseY, topY, imgCandleW,
        flameTimeRef.current, true, !drawIsReal, isInverted,
      );
      ctx.restore();
    }
  }, [mode, fMag, f, isLens, lightOn, animProgress, yObj, allRays, lang, t]);

  // Resize
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;
      const w = container.offsetWidth;
      const dpr = window.devicePixelRatio || 1;
      // Taller on narrow (mobile) screens — the controls toolkit is now
      // off-canvas on demand instead of a permanent side panel, so the
      // simulation itself can take up more of the screen.
      const ratio = w < 480 ? 1.35 : w < 768 ? 0.9 : 0.65;
      const cssH = Math.max(400, Math.round(w * ratio));
      canvas.style.width = w + "px";
      canvas.style.height = cssH + "px";
      canvas.width = w * dpr;
      canvas.height = cssH * dpr;
      const ctx = canvas.getContext("2d");
      ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [showConceptOnboarding]);

  // Resize use case canvas
  useEffect(() => {
    if (!showUseCase) return;
    const canvas = useCaseCanvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;
    const w = parent.offsetWidth;
    const dpr = window.devicePixelRatio || 1;
    const h = 200;
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    const ctx = canvas.getContext("2d");
    ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
  }, [showUseCase]);

  // Continuous redraw
  useEffect(() => {
    let raf: number;
    const loop = () => {
      draw();
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [draw]);

  // Smooth drag handlers
  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    const { cx, cy, scale } = layoutRef.current;
    const candleScreenX = cx - smoothURef.current * scale;
    // Candle vertical center on screen ≈ Y(yObj - 25) (middle of candle body)
    const candleCenterY = cy - (yObj - 25) * scale;
    if (Math.abs(px - candleScreenX) < 70 && Math.abs(py - candleCenterY) < 90) {
      dragRef.current.active = true;
      dragRef.current.offset = px - candleScreenX;
      dragRef.current.offsetY = py - candleCenterY;
      dragRef.current.cx = cx;
      dragRef.current.cy = cy;
      dragRef.current.scale = scale;
      dragRef.current.lastCommit = performance.now();
      dragRef.current.pendingU = smoothURef.current;
      canvas.setPointerCapture(e.pointerId);
      canvas.style.cursor = "grabbing";
      setCandleTouched(true);
    }
  };
  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!dragRef.current.active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const px = e.clientX - rect.left - dragRef.current.offset;
    const py = e.clientY - rect.top - dragRef.current.offsetY;
    const { cx, cy, scale } = dragRef.current;
    const newU = (px - cx) / scale;
    const newUmag = Math.max(5, Math.min(350, -newU));
    smoothURef.current = newUmag;
    dragRef.current.targetU = newUmag;
    dragRef.current.pendingU = newUmag;
    // Vertical: convert screen y back to world y. candleCenterY = cy - (yObj-25)*scale
    // => yObj = 25 + (cy - py)/scale
    const newYObj = 25 + (cy - py) / scale;
    const clampedY = Math.max(-120, Math.min(180, newYObj));
    setYObj(clampedY);
    const now = performance.now();
    if (now - dragRef.current.lastCommit > 80) {
      dragRef.current.lastCommit = now;
      setUMag(Math.round(newUmag));
    }
  };
  const onPointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    dragRef.current.active = false;
    dragRef.current.targetU = smoothURef.current;
    setUMag(Math.round(smoothURef.current));
    if (canvasRef.current) canvasRef.current.style.cursor = "grab";
    try { canvasRef.current?.releasePointerCapture(e.pointerId); } catch {}
  };

  const { explanation, useCaseKey } = useMemo(() => {
    let exp = "";
    let key = "";
    if (mode === "concaveLens") { exp = t("অবতল লেন্সে সবসময় একই পাশে অভাসী, সোজা, ছোট প্রতিবিম্ব তৈরি হয়।", "Concave lens always forms virtual, erect, small image on the same side."); key = "glasses"; }
    else if (mode === "convexMirror") { exp = t("উত্তল দর্পণে সবসময় আয়নার পেছনে অভাসী, সোজা, ছোট প্রতিবিম্ব। বড় দৃষ্টিক্ষেত্র।", "Convex mirror always forms virtual, erect, small image behind the mirror. Wide field of view."); key = "rearview"; }
    else {
      const ratio = uMag / fMag;
      const isMirror = mode === "concaveMirror";
      if (Math.abs(ratio - 1) < 0.05) { exp = isMirror ? t("বস্তু ঠিক F-এ। প্রতিবিম্ব অসীমে — সমান্তরাল রশ্মি।", "Object at F. Rays become parallel — image at infinity.") : t("বস্তু ঠিক F-এ। রশ্মি সমান্তরাল হয়ে যায় — প্রতিবিম্ব অসীমে।", "Object at F. Rays become parallel — image at infinity."); key = "torch"; }
      else if (ratio < 1) { exp = isMirror ? t("বস্তু F-এর ভেতরে। প্রতিবিম্ব আয়নার পেছনে — অভাসী, সোজা, বড়।", "Object inside F. Image on same side — virtual, erect, enlarged.") : t("বস্তু F-এর ভেতরে। প্রতিবিম্ব একই দিকে — অভাসী, সোজা, বড়।", "Object inside F. Image on same side — virtual, erect, enlarged."); key = isMirror ? "shaving" : "magnifier"; }
      else if (Math.abs(ratio - 2) < 0.05) { exp = t("বস্তু ঠিক ২F-এ। প্রতিবিম্ব ঠিক ২F-এ — বাস্তব, উল্টো, সমান।", "Object at 2F. Image at 2F — real, inverted, same size."); key = "equal"; }
      else if (ratio > 2) { exp = t("বস্তু ২F-এর বাইরে। প্রতিবিম্ব F ও ২F-এর মাঝে — বাস্তব, উল্টো, ছোট।", "Object beyond 2F. Image between F & 2F — real, inverted, small."); key = "camera"; }
      else { exp = t("বস্তু F ও ২F-এর মাঝে। প্রতিবিম্ব ২F-এর বাইরে — বাস্তব, উল্টো, বড়।", "Object between F & 2F. Image beyond 2F — real, inverted, enlarged."); key = "projector"; }
    }
    return { explanation: exp, useCaseKey: key };
  }, [mode, uMag, fMag, lang]);

  const outcomeTitle = mode === "convexLens" ? t("উত্তল লেন্স", "Convex Lens")
    : mode === "concaveLens" ? t("অবতল লেন্স", "Concave Lens")
    : mode === "convexMirror" ? t("উত্তল দর্পণ", "Convex Mirror")
    : t("অবতল দর্পণ", "Concave Mirror");

  const outcomeMessage = mode === "convexLens"
    ? t("উত্তল লেন্স নিয়ে শিখলে তুমি বুঝবে কীভাবে ক্যামেরা এবং প্রজেক্টর কাজ করে।", "Learning about convex lenses will help you understand how cameras and projectors work.")
    : mode === "concaveLens"
    ? t("অবতল লেন্স সবসময় ছোট এবং সোজা প্রতিবিম্ব তৈরি করে।", "Concave lenses always form a small, erect virtual image.")
    : mode === "convexMirror"
    ? t("উত্তল দর্পণ গাড়ির পেছনের আয়নায় ব্যবহৃত হয় বিস্তৃত দৃশ্য দেখার জন্য।", "Convex mirrors are used as car rear-view mirrors for a wide field of view.")
    : t("অবতল দর্পণ বিভিন্ন ধরনের প্রতিবিম্ব তৈরি করে যা বস্তুর অবস্থানের উপর নির্ভর করে।", "Concave mirrors form different types of images depending on the object's position.");

  const outcomeTips: string[] = mode === "convexLens" ? [
    t("বস্তু ২F-এর বাইরে রাখলে ছোট উল্টো প্রতিবিম্ব হয় (ক্যামেরার মতো)", "Object beyond 2F → small, inverted image (like a camera)"),
    t("বস্তু F-এর মধ্যে রাখলে বড় সোজা প্রতিবিম্ব হয় (ম্যাগনিফাইং গ্লাসের মতো)", "Object inside F → large, erect image (like a magnifying glass)"),
    t("বস্তু F এবং ২F-এর মধ্যে রাখলে বড় উল্টো প্রতিবিম্ব হয় (প্রজেক্টরের মতো)", "Object between F and 2F → large, inverted image (like a projector)"),
  ] : mode === "concaveLens" ? [
    t("অবতল লেন্স কখনও বাস্তব প্রতিবিম্ব তৈরি করে না", "Concave lenses never form a real image"),
    t("এটি চশমায় ব্যবহৃত হয় যারা কাছের জিনিস ভালো দেখতে পায় না", "Used in glasses for people with myopia (nearsightedness)"),
    t("প্রতিবিম্ব সবসময় অভাসী এবং সোজা থাকে", "Image is always virtual and erect"),
  ] : mode === "convexMirror" ? [
    t("উত্তল দর্পণ সবসময় ছোট এবং সোজা প্রতিবিম্ব তৈরি করে", "Convex mirrors always form small, erect images"),
    t("এটি ব্যাপক ক্ষেত্র দৃশ্যমান করতে পারে", "They show a wide field of view"),
    t("প্রতিবিম্ব সবসময় দর্পণের পেছনে থাকে", "The image is always behind the mirror"),
  ] : [
    t("বস্তু F-এর মধ্যে রাখলে বড় সোজা প্রতিবিম্ব হয় (মেকআপ আয়নার মতো)", "Object inside F → large, erect image (like a makeup mirror)"),
    t("বস্তু F এবং ২F-এর মধ্যে রাখলে বড় উল্টো প্রতিবিম্ব হয় (প্রজেক্টরের মতো)", "Object between F and 2F → large, inverted image (like a projector)"),
    t("বস্তু ২F-এর বাইরে রাখলে ছোট উল্টো প্রতিবিম্ব হয় (টেলিস্কোপের মতো)", "Object beyond 2F → small, inverted image (like a telescope)"),
  ];

  const currentUseCases = USE_CASES[useCaseKey] || [];

  const positionIndicator = useMemo(() => {
    if (mode === "concaveLens" || mode === "convexMirror") return "";
    const r = uMag / fMag;
    if (Math.abs(r - 1) < 0.05) return t("বস্তু F-এ", "Object at F");
    if (r < 1) return t("বস্তু F-এর ভেতরে", "Object inside F");
    if (Math.abs(r - 2) < 0.05) return t("বস্তু 2F-এ", "Object at 2F");
    if (r > 2) return t("বস্তু 2F-এর বাইরে", "Object beyond 2F");
    return t("বস্তু F ও 2F-এর মাঝে", "Object between F and 2F");
  }, [mode, uMag, fMag, lang]);

  const presets = [
    { label: t("অসীম দূরত্ব", "Infinite Distance"), calc: () => Math.min(340, fMag * 5) },
    { label: t("2F-এ বস্তু", "Object at 2F"), calc: () => fMag * 2 },
    { label: t("F ও 2F-এর মাঝে", "Between F and 2F"), calc: () => Math.round(fMag * 1.5) },
    { label: t("F-এ বস্তু", "Object at F"), calc: () => fMag },
    { label: t("F-এর ভেতরে", "Inside F"), calc: () => Math.max(5, Math.round(fMag * 0.5)) },
  ];

  return (
    <div className="ro-root">
      <style>{styles}</style>

      {/* Everything but the bare canvas hides while the in-simulator concept
          onboarding is running. Only once the student finishes all 4 steps
          does the rest of the page (header, mode tabs, formula card)
          reveal itself. */}
      {!showConceptOnboarding && (
      <>
      {/* LAB TEST BUTTON in header */}
      <div className="ro-header" style={{ position: "relative" }}>
        <div className="icon"><Microscope size={20} /></div>
        <div>
          <h1 className="bn">{t("লেন্স ও দর্পণ", "Lenses & Mirrors")}</h1>
          <p>Ray Optics: Lens & Mirror</p>
        </div>
        <div className="assessment-cta-wrap" style={{ marginLeft: "auto" }}>
          {labMode === "off" && (
            <div className="assessment-cta-hint bn">
              {t("তুমি তো সিমুলেশন নিজে করলে — এখন পরীক্ষা দিয়ে দেখো!", "You've tried the simulation yourself — now test what you've learned!")}
            </div>
          )}
          <button
            className={"lab-test-btn " + (labMode !== "off" ? "active" : "")}
            onClick={() => {
              if (labMode === "off") setLabMode("name");
              else setLabMode("off");
            }}
          >
            <FlaskConical size={14} /> {labMode === "off" ? t("অ্যাসেসমেন্ট", "Assessment") : t("অ্যাসেসমেন্ট শেষ করুন", "End Assessment")}
          </button>
        </div>
      </div>
      </>
      )}

      {/* ASSESSMENT — NAME ENTRY */}
      {labMode === "name" && (
        <div className="ro-card lab-overlay">
          <div className="lab-name-card">
            <div className="lab-name-icon"><FlaskConical size={40} /></div>
            <h2 className="bn">{t("অ্যাসেসমেন্ট শুরু করো!", "Start the Assessment!")}</h2>
            <p className="bn">
              {t("৫টি প্রশ্নের সঠিক উত্তর দিয়ে পয়েন্ট অর্জন করো।", "Answer 5 questions correctly to earn points.")}
            </p>
            <input
              className="lab-name-input"
              placeholder={t("তোমার নাম লেখো...", "Enter your name...")}
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && playerName.trim()) {
                  const shuffled = [...QUEST_POOL].sort(() => Math.random() - 0.5).slice(0, 5);
                  setLabQuests(shuffled);
                  setLabRound(0);
                  setLabScore(0);
                  setQuestCompleted(false);
                  setCandleTouched(false);
                  setSelectedAnswer(null);
                  setAnswerResult(null);
                  setLabMode("playing");
                }
              }}
            />
            <button
              className="lab-start-btn"
              disabled={!playerName.trim()}
              onClick={() => {
                const shuffled = [...QUEST_POOL].sort(() => Math.random() - 0.5).slice(0, 5);
                setLabQuests(shuffled);
                setLabRound(0);
                setLabScore(0);
                setQuestCompleted(false);
                  setCandleTouched(false);
                setSelectedAnswer(null);
                setAnswerResult(null);
                setLabMode("playing");
              }}
            >
              {t("শুরু করো", "Start")}
            </button>
            
          </div>
        </div>
      )}

      {/* LAB TEST — FLOATING QUEST / QUIZ PANEL (minimizable, always accessible without scrolling) */}
      {(labMode === "playing" || labMode === "quiz") && labQuests[labRound] && (() => {
        const quest = labQuests[labRound];
        const modeMatches = mode === quest.targetMode;
        const isInRange = modeMatches && uMag >= quest.targetURange[0] && uMag <= quest.targetURange[1];
        if (labMode === "playing" && isInRange && candleTouched && !questCompleted) {
          // Auto-trigger quiz after small delay
          setTimeout(() => {
            setQuestCompleted(true);
            setLabMode("quiz");
          }, 800);
        }

        if (labPanelMinimized) {
          return (
            <div className="lab-floating-panel">
              <button className="lab-panel-pill" onClick={() => setLabPanelMinimized(false)}>
                <FlaskConical size={16} />
                <span className="bn">
                  {labMode === "quiz" ? t("প্রশ্ন", "Question") : t("কুইজ", "Quiz")} {toNum(labRound + 1)}/{toNum(5)}
                </span>
                {labMode === "quiz" && <span className="lab-panel-pill-dot" />}
                <ChevronUp size={15} />
              </button>
            </div>
          );
        }

        return (
          <div className="lab-floating-panel">
            {labMode === "playing" ? (
              <div className="ro-card quest-card lab-panel-card">
                <button className="lab-panel-minimize-btn" onClick={() => setLabPanelMinimized(true)} aria-label={t("ছোট করো", "Minimize")}>
                  <ChevronDown size={16} />
                </button>
                <div className="quest-header">
                  <div className="quest-icon-wrap">
                    <span className="quest-icon"><Target size={22} /></span>
                  </div>
                  <div>
                    <div className="quest-label">ACTIVE QUEST</div>
                    <div className="quest-title bn">{t("কুইজ", "Quiz")} {toNum(labRound + 1)}/{toNum(5)}</div>
                  </div>
                  <div className="quest-score-badge">{toNum(labScore)} {t("পয়েন্ট", "Points")}</div>
                </div>
                <div className="quest-instruction bn">"{tq(quest).instruction}"</div>
                {!modeMatches && (
                  <div className="quest-mode-hint bn">
                    {t("প্রথমে", "First select")} "<strong>{tq(quest).targetModeLabel}</strong>" {t("সিলেক্ট করো ↓", "↓")}
                  </div>
                )}
                {modeMatches && !isInRange && (
                  <div className="quest-mode-ok bn">
                    {tq(quest).targetModeLabel} {t("সিলেক্ট হয়েছে — এবার মোমবাতি সরাও!", "selected — now move the candle!")}
                  </div>
                )}
                <div className="quest-hint bn">
                  <span className="quest-hint-icon"><Info size={14} /></span> {tq(quest).hint}
                </div>
                {isInRange && !candleTouched && (
                  <div className="quest-mode-hint bn">
                    {t("মোমবাতিটিকে একবার ছুঁয়ে দেখো — তারপর কুইজ আসবে!", "Touch the candle once — then the quiz will appear!")}
                  </div>
                )}
                {isInRange && candleTouched && (
                  <div className="quest-success-flash bn">{t("সঠিক অবস্থান! কুইজ আসছে...", "Correct position! Quiz coming...")}</div>
                )}
              </div>
            ) : (
              <div className="ro-card quiz-card lab-panel-card">
                <button className="lab-panel-minimize-btn" onClick={() => setLabPanelMinimized(true)} aria-label={t("ছোট করো", "Minimize")}>
                  <ChevronDown size={16} />
                </button>
                <div className="quiz-header">
                  <span className="quiz-icon"><Info size={22} /></span>
                  <span className="quiz-round bn">{t("প্রশ্ন", "Question")} {toNum(labRound + 1)}/{toNum(5)}</span>
                </div>
                <div className="quiz-question bn">{tq(quest).question}</div>
                <div className="quiz-options">
                  {tq(quest).options.map((opt, i) => (
                    <button
                      key={i}
                      className={
                        "quiz-option bn" +
                        (selectedAnswer === i ? (answerResult === "correct" ? " correct" : " wrong") : "") +
                        (answerResult && i === quest.quiz.correctIndex ? " correct" : "")
                      }
                      disabled={answerResult !== null}
                      onClick={() => {
                        setSelectedAnswer(i);
                        const isCorrect = i === quest.quiz.correctIndex;
                        setAnswerResult(isCorrect ? "correct" : "wrong");
                        if (isCorrect) setLabScore((s) => s + 20);

                        // Move to next quest or finish after delay
                        setTimeout(() => {
                          const nextRound = labRound + 1;
                          if (nextRound >= 5) {
                            // Finish — save to leaderboard
                            setLabScore(isCorrect ? labScore + 20 : labScore);
                            setLabMode("result");
                          } else {
                            setLabRound(nextRound);
                            setQuestCompleted(false);
                            setCandleTouched(false);
                            setSelectedAnswer(null);
                            setAnswerResult(null);
                            setLabMode("playing");
                          }
                        }, 1500);
                      }}
                    >
                      <span className="opt-letter">{String.fromCharCode(65 + i)}</span>
                      {opt}
                    </button>
                  ))}
                </div>
                {answerResult && (
                  <div className={"quiz-feedback bn " + answerResult}>
                    {answerResult === "correct" ? t("সঠিক! +২০ পয়েন্ট", "Correct! +20 points") : t("ভুল উত্তর", "Wrong answer")}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })()}

      {/* LAB TEST — RESULT */}
      {labMode === "result" && (
        <div className="ro-card result-card">
          <div className="result-trophy"><Trophy size={48} /></div>
          <h2 className="bn result-title">
            {labScore >= 80 ? t("অসাধারণ!", "Excellent!") : labScore >= 40 ? t("ভালো চেষ্টা!", "Good try!") : t("আবার চেষ্টা করো!", "Try again!")}
          </h2>
          <div className="result-name bn">{playerName}</div>
          <div className="result-score">{toNum(labScore)}<span>/{toNum(100)} {t("পয়েন্ট", "Points")}</span></div>
          <div className="result-stars">
            {[...Array(5)].map((_, i) => (
              <span key={i} className={i < labScore / 20 ? "star-filled" : "star-empty"}><Star size={20} /></span>
            ))}
          </div>
          <div className="result-btns">
            <button className="lab-start-btn" onClick={() => {
              const shuffled = [...QUEST_POOL].sort(() => Math.random() - 0.5).slice(0, 5);
              setLabQuests(shuffled);
              setLabRound(0);
              setLabScore(0);
              setQuestCompleted(false);
                  setCandleTouched(false);
              setSelectedAnswer(null);
              setAnswerResult(null);
              setLabMode("playing");
            }}>{t("আবার খেলো", "Play Again")}</button>
            <button className="lab-cancel-btn" onClick={() => { setLabMode("off"); }}>{t("হোমে ফিরো", "Go Home")}</button>
          </div>
        </div>
      )}

      {!showConceptOnboarding && (
      <div className="ro-card mode-tabs-card">
        <div className="tabs">
          {MODES.map((mm) => (
            <button
              key={mm.id}
              className={"tab-btn " + (mode === mm.id ? "active" : "")}
              onClick={() => {
                setMode(mm.id);
                setLightOn(false);
                setAnimProgress(0);
                setShowUseCase(null);
                if (!hideNav) navigate(MODE_TO_PATH[mm.id]);
              }}
            >
              {mm.id === "convexLens" ? t("উত্তল লেন্স", "Convex Lens")
                : mm.id === "concaveLens" ? t("অবতল লেন্স", "Concave Lens")
                : mm.id === "convexMirror" ? t("উত্তল দর্পণ", "Convex Mirror")
                : t("অবতল দর্পণ", "Concave Mirror")}
            </button>
          ))}
        </div>
      </div>
      )}

      {(() => {
        const canvasCardContent = (
          <div className="ro-card canvas-card">
            <div className="canvas-wrap" ref={containerRef}>
              <canvas
                ref={canvasRef}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerCancel={onPointerUp}
                style={{ touchAction: "none", cursor: dragRef.current.active ? "grabbing" : "grab" }}
              />
              <div className="canvas-hint bn">{t("মোমবাতিকে ছুঁয়ে যেকোনো দিকে টেনে সরাও (অনুভূমিক ও উল্লম্ব)", "Touch the candle and drag in any direction (horizontal & vertical)")}</div>
            </div>
            <div className="action-row">
              <button
                className={"light-btn " + (lightOn ? "on" : "")}
                onClick={() => {
                  if (lightOn) { setLightOn(false); setAnimProgress(0); }
                  else { setLightOn(true); setAnimProgress(0); }
                }}
              >
                {lightOn ? t("আলো নিভাও", "Turn Off Light") : t("আলো জ্বালাও", "Turn On Light")}
              </button>
              <button
                className={"outcome-action-btn learning-action-btn" + (highlightActionButtons ? " pulse-highlight" : "")}
                onClick={() => setShowLearningModal(true)}
                aria-label={t("লার্নিং আউটকাম", "Learning Outcome")}
                title={t("লার্নিং আউটকাম", "Learning Outcome")}
              >
                <Lightbulb size={16} />
              </button>
              {currentUseCases.length > 0 && (
                <button
                  className={"outcome-action-btn goto-usecase-btn" + (highlightActionButtons ? " pulse-highlight" : "")}
                  onClick={() => setShowUseCaseModal(true)}
                  aria-label={t("বাস্তব ব্যবহার", "Real-world Use")}
                  title={t("বাস্তব ব্যবহার", "Real-world Use")}
                >
                  <Info size={16} />
                </button>
              )}
              <button
                className={"outcome-action-btn controls-toggle-btn" + (showControlsPanel ? " active" : "")}
                onClick={() => setShowControlsPanel((v) => !v)}
                aria-label={t("নিয়ন্ত্রণ (দূরত্ব, প্রিসেট, রশ্মি)", "Controls (distance, presets, rays)")}
                title={t("নিয়ন্ত্রণ", "Controls")}
              >
                <SlidersHorizontal size={16} />
              </button>
            </div>
            {!showConceptOnboarding && (
            <div className="legend">
              <span><i style={{ background: RAY_COLORS.ray1 }} /> {t("সমান্তরাল রশ্মি", "Parallel ray")}</span>
              <span><i style={{ background: RAY_COLORS.ray2 }} /> {t("কেন্দ্রীয় রশ্মি", "Central ray")}</span>
              <span><i style={{ background: RAY_COLORS.ray3 }} /> {t("ফোকাস রশ্মি", "Focal ray")}</span>
              <span className="legend-dash">- - {t("অভাসী", "Virtual")}</span>
            </div>
            )}
          </div>
        );
        if (!showConceptOnboarding) {
          return (
            <div className="experiment-row">
              <div className="experiment-canvas">{canvasCardContent}</div>
            </div>
          );
        }
        // Onboarding: canvas + the question card live together inside one
        // contained, centered popup (with a dimmed backdrop) instead of
        // the canvas going edge-to-edge and the question floating separately.
        return (
          <>
            <div className="onboarding-modal-backdrop" />
            <div className="onboarding-modal-shell">
              {canvasCardContent}
              <div className="ro-card quiz-card concept-onboard-card" key={conceptStep}>
                <div className="quiz-header">
                  <span className="quiz-icon"><GraduationCap size={22} /></span>
                  <span className="quiz-round bn">{t("ধাপ", "Step")} {toNum(conceptStep + 1)}/{toNum(4)}</span>
                </div>

                {conceptStep === 0 && (
                  <>
                    <div className="quiz-question bn">{t(IDENTIFY_QUESTION.bn, IDENTIFY_QUESTION.en)}</div>
                    <div className="quiz-options">
                      {IDENTIFY_OPTIONS.map((opt, i) => (
                        <button
                          key={i}
                          className={
                            "quiz-option bn" +
                            (!conceptChecked && conceptSelectedIdx === i ? " sel" : "") +
                            (conceptChecked && conceptSelectedIdx === i ? (i === conceptIdentifyCorrectIdx ? " correct" : " wrong") : "") +
                            (conceptChecked && i === conceptIdentifyCorrectIdx ? " correct" : "")
                          }
                          disabled={conceptChecked}
                          onClick={() => setConceptSelectedIdx(i)}
                        >
                          <span className="opt-letter">{String.fromCharCode(65 + i)}</span>
                          {t(opt.bn, opt.en)}
                        </button>
                      ))}
                    </div>
                    {conceptChecked && (
                      <>
                        <div className={"quiz-feedback bn " + (conceptSelectedIdx === conceptIdentifyCorrectIdx ? "correct" : "wrong")}>
                          {conceptSelectedIdx === conceptIdentifyCorrectIdx ? t("সঠিক!", "Correct!") : t("ভুল উত্তর", "Wrong answer")}
                        </div>
                        <div className="explain-card-v2 concept-explain">
                          {conceptSelectedIdx !== null && conceptSelectedIdx !== conceptIdentifyCorrectIdx && (
                            <div className="identify-compare">
                              <div className="identify-compare-item wrong">
                                <ShapeIcon shape={MODES[conceptSelectedIdx].id} />
                                <span className="identify-compare-label bn">{t("তুমি বলেছো", "You said")}</span>
                                <span className="identify-compare-name bn">{t(IDENTIFY_OPTIONS[conceptSelectedIdx].bn, IDENTIFY_OPTIONS[conceptSelectedIdx].en)}</span>
                              </div>
                              <ChevronRight className="identify-compare-arrow" size={18} />
                              <div className="identify-compare-item correct">
                                <ShapeIcon shape={mode} />
                                <span className="identify-compare-label bn">{t("আসলে এটা", "It's actually")}</span>
                                <span className="identify-compare-name bn">{t(IDENTIFY_OPTIONS[conceptIdentifyCorrectIdx].bn, IDENTIFY_OPTIONS[conceptIdentifyCorrectIdx].en)}</span>
                              </div>
                            </div>
                          )}
                          <p className="explain-body bn">{t(IDENTIFY_EXPLAIN[mode].bn, IDENTIFY_EXPLAIN[mode].en)}</p>
                        </div>
                      </>
                    )}
                    {!conceptChecked && (
                      <button className="predict-start-btn" disabled={conceptSelectedIdx === null} onClick={checkIdentifyAnswer}>
                        {t("চেক করো", "Check")}
                      </button>
                    )}
                  </>
                )}

                {conceptStep === 1 && conceptMcq && (
                  <>
                    <div className="quiz-question bn">{t(conceptMcq.question.bn, conceptMcq.question.en)}</div>
                    <div className="quiz-options">
                      {conceptMcq.options.map((opt, i) => (
                        <button
                          key={i}
                          className={
                            "quiz-option bn" +
                            (!conceptChecked && conceptSelectedIdx === i ? " sel" : "") +
                            (conceptChecked && conceptSelectedIdx === i ? (i === conceptMcq.correctIdx ? " correct" : " wrong") : "") +
                            (conceptChecked && i === conceptMcq.correctIdx ? " correct" : "")
                          }
                          disabled={conceptChecked}
                          onClick={() => setConceptSelectedIdx(i)}
                        >
                          <span className="opt-letter">{String.fromCharCode(65 + i)}</span>
                          {t(opt.bn, opt.en)}
                        </button>
                      ))}
                    </div>
                    {conceptChecked && (
                      <>
                        <div className={"quiz-feedback bn " + (conceptSelectedIdx === conceptMcq.correctIdx ? "correct" : "wrong")}>
                          {conceptSelectedIdx === conceptMcq.correctIdx ? t("সঠিক!", "Correct!") : t("ভুল উত্তর", "Wrong answer")}
                        </div>
                        <div className="explain-card-v2 concept-explain">
                          <div className="explain-header">
                            <div className="explain-icon-pulse"><Sparkles size={18} /></div>
                            <div className="explain-title bn">{t("সিমুলেশনে দেখো — আসলে কী হচ্ছে:", "Watch the simulation — here's what's really happening:")}</div>
                          </div>
                          <p className="explain-body bn">{explanation}</p>
                        </div>
                      </>
                    )}
                    {!conceptChecked && (
                      <button className="predict-start-btn" disabled={conceptSelectedIdx === null} onClick={checkPhysicsMcqAnswer}>
                        {t("চেক করো", "Check")}
                      </button>
                    )}
                  </>
                )}

                {conceptStep >= 2 && conceptTask && (
                  <>
                    <div className="quiz-question bn">
                      {t("মোমবাতিটি ধরে ", "Grab the candle and drag it — ")}
                      <strong>{t(conceptTask.label.bn, conceptTask.label.en)}</strong>
                      {t("।", ".")}
                    </div>
                    {!conceptChecked && (
                      <div className="quest-mode-hint bn">
                        {t("তুমি এখন আছো:", "You're currently at:")} <strong>{conceptCurrentZoneLabel}</strong>
                      </div>
                    )}
                    {conceptChecked && (
                      <>
                        <div className="quiz-feedback bn correct">{t("চমৎকার! ঠিক জায়গায় নিয়ে গেছো।", "Nicely done! You got it there.")}</div>
                        <div className="explain-card-v2 concept-explain">
                          <div className="explain-header">
                            <div className="explain-icon-pulse"><Sparkles size={18} /></div>
                            <div className="explain-title bn">{t("দেখো — আসলে কী হচ্ছে:", "Here's what's really happening:")}</div>
                          </div>
                          <p className="explain-body bn">{explanation}</p>
                        </div>
                      </>
                    )}
                  </>
                )}

                {conceptChecked && conceptStep < 2 && (
                  <button className="predict-start-btn" onClick={nextConceptStep}>
                    {t("পরবর্তী ধাপ →", "Next step →")}
                  </button>
                )}
                {conceptChecked && conceptStep >= 2 && (
                  <button className="predict-start-btn" onClick={startPostDragSequence}>
                    {t("বাস্তব উদাহরণ দেখো →", "See a real-world example →")}
                  </button>
                )}
              </div>
            </div>
          </>
        );
      })()}

      {/* Controls toolkit — floating, opened on demand via the sliders icon
          in the action-row, instead of a permanent side panel. */}
      {showControlsPanel && (
        <div className="lab-floating-panel controls-toolkit-panel">
          <div className="ro-card controls-toolkit-card">
            <button className="lab-panel-minimize-btn" onClick={() => setShowControlsPanel(false)} aria-label={t("বন্ধ করো", "Close")}>
              <X size={16} />
            </button>
            <div className="ro-card sliders-card">
              <div className="slider-row">
                <label><span>{t("বস্তুর দূরত্ব (u)", "Object Distance (u)")}</span><span className="val">{fmtNumL(u)} {t("একক", "units")}</span></label>
                <input
                  type="range" min={5} max={350} value={uMag}
                  onChange={(e) => setUMag(+e.target.value)}
                />
              </div>
              <div className="slider-row">
                <label><span>{t("ফোকাস দূরত্ব (f)", "Focal Length (f)")}</span><span className="val">{fmtNumL(f)} {t("একক", "units")}</span></label>
                <input type="range" min={20} max={150} value={fMag} onChange={(e) => setFMag(+e.target.value)} />
              </div>
              {positionIndicator && <span className="pos-indicator bn">{positionIndicator}</span>}
            </div>
            <div className="ro-card">
              <div className="presets">
                {presets.map((p, i) => (
                  <button key={i} className="preset-btn" onClick={() => {
                    const clamped = Math.max(5, Math.min(350, p.calc()));
                    setUMag(clamped);
                  }}>
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="ro-card ctrl-toggles-card">
              <div className="ctrl-toggle-row">
                <span className="ctrl-toggle-label bn">{t("সব রশ্মি", "All Rays")}</span>
                <button
                  className={"ctrl-toggle-switch " + (allRays ? "on" : "")}
                  onClick={() => { setAllRays(v => !v); setAnimProgress(0); }}
                  aria-pressed={allRays}
                >
                  <span className="ctrl-toggle-thumb" />
                </button>
              </div>
              <div className="ctrl-toggle-row">
                <span className="ctrl-toggle-label bn">{t("আবার", "Reset")}</span>
                <button
                  className="ctrl-reset-toggle"
                  onClick={() => { setAnimProgress(0); setYObj(50); }}
                >
                  ↺
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FORMULA CARD — proper fraction display */}
      {!showConceptOnboarding && (
      <div className="ro-card formula-card">
        <div className="formula-display">
          <div className="fraction">
            <span className="num">1</span>
            <span className="den">v</span>
          </div>
          <span className="op">{isLens ? "−" : "+"}</span>
          <div className="fraction">
            <span className="num">1</span>
            <span className="den">u</span>
          </div>
          <span className="op">=</span>
          <div className="fraction">
            <span className="num">1</span>
            <span className="den">f</span>
          </div>
        </div>
        <div className="formula-values">
          <div className="fv-row">
            <div className="fraction small">
              <span className="num">{toNum(1)}</span>
              <span className="den">{isFinite(v) ? fmtNumL(v, 1) : "∞"}</span>
            </div>
            <span className="op">{isLens ? "−" : "+"}</span>
            <div className="fraction small">
              <span className="num">{toNum(1)}</span>
              <span className="den">{fmtNumL(u)}</span>
            </div>
            <span className="op">=</span>
            <div className="fraction small">
              <span className="num">{toNum(1)}</span>
              <span className="den">{fmtNumL(f)}</span>
            </div>
          </div>
        </div>
        <div className="data-rows">
          <div className="row"><span className="k">{t("বস্তুর দূরত্ব (u)", "Object Distance (u)")}</span><span className="v">{fmtNumL(u)}</span></div>
          <div className="row">
            <span className="k">
              {t("ফোকাস দূরত্ব (f)", "Focal Length (f)")}
              <button className="f-neg-info-btn" onClick={() => setShowFNegativeExplain(true)} aria-label={t(F_SIGN_EXPLAIN[mode].titleBn, F_SIGN_EXPLAIN[mode].titleEn)}>
                ?
              </button>
            </span>
            <span className="v">{fmtNumL(f)}</span>
          </div>
          <div className="row"><span className="k">{t("প্রতিবিম্বের দূরত্ব (v)", "Image Distance (v)")}</span><span className="v">{isFinite(v) ? fmtNumL(v, 1) : "∞"}</span></div>
          <div className="row"><span className="k">{t("বিবর্ধন (m)", "Magnification (m)")}</span><span className="v">{isFinite(mag) ? fmtNumL(mag, 2) + "×" : "∞"}</span></div>
          <div className="row"><span className="k">{t("প্রতিবিম্বের ধরন", "Image Type")}</span><span className="v bn">{isFinite(v) ? `${isReal ? t("বাস্তব", "Real") : t("অভাসী", "Virtual")}, ${isErect ? t("সোজা", "Erect") : t("উল্টো", "Inverted")}, ${sizeText}` : t("তৈরি হয় না", "At infinity")}</span></div>
        </div>
      </div>
      )}

      {showFNegativeExplain && (
        <div className="congrats-modal-bd" onClick={() => setShowFNegativeExplain(false)}>
          <div className="congrats-modal-card" onClick={(e) => e.stopPropagation()}>
            <button className="congrats-close" onClick={() => setShowFNegativeExplain(false)} aria-label={t("বন্ধ করো", "Close")}>
              <X size={16} />
            </button>
            <div className="explain-header">
              <div className="learning-icon"><Info size={18} /></div>
              <div className="learning-title bn">{t(F_SIGN_EXPLAIN[mode].titleBn, F_SIGN_EXPLAIN[mode].titleEn)}</div>
            </div>
            <p className="learning-message bn">
              {t(F_SIGN_EXPLAIN[mode].bodyBn, F_SIGN_EXPLAIN[mode].bodyEn)}
            </p>
          </div>
        </div>
      )}

      {showLearningModal && (
        <div className="congrats-modal-bd" onClick={closeConceptLearningModal}>
          <div className="congrats-modal-card" onClick={(e) => e.stopPropagation()}>
            <button className="congrats-close" onClick={closeConceptLearningModal} aria-label={t("বন্ধ করো", "Close")}>
              <X size={16} />
            </button>
            <div className="explain-header">
              <div className="learning-icon"><Lightbulb size={18} /></div>
              <div className="learning-title bn">{t("এই উপকরণ সম্পর্কে শিখুন:", `About ${outcomeTitle}:`)}</div>
            </div>
            <p className="learning-message bn">{outcomeMessage}</p>
            <div className="learning-tips-grid">
              {outcomeTips.map((tip, i) => (
                <div key={i} className="learning-tip-item bn">
                  <div className="tip-icon">{i + 1}</div>
                  <div className="tip-text">{tip}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {showCongrats && (
        <div className="congrats-modal-bd" onClick={closeCongrats}>
          <div className="congrats-modal-card" onClick={(e) => e.stopPropagation()}>
            <button className="congrats-close" onClick={closeCongrats} aria-label={t("বন্ধ করো", "Close")}>
              <X size={16} />
            </button>
            <div className="congrats-emoji">🎉</div>
            <h2 className="congrats-title bn">{t("অভিনন্দন!", "Congratulations!")}</h2>
            <p className="congrats-subtitle bn">{t("তুমি সফলভাবে একটি সিমুলেশন তৈরি করেছ!", "You've successfully built a simulation!")}</p>
            <div className="congrats-hint-box bn">
              <div className="congrats-hint-row">
                <span className="congrats-hint-icon learning"><Lightbulb size={15} /></span>
                {t("লার্নিং আউটকাম", "Learning Outcome")}
              </div>
              <div className="congrats-hint-row">
                <span className="congrats-hint-icon usecase"><Info size={15} /></span>
                {t("বাস্তব ব্যবহার", "Real-world Use")}
              </div>
              <p className="congrats-hint-text">
                {t(
                  "নিচের এই দুটি বাটনে ক্লিক করে নিজে দেখে নাও কী শিখলে এবং এটা বাস্তবে কোথায় ব্যবহার হয়!",
                  "Tap these two buttons below to explore what you learned and where it's used in real life!"
                )}
              </p>
            </div>
            <button className="congrats-usecase-btn" onClick={closeCongrats}>
              {t("ঠিক আছে, দেখব!", "Got it, I'll check them out!")}
            </button>
          </div>
        </div>
      )}

      {showUseCaseModal && currentUseCases.length > 0 && (
        <UseCaseAnimationModal
          useCases={currentUseCases}
          explanation={explanation}
          t={t}
          onClose={closeConceptUseCaseModal}
        />
      )}
    </div>
  );
}

// ============== USE CASE ANIMATION MODAL (for the "build a simulation" guide) ==============
function getUseCaseMeta(uc: { icon: string; title: string; desc: string }, t: (bn: string, en: string) => string) {
  const title = uc.icon === "projector" ? t("প্রজেক্টর", "Projector")
    : uc.icon === "camera" ? t("ক্যামেরা", "Camera")
    : uc.icon === "magnifier" ? t("ম্যাগনিফাইং গ্লাস", "Magnifying Glass")
    : uc.icon === "torch" ? t("টর্চলাইট", "Flashlight")
    : uc.icon === "glasses" ? t("চশমা (Myopia)", "Glasses (Myopia)")
    : uc.icon === "rearview" ? t("গাড়ির পেছনের আয়না", "Car Rear-view Mirror")
    : uc.icon === "shaving" ? t("মেকআপ আয়না", "Makeup Mirror")
    : uc.icon === "equal" ? t("সমান প্রতিবিম্ব", "Equal-size Image")
    : uc.title;
  const desc = uc.icon === "projector" ? t("ছোট স্লাইড থেকে বড় পর্দায় ছবি তৈরি করে", "Creates large picture from a small slide on screen")
    : uc.icon === "camera" ? t("বড় দৃশ্য থেকে ছোট ফিল্মে ছবি ধরে", "Captures a large scene onto a small film/sensor")
    : uc.icon === "magnifier" ? t("ছোট জিনিস বড় করে দেখায়", "Makes small objects appear larger")
    : uc.icon === "torch" ? t("আলো সমান্তরাল রশ্মিতে পাঠায়", "Sends light as parallel rays")
    : uc.icon === "glasses" ? t("দূরের জিনিস স্পষ্ট দেখায়", "Shows distant objects clearly")
    : uc.icon === "rearview" ? t("পিছনের বড় দৃষ্টিক্ষেত্র এক ছোট আয়নায় দেখায়", "Shows a wide rear view in a small mirror")
    : uc.icon === "shaving" ? t("মুখ বড় করে দেখায়", "Makes face appear larger")
    : uc.icon === "equal" ? t("বস্তুর সমান আকারের উল্টো ছবি", "Equal-size inverted image of the object")
    : uc.desc;
  return { title, desc };
}

// Small at-a-glance shape icon for each of the 4 modes — used in the
// concept-onboarding identify step to show "you said [shape] → it's
// actually [shape]" instead of naming things in text only.
function ShapeIcon({ shape, size = 34 }: { shape: Mode; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 34 34" className="shape-icon">
      {shape === "convexLens" && (
        <path d="M17,3 Q26,17 17,31 Q8,17 17,3 Z" fill="rgba(120,180,255,0.18)" stroke="currentColor" strokeWidth="2.2" />
      )}
      {shape === "concaveLens" && (
        <path d="M11,3 Q17,17 11,31 M23,3 Q17,17 23,31" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      )}
      {shape === "convexMirror" && (
        <>
          <path d="M11,4 Q23,17 11,30" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          <path d="M6,5 Q17,17 6,29" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2,2" opacity="0.5" />
        </>
      )}
      {shape === "concaveMirror" && (
        <>
          <path d="M23,4 Q11,17 23,30" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          <path d="M28,5 Q17,17 28,29" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2,2" opacity="0.5" />
        </>
      )}
    </svg>
  );
}

function UseCaseAnimationModal({
  useCases, explanation, t, onClose,
}: {
  useCases: { icon: string; title: string; desc: string; animation: string }[];
  explanation?: string;
  t: (bn: string, en: string) => string;
  onClose: () => void;
}) {
  const [active, setActive] = useState(useCases[0]?.animation ?? "");
  const [animT, setAnimT] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    let raf: number;
    const start = performance.now();
    const loop = (now: number) => {
      setAnimT((now - start) / 1000);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [active]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;
    const dpr = window.devicePixelRatio || 1;
    const w = parent.offsetWidth;
    const h = 280;
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    const ctx = canvas.getContext("2d");
    ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
  }, [active]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const W = canvas.width / dpr;
    const H = canvas.height / dpr;
    drawUseCaseAnimation(ctx, W, H, active, animT, t);
  }, [active, animT, t]);

  const activeMeta = useCases.find((u) => u.animation === active);

  return (
    <div className="usecase-modal-bd" onClick={onClose}>
      <div className="usecase-modal-card" onClick={(e) => e.stopPropagation()}>
        <button className="congrats-close" onClick={onClose} aria-label={t("বন্ধ করো", "Close")}>
          <X size={16} />
        </button>
        <div className="explain-header">
          <div className="explain-icon-pulse"><Info size={20} /></div>
          <div className="explain-title bn">{t("এই অবস্থায় কী হচ্ছে:", "What's happening at this position:")}</div>
        </div>
        {explanation && <div className="explain-body bn">{explanation}</div>}
        <div className="use-case-label bn">{t("ব্যবহার (Use Case)", "Use Cases")}</div>
        <div className="use-case-cards">
          {useCases.map((uc, i) => {
            const meta = getUseCaseMeta(uc, t);
            return (
              <button
                key={i}
                className={"use-case-card" + (active === uc.animation ? " active" : "")}
                onClick={() => setActive(uc.animation)}
              >
                <span className="uc-icon">{meta.title.charAt(0)}</span>
                <div>
                  <div className="uc-title bn">{meta.title}</div>
                  <div className="uc-desc bn">{meta.desc}</div>
                </div>
                <span className="uc-arrow"><ChevronRight size={12} className={active === uc.animation ? "rotate-90" : ""} /></span>
              </button>
            );
          })}
        </div>
        {active && (
          <div className="use-case-animation">
            <canvas ref={canvasRef} />
            <div className="uc-anim-label bn">
              {activeMeta ? `${getUseCaseMeta(activeMeta, t).title} — ${t("অ্যানিমেশন", "Animation")}` : ""}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ============== REALISTIC Candle drawing ==============
function drawRealisticCandle(
  ctx: CanvasRenderingContext2D,
  x: number, baseY: number, topY: number, w: number,
  t: number, lit: boolean, ghost = false, flipped = false,
) {
  ctx.save();
  if (flipped) {
  ctx.translate(x, baseY);
  ctx.scale(1, -1);
  ctx.translate(-x, -baseY);
  // Normalize topY so the candle draws upright in local space before the flip
  topY = baseY - Math.abs(baseY - topY);
}
  const bodyTop = topY + Math.abs(baseY - topY) * 0.18;
  const candleH = baseY - bodyTop;
  const halfW = Math.max(5, w);

  if (ghost) ctx.globalAlpha *= 0.7;

  // Shadow on ground
  if (!ghost) {
    ctx.fillStyle = "rgba(0,0,0,0.3)";
    ctx.beginPath();
    ctx.ellipse(x, baseY + 2, halfW * 1.6, halfW * 0.25, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Base plate with metallic look
  const plateGrad = ctx.createLinearGradient(x - halfW * 1.5, baseY - 4, x + halfW * 1.5, baseY + 4);
  if (ghost) {
    plateGrad.addColorStop(0, "rgba(120,120,130,0.4)");
    plateGrad.addColorStop(0.5, "rgba(160,160,170,0.5)");
    plateGrad.addColorStop(1, "rgba(120,120,130,0.4)");
  } else {
    plateGrad.addColorStop(0, "#5A4A3A");
    plateGrad.addColorStop(0.3, "#8A7A6A");
    plateGrad.addColorStop(0.5, "#A0907A");
    plateGrad.addColorStop(0.7, "#8A7A6A");
    plateGrad.addColorStop(1, "#5A4A3A");
  }
  ctx.fillStyle = plateGrad;
  ctx.beginPath();
  ctx.ellipse(x, baseY, halfW * 1.5, halfW * 0.4, 0, 0, Math.PI * 2);
  ctx.fill();

  // Candle body with wax texture
  const bodyGrad = ctx.createLinearGradient(x - halfW, 0, x + halfW, 0);
  if (ghost) {
    bodyGrad.addColorStop(0, "rgba(180,180,195,0.35)");
    bodyGrad.addColorStop(0.3, "rgba(210,210,225,0.5)");
    bodyGrad.addColorStop(0.5, "rgba(230,230,240,0.55)");
    bodyGrad.addColorStop(0.7, "rgba(210,210,225,0.5)");
    bodyGrad.addColorStop(1, "rgba(180,180,195,0.35)");
  } else {
    bodyGrad.addColorStop(0, "#C4A870");
    bodyGrad.addColorStop(0.2, "#DCC9A0");
    bodyGrad.addColorStop(0.4, "#F5E9C9");
    bodyGrad.addColorStop(0.5, "#FFF5DC");
    bodyGrad.addColorStop(0.6, "#F5E9C9");
    bodyGrad.addColorStop(0.8, "#DCC9A0");
    bodyGrad.addColorStop(1, "#A89060");
  }
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.roundRect(x - halfW, bodyTop, halfW * 2, candleH, [halfW * 0.3, halfW * 0.3, 2, 2]);
  ctx.fill();

  // Wax drip effect
  if (!ghost && halfW > 6) {
    const dripSeed = Math.floor(x * 7.3) % 5;
    for (let d = 0; d < 2 + dripSeed % 2; d++) {
      const dx = x + (d - 0.5) * halfW * 0.6;
      const dripLen = 8 + (d * 13.7 + dripSeed * 5.1) % 12;
      const dripGrad = ctx.createLinearGradient(dx, bodyTop, dx, bodyTop + dripLen);
      dripGrad.addColorStop(0, "rgba(245,233,201,0.9)");
      dripGrad.addColorStop(1, "rgba(220,201,160,0.6)");
      ctx.fillStyle = dripGrad;
      ctx.beginPath();
      ctx.moveTo(dx - 2, bodyTop);
      ctx.quadraticCurveTo(dx - 2.5, bodyTop + dripLen * 0.6, dx, bodyTop + dripLen);
      ctx.quadraticCurveTo(dx + 2.5, bodyTop + dripLen * 0.6, dx + 2, bodyTop);
      ctx.fill();
    }
  }

  // Melted wax pool at top
  if (!ghost) {
    ctx.fillStyle = "rgba(255,248,220,0.6)";
    ctx.beginPath();
    ctx.ellipse(x, bodyTop + 2, halfW * 0.85, halfW * 0.2, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Wick with curve
  ctx.strokeStyle = ghost ? "rgba(60,60,60,0.5)" : "#1A1A1A";
  ctx.lineWidth = 1.8;
  const wickLen = 8;
  const wickSway = lit ? Math.sin(t * 6) * 1.2 : 0;
  ctx.beginPath();
  ctx.moveTo(x, bodyTop);
  ctx.quadraticCurveTo(x + wickSway, bodyTop - wickLen * 0.5, x + wickSway * 0.5, bodyTop - wickLen);
  ctx.stroke();

  // Glowing ember at wick tip
  if (lit) {
    ctx.fillStyle = "rgba(255,120,20,0.9)";
    ctx.beginPath();
    ctx.arc(x + wickSway * 0.5, bodyTop - wickLen, 1.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // Flame
  if (lit) {
    const flicker1 = Math.sin(t * 9) * 1.2 + Math.sin(t * 14.5) * 0.8;
    const flicker2 = Math.cos(t * 11.3) * 0.8;
    const fH = 20 + flicker1;
    const fW = 9 + flicker2 * 0.5;
    const fx = x + wickSway * 0.3;
    const fy = bodyTop - wickLen;

    // Large ambient glow
    const glow = ctx.createRadialGradient(fx, fy - fH * 0.3, 0, fx, fy - fH * 0.3, fH * 3.5);
    glow.addColorStop(0, "rgba(255,200,90,0.35)");
    glow.addColorStop(0.3, "rgba(255,160,50,0.12)");
    glow.addColorStop(0.6, "rgba(255,140,40,0.04)");
    glow.addColorStop(1, "rgba(255,140,40,0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(fx, fy - fH * 0.3, fH * 3.5, 0, Math.PI * 2);
    ctx.fill();

    // Outer flame (deep orange-red)
    const outerGrad = ctx.createLinearGradient(fx, fy, fx, fy - fH);
    outerGrad.addColorStop(0, "rgba(255,80,20,0.9)");
    outerGrad.addColorStop(0.4, "rgba(255,120,30,0.85)");
    outerGrad.addColorStop(0.8, "rgba(255,180,60,0.6)");
    outerGrad.addColorStop(1, "rgba(255,200,100,0.2)");
    ctx.fillStyle = outerGrad;
    ctx.beginPath();
    ctx.moveTo(fx - fW, fy);
    ctx.bezierCurveTo(fx - fW * 1.1, fy - fH * 0.3, fx - fW * 0.5, fy - fH * 0.8, fx, fy - fH);
    ctx.bezierCurveTo(fx + fW * 0.5, fy - fH * 0.8, fx + fW * 1.1, fy - fH * 0.3, fx + fW, fy);
    ctx.quadraticCurveTo(fx, fy + 3, fx - fW, fy);
    ctx.fill();

    // Mid flame (bright orange)
    ctx.fillStyle = "#FF9930";
    ctx.beginPath();
    ctx.moveTo(fx - fW * 0.7, fy);
    ctx.bezierCurveTo(fx - fW * 0.75, fy - fH * 0.4, fx - fW * 0.3, fy - fH * 0.75, fx, fy - fH * 0.9);
    ctx.bezierCurveTo(fx + fW * 0.3, fy - fH * 0.75, fx + fW * 0.75, fy - fH * 0.4, fx + fW * 0.7, fy);
    ctx.quadraticCurveTo(fx, fy + 2, fx - fW * 0.7, fy);
    ctx.fill();

    // Inner flame (bright yellow)
    const innerGrad = ctx.createLinearGradient(fx, fy, fx, fy - fH * 0.7);
    innerGrad.addColorStop(0, "#FFE060");
    innerGrad.addColorStop(0.5, "#FFD23F");
    innerGrad.addColorStop(1, "rgba(255,240,180,0.4)");
    ctx.fillStyle = innerGrad;
    ctx.beginPath();
    ctx.moveTo(fx - fW * 0.4, fy - 1);
    ctx.bezierCurveTo(fx - fW * 0.45, fy - fH * 0.4, fx - fW * 0.15, fy - fH * 0.7, fx, fy - fH * 0.82);
    ctx.bezierCurveTo(fx + fW * 0.15, fy - fH * 0.7, fx + fW * 0.45, fy - fH * 0.4, fx + fW * 0.4, fy - 1);
    ctx.quadraticCurveTo(fx, fy + 1, fx - fW * 0.4, fy - 1);
    ctx.fill();

    // Hot blue-white core
    const coreGrad = ctx.createRadialGradient(fx, fy - fH * 0.15, 0, fx, fy - fH * 0.25, fH * 0.25);
    coreGrad.addColorStop(0, "rgba(200,220,255,0.95)");
    coreGrad.addColorStop(0.4, "rgba(180,200,255,0.6)");
    coreGrad.addColorStop(1, "rgba(255,255,200,0)");
    ctx.fillStyle = coreGrad;
    ctx.beginPath();
    ctx.ellipse(fx, fy - fH * 0.2, fW * 0.2, fH * 0.2, 0, 0, Math.PI * 2);
    ctx.fill();

    // Smoke particles when lit
    if (!ghost) {
      for (let s = 0; s < 3; s++) {
        const st = (t * 2 + s * 1.3) % 3;
        if (st > 2) continue;
        const sy = fy - fH - st * 15;
        const sx = fx + Math.sin(t * 3 + s * 2) * 4;
        const sa = Math.max(0, 0.15 - st * 0.07);
        ctx.fillStyle = `rgba(200,200,220,${sa})`;
        ctx.beginPath();
        ctx.arc(sx, sy, 2 + st * 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
  ctx.restore();
}

// ============== Use Case Animation Drawing ==============
function drawUseCaseAnimation(ctx: CanvasRenderingContext2D, W: number, H: number, type: string, t: number, tr: (bn: string, en: string) => string) {
  // Dark background
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, "#0D1525");
  bg.addColorStop(1, "#162035");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  const cy = H / 2;

  switch (type) {
    case "projector": {
      // ===== PROJECTOR: small slide -> big inverted image on screen =====
      const cycle = (t % 5) / 5; // 0..1

      // Projector body
      ctx.fillStyle = "#2A2A3A";
      ctx.beginPath();
      ctx.roundRect(20, cy - 28, 70, 56, 8);
      ctx.fill();
      ctx.fillStyle = "#1A1A2A";
      ctx.fillRect(20, cy - 28, 70, 6);

      // Slide holder with small upright arrow (object) inside projector
      ctx.fillStyle = "#FFF8DC";
      ctx.fillRect(58, cy - 14, 14, 28);
      // Small arrow on slide (upright, points UP — original)
      ctx.strokeStyle = "#E8001D";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(65, cy + 8);
      ctx.lineTo(65, cy - 8);
      ctx.stroke();
      // arrowhead up
      ctx.beginPath();
      ctx.moveTo(65, cy - 10);
      ctx.lineTo(62, cy - 5);
      ctx.lineTo(68, cy - 5);
      ctx.closePath();
      ctx.fillStyle = "#E8001D";
      ctx.fill();

      // Convex Lens
      const lensX = 105;
      ctx.strokeStyle = "rgba(180,220,255,0.95)";
      ctx.lineWidth = 2;
      ctx.fillStyle = "rgba(120,180,255,0.18)";
      ctx.beginPath();
      ctx.moveTo(lensX, cy - 22);
      ctx.quadraticCurveTo(lensX + 8, cy, lensX, cy + 22);
      ctx.quadraticCurveTo(lensX - 8, cy, lensX, cy - 22);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Screen far right
      const screenX = W - 30;
      ctx.fillStyle = "#F5F5F0";
      ctx.fillRect(screenX, cy - 60, 6, 120);
      ctx.fillStyle = "rgba(0,0,0,0.15)";
      ctx.fillRect(screenX + 6, cy - 60, 3, 120);

      // Light cone expanding from lens to screen
      const reach = Math.min(1, cycle / 0.55);
      const coneEnd = lensX + reach * (screenX - lensX);
      const halfSpread = reach * 50;
      const coneGrad = ctx.createLinearGradient(lensX, 0, coneEnd, 0);
      coneGrad.addColorStop(0, "rgba(255,220,120,0.55)");
      coneGrad.addColorStop(1, "rgba(255,220,120,0.05)");
      ctx.fillStyle = coneGrad;
      ctx.beginPath();
      ctx.moveTo(lensX, cy - 8);
      ctx.lineTo(coneEnd, cy - halfSpread);
      ctx.lineTo(coneEnd, cy + halfSpread);
      ctx.lineTo(lensX, cy + 8);
      ctx.closePath();
      ctx.fill();

      // Two crossing rays through lens center to show inversion
      ctx.strokeStyle = "rgba(255,220,120,0.85)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(65, cy - 10);
      ctx.lineTo(coneEnd, cy + halfSpread * 0.9);
      ctx.moveTo(65, cy + 10);
      ctx.lineTo(coneEnd, cy - halfSpread * 0.9);
      ctx.stroke();

      // Big INVERTED arrow on screen (appears once cone arrives)
      if (cycle > 0.55) {
        const a = Math.min(1, (cycle - 0.55) / 0.2);
        ctx.save();
        ctx.globalAlpha = a;
        ctx.strokeStyle = "#E8001D";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(screenX - 4, cy - 45);
        ctx.lineTo(screenX - 4, cy + 45);
        ctx.stroke();
        // arrowhead pointing DOWN (inverted)
        ctx.fillStyle = "#E8001D";
        ctx.beginPath();
        ctx.moveTo(screenX - 4, cy + 50);
        ctx.lineTo(screenX - 12, cy + 40);
        ctx.lineTo(screenX + 4, cy + 40);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }

      // Labels
      ctx.fillStyle = "rgba(255,255,255,0.8)";
      ctx.font = "bold 11px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(tr("ছোট স্লাইড ↑", "Small slide ↑"), 55, H - 8);
      ctx.fillText(tr("বড় উল্টো প্রতিবিম্ব ↓", "Large inverted image ↓"), screenX - 10, H - 8);
      break;
    }
    case "camera": {
      // ===== CAMERA: large scene (upright tree) -> tiny inverted image on sensor =====
      const cycle = (t % 4) / 4;

      // Big upright tree (object) on the left
      ctx.fillStyle = "#4A3728";
      ctx.fillRect(38, cy + 5, 8, 35);
      ctx.fillStyle = "#2D8A3E";
      ctx.beginPath();
      ctx.moveTo(42, cy - 50);
      ctx.lineTo(15, cy + 10);
      ctx.lineTo(70, cy + 10);
      ctx.closePath();
      ctx.fill();
      // Sun
      ctx.fillStyle = "#FFD24A";
      ctx.beginPath();
      ctx.arc(20, cy - 45, 7, 0, Math.PI * 2);
      ctx.fill();

      // Camera body
      const camX = W - 95;
      ctx.fillStyle = "#1A1A2A";
      ctx.beginPath();
      ctx.roundRect(camX, cy - 28, 65, 56, 8);
      ctx.fill();
      ctx.fillStyle = "#0A0A14";
      ctx.fillRect(camX + 5, cy - 33, 30, 8);

      // Convex lens of camera
      const lensX = camX;
      ctx.strokeStyle = "rgba(180,220,255,0.95)";
      ctx.lineWidth = 2;
      ctx.fillStyle = "rgba(120,180,255,0.2)";
      ctx.beginPath();
      ctx.moveTo(lensX, cy - 18);
      ctx.quadraticCurveTo(lensX + 6, cy, lensX, cy + 18);
      ctx.quadraticCurveTo(lensX - 6, cy, lensX, cy - 18);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Sensor (back of camera)
      const sensorX = camX + 50;
      ctx.fillStyle = "#444";
      ctx.fillRect(sensorX, cy - 16, 4, 32);

      // Converging rays from top of tree and bottom of tree (crossing through lens)
      const reach = Math.min(1, cycle / 0.6);
      const treeTopX = 42, treeTopY = cy - 50;
      const treeBotX = 42, treeBotY = cy + 10;
      const sensorTop = cy + 8;   // inverted: tree top hits BELOW axis
      const sensorBot = cy - 6;   // tree bottom hits ABOVE axis

      ctx.strokeStyle = `rgba(255,220,120,${0.85 * reach})`;
      ctx.lineWidth = 1.5;
      // Ray from tree top
      ctx.beginPath();
      ctx.moveTo(treeTopX, treeTopY);
      const m1x = lensX, m1y = cy;
      const e1x = lensX + reach * (sensorX - lensX);
      const e1y = cy + reach * (sensorTop - cy);
      ctx.lineTo(m1x, m1y);
      ctx.lineTo(e1x, e1y);
      ctx.stroke();
      // Ray from tree bottom
      ctx.beginPath();
      ctx.moveTo(treeBotX, treeBotY);
      const e2y = cy + reach * (sensorBot - cy);
      ctx.lineTo(m1x, m1y);
      ctx.lineTo(lensX + reach * (sensorX - lensX), e2y);
      ctx.stroke();

      // Tiny inverted image on sensor when rays arrive
      if (cycle > 0.6) {
        const a = Math.min(1, (cycle - 0.6) / 0.2);
        ctx.save();
        ctx.globalAlpha = a;
        // tiny inverted tree
        ctx.fillStyle = "#2D8A3E";
        ctx.beginPath();
        ctx.moveTo(sensorX + 2, cy + 10);
        ctx.lineTo(sensorX - 3, cy - 4);
        ctx.lineTo(sensorX + 7, cy - 4);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = "#4A3728";
        ctx.fillRect(sensorX + 1, cy - 8, 2, 6);
        ctx.restore();
      }

      ctx.fillStyle = "rgba(255,255,255,0.8)";
      ctx.font = "bold 11px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(tr("বড় দৃশ্য ↑", "Large scene ↑"), 42, H - 8);
      ctx.fillText(tr("ছোট উল্টো ছবি ↓", "Small inverted image ↓"), camX + 30, H - 8);
      break;
    }
    case "magnifier": {
      // Small text under the lens
      ctx.fillStyle = "rgba(255,255,255,0.55)";
      ctx.font = "9px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(tr("ক্ষুদ্র অক্ষর", "Tiny text"), 55, cy + 3);

      // Magnifying glass
      const lensX = W / 2 + 10;
      const bounce = Math.sin(t * 2) * 4;
      ctx.fillStyle = "rgba(180,220,255,0.18)";
      ctx.beginPath();
      ctx.arc(lensX, cy + bounce, 34, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#8B7355";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(lensX, cy + bounce, 34, 0, Math.PI * 2);
      ctx.stroke();
      // Handle
      ctx.strokeStyle = "#6B5335";
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(lensX + 24, cy + 24 + bounce);
      ctx.lineTo(lensX + 50, cy + 50 + bounce);
      ctx.stroke();

      // Magnified upright text inside lens
      ctx.fillStyle = "rgba(255,255,255,0.95)";
      ctx.font = "bold 22px sans-serif";
      ctx.fillText(tr("অ", "A"), lensX, cy + 8 + bounce);

      ctx.fillStyle = "rgba(255,255,255,0.8)";
      ctx.font = "bold 11px sans-serif";
      ctx.fillText(tr("বড়, সোজা, অভাসী প্রতিবিম্ব", "Large, erect, virtual image"), W / 2, H - 8);
      break;
    }
    case "torch": {
      // Torch body
      ctx.fillStyle = "#2A2A3A";
      ctx.beginPath();
      ctx.roundRect(20, cy - 15, 50, 30, [4, 0, 0, 4] as any);
      ctx.fill();
      ctx.fillStyle = "#3A3A4A";
      ctx.beginPath();
      ctx.roundRect(65, cy - 22, 18, 44, [0, 6, 6, 0] as any);
      ctx.fill();

      // Bulb at focal point
      ctx.fillStyle = "#FFE080";
      ctx.shadowColor = "#FFE080";
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(78, cy, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Parallel rays
      const rayLen = Math.min(1, (t % 3) / 1.5) * (W - 110);
      ctx.strokeStyle = "rgba(255,220,120,0.7)";
      ctx.lineWidth = 2;
      for (let i = -3; i <= 3; i++) {
        ctx.beginPath();
        ctx.moveTo(83, cy + i * 6);
        ctx.lineTo(83 + rayLen, cy + i * 6);
        ctx.stroke();
      }

      ctx.fillStyle = "rgba(255,255,255,0.8)";
      ctx.font = "bold 11px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(tr("সমান্তরাল আলোর রশ্মি", "Parallel light rays"), W / 2, H - 8);
      break;
    }
    case "glasses": {
      // ===== MYOPIA correction — 3-panel Problem → Solution → Result story =====
      // Panel 1: Uncorrected Eye (Problem)   — light focuses short of the retina, blurred.
      // Panel 2: Concave Lens Correction (Solution) — the lens diverges the incoming rays.
      // Panel 3: Focused Retina (Result)     — the diverged rays now focus exactly on the retina.
      const cycle = (t % 6) / 6;
      const panelW = W / 3;
      const topPad = 26, botPad = 30;
      const pcy = topPad + (H - topPad - botPad) / 2;
      const p1cx = panelW * 0.5, p2cx = panelW * 1.5, p3cx = panelW * 2.5;

      // Staggered reveal so the three panels play out in story order, looping.
      const r1 = Math.min(1, cycle / 0.28);
      const r2 = Math.min(1, Math.max(0, (cycle - 0.33) / 0.28));
      const r3 = Math.min(1, Math.max(0, (cycle - 0.66) / 0.28));

      // Divider lines + flow arrows between panels
      ctx.strokeStyle = "rgba(255,255,255,0.18)";
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      [panelW, panelW * 2].forEach((dx) => {
        ctx.beginPath();
        ctx.moveTo(dx, topPad);
        ctx.lineTo(dx, H - botPad);
        ctx.stroke();
      });
      ctx.setLineDash([]);
      const pulse = 0.55 + 0.45 * Math.sin(t * 3);
      ctx.font = "bold 14px sans-serif";
      ctx.textAlign = "center";
      ctx.fillStyle = `rgba(255,220,120,${r2 > 0 ? pulse : 0.3})`;
      ctx.fillText("➜", panelW, pcy + 5);
      ctx.fillStyle = `rgba(255,220,120,${r3 > 0 ? pulse : 0.3})`;
      ctx.fillText("➜", panelW * 2, pcy + 5);

      // Step badges + headers
      const steps: { cx: number; num: string; head: string; color: string }[] = [
        { cx: p1cx, num: "১", head: tr("সমস্যা", "Problem"), color: "rgba(255,120,120,0.9)" },
        { cx: p2cx, num: "২", head: tr("সমাধান", "Solution"), color: "rgba(180,150,255,0.95)" },
        { cx: p3cx, num: "৩", head: tr("ফলাফল", "Result"), color: "rgba(120,255,180,0.95)" },
      ];
      steps.forEach((s) => {
        ctx.fillStyle = s.color;
        ctx.beginPath();
        ctx.arc(s.cx - panelW / 2 + 14, 13, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#0A0A14";
        ctx.font = "bold 9px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(s.num, s.cx - panelW / 2 + 14, 16);
        ctx.fillStyle = "rgba(255,255,255,0.92)";
        ctx.font = "bold 10px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(s.head, s.cx + 6, 17);
      });

      // ---- helper: a small eye. focusMode "front" = myopic (focuses short, blurred on retina),
      // "sharp" = corrected (focuses exactly on retina).
      const drawEye = (cx: number, focusMode: "front" | "sharp", reach: number) => {
        const eyeRX = 20, eyeRY = 15;
        ctx.fillStyle = "rgba(255,255,255,0.95)";
        ctx.beginPath();
        ctx.ellipse(cx, pcy, eyeRX, eyeRY, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "rgba(255,255,255,0.6)";
        ctx.lineWidth = 1.3;
        ctx.stroke();
        const lensX = cx - eyeRX + 6;
        ctx.fillStyle = "#3A7AAA";
        ctx.beginPath();
        ctx.arc(lensX, pcy, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#0A0A14";
        ctx.beginPath();
        ctx.arc(lensX, pcy, 2.6, 0, Math.PI * 2);
        ctx.fill();
        // retina marker
        const retinaX = cx + eyeRX - 4;
        ctx.strokeStyle = "rgba(255,180,180,0.7)";
        ctx.lineWidth = 1.3;
        ctx.setLineDash([2, 2]);
        ctx.beginPath();
        ctx.moveTo(retinaX, pcy - eyeRY + 2);
        ctx.lineTo(retinaX, pcy + eyeRY - 2);
        ctx.stroke();
        ctx.setLineDash([]);

        if (reach <= 0) return;
        const focusX = focusMode === "front" ? cx - 3 : retinaX;
        for (let i = -2; i <= 2; i++) {
          const yIn = pcy + i * 6;
          const p1 = Math.min(1, reach / 0.5);
          ctx.strokeStyle = "rgba(255,220,120,0.85)";
          ctx.lineWidth = 1.4;
          ctx.beginPath();
          ctx.moveTo(lensX, yIn);
          ctx.lineTo(lensX + (focusX - lensX) * p1, yIn + (pcy - yIn) * p1);
          ctx.stroke();
          if (reach > 0.5) {
            const p2 = Math.min(1, (reach - 0.5) / 0.5);
            const spreadY = pcy + (i === 0 ? 0 : (i > 0 ? -1 : 1)) * Math.abs(i) * 5;
            ctx.strokeStyle = focusMode === "front" ? "rgba(255,120,120,0.8)" : "rgba(120,255,180,0.9)";
            ctx.beginPath();
            ctx.moveTo(focusX, pcy);
            ctx.lineTo(focusX + (retinaX - focusX) * p2, pcy + (spreadY - pcy) * p2);
            ctx.stroke();
          }
        }
        if (reach > 0.9) {
          if (focusMode === "sharp") {
            ctx.fillStyle = "#7CFFB0";
            ctx.shadowColor = "#7CFFB0";
            ctx.shadowBlur = 8;
            ctx.beginPath();
            ctx.arc(retinaX, pcy, 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
          } else {
            ctx.fillStyle = "rgba(255,120,120,0.4)";
            ctx.beginPath();
            ctx.ellipse(retinaX, pcy, 3, 8, 0, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      };

      // ---- helper: isolated concave lens with diverging rays (the "device" panel)
      const drawLensPanel = (cx: number, reach: number) => {
        ctx.fillStyle = "rgba(120,180,255,0.18)";
        ctx.beginPath();
        ctx.moveTo(cx - 6, pcy - 24);
        ctx.lineTo(cx + 6, pcy - 24);
        ctx.quadraticCurveTo(cx, pcy, cx + 6, pcy + 24);
        ctx.lineTo(cx - 6, pcy + 24);
        ctx.quadraticCurveTo(cx, pcy, cx - 6, pcy - 24);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "rgba(180,220,255,0.95)";
        ctx.lineWidth = 2;
        ctx.stroke();
        if (reach <= 0) return;
        const startX = cx - panelW / 2 + 8;
        const endX = cx + panelW / 2 - 8;
        ctx.lineWidth = 1.4;
        for (let i = -2; i <= 2; i++) {
          const yIn = pcy + i * 7;
          const p1 = Math.min(1, reach / 0.5);
          ctx.strokeStyle = "rgba(255,220,120,0.85)";
          ctx.beginPath();
          ctx.moveTo(startX, yIn);
          ctx.lineTo(startX + (cx - startX) * p1, yIn);
          ctx.stroke();
          if (reach > 0.5) {
            const p2 = Math.min(1, (reach - 0.5) / 0.5);
            const diverged = yIn + i * 5;
            ctx.strokeStyle = "rgba(150,220,255,0.9)";
            ctx.beginPath();
            ctx.moveTo(cx, yIn);
            ctx.lineTo(cx + (endX - cx) * p2, yIn + (diverged - yIn) * p2);
            ctx.stroke();
          }
        }
      };

      drawEye(p1cx, "front", r1);
      drawLensPanel(p2cx, r2);
      drawEye(p3cx, "sharp", r3);

      // Captions (two short lines per panel, sized to fit a third of the width)
      ctx.font = "bold 9px sans-serif";
      ctx.textAlign = "center";
      ctx.fillStyle = "rgba(255,255,255,0.85)";
      const cap1 = tr("আলো সঠিক জায়গায়|focus করছে না", "Light isn't focusing|at the right spot");
      const cap2 = tr("লেন্স আলো ছড়িয়ে|focus ঠিক করছে", "Lens spreads the light,|fixing the focus");
      const cap3 = tr("Retina-তে সঠিকভাবে|focus হচ্ছে", "Correct focus now|on the retina");
      [[p1cx, cap1], [p2cx, cap2], [p3cx, cap3]].forEach(([cx, cap]) => {
        const [l1, l2] = (cap as string).split("|");
        ctx.fillText(l1, cx as number, H - botPad + 12);
        ctx.fillText(l2, cx as number, H - botPad + 23);
      });
      break;
    }
    case "rearview": {
      // ===== Convex mirror — 3-panel Problem → Solution → Result story =====
      // Panel 1: Narrow View (Problem)   — a flat mirror only shows what's directly behind; side cars are blind spots.
      // Panel 2: Convex Mirror (Solution) — its curved surface bends light from a much wider angle.
      // Panel 3: Wide View (Result)      — all three cars become visible at once, small but complete.
      const cycle = (t % 6) / 6;
      const panelW = W / 3;
      const topPad = 26, botPad = 30;
      const pcy = topPad + (H - topPad - botPad) / 2;
      const p1cx = panelW * 0.5, p2cx = panelW * 1.5, p3cx = panelW * 2.5;

      const r1 = Math.min(1, cycle / 0.28);
      const r2 = Math.min(1, Math.max(0, (cycle - 0.33) / 0.28));
      const r3 = Math.min(1, Math.max(0, (cycle - 0.66) / 0.28));

      // Divider lines + flow arrows between panels
      ctx.strokeStyle = "rgba(255,255,255,0.18)";
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      [panelW, panelW * 2].forEach((dx) => {
        ctx.beginPath();
        ctx.moveTo(dx, topPad);
        ctx.lineTo(dx, H - botPad);
        ctx.stroke();
      });
      ctx.setLineDash([]);
      const pulse = 0.55 + 0.45 * Math.sin(t * 3);
      ctx.font = "bold 14px sans-serif";
      ctx.textAlign = "center";
      ctx.fillStyle = `rgba(255,220,120,${r2 > 0 ? pulse : 0.3})`;
      ctx.fillText("➜", panelW, pcy + 5);
      ctx.fillStyle = `rgba(255,220,120,${r3 > 0 ? pulse : 0.3})`;
      ctx.fillText("➜", panelW * 2, pcy + 5);

      // Step badges + headers
      const steps: { cx: number; num: string; head: string; color: string }[] = [
        { cx: p1cx, num: "১", head: tr("সমস্যা", "Problem"), color: "rgba(255,120,120,0.9)" },
        { cx: p2cx, num: "২", head: tr("সমাধান", "Solution"), color: "rgba(180,150,255,0.95)" },
        { cx: p3cx, num: "৩", head: tr("ফলাফল", "Result"), color: "rgba(120,255,180,0.95)" },
      ];
      steps.forEach((s) => {
        ctx.fillStyle = s.color;
        ctx.beginPath();
        ctx.arc(s.cx - panelW / 2 + 14, 13, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#0A0A14";
        ctx.font = "bold 9px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(s.num, s.cx - panelW / 2 + 14, 16);
        ctx.fillStyle = "rgba(255,255,255,0.92)";
        ctx.font = "bold 10px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(s.head, s.cx + 10, 17);
      });

      // Three small "cars" spread vertically, reused by all 3 panels
      const carColors = ["#E8001D", "#2D8A3E", "#3366CC"];
      const carYs = [pcy - 24, pcy, pcy + 24];
      const drawCar = (cx: number, y: number, color: string, dim: boolean) => {
        ctx.fillStyle = dim ? "rgba(255,255,255,0.15)" : color;
        ctx.beginPath();
        ctx.roundRect(cx - 8, y - 4, 16, 8, 2);
        ctx.fill();
      };

      // ---- Panel 1: flat mirror, only the center car is visible ----
      if (r1 > 0) {
        const mx = p1cx + panelW / 2 - 14;
        carYs.forEach((y, i) => drawCar(p1cx - panelW / 2 + 12, y, carColors[i], i !== 1));
        // flat mirror (straight vertical line)
        ctx.strokeStyle = "rgba(200,220,255,0.9)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(mx, pcy - 22);
        ctx.lineTo(mx, pcy + 22);
        ctx.stroke();
        // only the aligned (center) car's ray reaches the eye
        if (r1 > 0.4) {
          const a = Math.min(1, (r1 - 0.4) / 0.6);
          ctx.strokeStyle = `rgba(120,255,180,${0.85 * a})`;
          ctx.lineWidth = 1.3;
          ctx.beginPath();
          ctx.moveTo(p1cx - panelW / 2 + 20, pcy);
          ctx.lineTo(mx, pcy);
          ctx.lineTo(mx + 10 * a, pcy);
          ctx.stroke();
        }
        // side cars: dashed "blocked" rays with a small ✕
        [0, 2].forEach((i) => {
          const y = carYs[i];
          ctx.strokeStyle = "rgba(255,120,120,0.5)";
          ctx.lineWidth = 1;
          ctx.setLineDash([2, 2]);
          ctx.beginPath();
          ctx.moveTo(p1cx - panelW / 2 + 20, y);
          ctx.lineTo(mx - 4, y + (pcy - y) * 0.3);
          ctx.stroke();
          ctx.setLineDash([]);
        });
        // eye that only sees one car
        ctx.fillStyle = "rgba(255,255,255,0.95)";
        ctx.beginPath();
        ctx.ellipse(mx + 16, pcy, 6, 4.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#0A0A14";
        ctx.beginPath();
        ctx.arc(mx + 15, pcy, 2, 0, Math.PI * 2);
        ctx.fill();
      }

      // ---- Panel 2: the convex mirror device itself, bending wide-angle rays ----
      if (r2 > 0) {
        const mx = p2cx;
        const grad = ctx.createLinearGradient(mx - 8, pcy, mx + 6, pcy);
        grad.addColorStop(0, "#CFE8FF");
        grad.addColorStop(1, "#6FA8D6");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(mx, pcy - 22);
        ctx.quadraticCurveTo(mx - 9, pcy, mx, pcy + 22);
        ctx.lineTo(mx + 5, pcy + 22);
        ctx.lineTo(mx + 5, pcy - 22);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "rgba(255,255,255,0.9)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(mx, pcy - 22);
        ctx.quadraticCurveTo(mx - 9, pcy, mx, pcy + 22);
        ctx.stroke();
        // incoming wide-angle rays bending inward off the curved surface
        const p1 = Math.min(1, r2 / 0.5);
        [-1, 0, 1].forEach((k) => {
          const startY = pcy + k * 20;
          const hitY = pcy + k * 7; // compressed reflection point
          ctx.strokeStyle = `rgba(255,220,120,${0.8 * p1})`;
          ctx.lineWidth = 1.3;
          ctx.beginPath();
          ctx.moveTo(p2cx - panelW / 2 + 10, startY);
          ctx.lineTo(p2cx - panelW / 2 + 10 + p1 * (mx - 8 - (p2cx - panelW / 2 + 10)), startY + p1 * (hitY - startY));
          ctx.stroke();
          if (r2 > 0.5) {
            const p2 = Math.min(1, (r2 - 0.5) / 0.5);
            ctx.strokeStyle = `rgba(120,255,180,${0.85 * p2})`;
            ctx.beginPath();
            ctx.moveTo(mx - 8, hitY);
            ctx.lineTo(mx - 8 + p2 * (p2cx + panelW / 2 - 12 - (mx - 8)), hitY + p2 * (pcy - hitY));
            ctx.stroke();
          }
        });
      }

      // ---- Panel 3: wide field of view — all three cars visible in the mirror ----
      if (r3 > 0) {
        const mx = p3cx + panelW / 2 - 16;
        carYs.forEach((y, i) => drawCar(p3cx - panelW / 2 + 10, y, carColors[i], false));
        const grad = ctx.createLinearGradient(mx - 6, pcy, mx + 5, pcy);
        grad.addColorStop(0, "#CFE8FF");
        grad.addColorStop(1, "#6FA8D6");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(mx, pcy - 20);
        ctx.quadraticCurveTo(mx - 8, pcy, mx, pcy + 20);
        ctx.lineTo(mx + 4, pcy + 20);
        ctx.lineTo(mx + 4, pcy - 20);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "rgba(255,255,255,0.9)";
        ctx.lineWidth = 1.3;
        ctx.beginPath();
        ctx.moveTo(mx, pcy - 20);
        ctx.quadraticCurveTo(mx - 8, pcy, mx, pcy + 20);
        ctx.stroke();
        if (r3 > 0.5) {
          // all 3 tiny reflected images visible on the mirror surface
          carYs.forEach((y, i) => {
            const hitY = pcy + (i - 1) * 6;
            ctx.fillStyle = carColors[i];
            ctx.fillRect(mx - 2, hitY - 1.5, 4, 3);
          });
        }
        ctx.fillStyle = "rgba(255,255,255,0.95)";
        ctx.beginPath();
        ctx.ellipse(mx + 12, pcy, 5, 4, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#0A0A14";
        ctx.beginPath();
        ctx.arc(mx + 11, pcy, 1.8, 0, Math.PI * 2);
        ctx.fill();
      }

      // Captions
      ctx.font = "bold 9px sans-serif";
      ctx.textAlign = "center";
      ctx.fillStyle = "rgba(255,255,255,0.85)";
      const cap1 = tr("সমতল আয়নায়|একটা গাড়িই দেখা যায়", "A flat mirror shows|only one car");
      const cap2 = tr("উত্তল দর্পণ চওড়া কোণ|থেকে আলো বাঁকায়", "Convex mirror bends|light from a wide angle");
      const cap3 = tr("তিনটি গাড়িই এখন|দেখা যাচ্ছে", "All three cars are|now visible");
      [[p1cx, cap1], [p2cx, cap2], [p3cx, cap3]].forEach(([cx, cap]) => {
        const [l1, l2] = (cap as string).split("|");
        ctx.fillText(l1, cx as number, H - botPad + 12);
        ctx.fillText(l2, cx as number, H - botPad + 23);
      });
      break;
    }
    case "shaving": {
      // ===== Concave mirror as shaving / makeup mirror: face -> larger upright virtual image =====
      const cycle = (t % 4) / 4;

      // Face (object) on the left
      const faceX = 55;
      ctx.fillStyle = "rgba(255,210,170,0.95)";
      ctx.beginPath();
      ctx.ellipse(faceX, cy, 18, 24, 0, 0, Math.PI * 2);
      ctx.fill();
      // eyes
      ctx.fillStyle = "#222";
      ctx.beginPath();
      ctx.arc(faceX - 6, cy - 6, 2, 0, Math.PI * 2);
      ctx.arc(faceX + 6, cy - 6, 2, 0, Math.PI * 2);
      ctx.fill();
      // smile
      ctx.strokeStyle = "#222";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(faceX, cy + 4, 5, 0.1 * Math.PI, 0.9 * Math.PI);
      ctx.stroke();

      // Concave mirror (curves toward face)
      const mx = W - 70;
      ctx.fillStyle = "#2A2A3A";
      ctx.beginPath();
      ctx.roundRect(mx, cy - 50, 14, 100, 4);
      ctx.fill();
      const grad = ctx.createLinearGradient(mx - 12, cy, mx + 4, cy);
      grad.addColorStop(0, "#CFE8FF");
      grad.addColorStop(1, "#6FA8D6");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(mx + 2, cy - 48);
      ctx.quadraticCurveTo(mx - 12, cy, mx + 2, cy + 48);
      ctx.lineTo(mx + 2, cy - 48);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.9)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(mx + 2, cy - 48);
      ctx.quadraticCurveTo(mx - 12, cy, mx + 2, cy + 48);
      ctx.stroke();

      // Rays from face top & bottom -> mirror -> diverge back, virtual image BEHIND mirror
      const reach = Math.min(1, cycle / 0.7);
      const topY = cy - 22, botY = cy + 22;
      const hitTop = cy - 18, hitBot = cy + 18;
      ctx.strokeStyle = `rgba(255,220,120,${0.85 * reach})`;
      ctx.lineWidth = 1.4;
      // forward rays
      ctx.beginPath();
      ctx.moveTo(faceX + 18, topY);
      ctx.lineTo(faceX + 18 + reach * (mx - 4 - (faceX + 18)), topY + reach * (hitTop - topY));
      ctx.moveTo(faceX + 18, botY);
      ctx.lineTo(faceX + 18 + reach * (mx - 4 - (faceX + 18)), botY + reach * (hitBot - botY));
      ctx.stroke();
      // reflected rays diverging back to viewer
      if (reach > 0.7) {
        const a = Math.min(1, (reach - 0.7) / 0.3);
        ctx.strokeStyle = `rgba(120,255,180,${0.85 * a})`;
        ctx.beginPath();
        ctx.moveTo(mx - 4, hitTop);
        ctx.lineTo(mx - 4 - a * (mx - 4 - (faceX + 22)), hitTop - a * 14);
        ctx.moveTo(mx - 4, hitBot);
        ctx.lineTo(mx - 4 - a * (mx - 4 - (faceX + 22)), hitBot + a * 14);
        ctx.stroke();
        // dashed virtual extensions BEHIND mirror to virtual image
        ctx.setLineDash([4, 3]);
        ctx.strokeStyle = `rgba(180,220,255,${0.6 * a})`;
        const vImgX = mx + 28;
        ctx.beginPath();
        ctx.moveTo(mx + 2, hitTop);
        ctx.lineTo(vImgX, cy - 36);
        ctx.moveTo(mx + 2, hitBot);
        ctx.lineTo(vImgX, cy + 36);
        ctx.stroke();
        ctx.setLineDash([]);

        // Larger upright virtual face behind mirror
        ctx.save();
        ctx.globalAlpha = 0.55 * a;
        ctx.fillStyle = "rgba(255,210,170,1)";
        ctx.beginPath();
        ctx.ellipse(vImgX + 12, cy, 26, 36, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#222";
        ctx.beginPath();
        ctx.arc(vImgX + 12 - 9, cy - 9, 3, 0, Math.PI * 2);
        ctx.arc(vImgX + 12 + 9, cy - 9, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#222";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(vImgX + 12, cy + 6, 7, 0.1 * Math.PI, 0.9 * Math.PI);
        ctx.stroke();
        ctx.restore();
      }

      ctx.fillStyle = "rgba(255,255,255,0.85)";
      ctx.font = "bold 11px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(tr("মুখ", "Face"), faceX, H - 8);
      ctx.fillText(tr("বড়, সোজা, অভাসী প্রতিবিম্ব", "Large, erect, virtual image"), W - 60, H - 8);
      break;
    }
    case "equal": {
      // Object
      ctx.fillStyle = "rgba(100,200,100,0.7)";
      ctx.fillRect(50, cy - 30, 10, 60);
      ctx.fillStyle = "rgba(255,255,255,0.7)";
      ctx.font = "10px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(tr("বস্তু", "Object"), 55, cy + 50);

      // Lens at center
      ctx.strokeStyle = "rgba(180,220,255,0.8)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(W / 2, cy - 50);
      ctx.quadraticCurveTo(W / 2 - 8, cy, W / 2, cy + 50);
      ctx.quadraticCurveTo(W / 2 + 8, cy, W / 2, cy - 50);
      ctx.stroke();

      // Equal inverted image
      const flip = Math.min(1, (t % 4) / 2);
      ctx.fillStyle = `rgba(200,100,100,${0.7 * flip})`;
      ctx.fillRect(W - 60, cy - 30 * flip, 10, 60 * flip);
      ctx.fillStyle = `rgba(255,255,255,${0.7 * flip})`;
      ctx.fillText(tr("প্রতিবিম্ব", "Image"), W - 55, cy + 50);
      break;
    }
    default:
      ctx.fillStyle = "rgba(255,255,255,0.5)";
      ctx.font = "14px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(tr("অ্যানিমেশন লোড হচ্ছে...", "Loading animation..."), W / 2, cy);
  }
}

const styles = `
@import url('https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap');
:root {
  /* 10MS brand red — used for tab/nav accents, headers, and other brand
     chrome. Kept alongside the c-* green tokens (used for CTAs and
     genuinely active/selected states) per 10MS's own guidance that red
     is a supported branding color, not marketing-only. */
  --ten-red: #E8001D; --ten-red-dark: #931212;
  --success: #1CAB55; --success-dark: #0E7B4F;
  --ten-ink: #111827;
  --gray-100: #F3F4F6; --gray-200: #E5E7EB; --gray-300: #D1D5DB;
  --gray-500: #6B7280; --gray-600: #4B5563;
  --border: #E5E7EB; --bg: #FFFFFF; --surface: #F9FAFB;
  --info-soft: #D8F3FF;
  /* Three-Green Rule */
  --c-primary: #1CAB55;            /* active states, focus rings, progress */
  --c-primary-deep: #17994B;       /* hover/pressed on primary — never at rest */
  --c-primary-container: #D0FAD0;  /* selected-state / success fills */
  --c-on-primary: #FFFFFF;
  --c-on-primary-container: #086347;
  --c-green-link: #149353;         /* text links, nav labels */
  --c-green-cta: #37C25C;          /* filled CTA button surfaces */
  --c-nav-active-tint: #EAFEF2;
  /* Two-Red Rule — error-red is the only red used in app UI */
  --c-error: #DC2626;
  --c-alert-surface: #FEF2F2;
  --c-warning: #EAB308;
  --c-surface-blue: #EFF6FF;
}
.ro-root { font-family: 'Hind Siliguri','Inter',sans-serif; color: var(--ten-ink); background: var(--surface); min-height: 100vh; padding: 16px; box-sizing: border-box; line-height: 1.5; max-width: 361px; margin: 0 auto; }
@media (min-width: 768px) { .ro-root { max-width: 720px; padding: 24px; } }
@media (min-width: 1440px) { .ro-root { max-width: 1216px; } }
.ro-root *, .ro-root *::before, .ro-root *::after { box-sizing: border-box; }
.ro-header { background: #fff; border: 1px solid var(--border); border-radius: 12px; padding: 10px 12px; margin-bottom: 8px; border-top: 3px solid var(--ten-red); display: flex; align-items: center; gap: 10px; }
.ro-header .icon { width: 32px; height: 32px; background: #FFF5F6; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: var(--ten-red); }
.ro-header .icon svg { width: 16px; height: 16px; }
.ro-header h1 { font-size: 14px; font-weight: 700; margin: 0; }
.ro-header p { font-size: 10px; color: var(--gray-500); margin: 0; font-family: 'Inter',sans-serif; }
.ro-card { background: var(--bg); border: 1px solid var(--border); border-radius: 12px; padding: 12px; margin-bottom: 10px; }
.experiment-row { display: flex; flex-direction: column; gap: 10px; margin-bottom: 10px; }
@media (min-width: 768px) { .experiment-row { flex-direction: row; } }
/* Concept onboarding is presented as a proper contained popup — a dimmed
   backdrop behind a centered, bounded card (same shape as the existing
   congrats-modal pattern) holding the same simulation canvas + question,
   rather than taking over the whole viewport edge-to-edge. */
@keyframes onboardingPageIn {
  from { opacity: 0; transform: translate(-50%, -50%) scale(0.96); }
  to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
}
.onboarding-modal-backdrop {
  position: fixed; inset: 0; z-index: 9390; background: rgba(17,24,39,0.6);
  backdrop-filter: blur(4px); animation: congratsBdIn 0.2s ease-out;
}
.onboarding-modal-shell {
  position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
  z-index: 9395; background: #fff;
  width: calc(100vw - 32px); max-width: 480px; max-height: 92vh;
  overflow-y: auto; border-radius: 20px; padding: 16px;
  box-shadow: 0 25px 60px rgba(0,0,0,0.35);
  display: flex; flex-direction: column; gap: 12px;
  animation: onboardingPageIn 0.3s cubic-bezier(0.16,1,0.3,1);
}
@media (min-width: 600px) { .onboarding-modal-shell { padding: 20px; } }
.onboarding-modal-shell .canvas-card { margin-bottom: 0; }
/* Wide screens: lay the canvas and question side-by-side instead of the
   same narrow stacked column used on mobile, so the popup actually makes
   use of the extra desktop space. */
@media (min-width: 900px) {
  .onboarding-modal-shell {
    flex-direction: row; align-items: flex-start; max-width: 900px; padding: 24px;
  }
  .onboarding-modal-shell > .ro-card.canvas-card { flex: 1 1 46%; min-width: 0; }
  .onboarding-modal-shell > .concept-onboard-card { flex: 1 1 54%; min-width: 0; align-self: stretch; }
}
.experiment-canvas { flex: 1; min-width: 0; }
.canvas-card { padding: 8px; }
.tabs { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; }
.tab-btn { padding: 8px 4px; border: 1px solid var(--border); background: #fff; border-radius: 8px; font-weight: 700; font-size: 12px; color: var(--gray-600); cursor: pointer; transition: all 180ms; min-height: 44px; font-family: inherit; display: flex; align-items: center; justify-content: center; text-align: center; white-space: nowrap; }
.tab-btn.active { border-color: var(--ten-red); background: #FFF5F6; color: var(--ten-red); box-shadow: 0 0 0 2px rgba(232,0,29,0.06); }
@media (max-width: 767px) { .mode-tabs-card { display: none; } }
.canvas-wrap { position: relative; width: 100%; background: #0B1220; border-radius: 10px; overflow: hidden; }
canvas { display: block; width: 100%; }
.canvas-hint { position: absolute; top: 8px; left: 10px; font-size: 11px; color: rgba(255,255,255,0.55); pointer-events: none; }
.action-row { display: flex; gap: 8px; margin-top: 10px; }
.light-btn { flex: 1; min-height: 48px; padding: 12px 16px; border-radius: 12px; border: 1px solid var(--success-dark); background: var(--success); color: #fff; font-weight: 700; font-size: 15px; font-family: inherit; cursor: pointer; transition: all 180ms; box-shadow: 0 2px 8px rgba(28,171,85,0.25); }
.light-btn:active { transform: scale(0.98); }
.light-btn.on { background: linear-gradient(135deg,#FF7B2A,#E8001D); border-color: #931212; box-shadow: 0 0 0 3px rgba(232,0,29,0.15), 0 4px 14px rgba(232,123,42,0.4); }
@media (max-width: 767px) {
  .action-row { margin-top: 6px; }
  .light-btn { min-height: 36px; padding: 7px 12px; font-size: 13px; border-radius: 10px; }
}
.ctrl-toggles-card { display: flex; flex-direction: column; gap: 0; padding: 4px 12px; }
.ctrl-toggle-row { display: flex; align-items: center; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid var(--border); }
.ctrl-toggle-row:last-child { border-bottom: none; }
.ctrl-toggle-label { font-size: 14px; font-weight: 600; color: var(--ten-ink); }
.ctrl-toggle-switch { position: relative; width: 48px; height: 26px; border-radius: 999px; border: none; background: #D1D5DB; cursor: pointer; padding: 0; transition: background 0.2s; flex-shrink: 0; }
.ctrl-toggle-switch.on { background: var(--ten-red); }
.ctrl-toggle-thumb { position: absolute; top: 3px; left: 3px; width: 20px; height: 20px; border-radius: 50%; background: #fff; box-shadow: 0 1px 4px rgba(0,0,0,0.2); transition: transform 0.2s; display: block; }
.ctrl-toggle-switch.on .ctrl-toggle-thumb { transform: translateX(22px); }
.ctrl-reset-toggle { width: 36px; height: 36px; border-radius: 50%; border: 1.5px solid var(--ten-red-dark); background: var(--ten-red); color: #fff; font-size: 18px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: transform 0.15s, box-shadow 0.15s; flex-shrink: 0; box-shadow: 0 2px 8px rgba(232,0,29,0.3); }
.ctrl-reset-toggle:active { transform: rotate(-90deg) scale(0.92); }
.ctrl-reset-toggle:hover { box-shadow: 0 4px 12px rgba(232,0,29,0.45); }
.legend { display: flex; gap: 10px; flex-wrap: wrap; font-size: 11px; color: var(--gray-600); margin-top: 10px; padding: 0 4px; }
.legend span { display: inline-flex; align-items: center; gap: 4px; }
.legend i { width: 14px; height: 3px; border-radius: 2px; display: inline-block; }
.legend-dash { font-family: monospace; }
.slider-row { margin-bottom: 14px; }
.slider-row:last-child { margin-bottom: 0; }
.slider-row label { display: flex; justify-content: space-between; font-size: 13px; font-weight: 600; margin-bottom: 4px; }
.slider-row .val { color: var(--ten-red); font-family: 'Inter',sans-serif; }
input[type="range"] { -webkit-appearance: none; appearance: none; width: 100%; height: 44px; background: transparent; cursor: pointer; }
input[type="range"]::-webkit-slider-runnable-track { height: 6px; background: var(--gray-200); border-radius: 999px; }
input[type="range"]::-moz-range-track { height: 6px; background: var(--gray-200); border-radius: 999px; }
input[type="range"]::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; height: 24px; width: 24px; border-radius: 50%; background: var(--success); border: 2px solid #fff; box-shadow: 0 2px 6px rgba(0,0,0,0.2); margin-top: -9px; }
input[type="range"]::-moz-range-thumb { height: 24px; width: 24px; border-radius: 50%; background: var(--success); border: 2px solid #fff; box-shadow: 0 2px 6px rgba(0,0,0,0.2); }
input[type="range"]:focus { outline: none; }
@media (max-width: 767px) {
  .slider-row { margin-bottom: 6px; }
  .slider-row label { font-size: 12px; margin-bottom: 0; }
  input[type="range"] { height: 30px; }
  input[type="range"]::-webkit-slider-thumb { height: 20px; width: 20px; margin-top: -7px; }
  input[type="range"]::-moz-range-thumb { height: 20px; width: 20px; }
  .sliders-card { padding: 8px 12px; margin-bottom: 6px; }
}
.pos-indicator { display: inline-block; background: var(--info-soft); color: #0B5C7A; padding: 4px 10px; border-radius: 999px; font-size: 12px; font-weight: 600; margin-top: 8px; }
.presets { display: flex; gap: 8px; overflow-x: auto; padding-bottom: 4px; -webkit-overflow-scrolling: touch; }
.presets::-webkit-scrollbar { display: none; }
.preset-btn { flex: 0 0 auto; padding: 10px 14px; background: #fff; border: 1px solid var(--border); border-radius: 999px; font-size: 12px; font-weight: 600; color: var(--gray-600); min-height: 44px; cursor: pointer; font-family: inherit; white-space: nowrap; }
.preset-btn:active { transform: scale(0.97); background: var(--gray-100); }

/* FORMULA CARD — proper fractions */
.formula-card { padding: 16px; }
.formula-display { display: flex; align-items: center; justify-content: center; gap: 12px; padding: 16px; background: var(--c-nav-active-tint); border-radius: 12px; margin-bottom: 12px; }
.formula-values { display: flex; align-items: center; justify-content: center; gap: 10px; padding: 10px; background: var(--surface); border-radius: 8px; margin-bottom: 12px; }
.fv-row { display: flex; align-items: center; gap: 8px; }
.fraction { display: inline-flex; flex-direction: column; align-items: center; position: relative; padding: 0 4px; }
.fraction .num { font-family: 'Inter',serif; font-weight: 700; font-size: 20px; line-height: 1.2; }
.fraction .den { font-family: 'Inter',serif; font-weight: 600; font-size: 18px; line-height: 1.2; color: var(--ten-red); border-top: 2px solid var(--ten-ink); padding-top: 2px; min-width: 20px; text-align: center; }
.fraction.small .num { font-size: 14px; }
.fraction.small .den { font-size: 13px; border-top-width: 1.5px; }
.op { font-family: 'Inter',serif; font-size: 22px; font-weight: 700; color: var(--gray-600); }
.formula-values .op { font-size: 16px; }
.data-rows { }
.row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 14px; border-bottom: 1px dashed var(--gray-200); }
.f-neg-info-btn {
  display: inline-flex; align-items: center; justify-content: center;
  width: 16px; height: 16px; margin-left: 6px; border-radius: 50%;
  border: 1.5px solid var(--c-green-link); background: var(--c-nav-active-tint); color: var(--c-green-link);
  font-size: 10px; font-weight: 800; cursor: pointer; padding: 0; vertical-align: middle;
}
.f-neg-info-btn:hover { background: var(--c-green-link); color: #fff; }

.row:last-child { border-bottom: none; }
.row .k { color: var(--gray-600); }
.row .v { font-weight: 700; font-family: 'Inter',sans-serif; }
.row .v.bn { font-family: 'Hind Siliguri',sans-serif; }

/* EXPLAIN CARD v2 — animated */
.explain-card-v2 { background: var(--c-nav-active-tint); border: 1px solid var(--c-primary-container); padding: 16px; overflow: hidden; }
.explain-header { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
.explain-icon-pulse { font-size: 22px; animation: pulse-glow 2s ease-in-out infinite; color: var(--c-on-primary-container); display: flex; align-items: center; }
@keyframes pulse-glow {
  0%, 100% { transform: scale(1); filter: brightness(1); }
  50% { transform: scale(1.2); filter: brightness(1.3); }
}
.explain-title { font-weight: 700; font-size: 15px; color: var(--c-on-primary-container); }
.explain-body { font-size: 14px; line-height: 1.7; color: var(--ten-ink); animation: fadeSlideIn 0.4s ease-out; }
@keyframes fadeSlideIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Use case section */
.use-case-section { margin-top: 14px; padding-top: 14px; border-top: 1px dashed var(--c-primary-container); }
.outcome-action-btn {
  flex: 0 0 auto; width: 48px; min-height: 48px; padding: 0; border-radius: 12px; border: none;
  color: #fff; cursor: pointer; transition: all 200ms;
  display: flex; align-items: center; justify-content: center;
}
.outcome-action-btn:active { transform: scale(0.97); }
.learning-action-btn { background: var(--c-primary); box-shadow: 0 3px 12px rgba(28,171,85,0.3); }
.learning-action-btn:hover { background: var(--c-primary-deep); transform: translateY(-1px); box-shadow: 0 6px 18px rgba(28,171,85,0.4); }
.goto-usecase-btn { background: linear-gradient(135deg,#FFB347,#FF6B35,#E8001D); box-shadow: 0 3px 12px rgba(232,107,53,0.35); }
.goto-usecase-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 18px rgba(232,107,53,0.5); }
.controls-toggle-btn { background: var(--gray-600, #4B5563); box-shadow: 0 3px 12px rgba(0,0,0,0.2); }
.controls-toggle-btn:hover { background: #374151; transform: translateY(-1px); box-shadow: 0 6px 18px rgba(0,0,0,0.28); }
.controls-toggle-btn.active { background: var(--c-primary); box-shadow: 0 0 0 3px rgba(28,171,85,0.22), 0 3px 12px rgba(28,171,85,0.3); }
/* ---- In-simulator concept onboarding ---- */
.predict-start-btn {
  width: 100%; margin-top: 8px; padding: 12px 0; border-radius: 999px; border: none;
  background: var(--c-primary); color: #fff; font-size: 15px; font-weight: 800; cursor: pointer;
  transition: background 0.18s ease-out, transform 0.18s ease-out;
}
.predict-start-btn:hover:not(:disabled) { background: var(--c-primary-deep); transform: translateY(-1px); }
.predict-start-btn:disabled { background: var(--gray-300, #D9D6D2); color: var(--gray-500); cursor: not-allowed; }
/* Question card inside the onboarding popup shell — a plain flex child,
   step transitions handled by the per-step React key remount. */
.concept-onboard-card { position: relative; margin-bottom: 0; padding: 16px; }
@media (min-width: 768px) { .concept-onboard-card { padding: 22px; } }
.concept-onboard-card .concept-explain { margin: 4px 0 10px; padding: 12px; animation: fadeSlideIn 0.35s ease-out; }
.concept-onboard-card .concept-explain .explain-body { font-size: 13px; line-height: 1.6; }
.concept-onboard-card .quiz-feedback { animation: fadeSlideIn 0.3s ease-out; }
.identify-compare { display: flex; align-items: center; justify-content: center; gap: 10px; margin-bottom: 10px; }
.identify-compare-item { display: flex; flex-direction: column; align-items: center; gap: 2px; flex: 1; padding: 8px 4px; border-radius: 10px; }
.identify-compare-item .shape-icon { color: var(--gray-600); }
.identify-compare-item.wrong { background: var(--c-alert-surface); }
.identify-compare-item.wrong .shape-icon { color: var(--c-error); }
.identify-compare-item.correct { background: var(--c-primary-container); }
.identify-compare-item.correct .shape-icon { color: var(--c-on-primary-container); }
.identify-compare-label { font-size: 10px; color: var(--gray-500); }
.identify-compare-name { font-size: 12px; font-weight: 700; }
.identify-compare-item.wrong .identify-compare-name { color: var(--c-error); }
.identify-compare-item.correct .identify-compare-name { color: var(--c-on-primary-container); }
.identify-compare-arrow { flex-shrink: 0; color: var(--gray-400, #9CA3AF); }
@media (max-width: 767px) {
  .outcome-action-btn { width: 36px; min-height: 36px; border-radius: 10px; }
}
.use-case-label { font-weight: 700; font-size: 13px; color: var(--c-on-primary-container); margin-bottom: 10px; }
.use-case-cards { display: flex; flex-direction: column; gap: 8px; }
.use-case-card { display: flex; align-items: center; gap: 10px; padding: 10px 12px; background: rgba(255,255,255,0.8); border: 1px solid var(--c-primary-container); border-radius: 12px; cursor: pointer; transition: all 250ms ease; font-family: inherit; text-align: left; width: 100%; }
.use-case-card:hover { background: rgba(255,255,255,1); box-shadow: 0 2px 8px rgba(0,0,0,0.06); transform: translateY(-1px); }
.use-case-card.active { background: #FFF; border-color: var(--ten-red); box-shadow: 0 0 0 2px rgba(232,0,29,0.1); }
.uc-icon { font-size: 18px; flex-shrink: 0; width: 28px; height: 28px; border-radius: 6px; background: var(--gray-100); display: flex; align-items: center; justify-content: center; font-weight: 700; color: var(--ten-red); }
.uc-title { font-weight: 700; font-size: 13px; color: var(--ten-ink); }
.uc-desc { font-size: 11px; color: var(--gray-500); margin-top: 2px; }
.uc-arrow { font-size: 10px; color: var(--gray-500); margin-left: auto; flex-shrink: 0; display: flex; align-items: center; transition: transform 180ms; }
.use-case-animation { margin-top: 10px; border-radius: 10px; overflow: hidden; background: #0D1525; animation: expandIn 0.3s ease-out; }
.use-case-animation canvas { display: block; width: 100%; height: 200px; }
.uc-anim-label { text-align: center; color: rgba(255,255,255,0.5); font-size: 10px; padding: 6px; background: rgba(0,0,0,0.3); }
@keyframes expandIn {
  from { max-height: 0; opacity: 0; }
  to { max-height: 260px; opacity: 1; }
}

/* CONGRATS + USE-CASE MODALS (build-a-simulation guide) */
@keyframes congratsBdIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes congratsCardIn { from { transform: translateY(24px) scale(0.97); opacity: 0; } to { transform: translateY(0) scale(1); opacity: 1; } }
.congrats-modal-bd, .usecase-modal-bd {
  position: fixed; inset: 0; z-index: 9500; background: rgba(17,24,39,0.65);
  backdrop-filter: blur(5px); display: flex; align-items: center; justify-content: center;
  padding: 16px; animation: congratsBdIn 0.2s ease-out;
}
.congrats-modal-card, .usecase-modal-card {
  position: relative; background: #fff; border-radius: 24px; padding: 32px;
  width: 100%; max-width: min(720px, 96vw); max-height: 92vh; overflow-y: auto;
  box-shadow: 0 25px 60px rgba(0,0,0,0.25); animation: congratsCardIn 0.3s cubic-bezier(0.16,1,0.3,1);
  font-family: inherit;
}
@media (max-width: 600px) {
  .congrats-modal-bd, .usecase-modal-bd { padding: 0; }
  .congrats-modal-card, .usecase-modal-card {
    max-width: 100%; width: 100%; height: 100%; max-height: 100%;
    border-radius: 0; padding: 24px 18px;
  }
}
.congrats-close {
  position: absolute; top: 12px; right: 12px; width: 28px; height: 28px;
  border-radius: 50%; border: none; background: #F3F4F6; color: #6B7280;
  display: flex; align-items: center; justify-content: center; cursor: pointer;
}
.congrats-close:hover { background: #E5E7EB; color: #374151; }
.congrats-emoji { font-size: 44px; text-align: center; margin-bottom: 4px; }
.congrats-title { font-size: 22px; font-weight: 800; text-align: center; color: #111827; margin-bottom: 6px; }
.congrats-subtitle { font-size: 14px; color: #4B5563; text-align: center; margin-bottom: 18px; }
.congrats-learn-box { background: var(--c-nav-active-tint); border: 1px solid var(--c-primary-container); border-radius: 14px; padding: 14px; margin-bottom: 16px; }
.congrats-learn-title { font-size: 13px; font-weight: 800; color: var(--c-on-primary-container); margin-bottom: 6px; }
.congrats-learn-body { font-size: 13px; color: #4B5563; line-height: 1.6; margin: 0; }
.congrats-hint-box { background: var(--c-surface-blue); border: 1px solid #BFDBFE; border-radius: 14px; padding: 16px; margin-bottom: 16px; }
.congrats-hint-row { display: flex; align-items: center; gap: 10px; font-size: 13px; font-weight: 700; color: #111827; padding: 4px 0; }
.congrats-hint-icon { flex-shrink: 0; width: 26px; height: 26px; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #fff; }
.congrats-hint-icon.learning { background: var(--c-primary); }
.congrats-hint-icon.usecase { background: linear-gradient(135deg,#FFB347,#FF6B35,#E8001D); }
.congrats-hint-text { font-size: 12px; color: #374151; line-height: 1.6; margin: 8px 0 0; }
.congrats-usecase-btn {
  width: 100%; padding: 13px 16px; border-radius: 14px; border: 1px solid #C2410C;
  background: linear-gradient(135deg,#FFB347,#FF6B35,#E8001D); color: #fff;
  font-weight: 800; font-size: 14px; font-family: inherit; cursor: pointer;
  box-shadow: 0 3px 12px rgba(232,107,53,0.35); transition: all 200ms;
}
.congrats-usecase-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 18px rgba(232,107,53,0.5); }
.usecase-modal-card { max-width: min(600px, 96vw); }
@keyframes pulseHighlight {
  0%, 100% { box-shadow: 0 0 0 0 rgba(28,171,85,0.5); transform: scale(1); }
  50% { box-shadow: 0 0 0 10px rgba(28,171,85,0); transform: scale(1.08); }
}
.pulse-highlight { animation: pulseHighlight 0.9s ease-in-out 3; }

/* LAB TEST STYLES */
.assessment-cta-wrap { display: flex; flex-direction: column; align-items: flex-end; gap: 5px; }
.assessment-cta-hint { font-size: 10.5px; font-weight: 600; color: var(--gray-500); text-align: right; max-width: 160px; line-height: 1.35; }
@media (max-width: 540px) { .assessment-cta-hint { font-size: 9.5px; max-width: 110px; } }
.lab-test-btn { padding: 6px 12px; background: linear-gradient(135deg, #FF6B35, #E8001D); color: #fff; border: none; border-radius: 999px; font-size: 12px; font-weight: 700; font-family: inherit; cursor: pointer; white-space: nowrap; box-shadow: 0 2px 8px rgba(232,0,29,0.25); transition: all 200ms; min-height: 36px; display: inline-flex; align-items: center; gap: 4px; }
.lab-test-btn:hover { transform: scale(1.05); box-shadow: 0 4px 14px rgba(232,0,29,0.35); }
.lab-test-btn.active { background: var(--c-primary); box-shadow: 0 0 0 3px rgba(28,171,85,0.22), 0 4px 14px rgba(28,171,85,0.4); }
.lab-test-btn.active:hover { background: var(--c-primary-deep); box-shadow: 0 0 0 3px rgba(28,171,85,0.28), 0 6px 18px rgba(28,171,85,0.5); }
.quest-mode-hint { background: var(--gray-100); color: #92730B; padding: 10px 14px; border-radius: 10px; font-size: 13px; margin-bottom: 8px; border: 1px solid var(--c-warning); }
.quest-mode-ok { background: var(--c-primary-container); color: var(--c-on-primary-container); padding: 10px 14px; border-radius: 10px; font-size: 13px; margin-bottom: 8px; border: 1px solid var(--c-primary); }
/* Lab name entry */
.lab-overlay { animation: fadeSlideIn 0.3s ease-out; text-align: center; }
.lab-name-card { display: flex; flex-direction: column; align-items: center; gap: 10px; padding: 10px 0; }
.lab-name-icon { font-size: 48px; animation: pulse-glow 2s ease-in-out infinite; color: var(--ten-red); }
.lab-name-card h2 { font-size: 18px; font-weight: 700; margin: 0; }
.lab-name-card p { font-size: 13px; color: var(--gray-500); margin: 0; }
.lab-name-input { width: 100%; max-width: 280px; padding: 12px 16px; border-radius: 12px; border: 2px solid var(--border); font-size: 15px; font-family: inherit; text-align: center; transition: border-color 200ms; outline: none; }
.lab-name-input:focus { border-color: var(--ten-red); }
.lab-start-btn { padding: 12px 28px; background: var(--c-primary); color: #fff; border: none; border-radius: 999px; font-size: 15px; font-weight: 700; font-family: inherit; cursor: pointer; min-height: 48px; box-shadow: 0 4px 14px rgba(28,171,85,0.3); transition: all 200ms; }
.lab-start-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.lab-start-btn:hover:not(:disabled) { background: var(--c-primary-deep); transform: translateY(-1px); box-shadow: 0 6px 20px rgba(28,171,85,0.4); }
.lab-cancel-btn { padding: 8px 16px; background: #f5f5f5; border: 1px solid var(--border); border-radius: 10px; font-size: 12px; color: var(--gray-600); font-family: inherit; cursor: pointer; transition: all 200ms; font-weight: 500; }
.lab-cancel-btn:hover { background: var(--gray-100); }

/* Quest card */
.lab-floating-panel { position: fixed; right: 16px; bottom: 16px; z-index: 850; max-width: 340px; width: calc(100vw - 32px); }
.lab-panel-card { position: relative; max-height: 70vh; overflow-y: auto; box-shadow: 0 10px 30px rgba(0,0,0,0.18); padding-right: 44px; }
.lab-panel-minimize-btn {
  position: absolute; top: 10px; right: 10px; width: 28px; height: 28px; border-radius: 50%;
  border: none; background: rgba(255,255,255,0.7); color: #6B7280; cursor: pointer;
  display: flex; align-items: center; justify-content: center; transition: all 150ms; z-index: 2;
}
.lab-panel-minimize-btn:hover { background: #fff; color: #374151; }
@keyframes controlsToolkitIn {
  from { opacity: 0; transform: translateY(16px) scale(0.97); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}
.controls-toolkit-card {
  position: relative; max-height: 75vh; overflow-y: auto; padding: 16px; padding-top: 40px;
  animation: controlsToolkitIn 0.2s ease-out;
}
.controls-toolkit-card .ro-card { margin-bottom: 10px; }
.controls-toolkit-card .ro-card:last-child { margin-bottom: 0; }
.lab-panel-pill {
  display: flex; align-items: center; gap: 8px; padding: 12px 16px; border-radius: 999px;
  border: none; background: var(--c-primary); color: #fff;
  font-weight: 700; font-size: 13px; font-family: inherit; cursor: pointer;
  box-shadow: 0 8px 22px rgba(28,171,85,0.4); animation: fadeSlideIn 0.3s ease-out;
}
.lab-panel-pill:hover { background: var(--c-primary-deep); transform: translateY(-1px); box-shadow: 0 10px 26px rgba(23,153,75,0.5); }
.lab-panel-pill-dot { width: 8px; height: 8px; border-radius: 50%; background: #FFFFFF; box-shadow: 0 0 0 3px rgba(255,255,255,0.35); animation: pulse-glow 1.4s ease-in-out infinite; }
@media (max-width: 767px) {
  .lab-floating-panel { right: 10px; bottom: 10px; max-width: none; }
  .lab-panel-card { max-height: 60vh; }
}
@media (min-width: 768px) {
  .lab-floating-panel { max-width: 400px; }
  .lab-panel-card {
    min-height: 400px; max-height: 80vh;
    padding: 22px; padding-right: 52px;
    display: flex; flex-direction: column; justify-content: center;
  }
  .quiz-question { font-size: 17px; margin-bottom: 18px; }
  .quiz-options { gap: 12px; }
  .quiz-option { padding: 15px 18px; font-size: 15px; min-height: 56px; }
  .quest-instruction { font-size: 15px; padding: 18px 20px; }
  .quest-hint { font-size: 13px; }
}
.quest-card { background: var(--bg); border: 1px solid var(--border); animation: fadeSlideIn 0.4s ease-out; position: relative; overflow: hidden; }
.quest-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 4px; background: linear-gradient(90deg, #E8001D, #FF6B35, #FFD23F); }
.quest-header { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
.quest-icon-wrap { width: 48px; height: 48px; background: #FFF0F0; border-radius: 14px; display: flex; align-items: center; justify-content: center; }
.quest-icon { font-size: 26px; animation: pulse-glow 2s ease-in-out infinite; color: var(--ten-red); display: flex; align-items: center; justify-content: center; }
.quest-label { font-size: 10px; font-weight: 800; color: #E8001D; letter-spacing: 1.5px; text-transform: uppercase; font-family: 'Inter',sans-serif; }
.quest-title { font-size: 16px; font-weight: 700; }
.quest-score-badge { margin-left: auto; background: var(--c-primary-container); color: var(--c-on-primary-container); padding: 4px 12px; border-radius: 999px; font-size: 12px; font-weight: 700; font-family: inherit; }
.quest-instruction { background: var(--gray-100); padding: 14px 16px; border-radius: 12px; font-size: 14px; line-height: 1.7; color: var(--ten-ink); margin-bottom: 10px; }
.quest-hint { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--success-dark); }
.quest-hint-icon { font-size: 14px; display: flex; align-items: center; }
.quest-success-flash { background: var(--c-primary-container); color: var(--c-on-primary-container); padding: 10px; border-radius: 10px; text-align: center; font-weight: 700; margin-top: 8px; animation: pulse-glow 1s ease-in-out infinite; }

/* Quiz card */
.quiz-card { animation: fadeSlideIn 0.3s ease-out; background: var(--bg); border: 1px solid var(--border); }
.quiz-header { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; }
.quiz-icon { font-size: 28px; color: var(--c-primary); display: flex; align-items: center; }
.quiz-round { font-size: 13px; font-weight: 700; color: var(--c-primary); }
.quiz-question { font-size: 15px; font-weight: 700; line-height: 1.6; margin-bottom: 14px; }
.quiz-options { display: flex; flex-direction: column; gap: 8px; }
.quiz-option { display: flex; align-items: center; gap: 10px; padding: 12px 14px; background: #fff; border: 2px solid var(--border); border-radius: 12px; font-size: 14px; font-family: inherit; cursor: pointer; transition: all 200ms; text-align: left; min-height: 48px; }
.quiz-option:hover:not(:disabled) { border-color: var(--c-primary); background: var(--c-nav-active-tint); }
.quiz-option.sel { border-color: var(--c-primary); background: var(--c-nav-active-tint); box-shadow: 0 0 0 1px var(--c-primary); }
.quiz-option.correct { border-color: var(--c-primary); background: var(--c-primary-container); }
.quiz-option.wrong { border-color: var(--c-error); background: var(--c-alert-surface); }
.opt-letter { width: 26px; height: 26px; border-radius: 50%; background: var(--gray-100); display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 12px; color: var(--gray-600); flex-shrink: 0; font-family: 'Inter',sans-serif; }
.quiz-option.sel .opt-letter { background: var(--c-primary); color: #fff; }
.quiz-option.correct .opt-letter { background: var(--c-primary); color: #fff; }
.quiz-option.wrong .opt-letter { background: var(--c-error); color: #fff; }
.quiz-feedback { text-align: center; padding: 10px; margin-top: 10px; border-radius: 10px; font-weight: 700; font-size: 14px; animation: fadeSlideIn 0.3s ease-out; }
.quiz-feedback.correct { background: var(--c-primary-container); color: var(--c-on-primary-container); }
.quiz-feedback.wrong { background: var(--c-alert-surface); color: var(--c-error); }

/* Result card */
.result-card { text-align: center; padding: 24px 16px; animation: fadeSlideIn 0.4s ease-out; background: var(--bg); border: 1px solid var(--border); }
.result-trophy { font-size: 64px; animation: pulse-glow 2s ease-in-out infinite; color: var(--ten-red); display: flex; justify-content: center; }
.result-title { font-size: 22px; font-weight: 800; margin: 8px 0 4px; }
.result-name { font-size: 16px; color: var(--gray-600); font-weight: 600; }
.result-score { font-size: 36px; font-weight: 900; color: var(--ten-red); font-family: 'Inter',sans-serif; margin: 12px 0 8px; }
.result-score span { font-size: 16px; font-weight: 600; color: var(--gray-500); }
.result-stars { font-size: 28px; margin-bottom: 16px; display: flex; justify-content: center; gap: 4px; }
.star-filled { color: var(--c-warning); display: inline-flex; }
.star-empty { color: var(--gray-200); display: inline-flex; }
.result-btns { display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; }

/* Learning Outcomes Sticky Section */
.learning-outcomes-section { background: var(--c-surface-blue); border: 1.5px solid #BFDBFE; border-radius: 12px; padding: 16px; margin-bottom: 16px; border-left: 4px solid var(--c-primary); }
.learning-header { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; }
.learning-icon { color: var(--c-primary); display: flex; align-items: center; }
.learning-title { font-size: 13px; font-weight: 700; color: var(--ten-ink); margin: 0; }
.learning-message { font-size: 13px; color: var(--gray-600); line-height: 1.6; margin-bottom: 12px; margin-top: 6px; }
.learning-tips-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
@media (max-width: 600px) { .learning-tips-grid { grid-template-columns: 1fr; } }
.learning-tip-item { display: flex; gap: 8px; padding: 8px; background: rgba(255,255,255,0.6); border-radius: 8px; font-size: 12px; color: var(--gray-600); line-height: 1.4; align-items: flex-start; }
.tip-icon { flex-shrink: 0; width: 20px; height: 20px; border-radius: 50%; background: var(--c-primary); color: #fff; font-weight: 700; font-size: 11px; display: flex; align-items: center; justify-content: center; }
.tip-text { flex: 1; }
`;
