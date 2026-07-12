import { redirect } from "next/navigation";
import { rowsToExercises } from "@/lib/exercises";
import { getSessionProfileId } from "@/lib/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { StatsClient } from "@/components/StatsClient";
import { BodyWeightWidget } from "@/components/BodyWeightWidget";
import type { BodyWeightLog, ExerciseRow, WorkoutLog } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function StatsPage() {
  const profileId = await getSessionProfileId();
  if (!profileId) redirect("/login");

  const supabase = createAdminClient();

  const [{ data: exerciseRows }, { data: logs }, { data: bodyWeightLogs }] = await Promise.all([
    supabase
      .from("exercises")
      .select("*")
      .order("day_number", { ascending: true })
      .order("id", { ascending: true })
      .returns<ExerciseRow[]>(),
    supabase
      .from("workout_logs")
      .select("*")
      .eq("user_id", profileId)
      .order("logged_at", { ascending: true })
      .order("created_at", { ascending: true })
      .returns<WorkoutLog[]>(),
    supabase
      .from("body_weight_logs")
      .select("*")
      .eq("user_id", profileId)
      .order("logged_at", { ascending: false })
      .returns<BodyWeightLog[]>()
  ]);

  return (
    <div className="flex flex-col gap-5">
      {/* Body Weight Widget — top of stats */}
      <BodyWeightWidget initialLogs={bodyWeightLogs ?? []} />

      {/* Personal workout stats */}
      <StatsClient
        exercises={rowsToExercises(exerciseRows ?? [])}
        logs={logs ?? []}
      />
    </div>
  );
}
