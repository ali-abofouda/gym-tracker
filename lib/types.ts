export type ExerciseRow = {
  id: string;
  day_number: number;
  day_title: string;
  name: string;
  sets: string;
  reps: string;
  muscle_group: string;
  is_rest_day: boolean;
};

export type Profile = {
  id: string;
  display_name: string;
  pin_hash: string | null;
  created_at: string;
};

export type WorkoutLog = {
  id: string;
  user_id: string;
  exercise_id: string;
  weight: number;
  reps: number | null;
  note: string | null;
  logged_at: string;
  created_at: string;
};

export type ExerciseWithDay = {
  id: string;
  name: string;
  sets: string;
  reps: string;
  group: string;
  day: number;
  dayTitle: string;
};

export type BodyWeightLog = {
  id: string;
  user_id: string;
  weight_kg: number;
  logged_at: string;
  created_at: string;
};
