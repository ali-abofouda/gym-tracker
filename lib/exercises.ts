import { PROGRAM, allExercises } from "@/lib/program";
import type { ExerciseRow } from "@/lib/types";

export function rowsToProgram(rows: ExerciseRow[] | null | undefined) {
  if (!rows?.length) return PROGRAM;

  return PROGRAM.map((day) => {
    if (day.rest) return day;

    const exercises = rows
      .filter((row) => row.day_number === day.day)
      .sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }))
      .map((row) => ({
        id: row.id,
        name: row.name,
        sets: row.sets,
        reps: row.reps,
        group: row.muscle_group
      }));

    return { ...day, exercises: exercises.length ? exercises : day.exercises };
  });
}

export function rowsToExercises(rows: ExerciseRow[] | null | undefined) {
  if (!rows?.length) return allExercises();

  return rows
    .slice()
    .sort((a, b) => a.day_number - b.day_number || a.id.localeCompare(b.id, undefined, { numeric: true }))
    .map((row) => ({
      id: row.id,
      name: row.name,
      sets: row.sets,
      reps: row.reps,
      group: row.muscle_group,
      day: row.day_number,
      dayTitle: row.day_title
    }));
}
