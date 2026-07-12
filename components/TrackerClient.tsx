"use client";

import { useMemo, useState, useTransition } from "react";
import { deleteWorkoutLog, saveWorkoutLog } from "@/app/tracker/actions";
import type { ExerciseWithDay, WorkoutLog } from "@/lib/types";

type Inputs = Record<string, { weight: string; reps: string }>;

const GROUP_COLORS: Record<string, { bg: string; text: string }> = {
  صدر:     { bg: "#2a1a2e", text: "#c084fc" },
  ظهر:     { bg: "#162232", text: "#38bdf8" },
  كتف:     { bg: "#1a2816", text: "#86efac" },
  ترايسبس: { bg: "#2a1a1a", text: "#fca5a5" },
  بايسبس:  { bg: "#2a2018", text: "#fcd34d" },
  أرجل:    { bg: "#181a2a", text: "#818cf8" },
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

export function TrackerClient({
  exercises,
  initialLogs
}: {
  exercises: ExerciseWithDay[];
  initialLogs: WorkoutLog[];
}) {
  const [logs, setLogs] = useState(initialLogs);
  const [inputs, setInputs] = useState<Inputs>({});
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const logsByExercise = useMemo(() => {
    return logs.reduce<Record<string, WorkoutLog[]>>((acc, log) => {
      acc[log.exercise_id] ??= [];
      acc[log.exercise_id].push(log);
      acc[log.exercise_id].sort((a, b) => b.logged_at.localeCompare(a.logged_at) || b.created_at.localeCompare(a.created_at));
      return acc;
    }, {});
  }, [logs]);

  const saveLog = (exerciseId: string) => {
    const current = inputs[exerciseId] ?? { weight: "", reps: "" };
    if (!current.weight) {
      setMessage("اكتب الوزن الأول.");
      return;
    }

    startTransition(async () => {
      setMessage(null);
      const result = await saveWorkoutLog(exerciseId, current.weight, current.reps);

      if (!result.ok) {
        setMessage(result.error);
        return;
      }

      if (!result.log) {
        setMessage("تعذر قراءة السجل بعد الحفظ.");
        return;
      }

      setLogs((existing) => [result.log, ...existing]);
      setInputs((existing) => ({ ...existing, [exerciseId]: { weight: "", reps: "" } }));
    });
  };

  const deleteLog = (logId: string) => {
    startTransition(async () => {
      setMessage(null);
      const result = await deleteWorkoutLog(logId);
      if (!result.ok) {
        setMessage(result.error);
        return;
      }
      setLogs((existing) => existing.filter((log) => log.id !== logId));
    });
  };

  let lastDay: number | null = null;

  return (
    <div>
      {/* Error message */}
      {message && (
        <div
          className="mb-4 rounded-xl px-4 py-3 text-sm font-semibold animate-slide-in"
          style={{
            border: "1px solid rgba(255,78,66,0.35)",
            background: "linear-gradient(135deg, var(--accent-dim) 0%, rgba(61,26,24,0.6) 100%)",
            color: "var(--accent)",
            boxShadow: "0 4px 16px rgba(255,78,66,0.12)"
          }}
        >
          ⚠️ {message}
        </div>
      )}

      {/* Saving indicator */}
      {pending && (
        <div
          className="mb-4 rounded-xl px-4 py-3 text-sm text-[var(--muted)] animate-fade-in flex items-center gap-2"
          style={{
            border: "1px solid var(--line)",
            background: "var(--surface-raised)"
          }}
        >
          <span
            className="inline-block h-4 w-4 rounded-full border-2 border-transparent animate-spin"
            style={{ borderTopColor: "var(--accent)" }}
          />
          جاري الحفظ...
        </div>
      )}

      {exercises.map((exercise, exerciseIdx) => {
        const showDay = exercise.day !== lastDay;
        lastDay = exercise.day;
        const history = logsByExercise[exercise.id] ?? [];
        const best = history.reduce((max, log) => Math.max(max, Number(log.weight) || 0), 0);
        const current = inputs[exercise.id] ?? { weight: "", reps: "" };

        return (
          <div key={exercise.id} className="animate-fade-in-up" style={{ animationDelay: `${exerciseIdx * 30}ms` }}>
            {/* Day separator */}
            {showDay && (
              <div className="flex items-center gap-3 mb-3 mt-5 sm:mt-7">
                <div
                  className="font-oswald flex h-[28px] w-[28px] items-center justify-center rounded-lg text-[13px] font-bold text-white shrink-0"
                  style={{
                    background: "linear-gradient(135deg, var(--accent) 0%, var(--accent-end) 100%)",
                    boxShadow: "0 2px 10px var(--accent-glow)"
                  }}
                >
                  {exercise.day}
                </div>
                <div>
                  <span className="text-xs sm:text-sm font-bold text-[var(--muted)] uppercase tracking-widest">
                    {exercise.dayTitle}
                  </span>
                </div>
                <div
                  className="flex-1 h-px"
                  style={{ background: "linear-gradient(90deg, var(--line-bright) 0%, transparent 100%)" }}
                />
              </div>
            )}

            {/* Exercise card */}
            <section
              className="mb-2.5 overflow-hidden rounded-2xl transition-all duration-200"
              style={{
                border: "1px solid var(--line)",
                background: "var(--surface)",
                boxShadow: "var(--shadow-sm)"
              }}
            >
              {/* Header */}
              <div
                className="px-4 sm:px-5 py-3"
                style={{
                  borderBottom: "1px solid var(--line)",
                  background: "linear-gradient(135deg, rgba(255,78,66,0.06) 0%, transparent 100%), var(--surface-raised)"
                }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-[14px] sm:text-[15px] font-bold leading-snug text-[var(--text)]">
                      {exercise.name}
                    </div>
                    <div className="mt-1 text-[11px] sm:text-[12px] text-[var(--muted)]">
                      {exercise.sets} سيت × {exercise.reps} تكرار
                    </div>
                  </div>
                  <div className="shrink-0 mt-0.5">
                    <GroupPill group={exercise.group} />
                  </div>
                </div>

                {/* Best weight bar */}
                {best > 0 && (
                  <div className="mt-2.5 flex items-center gap-2">
                    <span className="text-[10px] text-[var(--muted)] shrink-0">أعلى وزن</span>
                    <div
                      className="flex-1 h-1.5 rounded-full overflow-hidden"
                      style={{ background: "var(--line)" }}
                    >
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min((best / 200) * 100, 100)}%`,
                          background: "linear-gradient(90deg, var(--ok) 0%, #34d39988 100%)",
                          boxShadow: "0 0 6px var(--ok-glow)"
                        }}
                      />
                    </div>
                    <span className="num text-[11px] font-bold text-[var(--ok)] shrink-0">{best} كجم</span>
                  </div>
                )}
              </div>

              {/* Input row */}
              <div className="px-4 sm:px-5 pt-3 pb-4">
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    inputMode="decimal"
                    step="0.5"
                    placeholder="كيلو"
                    value={current.weight}
                    onChange={(e) =>
                      setInputs((prev) => ({ ...prev, [exercise.id]: { ...current, weight: e.target.value } }))
                    }
                    className="num min-w-0 flex-1 rounded-xl px-3 py-2.5 text-[13px] text-[var(--text)] outline-none transition-all duration-200 placeholder:text-[var(--muted)]"
                    style={{
                      background: "var(--surface-raised)",
                      border: "1px solid var(--line-bright)"
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = "var(--gold)";
                      e.currentTarget.style.boxShadow = "0 0 0 3px var(--gold-glow)";
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = "var(--line-bright)";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  />
                  <input
                    type="number"
                    inputMode="numeric"
                    placeholder="تكرار"
                    value={current.reps}
                    onChange={(e) =>
                      setInputs((prev) => ({ ...prev, [exercise.id]: { ...current, reps: e.target.value } }))
                    }
                    className="num min-w-0 flex-[1.2] rounded-xl px-3 py-2.5 text-[13px] text-[var(--text)] outline-none transition-all duration-200 placeholder:text-[var(--muted)]"
                    style={{
                      background: "var(--surface-raised)",
                      border: "1px solid var(--line-bright)"
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = "var(--gold)";
                      e.currentTarget.style.boxShadow = "0 0 0 3px var(--gold-glow)";
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = "var(--line-bright)";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  />
                  <button
                    onClick={() => saveLog(exercise.id)}
                    disabled={pending}
                    className="shrink-0 rounded-xl px-4 py-2.5 text-[13px] font-bold text-white transition-all duration-200 disabled:cursor-wait disabled:opacity-60"
                    style={{
                      background: "linear-gradient(135deg, var(--accent) 0%, var(--accent-end) 100%)",
                      boxShadow: "0 4px 14px var(--accent-glow)"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-1px)";
                      e.currentTarget.style.boxShadow = "0 6px 20px var(--accent-glow)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "0 4px 14px var(--accent-glow)";
                    }}
                  >
                    حفظ
                  </button>
                </div>

                {/* History */}
                {history.length > 0 && (
                  <div className="mt-3 flex flex-col gap-1.5">
                    {history.map((log) => {
                      const isPr = Number(log.weight) === best && best > 0;
                      return (
                        <div
                          key={log.id}
                          className="flex items-center justify-between gap-2 rounded-xl px-3 py-2 transition-all duration-200"
                          style={{
                            background: isPr
                              ? "linear-gradient(135deg, var(--gold-dim) 0%, rgba(45,34,8,0.8) 100%)"
                              : "var(--surface-raised)",
                            border: isPr
                              ? "1px solid rgba(240,180,41,0.25)"
                              : "1px solid transparent",
                            boxShadow: isPr ? "0 2px 12px var(--gold-glow)" : "none"
                          }}
                        >
                          <span className="num text-[10px] text-[var(--muted)] shrink-0">
                            {log.logged_at}
                          </span>
                          <span className="text-[12px] text-center flex-1">
                            <b
                              className="num"
                              style={{ color: isPr ? "var(--gold)" : "var(--ok)" }}
                            >
                              {log.weight} كجم
                            </b>
                            <span className="text-[var(--muted)]"> × {log.reps ?? "—"}</span>
                            {isPr && (
                              <span className="me-1 text-[11px] font-bold" style={{ color: "var(--gold)" }}>
                                {" "}🏆 PR
                              </span>
                            )}
                          </span>
                          <button
                            onClick={() => deleteLog(log.id)}
                            className="shrink-0 px-1.5 font-bold text-[var(--muted)] transition-all duration-150 hover:text-[var(--accent)] text-sm leading-none rounded"
                            aria-label="حذف السجل"
                          >
                            ×
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}

                {history.length === 0 && (
                  <div className="mt-3 text-[11px] text-[var(--muted)] flex items-center gap-1.5">
                    <span
                      className="inline-block h-1.5 w-1.5 rounded-full"
                      style={{ background: "var(--line-bright)" }}
                    />
                    لسه مفيش سجل — سجّل أول وزن 💪
                  </div>
                )}
              </div>
            </section>
          </div>
        );
      })}
    </div>
  );
}
