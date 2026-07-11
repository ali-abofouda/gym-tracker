"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "@/app/login/actions";

const links = [
  { href: "/program", label: "البرنامج" },
  { href: "/tracker", label: "الأوزان" },
  { href: "/leaderboard", label: "المنافسة" }
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
    <nav className="sticky top-0 z-20 mb-4 sm:mb-[22px] rounded-xl border border-line bg-[#181a1f]/95 p-1.5 sm:p-2 shadow-[0_12px_30px_rgba(0,0,0,0.22)] backdrop-blur">
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Nav links — take all remaining width */}
        <div className="grid flex-1 grid-cols-3 gap-1.5 sm:gap-2">
          {links.map((link) => {
            const isActive = pathname === link.href || (pathname === "/" && link.href === "/program");

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-lg border py-2 sm:py-2.5 text-center text-[11px] sm:text-sm font-bold transition leading-tight ${
                  isActive
                    ? "border-accent bg-accent text-white"
                    : "border-line bg-surface text-muted hover:border-[#3a3d45] hover:text-text"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* User area — stays on same row */}
        <div className="flex shrink-0 items-center gap-1.5">
          {profileId ? (
            <>
              <span className="hidden sm:block max-w-[80px] truncate text-xs font-bold text-gold">{displayName}</span>
              <form action={signOut}>
                <button className="rounded-lg border border-line bg-surface px-2.5 py-2 sm:px-3 text-xs sm:text-sm font-bold text-muted transition hover:border-[#3a3d45] hover:text-text whitespace-nowrap">
                  خروج
                </button>
              </form>
            </>
          ) : (
            <Link
              className="rounded-lg border border-accent bg-accent px-3 py-2 text-xs sm:text-sm font-bold text-white transition hover:bg-[#c73438] whitespace-nowrap"
              href="/login"
            >
              دخول
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
