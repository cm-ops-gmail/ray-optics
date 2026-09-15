# Simulation Learning Journey — Instructions

> **Superseded.** The separate-page journey described below (Stages 1–3,
> `SimulationJourneyIntro`) has been removed — visitors now land directly on
> the live simulator, and each mode teaches itself in place via an
> in-simulator concept onboarding (see `CONCEPT_ONBOARDING`-related code in
> `src/components/RayOptics.tsx`: identify the element on screen, then 3
> physics questions, each answer auto-driving the simulator to that exact
> position and explaining the real result live). Stage 4 (`GuidedTour`,
> strict mode — the mechanical "click here" walkthrough) still exists but no
> longer auto-starts; it's manual-replay only via the "i" button. This
> document is kept for historical context and is not the current behavior.

A generic, reusable learning-journey spec for **any** interactive simulation on
this platform. It is not tied to Lens & Mirror or Refraction specifically —
every new simulation added to the app should be able to plug its own content
into this same six-stage flow.

The goal: never drop a student into a simulation cold. Orient them, teach the
concept, check that it landed, *then* let them drive — and give them a way to
prove mastery afterward.

---

## The journey at a glance

```
1. Orientation  →  2. Concept Teaching  →  3. Understanding Check (3 Qs)
                                                  │
                                     pass (2/3)   │   fail (<2/3)
                                        │         │
                                        ▼         ▼
                          4. Guided Simulation   Re-teach the missed
                             Journey             concept(s), then
                                │                 "Try Again" → back to 3
                                ▼
                          5. Post-Simulation CTA
                          "Ready to test yourself? Take the Assessment"
                                │
                                ▼
                          6. Assessment (simulation-specific quiz)
```

Stages 1–3 run **once per simulation, per user** (first visit only — see
Persistence below). Stage 4 also runs once automatically, but can always be
manually replayed. Stage 6 is always available on demand once Stage 4 is
reachable; it is never auto-triggered.

---

## Stage 1 — Orientation

**Purpose:** Set expectations before anything else happens. The student
should never land directly on a live simulation with no framing.

**Trigger:** First time the user opens this specific simulation (i.e. this
topic has no completed record for them yet).

**Content:** A short, single message — not a quiz, not a lesson yet. Just:

