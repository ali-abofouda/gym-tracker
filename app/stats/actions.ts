"use server";

import { revalidatePath } from "next/cache";
import { getSessionProfileId } from "@/lib/session";
import { createAdminClient } from "@/lib/supabase/admin";
import type { BodyWeightLog } from "@/lib/types";

type BWResult =
  | { ok: true; log: BodyWeightLog }
  | { ok: true; deletedId: string }
  | { ok: false; error: string };

export async function saveBodyWeight(weightKg: string): Promise<BWResult> {
  const profileId = await getSessionProfileId();
  if (!profileId) return { ok: false, error: "لازم تسجل دخول الأول." };

  const parsed = Number(weightKg);
  if (!Number.isFinite(parsed) || parsed <= 0 || parsed >= 500) {
    return { ok: false, error: "اكتب وزن صحيح (بين 1 و 500 كجم)." };
  }

  const today = new Date().toISOString().slice(0, 10);
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("body_weight_logs")
    .upsert(
      { user_id: profileId, weight_kg: parsed, logged_at: today },
      { onConflict: "user_id,logged_at" }
    )
    .select("*")
    .single<BodyWeightLog>();

  if (error || !data) return { ok: false, error: "تعذر حفظ الوزن." };

  revalidatePath("/stats");
  return { ok: true, log: data };
}

export async function deleteBodyWeightLog(logId: string): Promise<BWResult> {
  const profileId = await getSessionProfileId();
  if (!profileId) return { ok: false, error: "لازم تسجل دخول الأول." };

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("body_weight_logs")
    .delete()
    .eq("id", logId)
    .eq("user_id", profileId);

  if (error) return { ok: false, error: "تعذر الحذف." };

  revalidatePath("/stats");
  return { ok: true, deletedId: logId };
}
