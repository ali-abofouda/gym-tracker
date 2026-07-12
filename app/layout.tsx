import type { Metadata, Viewport } from "next";
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

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false
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
        <main className="mx-auto max-w-[980px] px-3 sm:px-4 pb-12 sm:pb-16 pt-4 sm:pt-6">

          {/* ── Header ── */}
          <header className="mb-4 sm:mb-6 flex items-center justify-between gap-3">
            {/* Title block */}
            <div className="min-w-0">
              <div
                className="font-oswald text-[10px] sm:text-[12px] uppercase tracking-[3px] mb-1 truncate"
                style={{ color: "var(--accent)" }}
              >
                <span className="hidden sm:inline">Weekly Split — </span>Bro Split Hybrid
              </div>
              <h1 className="m-0 text-[20px] sm:text-[30px] font-bold leading-tight tracking-tight gradient-text">
                برنامج التمرين الأسبوعي
              </h1>
            </div>

            {/* Day badges — hidden on xs screens to prevent overflow */}
            <div className="hidden sm:flex flex-wrap gap-1.5 justify-end shrink-0">
              {PROGRAM.map((day) => (
                <span
                  key={day.day}
                  className={`num flex h-[28px] w-[28px] sm:h-[30px] sm:w-[30px] items-center justify-center rounded-lg text-[11px] sm:text-[12px] font-bold transition-all duration-200 ${
                    day.rest
                      ? "border border-[var(--line)] bg-[var(--surface)] text-[var(--muted)]"
                      : "gradient-accent-bg text-white glow-accent"
                  }`}
                >
                  {day.day}
                </span>
              ))}
            </div>
          </header>

          {/* Divider */}
          <div
            className="mb-4 sm:mb-6 h-px w-full"
            style={{
              background: "linear-gradient(90deg, var(--accent) 0%, transparent 60%)"
            }}
          />

          <NavBar profileId={profileId} displayName={displayName} />

          {children}

          {/* Footer */}
          <div className="mt-10 text-center text-xs" style={{ color: "var(--muted)" }}>
            <span className="opacity-50">البيانات بتتحفظ في Supabase · تقدر تفتح المتابعة من أي جهاز</span>
          </div>
        </main>
      </body>
    </html>
  );
}
