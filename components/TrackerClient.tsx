"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { deleteWorkoutLog, saveWorkoutLog } from "@/app/tracker/actions";
import type { ExerciseWithDay, WorkoutLog } from "@/lib/types";

type Inputs = Record<string, { weight: string; reps: string; note: string }>;

const GROUP_COLORS: Record<string, { bg: string; text: string }> = {
  صدر:           { bg: "#2a1a2e", text: "#c084fc" },
  ظهر:           { bg: "#162232", text: "#38bdf8" },
  كتف:           { bg: "#1a2816", text: "#86efac" },
  "تراي خفيف":  { bg: "#2a1a1a", text: "#fca5a5" },
  "باي خفيف":   { bg: "#2a2018", text: "#fcd34d" },
  ترايسبس:       { bg: "#2a1a1a", text: "#fca5a5" },
  بايسبس:        { bg: "#2a2018", text: "#fcd34d" },
  أرجل:          { bg: "#181a2a", text: "#818cf8" },
  كوادرسبس:      { bg: "#181a2a", text: "#818cf8" },
  هامسترينج:     { bg: "#1a2a1e", text: "#6ee7b7" },
  سمانة:         { bg: "#262018", text: "#fbbf24" },
  باي:           { bg: "#2a2018", text: "#fcd34d" },
  تراي:          { bg: "#2a1a1a", text: "#fca5a5" },
  ساعد:          { bg: "#1e1a2a", text: "#a78bfa" },
  معصم:          { bg: "#1a2228", text: "#67e8f9" },
  ترابيس:        { bg: "#1e2218", text: "#bbf7d0" },
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

/** Egyptian gym schedule: Sat=1 Sun=2 Mon=3(rest) Tue=4 Wed=5 Thu=6 Fri=7(rest) */
function getTodayProgramDay(): number {
  const map: Record<number, number> = { 6: 1, 0: 2, 1: 3, 2: 4, 3: 5, 4: 6, 5: 7 };
  return map[new Date().getDay()] ?? 1;
}

/* ── PR Celebration Overlay ─────────────────────────────── */
function PrCelebration({ name, weight, onDone }: { name: string; weight: number; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3200);
    return () => clearTimeout(t);
  }, [onDone]);

  const stars = ["✨", "🌟", "⭐", "💫", "🔥"];
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
      style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}
    >
      <div
        className="animate-bounce-in text-center px-8 py-10 rounded-3xl relative"
        style={{
          background: "linear-gradient(135deg, var(--gold-dim), #1a1500)",
          border: "1px solid rgba(240,180,41,0.4)",
          boxShadow: "0 0 60px var(--gold-glow), 0 20px 60px rgba(0,0,0,0.6)"
        }}
      >
        {stars.map((s, i) => (
          <span
            key={i}
            className="absolute text-2xl"
            style={{
              top: `${10 + i * 15}%`,
              left: `${5 + i * 20}%`,
              animation: `float-up ${1.5 + i * 0.3}s ease-out ${i * 0.15}s forwards`,
              opacity: 0
            }}
          >
            {s}
          </span>
        ))}
        <div className="text-6xl mb-3 animate-celebrate" style={{ display: "inline-block" }}>🏆</div>
        <div
          className="text-2xl sm:text-3xl font-bold mb-1"
          style={{ fontFamily: "var(--font-oswald)", color: "var(--gold)" }}
        >
          رقم قياسي جديد!
        </div>
        <div className="text-sm text-[var(--muted)] mb-3 max-w-[220px] mx-auto leading-tight">{name}</div>
        <div
          className="text-5xl sm:text-6xl font-bold gradient-gold"
          style={{ fontFamily: "var(--font-jetbrains)" }}
        >
          {weight} كجم
        </div>
      </div>
    </div>
  );
}

