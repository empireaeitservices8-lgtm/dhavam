"use client";

import Link from "next/link";
import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { registerUser } from "@/lib/auth";

type Values = { name: string; email: string; phone: string; password: string; confirm: string };
type FieldName = keyof Values;
type Errors = Partial<Record<FieldName, string>>;

const FIELD_ORDER: FieldName[] = ["name", "email", "phone", "password", "confirm"];

/* ---------- validation helpers ---------- */

/** "+91 98765-43210", "098765 43210" and "9876543210" all become "9876543210". */
function normalizePhone(raw: string) {
  let d = raw.replace(/[\s-]/g, "");
  if (d.startsWith("+91")) d = d.slice(3);
  else if (d.length === 12 && d.startsWith("91")) d = d.slice(2);
  else if (d.length === 11 && d.startsWith("0")) d = d.slice(1);
  return d;
}

const PASSWORD_RULES = [
  { id: "len", label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  { id: "lower", label: "One lowercase letter", test: (p: string) => /[a-z]/.test(p) },
  { id: "upper", label: "One uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
  { id: "num", label: "One number", test: (p: string) => /\d/.test(p) },
];

function validate(v: Values): Errors {
  const e: Errors = {};

  const name = v.name.trim();
  if (!name) e.name = "Please enter your full name.";
  else if (name.length < 2) e.name = "Name is too short.";
  else if (name.length > 60) e.name = "Name must be 60 characters or fewer.";
  else if (!/^\p{L}[\p{L}\s.'-]*$/u.test(name)) e.name = "Use letters only (spaces, . ' - are fine).";

  const email = v.email.trim();
  if (!email) e.email = "Please enter your email address.";
  else if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) e.email = "Enter a valid email, like name@example.com.";

  const phone = normalizePhone(v.phone);
  if (!v.phone.trim()) e.phone = "Please enter your mobile number.";
  else if (!/^\d+$/.test(phone)) e.phone = "Mobile number can only contain digits.";
  else if (phone.length !== 10) e.phone = "Mobile number must be exactly 10 digits.";
  else if (!/^[6-9]/.test(phone)) e.phone = "Indian mobile numbers start with 6, 7, 8 or 9.";

  if (!v.password) e.password = "Please create a password.";
  else if (v.password.length > 64) e.password = "Password must be 64 characters or fewer.";
  else if (PASSWORD_RULES.some((r) => !r.test(v.password))) e.password = "Password doesn't meet all the requirements yet.";

  if (!v.confirm) e.confirm = "Please repeat your password.";
  else if (v.confirm !== v.password) e.confirm = "Passwords don't match.";

  return e;
}

function strength(pw: string) {
  let s = PASSWORD_RULES.filter((r) => r.test(pw)).length; // 0-4
  if (s === 4 && pw.length < 10 && !/[^A-Za-z0-9]/.test(pw)) s = 3;
  return s;
}
const STRENGTH_LABEL = ["Too weak", "Weak", "Fair", "Good", "Strong"];
const STRENGTH_COLOR = ["bg-[#d8dccb]", "bg-[#c0392b]", "bg-[#d98a1c]", "bg-[#7d8f3a]", "bg-[#3f4a24]"];

/* ---------- UI ---------- */

const inputBase =
  "w-full rounded-xl border bg-white px-4 py-3 text-[#20261f] placeholder:text-[#9aa28c] transition-shadow focus:outline-none focus:ring-4 focus:ring-[#9a432a]/25";

function Field({ id, label, error, children }: { id: string; label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-[#2f381b]">{label}</label>
      {children}
      {error && <p id={`${id}-err`} role="alert" className="mt-1.5 text-sm text-[#b3341f]">{error}</p>}
    </div>
  );
}

export default function RegisterForm() {
  const [v, setV] = useState<Values>({ name: "", email: "", phone: "", password: "", confirm: "" });
  const [touched, setTouched] = useState<Partial<Record<FieldName, boolean>>>({});
  const [submitted, setSubmitted] = useState(false);
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [formError, setFormError] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  // Errors are derived from the current values, so they update live as the user types
  // (but only appear once a field has been visited or the form was submitted).
  const all = validate(v);
  const errors: Errors = {};
  FIELD_ORDER.forEach((k) => {
    if ((touched[k] || submitted) && all[k]) errors[k] = all[k];
  });

  const set = (k: FieldName) => (e: ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    if (k === "phone") value = value.replace(/[^\d\s+-]/g, ""); // digits, space, +, - only
    setV((p) => ({ ...p, [k]: value }));
  };
  const blur = (k: FieldName) => () => setTouched((t) => ({ ...t, [k]: true }));

  const cls = (k: FieldName) => `${inputBase} ${errors[k] ? "border-[#b3341f]" : "border-[#cfd5bf]"}`;
  const aria = (k: FieldName) => ({ "aria-invalid": !!errors[k], "aria-describedby": errors[k] ? `${k}-err` : undefined });

  const score = strength(v.password);

  async function onSubmit(ev: FormEvent) {
    ev.preventDefault();
    if (busy) return;
    setSubmitted(true);
    setFormError("");

    const firstBad = FIELD_ORDER.find((k) => all[k]);
    if (firstBad) {
      formRef.current?.querySelector<HTMLInputElement>(`#${firstBad}`)?.focus();
      return;
    }

    setBusy(true);
    try {
     await registerUser({
  username: v.name.trim().replace(/\s+/g, " "),
  email: v.email.trim().toLowerCase(),
  phone: normalizePhone(v.phone),
  password: v.password,
});
      setDone(true);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div className="py-6 text-center" role="status">
        <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-[#e6ebdc] text-[#3f4a24]">
          <svg viewBox="0 0 24 24" className="size-8" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </div>
        <h2 className="mt-5 font-[family-name:var(--font-bricolage)] text-2xl font-bold text-[#2f381b]">Welcome, {v.name.trim().split(" ")[0]}!</h2>
        <p className="mt-2 text-[#566049]">Your account has been created.</p>
        <Link href="/products" className="mt-6 inline-flex rounded-full bg-[#3f4a24] px-7 py-3 font-semibold text-white transition-colors hover:bg-[#2f381b] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#9a432a]/40">Start shopping</Link>
      </div>
    );
  }

  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate className="space-y-5">
      <Field id="name" label="Full name" error={errors.name}>
        <input id="name" value={v.name} onChange={set("name")} onBlur={blur("name")} maxLength={60} autoComplete="name" placeholder="Your name" className={cls("name")} {...aria("name")} />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="email" label="Email" error={errors.email}>
          <input id="email" type="email" value={v.email} onChange={set("email")} onBlur={blur("email")} maxLength={254} autoComplete="email" placeholder="you@example.com" className={cls("email")} {...aria("email")} />
        </Field>
        <Field id="phone" label="Mobile number" error={errors.phone}>
          <div className="flex">
            <span className="flex items-center rounded-l-xl border border-r-0 border-[#cfd5bf] bg-[#f1f4ea] px-3 text-sm text-[#566049]">+91</span>
            <input id="phone" type="tel" inputMode="numeric" value={v.phone} onChange={set("phone")} onBlur={blur("phone")} maxLength={14} autoComplete="tel-national" placeholder="98765 43210" className={`${cls("phone")} rounded-l-none`} {...aria("phone")} />
          </div>
        </Field>
      </div>

      <Field id="password" label="Password" error={errors.password}>
        <div className="relative">
          <input id="password" type={show ? "text" : "password"} value={v.password} onChange={set("password")} onBlur={blur("password")} maxLength={64} autoComplete="new-password" placeholder="Create a password" className={`${cls("password")} pr-16`} {...aria("password")} />
          <button type="button" onClick={() => setShow((s) => !s)} aria-pressed={show} className="absolute inset-y-0 right-3 my-auto h-8 rounded-md px-2 text-sm font-semibold text-[#3f4a24] hover:bg-[#e6ebdc] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9a432a]">
            {show ? "Hide" : "Show"}
          </button>
        </div>
        {v.password && (
          <div className="mt-3" aria-live="polite">
            <div className="flex gap-1.5">
              {[1, 2, 3, 4].map((i) => (
                <span key={i} className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${i <= score ? STRENGTH_COLOR[score] : "bg-[#e3e7d6]"}`} />
              ))}
            </div>
            <p className="mt-1 text-xs text-[#566049]">Strength: {STRENGTH_LABEL[score]}</p>
            <ul className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1">
              {PASSWORD_RULES.map((r) => {
                const ok = r.test(v.password);
                return (
                  <li key={r.id} className={`flex items-center gap-1.5 text-xs transition-colors ${ok ? "text-[#3f4a24]" : "text-[#7a8470]"}`}>
                    <svg viewBox="0 0 16 16" className="size-3.5 shrink-0" aria-hidden="true">
                      {ok ? <path d="M3 8.5l3.2 3.2L13 5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /> : <circle cx="8" cy="8" r="3" fill="none" stroke="currentColor" strokeWidth="1.6" />}
                    </svg>
                    {r.label}
                    <span className="sr-only">{ok ? " (met)" : " (not met)"}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </Field>

      <Field id="confirm" label="Confirm password" error={errors.confirm}>
        <input id="confirm" type={show ? "text" : "password"} value={v.confirm} onChange={set("confirm")} onBlur={blur("confirm")} maxLength={64} autoComplete="new-password" placeholder="Repeat your password" className={cls("confirm")} {...aria("confirm")} />
      </Field>

      {formError && <p role="alert" className="rounded-xl bg-[#fbeae7] px-4 py-3 text-sm text-[#b3341f]">{formError}</p>}

      <button type="submit" disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-full bg-[#3f4a24] px-6 py-3.5 font-semibold text-white shadow-lg shadow-[#3f4a24]/25 transition-all hover:-translate-y-0.5 hover:bg-[#2f381b] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#9a432a]/40 disabled:translate-y-0 disabled:opacity-70">
        {busy && <span className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-hidden="true" />}
        {busy ? "Creating account…" : "Create account"}
      </button>

      <p className="text-center text-sm text-[#566049]">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-[#9a432a] hover:underline">Log in</Link>
      </p>
    </form>
  );
}
