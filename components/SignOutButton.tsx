import { signOut } from "@/app/login/actions";

export function SignOutButton() {
  return (
    <form action={signOut}>
      <button className="rounded-md border border-line bg-surface px-3 py-2 text-sm font-bold text-muted transition hover:border-[#3a3d45] hover:text-text">
        خروج
      </button>
    </form>
  );
}
