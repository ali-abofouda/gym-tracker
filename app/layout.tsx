import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Cairo, JetBrains_Mono, Oswald } from "next/font/google";
import { PROGRAM } from "@/lib/program";
import { getSessionProfileId } from "@/lib/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { NavBar } from "@/components/NavBar";
import "./globals.css";

const cairo = Cairo({ subsets: ["arabic", "latin"], weight: ["400", "600", "700", "900"], variable: "--font-cairo" });
const oswald = Oswald({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--font-oswald" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], weight: ["500", "700"], variable: "--font-jetbrains" });

export const metadata: Metadata = {
  title: "برنامج التمرين + متابعة الأوزان",
  description: "Arabic RTL gym workout tracker with Supabase logging."
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const profileId = await getSessionProfileId();
  let displayName: string | null = null;

  if (profileId) {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("profiles")
      .select("display_name")
      .eq("id", profileId)
      .maybeSingle<{ display_name: string }>();
    displayName = data?.display_name ?? null;
  }

  return (
    <html lang="ar" dir="rtl" className={`${cairo.variable} ${oswald.variable} ${jetbrains.variable}`}>
      <body>
        <main className="mx-auto max-w-[980px] px-4 pb-16 pt-6">
          <header className="mb-[22px] flex flex-wrap items-center justify-between gap-3 border-b border-line pb-[18px]">
            <div>
              <div className="font-oswald text-[13px] uppercase tracking-[2px] text-accent">Weekly Split - Bro Split Hybrid</div>
              <h1 className="m-0 mt-0.5 text-[28px] font-bold text-text">برنامج التمرين الأسبوعي</h1>
            </div>
            <div className="flex gap-1.5">
              {PROGRAM.map((day) => (
                <span
                  key={day.day}
                  className={`num flex h-[26px] w-[26px] items-center justify-center rounded-md border text-[11px] font-bold ${
                    day.rest ? "border-line bg-surface text-muted" : "border-accent bg-accent-dim text-accent"
                  }`}
                >
                  {day.day}
                </span>
              ))}
            </div>
          </header>

          <NavBar profileId={profileId} displayName={displayName} />

          {children}

          <div className="mt-[30px] text-center text-xs text-[#565a63]">
            البيانات بتتحفظ في Supabase - تقدر تفتح المتابعة من أي جهاز بنفس الحساب.
          </div>
        </main>
      </body>
    </html>
  );
}
