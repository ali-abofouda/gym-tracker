"use client";

import { useMemo, useState } from "react";
import type { ExerciseWithDay, WorkoutLog } from "@/lib/types";

/* ── SVG Line Chart ─────────────────────────────────────── */
function LineChart({
  data,
  accentColor = "#FF4E42",
  gradientId
}: {
  data: Array<{ date: string; weight: number }>;
  accentColor?: string;
  gradientId: string;
}) {
  const [hovered, setHovered] = useState<number | null>(null);

  if (data.length === 0) return null;

  const W = 560, H = 190;
  const PT = 18, PR = 16, PB = 38, PL = 42;
  const cW = W - PL - PR;
  const cH = H - PT - PB;

  const weights = data.map((d) => d.weight);
  const rawMin = Math.min(...weights);
  const rawMax = Math.max(...weights);
  const padding = (rawMax - rawMin) * 0.15 || 5;
  const minW = rawMin - padding;
  const maxW = rawMax + padding;
  const range = maxW - minW;

  const sx = (i: number) => PL + (i / Math.max(data.length - 1, 1)) * cW;
  const sy = (w: number) => PT + cH - ((w - minW) / range) * cH;

  // Smooth bezier path
  const pts = data.map((d, i) => ({ x: sx(i), y: sy(d.weight) }));
  let linePath = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < pts.length; i++) {
    const cx = (pts[i - 1].x + pts[i].x) / 2;
    linePath += ` C ${cx} ${pts[i - 1].y}, ${cx} ${pts[i].y}, ${pts[i].x} ${pts[i].y}`;
  }
  const areaPath = `${linePath} L ${pts[pts.length - 1].x} ${PT + cH} L ${PL} ${PT + cH} Z`;

  // Y ticks
  const yTicks = [0, 0.33, 0.66, 1].map((t) => ({
    y: sy(minW + t * range),
    label: Math.round(minW + t * range)
  }));

  // X labels (max ~6 shown)
  const step = Math.max(1, Math.ceil(data.length / 5));
  const xLabels = data.map((_, i) => {
    if (i === 0 || i === data.length - 1 || i % step === 0) return i;
    return null;
  }).filter((v): v is number => v !== null);

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        style={{ minWidth: Math.max(data.length * 55, 300), height: 190 }}
        className="w-full"
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={accentColor} stopOpacity="0.28" />
            <stop offset="100%" stopColor={accentColor} stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {yTicks.map((tick, i) => (
          <g key={i}>
            <line
              x1={PL} y1={tick.y} x2={W - PR} y2={tick.y}
              stroke="#252830" strokeWidth="1" strokeDasharray="4 3"
            />
            <text x={PL - 6} y={tick.y + 4} textAnchor="end" fill="#7a7f8c" fontSize="10">
              {tick.label}
            </text>
          </g>
        ))}

        {/* Area fill */}
        <path d={areaPath} fill={`url(#${gradientId})`} />

        {/* Line */}
        <path
          d={linePath}
          fill="none"
          stroke={accentColor}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Hover vertical line */}
        {hovered !== null && (
          <line
            x1={pts[hovered].x} y1={PT}
            x2={pts[hovered].x} y2={PT + cH}
            stroke={accentColor} strokeWidth="1" strokeDasharray="3 3" opacity="0.5"
          />
        )}

        {/* Data points */}
        {pts.map((pt, i) => (
          <g key={i} style={{ cursor: "crosshair" }}>
            <circle
              cx={pt.x} cy={pt.y} r={hovered === i ? 7 : 4.5}
              fill="var(--bg)" stroke={accentColor}
              strokeWidth={hovered === i ? 3 : 2.5}
              style={{ transition: "r 0.15s, stroke-width 0.15s" }}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            />

            {/* Tooltip */}
            {hovered === i && (() => {
              const tipW = 90, tipH = 34;
              const tipX = Math.min(Math.max(pt.x - tipW / 2, PL), W - PR - tipW);
              const tipY = pt.y - tipH - 10;
              return (
                <g>
                  <rect x={tipX} y={tipY} width={tipW} height={tipH} rx="6"
                    fill="var(--surface-raised)" stroke={accentColor} strokeWidth="1" strokeOpacity="0.5" />
                  <text x={tipX + tipW / 2} y={tipY + 13} textAnchor="middle" fill={accentColor} fontSize="11" fontWeight="bold">
                    {data[i].weight} كجم
                  </text>
                  <text x={tipX + tipW / 2} y={tipY + 26} textAnchor="middle" fill="#7a7f8c" fontSize="9">
                    {data[i].date.slice(5).replace("-", "/")}
                  </text>
                </g>
              );
            })()}
          </g>
        ))}

        {/* X axis labels */}
        {xLabels.map((i) => (
          <text key={i} x={pts[i].x} y={H - 6} textAnchor="middle" fill="#7a7f8c" fontSize="9">
            {data[i].date.slice(5).replace("-", "/")}
          </text>
        ))}
      </svg>
    </div>
  );
}

