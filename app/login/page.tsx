import { redirect } from "next/navigation";
import { LoginPinForm } from "@/components/LoginPinForm";
import { getSessionProfileId } from "@/lib/session";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

type PublicProfile = {
  id: string;
  display_name: string;
  hasPin: boolean;
};

export default async function LoginPage() {
  const profileId = await getSessionProfileId();
  if (profileId) redirect("/tracker");

  const supabase = createAdminClient();
  const { data } = await supabase
    .from("profiles")
    .select("id, display_name, pin_hash")
    .order("created_at", { ascending: true });

  const profiles: PublicProfile[] = (data ?? []).map((profile) => ({
    id: profile.id,
    display_name: profile.display_name,
    hasPin: Boolean(profile.pin_hash)
  }));

  return <LoginPinForm profiles={profiles} />;
}
