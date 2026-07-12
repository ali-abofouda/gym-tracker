"use client";

import { useState, useTransition } from "react";
import { saveBodyWeight, deleteBodyWeightLog } from "@/app/stats/actions";
import type { BodyWeightLog } from "@/lib/types";

/* ── Mini SVG Chart ─────────────────────────────────────── */
function BWChart({ data }: { data: BodyWeightLog[] }) {
  const [hovered, setHovered] = useState<number | null>(null);
  if (data.length < 2) return null;

  const W = 500, H = 140;
  const PT = 14, PR = 12, PB = 30, PL = 38;
  const cW = W - PL - PR, cH = H - PT - PB;

  const weights = data.map((d) => Number(d.weight_kg));
  const minW = Math.min(...weights) - 1;
  const maxW = Math.max(...weights) + 1;
  const range = maxW - minW || 1;

  const sx = (i: number) => PL + (i / Math.max(data.length - 1, 1)) * cW;
  const sy = (w: number) => PT + cH - ((w - minW) / range) * cH;

  const pts = data.map((d, i) => ({ x: sx(i), y: sy(Number(d.weight_kg)) }));

  let linePath = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < pts.length; i++) {
    const cx = (pts[i - 1].x + pts[i].x) / 2;
    linePath += ` C ${cx} ${pts[i - 1].y}, ${cx} ${pts[i].y}, ${pts[i].x} ${pts[i].y}`;
  }
  const areaPath = `${linePath} L ${pts[pts.length - 1].x} ${PT + cH} L ${PL} ${PT + cH} Z`;

  const yTicks = [0, 0.5, 1].map((t) => ({
    y: sy(minW + t * range),
    label: (minW + t * range).toFixed(1)
  }));

  const step = Math.max(1, Math.ceil(data.length / 4));
  const xLabels = data.map((_, i) =>
    i === 0 || i === data.length - 1 || i % step === 0 ? i : null
  ).filter((v): v is number => v !== null);

  const color = "#38bdf8"; // sky blue for body weight

  return (
    <div className="w-full overflow-x-auto mt-3">
      <svg viewBox={`0 0 ${W} ${H}`} style={{ minWidth: Math.max(data.length * 50, 240), height: 140 }} className="w-full">
        <defs>
          <linearGradient id="bw-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.25" />
            <stop offset="100%" stopColor={color} stopOpacity="0.02" />
          </linearGradient>
        </defs>
        {yTicks.map((t, i) => (
          <g key={i}>
            <line x1={PL} y1={t.y} x2={W - PR} y2={t.y} stroke="#252830" strokeWidth="1" strokeDasharray="3 3" />
            <text x={PL - 5} y={t.y + 4} textAnchor="end" fill="#7a7f8c" fontSize="9">{t.label}</text>
          </g>
        ))}
        <path d={areaPath} fill="url(#bw-grad)" />
        <path d={linePath} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
        {hovered !== null && (
          <line x1={pts[hovered].x} y1={PT} x2={pts[hovered].x} y2={PT + cH} stroke={color} strokeWidth="1" strokeDasharray="3 3" opacity="0.5" />
        )}
        {pts.map((pt, i) => (
          <g key={i} style={{ cursor: "crosshair" }}>
            <circle cx={pt.x} cy={pt.y} r={hovered === i ? 6 : 4} fill="var(--bg)" stroke={color} strokeWidth={hovered === i ? 3 : 2.5}
              style={{ transition: "r 0.1s" }} onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)} />
            {hovered === i && (() => {
              const tipW = 80, tipH = 32;
              const tipX = Math.min(Math.max(pt.x - tipW / 2, PL), W - PR - tipW);
              return (
                <g>
                  <rect x={tipX} y={pt.y - tipH - 8} width={tipW} height={tipH} rx="5" fill="var(--surface-raised)" stroke={color} strokeWidth="1" strokeOpacity="0.5" />
                  <text x={tipX + tipW / 2} y={pt.y - tipH - 8 + 12} textAnchor="middle" fill={color} fontSize="11" fontWeight="bold">{data[i].weight_kg} كجم</text>
                  <text x={tipX + tipW / 2} y={pt.y - tipH - 8 + 24} textAnchor="middle" fill="#7a7f8c" fontSize="9">{data[i].logged_at.slice(5).replace("-", "/")}</text>
                </g>
              );
            })()}
          </g>
        ))}
        {xLabels.map((i) => (
          <text key={i} x={pts[i].x} y={H - 4} textAnchor="middle" fill="#7a7f8c" fontSize="9">
            {data[i].logged_at.slice(5).replace("-", "/")}
          </text>
        ))}
      </svg>
    </div>
  );
}