> "সিমুলেশনটি করার আগে চলো একটু বেসিক ধারণা নিয়ে নিই।"
> ("Before we run the simulation, let's build a little basic understanding
> first.")

**UI requirements:**
- One short sentence + a "শুরু করি / Let's Start" action.
- A visible way to skip straight past orientation (a close/skip control) —
  this stage is context-setting, not a gate. Never block a student who
  already knows they want to skip ahead.

**Exit:** Proceeds to Stage 2 automatically on "Start."

---

## Stage 2 — Concept Teaching

**Purpose:** Actually teach the ideas the simulation depends on, before
testing anyone on them. This is new relative to what exists today — it's not
a quiz, and it's not the interactive guide; it's short, readable teaching
content.

**Content requirements (per simulation, must be authored by whoever adds the
simulation):**
- A short list of the **core topics** this simulation covers (e.g. for a
  lens/mirror simulation: what a focal point is, real vs. virtual images,
  converging vs. diverging).
- For each topic: a one-paragraph plain-language explanation. No jargon
  without immediately defining it.
- Optional: a small diagram, icon, or animated illustration per topic if one
  already exists elsewhere in the app (reuse, don't duplicate art).

**UI requirements:**
- Presented as a short, scrollable sequence (cards or a simple carousel) —
  should read in well under a minute total.
- Progress indicator so the student knows how much is left.
- A "পরবর্তী / Next" action per topic, plus a final "এগোই / Continue" once
  all topics are shown.

**Exit:** Proceeds to Stage 3 automatically once the last topic is
acknowledged. Transition line:

> "এখন তো জেনেছো — চলো কিছু প্রশ্নের উত্তর দিই।"
> ("Now that you know this — let's answer a few questions.")

---

## Stage 3 — Understanding Check

**Purpose:** Confirm the concept teaching actually landed, before handing the
student the simulation controls.

**Question count:** exactly **3** questions per attempt, drawn at random from
a larger per-simulation question bank (bank should hold noticeably more than
3 so repeat attempts don't just repeat the same set — 6–10 is a reasonable
minimum).

**Question style:** conceptual/definitional, directly tied to the topics
taught in Stage 2. Not calculation-heavy, not as difficult as the
post-simulation Assessment (Stage 6). Each question needs: the question
text, 3–4 options, the correct index, and a short "why" explanation used for
both in-the-moment feedback and remediation.

**Pass threshold:** **2 out of 3 correct** (≈67%). This is stricter than a
simple majority — deliberately, since this check gates the interactive
journey.

**On pass:**
- Brief positive confirmation, then **immediately** proceed to Stage 4 (no
  extra button-hunting — the transition should feel instant).

**On fail (0 or 1 correct):**
- Do **not** offer a way to skip straight to the simulation. This is the one
  hard gate in the whole journey — everything else stays skippable, this
  stage does not, by design (it's the whole point of the check).
- Show which questions were missed, and for each, the concept explanation
  again — i.e. re-teach, don't just say "wrong."
- Single action: "আবার চেষ্টা করো / Try Again" — draws a **fresh** random
  set of 3 from the bank and restarts Stage 3.
- No attempt limit. A student can retry as many times as it takes.

**Persistence:** Only write "passed" to storage when the student actually
clears the 2/3 bar. Skipping, failing, or closing the check must **not**
mark it done — so it reappears next visit for anyone who hasn't yet passed.
(This mirrors the existing `PrerequisiteQuiz` component's persistence rule —
see Relationship to Existing Code below.)

---

## Stage 4 — Guided Simulation Journey

**Purpose:** The hands-on part. A step-by-step, interactive walkthrough where
the student actually operates the simulation, with each required action
genuinely gating progress (not just informational).

**This stage already exists in this codebase** (`GuidedTour` in `strict`
mode, driven by a `..._SIM_GUIDE` step array per simulation type). Reuse it
as-is — this document doesn't change its behavior, only formalizes where it
sits in the larger journey:

- Auto-starts immediately on Stage 3 pass.
- Steps requiring an action (`waitForClick`) block "Next" until the student
  actually performs it — selecting a mode, toggling a control, placing an
  object, etc.
- Ends with a small celebration + a short recap of what was learned,
  matching what's already built for Lens & Mirror.
- Always manually replayable later (the existing "i" info button pattern).

**Content requirements (per simulation):** a short (4–6 step) sequence of
`{selector, title, desc, waitForClick}` entries describing the real actions
a first-time user should take in that simulation.

---

## Stage 5 — Post-Simulation CTA

**Purpose:** Offer a natural next step once the guided journey ends, without
forcing it.

**Content:** A single, clearly-labeled button, shown after Stage 4 completes
(and persistently available afterward — e.g. in the simulation's toolbar):

> "প্রস্তুত হলে অ্যাসেসমেন্ট দাও / Ready? Take the Assessment"

**UI requirements:**
- Not a popup, not auto-triggered — this is an invitation, not a gate. The
  student should be free to keep playing with the simulation indefinitely
  before ever clicking it.
- Visually distinct from the ordinary simulation controls so it reads as "a
  thing you can choose to do," not part of the simulation itself.

**Exit:** Clicking it opens Stage 6.

---

## Stage 6 — Assessment

**Purpose:** Let a student who wants to prove mastery do so, with real
stakes — this is deliberately harder and more thorough than Stage 3.

**This maps to the existing "Lab Test" feature** already built for Lens &
Mirror (`labMode` states, `QUEST_POOL`, scored quiz rounds). Under this
journey it should be reframed as something the student *arrives at* via the
Stage 5 CTA specifically, rather than something always sitting in the header
— though keeping a persistent entry point (like the current header button)
alongside the Stage 5 CTA is fine; they're not mutually exclusive.

**Content requirements (per simulation):** a question bank scoped to that
simulation's actual mechanics (not just definitions — apply the concept,
read values off the simulation, etc.), scored, with a result/leaderboard
screen at the end.

---

## Persistence rules (summary)

| Stage | Stored when | Storage key pattern |
|---|---|---|
| 1–3 (orientation → check) | Only on Stage 3 **pass** | `prereq_done_<simulation-id>` |
| 4 (guided journey) | On finish *or* explicit skip | `onboarding_done_<simulation-id>` |
| 5–6 (CTA / assessment) | Not gated — no completion flag needed; re-takeable anytime |

Each simulation gets its **own** key for stages 1–3 and its own for stage 4
— completing the journey for one simulation must never suppress it for
another. (This per-simulation isolation is already implemented for Lens &
Mirror vs. Refraction; extend the same pattern to any simulation added
later.)

---

## Content checklist for adding a new simulation to this journey

Whoever wires up a new simulation needs to supply:

- [ ] 1 orientation sentence (bn + en)
- [ ] A topics list for Stage 2 (each: title + one-paragraph explanation, bn + en)
- [ ] A Stage 3 question bank, **6–10 questions minimum** (each: question,
      3–4 options, correct index, short "why" explanation, bn + en)
- [ ] A Stage 4 guided-journey step array (4–6 steps, selectors matching
      that simulation's actual DOM, bn + en)
- [ ] A Stage 6 assessment question bank scoped to that simulation
- [ ] Two storage-key suffixes (a short unique id for that simulation) for
      the persistence table above

---

## Relationship to what's already built

This spec **extends** the current implementation rather than replacing it —
two adjustments needed to match it exactly:

1. **`PrerequisiteQuiz`** currently asks 5 questions with a >50% pass bar and
   no "always allow skip past a fail" removed (already fixed) — this spec
   calls for **3 questions, 2/3 to pass**, and adds an explicit **Concept
   Teaching stage (Stage 2)** before the quiz that doesn't exist yet today.
2. **Lab Test** already implements Stage 6's mechanics closely — mainly
   needs reframing as something reached via a Stage 5 CTA rather than only a
   standing header button.

Everything else described here (guided journey behavior, per-simulation
persistence isolation, never-hard-block-except-the-one-gate philosophy)
already matches the current implementation.
