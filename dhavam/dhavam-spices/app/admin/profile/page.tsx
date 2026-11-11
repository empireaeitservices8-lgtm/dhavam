"use client";

import { api } from "@/lib/axios";
import {
  useCallback,
  useEffect,
  useState,
  type FormEvent,
} from "react";
import {
  UserRound,
  Mail,
  Phone,
  LockKeyhole,
  Save,
  LoaderCircle,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Eye,
  EyeOff,
} from "lucide-react";
import Link from "next/link";

type Profile = {
  username: string;
  email: string;
  phone: string;
  role?: string;
};

type ProfileField =
  | "username"
  | "email"
  | "phone"
  | "currentPassword"
  | "newPassword"
  | "confirmPassword";

type ProfileErrors = Partial<Record<ProfileField, string>>;

const INITIAL_PROFILE: Profile = {
  username: "",
  email: "",
  phone: "",
  role: "admin",
};

const inputClass =
  "w-full rounded-xl border bg-white px-4 py-3 text-sm text-[#303522] outline-none transition placeholder:text-[#a1a594] focus:border-[#7e895e] focus:ring-4 focus:ring-[#e6ebdc]/70";

const labelClass =
  "mb-2 block text-sm font-semibold text-[#3f462f]";

function validateProfile(
  profile: Profile,
  currentPassword: string,
  newPassword: string,
  confirmPassword: string
): ProfileErrors {
  const errors: ProfileErrors = {};

  const username = profile.username.trim();
  const email = profile.email.trim();
  const phone = profile.phone.trim();

  if (!username) {
    errors.username = "Please enter your full name.";
  } else if (username.length < 2) {
    errors.username = "Name must be at least 2 characters.";
  } else if (username.length > 100) {
    errors.username = "Name cannot exceed 100 characters.";
  }

  if (!email) {
    errors.email = "Please enter your email address.";
  } else if (
    email.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  ) {
    errors.email = "Please enter a valid email address.";
  }

  if (!phone) {
    errors.phone = "Please enter your phone number.";
  } else if (!/^[+]?[\d\s()-]{7,20}$/.test(phone)) {
    errors.phone = "Please enter a valid phone number.";
  }

  const changingPassword =
    currentPassword.length > 0 ||
    newPassword.length > 0 ||
    confirmPassword.length > 0;

  if (changingPassword) {
    if (!currentPassword) {
      errors.currentPassword = "Please enter your current password.";
    }

    if (!newPassword) {
      errors.newPassword = "Please enter a new password.";
    } else if (newPassword.length < 8) {
      errors.newPassword = "Password must be at least 8 characters.";
    } else if (newPassword.length > 128) {
      errors.newPassword = "Password cannot exceed 128 characters.";
    }

    if (!confirmPassword) {
      errors.confirmPassword = "Please confirm your new password.";
    } else if (newPassword !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match.";
    }

    if (
      currentPassword &&
      newPassword &&
      currentPassword === newPassword
    ) {
      errors.newPassword =
        "Your new password must differ from your current password.";
    }
  }

  return errors;
}

function getErrorMessage(error: unknown): string {
  const err = error as {
    response?: {
      data?: {
        message?: string;
        error?: string;
      };
    };
    message?: string;
  };

  return (
    err.response?.data?.message ||
    err.response?.data?.error ||
    err.message ||
    "Something went wrong. Please try again."
  );
}