/* ── Undo Toast ─────────────────────────────────────────── */
function UndoToast({ onUndo, onDismiss }: { onUndo: () => void; onDismiss: () => void }) {
  const [progress, setProgress] = useState(100);
  const DURATION = 4000;
  useEffect(() => {
    const start = Date.now();
    const timer = setInterval(() => {
      setProgress(Math.max(0, 100 - ((Date.now() - start) / DURATION) * 100));
    }, 50);
    const done = setTimeout(onDismiss, DURATION);
    return () => { clearInterval(timer); clearTimeout(done); };
  }, [onDismiss]);

  return (
    <div
      className="fixed bottom-6 left-1/2 z-50 animate-slide-up overflow-hidden rounded-2xl"
      style={{
        transform: "translateX(-50%)",
        minWidth: 280,
        background: "var(--surface-raised)",
        border: "1px solid var(--line-bright)",
        boxShadow: "var(--shadow-lg)"
      }}
    >
      <div className="flex items-center justify-between gap-4 px-4 py-3">
        <span className="text-sm text-[var(--text)]">🗑️ تم حذف السجل</span>
        <button
          onClick={onUndo}
          className="rounded-lg px-3 py-1.5 text-xs font-bold text-white"
          style={{
            background: "linear-gradient(135deg, var(--accent), var(--accent-end))",
            boxShadow: "0 2px 10px var(--accent-glow)"
          }}
        >
          تراجع ↩
        </button>
      </div>
      <div className="h-0.5 w-full" style={{ background: "var(--line)" }}>
        <div
          className="h-full"
          style={{
            width: `${progress}%`,
            background: "linear-gradient(90deg, var(--accent), var(--accent-end))",
            transition: "width 0.05s linear"
          }}
        />
      </div>
    </div>
  );
}

