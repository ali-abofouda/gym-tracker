"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "@/app/login/actions";

const links = [
  { href: "/program",     label: "البرنامج",  icon: "📋" },
  { href: "/tracker",     label: "الأوزان",   icon: "🏋️" },
  { href: "/leaderboard", label: "المنافسة",  icon: "🏆" },
  { href: "/stats",       label: "تقدمي",     icon: "📊" },
] as const;

export function NavBar({
  profileId,
  displayName
}: {
  profileId: string | null;
  displayName: string | null;
}) {
  const pathname = usePathname();

  return (
    <nav
      className="sticky top-0 z-20 mb-5 sm:mb-6 rounded-2xl"
      style={{
        background: "rgba(18, 20, 26, 0.92)",
        backdropFilter: "blur(20px) saturate(180%)",
        WebkitBackdropFilter: "blur(20px) saturate(180%)",
        border: "1px solid var(--line-bright)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.04)"
      }}
    >
      {/* Main nav row */}
      <div className="flex items-center gap-1.5 p-1.5">
        {/* 4 nav links */}
        <div className="grid flex-1 grid-cols-4 gap-1">
          {links.map((link) => {
            const isActive =
              pathname === link.href ||
              (pathname === "/" && link.href === "/program");

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1.5 rounded-xl py-2 sm:py-2.5 px-1 text-[9px] sm:text-[12px] font-bold transition-all duration-200 leading-tight overflow-hidden ${
                  isActive ? "text-white" : "text-[var(--muted)] hover:text-[var(--text)]"
                }`}
                style={
                  isActive
                    ? {
                        background: "linear-gradient(135deg, var(--accent) 0%, var(--accent-end) 100%)",
                        boxShadow: "0 4px 16px var(--accent-glow), inset 0 1px 0 rgba(255,255,255,0.15)"
                      }
                    : {
                        background: "var(--surface-raised)",
                        border: "1px solid var(--line)"
                      }
                }
              >
                {isActive && (
                  <span className="pointer-events-none absolute inset-0 animate-shimmer rounded-xl" aria-hidden />
                )}
                <span className="text-sm sm:text-base leading-none">{link.icon}</span>
                <span className="leading-none">{link.label}</span>
              </Link>
            );
          })}
        </div>

        {/* User: show only sign-out icon on mobile to save space */}
        {profileId ? (
          <div className="flex shrink-0 items-center gap-1">
            {displayName && (
              <span className="hidden md:block max-w-[72px] truncate text-xs font-bold gradient-gold">
                {displayName}
              </span>
            )}
            <form action={signOut}>
              <button
                title={`تسجيل خروج ${displayName ?? ""}`}
                className="flex items-center justify-center rounded-xl border border-[var(--line)] bg-[var(--surface-raised)] text-[var(--muted)] transition-all duration-200 hover:border-[var(--line-bright)] hover:text-[var(--text)]"
                style={{ width: 36, height: 36 }}
              >
                <span className="text-sm">↩</span>
              </button>
            </form>
          </div>
        ) : (
          <Link
            className="shrink-0 flex items-center justify-center rounded-xl px-3 py-2 text-xs font-bold text-white transition-all duration-200 whitespace-nowrap"
            href="/login"
            style={{
              background: "linear-gradient(135deg, var(--accent) 0%, var(--accent-end) 100%)",
              boxShadow: "0 4px 14px var(--accent-glow)"
            }}
          >
            دخول
          </Link>
        )}
      </div>
    </nav>
  );
}
