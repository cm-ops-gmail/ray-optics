import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import SiteNav from "@/components/SiteNav";
import { Microscope, Play, Pause, Info, Plus, Trash2, Lightbulb, X, FlaskConical, Target, ChevronDown, ChevronUp, Trophy, Star, SlidersHorizontal } from "lucide-react";
import { useLang } from "@/context/LangContext";

type Mode = "slab" | "prism" | "stick";

// ============== ASSESSMENT — QUEST POOL ==============
interface RefQuestState { angleDeg: number; n: number; thickness: number; raysCount: number; stickAngleDeg: number; stickWaterN: number }
interface RefQuest {
  id: number;
  instruction: string;
  targetMode: Mode;
  targetModeLabel: string;
  check: (s: RefQuestState) => boolean;
  quiz: { question: string; options: string[]; correctIndex: number };
  hint: string;
}

const REFRACTION_QUEST_POOL: RefQuest[] = [
  {
    id: 1,
    instruction: "কাঁচের স্ল্যাবে আপতন কোণ (i) ৫৫° বা তার বেশি করো এবং পার্শ্বিক সরণ লক্ষ করো।",
    targetMode: "slab", targetModeLabel: "কাঁচের স্ল্যাব",
    check: (s) => s.angleDeg >= 55,
    quiz: { question: "আপতন কোণ বাড়ালে পার্শ্বিক সরণ (lateral shift) কী হয়?", options: ["বাড়ে", "কমে", "একই থাকে", "শূন্য হয়ে যায়"], correctIndex: 0 },
    hint: "আপতন কোণ (i) স্লাইডার ডানদিকে টানো",
  },
  {
    id: 2,
    instruction: "কাঁচের স্ল্যাবের প্রতিসরাঙ্ক (n) ১.৭ বা তার বেশি করো।",
    targetMode: "slab", targetModeLabel: "কাঁচের স্ল্যাব",
    check: (s) => s.n >= 1.7,
    quiz: { question: "প্রতিসরাঙ্ক বেশি হলে আলো কেমন বাঁকে?", options: ["বেশি বাঁকে", "কম বাঁকে", "একদমই বাঁকে না", "রঙ বদলায়"], correctIndex: 0 },
    hint: "প্রতিসরাঙ্ক (n) স্লাইডার ডানদিকে টানো",
  },
  {
    id: 3,
    instruction: "স্ল্যাবের পুরুত্ব বাড়িয়ে ১৪০px বা তার বেশি করো।",
    targetMode: "slab", targetModeLabel: "কাঁচের স্ল্যাব",
    check: (s) => s.thickness >= 140,
    quiz: { question: "স্ল্যাব মোটা হলে পার্শ্বিক সরণের কী হয়?", options: ["বাড়ে", "কমে", "একই থাকে", "শূন্য হয়"], correctIndex: 0 },
    hint: "পুরুত্ব স্লাইডার ডানদিকে টানো",
  },
  {
    id: 4,
    instruction: "আপতন কোণ (i) ১৫° বা তার কম করো — খুব ছোট কোণে কী হয় দেখো।",
    targetMode: "slab", targetModeLabel: "কাঁচের স্ল্যাব",
    check: (s) => s.angleDeg <= 15,
    quiz: { question: "আপতন কোণ খুব ছোট হলে প্রতিসরণ কোণও কেমন হয়?", options: ["খুব ছোট", "খুব বড়", "৯০°", "শূন্য"], correctIndex: 0 },
    hint: "আপতন কোণ স্লাইডার বামদিকে টানো",
  },
  {
    id: 5,
    instruction: "প্রিজমে অন্তত একটি আলোক উৎস যোগ করো এবং বিচ্ছুরণ দেখো।",
    targetMode: "prism", targetModeLabel: "প্রিজম",
    check: (s) => s.raysCount >= 1,
    quiz: { question: "সাদা আলো প্রিজমে ঢুকলে কয়টি রঙে ভাগ হয়?", options: ["৩", "৫", "৭", "৯"], correctIndex: 2 },
    hint: '"আলো যোগ" বাটনে চাপো, তারপর ক্যানভাসে ক্লিক করো',
  },
  {
    id: 6,
    instruction: "প্রিজমে অন্তত ২টি আলোক উৎস যোগ করো এবং প্রতিটির বিচ্ছুরণ তুলনা করো।",
    targetMode: "prism", targetModeLabel: "প্রিজম",
    check: (s) => s.raysCount >= 2,
    quiz: { question: "কোন রঙের আলো সবচেয়ে বেশি বাঁকে?", options: ["লাল", "সবুজ", "বেগুনি", "হলুদ"], correctIndex: 2 },
    hint: "আরেকটি আলো যোগ করো",
  },
  {
    id: 7,
    instruction: "লাঠির কোণ ৫০° বা তার বেশি করো এবং লাঠি কতটা বাঁকা দেখায় লক্ষ করো।",
    targetMode: "stick", targetModeLabel: "পানিতে লাঠি",
    check: (s) => s.stickAngleDeg >= 50,
    quiz: { question: "লাঠির কোণ বাড়ালে বাঁকা দেখানোর প্রভাব কেমন হয়?", options: ["বেশি স্পষ্ট হয়", "কম স্পষ্ট হয়", "পরিবর্তন হয় না", "লাঠি অদৃশ্য হয়"], correctIndex: 0 },
    hint: "লাঠির কোণ স্লাইডার ডানদিকে টানো",
  },
  {
    id: 8,
    instruction: "পানির প্রতিসরাঙ্ক (n) ১.৫ বা তার বেশি করো।",
    targetMode: "stick", targetModeLabel: "পানিতে লাঠি",
    check: (s) => s.stickWaterN >= 1.5,
    quiz: { question: "পানির প্রতিসরাঙ্ক বেশি হলে লাঠি কেমন দেখায়?", options: ["বেশি বাঁকা", "কম বাঁকা", "সোজা", "অদৃশ্য"], correctIndex: 0 },
    hint: "পানির প্রতিসরাঙ্ক স্লাইডার ডানদিকে টানো",
  },
  {
    id: 9,
    instruction: "আপতন কোণ ৩০° থেকে ৪৫°-এর মধ্যে রাখো।",
    targetMode: "slab", targetModeLabel: "কাঁচের স্ল্যাব",
    check: (s) => s.angleDeg >= 30 && s.angleDeg <= 45,
    quiz: { question: "স্নেলের সূত্র অনুযায়ী কোনটি সঠিক?", options: ["n₁sinθ₁ = n₂sinθ₂", "n₁cosθ₁ = n₂cosθ₂", "n₁θ₁ = n₂θ₂", "n₁/θ₁ = n₂/θ₂"], correctIndex: 0 },
    hint: "আপতন কোণ মাঝামাঝি রাখো",
  },
  {
    id: 10,
    instruction: "লাঠিকে প্রায় খাড়া (কোণ ২০° বা কম) রাখো এবং বাঁকা কমে যাওয়া লক্ষ করো।",
    targetMode: "stick", targetModeLabel: "পানিতে লাঠি",
    check: (s) => s.stickAngleDeg <= 20,
    quiz: { question: "লাঠি প্রায় খাড়া (লম্ব) থাকলে বাঁকা দেখানোর প্রভাব কেমন হয়?", options: ["কম দেখা যায়", "বেশি দেখা যায়", "একই থাকে", "উল্টো দেখা যায়"], correctIndex: 0 },
    hint: "লাঠির কোণ স্লাইডার বামদিকে টানো (০-এর কাছে)",
  },
];

const REF_QUEST_EN: Record<number, { instruction: string; targetModeLabel: string; question: string; options: string[]; hint: string }> = {
  1: { instruction: "Set the angle of incidence (i) to 55° or more on the glass slab and watch the lateral shift.", targetModeLabel: "Glass Slab", question: "What happens to the lateral shift as the angle of incidence increases?", options: ["It increases", "It decreases", "It stays the same", "It becomes zero"], hint: "Drag the angle of incidence (i) slider to the right" },
  2: { instruction: "Set the glass slab's refractive index (n) to 1.7 or higher.", targetModeLabel: "Glass Slab", question: "How does light bend when the refractive index is higher?", options: ["Bends more", "Bends less", "Doesn't bend at all", "Changes colour"], hint: "Drag the refractive index (n) slider to the right" },
  3: { instruction: "Increase the slab's thickness to 140px or more.", targetModeLabel: "Glass Slab", question: "What happens to the lateral shift as the slab gets thicker?", options: ["It increases", "It decreases", "It stays the same", "It becomes zero"], hint: "Drag the thickness slider to the right" },
  4: { instruction: "Set the angle of incidence (i) to 15° or less — see what happens at a very small angle.", targetModeLabel: "Glass Slab", question: "When the angle of incidence is very small, what's the angle of refraction like?", options: ["Also very small", "Very large", "90°", "Zero"], hint: "Drag the angle of incidence slider to the left" },
  5: { instruction: "Add at least one light source to the prism and watch the dispersion.", targetModeLabel: "Prism", question: "How many colours does white light split into inside a prism?", options: ["3", "5", "7", "9"], hint: "Press \"Add Light\", then click on the canvas" },
  6: { instruction: "Add at least 2 light sources to the prism and compare their dispersion.", targetModeLabel: "Prism", question: "Which colour of light bends the most?", options: ["Red", "Green", "Violet", "Yellow"], hint: "Add another light source" },
  7: { instruction: "Set the stick's angle to 50° or more and see how bent it looks.", targetModeLabel: "Stick in Water", question: "What happens to the bent appearance as the stick's angle increases?", options: ["More visible", "Less visible", "No change", "The stick disappears"], hint: "Drag the stick-angle slider to the right" },
  8: { instruction: "Set the water's refractive index (n) to 1.5 or higher.", targetModeLabel: "Stick in Water", question: "How does the stick look when the water's refractive index is higher?", options: ["More bent", "Less bent", "Straight", "Invisible"], hint: "Drag the water refractive index slider to the right" },
  9: { instruction: "Keep the angle of incidence between 30° and 45°.", targetModeLabel: "Glass Slab", question: "Which of these correctly states Snell's Law?", options: ["n₁sinθ₁ = n₂sinθ₂", "n₁cosθ₁ = n₂cosθ₂", "n₁θ₁ = n₂θ₂", "n₁/θ₁ = n₂/θ₂"], hint: "Keep the angle of incidence roughly in the middle" },
  10: { instruction: "Keep the stick nearly vertical (angle 20° or less) and watch the bending effect shrink.", targetModeLabel: "Stick in Water", question: "What happens to the bent appearance when the stick is nearly vertical?", options: ["Less visible", "More visible", "No change", "It looks reversed"], hint: "Drag the stick-angle slider toward 0" },
};

// ============== LEARNING OUTCOMES ==============
interface LearningOutcome {
  mode: Mode;
  title: string;
  titleEn: string;
  message: string;
  messageEn: string;
  tips: string[];
  tipsEn: string[];
}

const LEARNING_OUTCOMES: Record<Mode, LearningOutcome> = {
  slab: {
    mode: "slab",
    title: "কাঁচের স্ল্যাব",
    titleEn: "Glass Slab",
    message: "কাঁচের স্ল্যাব দিয়ে আলো বাঁকা হয় কারণ বিভিন্ন মাধ্যমে আলোর গতি ভিন্ন।",
    messageEn: "Light bends through a glass slab because light travels at different speeds in different media.",
    tips: [
      "আলো ঘন মাধ্যমে প্রবেশ করলে গতি কমে এবং স্বাভাবিক থেকে দূরে সরে",
      "প্রতিসরণ সূত্র: n₁sin(i) = n₂sin(r) (স্নেলের সূত্র)",
      "সমান্তরাল স্ল্যাব থেকে বেরিয়ে আসা আলো আগের দিকে সমান্তরাল থাকে, শুধু স্থানান্তরিত হয়",
    ],
    tipsEn: [
      "Light slows and bends toward the normal when entering a denser medium",
      "Refraction formula: n₁sin(i) = n₂sin(r) (Snell's Law)",
      "Light exiting a parallel slab stays parallel — only laterally displaced",
    ],
  },
  prism: {
    mode: "prism",
    title: "প্রিজম",
    titleEn: "Prism",
    message: "প্রিজম আলোকে বিভিন্ন রঙে বিচ্ছুরিত করে কারণ বিভিন্ন রঙের তরঙ্গদৈর্ঘ্য ভিন্ন।",
    messageEn: "A prism disperses light into different colors because different colors have different wavelengths.",
    tips: [
      "বেগুনি আলো বেশি বাঁকে (কম তরঙ্গদৈর্ঘ্য), লাল আলো কম বাঁকে",
      "প্রিজম দিয়ে সাদা আলো বিচ্ছুরিত হয়ে রংধনুর রঙ তৈরি করে",
      "ন্যূনতম বিচ্লন কোণে প্রিজমের মধ্য দিয়ে আলো সমান কোণে প্রবেশ ও বেরিয়ে যায়",
    ],
    tipsEn: [
      "Violet bends more (shorter wavelength), red bends less",
      "White light through a prism creates rainbow colors",
      "At minimum deviation, light enters and exits the prism at equal angles",
    ],
  },
  stick: {
    mode: "stick",
    title: "জল ও লাঠি",
    titleEn: "Stick in Water",
    message: "পানিতে ডোবানো লাঠি বাঁকা দেখায় কারণ পানি ও বাতাসের প্রতিসরণাঙ্ক ভিন্ন।",
    messageEn: "A stick in water appears bent because water and air have different refractive indices.",
    tips: [
      "পানির প্রতিসরণাঙ্ক ≈ ১.৩৩, বাতাসের ≈ ১",
      "পানি থেকে বেরিয়ে আসা আলো বেঁকে যায়, যা লাঠিকে বাঁকা দেখায়",
      "এই প্রভাব তীরন্দাজ এবং মাছ ধরার সময় গুরুত্বপূর্ণ",
    ],
    tipsEn: [
      "Refractive index of water ≈ 1.33, air ≈ 1",
      "Light bends when exiting water, making the stick appear bent",
      "This effect matters in archery and fishing",
    ],
  },
};

