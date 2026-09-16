import { useState, useEffect, useCallback, useRef } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

export interface TourStep {
  selector: string;
  title: string;
  desc: string;
  waitForClick?: boolean;
  /** If set, the required click must land inside THIS element instead of
   * `selector` — use when `selector` (spotlighted) is a toggle that reveals
   * the real target later, e.g. a hamburger button that opens a menu. */
  requiredSelector?: string;
}

interface GuidedTourProps {
  steps: TourStep[];
  started: boolean;
  /** Called when the tour closes. `completed` is true only when the user
   * reached the last step and clicked "Finish" — false for Skip/✕/backdrop. */
  onEnd: (completed: boolean) => void;
  lang?: "bn" | "en";
  /** Strict mode: steps with waitForClick block the Next button until the
   * required action is actually performed. Off by default (soft UI tour). */
  strict?: boolean;
  /** Selector for an element (e.g. the simulation canvas) to keep lit up
   * and un-dimmed for the whole tour, regardless of which step is active —
   * so the user can always see the simulation they're building. */
  keepVisible?: string;
}

export function GuidedTour({ steps, started, onEnd, lang = "bn", strict = false, keepVisible }: GuidedTourProps) {
  const [step, setStep] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [interactionDone, setInteractionDone] = useState(false);
  const [targetMissing, setTargetMissing] = useState(false);
  const prevElRef = useRef<HTMLElement | null>(null);
  const prevAncestorsRef = useRef<HTMLElement[]>([]);
  const cardRef = useRef<HTMLDivElement | null>(null);
  // A guessed height used to decide where the card fits before it's even
  // rendered; corrected to the real measured height right after, since
  // description length varies a lot step to step and an under-estimate
  // can leave the card touching (or slightly inside) whatever it's meant
  // to avoid overlapping.
  const [cardH, setCardH] = useState(200);
  useEffect(() => {
    const h = cardRef.current?.offsetHeight;
    if (h && Math.abs(h - cardH) > 2) setCardH(h);
  });

  // Keep a persistent element (e.g. the canvas) elevated above the dimmed
  // backdrop for the whole tour, independent of which step is highlighted.
  // The element can get unmounted and remounted mid-tour (e.g. picking a new
  // mode from a mobile menu forces a fresh render of the simulation), so this
  // re-checks periodically instead of grabbing a reference just once.
  useEffect(() => {
    if (!started || !keepVisible) return;
    let currentEl: HTMLElement | null = null;
    let hadInlinePosition = false;

    const release = () => {
      if (currentEl) {
        if (!hadInlinePosition) currentEl.style.removeProperty("position");
        currentEl.style.removeProperty("z-index");
        currentEl = null;
      }
    };

    const check = () => {
      const el = document.querySelector(keepVisible) as HTMLElement | null;
      if (el === currentEl) return;
      release();
      if (el) {
        hadInlinePosition = !!el.style.position;
        const pos = getComputedStyle(el).position;
        if (pos === "static") el.style.position = "relative";
        el.style.zIndex = "9002";
        currentEl = el;
      }
    };

    check();
    const poll = window.setInterval(check, 300);
    return () => {
      window.clearInterval(poll);
      release();
    };
  }, [started, keepVisible]);

  const elevateEl = useCallback((el: HTMLElement | null) => {
    if (prevElRef.current) {
      prevElRef.current.style.removeProperty("position");
      prevElRef.current.style.removeProperty("z-index");
      prevElRef.current.style.removeProperty("pointer-events");
      prevElRef.current = null;
    }
    prevAncestorsRef.current.forEach((a) => a.style.removeProperty("z-index"));
    prevAncestorsRef.current = [];

    if (el) {
      const pos = getComputedStyle(el).position;
      if (pos === "static") el.style.position = "relative";
      el.style.zIndex = "9005";
      el.style.pointerEvents = "auto";
      prevElRef.current = el;

      // A target nested inside its own lower-z-index stacking context (e.g.
      // a fixed floating panel like the controls toolkit, z-index 850)
      // stays visually and interactively trapped under the tour's dimmed
      // backdrop (z-index 9000) even once elevated itself — a descendant's
      // z-index only competes within the nearest ancestor stacking context,
      // not globally, so the whole subtree still paints (and hit-tests)
      // behind the backdrop. Walk up and lift any such ancestor above the
      // backdrop too, so real clicks (not just the spotlight ring) land
      // where they're supposed to.
      let node = el.parentElement;
      while (node && node !== document.body) {
        const cs = getComputedStyle(node);
        const z = parseInt(cs.zIndex, 10);
        if (cs.position !== "static" && !Number.isNaN(z) && z < 9000) {
          node.style.setProperty("z-index", "9002");
          prevAncestorsRef.current.push(node);
        }
        node = node.parentElement;
      }
    }
  }, []);

  const endTour = useCallback((completed: boolean = false) => {
    elevateEl(null);
    onEnd(completed);
  }, [elevateEl, onEnd]);

  const goNext = useCallback(() => {
    if (step < steps.length - 1) setStep(s => s + 1);
    else endTour(true);
  }, [step, steps.length, endTour]);

  const measure = useCallback((selector: string) => {
    const el = document.querySelector(selector) as HTMLElement | null;
    if (!el) { setRect(null); elevateEl(null); return; }
    elevateEl(el);
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    const doMeasure = () => {
      const r = el.getBoundingClientRect();
      setRect(r);
    };
    doMeasure();
    setTimeout(doMeasure, 400);
    setTimeout(doMeasure, 700);
  }, [elevateEl]);

  useEffect(() => {
    if (!started) { setStep(0); setRect(null); elevateEl(null); return; }
    setInteractionDone(false);
    setTargetMissing(false);
    measure(steps[step]?.selector ?? "");
  }, [started, step, steps, measure, elevateEl]);

  useEffect(() => {
    if (!started) return;
    const update = () => {
      const el = document.querySelector(steps[step]?.selector ?? "");
      if (el) setRect(el.getBoundingClientRect());
    };
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    // Mobile browsers resize the *visual* viewport (e.g. the address bar
    // collapsing/expanding as the page scrolls) without always firing a
    // matching window "resize" promptly — that lag is a common source of
    // a highlighted target looking mispositioned right after such a
    // transition. visualViewport fires for exactly that case.
    window.visualViewport?.addEventListener("resize", update);
    window.visualViewport?.addEventListener("scroll", update);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
      window.visualViewport?.removeEventListener("resize", update);
      window.visualViewport?.removeEventListener("scroll", update);
    };
  }, [started, step, steps]);

  useEffect(() => {
    if (!started || !steps[step]?.waitForClick) return;
    const requiredSelector = steps[step].requiredSelector || steps[step].selector;
    let attached = false;
    let detach: (() => void) | null = null;

    const tryAttach = () => {
      if (attached) return;
      const el = document.querySelector(requiredSelector);
      if (!el) return;
      attached = true;
      // Just unlock "Next" here — don't auto-advance. Auto-advancing right
      // after the click made it easy to miss that the action even
      // registered (and left no way forward if the auto-advance itself
      // silently failed to fire); an explicit tap is more reliable and
      // gives clear confirmation the step is done.
      const handler = () => { setInteractionDone(true); };
      el.addEventListener("click", handler, { once: true, capture: true });
      detach = () => el.removeEventListener("click", handler, true);
    };

    tryAttach();
    // The required element may not exist yet (e.g. a dropdown item that only
    // mounts once a hamburger toggle is opened) — poll briefly for it.
    const poll = attached ? null : window.setInterval(tryAttach, 200);
    const giveUp = attached ? null : window.setTimeout(() => { if (!attached) setTargetMissing(true); }, 15000);

    return () => {
      if (poll) window.clearInterval(poll);
      if (giveUp) window.clearTimeout(giveUp);
      if (detach) detach();
    };
  }, [started, step, steps, goNext]);

  useEffect(() => { return () => elevateEl(null); }, [elevateEl]);

  if (!started) return null;

  const current = steps[step];
  const interactive = !!current.waitForClick;
  const nextLocked = strict && interactive && !interactionDone && !targetMissing;
  const PAD = 8;
  const accent = "#1d4ed8";

  const getCardPos = (): React.CSSProperties => {
    const cw = Math.min(280, window.innerWidth - 24);
    const CH = cardH;
    const vh = window.innerHeight;
    const vw = window.innerWidth;
    const MARGIN = 12;
    if (!rect) return { position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: `${cw}px` };

    // A target nested inside a fixed-position panel (e.g. the controls
    // toolkit) is often much smaller than the panel itself — placing the
    // card based only on the narrow target rect can still land it on top
    // of the rest of that panel. Avoid the whole panel's footprint instead
    // of just the target's, when one exists.
    let avoid: DOMRect = rect;
    let node: HTMLElement | null = prevElRef.current;
    while (node && node !== document.body) {
      if (getComputedStyle(node).position === "fixed") { avoid = node.getBoundingClientRect(); break; }
      node = node.parentElement;
    }

    // Prefer whichever of below/above the avoid-zone has more room, then
    // clamp fully inside the viewport.
    const spaceBelow = vh - avoid.bottom - PAD - 10 - MARGIN;
    const spaceAbove = avoid.top - PAD - 10 - MARGIN;
    let top = spaceBelow >= CH || spaceBelow >= spaceAbove
      ? avoid.bottom + PAD + 10
      : avoid.top - CH - PAD - 10;
    top = Math.max(MARGIN, Math.min(top, vh - CH - MARGIN));

    let left = rect.left + rect.width / 2 - cw / 2;
    left = Math.max(MARGIN, Math.min(left, vw - cw - MARGIN));

    // A tall avoid-zone relative to the viewport (e.g. a floating panel
    // anchored to a screen edge) can leave no room above OR below without
    // still overlapping it — clamping alone then lands the card right on
    // top of the very thing it's pointing at, hiding it and swallowing
    // clicks meant for it. When that happens, place the card beside it
    // instead, on whichever side has more room.
    const overlaps = top < avoid.bottom && top + CH > avoid.top && left < avoid.right && left + cw > avoid.left;
    if (overlaps) {
      const spaceLeft = avoid.left - PAD - 10 - MARGIN;
      const spaceRight = vw - avoid.right - PAD - 10 - MARGIN;
      left = spaceRight >= cw || spaceRight >= spaceLeft
        ? Math.min(avoid.right + PAD + 10, vw - cw - MARGIN)
        : Math.max(avoid.left - PAD - 10 - cw, MARGIN);
      top = Math.max(MARGIN, Math.min(avoid.top, vh - CH - MARGIN));
    }

    return { position: "fixed", top: `${top}px`, left: `${left}px`, width: `${cw}px` };
  };

  return (
    <>
      <style>{`@keyframes _tIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}`}</style>

      {/* Backdrop */}
      <div onClick={() => endTour()} style={{ position:"fixed", inset:0, zIndex:9000, background:"rgba(0,0,0,0.6)" }} />

      {/* Spotlight — clamped to the viewport so a momentarily stale
          measurement (e.g. right after a mobile address-bar resize) can
          never render the ring mostly off-screen. */}
      {rect && (() => {
        const vw = window.innerWidth, vh = window.innerHeight;
        const left = Math.max(0, Math.min(rect.left - PAD, vw - 4));
        const top = Math.max(0, Math.min(rect.top - PAD, vh - 4));
        const width = Math.max(4, Math.min(rect.width + PAD * 2, vw - left));
        const height = Math.max(4, Math.min(rect.height + PAD * 2, vh - top));
        return (
          <div style={{
            position:"fixed",
            top, left, width, height,
            zIndex: 9001, borderRadius:"10px",
            boxShadow:`0 0 0 9999px rgba(0,0,0,0.6)`,
            border: interactive ? "2px solid rgba(74,222,128,0.85)" : "2px solid rgba(147,197,253,0.85)",
            pointerEvents:"none",
            transition:"top 0.35s ease, left 0.35s ease, width 0.35s ease, height 0.35s ease",
          }} />
        );
      })()}

      {/* Card */}
      <div
        ref={cardRef}
        onClick={e => e.stopPropagation()}
        style={{
          ...getCardPos(), zIndex:9006,
          background:"#fff", borderRadius:"14px", padding:"16px",
          boxShadow:"0 12px 40px rgba(0,0,0,0.25)",
          fontFamily:"'Hind Siliguri','Inter',sans-serif",
          animation:"_tIn 0.25s ease-out",
        }}
      >
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"6px" }}>
          <div style={{ display:"flex", alignItems:"center", gap:"8px", flex:1 }}>
            <span style={{ background:accent, color:"#fff", borderRadius:"20px", padding:"2px 10px", fontSize:"11px", fontWeight:800, flexShrink:0 }}>
              {step+1}/{steps.length}
            </span>
            <span style={{ fontWeight:800, fontSize:"14px", color:"#111827" }}>{current.title}</span>
          </div>
          <button onClick={() => endTour()} style={{ background:"none", border:"none", cursor:"pointer", color:"#9CA3AF", padding:"2px 0 2px 8px" }}>
            <X size={15} />
          </button>
        </div>

        <p style={{ fontSize:"13px", color:"#374151", lineHeight:1.65, margin:"0 0 12px" }}>{current.desc}</p>

        {nextLocked && (
          <p style={{ fontSize:"11px", color:"#16a34a", background:"#F0FDF4", border:"1px solid #BBF7D0", borderRadius:"8px", padding:"6px 10px", margin:"-4px 0 12px", fontWeight:600 }}>
            {lang === "en" ? "Do the highlighted action above to continue" : "চালিয়ে যেতে উপরে হাইলাইট করা কাজটি করুন"}
          </p>
        )}

        {/* Dots */}
        <div style={{ display:"flex", gap:"4px", justifyContent:"center", marginBottom:"12px" }}>
          {steps.map((_,i) => (
            <div key={i} style={{
              width: i===step?"16px":"6px", height:"5px", borderRadius:"3px",
              background: i < step ? "#86efac" : i===step ? accent : "#E5E7EB",
              transition:"all 0.2s",
            }} />
          ))}
        </div>

        {/* Nav — always show Next */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <button onClick={() => endTour()} style={{ background:"none", border:"none", color:"#9CA3AF", fontSize:"12px", cursor:"pointer", fontFamily:"inherit" }}>
            Skip
          </button>
          <div style={{ display:"flex", gap:"6px" }}>
            {step > 0 && (
              <button
                onClick={e => { e.stopPropagation(); setStep(s=>s-1); }}
                style={{ padding:"6px 12px", borderRadius:"8px", border:"1px solid #E5E7EB", background:"#fff", cursor:"pointer", fontSize:"12px", fontFamily:"inherit", color:"#374151", display:"flex", alignItems:"center", gap:"3px" }}
              >
                <ChevronLeft size={13}/> Back
              </button>
            )}
            <button
              disabled={nextLocked}
              onClick={e => { e.stopPropagation(); if (!nextLocked) goNext(); }}
              style={{
                padding:"6px 14px", borderRadius:"8px", border:"none",
                background: nextLocked ? "#D1D5DB" : accent, color:"#fff",
                cursor: nextLocked ? "not-allowed" : "pointer",
                fontSize:"12px", fontWeight:700, fontFamily:"inherit",
                display:"flex", alignItems:"center", gap:"3px",
              }}
            >
              {step===steps.length-1 ? "Finish" : (<>Next <ChevronRight size={13}/></>)}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
