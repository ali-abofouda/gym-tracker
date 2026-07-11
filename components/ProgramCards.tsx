import type { ProgramDay } from "@/lib/program";

export function ProgramCards({ days }: { days: ProgramDay[] }) {
  return (
    <div>
      {days.map((day) => (
        <section key={day.day} className="mb-3 overflow-hidden rounded-xl border border-line bg-surface">
          <div className="flex items-center gap-3 border-b border-line bg-raised px-3 sm:px-[18px] py-3">
            <div
              className={`font-oswald flex h-[32px] w-[32px] shrink-0 items-center justify-center rounded-lg border text-lg sm:text-xl font-bold ${
                day.rest ? "border-line text-muted" : "border-accent text-accent"
              }`}
            >
              {day.day}
            </div>
            <div>
              <div className="text-sm sm:text-base font-bold">{day.title}</div>
              <div className="text-[11px] sm:text-[12.5px] text-muted">
                {day.rest ? "استشفاء عضلي - نوم كويس ومياه" : `${day.exercises.length} تمارين`}
              </div>
            </div>
          </div>

          {!day.rest && (
            <>
              {/* Mobile: card list */}
              <div className="divide-y divide-line sm:hidden">
                {day.exercises.map((exercise) => (
                  <div key={exercise.id} className="flex items-center justify-between gap-2 px-3 py-2.5">
                    <div className="min-w-0">
                      <div className="text-[13px] font-semibold text-text leading-snug">{exercise.name}</div>
                      <span className="mt-0.5 inline-block rounded-full bg-accent-dim px-2 py-0.5 text-[10px] font-semibold text-accent">
                        {exercise.group}
                      </span>
                    </div>
                    <div className="shrink-0 text-left ltr num text-[11px] text-muted text-nowrap">
                      <span className="text-text font-bold">{exercise.sets}</span> سيت
                      <br />
                      <span className="text-text font-bold">{exercise.reps}</span> تكرار
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop: table */}
              <div className="hidden sm:block overflow-x-auto">
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
            </>
          )}
        </section>
      ))}
    </div>
  );
}