const SPECTRUM = [
  { name: "বেগুনি", en: "Violet", color: "#B14BFF", n: 1.532 },
  { name: "নীল", en: "Indigo", color: "#6A5BFF", n: 1.528 },
  { name: "আসমানী", en: "Blue", color: "#3DA5FF", n: 1.525 },
  { name: "সবুজ", en: "Green", color: "#3BFF6B", n: 1.519 },
  { name: "হলুদ", en: "Yellow", color: "#FFE234", n: 1.517 },
  { name: "কমলা", en: "Orange", color: "#FF9A2E", n: 1.514 },
  { name: "লাল", en: "Red", color: "#FF3B3B", n: 1.510 },
];

const RAY_PRESET_COLORS = ["#FFFFFF", "#FFD166", "#06D6A0", "#EF476F", "#118AB2", "#F78C6B"];

type PrismRay = {
  id: number;
  // Source position normalized to canvas size (0..1) so it stays consistent on resize
  sx: number;
  sy: number;
};

const STYLES = `
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
  --c-primary: #1CAB55; --c-primary-deep: #17994B; --c-primary-container: #D0FAD0;
  --c-on-primary-container: #086347; --c-green-link: #149353; --c-green-cta: #37C25C;
  --c-nav-active-tint: #EAFEF2; --c-error: #DC2626; --c-alert-surface: #FEF2F2;
  --c-warning: #EAB308; --c-surface-blue: #EFF6FF;
}
.ref-root { font-family: 'Hind Siliguri','Inter',sans-serif; color: var(--ten-ink); background: var(--surface); min-height: 100vh; padding: 16px; box-sizing: border-box; line-height: 1.5; max-width: 361px; margin: 0 auto; }
@media (min-width: 768px) { .ref-root { max-width: 720px; padding: 24px; } }
@media (min-width: 1440px) { .ref-root { max-width: 1216px; } }
.ref-root *, .ref-root *::before, .ref-root *::after { box-sizing: border-box; }
.ref-header { background: #fff; border: 1px solid var(--border); border-radius: 12px; padding: 10px 12px; margin-bottom: 8px; border-top: 3px solid var(--ten-red); display: flex; align-items: center; gap: 10px; }
.ref-header .icon { width: 32px; height: 32px; background: #FFF5F6; border-radius: 8px; display: flex; align-items: center; justify-content: center; }
.ref-header .icon svg { width: 16px; height: 16px; color: var(--ten-red); }
.ref-header h1 { font-size: 14px; font-weight: 700; margin: 0; }
.ref-header p { font-size: 10px; color: var(--gray-500); margin: 0; font-family: 'Inter',sans-serif; }
.ref-card { background: var(--bg); border: 1px solid var(--border); border-radius: 12px; padding: 12px; margin-bottom: 10px; }
.experiment-row { display: flex; flex-direction: column; gap: 10px; margin-bottom: 10px; }
@media (min-width: 768px) { .experiment-row { flex-direction: row; } }
.experiment-canvas { flex: 1; min-width: 0; }
.canvas-card { padding: 8px; }
.tabs { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
.tab-btn { padding: 8px 6px; border: 1px solid var(--border); background: #fff; border-radius: 8px; font-weight: 700; font-size: 13px; color: var(--gray-600); cursor: pointer; transition: all 180ms; min-height: 44px; font-family: inherit; display: flex; align-items: center; justify-content: center; text-align: center; white-space: nowrap; }
.tab-btn.active { border-color: var(--ten-red); background: #FFF5F6; color: var(--ten-red); box-shadow: 0 0 0 2px rgba(232,0,29,0.06); }
.canvas-wrap { position: relative; width: 100%; background: #0B1220; border-radius: 10px; overflow: auto; max-height: 70vh; }
.canvas-wrap canvas { display: block; }
.action-row { display: flex; gap: 8px; margin-top: 10px; }
.anim-btn { flex: 1; min-height: 48px; padding: 12px 16px; border-radius: 12px; border: 1px solid var(--success-dark); background: var(--success); color: #fff; font-weight: 700; font-size: 15px; font-family: inherit; cursor: pointer; transition: all 180ms; box-shadow: 0 2px 8px rgba(28,171,85,0.25); display: flex; align-items: center; justify-content: center; gap: 8px; }
.anim-btn:active { transform: scale(0.98); }
.anim-btn.on { background: linear-gradient(135deg,#FF7B2A,#E8001D); border-color: #931212; box-shadow: 0 0 0 3px rgba(232,0,29,0.15), 0 4px 14px rgba(232,123,42,0.4); }
.anim-btn svg { width: 18px; height: 18px; }
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
@keyframes controlsToolkitIn {
  from { opacity: 0; transform: translateY(16px) scale(0.97); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}
.controls-toolkit-card {
  position: relative; max-height: 75vh; overflow-y: auto; padding: 16px; padding-top: 40px;
  animation: controlsToolkitIn 0.2s ease-out;
}
.controls-toolkit-card #ref-controls > * { margin-bottom: 10px; }
.controls-toolkit-card #ref-controls > *:last-child { margin-bottom: 0; }
@media (max-width: 767px) {
  .outcome-action-btn { width: 36px; min-height: 36px; border-radius: 10px; }
}
@keyframes congratsBdIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes congratsCardIn { from { transform: translateY(24px) scale(0.97); opacity: 0; } to { transform: translateY(0) scale(1); opacity: 1; } }
.congrats-modal-bd {
  position: fixed; inset: 0; z-index: 9500; background: rgba(17,24,39,0.65);
  backdrop-filter: blur(5px); display: flex; align-items: center; justify-content: center;
  padding: 16px; animation: congratsBdIn 0.2s ease-out;
}
.congrats-modal-card {
  position: relative; background: #fff; border-radius: 24px; padding: 32px;
  width: 100%; max-width: min(720px, 96vw); max-height: 92vh; overflow-y: auto;
  box-shadow: 0 25px 60px rgba(0,0,0,0.25); animation: congratsCardIn 0.3s cubic-bezier(0.16,1,0.3,1);
  font-family: inherit;
}
@media (max-width: 600px) {
  .congrats-modal-bd { padding: 0; }
  .congrats-modal-card { max-width: 100%; width: 100%; height: 100%; max-height: 100%; border-radius: 0; padding: 24px 18px; }
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
.congrats-learn-body { font-size: 13px; color: #4B5563; line-height: 1.6; margin: 0 0 10px; }
.congrats-usecase-btn {
  width: 100%; padding: 13px 16px; border-radius: 14px; border: 1px solid #C2410C;
  background: linear-gradient(135deg,#FFB347,#FF6B35,#E8001D); color: #fff;
  font-weight: 800; font-size: 14px; font-family: inherit; cursor: pointer;
  box-shadow: 0 3px 12px rgba(232,107,53,0.35); transition: all 200ms;
}
.congrats-usecase-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 18px rgba(232,107,53,0.5); }
.congrats-hint-box { background: var(--c-surface-blue); border: 1px solid #BFDBFE; border-radius: 14px; padding: 16px; margin-bottom: 16px; }
.congrats-hint-row { display: flex; align-items: center; gap: 10px; font-size: 13px; font-weight: 700; color: #111827; padding: 4px 0; }
.congrats-hint-icon { flex-shrink: 0; width: 26px; height: 26px; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #fff; }
.congrats-hint-icon.learning { background: var(--c-primary); }
.congrats-hint-icon.usecase { background: linear-gradient(135deg,#FFB347,#FF6B35,#E8001D); }
.congrats-hint-text { font-size: 12px; color: #374151; line-height: 1.6; margin: 8px 0 0; }
@keyframes pulseHighlight {
  0%, 100% { box-shadow: 0 0 0 0 rgba(28,171,85,0.5); transform: scale(1); }
  50% { box-shadow: 0 0 0 10px rgba(28,171,85,0); transform: scale(1.08); }
}
.pulse-highlight { animation: pulseHighlight 0.9s ease-in-out 3; }
.add-btn { min-height: 40px; padding: 8px 12px; border-radius: 10px; border: 1px solid var(--ten-red-dark); background: var(--ten-red); color: #fff; font-weight: 700; font-size: 13px; font-family: inherit; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; }
.add-btn svg { width: 14px; height: 14px; }
.del-btn { background: transparent; border: none; cursor: pointer; color: var(--gray-500); padding: 4px; border-radius: 6px; }
.del-btn:hover { color: var(--c-error); background: var(--c-alert-surface); }
.del-btn svg { width: 16px; height: 16px; }
.slider-row { margin-bottom: 14px; }
.slider-row:last-child { margin-bottom: 0; }
.slider-row label { display: flex; justify-content: space-between; font-size: 13px; font-weight: 600; margin-bottom: 4px; }
.slider-row .val { color: var(--ten-red); font-family: 'Inter',sans-serif; }
input[type="range"] { -webkit-appearance: none; appearance: none; width: 100%; height: 36px; background: transparent; cursor: pointer; }
input[type="range"]::-webkit-slider-runnable-track { height: 6px; background: var(--gray-200); border-radius: 999px; }
input[type="range"]::-moz-range-track { height: 6px; background: var(--gray-200); border-radius: 999px; }
input[type="range"]::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; height: 20px; width: 20px; border-radius: 50%; background: var(--success); border: 2px solid #fff; box-shadow: 0 2px 6px rgba(0,0,0,0.2); margin-top: -7px; }
input[type="range"]::-moz-range-thumb { height: 20px; width: 20px; border-radius: 50%; background: var(--success); border: 2px solid #fff; box-shadow: 0 2px 6px rgba(0,0,0,0.2); }
input[type="range"]:focus { outline: none; }
.formula-card { padding: 16px; }
.formula-display { display: flex; align-items: center; justify-content: center; gap: 12px; padding: 16px; background: var(--c-nav-active-tint); border-radius: 12px; margin-bottom: 12px; flex-wrap: wrap; }
.fraction { display: inline-flex; flex-direction: column; align-items: center; position: relative; padding: 0 4px; }
.fraction .num { font-family: 'Inter',serif; font-weight: 700; font-size: 18px; line-height: 1.2; border-bottom: 2px solid var(--ten-ink); padding-bottom: 2px; min-width: 36px; text-align: center; }
.fraction .den { font-family: 'Inter',serif; font-weight: 600; font-size: 18px; line-height: 1.2; color: var(--ten-red); padding-top: 2px; min-width: 36px; text-align: center; }
.op { font-family: 'Inter',serif; font-size: 22px; font-weight: 700; color: var(--gray-600); }
.data-rows { }
.data-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 14px; border-bottom: 1px dashed var(--gray-200); gap: 8px; }
.data-row:last-child { border-bottom: none; }
.data-row .k { color: var(--gray-600); }
.data-row .v { font-weight: 700; font-family: 'Inter',sans-serif; text-align: right; }
.data-row .v.bn { font-family: 'Hind Siliguri',sans-serif; }
.explain-card { background: var(--c-nav-active-tint); border: 1px solid var(--c-primary-container); padding: 16px; }
.explain-header { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
.explain-header svg { width: 20px; height: 20px; color: var(--c-on-primary-container); flex-shrink: 0; }
.explain-title { font-weight: 700; font-size: 15px; color: var(--c-on-primary-container); }
.explain-body { font-size: 14px; line-height: 1.7; color: var(--ten-ink); }
.spectrum-row { display: flex; align-items: center; gap: 8px; padding: 4px 0; font-size: 12px; border-bottom: 1px dashed var(--gray-200); }
.spectrum-row:last-child { border-bottom: none; }
.spectrum-swatch { width: 14px; height: 12px; border-radius: 2px; flex-shrink: 0; }
.spectrum-name { font-weight: 600; min-width: 50px; }
.spectrum-n { font-family: 'Inter',sans-serif; color: var(--gray-600); }
.spectrum-dev { font-family: 'Inter',sans-serif; color: var(--ten-red); font-weight: 600; margin-left: auto; }
.ray-card { border: 1px solid var(--border); border-radius: 10px; padding: 10px; margin-bottom: 8px; background: #fff; }
.ray-card.active { border-color: var(--ten-red); box-shadow: 0 0 0 2px rgba(232,0,29,0.08); }
.ray-card-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; gap: 8px; }
.ray-tag { display: inline-flex; align-items: center; gap: 6px; font-weight: 700; font-size: 13px; }
.ray-dot { width: 12px; height: 12px; border-radius: 50%; box-shadow: 0 0 6px currentColor; }
.controls-title { font-weight: 700; font-size: 13px; color: var(--ten-red); margin-bottom: 8px; display: flex; align-items: center; justify-content: space-between; }
.section-title { font-weight: 700; font-size: 14px; margin-bottom: 10px; color: var(--ten-ink); }
.calc-grid { display: grid; grid-template-columns: 1fr; gap: 10px; }
@media (min-width: 768px) { .calc-grid { grid-template-columns: 1fr 1fr; } }
.calc-block { border: 1px solid var(--border); border-radius: 10px; padding: 10px; background: #FAFAFB; }
.calc-block-head { display: flex; align-items: center; gap: 6px; font-weight: 700; font-size: 13px; margin-bottom: 6px; }

/* Learning Outcomes Section */
.learning-outcomes-section { background: var(--c-surface-blue); border: 1.5px solid #BFDBFE; border-left: 4px solid var(--c-primary); }
.learning-header { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; }
.learning-icon { color: var(--c-primary); display: flex; align-items: center; }
.learning-title { font-size: 13px; font-weight: 700; color: var(--ten-ink); margin: 0; }
.learning-message { font-size: 13px; color: var(--gray-600); line-height: 1.6; margin-bottom: 12px; margin-top: 6px; }
.learning-tips-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
@media (max-width: 600px) { .learning-tips-grid { grid-template-columns: 1fr; } }
.learning-tip-item { display: flex; gap: 8px; padding: 8px; background: rgba(255,255,255,0.6); border-radius: 8px; font-size: 12px; color: var(--gray-600); line-height: 1.4; align-items: flex-start; }
.tip-icon { flex-shrink: 0; width: 20px; height: 20px; border-radius: 50%; background: var(--c-primary); color: #fff; font-weight: 700; font-size: 11px; display: flex; align-items: center; justify-content: center; }
.tip-text { flex: 1; }
.math { font-family: 'Inter', serif; font-style: italic; font-weight: 600; }
.math-frac { display: inline-flex; flex-direction: column; align-items: center; vertical-align: middle; padding: 0 4px; font-size: 0.85em; line-height: 1.1; }
.math-frac .num { border-bottom: 1px solid currentColor; width: 100%; text-align: center; padding: 0 2px; }
.math-frac .den { width: 100%; text-align: center; padding: 0 2px; }
.math-sup { vertical-align: super; font-size: 0.75em; }
.math-sub { vertical-align: sub; font-size: 0.75em; }

/* ============== ASSESSMENT (ported from RayOptics for consistency) ============== */
@keyframes pulse-glow {
  0%, 100% { transform: scale(1); filter: brightness(1); }
  50% { transform: scale(1.2); filter: brightness(1.3); }
}
@keyframes fadeSlideIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
.assessment-cta-wrap { display: flex; flex-direction: column; align-items: flex-end; gap: 5px; }
.assessment-cta-hint { font-size: 10.5px; font-weight: 600; color: var(--gray-500); text-align: right; max-width: 160px; line-height: 1.35; }
@media (max-width: 540px) { .assessment-cta-hint { font-size: 9.5px; max-width: 110px; } }
.lab-test-btn { padding: 6px 12px; background: linear-gradient(135deg, #FF6B35, #E8001D); color: #fff; border: none; border-radius: 999px; font-size: 12px; font-weight: 700; font-family: inherit; cursor: pointer; white-space: nowrap; box-shadow: 0 2px 8px rgba(232,0,29,0.25); transition: all 200ms; min-height: 36px; display: inline-flex; align-items: center; gap: 4px; }
.lab-test-btn:hover { transform: scale(1.05); box-shadow: 0 4px 14px rgba(232,0,29,0.35); }
.lab-test-btn.active { background: var(--c-primary); box-shadow: 0 0 0 3px rgba(28,171,85,0.22), 0 4px 14px rgba(28,171,85,0.4); }
.lab-test-btn.active:hover { background: var(--c-primary-deep); box-shadow: 0 0 0 3px rgba(28,171,85,0.28), 0 6px 18px rgba(28,171,85,0.5); }
.quest-mode-hint { background: var(--gray-100); color: #92730B; padding: 10px 14px; border-radius: 10px; font-size: 13px; margin-bottom: 8px; border: 1px solid var(--c-warning); }
.quest-mode-ok { background: var(--c-primary-container); color: var(--c-on-primary-container); padding: 10px 14px; border-radius: 10px; font-size: 13px; margin-bottom: 8px; border: 1px solid var(--c-primary); }
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
.lab-floating-panel { position: fixed; right: 16px; bottom: 16px; z-index: 850; max-width: 340px; width: calc(100vw - 32px); }
.lab-panel-card { position: relative; max-height: 70vh; overflow-y: auto; box-shadow: 0 10px 30px rgba(0,0,0,0.18); padding-right: 44px; }
.lab-panel-minimize-btn {
  position: absolute; top: 10px; right: 10px; width: 28px; height: 28px; border-radius: 50%;
  border: none; background: rgba(255,255,255,0.7); color: #6B7280; cursor: pointer;
  display: flex; align-items: center; justify-content: center; transition: all 150ms; z-index: 2;
}
.lab-panel-minimize-btn:hover { background: #fff; color: #374151; }
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
.quiz-card { animation: fadeSlideIn 0.3s ease-out; background: var(--bg); border: 1px solid var(--border); }
.quiz-header { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; }
.quiz-icon { font-size: 28px; color: var(--c-primary); display: flex; align-items: center; }
.quiz-round { font-size: 13px; font-weight: 700; color: var(--c-primary); }
.quiz-question { font-size: 15px; font-weight: 700; line-height: 1.6; margin-bottom: 14px; }
.quiz-options { display: flex; flex-direction: column; gap: 8px; }
.quiz-option { display: flex; align-items: center; gap: 10px; padding: 12px 14px; background: #fff; border: 2px solid var(--border); border-radius: 12px; font-size: 14px; font-family: inherit; cursor: pointer; transition: all 200ms; text-align: left; min-height: 48px; }
.quiz-option:hover:not(:disabled) { border-color: var(--c-primary); background: var(--c-nav-active-tint); }
.quiz-option.correct { border-color: var(--c-primary); background: var(--c-primary-container); }
.quiz-option.wrong { border-color: var(--c-error); background: var(--c-alert-surface); }
.opt-letter { width: 26px; height: 26px; border-radius: 50%; background: var(--gray-100); display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 12px; color: var(--gray-600); flex-shrink: 0; font-family: 'Inter',sans-serif; }
.quiz-option.correct .opt-letter { background: var(--c-primary); color: #fff; }
.quiz-option.wrong .opt-letter { background: var(--c-error); color: #fff; }
.quiz-feedback { text-align: center; padding: 10px; margin-top: 10px; border-radius: 10px; font-weight: 700; font-size: 14px; animation: fadeSlideIn 0.3s ease-out; }
.quiz-feedback.correct { background: var(--c-primary-container); color: var(--c-on-primary-container); }
.quiz-feedback.wrong { background: var(--c-alert-surface); color: var(--c-error); }
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
`;

