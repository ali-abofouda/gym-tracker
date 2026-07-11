"use client";

import { useMemo, useState, useTransition } from "react";
import { deleteWorkoutLog, saveWorkoutLog } from "@/app/tracker/actions";
import type { ExerciseWithDay, WorkoutLog } from "@/lib/types";

type Inputs = Record<string, { weight: string; reps: string }>;

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
      {message && <div className="mb-3 rounded-lg border border-accent bg-accent-dim px-4 py-3 text-sm text-accent">{message}</div>}
      {pending && <div className="mb-3 rounded-lg border border-line bg-raised px-4 py-3 text-sm text-muted">جاري الحفظ...</div>}

      {exercises.map((exercise) => {
        const showDay = exercise.day !== lastDay;
        lastDay = exercise.day;
        const history = logsByExercise[exercise.id] ?? [];
        const best = history.reduce((max, log) => Math.max(max, Number(log.weight) || 0), 0);
        const current = inputs[exercise.id] ?? { weight: "", reps: "" };

        return (
          <div key={exercise.id}>
            {showDay && (
              <h3 className="mb-2 mt-[22px] text-sm text-muted">
                اليوم {exercise.day} - {exercise.dayTitle}
              </h3>
            )}
            <section className="mb-2.5 overflow-hidden rounded-xl border border-line bg-surface">
              <div className="border-b border-line bg-raised px-4 py-3">
                <div className="text-[14.5px] font-bold">{exercise.name}</div>
                <div className="text-[12.5px] text-muted">
                  {exercise.sets} × {exercise.reps}
                  <span className="me-1.5 inline-block rounded-full bg-accent-dim px-2 py-0.5 text-[11px] font-semibold text-accent">
                    {exercise.group}
                  </span>
                </div>
              </div>

              <div className="px-4 pb-3.5 pt-2.5">
                <div className="flex flex-wrap items-center gap-2 border-t border-line py-2.5">
                  <input
                    type="number"
                    step="0.5"
                    placeholder="كيلو"
                    value={current.weight}
                    onChange={(event) => setInputs((existing) => ({ ...existing, [exercise.id]: { ...current, weight: event.target.value } }))}
                    className="num w-0 flex-1 min-w-[70px] sm:w-[78px] sm:flex-none rounded-md border border-line bg-raised px-2.5 py-2 text-[13px] text-text outline-none transition placeholder:text-[#565a63] focus:border-gold"
                  />
                  <input
                    type="number"
                    placeholder="عدد تكرارات"
                    value={current.reps}
                    onChange={(event) => setInputs((existing) => ({ ...existing, [exercise.id]: { ...current, reps: event.target.value } }))}
                    className="num w-0 flex-[1.3] min-w-[90px] sm:w-28 sm:flex-none rounded-md border border-line bg-raised px-2.5 py-2 text-[13px] text-text outline-none transition placeholder:text-[#565a63] focus:border-gold"
                  />
                  <button
                    onClick={() => saveLog(exercise.id)}
                    disabled={pending}
                    className="rounded-md bg-accent px-3.5 py-2 text-[13px] font-bold text-white transition hover:bg-[#c73438] disabled:cursor-wait disabled:opacity-70 flex-none"
                  >
                    حفظ
                  </button>
                </div>

                <div className="mt-2 flex flex-col gap-1.5">
                  {history.length ? (
                    history.map((log) => {
                      const isPr = Number(log.weight) === best && best > 0;
                      return (
                        <div key={log.id} className="flex items-center justify-between gap-2 rounded-md bg-raised px-2.5 py-1.5 text-[12.5px] text-muted">
                          <span className="num">{log.logged_at}</span>
                          <span>
                            <b className={isPr ? "text-ok" : "text-text"}>{log.weight} كجم</b> × {log.reps ?? "-"} تكرار {isPr ? " 🏆" : ""}
                          </span>
                          <button onClick={() => deleteLog(log.id)} className="px-1 font-bold text-[#6b6f78] transition hover:text-accent" aria-label="حذف السجل">
                            ×
                          </button>
                        </div>
                      );
                    })
                  ) : (
                    <div className="py-1 text-xs text-[#565a63]">لسه مفيش سجل - سجّل أول وزن</div>
                  )}
                </div>
              </div>
            </section>
          </div>
        );
      })}
    </div>
  );
}
