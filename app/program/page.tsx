import { ProgramCards } from "@/components/ProgramCards";
import { rowsToProgram } from "@/lib/exercises";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ExerciseRow } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function ProgramPage() {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("exercises")
    .select("*")
    .order("day_number", { ascending: true })
    .order("id", { ascending: true })
    .returns<ExerciseRow[]>();

  return <ProgramCards days={rowsToProgram(data)} />;
}
