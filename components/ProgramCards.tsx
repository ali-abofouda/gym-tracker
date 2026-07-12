import type { ProgramDay } from "@/lib/program";

const GROUP_COLORS: Record<string, { bg: string; text: string }> = {
  صدر:    { bg: "#2a1a2e", text: "#c084fc" },
  ظهر:    { bg: "#162232", text: "#38bdf8" },
  كتف:    { bg: "#1a2816", text: "#86efac" },
  ترايسبس: { bg: "#2a1a1a", text: "#fca5a5" },
  بايسبس: { bg: "#2a2018", text: "#fcd34d" },
  أرجل:   { bg: "#181a2a", text: "#818cf8" },
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
  return (
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
              className="font-oswald flex h-[36px] w-[36px] shrink-0 items-center justify-center rounded-xl text-lg sm:text-xl font-bold transition-all"
              style={
                day.rest
                  ? {
                      border: "1px solid var(--line)",
                      color: "var(--muted)",
                      background: "var(--surface)"
                    }
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

            {/* Exercise count badge for active days */}
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
                {day.exercises.map((exercise) => (
                  <div
                    key={exercise.id}
                    className="flex items-center justify-between gap-3 px-4 py-3 transition-colors"
                    style={{ background: "transparent" }}
                  >
                    <div className="min-w-0">
                      <div className="text-[13px] font-semibold text-[var(--text)] leading-snug">
                        {exercise.name}
                      </div>
                      <div className="mt-1">
                        <GroupPill group={exercise.group} />
                      </div>
                    </div>
                    <div className="shrink-0 text-left ltr num text-[12px] text-[var(--muted)] text-nowrap">
                      <span className="text-[var(--text)] font-bold text-[13px]">{exercise.sets}</span>{" "}
                      <span className="text-[10px]">سيت</span>
                      <br />
                      <span className="text-[var(--text)] font-bold text-[13px]">{exercise.reps}</span>{" "}
                      <span className="text-[10px]">تكرار</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop: table */}
              <div className="hidden sm:block overflow-x-auto">
                <table>
                  <thead>
                    <tr style={{ background: "rgba(255,255,255,0.02)" }}>
                      <th>التمرين</th>
                      <th>مجموعات</th>
                      <th>تكرارات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {day.exercises.map((exercise) => (
                      <tr key={exercise.id}>
                        <td className="font-semibold">
                          <span className="text-[var(--text)]">{exercise.name}</span>
                          <span className="me-2 inline-block">
                            <GroupPill group={exercise.group} />
                          </span>
                        </td>
                        <td className="num text-[var(--muted-bright)]">{exercise.sets}</td>
                        <td className="num text-[var(--muted-bright)]">{exercise.reps}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </section>
      ))}
    </div>
  );
}
