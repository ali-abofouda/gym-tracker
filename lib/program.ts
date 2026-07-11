export type ProgramExercise = {
  id: string;
  name: string;
  sets: string;
  reps: string;
  group: string;
};

export type ProgramDay = {
  day: number;
  title: string;
  rest: boolean;
  exercises: ProgramExercise[];
};

export const PROGRAM: ProgramDay[] = [
  { day: 1, title: "صدر + تراي خفيف", rest: false, exercises: [
    { id: "d1e1", name: "بنش برس مسطح (بار)", sets: "4", reps: "6-10", group: "صدر" },
    { id: "d1e2", name: "إنكلاين دمبل برس", sets: "3", reps: "8-12", group: "صدر" },
    { id: "d1e3", name: "كابل فلاي / بيك ديك", sets: "3", reps: "12-15", group: "صدر" },
    { id: "d1e4", name: "High-to-Low Cable Fly", sets: "3", reps: "8-12", group: "صدر" },
    { id: "d1e5", name: "تمارين الضغط", sets: "3", reps: "10-12", group: "صدر" },
    { id: "d1e6", name: "Triceps Pushdown", sets: "3", reps: "10-15", group: "تراي خفيف" },
    { id: "d1e7", name: "Overhead Triceps Extension", sets: "3", reps: "10-15", group: "تراي خفيف" }
  ] },
  { day: 2, title: "ظهر + باي خفيف", rest: false, exercises: [
    { id: "d2e1", name: "ديدليفت / لات بولداون واسع", sets: "4", reps: "6-10", group: "ظهر" },
    { id: "d2e2", name: "بار رو / كابل رو", sets: "3", reps: "8-12", group: "ظهر" },
    { id: "d2e3", name: "بول أب / لات بولداون", sets: "3", reps: "8-12", group: "ظهر" },
    { id: "d2e4", name: "Face Pull / رير ديلت رو", sets: "3", reps: "12-15", group: "ظهر" },
    { id: "d2e5", name: "T-Bar Row", sets: "3", reps: "8-12", group: "ظهر" },
    { id: "d2e6", name: "EZ Bar Curl", sets: "3", reps: "8-12", group: "باي خفيف" },
    { id: "d2e7", name: "Hammer Curl", sets: "3", reps: "10-15", group: "باي خفيف" }
  ] },
  { day: 3, title: "راحة", rest: true, exercises: [] },
  { day: 4, title: "كتف", rest: false, exercises: [
    { id: "d4e1", name: "Overhead Press (بار / دمبل)", sets: "4", reps: "6-10", group: "كتف أمامي/جانبي" },
    { id: "d4e2", name: "لاترال رايز", sets: "4", reps: "12-15", group: "كتف جانبي" },
    { id: "d4e3", name: "رير ديلت فلاي", sets: "3", reps: "12-15", group: "كتف خلفي" },
    { id: "d4e4", name: "فرونت رايز", sets: "3", reps: "12-15", group: "كتف أمامي" },
    { id: "d4e5", name: "شرَج (ترابيس)", sets: "3", reps: "10-15", group: "ترابيس" }
  ] },
  { day: 5, title: "رجل", rest: false, exercises: [
    { id: "d5e1", name: "سكوات (بار)", sets: "4", reps: "6-10", group: "كوادرسبس" },
    { id: "d5e2", name: "ليج برس", sets: "3", reps: "10-15", group: "كوادرسبس" },
    { id: "d5e3", name: "رومانيان ديدليفت", sets: "3", reps: "8-12", group: "هامسترينج" },
    { id: "d5e4", name: "ليج كيرل", sets: "3", reps: "10-15", group: "هامسترينج" },
    { id: "d5e5", name: "ليج إكستنشن", sets: "3", reps: "12-15", group: "كوادرسبس" },
    { id: "d5e6", name: "كالف رايز", sets: "4", reps: "12-20", group: "سمانة" }
  ] },
  { day: 6, title: "ذراع كامل: باي + تراي", rest: false, exercises: [
    { id: "d6e1", name: "بار كيرل", sets: "3", reps: "8-12", group: "باي" },
    { id: "d6e2", name: "إنكلاين دمبل كيرل", sets: "3", reps: "10-15", group: "باي" },
    { id: "d6e3", name: "كونسنتريشن كيرل", sets: "2", reps: "12-15", group: "باي" },
    { id: "d6e4", name: "Close Grip Bench Press", sets: "3", reps: "8-12", group: "تراي" },
    { id: "d6e5", name: "سكال كراشر", sets: "3", reps: "10-15", group: "تراي" },
    { id: "d6e6", name: "Single-Arm Cable Pushdown", sets: "2", reps: "12-15", group: "تراي" },
    { id: "d6e7", name: "Reverse Barbell Curl (ساعد)", sets: "3", reps: "10-15", group: "ساعد" },
    { id: "d6e8", name: "Barbell Wrist Curl (معصم)", sets: "3", reps: "15-20", group: "معصم" }
  ] },
  { day: 7, title: "راحة", rest: true, exercises: [] }
];

export const allExercises = () =>
  PROGRAM.flatMap((day) =>
    day.exercises.map((exercise) => ({
      ...exercise,
      day: day.day,
      dayTitle: day.title
    }))
  );
