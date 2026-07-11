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
        <table className="min-w-[760px]">
          <thead>
            <tr>
              <th>التمرين</th>
              {profileRows.map((profile) => (
                <th key={profile.id}>{profile.display_name}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {exercises.map((exercise) => (
              <tr key={exercise.id}>
                <td className="font-semibold">
                  <div>{exercise.name}</div>
                  <div className="text-[11px] text-muted">
                    اليوم {exercise.day} - {exercise.sets} × {exercise.reps}
                  </div>
                </td>
                {profileRows.map((profile) => {
                  const pr = prByUserAndExercise[profile.id]?.[exercise.id];
                  return (
                    <td key={profile.id} className="num">
                      {pr ? (
                        <span>
                          <b className="text-ok">{pr.weight} كجم</b>
                          <span className="text-muted"> × {pr.reps ?? "-"}</span>
                        </span>
                      ) : (
                        <span className="text-[#565a63]">-</span>
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
