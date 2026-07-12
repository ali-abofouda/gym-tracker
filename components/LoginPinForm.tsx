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

/* Avatar color based on name */
const AVATAR_COLORS = [
  { bg: "#2a1a2e", text: "#c084fc" },
  { bg: "#162232", text: "#38bdf8" },
  { bg: "#1a2816", text: "#86efac" },
  { bg: "#2a2018", text: "#fcd34d" },
  { bg: "#2a1a1a", text: "#fca5a5" },
  { bg: "#181a2a", text: "#818cf8" },
];

function getAvatarColor(idx: number) {
  return AVATAR_COLORS[idx % AVATAR_COLORS.length];
}

export function LoginPinForm({ profiles }: { profiles: PublicProfile[] }) {
  const [state, formAction] = useFormState(pinLogin, {});
  const [selectedId, setSelectedId] = useState(profiles[0]?.id ?? "");
  const [pin, setPin] = useState("");
  const [lastPressed, setLastPressed] = useState<string | null>(null);

  const selected = useMemo(
    () => profiles.find((profile) => profile.id === selectedId) ?? profiles[0],
    [profiles, selectedId]
  );
  const mode = selected?.hasPin ? "login" : "set";

  const pressKey = (key: string) => {
    setLastPressed(key);
    setTimeout(() => setLastPressed(null), 150);

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
    <section
      className="overflow-hidden rounded-2xl animate-fade-in-up"
      style={{
        border: "1px solid var(--line)",
        background: "var(--surface)",
        boxShadow: "var(--shadow-md)"
      }}
    >
      {/* Header */}
      <div
        className="px-5 sm:px-6 py-5"
        style={{
          borderBottom: "1px solid var(--line)",
          background: "linear-gradient(135deg, rgba(255,78,66,0.07) 0%, transparent 100%), var(--surface-raised)"
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl text-xl shrink-0"
            style={{
              background: "linear-gradient(135deg, var(--accent) 0%, var(--accent-end) 100%)",
              boxShadow: "0 4px 14px var(--accent-glow)"
            }}
          >
            🏋️
          </div>
          <div>
            <h2 className="m-0 text-xl sm:text-2xl font-bold text-[var(--text)]">دخول اللاعبين</h2>
            <p className="mt-0.5 text-sm text-[var(--muted)]">اختار اسمك واكتب PIN من 4 أرقام</p>
          </div>
        </div>
      </div>

      <div className="p-5 sm:p-6">
        {/* Profile selector */}
        <div className="mb-6 grid grid-cols-3 gap-2 sm:grid-cols-5">
          {profiles.map((profile, idx) => {
            const color = getAvatarColor(idx);
            const isSelected = selectedId === profile.id;
            return (
              <button
                key={profile.id}
                type="button"
                onClick={() => {
                  setSelectedId(profile.id);
                  setPin("");
                }}
                className="rounded-xl px-2 py-4 text-center text-sm font-bold transition-all duration-200 flex flex-col items-center gap-2"
                style={
                  isSelected
                    ? {
                        background: "var(--gold-dim)",
                        border: "1px solid rgba(240,180,41,0.35)",
                        color: "var(--gold)",
                        boxShadow: "0 4px 16px var(--gold-glow), inset 0 1px 0 rgba(240,180,41,0.1)"
                      }
                    : {
                        background: "var(--surface-raised)",
                        border: "1px solid var(--line)",
                        color: "var(--muted)"
                      }
                }
              >
                {/* Avatar */}
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-full text-base font-bold transition-all"
                  style={{
                    background: isSelected ? "var(--gold-dim)" : color.bg,
                    color: isSelected ? "var(--gold)" : color.text,
                    border: isSelected ? "2px solid rgba(240,180,41,0.4)" : "1px solid transparent"
                  }}
                >
                  {profile.display_name.charAt(0)}
                </div>
                <span className="text-xs leading-tight">{profile.display_name}</span>
              </button>
            );
          })}
        </div>

        <form action={formAction} className="mx-auto max-w-[320px]">
          <input type="hidden" name="profileId" value={selected?.id ?? ""} />
          <input type="hidden" name="mode" value={mode} />
          <input type="hidden" name="pin" value={pin} />

          {/* Selected user + mode label */}
          <div className="mb-5 text-center">
            <div className="text-base font-bold text-[var(--text)]">{selected?.display_name}</div>
            <div
              className="mt-1 inline-block rounded-full px-3 py-0.5 text-[11px] font-semibold"
              style={{
                background: mode === "set" ? "var(--accent-dim)" : "var(--surface-raised)",
                color: mode === "set" ? "var(--accent)" : "var(--muted)",
                border: `1px solid ${mode === "set" ? "rgba(255,78,66,0.2)" : "var(--line)"}`
              }}
            >
              {mode === "set" ? "✨ أول دخول — عيّن PIN جديد" : "🔐 اكتب PIN"}
            </div>
          </div>

          {/* PIN dots */}
          <div className="mb-6 flex justify-center gap-3" dir="ltr">
            {[0, 1, 2, 3].map((slot) => {
              const filled = pin.length > slot;
              return (
                <div
                  key={slot}
                  className="h-5 w-5 rounded-full transition-all duration-200"
                  style={{
                    background: filled
                      ? "linear-gradient(135deg, var(--gold) 0%, #ffd97d 100%)"
                      : "var(--surface-raised)",
                    border: filled
                      ? "2px solid rgba(240,180,41,0.5)"
                      : "2px solid var(--line-bright)",
                    boxShadow: filled ? "0 0 10px var(--gold-glow)" : "none",
                    transform: filled ? "scale(1.15)" : "scale(1)"
                  }}
                />
              );
            })}
          </div>

          {/* Keypad */}
          <div className="grid grid-cols-3 gap-2.5">
            {KEYS.map((key) => {
              const isSpecial = key === "مسح" || key === "⌫";
              const isPressed = lastPressed === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => pressKey(key)}
                  className="num h-[54px] rounded-xl text-lg font-bold transition-all duration-100"
                  style={{
                    background: isPressed
                      ? isSpecial
                        ? "var(--accent-dim)"
                        : "linear-gradient(135deg, rgba(255,78,66,0.15), rgba(255,122,47,0.1))"
                      : "var(--surface-raised)",
                    border: isPressed
                      ? isSpecial
                        ? "1px solid rgba(255,78,66,0.4)"
                        : "1px solid rgba(255,78,66,0.3)"
                      : "1px solid var(--line-bright)",
                    color: isSpecial ? "var(--muted-bright)" : "var(--text)",
                    transform: isPressed ? "scale(0.94)" : "scale(1)",
                    boxShadow: isPressed
                      ? "none"
                      : "var(--shadow-sm)"
                  }}
                >
                  {key}
                </button>
              );
            })}
          </div>

          {/* Error */}
          {state.error && (
            <div
              className="mt-4 rounded-xl px-4 py-3 text-sm font-semibold animate-slide-in"
              style={{
                background: "var(--accent-dim)",
                border: "1px solid rgba(255,78,66,0.3)",
                color: "var(--accent)"
              }}
            >
              ⚠️ {state.error}
            </div>
          )}

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
      className="mt-4 w-full rounded-xl py-3.5 text-sm font-bold text-white transition-all duration-200"
      style={{
        background: pending || disabled
          ? "var(--surface-raised)"
          : "linear-gradient(135deg, var(--accent) 0%, var(--accent-end) 100%)",
        border: pending || disabled ? "1px solid var(--line)" : "none",
        color: pending || disabled ? "var(--muted)" : "white",
        boxShadow: pending || disabled ? "none" : "0 6px 20px var(--accent-glow)",
        cursor: pending || disabled ? "not-allowed" : "pointer"
      }}
    >
      {pending ? (
        <span className="flex items-center justify-center gap-2">
          <span
            className="inline-block h-4 w-4 rounded-full border-2 border-transparent animate-spin"
            style={{ borderTopColor: "var(--muted)" }}
          />
          جاري الدخول...
        </span>
      ) : (
        label
      )}
    </button>
  );
}
