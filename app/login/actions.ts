"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { createSession, clearSession } from "@/lib/session";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Profile } from "@/lib/types";

type LoginState = {
  ok?: boolean;
  error?: string;
};

function isFourDigitPin(pin: string) {
  return /^\d{4}$/.test(pin);
}

export async function pinLogin(_state: LoginState, formData: FormData): Promise<LoginState> {
  const profileId = String(formData.get("profileId") ?? "");
  const pin = String(formData.get("pin") ?? "");
  const mode = String(formData.get("mode") ?? "login");

  if (!profileId || !isFourDigitPin(pin)) {
    return { error: "اختار اللاعب واكتب PIN من 4 أرقام." };
  }

  const supabase = createAdminClient();
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", profileId)
    .single<Profile>();

  if (error || !profile) {
    return { error: "اللاعب غير موجود." };
  }

  if (!profile.pin_hash) {
    if (mode !== "set") return { error: "لازم تعيين PIN أول مرة." };

    const pinHash = await bcrypt.hash(pin, 12);
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ pin_hash: pinHash })
      .eq("id", profile.id);

    if (updateError) return { error: "تعذر حفظ PIN. حاول تاني." };

    await createSession(profile.id);
    redirect("/tracker");
  }

  const isValid = await bcrypt.compare(pin, profile.pin_hash);
  if (!isValid) {
    return { error: "PIN غير صحيح." };
  }

  await createSession(profile.id);
  redirect("/tracker");
}

export async function signOut() {
  clearSession();
  redirect("/login");
}
