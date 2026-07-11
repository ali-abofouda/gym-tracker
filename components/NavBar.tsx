"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "@/app/login/actions";

const links = [
  { href: "/program", label: "البرنامج" },
  { href: "/tracker", label: "متابعة الأوزان" },
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
    <nav className="sticky top-0 z-20 mb-[22px] rounded-xl border border-line bg-[#181a1f]/95 p-2 shadow-[0_12px_30px_rgba(0,0,0,0.22)] backdrop-blur">
      <div className="flex flex-wrap items-center gap-2">
        <div className="grid flex-1 grid-cols-3 gap-2">
          {links.map((link) => {
            const isActive = pathname === link.href || (pathname === "/" && link.href === "/program");

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-lg border px-2 py-2 text-center text-xs sm:px-3 sm:py-2.5 sm:text-sm font-bold transition ${
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

        <div className="flex w-full items-center justify-between gap-2 border-t border-line pt-2 sm:w-auto sm:border-t-0 sm:pt-0">
          {profileId ? (
            <>
              <span className="min-w-0 truncate px-2 text-xs font-bold text-gold">{displayName}</span>
              <form action={signOut}>
                <button className="rounded-lg border border-line bg-surface px-3 py-2 text-sm font-bold text-muted transition hover:border-[#3a3d45] hover:text-text">
                  خروج
                </button>
              </form>
            </>
          ) : (
            <Link className="w-full rounded-lg border border-accent bg-accent px-4 py-2 text-center text-sm font-bold text-white sm:w-auto" href="/login">
              دخول
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
