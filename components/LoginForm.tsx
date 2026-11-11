"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { loginUser } from "@/lib/login";

type Values = { username: string; password: string };
type FieldName = keyof Values;
type Errors = Partial<Record<FieldName, string>>;

const FIELD_ORDER: FieldName[] = ["username", "password"];

function validate(v: Values): Errors {
  const e: Errors = {};
  const username = v.username.trim();

  if (!username) {
    e.username = "Please enter your username or email.";
  } else if (username.length < 2) {
    e.username = "Username or email must be at least 2 characters.";
  }

  if (!v.password) {
    e.password = "Please enter your password.";
  } else if (v.password.length < 8) {
    e.password = "Password must be at least 8 characters.";
  }

  return e;
}

// Only allow redirects to pages inside this site
function getSafeRedirect(): string {
  if (typeof window === "undefined") return "/products";
  const redirect = new URLSearchParams(window.location.search).get("redirect");

  if (redirect && redirect.startsWith("/") && !redirect.startsWith("//")) {
    return redirect;
  }

  return "/products";
}

const inputBase =
  "w-full rounded-xl border bg-white px-4 py-3 text-[#20261f] placeholder:text-[#9aa28c] transition-shadow focus:outline-none focus:ring-4 focus:ring-[#9a432a]/25";

function Field({
  id,
  label,
  error,
  aside,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  aside?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between">
        <label htmlFor={id} className="text-sm font-medium text-[#2f381b]">
          {label}
        </label>
        {aside}
      </div>

      {children}

      {error && (
        <p id={`${id}-err`} role="alert" className="mt-1.5 text-sm text-[#b3341f]">
          {error}
        </p>
      )}
    </div>
  );
}

export default function LoginForm() {
  const router = useRouter();

  // Username box is strictly blank by default
  const [v, setV] = useState<Values>({ username: "", password: "" });
  const [touched, setTouched] = useState<Partial<Record<FieldName, boolean>>>({});
  const [submitted, setSubmitted] = useState(false);
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState("");

  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const resetForm = () => {
      setV({ username: "", password: "" });
      setTouched({});
      setSubmitted(false);
      setShow(false);
      setBusy(false);
      setFormError("");
    };

    resetForm();
    window.addEventListener("pageshow", resetForm);

    return () => {
      window.removeEventListener("pageshow", resetForm);
    };
  }, []);

  const all = validate(v);
  const errors: Errors = {};

  FIELD_ORDER.forEach((k) => {
    if ((touched[k] || submitted) && all[k]) {
      errors[k] = all[k];
    }
  });

  const set = (k: FieldName) => (e: ChangeEvent<HTMLInputElement>) => {
    setV((p) => ({ ...p, [k]: e.target.value }));
    if (formError) setFormError("");
  };

  const blur = (k: FieldName) => () =>
    setTouched((t) => ({ ...t, [k]: true }));

  const cls = (k: FieldName) =>
    `${inputBase} ${errors[k] ? "border-[#b3341f]" : "border-[#cfd5bf]"}`;

  const aria = (k: FieldName) => ({
    "aria-invalid": !!errors[k],
    "aria-describedby": errors[k] ? `${k}-err` : undefined,
  });

  async function onSubmit(ev: FormEvent<HTMLFormElement>) {
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
      const input = v.username.trim();
      const isEmail = input.includes("@");

      const data = await loginUser({
        ...(isEmail
          ? { email: input.toLowerCase() }
          : { username: input }),
        password: v.password,
      });

      sessionStorage.setItem("token", data.token);
      sessionStorage.setItem("username", data.user.username ?? "");
      sessionStorage.setItem("role", data.user.role ?? "user");

      window.dispatchEvent(new Event("authChanged"));

      if (data.user.role === "admin") {
        router.push("/admin");
      } else {
        router.push(getSafeRedirect());
      }
    } catch (err) {
      setFormError(
        err instanceof Error
          ? err.message
          : "Invalid credentials. Please try again."
      );
      setBusy(false);
    }
  }

  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate className="space-y-5">
      {formError && (
        <p role="alert" className="rounded-xl bg-[#fbeae7] px-4 py-3 text-sm text-[#b3341f]">
          {formError}
        </p>
      )}

      {/* Username / Email field - blank by default */}
      <Field id="username" label="Username or Email" error={errors.username}>
        <input
          id="username"
          name="username"
          type="text"
          value={v.username}
          onChange={set("username")}
          onBlur={blur("username")}
          maxLength={100}
          autoComplete="off"
          placeholder="Enter username or email"
          className={cls("username")}
          {...aria("username")}
        />
      </Field>

      {/* Password field */}
      <Field id="password" label="Password" error={errors.password}>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={show ? "text" : "password"}
            value={v.password}
            onChange={set("password")}
            onBlur={blur("password")}
            maxLength={128}
            autoComplete="current-password"
            placeholder="Enter your password"
            className={`${cls("password")} pr-16`}
            {...aria("password")}
          />

          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            aria-pressed={show}
            className="absolute inset-y-0 right-3 my-auto h-8 rounded-md px-2 text-sm font-semibold text-[#3f4a24] hover:bg-[#e6ebdc] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9a432a]"
          >
            {show ? "Hide" : "Show"}
          </button>
        </div>
      </Field>

      <button
        type="submit"
        disabled={busy}
        className="flex w-full items-center justify-center gap-2 rounded-full bg-[#3f4a24] px-6 py-3.5 font-semibold text-white shadow-lg shadow-[#3f4a24]/25 transition-all hover:-translate-y-0.5 hover:bg-[#2f381b] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#9a432a]/40 disabled:translate-y-0 disabled:opacity-70"
      >
        {busy && (
          <span
            className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
            aria-hidden="true"
          />
        )}
        {busy ? "Signing in…" : "Sign in"}
      </button>

      <p className="text-center text-sm text-[#566049]">
        New to Dhavam Spices?{" "}
        <Link href="/register" className="font-semibold text-[#9a432a] hover:underline">
          Create an account
        </Link>
      </p>
    </form>
  );
}
