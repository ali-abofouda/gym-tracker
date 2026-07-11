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
  const prByUserAndExercise = (logs ?? []).reduce<Record<string, Record<string, WorkoutLog>>>((acc, log) => {
    acc[log.user_id] ??= {};
    const current = acc[log.user_id][log.exercise_id];
    if (!current || Number(log.weight) > Number(current.weight)) {
      acc[log.user_id][log.exercise_id] = log;
    }
    return acc;
  }, {});

  return (
    <section className="overflow-hidden rounded-xl border border-line bg-surface">
      <div className="border-b border-line bg-raised px-[18px] py-4">
        <h2 className="m-0 text-xl font-bold">المنافسة</h2>
        <p className="mt-1 text-sm text-muted">أعلى وزن لكل لاعب في كل تمرين.</p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-[540px] sm:min-w-full table-fixed sm:table-auto">
          <thead>
            <tr className="bg-raised">
              <th className="sticky right-0 z-10 bg-raised border-l border-line w-[120px] min-w-[120px] sm:w-[200px] sm:min-w-[200px] pr-4 text-right">التمرين</th>
              {profileRows.map((profile) => (
                <th key={profile.id} className="text-center px-1 py-3 text-xs sm:text-sm font-bold">{profile.display_name}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {exercises.map((exercise) => (
              <tr key={exercise.id} className="group border-t border-line hover:bg-[#1f2126] transition-colors">
                <td className="sticky right-0 z-10 bg-surface group-hover:bg-[#1f2126] border-l border-line transition-colors font-semibold pr-4 py-3 w-[120px] min-w-[120px] sm:w-[200px] sm:min-w-[200px] text-right">
                  <div className="truncate text-xs sm:text-sm" title={exercise.name}>{exercise.name}</div>
                  <div className="text-[10px] sm:text-[11px] text-muted font-normal mt-0.5">
                    اليوم {exercise.day} - {exercise.sets}×{exercise.reps}
                  </div>
                </td>
                {profileRows.map((profile) => {
                  const pr = prByUserAndExercise[profile.id]?.[exercise.id];
                  return (
                    <td key={profile.id} className="text-center num px-1 py-3">
                      {pr ? (
                        <div className="flex flex-col items-center justify-center gap-0.5">
                          <b className="text-ok text-xs sm:text-sm">{pr.weight} كجم</b>
                          <span className="text-muted text-[10px] sm:text-xs">× {pr.reps ?? "-"}</span>
                        </div>
                      ) : (
                        <span className="text-[#3b3e45]">-</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
