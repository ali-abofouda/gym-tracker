import { redirect } from "next/navigation";
import { rowsToExercises } from "@/lib/exercises";
import { getSessionProfileId } from "@/lib/session";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ExerciseRow, Profile, WorkoutLog } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function LeaderboardPage() {
  const profileId = await getSessionProfileId();
  if (!profileId) redirect("/login");
  const supabase = createAdminClient();

  const [{ data: exerciseRows }, { data: profiles }, { data: logs }] = await Promise.all([
    supabase
      .from("exercises")
      .select("*")
      .order("day_number", { ascending: true })
      .order("id", { ascending: true })
      .returns<ExerciseRow[]>(),
    supabase.from("profiles").select("*").order("created_at", { ascending: true }).returns<Profile[]>(),
    supabase.from("workout_logs").select("*").returns<WorkoutLog[]>()
  ]);

  const exercises = rowsToExercises(exerciseRows);
  const profileRows = profiles ?? [];

  /* Best weight per user per exercise */
  const prByUserAndExercise = (logs ?? []).reduce<Record<string, Record<string, WorkoutLog>>>((acc, log) => {
    acc[log.user_id] ??= {};
    const current = acc[log.user_id][log.exercise_id];
    if (!current || Number(log.weight) > Number(current.weight)) {
      acc[log.user_id][log.exercise_id] = log;
    }
    return acc;
  }, {});

  /* Per-exercise champion (highest weight) */
  const championByExercise: Record<string, string> = {};
  for (const exercise of exercises) {
    let bestWeight = -1;
    let champion = "";
    for (const profile of profileRows) {
      const pr = prByUserAndExercise[profile.id]?.[exercise.id];
      if (pr && Number(pr.weight) > bestWeight) {
        bestWeight = Number(pr.weight);
        champion = profile.id;
      }
    }
    if (champion) championByExercise[exercise.id] = champion;
  }

  const AVATAR_COLORS = [
    { bg: "#2a1a2e", text: "#c084fc" },
    { bg: "#162232", text: "#38bdf8" },
    { bg: "#1a2816", text: "#86efac" },
    { bg: "#2a2018", text: "#fcd34d" },
    { bg: "#2a1a1a", text: "#fca5a5" },
    { bg: "#181a2a", text: "#818cf8" },
  ];

  return (
    <section
      className="overflow-hidden rounded-2xl animate-fade-in-up"
      style={{
        border: "1px solid var(--line)",
        background: "var(--surface)",
        boxShadow: "var(--shadow-md)"
      }}
    >
      {/* Header */}
      <div
        className="px-5 sm:px-6 py-5"
        style={{
          borderBottom: "1px solid var(--line)",
          background: "linear-gradient(135deg, rgba(240,180,41,0.07) 0%, rgba(255,78,66,0.04) 100%), var(--surface-raised)"
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl text-xl shrink-0"
            style={{
              background: "linear-gradient(135deg, var(--gold) 0%, #ffd97d 100%)",
              boxShadow: "0 4px 14px var(--gold-glow)"
            }}
          >
            🏆
          </div>
          <div>
            <h2 className="m-0 text-xl sm:text-2xl font-bold text-[var(--text)]">المنافسة</h2>
            <p className="mt-0.5 text-sm text-[var(--muted)]">أعلى وزن لكل لاعب في كل تمرين</p>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-[540px] sm:min-w-full table-fixed sm:table-auto">
          <thead>
            <tr style={{ background: "var(--surface-raised)", borderBottom: "1px solid var(--line)" }}>
              <th
                className="sticky right-0 z-10 border-s border-[var(--line)] w-[130px] min-w-[130px] sm:w-[210px] sm:min-w-[210px] pe-4 text-right py-4"
                style={{ background: "var(--surface-raised)" }}
              >
                التمرين
              </th>
              {profileRows.map((profile, idx) => {
                const color = AVATAR_COLORS[idx % AVATAR_COLORS.length];
                return (
                  <th
                    key={profile.id}
                    className="text-center px-2 py-3"
                  >
                    <div className="flex flex-col items-center gap-1.5">
                      <div
                        className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold"
                        style={{ background: color.bg, color: color.text }}
                      >
                        {profile.display_name.charAt(0)}
                      </div>
                      <span className="text-[11px] sm:text-xs font-bold text-[var(--muted-bright)]">
                        {profile.display_name}
                      </span>
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {exercises.map((exercise) => {
              const champion = championByExercise[exercise.id];
              return (
                <tr
                  key={exercise.id}
                  className="group transition-colors duration-150"
                  style={{ borderTop: "1px solid var(--line)" }}
                >
                  {/* Exercise name */}
                  <td
                    className="sticky right-0 z-10 border-s border-[var(--line)] transition-colors duration-150 font-semibold pe-4 py-3 w-[130px] min-w-[130px] sm:w-[210px] sm:min-w-[210px] text-right"
                    style={{
                      background: "var(--surface)",
                    }}
                  >
                    <div
                      className="truncate text-xs sm:text-[13px] text-[var(--text)]"
                      title={exercise.name}
                    >
                      {exercise.name}
                    </div>
                    <div className="text-[10px] sm:text-[11px] text-[var(--muted)] font-normal mt-0.5">
                      يوم {exercise.day} · {exercise.sets}×{exercise.reps}
                    </div>
                  </td>

                  {/* Per-user cells */}
                  {profileRows.map((profile) => {
                    const pr = prByUserAndExercise[profile.id]?.[exercise.id];
                    const isChampion = champion === profile.id && pr;
                    return (
                      <td
                        key={profile.id}
                        className="text-center num px-2 py-3"
                      >
                        {pr ? (
                          <div
                            className="inline-flex flex-col items-center justify-center gap-0.5 rounded-xl px-2 py-1.5 transition-all duration-200"
                            style={
                              isChampion
                                ? {
                                    background: "linear-gradient(135deg, var(--gold-dim) 0%, rgba(45,34,8,0.6) 100%)",
                                    border: "1px solid rgba(240,180,41,0.3)",
                                    boxShadow: "0 2px 10px var(--gold-glow)"
                                  }
                                : {
                                    background: "var(--surface-raised)",
                                    border: "1px solid var(--line)"
                                  }
                            }
                          >
                            <b
                              className="text-xs sm:text-sm"
                              style={{ color: isChampion ? "var(--gold)" : "var(--ok)" }}
                            >
                              {isChampion && "👑 "}{pr.weight} كجم
                            </b>
                            <span
                              className="text-[10px] sm:text-xs"
                              style={{ color: "var(--muted)" }}
                            >
                              × {pr.reps ?? "—"}
                            </span>
                          </div>
                        ) : (
                          <span
                            className="text-sm"
                            style={{ color: "var(--line-bright)" }}
                          >
                            —
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
