"use client";

import { useEffect, useRef, useMemo } from "react";
import type { ProgramExercise } from "@/lib/program";
import { EXERCISE_TIPS } from "@/lib/exercise-tips";
import { PROGRAM } from "@/lib/program";

// Build a name → tip lookup once at module level (avoids require() in render)
const NAME_TO_TIP_ID: Record<string, string> = {};
for (const day of PROGRAM) {
  for (const ex of day.exercises) {
    NAME_TO_TIP_ID[ex.name.toLowerCase().trim()] = ex.id;
  }
}

function getTip(exercise: ProgramExercise) {
  // 1. Exact ID match (hard-coded IDs from program.ts)
  if (EXERCISE_TIPS[exercise.id]) return EXERCISE_TIPS[exercise.id];
  // 2. Name-based lookup (for DB-sourced IDs that differ from hard-coded ones)
  const mappedId = NAME_TO_TIP_ID[exercise.name.toLowerCase().trim()];
  if (mappedId && EXERCISE_TIPS[mappedId]) return EXERCISE_TIPS[mappedId];
  return undefined;
}

function Section({
  icon, title, color, children
}: { icon: string; title: string; color: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${color}28`, background: `${color}08` }}>
      <div className="flex items-center gap-2 px-4 py-3" style={{ borderBottom: `1px solid ${color}20`, background: `${color}10` }}>
        <span className="text-base">{icon}</span>
        <span className="text-xs font-bold uppercase tracking-wide" style={{ color }}>{title}</span>
      </div>
      <div className="px-4 py-3">{children}</div>
    </div>
  );
}

export function ExerciseTipDrawer({
  exercise,
  onClose
}: {
  exercise: ProgramExercise | null;
  onClose: () => void;
}) {
  const tip = useMemo(() => exercise ? getTip(exercise) : undefined, [exercise]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  // Lock scroll
  useEffect(() => {
    if (!exercise) return;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, [exercise]);

  if (!exercise) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(6px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="relative w-full sm:max-w-lg max-h-[90dvh] sm:max-h-[85vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl animate-drawer-up sm:animate-modal-in"
        style={{
          background: "var(--surface)",
          border: "1px solid var(--line-bright)",
          boxShadow: "0 -8px 60px rgba(0,0,0,0.6)"
        }}
      >
        {/* Drag handle — mobile only */}
        <div className="flex justify-center pt-3 sm:hidden">
          <div className="h-1 w-10 rounded-full" style={{ background: "var(--line-bright)" }} />
        </div>

        {/* Header */}
        <div className="flex items-start justify-between gap-3 px-5 pt-4 pb-4" style={{ borderBottom: "1px solid var(--line)" }}>
          <div className="min-w-0">
            <div className="text-[10px] font-bold uppercase tracking-[2px] mb-1" style={{ color: "var(--accent)" }}>
              دليل الأداء
            </div>
            <h2 className="m-0 text-lg sm:text-xl font-bold leading-tight" style={{ fontFamily: "var(--font-oswald)", color: "var(--text)" }}>
              {exercise.name}
            </h2>
            {tip && (
              <p className="mt-1 text-[11px] leading-relaxed m-0" style={{ color: "var(--muted)" }}>
                🎯 {tip.muscles}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="shrink-0 rounded-xl h-8 w-8 flex items-center justify-center text-lg font-bold"
            style={{ border: "1px solid var(--line)", color: "var(--muted)", background: "var(--surface-raised)" }}
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-col gap-3 p-5">
          {tip ? (
            <>
              <Section icon="✅" title="نقاط الأداء الصح" color="#34D399">
                <ul className="flex flex-col gap-2 m-0 p-0 list-none">
                  {tip.cues.map((cue, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-[13px]" style={{ color: "var(--text)" }}>
                      <span className="shrink-0 mt-0.5 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold" style={{ background: "#34D39920", color: "#34D399" }}>
                        {i + 1}
                      </span>
                      <span className="leading-relaxed">{cue}</span>
                    </li>
                  ))}
                </ul>
              </Section>

              <Section icon="⚠️" title="أكثر الأخطاء الشائعة" color="#FF4E42">
                <ul className="flex flex-col gap-2 m-0 p-0 list-none">
                  {tip.mistakes.map((mistake, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-[13px]" style={{ color: "var(--text)" }}>
                      <span className="shrink-0 mt-1 h-1.5 w-1.5 rounded-full" style={{ background: "var(--accent)" }} />
                      <span className="leading-relaxed">{mistake}</span>
                    </li>
                  ))}
                </ul>
              </Section>

              <div className="rounded-2xl px-4 py-4 flex gap-3" style={{ background: "linear-gradient(135deg, var(--gold-dim), rgba(45,34,8,0.5))", border: "1px solid rgba(240,180,41,0.25)" }}>
                <span className="text-xl shrink-0">💡</span>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: "var(--gold)" }}>نصيحة الخبراء</div>
                  <p className="text-[13px] leading-relaxed m-0" style={{ color: "var(--text)" }}>{tip.pro_tip}</p>
                </div>
              </div>
            </>
          ) : (
            <div className="rounded-2xl px-4 py-6 text-center" style={{ background: "var(--surface-raised)", border: "1px solid var(--line)" }}>
              <div className="text-4xl mb-2">🏋️</div>
              <p className="text-sm text-[var(--muted)] m-0">ركز على الأداء الكامل والتحكم في الوزن.</p>
            </div>
          )}

          {/* Sets & Reps reminder */}
          <div className="rounded-2xl px-4 py-3 flex items-center justify-between" style={{ background: "var(--surface-raised)", border: "1px solid var(--line)" }}>
            <span className="text-xs text-[var(--muted)]">في برنامجك</span>
            <div className="flex gap-4">
              <div className="text-center">
                <div className="num text-lg font-bold" style={{ color: "var(--accent)" }}>{exercise.sets}</div>
                <div className="text-[10px] text-[var(--muted)]">سيت</div>
              </div>
              <div className="w-px" style={{ background: "var(--line)" }} />
              <div className="text-center">
                <div className="num text-lg font-bold" style={{ color: "var(--ok)" }}>{exercise.reps}</div>
                <div className="text-[10px] text-[var(--muted)]">تكرار</div>
              </div>
            </div>
          </div>
        </div>

        <div className="px-5 pb-6">
          <button
            onClick={onClose}
            className="w-full rounded-2xl py-3.5 text-sm font-bold"
            style={{ background: "var(--surface-raised)", border: "1px solid var(--line)", color: "var(--muted)" }}
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
}
