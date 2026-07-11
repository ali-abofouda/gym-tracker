"use client";

import { useMemo, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { pinLogin } from "@/app/login/actions";

type PublicProfile = {
  id: string;
  display_name: string;
  hasPin: boolean;
};

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "مسح", "0", "⌫"];

export function LoginPinForm({ profiles }: { profiles: PublicProfile[] }) {
  const [state, formAction] = useFormState(pinLogin, {});
  const [selectedId, setSelectedId] = useState(profiles[0]?.id ?? "");
  const [pin, setPin] = useState("");

  const selected = useMemo(
    () => profiles.find((profile) => profile.id === selectedId) ?? profiles[0],
    [profiles, selectedId]
  );
  const mode = selected?.hasPin ? "login" : "set";

  const pressKey = (key: string) => {
    if (key === "مسح") {
      setPin("");
      return;
    }
    if (key === "⌫") {
      setPin((current) => current.slice(0, -1));
      return;
    }
    setPin((current) => (current.length < 4 ? `${current}${key}` : current));
  };

  return (
    <section className="overflow-hidden rounded-xl border border-line bg-surface">
      <div className="border-b border-line bg-raised px-[18px] py-4">
        <h2 className="m-0 text-xl font-bold">دخول اللاعبين</h2>
        <p className="mt-1 text-sm text-muted">اختار اسمك واكتب PIN من 4 أرقام.</p>
      </div>

      <div className="p-[18px]">
        <div className="mb-5 grid grid-cols-2 gap-2 sm:grid-cols-5">
          {profiles.map((profile) => (
            <button
              key={profile.id}
              type="button"
              onClick={() => {
                setSelectedId(profile.id);
                setPin("");
              }}
              className={`rounded-lg border px-3 py-4 text-center text-sm font-bold transition ${
                selectedId === profile.id
                  ? "border-gold bg-[#2a2210] text-gold"
                  : "border-line bg-raised text-muted hover:border-[#3a3d45] hover:text-text"
              }`}
            >
              {profile.display_name}
            </button>
          ))}
        </div>

        <form action={formAction} className="mx-auto max-w-[340px]">
          <input type="hidden" name="profileId" value={selected?.id ?? ""} />
          <input type="hidden" name="mode" value={mode} />
          <input type="hidden" name="pin" value={pin} />

          <div className="mb-3 text-center">
            <div className="text-sm font-bold text-text">{selected?.display_name}</div>
            <div className="text-xs text-muted">{mode === "set" ? "أول دخول - عيّن PIN جديد" : "اكتب PIN"}</div>
          </div>

          <div className="mb-4 flex justify-center gap-2" dir="ltr">
            {[0, 1, 2, 3].map((slot) => (
              <div
                key={slot}
                className={`h-4 w-4 rounded-full border ${pin.length > slot ? "border-gold bg-gold" : "border-line bg-raised"}`}
              />
            ))}
          </div>

          <div className="grid grid-cols-3 gap-2">
            {KEYS.map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => pressKey(key)}
                className="num h-14 rounded-lg border border-line bg-raised text-lg font-bold text-text transition hover:border-gold"
              >
                {key}
              </button>
            ))}
          </div>

          {state.error && <div className="mt-4 rounded-lg border border-accent bg-accent-dim px-4 py-3 text-sm text-accent">{state.error}</div>}

          <SubmitButton disabled={pin.length !== 4 || !selected} label={mode === "set" ? "حفظ PIN والدخول" : "دخول"} />
        </form>
      </div>
    </section>
  );
}

function SubmitButton({ disabled, label }: { disabled: boolean; label: string }) {
  const { pending } = useFormStatus();

  return (
    <button
      disabled={pending || disabled}
      className="mt-4 w-full rounded-md bg-accent px-5 py-3 text-sm font-bold text-white transition hover:bg-[#c73438] disabled:cursor-not-allowed disabled:opacity-50"
    >
      {pending ? "جاري الدخول..." : label}
    </button>
  );
}