/* ── Main Component ─────────────────────────────────────── */
export function BodyWeightWidget({ initialLogs }: { initialLogs: BodyWeightLog[] }) {
  const [logs, setLogs] = useState(initialLogs);
  const [weightInput, setWeightInput] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [showAll, setShowAll] = useState(false);

  const today = new Date().toISOString().slice(0, 10);
  const todayLog = logs.find((l) => l.logged_at === today);
  const latest = logs[0];
  const oldest = logs[logs.length - 1];
  const diff = latest && oldest && logs.length > 1
    ? Number(latest.weight_kg) - Number(oldest.weight_kg)
    : null;

  const displayLogs = showAll ? logs : logs.slice(0, 7);

  const save = () => {
    if (!weightInput) { setMessage("اكتب الوزن."); return; }
    startTransition(async () => {
      setMessage(null);
      const result = await saveBodyWeight(weightInput);
      if (!result.ok) { setMessage(result.error); return; }
      if (!("log" in result)) return;
      setLogs((prev) => {
        const filtered = prev.filter((l) => l.logged_at !== result.log.logged_at);
        return [result.log, ...filtered].sort((a, b) => b.logged_at.localeCompare(a.logged_at));
      });
      setWeightInput("");
    });
  };

  const remove = (log: BodyWeightLog) => {
    startTransition(async () => {
      const result = await deleteBodyWeightLog(log.id);
      if (result.ok) setLogs((prev) => prev.filter((l) => l.id !== log.id));
    });
  };

  return (
    <div
      className="rounded-2xl overflow-hidden animate-fade-in-up"
      style={{ border: "1px solid var(--line)", background: "var(--surface)", boxShadow: "var(--shadow-sm)" }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-3 px-5 py-4"
        style={{
          borderBottom: "1px solid var(--line)",
          background: "linear-gradient(135deg, rgba(56,189,248,0.06) 0%, transparent 100%), var(--surface-raised)"
        }}
      >
        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl text-xl shrink-0"
          style={{ background: "linear-gradient(135deg, #0ea5e9, #38bdf8)", boxShadow: "0 4px 14px rgba(56,189,248,0.25)" }}
        >
          ⚖️
        </div>
        <div className="flex-1">
          <h3 className="m-0 text-base sm:text-lg font-bold text-[var(--text)]">وزن الجسم</h3>
          <p className="mt-0.5 text-xs text-[var(--muted)]">سجّل وزنك يومياً لتتبع تقدمك</p>
        </div>
        {diff !== null && (
          <div className="shrink-0 text-left" dir="ltr">
            <div className="num text-sm font-bold" style={{ color: diff <= 0 ? "var(--ok)" : "var(--accent)" }}>
              {diff > 0 ? "+" : ""}{diff.toFixed(1)} كجم
            </div>
            <div className="text-[10px] text-[var(--muted)]">منذ البداية</div>
          </div>
        )}
      </div>

      <div className="p-4">
        {/* Chart */}
        {logs.length >= 2 && <BWChart data={[...logs].reverse()} />}

        {/* Input */}
        <div className="mt-3 flex items-center gap-2">
          {todayLog ? (
            <div
              className="flex-1 rounded-xl px-4 py-2.5 text-sm"
              style={{ background: "rgba(56,189,248,0.06)", border: "1px solid rgba(56,189,248,0.2)", color: "#38bdf8" }}
            >
              ✅ اليوم: <b className="num">{todayLog.weight_kg} كجم</b> — تم التسجيل
            </div>
          ) : (
            <input
              type="number" inputMode="decimal" step="0.1" placeholder="وزن الجسم (كجم)"
              value={weightInput}
              onChange={(e) => setWeightInput(e.target.value)}
              className="num flex-1 rounded-xl px-3 py-2.5 text-[13px] text-[var(--text)] outline-none transition-all duration-200 placeholder:text-[var(--muted)]"
              style={{ background: "var(--surface-raised)", border: "1px solid var(--line-bright)" }}
              onFocus={(e) => { e.currentTarget.style.borderColor = "#38bdf8"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(56,189,248,0.15)"; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = "var(--line-bright)"; e.currentTarget.style.boxShadow = "none"; }}
              onKeyDown={(e) => e.key === "Enter" && save()}
            />
          )}
          {!todayLog && (
            <button
              onClick={save}
              disabled={isPending}
              className="shrink-0 rounded-xl px-4 py-2.5 text-[13px] font-bold text-white transition-all duration-200 disabled:opacity-60"
              style={{ background: "linear-gradient(135deg, #0ea5e9, #38bdf8)", boxShadow: "0 4px 14px rgba(56,189,248,0.3)" }}
            >
              حفظ
            </button>
          )}
          {todayLog && (
            <button
              onClick={() => remove(todayLog)}
              disabled={isPending}
              className="shrink-0 rounded-xl px-3 py-2.5 text-xs font-bold transition-all"
              style={{
                background: "var(--surface-raised)", border: "1px solid var(--line)",
                color: "var(--muted)"
              }}
            >
              تعديل ✏️
            </button>
          )}
        </div>

        {message && (
          <div className="mt-2 text-xs text-[var(--accent)] animate-slide-in">{message}</div>
        )}

        {/* Recent logs */}
        {logs.length > 0 && (
          <div className="mt-3">
            <div className="flex flex-col gap-1">
              {displayLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between gap-2 rounded-xl px-3 py-1.5"
                  style={{ background: "var(--surface-raised)", border: "1px solid transparent" }}
                >
                  <span className="num text-[10px] text-[var(--muted)]">{log.logged_at}</span>
                  <span className="num text-[13px] font-bold" style={{ color: "#38bdf8" }}>{log.weight_kg} كجم</span>
                  <button
                    onClick={() => remove(log)}
                    disabled={isPending}
                    className="text-[var(--muted)] hover:text-[var(--accent)] text-sm transition-colors"
                    aria-label="حذف"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            {logs.length > 7 && (
              <button
                onClick={() => setShowAll((v) => !v)}
                className="mt-2 w-full text-center text-xs text-[var(--muted)] hover:text-[var(--text)] transition-colors"
              >
                {showAll ? "عرض أقل ▲" : `عرض كل السجلات (${logs.length}) ▼`}
              </button>
            )}
          </div>
        )}

        {logs.length === 0 && (
          <div className="mt-3 text-center text-xs text-[var(--muted)]">
            سجّل وزنك اليوم وابدأ التتبع 📉
          </div>
        )}
      </div>
    </div>
  );
}