function refract(
  d: { x: number; y: number },
  nOut: { x: number; y: number },
  eta: number
) {
  let nn = nOut;
  let cosI = -(d.x * nn.x + d.y * nn.y);
  if (cosI < 0) { nn = { x: -nn.x, y: -nn.y }; cosI = -cosI; }
  const sin2T = eta * eta * (1 - cosI * cosI);
  if (sin2T > 1) return null;
  const cosT = Math.sqrt(1 - sin2T);
  return {
    x: eta * d.x + (eta * cosI - cosT) * nn.x,
    y: eta * d.y + (eta * cosI - cosT) * nn.y,
  };
}

function angBetween(a: { x: number; y: number }, b: { x: number; y: number }) {
  const dot = Math.max(-1, Math.min(1, a.x * b.x + a.y * b.y));
  return (Math.acos(dot) * 180) / Math.PI;
}

function intersectSeg(
  O: { x: number; y: number },
  D: { x: number; y: number },
  A: { x: number; y: number },
  B: { x: number; y: number }
) {
  const ex = B.x - A.x, ey = B.y - A.y;
  const denom = D.x * ey - D.y * ex;
  if (Math.abs(denom) < 1e-9) return null;
  const s = ((A.x - O.x) * ey - (A.y - O.y) * ex) / denom;
  const t = ((A.x - O.x) * D.y - (A.y - O.y) * D.x) / denom;
  if (s > 1e-4 && t >= -1e-4 && t <= 1 + 1e-4) return s;
  return null;
}

const REF_PATH_TO_MODE: Record<string, Mode> = {
  "/refraction/slab": "slab",
  "/refraction/prism": "prism",
  "/refraction/stick": "stick",
};
const REF_MODE_TO_PATH: Record<Mode, string> = {
  slab: "/refraction/slab",
  prism: "/refraction/prism",
  stick: "/refraction/stick",
};

