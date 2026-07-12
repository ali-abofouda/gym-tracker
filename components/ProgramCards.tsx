"use client";

import { useState } from "react";
import type { ProgramDay, ProgramExercise } from "@/lib/program";
import { ExerciseTipDrawer } from "@/components/ExerciseTipDrawer";
import { EXERCISE_TIPS } from "@/lib/exercise-tips";

const GROUP_COLORS: Record<string, { bg: string; text: string }> = {
  صدر:              { bg: "#2a1a2e", text: "#c084fc" },
  ظهر:              { bg: "#162232", text: "#38bdf8" },
  كتف:              { bg: "#1a2816", text: "#86efac" },
  "تراي خفيف":     { bg: "#2a1a1a", text: "#fca5a5" },
  "باي خفيف":      { bg: "#2a2018", text: "#fcd34d" },
  ترايسبس:          { bg: "#2a1a1a", text: "#fca5a5" },
  بايسبس:           { bg: "#2a2018", text: "#fcd34d" },
  أرجل:             { bg: "#181a2a", text: "#818cf8" },
  كوادرسبس:         { bg: "#181a2a", text: "#818cf8" },
  هامسترينج:        { bg: "#1a2a1e", text: "#6ee7b7" },
  سمانة:            { bg: "#262018", text: "#fbbf24" },
  باي:              { bg: "#2a2018", text: "#fcd34d" },
  تراي:             { bg: "#2a1a1a", text: "#fca5a5" },
  ساعد:             { bg: "#1e1a2a", text: "#a78bfa" },
  معصم:             { bg: "#1a2228", text: "#67e8f9" },
  ترابيس:           { bg: "#1e2218", text: "#bbf7d0" },
  "كتف أمامي/جانبي": { bg: "#1a2816", text: "#86efac" },
  "كتف جانبي":     { bg: "#1a2816", text: "#86efac" },
  "كتف خلفي":      { bg: "#1a2816", text: "#86efac" },
  "كتف أمامي":     { bg: "#1a2816", text: "#86efac" },
};

function GroupPill({ group }: { group: string }) {
  const color = GROUP_COLORS[group] ?? { bg: "var(--accent-dim)", text: "var(--accent)" };
  return (
    <span
      className="inline-block rounded-full px-2 py-0.5 text-[10px] sm:text-[11px] font-semibold"
      style={{ background: color.bg, color: color.text }}
    >
      {group}
    </span>
  );
}

