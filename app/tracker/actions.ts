"use server";

import { revalidatePath } from "next/cache";
import { getSessionProfileId } from "@/lib/session";
import { createAdminClient } from "@/lib/supabase/admin";
import type { WorkoutLog } from "@/lib/types";

type ActionResult =
  | { ok: true; log: WorkoutLog; deletedId?: never }
  | { ok: true; deletedId: string; log?: never }
  | { ok: false; error: string };

export async function saveWorkoutLog(
  exerciseId: string,
  weight: string,
  reps: string,
  note?: string
): Promise<ActionResult> {
  const profileId = await getSessionProfileId();
  if (!profileId) return { ok: false, error: "لازم تسجل دخول الأول." };

  const parsedWeight = Number(weight);
  const parsedReps = reps ? Number(reps) : null;

  if (!exerciseId || !Number.isFinite(parsedWeight) || parsedWeight <= 0) {
    return { ok: false, error: "اكتب وزن صحيح." };
  }

  if (parsedReps !== null && (!Number.isInteger(parsedReps) || parsedReps <= 0)) {
    return { ok: false, error: "اكتب عدد تكرارات صحيح." };
  }

  const trimmedNote = note?.trim() || null;

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("workout_logs")
    .insert({
      user_id: profileId,
      exercise_id: exerciseId,
      weight: parsedWeight,
      reps: parsedReps,
      note: trimmedNote,
      logged_at: new Date().toISOString().slice(0, 10)
    })
    .select("*")
    .single<WorkoutLog>();

  if (error || !data) return { ok: false, error: "تعذر حفظ السجل." };

  revalidatePath("/tracker");
  revalidatePath("/leaderboard");
  revalidatePath("/stats");
  return { ok: true, log: data };
}

export async function deleteWorkoutLog(logId: string): Promise<ActionResult> {
  const profileId = await getSessionProfileId();
  if (!profileId) return { ok: false, error: "لازم تسجل دخول الأول." };

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("workout_logs")
    .delete()
    .eq("id", logId)
    .eq("user_id", profileId);

  if (error) return { ok: false, error: "تعذر حذف السجل." };

  revalidatePath("/tracker");
  revalidatePath("/leaderboard");
  revalidatePath("/stats");
  return { ok: true, deletedId: logId };
}
