import { redirect } from "next/navigation";
import { TrackerClient } from "@/components/TrackerClient";
import { rowsToExercises } from "@/lib/exercises";
import { getSessionProfileId } from "@/lib/session";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ExerciseRow, WorkoutLog } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function TrackerPage() {
  const profileId = await getSessionProfileId();
  if (!profileId) redirect("/login");
  const supabase = createAdminClient();

  const [{ data: exerciseRows }, { data: logs }] = await Promise.all([
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
      .order("logged_at", { ascending: false })
      .order("created_at", { ascending: false })
      .returns<WorkoutLog[]>()
  ]);

  return <TrackerClient exercises={rowsToExercises(exerciseRows)} initialLogs={logs ?? []} />;
}
