"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Users,
  Mail,
  Phone,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Trash2,
  UserRound,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";

interface User {
  id?: number | string;
  _id?: string;
  username: string;
  email: string;
  phone?: string;
  role: string;
}

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
).trim().replace(/\/+$/, "");
const USERS_PER_PAGE = 10;

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const token = sessionStorage.getItem("token");
      const role = sessionStorage.getItem("role");

      if (!token) {
        throw new Error("Please log in to access customer management.");
      }

      if (role !== "admin") {
        throw new Error("Access denied. Administrators only.");
      }

      if (!API_URL) {
        throw new Error("Backend API URL is not configured.");
      }

      const response = await fetch(`${API_URL}/admin/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to fetch customers.");
      }

      if (!Array.isArray(data.users)) {
        throw new Error("Unexpected response from the server.");
      }

      const customers: User[] = data.users
        .filter((user: User) => user.role === "user")
        .map((user: User) => ({
          ...user,
          _id: String(user.id ?? user._id ?? ""),
        }))
        .filter((user: User) => user._id !== "");

      setUsers(customers);
      setCurrentPage(1);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchUsers();
  }, [fetchUsers]);

  const handleDeleteUser = async (user: User) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${user.username}?\n\nThis action cannot be undone.`
    );

    if (!confirmed) return;

    setDeletingId(user._id ?? null);
    setError("");
    setSuccess("");

    try {
      const token = sessionStorage.getItem("token");

      if (!token) {
        throw new Error("Please log in as an administrator.");
      }

      if (sessionStorage.getItem("role") !== "admin") {
        throw new Error("Access denied. Administrators only.");
      }

      if (!API_URL) {
        throw new Error("Backend API URL is not configured.");
      }

      const response = await fetch(
        `${API_URL}/admin/users/${user._id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to delete customer.");
      }

      const updatedUsers = users.filter(
        (item) => item._id !== user._id
      );

      setUsers(updatedUsers);
      setSuccess(`${user.username} was deleted successfully.`);

      const remainingPages = Math.max(
        1,
        Math.ceil(updatedUsers.length / USERS_PER_PAGE)
      );

      setCurrentPage((page) => Math.min(page, remainingPages));
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to delete customer."
      );
    } finally {
      setDeletingId(null);
    }
  };

  const totalPages = Math.ceil(users.length / USERS_PER_PAGE);
  const startIndex = (currentPage - 1) * USERS_PER_PAGE;

  const paginatedUsers = users.slice(
    startIndex,
    startIndex + USERS_PER_PAGE
  );

  const firstUser = users.length === 0 ? 0 : startIndex + 1;
  const lastUser = Math.min(
    startIndex + USERS_PER_PAGE,
    users.length
  );

  const pageNumbers = () => {
    const pages: number[] = [];
    const start = Math.max(1, currentPage - 2);
    const end = Math.min(totalPages, currentPage + 2);

    for (let page = start; page <= end; page++) {
      pages.push(page);
    }

    return pages;
  };

  return (
    <main className="min-h-screen w-full overflow-x-clip bg-[#f7f8f3] px-3 py-5 sm:px-5 sm:py-7 md:px-7 lg:px-10 lg:py-10">
      <div className="mx-auto w-full max-w-[1600px]">

        {/* HEADER */}
        <header className="mb-6 flex flex-col gap-5 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[2px] text-[#8a9276] sm:text-xs sm:tracking-[3px]">
              Dhavam Spices / Admin
            </p>

            <h1 className="text-3xl font-bold tracking-tight text-[#2f381b] sm:text-4xl md:text-5xl">
              Customers
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-gray-500 sm:text-base">
              View and manage your registered customer accounts.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void fetchUsers()}
            disabled={loading || deletingId !== null}
            className="inline-flex min-h-11 w-full shrink-0 items-center justify-center gap-2 self-start rounded-xl bg-[#2f381b] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#46532b] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:self-center"
          >
            <RefreshCw
              size={16}
              className={loading ? "animate-spin" : ""}
            />
            Refresh customers
          </button>
        </header>

        {/* SUCCESS MESSAGE */}
        {success && (
          <div
            role="status"
            className="mb-5 flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-800 sm:p-4"
          >
            <CheckCircle2 size={19} className="mt-0.5 shrink-0" />

            <p className="min-w-0 flex-1 break-words">{success}</p>

            <button
              type="button"
              onClick={() => setSuccess("")}
              aria-label="Dismiss success message"
              className="shrink-0 font-bold"
            >
              ×
            </button>
          </div>
        )}

        {/* ERROR MESSAGE */}
        {error && (
          <div
            role="alert"
            className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 sm:p-4"
          >
            <AlertCircle size={19} className="mt-0.5 shrink-0" />

            <p className="min-w-0 flex-1 break-words">{error}</p>

            <button
              type="button"
              onClick={() => setError("")}
              aria-label="Dismiss error"
              className="shrink-0 font-bold"
            >
              ×
            </button>
          </div>
        )}

        {/* SUMMARY CARDS */}
        <section
          aria-label="Customer statistics"
          className="mb-6 grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 sm:mb-8 sm:gap-5"
        >
          <SummaryCard
            title="Total customers"
            value={loading ? "—" : users.length}
            description="Registered user accounts"
            icon={<Users size={21} />}
            iconClass="bg-[#edf1e5] text-[#3f4a24]"
          />

          <SummaryCard
            title="Current page"
            value={
              loading || users.length === 0
                ? "—"
                : `${currentPage} / ${totalPages}`
            }
            description="Customer list pagination"
            icon={<UserRound size={21} />}
            iconClass="bg-[#f8eee7] text-[#9a432a]"
          />
        </section>

        {/* CUSTOMERS PANEL */}
        <section className="min-w-0 overflow-hidden rounded-2xl border border-[#e7e9df] bg-white shadow-sm">

          {/* PANEL HEADER */}
          <div className="flex flex-col gap-3 border-b border-[#edf0e7] px-4 py-5 min-[420px]:flex-row min-[420px]:items-center min-[420px]:justify-between sm:px-6 md:px-7">
            <div className="min-w-0">
              <h2 className="text-lg font-bold text-[#2f381b] sm:text-xl">
                Registered customers
              </h2>

              <p className="mt-1 text-xs leading-5 text-gray-500 sm:text-sm">
                Manage customer information and accounts.
              </p>
            </div>

            {!loading && (
              <span className="inline-flex w-fit shrink-0 items-center rounded-full bg-[#edf1e5] px-3 py-1.5 text-xs font-semibold text-[#3f4a24]">
                {users.length}{" "}
                {users.length === 1 ? "customer" : "customers"}
              </span>
            )}
          </div>

          {/* LOADING */}
          {loading ? (
            <div className="flex min-h-64 items-center justify-center px-4 py-12">
              <div className="text-center">
                <RefreshCw
                  className="mx-auto mb-3 animate-spin text-[#3f4a24]"
                  size={30}
                />

                <p className="text-sm text-gray-500">
                  Loading customers...
                </p>
              </div>
            </div>
          ) : error && users.length === 0 ? (
            /* ERROR STATE */
            <div className="px-4 py-14 text-center sm:px-6 sm:py-16">
              <AlertCircle
                size={36}
                className="mx-auto mb-3 text-red-400"
              />

              <p className="break-words font-semibold text-red-600">
                Unable to load customers
              </p>

              <p className="mt-2 break-words text-sm text-gray-500">
                {error}
              </p>

              <button
                type="button"
                onClick={() => void fetchUsers()}
                className="mt-5 inline-flex min-h-10 items-center justify-center rounded-lg bg-[#2f381b] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#46532b]"
              >
                Try again
              </button>
            </div>
          ) : users.length === 0 ? (
            /* EMPTY STATE */
            <div className="px-4 py-14 text-center sm:px-6 sm:py-16">
              <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-[#edf1e5] text-[#3f4a24]">
                <Users size={27} />
              </div>

              <h3 className="font-semibold text-[#2f381b]">
                No customers found
              </h3>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                Registered customer accounts will appear here.
              </p>
            </div>
          ) : (
            <>
              {/* MOBILE CUSTOMER CARDS */}
              <div className="divide-y divide-[#edf0e7] md:hidden">
                {paginatedUsers.map((user) => (
                  <article
                    key={user._id}
                    className="p-4 transition-colors hover:bg-[#fafbf7] sm:p-5"
                  >
                    <div className="flex min-w-0 items-start gap-3">
                      <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[#e6ebdc] text-base font-bold uppercase text-[#2f381b]">
                        {user.username?.charAt(0) || "U"}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="break-words font-semibold text-[#2f381b]">
                            {user.username}
                          </h3>

                          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[#edf1e5] px-2 py-1 text-[10px] font-semibold text-[#3f4a24]">
                            <ShieldCheck size={12} />
                            Customer
                          </span>
                        </div>

                        <p className="mt-1 break-all text-[11px] text-gray-400">
                          ID: {user._id?.slice(-6) || "N/A"}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 space-y-3 pl-1">
                      <div className="flex min-w-0 items-start gap-2.5 text-sm text-gray-600">
                        <Mail
                          size={16}
                          className="mt-0.5 shrink-0 text-gray-400"
                        />

                        <span className="min-w-0 break-all">
                          {user.email}
                        </span>
                      </div>

                      <div className="flex min-w-0 items-start gap-2.5 text-sm text-gray-600">
                        <Phone
                          size={16}
                          className="mt-0.5 shrink-0 text-gray-400"
                        />

                        <span className="min-w-0 break-words">
                          {user.phone || "No phone number"}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 flex justify-end border-t border-[#edf0e7] pt-3">
                      <button
                        type="button"
                        onClick={() => void handleDeleteUser(user)}
                        disabled={deletingId !== null}
                        aria-label={`Delete ${user.username}`}
                        className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {deletingId === user._id ? (
                          <RefreshCw
                            size={15}
                            className="animate-spin"
                          />
                        ) : (
                          <Trash2 size={15} />
                        )}

                        {deletingId === user._id
                          ? "Deleting..."
                          : "Delete customer"}
                      </button>
                    </div>
                  </article>
                ))}
              </div>

              {/* TABLET AND DESKTOP TABLE */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[760px] text-left">
                  <thead className="bg-[#f7f8f3]">
                    <tr className="text-xs uppercase tracking-wider text-gray-500">
                      <th className="px-4 py-4 font-semibold lg:px-6">
                        Customer
                      </th>

                      <th className="px-4 py-4 font-semibold lg:px-6">
                        Email
                      </th>

                      <th className="px-4 py-4 font-semibold lg:px-6">
                        Phone
                      </th>

                      <th className="px-4 py-4 font-semibold lg:px-6">
                        Role
                      </th>

                      <th className="px-4 py-4 text-right font-semibold lg:px-6">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-[#edf0e7]">
                    {paginatedUsers.map((user) => (
                      <tr
                        key={user._id}
                        className="transition-colors hover:bg-[#fafbf7]"
                      >
                        <td className="px-4 py-5 lg:px-6">
                          <div className="flex items-center gap-3">
                            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#e6ebdc] font-bold uppercase text-[#2f381b]">
                              {user.username?.charAt(0) || "U"}
                            </div>

                            <div className="min-w-0">
                              <p className="break-words font-semibold text-[#2f381b]">
                                {user.username}
                              </p>

                              <p className="mt-1 text-xs text-gray-400">
                                ID: {user._id?.slice(-6) || "N/A"}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="max-w-[260px] px-4 py-5 text-sm text-gray-600 lg:px-6">
                          <span className="flex items-start gap-2">
                            <Mail
                              size={15}
                              className="mt-0.5 shrink-0 text-gray-400"
                            />

                            <span className="break-all">
                              {user.email}
                            </span>
                          </span>
                        </td>

                        <td className="px-4 py-5 text-sm text-gray-600 lg:px-6">
                          <span className="flex items-center gap-2">
                            <Phone
                              size={15}
                              className="shrink-0 text-gray-400"
                            />

                            <span className="break-words">
                              {user.phone || "—"}
                            </span>
                          </span>
                        </td>

                        <td className="px-4 py-5 lg:px-6">
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#edf1e5] px-3 py-1.5 text-xs font-semibold text-[#3f4a24]">
                            <ShieldCheck size={13} />
                            Customer
                          </span>
                        </td>

                        <td className="px-4 py-5 text-right lg:px-6">
                          <button
                            type="button"
                            onClick={() => void handleDeleteUser(user)}
                            disabled={deletingId !== null}
                            aria-label={`Delete ${user.username}`}
                            className="inline-flex min-h-9 items-center justify-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {deletingId === user._id ? (
                              <RefreshCw
                                size={15}
                                className="animate-spin"
                              />
                            ) : (
                              <Trash2 size={15} />
                            )}

                            {deletingId === user._id
                              ? "Deleting..."
                              : "Delete"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* PAGINATION */}
              <div className="flex flex-col gap-4 border-t border-[#edf0e7] px-4 py-4 sm:px-5 md:flex-row md:items-center md:justify-between md:px-6">
                <p className="text-center text-xs leading-5 text-gray-500 md:text-left sm:text-sm">
                  Showing{" "}
                  <span className="font-semibold text-[#2f381b]">
                    {firstUser}–{lastUser}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold text-[#2f381b]">
                    {users.length}
                  </span>{" "}
                  customers
                </p>

                <nav
                  aria-label="Customer pagination"
                  className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 md:justify-end"
                >
                  <button
                    type="button"
                    onClick={() =>
                      setCurrentPage((page) => Math.max(1, page - 1))
                    }
                    disabled={currentPage === 1 || deletingId !== null}
                    aria-label="Previous page"
                    className="inline-flex min-h-9 items-center justify-center gap-1 rounded-lg border border-[#e1e5d8] px-2.5 py-2 text-xs font-medium text-[#2f381b] transition hover:bg-[#edf1e5] disabled:cursor-not-allowed disabled:opacity-40 sm:px-3 sm:text-sm"
                  >
                    <ChevronLeft size={16} />
                    <span className="hidden min-[380px]:inline">
                      Previous
                    </span>
                  </button>

                  {pageNumbers().map((page) => (
                    <button
                      type="button"
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      disabled={deletingId !== null}
                      aria-current={
                        currentPage === page ? "page" : undefined
                      }
                      aria-label={`Page ${page}`}
                      className={`min-h-9 min-w-9 rounded-lg px-2.5 text-sm font-semibold transition ${currentPage === page
                        ? "bg-[#2f381b] text-white"
                        : "border border-[#e1e5d8] text-[#2f381b] hover:bg-[#edf1e5]"
                        }`}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    type="button"
                    onClick={() =>
                      setCurrentPage((page) =>
                        Math.min(totalPages, page + 1)
                      )
                    }
                    disabled={
                      currentPage === totalPages ||
                      deletingId !== null
                    }
                    aria-label="Next page"
                    className="inline-flex min-h-9 items-center justify-center gap-1 rounded-lg border border-[#e1e5d8] px-2.5 py-2 text-xs font-medium text-[#2f381b] transition hover:bg-[#edf1e5] disabled:cursor-not-allowed disabled:opacity-40 sm:px-3 sm:text-sm"
                  >
                    <span className="hidden min-[380px]:inline">
                      Next
                    </span>
                    <ChevronRight size={16} />
                  </button>
                </nav>
              </div>
            </>
          )}
        </section>

        {/* FOOTER NOTE */}
        <p className="mt-5 text-center text-xs leading-5 text-gray-400 sm:text-sm">
          Dhavam Spices · Customer management
        </p>
      </div>
    </main>
  );
}

function SummaryCard({
  title,
  value,
  description,
  icon,
  iconClass,
}: {
  title: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
  iconClass: string;
}) {
  return (
    <div className="min-w-0 rounded-2xl border border-[#e7e9df] bg-white p-4 shadow-sm transition-shadow hover:shadow-md sm:p-5">
      <div className="flex min-w-0 items-center gap-3 sm:gap-4">
        <div
          className={`flex size-11 shrink-0 items-center justify-center rounded-xl sm:size-12 ${iconClass}`}
        >
          {icon}
        </div>

        <div className="min-w-0">
          <p className="break-words text-xs text-gray-500 sm:text-sm">
            {title}
          </p>

          <p className="mt-1 text-2xl font-bold tracking-tight text-[#2f381b] sm:text-3xl">
            {value}
          </p>

          <p className="mt-1 hidden text-xs text-gray-400 sm:block">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}