import type { ProgramDay } from "@/lib/program";

export function ProgramCards({ days }: { days: ProgramDay[] }) {
  return (
    <div>
      {days.map((day) => (
        <section key={day.day} className="mb-3.5 overflow-hidden rounded-xl border border-line bg-surface">
          <div className="flex items-center gap-3 border-b border-line bg-raised px-[18px] py-3.5">
            <div
              className={`font-oswald flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-lg border text-xl font-bold ${
                day.rest ? "border-line text-muted" : "border-accent text-accent"
              }`}
            >
              {day.day}
            </div>
            <div>
              <div className="text-base font-bold">{day.title}</div>
              <div className="text-[12.5px] text-muted">
                {day.rest ? "استشفاء عضلي - نوم كويس ومياه" : `${day.exercises.length} تمارين`}
              </div>
            </div>
          </div>

          {!day.rest && (
            <div className="overflow-x-auto">
              <table>
                <thead>
                  <tr>
                    <th>التمرين</th>
                    <th>مجموعات</th>
                    <th>تكرارات</th>
                  </tr>
                </thead>
                <tbody>
                  {day.exercises.map((exercise) => (
                    <tr key={exercise.id}>
                      <td className="font-semibold">
                        {exercise.name}
                        <span className="me-1.5 inline-block rounded-full bg-accent-dim px-2 py-0.5 text-[11px] font-semibold text-accent">
                          {exercise.group}
                        </span>
                      </td>
                      <td className="num">{exercise.sets}</td>
                      <td className="num">{exercise.reps}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      ))}
    </div>
  );
}