const Refraction = ({ hideNav = false, celebrateSignal }: { hideNav?: boolean; celebrateSignal?: number }) => {
  const { t, lang } = useLang();
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const queryMode = searchParams.get("mode") as Mode;
  const initialMode: Mode = queryMode && Object.values(REF_PATH_TO_MODE).includes(queryMode)
    ? queryMode
    : (REF_PATH_TO_MODE[location.pathname] ?? "slab");
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const [mode, setMode] = useState<Mode>(initialMode);

  useEffect(() => {
    const qm = searchParams.get("mode") as Mode;
    if (qm && qm !== mode) {
      setMode(qm);
    } else {
      const m = REF_PATH_TO_MODE[location.pathname];
      if (m && m !== mode) setMode(m);
    }
  }, [location.pathname, searchParams]);

  const [angleDeg, setAngleDeg] = useState(() => {
    const q = searchParams.get("angle");
    return q ? parseInt(q) : 35;
  });
  const [n, setN] = useState(() => {
    const q = searchParams.get("n");
    return q ? parseFloat(q) : 1.5;
  });
  const [thickness, setThickness] = useState(() => {
    const q = searchParams.get("t");
    const parsed = q ? parseInt(q) : 45;
    // 160 was the old default — treat it as if no param was set
    return parsed === 160 ? 45 : parsed;
  });
  const [animate, setAnimate] = useState(true);
  const [showLearningModal, setShowLearningModal] = useState(false);
  const [showExplainModal, setShowExplainModal] = useState(false);
  const [showCongrats, setShowCongrats] = useState(false);
  const [highlightActionButtons, setHighlightActionButtons] = useState(false);
  // Sliders/controls live in an on-demand floating toolkit now instead of a
  // permanent side panel — collapsed by default so the canvas gets the
  // full screen; tap the toolkit button to open it.
  const [showControlsPanel, setShowControlsPanel] = useState(false);
  const closeCongrats = () => {
    setShowCongrats(false);
    setHighlightActionButtons(true);
    setTimeout(() => setHighlightActionButtons(false), 3000);
  };

  // ============== ASSESSMENT STATE ==============
  const [labMode, setLabMode] = useState<"off" | "name" | "playing" | "quiz" | "result">("off");
  const [playerName, setPlayerName] = useState("");
  const [labScore, setLabScore] = useState(0);
  const [labRound, setLabRound] = useState(0);
  const [labQuests, setLabQuests] = useState<RefQuest[]>([]);
  const [questCompleted, setQuestCompleted] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answerResult, setAnswerResult] = useState<"correct" | "wrong" | null>(null);
  const [labPanelMinimized, setLabPanelMinimized] = useState(false);
  useEffect(() => {
    if (labMode === "playing" || labMode === "quiz") setLabPanelMinimized(false);
  }, [labMode, labRound]);
  const tq = (quest: RefQuest) => (lang === "en" && REF_QUEST_EN[quest.id]) ? REF_QUEST_EN[quest.id] : { instruction: quest.instruction, targetModeLabel: quest.targetModeLabel, question: quest.quiz.question, options: quest.quiz.options, hint: quest.hint };
  // Only pop the congrats modal when celebrateSignal actually increments —
  // not on every fresh mount (e.g. switching back to this tab), where the
  // prop would already be carrying a stale nonzero value from before.
  const seenCelebrateSignalRef = useRef(celebrateSignal);
  useEffect(() => {
    if (celebrateSignal && celebrateSignal !== seenCelebrateSignalRef.current) {
      setShowCongrats(true);
    }
    seenCelebrateSignalRef.current = celebrateSignal;
  }, [celebrateSignal]);
  const tRef = useRef(0);
  const [animProgress, setAnimProgress] = useState(0);
  const animProgressRef = useRef(0);

  // Stick-in-water controls
  const [stickAngleDeg, setStickAngleDeg] = useState(55); // angle of stick from vertical (0 = straight down, 90 = flat)
  const [stickWaterN, setStickWaterN] = useState(1.33);
  const [stickSubmerged, setStickSubmerged] = useState(170); // submerged length in px

  // Multiple rays for prism
  const [rays, setRays] = useState<PrismRay[]>([
    { id: 1, sx: 0.12, sy: 0.35 },
  ]);
  const nextRayId = useRef(2);

  // Per-ray, per-color deviation results (for under-canvas display)
  const [rayResults, setRayResults] = useState<
    { id: number; theta_i: number; deviations: number[] }[]
  >([]);

  // Sync search params when state changes
  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    params.set("mode", mode);
    params.set("angle", angleDeg.toString());
    params.set("n", n.toFixed(2));
    params.set("t", thickness.toString());

    // Only update if something actually changed to avoid infinite loops
    if (params.toString() !== searchParams.toString()) {
      setSearchParams(params, { replace: true });
    }
  }, [mode, angleDeg, n, thickness, setSearchParams, searchParams]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    let initialScrollDone = false;
    const fit = () => {
      const container = canvas.parentElement;
      if (!container) return;
      const isMobile = window.innerWidth < 768;
      // On mobile: fit exactly to container width; on desktop: minimum 800px with horizontal scroll
      const w = isMobile ? container.clientWidth : Math.max(container.clientWidth, 800);
      // Taller on mobile — the controls toolkit is off-canvas on demand now
      // instead of a permanent side panel, so the simulation itself can
      // take up more of the screen.
      const h = isMobile ? Math.max(400, Math.round(w * 1.1)) : 480;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;

      if (!isMobile && !initialScrollDone && container.clientWidth < w) {
        container.scrollLeft = (w - container.clientWidth) / 2;
        initialScrollDone = true;
      }
    };
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, [mode]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const dpr = window.devicePixelRatio || 1;

    const draw = () => {
      const W = canvas.width / dpr;
      const H = canvas.height / dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const bg = ctx.createLinearGradient(0, 0, 0, H);
      bg.addColorStop(0, "#0a0a18");
      bg.addColorStop(1, "#1a1530");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      ctx.fillStyle = "rgba(255,255,255,0.25)";
      for (let i = 0; i < 60; i++) {
        const sx = (i * 97) % W;
        const sy = (i * 53) % H;
        ctx.fillRect(sx, sy, 1, 1);
      }

      if (mode === "slab") drawSlab(ctx, W, H);
      else if (mode === "prism") drawPrism(ctx, W, H);
      else drawStick(ctx, W, H);
    };

    const drawSlab = (ctx: CanvasRenderingContext2D, W: number, H: number) => {
      const cy = H / 2;
      const slabLeft = W / 2 - thickness / 2;
      const slabRight = W / 2 + thickness / 2;
      const slabTop = H * 0.35;
      const slabBot = H * 0.65;

      const grad = ctx.createLinearGradient(slabLeft, 0, slabRight, 0);
      grad.addColorStop(0, "rgba(140,200,255,0.10)");
      grad.addColorStop(0.5, "rgba(180,220,255,0.22)");
      grad.addColorStop(1, "rgba(140,200,255,0.10)");
      ctx.fillStyle = grad;
      ctx.strokeStyle = "rgba(180,220,255,0.55)";
      ctx.lineWidth = 1.5;
      ctx.fillRect(slabLeft, slabTop, thickness, slabBot - slabTop);
      ctx.strokeRect(slabLeft, slabTop, thickness, slabBot - slabTop);

      ctx.fillStyle = "rgba(255,255,255,0.45)";
      ctx.font = "12px Inter, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(`${t("কাঁচের স্ল্যাব", "Glass Slab")}  (n = ${n.toFixed(2)})`, (slabLeft + slabRight) / 2, slabTop - 10);

      const theta1 = (angleDeg * Math.PI) / 180;
      const sinTheta2 = Math.sin(theta1) / n;
      const theta2 = Math.asin(Math.max(-1, Math.min(1, sinTheta2)));

      const entryX = slabLeft;
      const entryY = cy;
      const inDist = W * 0.38;
      const outDist = W * 0.38;
      const rayStartX = entryX - inDist;
      const rayStartY = entryY - inDist * Math.tan(theta1);
      const insideDx = thickness;
      const insideDy = thickness * Math.tan(theta2);
      const exitX = entryX + insideDx;
      const exitY = entryY + insideDy;
      const outDx = outDist;
      const outDy = outDist * Math.tan(theta1);
      const outEndX = exitX + outDx;
      const outEndY = exitY + outDy;

      const dashOffset = animate ? -(tRef.current * 0.03) : 0;
      const prog = animProgressRef.current;

      const normalLen = H * 0.18;
      ctx.strokeStyle = "rgba(255,255,255,0.25)";
      ctx.setLineDash([4, 4]);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(entryX, entryY - normalLen);
      ctx.lineTo(entryX, entryY + normalLen);
      ctx.moveTo(exitX, exitY - normalLen);
      ctx.lineTo(exitX, exitY + normalLen);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.strokeStyle = "rgba(255,255,255,0.18)";
      ctx.setLineDash([2, 5]);
      ctx.beginPath();
      ctx.moveTo(entryX, entryY);
      const ghostEndX = outEndX;
      const ghostEndY = entryY + (ghostEndX - entryX) * Math.tan(theta1);
      ctx.lineTo(ghostEndX, ghostEndY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Progressive ray drawing: 3 segments, each takes 1/3 of progress
      const seg1Len = Math.hypot(entryX - rayStartX, entryY - rayStartY);
      const seg2Len = Math.hypot(exitX - entryX, exitY - entryY);
      const seg3Len = Math.hypot(outEndX - exitX, outEndY - exitY);
      const totalLen = seg1Len + seg2Len + seg3Len;
      const allowed = prog * totalLen;

      const drawProgressiveRay = (x1: number, y1: number, x2: number, y2: number, consumed: number): number => {
        const segL = Math.hypot(x2 - x1, y2 - y1);
        if (consumed >= allowed) return consumed;
        const take = Math.min(segL, allowed - consumed);
        const t = take / segL;
        const ex = x1 + (x2 - x1) * t;
        const ey = y1 + (y2 - y1) * t;
        ctx.save();
        ctx.shadowColor = "rgba(255,235,150,0.8)";
        ctx.shadowBlur = 14;
        ctx.strokeStyle = "rgba(255,235,150,0.95)";
        ctx.lineWidth = 2.2;
        ctx.setLineDash([10, 6]);
        ctx.lineDashOffset = dashOffset;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(ex, ey);
        ctx.stroke();
        ctx.restore();
        // Draw a bright dot at the leading edge
        if (t < 1 && t > 0) {
          ctx.save();
          ctx.shadowColor = "rgba(255,255,200,1)";
          ctx.shadowBlur = 20;
          ctx.fillStyle = "#fff";
          ctx.beginPath();
          ctx.arc(ex, ey, 4, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
        return consumed + segL;
      };

      let consumed = 0;
      consumed = drawProgressiveRay(rayStartX, rayStartY, entryX, entryY, consumed);
      consumed = drawProgressiveRay(entryX, entryY, exitX, exitY, consumed);
      consumed = drawProgressiveRay(exitX, exitY, outEndX, outEndY, consumed);

      // Lateral shift indicator (only show when ray is complete)
      if (prog > 0.95) {
        ctx.strokeStyle = "rgba(255,120,180,0.85)";
        ctx.lineWidth = 1.5;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(outEndX, ghostEndY);
        ctx.lineTo(outEndX, outEndY);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      ctx.fillStyle = "rgba(255,255,255,0.85)";
      ctx.font = "bold 13px Inter, sans-serif";
      ctx.textAlign = "right";
      ctx.fillText(`i = ${angleDeg}°`, entryX - 8, entryY - 8);
      ctx.textAlign = "left";
      ctx.fillText(`r = ${((theta2 * 180) / Math.PI).toFixed(1)}°`, entryX + 8, entryY + 18);
    };

    const drawPrism = (ctx: CanvasRenderingContext2D, W: number, H: number) => {
      const cx = W / 2;
      const cy = H / 2;
      const size = Math.min(W, H) * (W < 500 ? 0.25 : 0.38);

      const depth3D = size * 0.18;
      const apex = { x: cx, y: cy - size * 0.55 };
      const left = { x: cx - size * 0.5, y: cy + size * 0.32 };
      const right = { x: cx + size * 0.5, y: cy + size * 0.32 };

      const apexB = { x: apex.x + depth3D, y: apex.y - depth3D * 0.5 };
      const leftB = { x: left.x + depth3D, y: left.y - depth3D * 0.5 };
      const rightB = { x: right.x + depth3D, y: right.y - depth3D * 0.5 };

      // Back face
      ctx.save();
      const bgGrad = ctx.createLinearGradient(leftB.x, leftB.y, rightB.x, rightB.y);
      bgGrad.addColorStop(0, "rgba(100,140,200,0.08)");
      bgGrad.addColorStop(0.5, "rgba(120,160,220,0.15)");
      bgGrad.addColorStop(1, "rgba(100,140,200,0.08)");
      ctx.fillStyle = bgGrad;
      ctx.strokeStyle = "rgba(180,210,255,0.3)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(apexB.x, apexB.y);
      ctx.lineTo(leftB.x, leftB.y);
      ctx.lineTo(rightB.x, rightB.y);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      // Right face
      ctx.save();
      const sideGrad = ctx.createLinearGradient(right.x, right.y, rightB.x, rightB.y);
      sideGrad.addColorStop(0, "rgba(140,180,240,0.18)");
      sideGrad.addColorStop(1, "rgba(100,140,200,0.10)");
      ctx.fillStyle = sideGrad;
      ctx.strokeStyle = "rgba(180,210,255,0.4)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(right.x, right.y);
      ctx.lineTo(rightB.x, rightB.y);
      ctx.lineTo(apexB.x, apexB.y);
      ctx.lineTo(apex.x, apex.y);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      // Bottom face
      ctx.save();
      const botGrad = ctx.createLinearGradient(left.x, left.y, leftB.x, leftB.y);
      botGrad.addColorStop(0, "rgba(120,160,220,0.12)");
      botGrad.addColorStop(1, "rgba(80,120,180,0.06)");
      ctx.fillStyle = botGrad;
      ctx.strokeStyle = "rgba(180,210,255,0.3)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(left.x, left.y);
      ctx.lineTo(leftB.x, leftB.y);
      ctx.lineTo(rightB.x, rightB.y);
      ctx.lineTo(right.x, right.y);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      // Front face
      ctx.save();
      const pg = ctx.createLinearGradient(left.x, left.y, right.x, right.y);
      pg.addColorStop(0, "rgba(180,210,255,0.10)");
      pg.addColorStop(0.5, "rgba(220,235,255,0.28)");
      pg.addColorStop(1, "rgba(180,210,255,0.10)");
      ctx.fillStyle = pg;
      ctx.strokeStyle = "rgba(220,235,255,0.7)";
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(apex.x, apex.y);
      ctx.lineTo(left.x, left.y);
      ctx.lineTo(right.x, right.y);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      // 3D edge highlights
      ctx.save();
      ctx.strokeStyle = "rgba(255,255,255,0.15)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(apex.x, apex.y);
      ctx.lineTo(apexB.x, apexB.y);
      ctx.moveTo(right.x, right.y);
      ctx.lineTo(rightB.x, rightB.y);
      ctx.moveTo(left.x, left.y);
      ctx.lineTo(leftB.x, leftB.y);
      ctx.stroke();
      ctx.restore();

      const centroid = {
        x: (apex.x + left.x + right.x) / 3,
        y: (apex.y + left.y + right.y) / 3,
      };
      const outwardNormal = (a: { x: number; y: number }, b: { x: number; y: number }) => {
        const ex = b.x - a.x, ey = b.y - a.y;
        const cand = { x: -ey, y: ex };
        const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
        const toC = { x: centroid.x - mid.x, y: centroid.y - mid.y };
        const dot = cand.x * toC.x + cand.y * toC.y;
        const nn = dot < 0 ? cand : { x: ey, y: -ex };
        const L = Math.hypot(nn.x, nn.y);
        return { x: nn.x / L, y: nn.y / L };
      };
      const nLeft = outwardNormal(apex, left);
      const nRight = outwardNormal(apex, right);
      const nBottom = outwardNormal(left, right);

      const dashOffset = animate ? -(tRef.current * 0.02) : 0;
      const tNorm = (Math.sin(tRef.current * 0.012) + 1) / 2;

      const results: { id: number; theta_i: number; deviations: number[] }[] = [];

      // Helper to find which face the source-to-prism ray actually hits.
      const faces: { a: { x: number; y: number }; b: { x: number; y: number }; n: { x: number; y: number } }[] = [
        { a: apex, b: left, n: nLeft },
        { a: apex, b: right, n: nRight },
        { a: left, b: right, n: nBottom },
      ];

      rays.forEach((ray) => {
        const inStart = { x: ray.sx * W, y: ray.sy * H };

        // Aim ray from source toward prism centroid as a sensible default direction.
        const aim = { x: centroid.x - inStart.x, y: centroid.y - inStart.y };
        const aimLen = Math.hypot(aim.x, aim.y) || 1;
        const incDir = { x: aim.x / aimLen, y: aim.y / aimLen };

        // Find nearest face hit
        let bestS = Infinity;
        let hit: { x: number; y: number } | null = null;
        let entryNormal: { x: number; y: number } | null = null;
        for (const f of faces) {
          const s = intersectSeg(inStart, incDir, f.a, f.b);
          if (s !== null && s < bestS) {
            bestS = s;
            hit = { x: inStart.x + incDir.x * s, y: inStart.y + incDir.y * s };
            entryNormal = f.n;
          }
        }
        if (!hit || !entryNormal) {
          // Source is inside or ray misses prism — just draw a stub
          ctx.save();
          ctx.fillStyle = "#fff";
          ctx.beginPath();
          ctx.arc(inStart.x, inStart.y, 5, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
          results.push({ id: ray.id, theta_i: 0, deviations: SPECTRUM.map(() => NaN) });
          return;
        }

        // White incoming beam — progressive
        const prog = animProgressRef.current;
        const incLen = Math.hypot(hit.x - inStart.x, hit.y - inStart.y);
        const incTake = Math.min(1, prog * 3); // first 1/3 of progress for incoming
        const incEndX = inStart.x + (hit.x - inStart.x) * incTake;
        const incEndY = inStart.y + (hit.y - inStart.y) * incTake;
        ctx.save();
        ctx.shadowColor = "rgba(255,255,255,0.85)";
        ctx.shadowBlur = 18;
        ctx.strokeStyle = "rgba(255,255,255,0.55)";
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(inStart.x, inStart.y);
        ctx.lineTo(incEndX, incEndY);
        ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.strokeStyle = "rgba(255,255,255,1)";
        ctx.lineWidth = 1.8;
        ctx.setLineDash([10, 6]);
        ctx.lineDashOffset = dashOffset;
        ctx.beginPath();
        ctx.moveTo(inStart.x, inStart.y);
        ctx.lineTo(incEndX, incEndY);
        ctx.stroke();
        ctx.restore();
        // Leading dot
        if (incTake < 1 && incTake > 0) {
          ctx.save();
          ctx.shadowColor = "rgba(255,255,255,1)";
          ctx.shadowBlur = 20;
          ctx.fillStyle = "#fff";
          ctx.beginPath();
          ctx.arc(incEndX, incEndY, 4, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }

        // Source dot (the "lamp")
        ctx.save();
        ctx.shadowColor = colorFor(ray.id);
        ctx.shadowBlur = 16;
        ctx.fillStyle = colorFor(ray.id);
        ctx.beginPath();
        ctx.arc(inStart.x, inStart.y, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#fff";
        ctx.beginPath();
        ctx.arc(inStart.x, inStart.y, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Normal at hit (along entryNormal)
        ctx.save();
        ctx.strokeStyle = "rgba(255,255,255,0.30)";
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(hit.x - entryNormal.x * 50, hit.y - entryNormal.y * 50);
        ctx.lineTo(hit.x + entryNormal.x * 50, hit.y + entryNormal.y * 50);
        ctx.stroke();
        ctx.restore();

        const negInc = { x: -incDir.x, y: -incDir.y };
        const theta_i_deg = angBetween(negInc, entryNormal);

        // Ray label
        ctx.save();
        ctx.fillStyle = "rgba(255,255,255,0.95)";
        ctx.font = "bold 11px Inter, sans-serif";
        ctx.textAlign = "left";
        ctx.fillText(`R${ray.id}  i=${theta_i_deg.toFixed(0)}°`, inStart.x + 10, inStart.y - 8);
        ctx.restore();

        const deviations: number[] = [];

        SPECTRUM.forEach((c) => {
          const dIn = refract(incDir, entryNormal!, 1 / c.n);
          if (!dIn) { deviations.push(NaN); return; }

          // Find nearest exit face (any face that isn't the entry one)
          let s: number | null = null;
          let exitNormal: { x: number; y: number } | null = null;
          for (const f of faces) {
            if (f.n === entryNormal) continue;
            const ss = intersectSeg(hit, dIn, f.a, f.b);
            if (ss !== null && (s === null || ss < s)) { s = ss; exitNormal = f.n; }
          }
          if (s === null || !exitNormal) { deviations.push(NaN); return; }

          const exitX = hit.x + s * dIn.x;
          const exitY = hit.y + s * dIn.y;

          const dOut = refract(dIn, exitNormal, c.n);
          if (!dOut) { deviations.push(NaN); return; }

          const outLen = 360;
          const outEndX = exitX + dOut.x * outLen;
          const outEndY = exitY + dOut.y * outLen;

          const dev = angBetween(incDir, dOut);
          deviations.push(dev);

          // Progressive: inside ray (phase 2: prog 0.33-0.66), outgoing (phase 3: prog 0.66-1.0)
          const insideProg = Math.max(0, Math.min(1, (prog - 0.33) / 0.33));
          const outProg = Math.max(0, Math.min(1, (prog - 0.66) / 0.34));

          // inside ray
          if (insideProg > 0) {
            const iex = hit.x + (exitX - hit.x) * insideProg;
            const iey = hit.y + (exitY - hit.y) * insideProg;
            ctx.save();
            ctx.shadowColor = c.color;
            ctx.shadowBlur = 8;
            ctx.strokeStyle = c.color;
            ctx.lineWidth = 1.4;
            ctx.beginPath();
            ctx.moveTo(hit.x, hit.y);
            ctx.lineTo(iex, iey);
            ctx.stroke();
            ctx.restore();
            if (insideProg < 1) {
              ctx.save();
              ctx.shadowColor = c.color;
              ctx.shadowBlur = 14;
              ctx.fillStyle = "#fff";
              ctx.beginPath();
              ctx.arc(iex, iey, 2.5, 0, Math.PI * 2);
              ctx.fill();
              ctx.restore();
            }
          }

          // outgoing dispersed ray
          if (outProg > 0) {
            const oex = exitX + (outEndX - exitX) * outProg;
            const oey = exitY + (outEndY - exitY) * outProg;
            ctx.save();
            ctx.shadowColor = c.color;
            ctx.shadowBlur = 20;
            ctx.strokeStyle = c.color;
            ctx.lineWidth = 2.6;
            ctx.beginPath();
            ctx.moveTo(exitX, exitY);
            ctx.lineTo(oex, oey);
            ctx.stroke();
            ctx.restore();
            if (outProg < 1) {
              ctx.save();
              ctx.shadowColor = c.color;
              ctx.shadowBlur = 14;
              ctx.fillStyle = "#fff";
              ctx.beginPath();
              ctx.arc(oex, oey, 3, 0, Math.PI * 2);
              ctx.fill();
              ctx.restore();
            }
          }

          if (animate && prog >= 1) {
            const px = exitX + (outEndX - exitX) * tNorm;
            const py = exitY + (outEndY - exitY) * tNorm;
            ctx.save();
            ctx.shadowColor = c.color;
            ctx.shadowBlur = 14;
            ctx.fillStyle = "#fff";
            ctx.beginPath();
            ctx.arc(px, py, 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          }
        });

        results.push({ id: ray.id, theta_i: theta_i_deg, deviations });
      });

      // publish results to React state (only when changed enough)
      setRayResults((prev) => {
        if (prev.length !== results.length) return results;
        let same = true;
        for (let i = 0; i < results.length; i++) {
          const a = prev[i], b = results[i];
          if (!a || a.id !== b.id || Math.abs(a.theta_i - b.theta_i) > 0.05) { same = false; break; }
        }
        return same ? prev : results;
      });
    };

    const drawStick = (ctx: CanvasRenderingContext2D, W: number, H: number) => {
      // Scale all absolute sizes to canvas dimensions (designed for H=480 desktop)
      const drawScale = H / 480;
      const cx = W / 2;
      const waterTop = H * 0.52;
      const waterBot = H * 0.85;
      const glassLeft = cx - W * 0.08;
      const glassRight = cx + W * 0.08;

      // Glass body (subtle)
      ctx.save();
      const glassGrad = ctx.createLinearGradient(glassLeft, 0, glassRight, 0);
      glassGrad.addColorStop(0, "rgba(255,255,255,0.05)");
      glassGrad.addColorStop(0.5, "rgba(255,255,255,0.12)");
      glassGrad.addColorStop(1, "rgba(255,255,255,0.05)");
      ctx.fillStyle = glassGrad;
      ctx.strokeStyle = "rgba(255,255,255,0.45)";
      ctx.lineWidth = 2;
      // glass walls
      ctx.beginPath();
      ctx.moveTo(glassLeft, H * 0.35);
      ctx.lineTo(glassLeft, waterBot + 14);
      ctx.lineTo(glassRight, waterBot + 14);
      ctx.lineTo(glassRight, H * 0.35);
      ctx.stroke();
      // water
      const waterGrad = ctx.createLinearGradient(0, waterTop, 0, waterBot);
      waterGrad.addColorStop(0, "rgba(80,170,255,0.55)");
      waterGrad.addColorStop(1, "rgba(20,90,200,0.75)");
      ctx.fillStyle = waterGrad;
      ctx.fillRect(glassLeft, waterTop, glassRight - glassLeft, waterBot - waterTop);

      // Water surface line
      ctx.strokeStyle = "rgba(180,220,255,0.9)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(glassLeft - 10, waterTop);
      ctx.lineTo(glassRight + 10, waterTop);
      ctx.stroke();
      ctx.fillStyle = "rgba(180,220,255,0.9)";
      ctx.font = "12px 'Hind Siliguri', sans-serif";
      ctx.fillText(t("পানির পৃষ্ঠ", "Water Surface"), glassRight + 16, waterTop + 4);
      ctx.restore();

      // Stick geometry driven by sliders
      // stickAngleDeg = angle of stick from vertical (0 = straight down, 90 = horizontal along surface)
      const aStick = (stickAngleDeg * Math.PI) / 180;
      // entry point on the water surface (slightly left of center so eye on right has a clear view)
      const entryX = cx - 12;
      const entryY = waterTop;
      // direction unit vector pointing INTO the water (down-right when angle > 0)
      const dirX = Math.sin(aStick);
      const dirY = Math.cos(aStick);
      const submergedLen = stickSubmerged * drawScale;
      const realEndX = entryX + dirX * submergedLen;
      const realEndY = entryY + dirY * submergedLen;
      // Above-water portion: extend opposite direction
      const aboveLen = 130 * drawScale;
      const stickTopX = entryX - dirX * aboveLen;
      const stickTopY = entryY - dirY * aboveLen;
      const stickW = Math.max(4, 10 * drawScale);

      // Draw real stick (above water + faint dashed continuation underwater)
      ctx.save();
      ctx.lineCap = "round";
      // Above-water portion (solid brown)
      ctx.strokeStyle = "#C98B4B";
      ctx.lineWidth = stickW;
      ctx.beginPath();
      ctx.moveTo(stickTopX, stickTopY);
      ctx.lineTo(entryX, entryY);
      ctx.stroke();
      // Real underwater path (dashed, faint) — "actual position"
      ctx.setLineDash([6, 6]);
      ctx.strokeStyle = "rgba(201,139,75,0.55)";
      ctx.lineWidth = stickW * 0.85;
      ctx.beginPath();
      ctx.moveTo(entryX, entryY);
      ctx.lineTo(realEndX, realEndY);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();

      // Apparent position: apparent depth = real depth / n (textbook approximation for near-vertical viewing).
      // Horizontal position roughly preserved.
      const apparentEndX = realEndX;
      const apparentEndY = entryY + (realEndY - entryY) / stickWaterN;

      ctx.save();
      ctx.lineCap = "round";
      ctx.strokeStyle = "#E0A45C";
      ctx.lineWidth = stickW;
      ctx.beginPath();
      ctx.moveTo(entryX, entryY);
      ctx.lineTo(apparentEndX, apparentEndY);
      ctx.stroke();
      // small highlight
      ctx.strokeStyle = "rgba(255,235,200,0.55)";
      ctx.lineWidth = Math.max(1.5, 2 * drawScale);
      ctx.beginPath();
      ctx.moveTo(entryX, entryY);
      ctx.lineTo(apparentEndX, apparentEndY);
      ctx.stroke();
      ctx.restore();

      // Light rays from the real submerged tip to the eye, bending at the surface
      const eyeX = W * 0.82;
      const eyeY = H * 0.22;
      // Refraction point on the surface (between real tip and eye, but on water line)
      // Use a point where the ray would refract — pick midway horizontally between realEnd and apparentEnd at the surface
      const refractX = entryX + (realEndX - entryX) * 0.55;
      const refractY = waterTop;

      // Progressive light ray animation
      const stickProg = animProgressRef.current;
      const seg1L = Math.hypot(refractX - realEndX, refractY - realEndY);
      const seg2L = Math.hypot(eyeX - refractX, eyeY - refractY);
      const totalRayLen = seg1L + seg2L;
      const rayAllowed = stickProg * totalRayLen;

      ctx.save();
      ctx.strokeStyle = "rgba(255,230,120,0.85)";
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 4]);

      // underwater ray (real tip -> surface) — progressive
      const take1 = Math.min(seg1L, rayAllowed);
      const t1 = take1 / seg1L;
      const uwEndX = realEndX + (refractX - realEndX) * t1;
      const uwEndY = realEndY + (refractY - realEndY) * t1;
      ctx.beginPath();
      ctx.moveTo(realEndX, realEndY);
      ctx.lineTo(uwEndX, uwEndY);
      ctx.stroke();

      // air ray (surface -> eye) — progressive
      if (rayAllowed > seg1L) {
        const take2 = Math.min(seg2L, rayAllowed - seg1L);
        const t2 = take2 / seg2L;
        const airEndX = refractX + (eyeX - refractX) * t2;
        const airEndY = refractY + (eyeY - refractY) * t2;
        ctx.beginPath();
        ctx.moveTo(refractX, refractY);
        ctx.lineTo(airEndX, airEndY);
        ctx.stroke();
        // Leading dot
        if (t2 < 1 && t2 > 0) {
          ctx.setLineDash([]);
          ctx.shadowColor = "rgba(255,230,120,1)";
          ctx.shadowBlur = 16;
          ctx.fillStyle = "#fff";
          ctx.beginPath();
          ctx.arc(airEndX, airEndY, 4, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      } else if (t1 < 1 && t1 > 0) {
        // Leading dot on underwater segment
        ctx.setLineDash([]);
        ctx.shadowColor = "rgba(255,230,120,1)";
        ctx.shadowBlur = 16;
        ctx.fillStyle = "#fff";
        ctx.beginPath();
        ctx.arc(uwEndX, uwEndY, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // Backward extension from eye through refract point — meets at apparent tip (only when complete)
      if (stickProg > 0.95) {
        ctx.strokeStyle = "rgba(255,230,120,0.35)";
        ctx.setLineDash([5, 4]);
        ctx.beginPath();
        ctx.moveTo(refractX, refractY);
        ctx.lineTo(apparentEndX, apparentEndY);
        ctx.stroke();
      }
      ctx.setLineDash([]);
      ctx.restore();

      // Normal at refraction point
      const normalLen = Math.max(28, 60 * drawScale);
      ctx.save();
      ctx.strokeStyle = "rgba(255,255,255,0.55)";
      ctx.setLineDash([3, 4]);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(refractX, refractY - normalLen);
      ctx.lineTo(refractX, refractY + normalLen);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();

      // Eye icon
      const eyeRx = Math.max(10, 18 * drawScale);
      const eyeRy = Math.max(6, 11 * drawScale);
      const eyePupilR = Math.max(3, 6 * drawScale);
      ctx.save();
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.ellipse(eyeX, eyeY, eyeRx, eyeRy, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#1a1a2a";
      ctx.beginPath();
      ctx.arc(eyeX, eyeY, eyePupilR, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#fff";
      ctx.font = "12px 'Hind Siliguri', sans-serif";
      ctx.fillText(t("পর্যবেক্ষক", "Observer"), eyeX - 28, eyeY + eyeRy + 14);
      ctx.restore();

      // Legend box — top-left corner, color-coded line samples
      ctx.save();
      const fontSize = Math.max(10, Math.round(12 * drawScale));
      ctx.font = `${fontSize}px 'Hind Siliguri', sans-serif`;
      const lineLen = Math.max(18, 24 * drawScale);
      const pad = 8;
      const rowH = fontSize + 10;
      const apparentLabel = t("আপাত অবস্থান", "Apparent Position");
      const realLabel = t("প্রকৃত অবস্থান", "Real Position");
      const legendLabelW = Math.max(ctx.measureText(apparentLabel).width, ctx.measureText(realLabel).width);
      const legendW = pad + lineLen + 6 + legendLabelW + pad;
      const legendH = pad + rowH * 2 + pad * 0.5;
      const lx = 12;
      const ly = 12;
      // Background
      ctx.fillStyle = "rgba(0,0,0,0.52)";
      ctx.beginPath();
      if ((ctx as unknown as {roundRect?: unknown}).roundRect)
        (ctx as unknown as {roundRect:(x:number,y:number,w:number,h:number,r:number)=>void})
          .roundRect(lx, ly, legendW, legendH, 7);
      else ctx.rect(lx, ly, legendW, legendH);
      ctx.fill();
      ctx.textBaseline = "middle";
      // Row 1 — apparent position (solid orange)
      const r1y = ly + pad + rowH * 0.5 - 1;
      ctx.strokeStyle = "#E0A45C";
      ctx.lineWidth = Math.max(2, 3 * drawScale);
      ctx.setLineDash([]);
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(lx + pad, r1y);
      ctx.lineTo(lx + pad + lineLen, r1y);
      ctx.stroke();
      ctx.fillStyle = "#E0A45C";
      ctx.fillText(apparentLabel, lx + pad + lineLen + 6, r1y);
      // Row 2 — real position (dashed brown)
      const r2y = ly + pad + rowH * 1.5 - 1;
      ctx.strokeStyle = "rgba(201,139,75,0.9)";
      ctx.lineWidth = Math.max(2, 3 * drawScale);
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(lx + pad, r2y);
      ctx.lineTo(lx + pad + lineLen, r2y);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = "rgba(220,160,95,1)";
      ctx.fillText(realLabel, lx + pad + lineLen + 6, r2y);
      ctx.textBaseline = "alphabetic";
      ctx.restore();
      // Light ray label along the ray path
      ctx.save();
      ctx.font = `${Math.max(10, Math.round(11 * drawScale))}px 'Hind Siliguri', sans-serif`;
      ctx.fillStyle = "rgba(255,230,120,0.92)";
      ctx.fillText(t("আলোর পথ", "Path of Light"), (refractX + eyeX) / 2 - 30, (refractY + eyeY) / 2 - 6);
      ctx.restore();
    };

    const loop = (now: number) => {
      tRef.current += 0.3;
      if (animate) {
        animProgressRef.current = Math.min(1, animProgressRef.current + 0.004);
        setAnimProgress(animProgressRef.current);
      } else {
        animProgressRef.current = 1;
        setAnimProgress(1);
      }
      draw();
      rafRef.current = requestAnimationFrame(loop);
    };
    loop(performance.now());
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [mode, angleDeg, n, thickness, animate, rays, stickAngleDeg, stickWaterN, stickSubmerged, lang]);

  // Slab values
  const theta1 = (angleDeg * Math.PI) / 180;
  const sinTheta2 = Math.sin(theta1) / n;
  const theta2 = Math.asin(Math.max(-1, Math.min(1, sinTheta2)));
  const rDeg = (theta2 * 180) / Math.PI;
  const shift = Math.abs((thickness * Math.sin(theta1 - theta2)) / Math.max(0.0001, Math.cos(theta2)));

  const addRay = () => {
    if (rays.length >= 6) return;
    const id = nextRayId.current++;
    // Place at a random spot on the left half of the canvas
    const sx = 0.05 + Math.random() * 0.25;
    const sy = 0.2 + Math.random() * 0.6;
    setRays((rs) => [...rs, { id, sx, sy }]);
  };
  const removeRay = (id: number) => setRays((rs) => rs.filter((r) => r.id !== id));
  const updateRay = (id: number, patch: Partial<PrismRay>) =>
    setRays((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)));

  // Click-to-place mode: when on, the next canvas click adds a ray at that spot.
  const [placingRay, setPlacingRay] = useState(false);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (mode !== "prism") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const sx = (e.clientX - rect.left) / rect.width;
    const sy = (e.clientY - rect.top) / rect.height;
    if (rays.length >= 6) {
      setPlacingRay(false);
      return;
    }
    const id = nextRayId.current++;
    setRays((rs) => [...rs, { id, sx, sy }]);
    // Reset animation so the new ray draws in slowly
    animProgressRef.current = 0;
    setAnimProgress(0);
    setPlacingRay(false);
  };

  const colorFor = (id: number) => RAY_PRESET_COLORS[(id - 1) % RAY_PRESET_COLORS.length];

  return (
    <>
      {!hideNav && <SiteNav />}
      <div className="ref-root">
        <style>{STYLES}</style>

        <div className="ref-header">
          <div className="icon"><Microscope /></div>
          <div>
            <h1 className="bn">{t("আলোর প্রতিসরণ ও বিচ্ছুরণ", "Refraction & Dispersion of Light")}</h1>
            <p>Refraction &amp; Dispersion</p>
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

        {/* ASSESSMENT — NAME ENTRY */}
        {labMode === "name" && (
          <div className="ref-card lab-overlay">
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
                    const shuffled = [...REFRACTION_QUEST_POOL].sort(() => Math.random() - 0.5).slice(0, 5);
                    setLabQuests(shuffled);
                    setLabRound(0);
                    setLabScore(0);
                    setQuestCompleted(false);
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
                  const shuffled = [...REFRACTION_QUEST_POOL].sort(() => Math.random() - 0.5).slice(0, 5);
                  setLabQuests(shuffled);
                  setLabRound(0);
                  setLabScore(0);
                  setQuestCompleted(false);
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

        {/* ASSESSMENT — FLOATING QUEST / QUIZ PANEL */}
        {(labMode === "playing" || labMode === "quiz") && labQuests[labRound] && (() => {
          const quest = labQuests[labRound];
          const modeMatches = mode === quest.targetMode;
          const state: RefQuestState = { angleDeg, n, thickness, raysCount: rays.length, stickAngleDeg, stickWaterN };
          const conditionMet = modeMatches && quest.check(state);
          if (labMode === "playing" && conditionMet && !questCompleted) {
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
                    {labMode === "quiz" ? t("প্রশ্ন", "Question") : t("কুইজ", "Quiz")} {labRound + 1}/5
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
                <div className="ref-card quest-card lab-panel-card">
                  <button className="lab-panel-minimize-btn" onClick={() => setLabPanelMinimized(true)} aria-label={t("ছোট করো", "Minimize")}>
                    <ChevronDown size={16} />
                  </button>
                  <div className="quest-header">
                    <div className="quest-icon-wrap">
                      <span className="quest-icon"><Target size={22} /></span>
                    </div>
                    <div>
                      <div className="quest-label">ACTIVE QUEST</div>
                      <div className="quest-title bn">{t("কুইজ", "Quiz")} {labRound + 1}/5</div>
                    </div>
                    <div className="quest-score-badge">{labScore} {t("পয়েন্ট", "Points")}</div>
                  </div>
                  <div className="quest-instruction bn">"{tq(quest).instruction}"</div>
                  {!modeMatches && (
                    <div className="quest-mode-hint bn">
                      {t("প্রথমে", "First select")} "<strong>{tq(quest).targetModeLabel}</strong>" {t("সিলেক্ট করো ↓", "↓")}
                    </div>
                  )}
                  {modeMatches && !conditionMet && (
                    <div className="quest-mode-ok bn">
                      {tq(quest).targetModeLabel} {t("সিলেক্ট হয়েছে — এবার মান পরিবর্তন করো!", "selected — now adjust the values!")}
                    </div>
                  )}
                  <div className="quest-hint bn">
                    <span className="quest-hint-icon"><Info size={14} /></span> {tq(quest).hint}
                  </div>
                  {conditionMet && (
                    <div className="quest-success-flash bn">{t("সঠিক অবস্থান! কুইজ আসছে...", "Correct position! Quiz coming...")}</div>
                  )}
                </div>
              ) : (
                <div className="ref-card quiz-card lab-panel-card">
                  <button className="lab-panel-minimize-btn" onClick={() => setLabPanelMinimized(true)} aria-label={t("ছোট করো", "Minimize")}>
                    <ChevronDown size={16} />
                  </button>
                  <div className="quiz-header">
                    <span className="quiz-icon"><Info size={22} /></span>
                    <span className="quiz-round bn">{t("প্রশ্ন", "Question")} {labRound + 1}/5</span>
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

                          setTimeout(() => {
                            const nextRound = labRound + 1;
                            if (nextRound >= 5) {
                              setLabScore(isCorrect ? labScore + 20 : labScore);
                              setLabMode("result");
                            } else {
                              setLabRound(nextRound);
                              setQuestCompleted(false);
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

        {/* ASSESSMENT — RESULT */}
        {labMode === "result" && (
          <div className="ref-card result-card">
            <div className="result-trophy"><Trophy size={48} /></div>
            <h2 className="bn result-title">
              {labScore >= 80 ? t("অসাধারণ!", "Excellent!") : labScore >= 40 ? t("ভালো চেষ্টা!", "Good try!") : t("আবার চেষ্টা করো!", "Try again!")}
            </h2>
            <div className="result-name bn">{playerName}</div>
            <div className="result-score">{labScore}<span>/100 {t("পয়েন্ট", "Points")}</span></div>
            <div className="result-stars">
              {[...Array(5)].map((_, i) => (
                <span key={i} className={i < labScore / 20 ? "star-filled" : "star-empty"}><Star size={20} /></span>
              ))}
            </div>
            <div className="result-btns">
              <button className="lab-start-btn" onClick={() => {
                const shuffled = [...REFRACTION_QUEST_POOL].sort(() => Math.random() - 0.5).slice(0, 5);
                setLabQuests(shuffled);
                setLabRound(0);
                setLabScore(0);
                setQuestCompleted(false);
                setSelectedAnswer(null);
                setAnswerResult(null);
                setLabMode("playing");
              }}>{t("আবার খেলো", "Play Again")}</button>
              <button className="lab-cancel-btn" onClick={() => { setLabMode("off"); }}>{t("হোমে ফিরো", "Go Home")}</button>
            </div>
          </div>
        )}

        <div className="ref-card mode-tabs-card">
          <div className="tabs" id="ref-tabs">
            <button
              className={"tab-btn " + (mode === "slab" ? "active" : "")}
              onClick={() => { setMode("slab"); if (!hideNav) navigate(REF_MODE_TO_PATH.slab); }}
            >
              {t("কাঁচের স্ল্যাব", "Glass Slab")}
            </button>
            <button
              className={"tab-btn " + (mode === "prism" ? "active" : "")}
              onClick={() => { setMode("prism"); if (!hideNav) navigate(REF_MODE_TO_PATH.prism); }}
            >
              {t("প্রিজম (বিচ্ছুরণ)", "Prism (Dispersion)")}
            </button>
            <button
              className={"tab-btn " + (mode === "stick" ? "active" : "")}
              onClick={() => { setMode("stick"); if (!hideNav) navigate(REF_MODE_TO_PATH.stick); }}
            >
              {t("পানিতে লাঠি বাঁকা", "Bent Stick in Water")}
            </button>
          </div>
        </div>

        <div className="experiment-row">
          <div className="experiment-canvas">
            <div className="ref-card canvas-card">
              <div className="canvas-wrap">
                <canvas ref={canvasRef} onClick={handleCanvasClick} className="block w-full" style={{ cursor: mode === "prism" && placingRay ? "crosshair" : "default" }} />
              </div>
              <div className="action-row">
                <button
                  className={"anim-btn " + (animate ? "on" : "")}
                  onClick={() => {
                    setAnimate((a) => !a);
                    if (!animate) {
                      // Turning animation back on — reset progress
                      setAnimProgress(0);
                      animProgressRef.current = 0;
                    }
                  }}
                >
                  {animate ? <Pause /> : <Play />}
                  {animate ? t("অ্যানিমেশন বন্ধ", "Stop Animation") : t("অ্যানিমেশন চালু", "Start Animation")}
                </button>
                <button
                  className={"outcome-action-btn learning-action-btn" + (highlightActionButtons ? " pulse-highlight" : "")}
                  onClick={() => setShowLearningModal(true)}
                  aria-label={t("লার্নিং আউটকাম", "Learning Outcome")}
                  title={t("লার্নিং আউটকাম", "Learning Outcome")}
                >
                  <Lightbulb size={16} />
                </button>
                <button
                  className={"outcome-action-btn goto-usecase-btn" + (highlightActionButtons ? " pulse-highlight" : "")}
                  onClick={() => setShowExplainModal(true)}
                  aria-label={t("বাস্তব ব্যবহার", "Real-world Use")}
                  title={t("বাস্তব ব্যবহার", "Real-world Use")}
                >
                  <Info size={16} />
                </button>
                <button
                  className={"outcome-action-btn controls-toggle-btn" + (showControlsPanel ? " active" : "")}
                  onClick={() => setShowControlsPanel((v) => !v)}
                  aria-label={t("নিয়ন্ত্রণ", "Controls")}
                  title={t("নিয়ন্ত্রণ", "Controls")}
                >
                  <SlidersHorizontal size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Controls toolkit — floating, opened on demand via the sliders
            icon in the action-row, instead of a permanent side panel. */}
        {showControlsPanel && (
          <div className="lab-floating-panel controls-toolkit-panel">
            <div className="ref-card controls-toolkit-card">
              <button className="lab-panel-minimize-btn" onClick={() => setShowControlsPanel(false)} aria-label={t("বন্ধ করো", "Close")}>
                <X size={16} />
              </button>
          <div id="ref-controls">
            {mode === "slab" && (
              <div className="ref-card">
                <div className="controls-title"><span>{t("স্ল্যাব নিয়ন্ত্রণ", "Slab Control")}</span></div>
                <div className="slider-row">
                  <label><span>{t("আপতন কোণ (i)", "Angle of Incidence (i)")}</span><span className="val">{angleDeg}°</span></label>
                  <input type="range" min={5} max={75} value={angleDeg} onChange={(e) => setAngleDeg(+e.target.value)} />
                </div>
                <div className="slider-row">
                  <label><span>{t("প্রতিসরাঙ্ক (n)", "Refractive Index (n)")}</span><span className="val">{n.toFixed(2)}</span></label>
                  <input type="range" min={1.0} max={2.0} step={0.01} value={n} onChange={(e) => setN(+e.target.value)} />
                </div>
                <div className="slider-row">
                  <label><span>{t("স্ল্যাবের পুরুত্ব", "Slab Thickness")}</span><span className="val">{thickness}px</span></label>
                  <input type="range" min={40} max={180} value={thickness} onChange={(e) => setThickness(+e.target.value)} />
                </div>
              </div>
            )}
            {mode === "prism" && (
              <div className="ref-card">
                <div className="controls-title">
                  <span>{t("আলোক উৎস", "Light Source")} ({rays.length})</span>
                  <button
                    className="add-btn"
                    onClick={() => setPlacingRay((p) => !p)}
                    disabled={rays.length >= 6}
                    style={placingRay ? { background: "var(--success)", borderColor: "var(--success-dark)" } : undefined}
                  >
                    <Plus /> {placingRay ? t("ক্যানভাসে ক্লিক করুন", "Click on Canvas") : t("আলো যোগ", "Add Light")}
                  </button>
                </div>
                <div style={{ fontSize: 11, color: "var(--gray-500)", marginBottom: 8 }}>
                  {t(
                    '"আলো যোগ" চাপুন, তারপর ক্যানভাসের যেকোনো জায়গায় ক্লিক করুন — সেখান থেকে আলো প্রিজমে গিয়ে পড়বে।',
                    "Press Add Light, then click anywhere on the canvas — light will travel from there to the prism."
                  )}
                </div>
                {rays.map((ray) => (
                  <div key={ray.id} className="ray-card">
                    <div className="ray-card-head">
                      <span className="ray-tag">
                        <span className="ray-dot" style={{ background: colorFor(ray.id), color: colorFor(ray.id) }} />
                        {t("উৎস", "Source")} R{ray.id}
                      </span>
                      <button className="del-btn" onClick={() => removeRay(ray.id)} aria-label="remove">
                        <Trash2 />
                      </button>
                    </div>
                    <div className="slider-row">
                      <label><span>{t("X অবস্থান", "X Position")}</span><span className="val">{Math.round(ray.sx * 100)}%</span></label>
                      <input
                        type="range" min={0} max={1} step={0.01} value={ray.sx}
                        onChange={(e) => updateRay(ray.id, { sx: +e.target.value })}
                      />
                    </div>
                    <div className="slider-row">
                      <label><span>{t("Y অবস্থান", "Y Position")}</span><span className="val">{Math.round(ray.sy * 100)}%</span></label>
                      <input
                        type="range" min={0} max={1} step={0.01} value={ray.sy}
                        onChange={(e) => updateRay(ray.id, { sy: +e.target.value })}
                      />
                    </div>
                  </div>
                ))}
                {rays.length === 0 && (
                  <div style={{ fontSize: 12, color: "var(--gray-500)", padding: 12, textAlign: "center", border: "1px dashed var(--gray-300)", borderRadius: 8 }}>
                    {t('কোনো আলো নেই। উপরে "আলো যোগ" চাপুন।', "No light. Press Add Light above.")}
                  </div>
                )}
                {rays.length >= 6 && (
                  <div style={{ fontSize: 11, color: "var(--gray-500)", marginTop: 4 }}>
                    {t("সর্বাধিক ৬টি আলো যোগ করা যাবে।", "Maximum 6 lights can be added.")}
                  </div>
                )}
              </div>
            )}
            {mode === "stick" && (
              <div className="ref-card">
                <div className="controls-title"><span>{t("পর্যবেক্ষণ — পানিতে লাঠি", "Observation — Stick in Water")}</span></div>
                <div className="slider-row">
                  <label><span>{t("লাঠির কোণ (উলম্ব থেকে)", "Stick Angle (from vertical)")}</span><span className="val">{stickAngleDeg}°</span></label>
                  <input type="range" min={0} max={80} value={stickAngleDeg} onChange={(e) => setStickAngleDeg(+e.target.value)} />
                </div>
                <div className="slider-row">
                  <label><span>{t("পানির প্রতিসরাঙ্ক (n)", "Water Refractive Index (n)")}</span><span className="val">{stickWaterN.toFixed(2)}</span></label>
                  <input type="range" min={1.0} max={1.8} step={0.01} value={stickWaterN} onChange={(e) => setStickWaterN(+e.target.value)} />
                </div>
                <div className="slider-row">
                  <label><span>{t("নিমজ্জিত দৈর্ঘ্য", "Submerged Length")}</span><span className="val">{stickSubmerged}px</span></label>
                  <input type="range" min={60} max={240} value={stickSubmerged} onChange={(e) => setStickSubmerged(+e.target.value)} />
                </div>
                <div style={{ fontSize: 13, color: "var(--gray-700)", lineHeight: 1.7 }} className="bn">
                  {t(
                    "পানিতে আংশিক নিমজ্জিত একটি সোজা লাঠি বা কলম উপর থেকে দেখলে বাঁকা মনে হয়। কারণ পানি (ঘন মাধ্যম) থেকে আলো বাতাসে (হালকা মাধ্যম) আসার সময় অভিলম্ব থেকে দূরে সরে যায়, ফলে আমাদের চোখে লাঠির নিমজ্জিত অংশের আপাত অবস্থান প্রকৃত অবস্থানের চেয়ে অগভীর ও সরে যাওয়া দেখায়।",
                    "A straight stick or pen partially submerged in water appears bent when viewed from above. This is because light bends away from the normal when traveling from water (denser medium) to air (lighter medium), making the apparent position of the submerged part look shallower and displaced compared to its real position."
                  )}
                </div>
                <div style={{ marginTop: 10, fontSize: 12, color: "var(--gray-500)" }} className="bn">
                  <div>• {t("কমলা কঠিন রেখা — আমরা যা", "Orange solid line — what we")} <b>{t("দেখি", "see")}</b> {t("(আপাত)", "(apparent)")}</div>
                  <div>• {t("বাদামি ড্যাশড রেখা — লাঠির", "Brown dashed line — the stick's")} <b>{t("প্রকৃত", "real")}</b> {t("অবস্থান", "position")}</div>
                  <div>• {t("হলুদ রেখা — আলোক রশ্মির পথ (পৃষ্ঠে বেঁকেছে)", "Yellow line — path of light ray (bent at surface)")}</div>
                </div>
              </div>
            )}
          </div>
            </div>
          </div>
        )}

        {/* SLAB FORMULA + DATA */}
        {mode === "slab" && (
          <div className="ref-card formula-card">
            <div className="section-title bn">{t("সূত্র ও গণনা — কাঁচের স্ল্যাব", "Formula & Calculation — Glass Slab")}</div>
            <div className="formula-display">
              <span className="math">n<span className="math-sub">1</span></span>
              <span className="op">·</span>
              <span className="math">sin(i)</span>
              <span className="op">=</span>
              <span className="math">n<span className="math-sub">2</span></span>
              <span className="op">·</span>
              <span className="math">sin(r)</span>
            </div>
            <div className="data-rows">
              <div className="data-row">
                <span className="k">{t("স্নেলের সূত্র", "Snell's Law")}</span>
                <span className="v bn">
                  <span className="math">n<span className="math-sub">1</span> sin(i) = n<span className="math-sub">2</span> sin(r)</span>
                </span>
              </div>
              <div className="data-row"><span className="k">{t("আপতন কোণ (i)", "Angle of Incidence (i)")}</span><span className="v">{angleDeg}°</span></div>
              <div className="data-row"><span className="k">{t("প্রতিসরণ কোণ (r)", "Angle of Refraction (r)")}</span><span className="v">{rDeg.toFixed(2)}°</span></div>
              <div className="data-row"><span className="k">{t("প্রতিসরাঙ্ক (n)", "Refractive Index (n)")}</span><span className="v">{n.toFixed(2)}</span></div>
              <div className="data-row">
                <span className="k">{t("পার্শ্বিক সরণ (d)", "Lateral Displacement (d)")}</span>
                <span className="v">
                  <span className="math">d = </span>
                  <div className="math-frac">
                    <span className="num">t · sin(i − r)</span>
                    <span className="den">cos(r)</span>
                  </div>
                </span>
              </div>
              <div className="data-row">
                <span className="k">{t("গণনা", "Calculation")}</span>
                <span className="v">
                  <span className="math">{thickness} · </span>
                  <div className="math-frac">
                    <span className="num">sin({(angleDeg - rDeg).toFixed(1)}°)</span>
                    <span className="den">cos({rDeg.toFixed(1)}°)</span>
                  </div>
                  <span className="math"> = {shift.toFixed(1)} px</span>
                </span>
              </div>
            </div>
          </div>
        )}

        {/* PRISM FORMULA + PER-RAY CALCULATIONS */}
        {mode === "prism" && (
          <>
            <div className="ref-card formula-card">
              <div className="section-title bn">{t("সূত্র — প্রিজম বিচ্ছুরণ", "Formula — Prism Dispersion")}</div>
              <div className="formula-display">
                <div className="math-frac">
                  <span className="num">sin(i)</span>
                  <span className="den">sin(r)</span>
                </div>
                <span className="op">=</span>
                <span className="math">n(λ)</span>
                <span className="op">,</span>
                <span className="math">δ = (i<span className="math-sub">1</span> + i<span className="math-sub">2</span>) − A</span>
              </div>
              <div className="data-rows">
                <div className="data-row"><span className="k">{t("প্রিজম কোণ (A)", "Prism Angle (A)")}</span><span className="v">60°</span></div>
                <div className="data-row"><span className="k">{t("মোট রশ্মি", "Total Rays")}</span><span className="v">{rays.length}</span></div>
                <div className="data-row"><span className="k">{t("নিয়ম", "Rule")}</span><span className="v bn">{t("বেগুনি বেশি বাঁকে · লাল কম বাঁকে", "Violet bends more · Red bends less")}</span></div>
              </div>
            </div>

            <div className="ref-card">
              <div className="section-title bn">{t("প্রতিটি রশ্মির বিচ্ছুরণ গণনা", "Dispersion Calculation per Ray")}</div>
              <div className="calc-grid">
                {rayResults.map((res) => (
                  <div key={res.id} className="calc-block">
                    <div className="calc-block-head">
                      <span className="ray-dot" style={{ background: colorFor(res.id), color: colorFor(res.id) }} />
                      <span>{t("রশ্মি", "Ray")} R{res.id}</span>
                      <span style={{ marginLeft: "auto", color: "var(--gray-500)", fontWeight: 700 }}>
                        <span className="math">i ≈ {res.theta_i.toFixed(1)}°</span>
                      </span>
                    </div>
                    {SPECTRUM.map((c, i) => (
                      <div key={c.en} className="spectrum-row">
                        <div className="spectrum-swatch" style={{ background: c.color }} />
                        <span className="spectrum-name bn">{lang === "en" ? c.en : c.name}</span>
                        <span className="spectrum-n">n = {c.n.toFixed(3)}</span>
                        <span className="spectrum-dev">
                          <span className="math">δ = {Number.isFinite(res.deviations[i]) ? `${res.deviations[i].toFixed(1)}°` : "—"}</span>
                        </span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* STICK FORMULA */}
        {mode === "stick" && (
          <div className="ref-card formula-card">
            <div className="section-title bn">{t("সূত্র ও গণনা — পানিতে লাঠি", "Formula & Calculation — Stick in Water")}</div>
            <div className="formula-display">
              <span className="math">n = </span>
              <div className="math-frac">
                <span className="num">{t("প্রকৃত গভীরতা", "Real Depth")} (Real Depth)</span>
                <span className="den">{t("আপাত গভীরতা", "Apparent Depth")} (Apparent Depth)</span>
              </div>
            </div>
            <div className="data-rows">
              <div className="data-row"><span className="k">{t("পানির প্রতিসরাঙ্ক (n)", "Water Refractive Index (n)")}</span><span className="v">{stickWaterN.toFixed(2)}</span></div>
              <div className="data-row">
                <span className="k">{t("প্রকৃত গভীরতা", "Real Depth")}</span>
                <span className="v">{stickSubmerged} px</span>
              </div>
              <div className="data-row">
                <span className="k">{t("আপাত গভীরতা", "Apparent Depth")}</span>
                <span className="v">
                  <div className="math-frac">
                    <span className="num">{stickSubmerged} px</span>
                    <span className="den">{stickWaterN.toFixed(2)}</span>
                  </div>
                  <span className="math"> = {(stickSubmerged / stickWaterN).toFixed(1)} px</span>
                </span>
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
              <p className="congrats-subtitle bn">{t("তুমি সফলভাবে একটি প্রতিসরণ সিমুলেশন তৈরি করেছ!", "You've successfully built a refraction simulation!")}</p>
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

        {showLearningModal && (() => {
          const outcome = LEARNING_OUTCOMES[mode];
          return (
            <div className="congrats-modal-bd" onClick={() => setShowLearningModal(false)}>
              <div className="congrats-modal-card" onClick={(e) => e.stopPropagation()}>
                <button className="congrats-close" onClick={() => setShowLearningModal(false)} aria-label={t("বন্ধ করো", "Close")}>
                  <X size={16} />
                </button>
                <div className="learning-header">
                  <div className="learning-icon"><Lightbulb size={18} /></div>
                  <div className="learning-title bn">{t("এই উপকরণ সম্পর্কে শিখুন:", "Learn about this material:")}</div>
                </div>
                <p className="learning-message bn">{t(outcome.message, outcome.messageEn)}</p>
                <div className="learning-tips-grid">
                  {outcome.tips.map((tip, i) => (
                    <div key={i} className="learning-tip-item bn">
                      <div className="tip-icon">{i + 1}</div>
                      <div className="tip-text">{t(tip, outcome.tipsEn[i])}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })()}

        {showExplainModal && (
          <div className="congrats-modal-bd" onClick={() => setShowExplainModal(false)}>
            <div className="congrats-modal-card" onClick={(e) => e.stopPropagation()}>
              <button className="congrats-close" onClick={() => setShowExplainModal(false)} aria-label={t("বন্ধ করো", "Close")}>
                <X size={16} />
              </button>
              <div className="explain-header">
                <Info />
                <div className="explain-title bn">
                  {mode === "slab"
                    ? t("কেন আলো বাঁকা পথে চলে?", "Why does light travel in a bent path?")
                    : mode === "prism"
                    ? t("কেন বিচ্ছুরণ ঘটে?", "Why does dispersion occur?")
                    : t("পানিতে লাঠি বাঁকা দেখায় কেন?", "Why does a stick in water appear bent?")}
                </div>
              </div>
              <div className="explain-body bn">
                {mode === "slab" && (
                  t(
                    "কাঁচের প্রতিসরাঙ্ক বাতাসের চেয়ে বেশি, তাই আলো কাঁচে ঢোকার সময় অভিলম্বের দিকে এবং বের হওয়ার সময় অভিলম্ব থেকে দূরে বাঁকে। দুই পৃষ্ঠ সমান্তরাল হওয়ায় বের হওয়া রশ্মি আপতন রশ্মির সমান্তরাল থাকে, কিন্তু কিছুটা পার্শ্বিক সরণ ঘটে।",
                    "Glass has a higher refractive index than air, so light bends toward the normal when entering the glass and away from the normal when exiting. Because the two surfaces are parallel, the exiting ray remains parallel to the incident ray, but with a slight lateral displacement."
                  )
                )}
                {mode === "prism" && (
                  t(
                    "বিভিন্ন রঙের আলোর তরঙ্গদৈর্ঘ্য আলাদা, ফলে কাঁচে তাদের প্রতিসরাঙ্ক (n) আলাদা। বেগুনি আলোর n সবচেয়ে বেশি, তাই এটি সবচেয়ে বেশি বাঁকে; লাল আলোর n সবচেয়ে কম, তাই এটি সবচেয়ে কম বাঁকে। এখানে একাধিক রশ্মি যোগ করে প্রতিটির আলাদা বিচ্ছুরণ পর্যবেক্ষণ করা যায়।",
                    "Different colors of light have different wavelengths, so they have different refractive indices (n) in glass. Violet light has the highest n and bends the most; red light has the lowest n and bends the least. You can add multiple rays here to observe the separate dispersion of each."
                  )
                )}
                {mode === "stick" && (
                  t(
                    "পানিতে আংশিক নিমজ্জিত একটি সোজা লাঠি বা কলম উপর থেকে দেখলে বাঁকা মনে হয়, কারণ পানি (ঘন মাধ্যম) থেকে আলো বাতাসে (হালকা মাধ্যম) আসার সময় অভিলম্ব থেকে দূরে সরে যায়। লাঠির নিমজ্জিত প্রান্ত থেকে আসা আলো পানির পৃষ্ঠে প্রতিসরিত হয়ে চোখে পৌঁছায়; কিন্তু মস্তিষ্ক ধরে নেয় আলো সরলরেখায় এসেছে, তাই লাঠির নিমজ্জিত অংশ প্রকৃত অবস্থানের চেয়ে উপরে ও সরে গিয়ে দেখা যায় — ফলে লাঠিটিকে পৃষ্ঠের কাছে বাঁকা দেখায়।",
                    "A straight stick or pen partially submerged in water appears bent when viewed from above because light bends away from the normal when traveling from water (denser medium) to air (lighter medium). Light from the submerged tip refracts at the water surface before reaching the eye; but the brain assumes light traveled in a straight line, so the submerged part appears higher and displaced from its real position — making the stick appear bent near the surface."
                  )
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Refraction;