/* ── Stat Card ──────────────────────────────────────────── */
function StatCard({
  label,
  value,
  sub,
  icon,
  color
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: string;
  color: string;
}) {
  return (
    <div
      className="rounded-2xl p-4 flex flex-col gap-1.5"
      style={{
        background: "var(--surface)",
        border: "1px solid var(--line)",
        boxShadow: "var(--shadow-sm)"
      }}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs text-[var(--muted)] font-semibold uppercase tracking-wide">{label}</span>
        <span className="text-lg">{icon}</span>
      </div>
      <div
        className="text-2xl sm:text-3xl font-bold num"
        style={{ color }}
      >
        {value}
      </div>
      {sub && <div className="text-[11px] text-[var(--muted)] leading-tight truncate">{sub}</div>}
    </div>
  );
}

/* ── Main Component ─────────────────────────────────────── */
export function StatsClient({
  exercises,
  logs
}: {
  exercises: ExerciseWithDay[];
  logs: WorkoutLog[];
}) {
  const exerciseMap = useMemo(() =>
    Object.fromEntries(exercises.map((e) => [e.id, e])),
    [exercises]
  );

  const {
    totalLogs,
    activeDays,
    heaviestLift,
    prByExercise,
    exercisesWithLogs,
    historyByExercise,
    logCountByExercise
  } = useMemo(() => {
    const totalLogs = logs.length;
    const activeDays = new Set(logs.map((l) => l.logged_at)).size;

    // PR per exercise
    const prByExercise: Record<string, { weight: number; reps: number | null; date: string }> = {};
    for (const log of logs) {
      const cur = prByExercise[log.exercise_id];
      if (!cur || Number(log.weight) > cur.weight) {
        prByExercise[log.exercise_id] = {
          weight: Number(log.weight),
          reps: log.reps,
          date: log.logged_at
        };
      }
    }

    // Heaviest lift
    let heaviestLift: { exerciseId: string; weight: number } | null = null;
    for (const [id, pr] of Object.entries(prByExercise)) {
      if (!heaviestLift || pr.weight > heaviestLift.weight) {
        heaviestLift = { exerciseId: id, weight: pr.weight };
      }
    }

    // Log count per exercise
    const logCountByExercise: Record<string, number> = {};
    for (const log of logs) {
      logCountByExercise[log.exercise_id] = (logCountByExercise[log.exercise_id] ?? 0) + 1;
    }

    // Exercises that have logs, sorted by log count desc
    const exercisesWithLogs = exercises
      .filter((e) => logCountByExercise[e.id] > 0)
      .sort((a, b) => (logCountByExercise[b.id] ?? 0) - (logCountByExercise[a.id] ?? 0));

    // History per exercise: max weight per date
    const historyByExercise: Record<string, Array<{ date: string; weight: number }>> = {};
    for (const log of logs) {
      historyByExercise[log.exercise_id] ??= [];
      historyByExercise[log.exercise_id].push({ date: log.logged_at, weight: Number(log.weight) });
    }
    for (const id of Object.keys(historyByExercise)) {
      const byDate: Record<string, number> = {};
      for (const h of historyByExercise[id]) {
        byDate[h.date] = Math.max(byDate[h.date] ?? 0, h.weight);
      }
      historyByExercise[id] = Object.entries(byDate)
        .map(([date, weight]) => ({ date, weight }))
        .sort((a, b) => a.date.localeCompare(b.date));
    }

    return { totalLogs, activeDays, heaviestLift, prByExercise, exercisesWithLogs, historyByExercise, logCountByExercise };
  }, [logs, exercises]);

  const [selectedId, setSelectedId] = useState<string>(exercisesWithLogs[0]?.id ?? "");

  const chartData = historyByExercise[selectedId] ?? [];

  // Sort PRs by weight descending for the hall of fame
  const sortedPrs = Object.entries(prByExercise)
    .map(([id, pr]) => ({ id, ...pr, exercise: exerciseMap[id] }))
    .filter((e) => e.exercise)
    .sort((a, b) => b.weight - a.weight);

  const heaviestExerciseName = heaviestLift
    ? exerciseMap[heaviestLift.exerciseId]?.name ?? "—"
    : "—";

  if (logs.length === 0) {
    return (
      <div
        className="rounded-2xl p-12 text-center animate-fade-in"
        style={{ border: "1px solid var(--line)", background: "var(--surface)" }}
      >
        <div className="text-5xl mb-4">📊</div>
        <h2 className="text-xl font-bold text-[var(--text)] mb-2">لسه مفيش بيانات</h2>
        <p className="text-sm text-[var(--muted)]">
          ابدأ بتسجيل الأوزان من صفحة <b>الأوزان</b> وهتلاقي إحصائياتك هنا.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">

      {/* ── Header ── */}
      <div
        className="rounded-2xl px-5 py-5 animate-fade-in-up"
        style={{
          border: "1px solid var(--line)",
          background: "linear-gradient(135deg, rgba(240,180,41,0.06) 0%, rgba(255,78,66,0.04) 100%), var(--surface)",
          boxShadow: "var(--shadow-sm)"
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="flex h-11 w-11 items-center justify-center rounded-xl text-2xl shrink-0"
            style={{
              background: "linear-gradient(135deg, var(--gold), #ffd97d)",
              boxShadow: "0 4px 14px var(--gold-glow)"
            }}
          >
            📊
          </div>
          <div>
            <h2 className="m-0 text-xl sm:text-2xl font-bold text-[var(--text)]">إحصائياتي الشخصية</h2>
            <p className="mt-0.5 text-sm text-[var(--muted)]">تتبع تقدمك وأرقامك القياسية</p>
          </div>
        </div>
      </div>

      {/* ── Summary Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          label="السجلات الكلية"
          value={totalLogs}
          icon="📝"
          color="var(--text)"
        />
        <StatCard
          label="أيام النشاط"
          value={activeDays}
          icon="📅"
          color="var(--ok)"
        />
        <StatCard
          label="أعلى وزن رفعته"
          value={heaviestLift ? `${heaviestLift.weight} كجم` : "—"}
          sub={heaviestExerciseName}
          icon="🏋️"
          color="var(--gold)"
        />
        <StatCard
          label="تمارين مسجلة"
          value={exercisesWithLogs.length}
          sub={`من أصل ${exercises.length}`}
          icon="✅"
          color="var(--accent)"
        />
      </div>

      {/* ── Weight Progress Chart ── */}
      <div
        className="rounded-2xl overflow-hidden animate-fade-in-up"
        style={{
          border: "1px solid var(--line)",
          background: "var(--surface)",
          boxShadow: "var(--shadow-sm)"
        }}
      >
        {/* Section header */}
        <div
          className="flex items-center gap-2 px-5 py-4"
          style={{
            borderBottom: "1px solid var(--line)",
            background: "var(--surface-raised)"
          }}
        >
          <span className="text-lg">📈</span>
          <h3 className="m-0 text-base sm:text-lg font-bold text-[var(--text)]">تقدم الأوزان</h3>
        </div>

        <div className="p-4">
          {/* Exercise selector */}
          <div className="mb-4 flex flex-wrap gap-2">
            {exercisesWithLogs.slice(0, 12).map((ex) => (
              <button
                key={ex.id}
                onClick={() => setSelectedId(ex.id)}
                className="rounded-xl px-3 py-1.5 text-[11px] sm:text-xs font-bold transition-all duration-200"
                style={
                  selectedId === ex.id
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
                {ex.name}
                <span
                  className="ms-1.5 rounded-full px-1.5 text-[9px]"
                  style={{
                    background: selectedId === ex.id ? "rgba(255,255,255,0.2)" : "var(--line)",
                    color: selectedId === ex.id ? "white" : "var(--muted)"
                  }}
                >
                  {logCountByExercise[ex.id] ?? 0}
                </span>
              </button>
            ))}
          </div>

          {/* Chart */}
          {selectedId && chartData.length > 0 ? (
            <div
              className="rounded-xl p-3 overflow-hidden"
              style={{ background: "var(--surface-raised)", border: "1px solid var(--line)" }}
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-bold text-[var(--text)]">
                  {exerciseMap[selectedId]?.name}
                </span>
                <span className="num text-xs text-[var(--ok)] font-bold">
                  PR: {prByExercise[selectedId]?.weight} كجم
                </span>
              </div>
              <LineChart
                data={chartData}
                accentColor="#FF4E42"
                gradientId={`chart-${selectedId}`}
              />
            </div>
          ) : (
            <div className="text-center py-8 text-sm text-[var(--muted)]">
              اختار تمرين من فوق
            </div>
          )}
        </div>
      </div>

      {/* ── Hall of Fame (PRs) ── */}
      <div
        className="rounded-2xl overflow-hidden animate-fade-in-up"
        style={{
          border: "1px solid var(--line)",
          background: "var(--surface)",
          boxShadow: "var(--shadow-sm)"
        }}
      >
        <div
          className="flex items-center gap-2 px-5 py-4"
          style={{
            borderBottom: "1px solid var(--line)",
            background: "linear-gradient(135deg, rgba(240,180,41,0.06) 0%, transparent 100%), var(--surface-raised)"
          }}
        >
          <span className="text-lg">🏆</span>
          <h3 className="m-0 text-base sm:text-lg font-bold text-[var(--text)]">أعلى الأوزان — Hall of Fame</h3>
        </div>

        <div className="divide-y" style={{ borderColor: "var(--line)" }}>
          {sortedPrs.map((entry, rank) => {
            const isFirst = rank === 0;
            const isSecond = rank === 1;
            const isThird = rank === 2;
            const medal = isFirst ? "🥇" : isSecond ? "🥈" : isThird ? "🥉" : null;

            return (
              <div
                key={entry.id}
                className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3 transition-colors"
                style={{
                  background: isFirst
                    ? "linear-gradient(135deg, rgba(240,180,41,0.06) 0%, transparent 100%)"
                    : "transparent"
                }}
              >
                {/* Rank + name */}
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-base shrink-0 w-6 text-center">
                    {medal ?? <span className="num text-[11px] text-[var(--muted)]">{rank + 1}</span>}
                  </span>
                  <div className="min-w-0">
                    <div className="text-[13px] font-semibold text-[var(--text)] truncate leading-snug">
                      {entry.exercise.name}
                    </div>
                    <div className="text-[10px] text-[var(--muted)]">
                      يوم {entry.exercise.day} · {entry.date}
                    </div>
                  </div>
                </div>

                {/* Weight + reps */}
                <div className="shrink-0 text-left" dir="ltr">
                  <div
                    className="num text-sm font-bold"
                    style={{ color: isFirst ? "var(--gold)" : isSecond || isThird ? "var(--ok)" : "var(--text)" }}
                  >
                    {entry.weight} kg
                  </div>
                  {entry.reps && (
                    <div className="num text-[10px] text-[var(--muted)]">× {entry.reps}</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
