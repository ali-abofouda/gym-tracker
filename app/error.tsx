"use client";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div className="rounded-xl border border-line bg-surface p-5 text-center">
      <div className="mb-3 text-accent">حصل خطأ في تحميل البيانات.</div>
      <button onClick={reset} className="rounded-md bg-accent px-4 py-2 text-sm font-bold text-white">
        حاول تاني
      </button>
    </div>
  );
}
