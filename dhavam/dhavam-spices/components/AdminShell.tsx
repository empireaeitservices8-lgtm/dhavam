
"use client";

import { Suspense, useEffect, useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  PlusCircle,
  ShoppingBag,
  Users,
  Menu,
  X,
  LogOut,
  ChevronRight,
  Store,
} from "lucide-react";

const NAV = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    label: "Products",
    href: "/admin/products",
    icon: Package,
  },
  {
    label: "Add Product",
    href: "/admin/products/new",
    icon: PlusCircle,
  },
  {
    label: "Orders",
    href: "/admin/orders",
    icon: ShoppingBag,
  },
  {
    label: "Users",
    href: "/admin/users",
    icon: Users,
  },
];

function AdminShellContent({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [username, setUsername] = useState("");

  useEffect(() => {
    setUsername(sessionStorage.getItem("username") || "");
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const current =
    NAV.filter(
      (item) =>
        pathname === item.href ||
        (item.href !== "/admin" &&
          pathname.startsWith(`${item.href}/`))
    ).sort((a, b) => b.href.length - a.href.length)[0];

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("username");
    sessionStorage.removeItem("role");

    window.dispatchEvent(new Event("authChanged"));
    router.push("/");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-[#f8f9f4] text-[#2f381b]">
      {/* Mobile top bar */}
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-[#e3e8dc] bg-[#fffdf6] px-4 lg:hidden">
        <Link
          href="/admin"
          className="flex items-center gap-2 font-bold text-[#3f4a24]"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#3f4a24] text-white">
            <Store size={19} />
          </span>
          <span>Dhavam Admin</span>
        </Link>

        <button
          type="button"
          onClick={() => setMobileOpen((previous) => !previous)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#e3e8dc] transition hover:bg-[#edf0e4]"
        >
          {mobileOpen ? <X size={21} /> : <Menu size={21} />}
        </button>
      </header>

      <div className="mx-auto flex min-h-screen max-w-[1800px]">
        {/* Mobile backdrop */}
        {mobileOpen && (
          <button
            type="button"
            aria-label="Close navigation"
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          />
        )}

        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 flex w-[270px] flex-col border-r border-[#e3e8dc] bg-[#fffdf6] transition-transform duration-300 lg:sticky lg:top-0 lg:z-30 lg:h-screen lg:translate-x-0 ${
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {/* Brand */}
          <div className="flex h-[76px] shrink-0 items-center justify-between border-b border-[#e8eadf] px-5">
            <Link href="/admin" className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#3f4a24] text-white shadow-sm">
                <Store size={22} />
              </span>

              <span>
                <span className="block text-base font-bold tracking-tight text-[#2f381b]">
                  Dhavam Spices
                </span>
                <span className="mt-0.5 block text-[11px] font-medium uppercase tracking-[0.16em] text-[#7a8470]">
                  Administration
                </span>
              </span>
            </Link>

            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              aria-label="Close sidebar"
              className="rounded-lg p-2 text-[#566049] hover:bg-[#edf0e4] lg:hidden"
            >
              <X size={19} />
            </button>
          </div>

          {/* Navigation */}
          <nav
            aria-label="Admin navigation"
            className="flex-1 space-y-1 overflow-y-auto px-3 py-6"
          >
            <p className="mb-3 px-3 text-[11px] font-bold uppercase tracking-[0.16em] text-[#8a927e]">
              Workspace
            </p>

            {NAV.map((item) => {
              const Icon = item.icon;
              const active = current?.href === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  onClick={() => setMobileOpen(false)}
                  className={`group flex items-center justify-between rounded-xl px-3 py-3 text-sm font-semibold transition-all duration-200 ${
                    active
                      ? "bg-[#3f4a24] text-white shadow-sm"
                      : "text-[#566049] hover:bg-[#edf0e4] hover:text-[#2f381b]"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <Icon
                      size={19}
                      className={
                        active
                          ? "text-white"
                          : "text-[#7a8470] group-hover:text-[#3f4a24]"
                      }
                    />
                    {item.label}
                  </span>

                  {active && <ChevronRight size={16} />}
                </Link>
              );
            })}
          </nav>

          {/* Bottom section */}
          <div className="shrink-0 border-t border-[#e8eadf] p-4">
            <Link
              href="/"
              className="mb-3 flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-[#566049] transition hover:bg-[#edf0e4] hover:text-[#2f381b]"
            >
              <Store size={18} />
              View website
            </Link>

            <div className="flex items-center gap-3 rounded-xl bg-[#f1f3e9] p-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#dce3ce] text-[#3f4a24]">
                <Users size={19} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-[#2f381b]">
                  {username || "Administrator"}
                </p>
                <p className="text-xs text-[#7a8470]">Admin account</p>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                title="Logout"
                aria-label="Logout"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[#566049] transition hover:bg-white hover:text-red-600"
              >
                <LogOut size={17} />
              </button>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="min-w-0 flex-1">
          <div className="hidden h-[76px] items-center justify-between border-b border-[#e3e8dc] bg-[#fffdf6] px-8 lg:flex">
            <div>
              <p className="text-xs font-medium text-[#7a8470]">
                Dhavam Spices / Admin
              </p>
              <p className="mt-1 text-sm font-semibold text-[#3f4a24]">
                {current?.label || "Administration"}
              </p>
            </div>

            <Link
              href="/"
              className="rounded-full border border-[#dfe3d0] px-4 py-2 text-sm font-semibold text-[#3f4a24] transition hover:bg-[#edf0e4]"
            >
              View website
            </Link>
          </div>

          <div className="p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export default function AdminShell({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#f8f9f4]" />
      }
    >
      <AdminShellContent>{children}</AdminShellContent>
    </Suspense>
  );
}