export function ProgramCards({ days }: { days: ProgramDay[] }) {
  const [selectedExercise, setSelectedExercise] = useState<ProgramExercise | null>(null);

  const hasTip = (id: string) => Boolean(EXERCISE_TIPS[id]);

  return (
    <>
      <div className="flex flex-col gap-3">
        {days.map((day, idx) => (
          <section
            key={day.day}
            className="overflow-hidden rounded-2xl animate-fade-in-up"
            style={{
              animationDelay: `${idx * 40}ms`,
              border: "1px solid var(--line)",
              background: "var(--surface)",
              boxShadow: "var(--shadow-sm)"
            }}
          >
            {/* Card header */}
            <div
              className="flex items-center gap-3 px-4 sm:px-5 py-3.5"
              style={{
                borderBottom: "1px solid var(--line)",
                background: day.rest
                  ? "var(--surface-raised)"
                  : "linear-gradient(135deg, rgba(255,78,66,0.08) 0%, rgba(255,122,47,0.04) 100%), var(--surface-raised)"
              }}
            >
              {/* Day number badge */}
              <div
                className="font-oswald flex h-[36px] w-[36px] shrink-0 items-center justify-center rounded-xl text-lg sm:text-xl font-bold"
                style={
                  day.rest
                    ? { border: "1px solid var(--line)", color: "var(--muted)", background: "var(--surface)" }
                    : {
                        background: "linear-gradient(135deg, var(--accent) 0%, var(--accent-end) 100%)",
                        color: "white",
                        boxShadow: "0 4px 12px var(--accent-glow)"
                      }
                }
              >
                {day.day}
              </div>

              <div className="flex-1 min-w-0">
                <div className="text-sm sm:text-[15px] font-bold text-[var(--text)]">{day.title}</div>
                <div className="text-[11px] sm:text-[12px] text-[var(--muted)] mt-0.5">
                  {day.rest
                    ? "🛌 استشفاء عضلي — نوم كويس ومياه"
                    : `${day.exercises.length} تمارين`}
                </div>
              </div>

              {!day.rest && (
                <div
                  className="shrink-0 hidden sm:flex items-center justify-center rounded-lg px-2.5 py-1 text-[11px] font-bold"
                  style={{
                    background: "var(--accent-dim)",
                    color: "var(--accent)",
                    border: "1px solid rgba(255,78,66,0.2)"
                  }}
                >
                  {day.exercises.length} ×
                </div>
              )}
            </div>

            {!day.rest && (
              <>
                {/* Mobile: card list */}
                <div className="divide-y sm:hidden" style={{ borderColor: "var(--line)" }}>
                  {day.exercises.map((exercise) => {
                    const hasT = hasTip(exercise.id);
                    return (
                      <button
                        key={exercise.id}
                        type="button"
                        onClick={() => setSelectedExercise(exercise)}
                        className="w-full flex items-center justify-between gap-3 px-4 py-3 text-right transition-colors"
                        style={{ background: "transparent" }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,78,66,0.04)"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <div className="text-[13px] font-semibold text-[var(--text)] leading-snug">
                              {exercise.name}
                            </div>
                            {hasT && (
                              <span className="text-[10px] text-[var(--muted)]" title="فيه تعليمات">ℹ️</span>
                            )}
                          </div>
                          <div className="mt-1">
                            <GroupPill group={exercise.group} />
                          </div>
                        </div>
                        <div className="shrink-0 flex items-center gap-2">
                          <div className="text-right ltr num text-[12px] text-[var(--muted)] text-nowrap">
                            <span className="text-[var(--text)] font-bold text-[13px]">{exercise.sets}</span>{" "}
                            <span className="text-[10px]">سيت</span>
                            <br />
                            <span className="text-[var(--text)] font-bold text-[13px]">{exercise.reps}</span>{" "}
                            <span className="text-[10px]">تكرار</span>
                          </div>
                          <span className="text-[var(--line-bright)] text-sm">›</span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Desktop: table */}
                <div className="hidden sm:block overflow-x-auto">
                  <table>
                    <thead>
                      <tr style={{ background: "rgba(255,255,255,0.02)" }}>
                        <th>التمرين</th>
                        <th>مجموعات</th>
                        <th>تكرارات</th>
                        <th className="text-center w-16">دليل</th>
                      </tr>
                    </thead>
                    <tbody>
                      {day.exercises.map((exercise) => {
                        const hasT = hasTip(exercise.id);
                        return (
                          <tr
                            key={exercise.id}
                            className="cursor-pointer"
                            onClick={() => setSelectedExercise(exercise)}
                            style={{ transition: "background 0.15s" }}
                            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(255,78,66,0.05)"; }}
                            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = ""; }}
                          >
                            <td className="font-semibold">
                              <span className="text-[var(--text)]">{exercise.name}</span>
                              <span className="me-2 inline-block">
                                <GroupPill group={exercise.group} />
                              </span>
                            </td>
                            <td className="num text-[var(--muted-bright)]">{exercise.sets}</td>
                            <td className="num text-[var(--muted-bright)]">{exercise.reps}</td>
                            <td className="text-center">
                              {hasT ? (
                                <span
                                  className="inline-block rounded-lg px-2 py-0.5 text-[10px] font-bold"
                                  style={{
                                    background: "var(--accent-dim)",
                                    color: "var(--accent)"
                                  }}
                                >
                                  دليل ›
                                </span>
                              ) : (
                                <span className="text-[var(--line-bright)] text-xs">—</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </section>
        ))}
      </div>

      {/* Tip Drawer */}
      <ExerciseTipDrawer
        exercise={selectedExercise}
        onClose={() => setSelectedExercise(null)}
      />
    </>
  );
}