/* ── Day Filter Bar ─────────────────────────────────────── */
function DayFilterBar({
  days,
  selectedDay,
  todayDay,
  onSelect
}: {
  days: Array<{ day: number; title: string; isRest: boolean }>;
  selectedDay: number | null;
  todayDay: number;
  onSelect: (day: number | null) => void;
}) {
  return (
    <div
      className="mb-4 rounded-2xl overflow-hidden"
      style={{
        background: "var(--surface)",
        border: "1px solid var(--line)",
        boxShadow: "var(--shadow-sm)"
      }}
    >
      <div className="flex overflow-x-auto p-1.5 gap-1 scrollbar-hide">
        {/* "الكل" button */}
        <button
          onClick={() => onSelect(null)}
          className="shrink-0 rounded-xl px-3 py-2 text-[11px] font-bold transition-all duration-200 whitespace-nowrap flex items-center gap-1"
          style={
            selectedDay === null
              ? {
                  background: "linear-gradient(135deg, var(--accent), var(--accent-end))",
                  color: "white",
                  boxShadow: "0 2px 10px var(--accent-glow)"
                }
              : {
                  background: "var(--surface-raised)",
                  border: "1px solid var(--line)",
                  color: "var(--muted)"
                }
          }
        >
          <span>الكل</span>
        </button>

        {days.map(({ day, title, isRest }) => {
          const isActive = selectedDay === day;
          const isToday = day === todayDay;
          return (
            <button
              key={day}
              onClick={() => onSelect(day)}
              className="shrink-0 rounded-xl py-2 transition-all duration-200 whitespace-nowrap flex items-center gap-1.5"
              style={{
                padding: "8px 10px",
                ...(isActive
                  ? {
                      background: isToday
                        ? "linear-gradient(135deg, var(--gold), #ffd97d)"
                        : "linear-gradient(135deg, var(--accent), var(--accent-end))",
                      color: "white",
                      boxShadow: isToday ? "0 2px 10px var(--gold-glow)" : "0 2px 10px var(--accent-glow)"
                    }
                  : {
                      background: "var(--surface-raised)",
                      border: isToday ? "1px solid rgba(240,180,41,0.35)" : "1px solid var(--line)",
                      color: isToday ? "var(--gold)" : "var(--muted-bright)"
                    })
              }}
            >
              {/* Day number circle */}
              <span
                className="num flex h-5 w-5 items-center justify-center rounded-md text-[10px] font-bold shrink-0"
                style={{ background: isActive ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.06)" }}
              >
                {day}
              </span>
              {/* Title — hidden on very small screens, shown on sm+ */}
              <span className="hidden xs:inline sm:inline text-[11px] font-bold">{title.split(" ")[0]}</span>
              {isToday && <span className="text-[10px] leading-none">🔥</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ── Main Component ─────────────────────────────────────── */
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
  const [isPending, startTransition] = useTransition();
  const [prCelebration, setPrCelebration] = useState<{ name: string; weight: number } | null>(null);
  const [undoLog, setUndoLog] = useState<WorkoutLog | null>(null);
  const [expandedNotes, setExpandedNotes] = useState<Set<string>>(new Set());

  const undoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingDeleteRef = useRef<WorkoutLog | null>(null);

  const todayProgramDay = useMemo(() => getTodayProgramDay(), []);

  // Default to today's day on load
  const [selectedDay, setSelectedDay] = useState<number | null>(todayProgramDay);

  useEffect(() => {
    return () => {
      if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
      if (pendingDeleteRef.current) {
        deleteWorkoutLog(pendingDeleteRef.current.id).catch(() => {});
      }
    };
  }, []);

  const logsByExercise = useMemo(() => {
    return logs.reduce<Record<string, WorkoutLog[]>>((acc, log) => {
      acc[log.exercise_id] ??= [];
      acc[log.exercise_id].push(log);
      acc[log.exercise_id].sort(
        (a, b) => b.logged_at.localeCompare(a.logged_at) || b.created_at.localeCompare(a.created_at)
      );
      return acc;
    }, {});
  }, [logs]);

  // Unique days for the filter bar
  const uniqueDays = useMemo(() => {
    const seen = new Set<number>();
    return exercises
      .filter((e) => !seen.has(e.day) && seen.add(e.day))
      .map((e) => ({ day: e.day, title: e.dayTitle, isRest: false }));
  }, [exercises]);

  // Filtered exercises
  const filteredExercises = useMemo(
    () => (selectedDay === null ? exercises : exercises.filter((e) => e.day === selectedDay)),
    [exercises, selectedDay]
  );

  const toggleNote = (exerciseId: string) => {
    setExpandedNotes((prev) => {
      const next = new Set(prev);
      next.has(exerciseId) ? next.delete(exerciseId) : next.add(exerciseId);
      return next;
    });
  };

  /* ── Save ──────────────────────────────────────────────── */
  const saveLog = (exercise: ExerciseWithDay, best: number) => {
    const current = inputs[exercise.id] ?? { weight: "", reps: "", note: "" };
    if (!current.weight) { setMessage("اكتب الوزن الأول."); return; }
    const parsedWeight = Number(current.weight);
    const isNewPr = parsedWeight > best;

    startTransition(async () => {
      setMessage(null);
      const result = await saveWorkoutLog(exercise.id, current.weight, current.reps, current.note);
      if (!result.ok) { setMessage(result.error); return; }
      if (!result.log) { setMessage("تعذر قراءة السجل بعد الحفظ."); return; }
      setLogs((prev) => [result.log, ...prev]);
      setInputs((prev) => ({ ...prev, [exercise.id]: { weight: "", reps: "", note: "" } }));
      setExpandedNotes((prev) => { const n = new Set(prev); n.delete(exercise.id); return n; });
      if (isNewPr) setPrCelebration({ name: exercise.name, weight: parsedWeight });
    });
  };

  /* ── Delete (with undo) ─────────────────────────────────── */
  const startDeleteLog = (log: WorkoutLog) => {
    setLogs((prev) => prev.filter((l) => l.id !== log.id));
    if (undoTimerRef.current) {
      clearTimeout(undoTimerRef.current);
      if (pendingDeleteRef.current) {
        deleteWorkoutLog(pendingDeleteRef.current.id).catch(() => {});
        pendingDeleteRef.current = null;
      }
    }
    setUndoLog(log);
    pendingDeleteRef.current = log;
    undoTimerRef.current = setTimeout(async () => {
      if (pendingDeleteRef.current?.id === log.id) {
        await deleteWorkoutLog(log.id).catch(() => {});
        pendingDeleteRef.current = null;
      }
      setUndoLog(null);
      undoTimerRef.current = null;
    }, 4000);
  };

  const handleUndo = () => {
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    undoTimerRef.current = null;
    if (undoLog) { setLogs((prev) => [...prev, undoLog]); pendingDeleteRef.current = null; }
    setUndoLog(null);
  };

  let lastDay: number | null = null;

  return (
    <div>
      {prCelebration && (
        <PrCelebration name={prCelebration.name} weight={prCelebration.weight} onDone={() => setPrCelebration(null)} />
      )}
      {undoLog && <UndoToast onUndo={handleUndo} onDismiss={() => setUndoLog(null)} />}

      {/* Error */}
      {message && (
        <div
          className="mb-4 rounded-xl px-4 py-3 text-sm font-semibold animate-slide-in"
          style={{
            border: "1px solid rgba(255,78,66,0.35)",
            background: "linear-gradient(135deg, var(--accent-dim), rgba(61,26,24,0.6))",
            color: "var(--accent)"
          }}
        >
          ⚠️ {message}
        </div>
      )}

      {isPending && (
        <div
          className="mb-4 rounded-xl px-4 py-3 text-sm text-[var(--muted)] animate-fade-in flex items-center gap-2"
          style={{ border: "1px solid var(--line)", background: "var(--surface-raised)" }}
        >
          <span className="inline-block h-4 w-4 rounded-full border-2 border-transparent animate-spin" style={{ borderTopColor: "var(--accent)" }} />
          جاري الحفظ...
        </div>
      )}

      {/* Day filter */}
      <DayFilterBar
        days={uniqueDays}
        selectedDay={selectedDay}
        todayDay={todayProgramDay}
        onSelect={setSelectedDay}
      />

      {/* Exercise list */}
      {filteredExercises.map((exercise, exerciseIdx) => {
        const showDay = exercise.day !== lastDay;
        lastDay = exercise.day;
        const history = logsByExercise[exercise.id] ?? [];
        const best = history.reduce((max, log) => Math.max(max, Number(log.weight) || 0), 0);
        const current = inputs[exercise.id] ?? { weight: "", reps: "", note: "" };
        const isToday = exercise.day === todayProgramDay;
        const showNote = expandedNotes.has(exercise.id);

        return (
          <div key={exercise.id} className="animate-fade-in-up" style={{ animationDelay: `${exerciseIdx * 25}ms` }}>
            {/* Day section header */}
            {showDay && (
              <div className="flex items-center gap-3 mb-3 mt-5 sm:mt-7">
                <div
                  className="font-oswald flex h-[30px] w-[30px] items-center justify-center rounded-lg text-[13px] font-bold text-white shrink-0"
                  style={{
                    background: isToday
                      ? "linear-gradient(135deg, var(--gold), #ffd97d)"
                      : "linear-gradient(135deg, var(--accent), var(--accent-end))",
                    boxShadow: isToday ? "0 2px 10px var(--gold-glow)" : "0 2px 10px var(--accent-glow)"
                  }}
                >
                  {exercise.day}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs sm:text-sm font-bold text-[var(--muted)] uppercase tracking-widest">
                    {exercise.dayTitle}
                  </span>
                  {isToday && (
                    <span
                      className="rounded-full px-2.5 py-0.5 text-[10px] font-bold animate-pulse-gold"
                      style={{
                        background: "var(--gold-dim)",
                        color: "var(--gold)",
                        border: "1px solid rgba(240,180,41,0.35)"
                      }}
                    >
                      🔥 اليوم
                    </span>
                  )}
                </div>
                <div
                  className="flex-1 h-px"
                  style={{
                    background: isToday
                      ? "linear-gradient(90deg, var(--gold) 0%, transparent 70%)"
                      : "linear-gradient(90deg, var(--line-bright) 0%, transparent 100%)"
                  }}
                />
              </div>
            )}

            {/* Exercise card */}
            <section
              className="mb-2.5 overflow-hidden rounded-2xl transition-all duration-200"
              style={{
                border: isToday ? "1px solid rgba(240,180,41,0.18)" : "1px solid var(--line)",
                background: "var(--surface)",
                boxShadow: "var(--shadow-sm)"
              }}
            >
              {/* Card header */}
              <div
                className="px-4 sm:px-5 py-3"
                style={{
                  borderBottom: "1px solid var(--line)",
                  background: isToday
                    ? "linear-gradient(135deg, rgba(240,180,41,0.07) 0%, transparent 100%), var(--surface-raised)"
                    : "linear-gradient(135deg, rgba(255,78,66,0.06) 0%, transparent 100%), var(--surface-raised)"
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
                  <GroupPill group={exercise.group} />
                </div>

                {best > 0 && (
                  <div className="mt-2.5 flex items-center gap-2">
                    <span className="text-[10px] text-[var(--muted)] shrink-0">أعلى وزن</span>
                    <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "var(--line)" }}>
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${Math.min((best / 200) * 100, 100)}%`,
                          background: "linear-gradient(90deg, var(--ok), #34d39966)",
                          boxShadow: "0 0 6px var(--ok-glow)"
                        }}
                      />
                    </div>
                    <span className="num text-[11px] font-bold text-[var(--ok)] shrink-0">{best} كجم</span>
                  </div>
                )}
              </div>

              {/* Input area */}
              <div className="px-4 sm:px-5 pt-3 pb-4">
                <div className="flex items-center gap-2">
                  <input
                    type="number" inputMode="decimal" step="0.5" placeholder="كيلو"
                    value={current.weight}
                    onChange={(e) => setInputs((p) => ({ ...p, [exercise.id]: { ...current, weight: e.target.value } }))}
                    className="num min-w-0 flex-1 rounded-xl px-3 py-2.5 text-[13px] text-[var(--text)] outline-none transition-all duration-200 placeholder:text-[var(--muted)]"
                    style={{ background: "var(--surface-raised)", border: "1px solid var(--line-bright)" }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = "var(--gold)"; e.currentTarget.style.boxShadow = "0 0 0 3px var(--gold-glow)"; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = "var(--line-bright)"; e.currentTarget.style.boxShadow = "none"; }}
                  />
                  <input
                    type="number" inputMode="numeric" placeholder="تكرار"
                    value={current.reps}
                    onChange={(e) => setInputs((p) => ({ ...p, [exercise.id]: { ...current, reps: e.target.value } }))}
                    className="num min-w-0 flex-[1.2] rounded-xl px-3 py-2.5 text-[13px] text-[var(--text)] outline-none transition-all duration-200 placeholder:text-[var(--muted)]"
                    style={{ background: "var(--surface-raised)", border: "1px solid var(--line-bright)" }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = "var(--gold)"; e.currentTarget.style.boxShadow = "0 0 0 3px var(--gold-glow)"; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = "var(--line-bright)"; e.currentTarget.style.boxShadow = "none"; }}
                  />
                  {/* Note toggle button */}
                  <button
                    type="button"
                    onClick={() => toggleNote(exercise.id)}
                    className="shrink-0 rounded-xl px-2.5 py-2.5 text-sm transition-all duration-200"
                    title="أضف ملاحظة"
                    style={{
                      background: showNote ? "var(--gold-dim)" : "var(--surface-raised)",
                      border: showNote ? "1px solid rgba(240,180,41,0.3)" : "1px solid var(--line-bright)",
                      color: showNote ? "var(--gold)" : "var(--muted)"
                    }}
                  >
                    📝
                  </button>
                  <button
                    onClick={() => saveLog(exercise, best)}
                    disabled={isPending}
                    className="shrink-0 rounded-xl px-4 py-2.5 text-[13px] font-bold text-white transition-all duration-200 disabled:cursor-wait disabled:opacity-60"
                    style={{
                      background: "linear-gradient(135deg, var(--accent), var(--accent-end))",
                      boxShadow: "0 4px 14px var(--accent-glow)"
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 6px 20px var(--accent-glow)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 14px var(--accent-glow)"; }}
                  >
                    حفظ
                  </button>
                </div>

                {/* Note field (togglable) */}
                {showNote && (
                  <div className="mt-2 animate-fade-in">
                    <input
                      type="text"
                      placeholder="ملاحظة (اختياري) — مثال: شيلت الكتف اليوم"
                      maxLength={200}
                      value={current.note}
                      onChange={(e) => setInputs((p) => ({ ...p, [exercise.id]: { ...current, note: e.target.value } }))}
                      className="w-full rounded-xl px-3 py-2.5 text-[12px] text-[var(--text)] outline-none transition-all duration-200 placeholder:text-[var(--muted)]"
                      style={{
                        background: "var(--gold-dim)",
                        border: "1px solid rgba(240,180,41,0.25)",
                        color: "var(--text)"
                      }}
                      onFocus={(e) => { e.currentTarget.style.borderColor = "var(--gold)"; e.currentTarget.style.boxShadow = "0 0 0 3px var(--gold-glow)"; }}
                      onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(240,180,41,0.25)"; e.currentTarget.style.boxShadow = "none"; }}
                    />
                  </div>
                )}

                {/* History */}
                {history.length > 0 && (
                  <div className="mt-3 flex flex-col gap-1.5">
                    {history.map((log) => {
                      const isPr = Number(log.weight) === best && best > 0;
                      return (
                        <div
                          key={log.id}
                          className="rounded-xl px-3 py-2 transition-all duration-200"
                          style={{
                            background: isPr
                              ? "linear-gradient(135deg, var(--gold-dim), rgba(45,34,8,0.8))"
                              : "var(--surface-raised)",
                            border: isPr ? "1px solid rgba(240,180,41,0.25)" : "1px solid transparent",
                            boxShadow: isPr ? "0 2px 12px var(--gold-glow)" : "none"
                          }}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="num text-[10px] text-[var(--muted)] shrink-0">{log.logged_at}</span>
                            <span className="text-[12px] text-center flex-1">
                              <b className="num" style={{ color: isPr ? "var(--gold)" : "var(--ok)" }}>
                                {log.weight} كجم
                              </b>
                              <span className="text-[var(--muted)]"> × {log.reps ?? "—"}</span>
                              {isPr && <span className="me-1 text-[11px] font-bold" style={{ color: "var(--gold)" }}> 🏆 PR</span>}
                            </span>
                            <button
                              onClick={() => startDeleteLog(log)}
                              className="shrink-0 px-1.5 font-bold text-[var(--muted)] transition-all duration-150 hover:text-[var(--accent)] text-sm leading-none"
                              aria-label="حذف"
                            >
                              ×
                            </button>
                          </div>
                          {/* Note display */}
                          {log.note && (
                            <div
                              className="mt-1.5 text-[11px] rounded-lg px-2.5 py-1.5"
                              style={{
                                background: "rgba(240,180,41,0.06)",
                                color: "var(--muted-bright)",
                                border: "1px solid rgba(240,180,41,0.12)"
                              }}
                            >
                              📝 {log.note}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {history.length === 0 && (
                  <div className="mt-3 text-[11px] text-[var(--muted)] flex items-center gap-1.5">
                    <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: "var(--line-bright)" }} />
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
