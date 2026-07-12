"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "@/app/login/actions";

const links = [
  { href: "/program",     label: "البرنامج" },
  { href: "/tracker",     label: "الأوزان" },
  { href: "/leaderboard", label: "المنافسة" },
  { href: "/stats",       label: "تقدمي" },
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
      className="sticky top-0 z-20 mb-5 sm:mb-6 rounded-2xl p-1.5 sm:p-2"
      style={{
        background: "rgba(18, 20, 26, 0.88)",
        backdropFilter: "blur(20px) saturate(180%)",
        WebkitBackdropFilter: "blur(20px) saturate(180%)",
        border: "1px solid var(--line-bright)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.04)"
      }}
    >
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Nav links — 4 columns */}
        <div className="grid flex-1 grid-cols-4 gap-1 sm:gap-1.5">
          {links.map((link) => {
            const isActive =
              pathname === link.href ||
              (pathname === "/" && link.href === "/program");

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative flex items-center justify-center rounded-xl py-2 sm:py-2.5 text-[10px] sm:text-[12px] font-bold transition-all duration-200 leading-tight overflow-hidden ${
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
                  <span
                    className="pointer-events-none absolute inset-0 animate-shimmer rounded-xl"
                    aria-hidden
                  />
                )}
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* User area */}
        <div className="flex shrink-0 items-center gap-1">
          {profileId ? (
            <>
              {displayName && (
                <span className="hidden sm:block max-w-[80px] truncate text-xs font-bold gradient-gold">
                  {displayName}
                </span>
              )}
              <form action={signOut}>
                <button
                  className="rounded-xl border border-[var(--line)] bg-[var(--surface-raised)] px-2.5 py-2 text-xs font-bold text-[var(--muted)] transition-all duration-200 hover:border-[var(--line-bright)] hover:text-[var(--text)] whitespace-nowrap"
                  style={{ boxShadow: "var(--shadow-sm)" }}
                >
                  ⤴
                </button>
              </form>
            </>
          ) : (
            <Link
              className="rounded-xl px-3 py-2 text-xs font-bold text-white transition-all duration-200 whitespace-nowrap"
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
      </div>
    </nav>
  );
}
