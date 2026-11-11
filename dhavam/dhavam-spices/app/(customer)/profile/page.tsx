"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/axios";
import {
  UserRound,
  Mail,
  Phone,
  LockKeyhole,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  LoaderCircle,
  ShieldCheck,
} from "lucide-react";

type Profile = {
  username: string;
  email: string;
  phone: string;
};

const inputClass =
  "w-full rounded-xl border border-[#cfd5bf] bg-white px-4 py-3 text-[#20261f] outline-none transition focus:border-[#3f4a24] focus:ring-4 focus:ring-[#3f4a24]/10";

const labelClass = "mb-2 block text-sm font-semibold text-[#2f381b]";

export default function ProfilePage() {
  const router = useRouter();

  const [profile, setProfile] = useState<Profile>({
    username: "",
    email: "",
    phone: "",
  });

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      const token = sessionStorage.getItem("token");

      if (!token) {
        router.replace("/login?redirect=/profile");
        return;
      }

      try {
        const response = await api.get("/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (active) {
          const user = response.data.user;
          setProfile({
            username: user.username ?? "",
            email: user.email ?? "",
            phone: user.phone ?? "",
          });
        }
      } catch (err: unknown) {
        const status = (err as { response?: { status?: number } }).response?.status;

        if (status === 401) {
          sessionStorage.removeItem("token");
          sessionStorage.removeItem("username");
          sessionStorage.removeItem("role");
          router.replace("/login?redirect=/profile");
          return;
        }

        if (active) {
          setError("Unable to load your profile. Please try again.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadProfile();

    return () => {
      active = false;
    };
  }, [router]);

  function handleChange(field: keyof Profile, value: string) {
    setProfile((previous) => ({ ...previous, [field]: value }));
    setMessage("");
    setError("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMessage("");
    setError("");

    if (!profile.username.trim() || !profile.email.trim() || !profile.phone.trim()) {
      setError("Please fill in all profile fields.");
      return;
    }

    if (newPassword || currentPassword || confirmPassword) {
      if (!currentPassword || !newPassword || !confirmPassword) {
        setError("Fill in all three password fields to change your password.");
        return;
      }

      if (newPassword.length < 8) {
        setError("Your new password must be at least 8 characters.");
        return;
      }

      if (newPassword !== confirmPassword) {
        setError("The new passwords do not match.");
        return;
      }
    }

    const token = sessionStorage.getItem("token");

    if (!token) {
      router.replace("/login?redirect=/profile");
      return;
    }

    setSaving(true);

    try {
      const payload: Record<string, string> = {
        username: profile.username.trim(),
        email: profile.email.trim(),
        phone: profile.phone.trim(),
      };

      if (newPassword) {
        payload.currentPassword = currentPassword;
        payload.newPassword = newPassword;
      }

      const response = await api.put("/profile", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const { user, token: updatedToken } = response.data;

      // Only replace the token if the server actually sent a new one.
      // (Saving an undefined value would store the text "undefined" and log you out.)
      if (updatedToken) {
        sessionStorage.setItem("token", updatedToken);
      }
      sessionStorage.setItem("username", user.username ?? "");
      sessionStorage.setItem("role", user.role ?? "user");

      setProfile({
        username: user.username ?? "",
        email: user.email ?? "",
        phone: user.phone ?? "",
      });

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      window.dispatchEvent(new Event("authChanged"));

      setMessage("Your profile has been updated successfully.");
    } catch (err: unknown) {
      const responseError = err as {
        response?: { data?: { message?: string } };
        message?: string;
      };

      setError(
        responseError.response?.data?.message ||
          "Unable to update your profile. Please try again."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center bg-[#fcfaf3]">
        <div className="flex items-center gap-3 text-[#3f4a24]">
          <LoaderCircle className="animate-spin" size={22} />
          <span className="font-medium">Loading your profile...</span>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#fcfaf3] px-4 py-10 sm:px-6 sm:py-14">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/products"
          className="mb-7 inline-flex items-center gap-2 text-sm font-semibold text-[#596346] transition hover:text-[#9a432a]"
        >
          <ArrowLeft size={17} />
          Back to shopping
        </Link>

        <div className="mb-8">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#9a432a]">
            My account
          </span>

          <h1 className="mt-3 font-[family-name:var(--font-bricolage)] text-3xl font-bold tracking-tight text-[#2f381b] sm:text-4xl">
            My Profile
          </h1>

          <p className="mt-3 max-w-xl text-sm leading-6 text-[#626a57] sm:text-base">
            Manage your personal information and keep your account secure.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.75fr_1.5fr]">
          {/* Profile summary */}
          <aside className="h-fit rounded-3xl bg-[#2f381b] p-6 text-white shadow-xl shadow-[#2f381b]/10 sm:p-8">
            <div className="flex size-16 items-center justify-center rounded-2xl bg-[#f6f1e4] text-[#3f4a24]">
              <UserRound size={32} />
            </div>

            <h2 className="mt-5 break-words text-xl font-bold">
              {profile.username || "Your account"}
            </h2>

            <p className="mt-2 break-all text-sm text-[#d3dbbd]">{profile.email}</p>

            <div className="mt-7 border-t border-white/15 pt-5">
              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-0.5 shrink-0 text-[#d3dbbd]" size={19} />

                <div>
                  <p className="text-sm font-semibold">Account security</p>
                  <p className="mt-1 text-xs leading-5 text-[#d3dbbd]">
                    Use a strong password and keep your login details private.
                  </p>
                </div>
              </div>
            </div>
          </aside>

          {/* Edit form */}
          <section className="min-w-0 rounded-3xl border border-[#e3e8dc] bg-white p-5 shadow-sm sm:p-8">
            <div className="mb-7">
              <h2 className="text-xl font-bold text-[#2f381b]">Personal information</h2>
              <p className="mt-1 text-sm text-[#68705d]">
                Update your contact details and password.
              </p>
            </div>

            {message && (
              <div
                role="status"
                className="mb-6 flex gap-3 rounded-xl border border-[#cbdcc1] bg-[#edf4e8] p-4 text-sm text-[#2f581f]"
              >
                <CheckCircle2 className="shrink-0" size={19} />
                <p>{message}</p>
              </div>
            )}

            {error && (
              <div
                role="alert"
                className="mb-6 flex gap-3 rounded-xl border border-[#f0c9c1] bg-[#fbeae7] p-4 text-sm text-[#a52e1b]"
              >
                <AlertCircle className="shrink-0" size={19} />
                <p>{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="username" className={labelClass}>
                  Full name
                </label>
                <div className="relative">
                  <UserRound
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#858d77]"
                  />
                  <input
                    id="username"
                    name="username"
                    autoComplete="name"
                    required
                    maxLength={100}
                    value={profile.username}
                    onChange={(e) => handleChange("username", e.target.value)}
                    className={`${inputClass} pl-11`}
                    placeholder="Enter your name"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className={labelClass}>
                  Email address
                </label>
                <div className="relative">
                  <Mail
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#858d77]"
                  />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    maxLength={254}
                    value={profile.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    className={`${inputClass} pl-11`}
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="phone" className={labelClass}>
                  Phone number
                </label>
                <div className="relative">
                  <Phone
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#858d77]"
                  />
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    required
                    maxLength={20}
                    value={profile.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    className={`${inputClass} pl-11`}
                    placeholder="Enter your phone number"
                  />
                </div>
              </div>

              <div className="border-t border-[#e8eadf] pt-6">
                <div className="mb-5">
                  <h3 className="flex items-center gap-2 font-bold text-[#2f381b]">
                    <LockKeyhole size={18} />
                    Change password
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-[#68705d]">
                    Leave these fields empty if you do not want to change your password.
                  </p>
                </div>

                <div className="space-y-5">
                  <div>
                    <label htmlFor="currentPassword" className={labelClass}>
                      Current password
                    </label>
                    <input
                      id="currentPassword"
                      name="currentPassword"
                      type="password"
                      autoComplete="current-password"
                      maxLength={128}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className={inputClass}
                      placeholder="Enter current password"
                    />
                  </div>

                  <div>
                    <label htmlFor="newPassword" className={labelClass}>
                      New password
                    </label>
                    <input
                      id="newPassword"
                      name="newPassword"
                      type="password"
                      autoComplete="new-password"
                      minLength={8}
                      maxLength={128}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className={inputClass}
                      placeholder="At least 8 characters"
                    />
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className={labelClass}>
                      Confirm new password
                    </label>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      autoComplete="new-password"
                      maxLength={128}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={inputClass}
                      placeholder="Re-enter new password"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-[#3f4a24] px-6 py-3.5 font-semibold text-white shadow-lg shadow-[#3f4a24]/15 transition hover:bg-[#2f381b] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:min-w-48"
              >
                {saving && <LoaderCircle size={18} className="animate-spin" />}
                {saving ? "Saving changes..." : "Save changes"}
              </button>
            </form>
          </section>
        </div>
      </div>
    </main>
  );
}