export default function AdminProfilePage() {
  const [profile, setProfile] = useState<Profile>(INITIAL_PROFILE);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [fieldErrors, setFieldErrors] = useState<ProfileErrors>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const token = sessionStorage.getItem("token");

      if (!token) {
        setError("Your session has expired. Please sign in again.");
        return;
      }

      const response = await api.get("/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = response.data;
      const user = data?.user ?? data?.profile ?? data;

      if (!user || !user.email) {
        throw new Error(
          "The server did not return valid profile details."
        );
      }

      setProfile({
        username: user.username ?? "",
        email: user.email ?? "",
        phone: user.phone ?? "",
        role: user.role ?? "admin",
      });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  const clearFieldError = (field: ProfileField) => {
    setFieldErrors((previous) => {
      const next = { ...previous };
      delete next[field];
      return next;
    });

    setError("");
    setSuccess("");
  };

  const fieldClass = (field: ProfileField) =>
    `${inputClass} ${
      fieldErrors[field]
        ? "border-red-400 focus:border-red-500 focus:ring-red-100"
        : "border-[#dfe3d3]"
    }`;

  const handleProfileChange = (
    field: keyof Profile,
    value: string
  ) => {
    setProfile((previous) => ({
      ...previous,
      [field]: value,
    }));

    clearFieldError(field as ProfileField);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (saving) return;

    setError("");
    setSuccess("");

    const errors = validateProfile(
      profile,
      currentPassword,
      newPassword,
      confirmPassword
    );

    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      setError("Please correct the highlighted fields.");
      return;
    }

    const token = sessionStorage.getItem("token");

    if (!token) {
      setError("Your session has expired. Please sign in again.");
      return;
    }

    setSaving(true);

    try {
      const payload: {
        username: string;
        email: string;
        phone: string;
        currentPassword?: string;
        newPassword?: string;
      } = {
        username: profile.username.trim(),
        email: profile.email.trim(),
        phone: profile.phone.trim(),
      };

      // Only send password fields when changing the password.
      if (currentPassword || newPassword || confirmPassword) {
        payload.currentPassword = currentPassword;
        payload.newPassword = newPassword;
      }

      const response = await api.put("/profile", payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = response.data;
      const updatedUser =
        data?.user ?? data?.profile ?? data;

      const updatedToken = data?.token;

      if (updatedToken) {
        sessionStorage.setItem("token", updatedToken);
      }

      const updatedProfile: Profile = {
        username: updatedUser?.username ?? payload.username,
        email: updatedUser?.email ?? payload.email,
        phone: updatedUser?.phone ?? payload.phone,
        role: updatedUser?.role ?? profile.role ?? "admin",
      };

      setProfile(updatedProfile);

      // Keep the admin header in sync with the saved profile.
      sessionStorage.setItem("username", updatedProfile.username);

      if (updatedProfile.role) {
        sessionStorage.setItem("role", updatedProfile.role);
      }

      const storedUser = sessionStorage.getItem("user");

      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);

          sessionStorage.setItem(
            "user",
            JSON.stringify({
              ...parsedUser,
              ...updatedProfile,
            })
          );
        } catch {
          // The stored user may not be JSON; the profile update still succeeded.
        }
      }

      window.dispatchEvent(new Event("authChanged"));

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setFieldErrors({});

      setSuccess(
        data?.message || "Your admin profile has been updated successfully."
      );
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const renderFieldError = (field: ProfileField) => {
    if (!fieldErrors[field]) return null;

    return (
      <p
        id={`${field}-error`}
        role="alert"
        className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-red-600"
      >
        <AlertCircle size={13} className="shrink-0" />
        {fieldErrors[field]}
      </p>
    );
  };

  const passwordInput = (
    field: "currentPassword" | "newPassword" | "confirmPassword",
    label: string,
    value: string,
    setValue: (value: string) => void,
    visible: boolean,
    setVisible: (value: boolean) => void,
    placeholder: string
  ) => (
    <div>
      <label htmlFor={field} className={labelClass}>
        {label}
      </label>

      <div className="relative">
        <input
          id={field}
          type={visible ? "text" : "password"}
          autoComplete={
            field === "currentPassword"
              ? "current-password"
              : "new-password"
          }
          value={value}
          onChange={(event) => {
            setValue(event.target.value);
            clearFieldError(field);
          }}
          placeholder={placeholder}
          className={`${fieldClass(field)} pr-12`}
          aria-invalid={Boolean(fieldErrors[field])}
          aria-describedby={
            fieldErrors[field] ? `${field}-error` : undefined
          }
          maxLength={128}
        />

        <button
          type="button"
          onClick={() => setVisible(!visible)}
          aria-label={visible ? "Hide password" : "Show password"}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-[#858a77] hover:text-[#2f381b]"
        >
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>

      {renderFieldError(field)}
    </div>
  );

  if (loading) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center bg-[#fafbf7] px-4">
        <div className="flex flex-col items-center gap-3 text-[#596345]">
          <LoaderCircle size={34} className="animate-spin" />
          <p className="text-sm font-medium">Loading admin profile...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#fafbf7] px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <div className="mx-auto max-w-5xl">
        {/* PAGE HEADING */}
        <div className="mb-8">
          <Link
            href="/admin"
            className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-[#747866] transition hover:text-[#2f381b]"
          >
            <ArrowLeft size={16} />
            Back to Dashboard
          </Link>

          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[2px] text-[#8a8e7c]">
                <ShieldCheck size={15} />
                Administrator Settings
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-[#2f381b] sm:text-4xl">
                My Profile
              </h1>

              <p className="mt-2 max-w-xl text-sm leading-6 text-[#777c6a] sm:text-base">
                Manage your administrator details and update your account
                password.
              </p>
            </div>

            <div className="flex w-fit items-center gap-2 rounded-full border border-[#dfe5d3] bg-[#edf0e5] px-4 py-2 text-sm font-semibold text-[#3f4a24]">
              <ShieldCheck size={17} />
              Admin Account
            </div>
          </div>
        </div>

        {/* STATUS MESSAGES */}
        {error && (
          <div
            role="alert"
            aria-live="assertive"
            className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3.5 text-sm text-red-700"
          >
            <AlertCircle size={19} className="mt-0.5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {success && (
          <div
            role="status"
            aria-live="polite"
            className="mb-6 flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3.5 text-sm text-green-800"
          >
            <CheckCircle2 size={19} className="mt-0.5 shrink-0" />
            <p>{success}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="grid gap-6 lg:grid-cols-[1fr_0.78fr]">
            {/* PERSONAL INFORMATION */}
            <section className="overflow-hidden rounded-2xl border border-[#e5e8dc] bg-white shadow-sm shadow-[#2f381b]/5">
              <div className="border-b border-[#edf0e7] px-5 py-5 sm:px-7">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#edf0e5] text-[#3f4a24]">
                    <UserRound size={21} />
                  </div>

                  <div>
                    <h2 className="font-bold text-[#2f381b]">
                      Personal Information
                    </h2>
                    <p className="mt-1 text-xs text-[#858a77]">
                      Update your basic account details.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-5 px-5 py-6 sm:px-7">
                {/* NAME */}
                <div>
                  <label htmlFor="username" className={labelClass}>
                    Full Name
                  </label>

                  <div className="relative">
                    <UserRound
                      size={18}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#929782]"
                    />

                    <input
                      id="username"
                      type="text"
                      autoComplete="name"
                      value={profile.username}
                      onChange={(event) =>
                        handleProfileChange("username", event.target.value)
                      }
                      placeholder="Enter your full name"
                      className={`${fieldClass("username")} pl-11`}
                      aria-invalid={Boolean(fieldErrors.username)}
                      aria-describedby={
                        fieldErrors.username ? "username-error" : undefined
                      }
                      maxLength={100}
                    />
                  </div>

                  {renderFieldError("username")}
                </div>

                {/* EMAIL */}
                <div>
                  <label htmlFor="email" className={labelClass}>
                    Email Address
                  </label>

                  <div className="relative">
                    <Mail
                      size={18}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#929782]"
                    />

                    <input
                      id="email"
                      type="email"
                      autoComplete="email"
                      value={profile.email}
                      onChange={(event) =>
                        handleProfileChange("email", event.target.value)
                      }
                      placeholder="admin@example.com"
                      className={`${fieldClass("email")} pl-11`}
                      aria-invalid={Boolean(fieldErrors.email)}
                      aria-describedby={
                        fieldErrors.email ? "email-error" : undefined
                      }
                      maxLength={254}
                    />
                  </div>

                  {renderFieldError("email")}
                </div>

                {/* PHONE */}
                <div>
                  <label htmlFor="phone" className={labelClass}>
                    Phone Number
                  </label>

                  <div className="relative">
                    <Phone
                      size={18}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#929782]"
                    />

                    <input
                      id="phone"
                      type="tel"
                      autoComplete="tel"
                      value={profile.phone}
                      onChange={(event) =>
                        handleProfileChange("phone", event.target.value)
                      }
                      placeholder="Enter your phone number"
                      className={`${fieldClass("phone")} pl-11`}
                      aria-invalid={Boolean(fieldErrors.phone)}
                      aria-describedby={
                        fieldErrors.phone ? "phone-error" : undefined
                      }
                      maxLength={20}
                    />
                  </div>

                  {renderFieldError("phone")}
                </div>

                <div className="rounded-xl border border-[#e7eadd] bg-[#fafbf7] p-4">
                  <div className="flex items-start gap-3">
                    <ShieldCheck
                      size={19}
                      className="mt-0.5 shrink-0 text-[#69774b]"
                    />
                    <div>
                      <p className="text-sm font-semibold text-[#3f4a24]">
                        Administrator access
                      </p>
                      <p className="mt-1 text-xs leading-5 text-[#777c6a]">
                        Your account role is managed by the server and cannot
                        be changed through this form.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* PASSWORD SECTION */}
            <section className="overflow-hidden rounded-2xl border border-[#e5e8dc] bg-white shadow-sm shadow-[#2f381b]/5">
              <div className="border-b border-[#edf0e7] px-5 py-5 sm:px-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#fbf0eb] text-[#9a432a]">
                    <LockKeyhole size={21} />
                  </div>

                  <div>
                    <h2 className="font-bold text-[#2f381b]">
                      Change Password
                    </h2>
                    <p className="mt-1 text-xs text-[#858a77]">
                      Optional security update.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-5 px-5 py-6 sm:px-6">
                <p className="text-sm leading-6 text-[#777c6a]">
                  Leave these fields empty if you only want to update your
                  personal information.
                </p>

                {passwordInput(
                  "currentPassword",
                  "Current Password",
                  currentPassword,
                  setCurrentPassword,
                  showCurrentPassword,
                  setShowCurrentPassword,
                  "Enter current password"
                )}

                {passwordInput(
                  "newPassword",
                  "New Password",
                  newPassword,
                  setNewPassword,
                  showNewPassword,
                  setShowNewPassword,
                  "At least 8 characters"
                )}

                {passwordInput(
                  "confirmPassword",
                  "Confirm New Password",
                  confirmPassword,
                  setConfirmPassword,
                  showConfirmPassword,
                  setShowConfirmPassword,
                  "Re-enter new password"
                )}

                <div className="rounded-xl bg-[#fafbf7] px-4 py-3">
                  <p className="text-xs leading-5 text-[#777c6a]">
                    Use at least 8 characters. Your current password is
                    required to change it.
                  </p>
                </div>
              </div>
            </section>
          </div>

          {/* SAVE BUTTONS */}
          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Link
              href="/admin"
              className="inline-flex min-h-12 items-center justify-center rounded-xl border border-[#dfe3d3] bg-white px-6 py-3 text-sm font-semibold text-[#525744] transition hover:bg-[#f5f6f1]"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#2f381b] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#414c27] focus:outline-none focus:ring-4 focus:ring-[#e6ebdc] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? (
                <>
                  <LoaderCircle size={18} className="animate-spin" />
                  Saving Changes...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>

        <p className="mt-8 text-center text-xs text-[#929782]">
          Dhavam Spices · Admin Account Settings
        </p>
      </div>
    </main>
  );
}