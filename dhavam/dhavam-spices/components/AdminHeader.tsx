"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  Menu,
  X,
  ChevronDown,
  LogOut,
  Settings,
  UserCircle,
} from "lucide-react";

const NAV_LINKS = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Products", href: "/admin/products", icon: Package },
  { label: "Orders", href: "/admin/orders", icon: ShoppingBag },
  { label: "Users", href: "/admin/users", icon: Users },
];

function AdminHeaderContent() {
  const pathname = usePathname();
  const router = useRouter();

  const [username, setUsername] = useState("Administrator");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    const readUser = () => {
      const storedUsername = sessionStorage.getItem("username");
      setUsername(storedUsername || "Administrator");
    };

    readUser();
    window.addEventListener("authChanged", readUser);

    return () => {
      window.removeEventListener("authChanged", readUser);
    };
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setProfileOpen(false);
  }, [pathname]);

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

 const handleLogout = () => {
  sessionStorage.removeItem("token");
  sessionStorage.removeItem("username");
  sessionStorage.removeItem("role");

  window.dispatchEvent(new Event("authChanged"));

  window.location.replace("/login");
};

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#e7e9df] bg-white/95 backdrop-blur-xl">
      <div className="mx-auto flex h-[76px] max-w-[1600px] items-center justify-between gap-5 px-4 sm:px-6 lg:px-8">
        {/* BRAND */}
        <Link
          href="/admin"
          aria-label="Dhavam Spices admin dashboard"
          className="flex shrink-0 items-center gap-3"
        >
          <div className="relative h-14 w-14 shrink-0">
            <Image
              src="/images/logo.png"
              alt="Dhavam Spices logo"
              fill
              sizes="60px"
              className="object-contain"
              priority
            />
          </div>

          <div className="hidden sm:block">
            <p className="text-[17px] font-bold leading-tight tracking-tight text-[#2f381b]">
              Dhavam Spices
            </p>
            <p className="mt-1 text-[10px] font-semibold uppercase tracking-[2px] text-[#8a8e7c]">
              Admin Console
            </p>
          </div>
        </Link>

        {/* DESKTOP NAVIGATION */}
        <nav
          className="hidden items-center gap-1 lg:flex"
          aria-label="Admin navigation"
        >
          {NAV_LINKS.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`relative flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-200 xl:px-4 ${
                  active
                    ? "bg-[#edf0e5] text-[#2f381b]"
                    : "text-[#747866] hover:bg-[#f5f6f1] hover:text-[#2f381b]"
                }`}
              >
                <Icon size={18} strokeWidth={1.8} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* DESKTOP PROFILE MENU */}
        <div className="relative hidden md:block">
          <button
            type="button"
            onClick={() => setProfileOpen((open) => !open)}
            aria-expanded={profileOpen}
            aria-label="Open administrator profile menu"
            className="flex items-center gap-2.5 rounded-xl p-1.5 pr-2 transition hover:bg-[#f5f6f1]"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#e7e9df] bg-[#f5f6f1] text-sm font-bold uppercase text-[#354020]">
              {username.charAt(0)}
            </div>

            <div className="hidden text-left xl:block">
              <p className="max-w-[150px] truncate text-sm font-semibold text-[#303522]">
                {username}
              </p>
              <p className="text-[11px] text-[#8a8e7c]">Administrator</p>
            </div>

            <ChevronDown
              size={15}
              className={`text-[#858a77] transition-transform ${
                profileOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {profileOpen && (
            <>
              <button
                type="button"
                aria-label="Close profile menu"
                className="fixed inset-0 z-40 cursor-default"
                onClick={() => setProfileOpen(false)}
              />

              <div className="absolute right-0 top-full z-50 mt-3 w-60 overflow-hidden rounded-2xl border border-[#e8eadd] bg-white p-2 shadow-xl shadow-[#2f381b]/10">
                <div className="border-b border-[#eef0e7] px-3 py-3">
                  <p className="truncate text-sm font-bold text-[#2f381b]">
                    {username}
                  </p>
                  <p className="mt-1 text-xs text-[#858a77]">
                    Admin account
                  </p>
                </div>

                <Link
                  href="/admin"
                  onClick={() => setProfileOpen(false)}
                  className="mt-2 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-[#525744] transition hover:bg-[#f4f5ef]"
                >
                  <UserCircle size={17} />
                  Dashboard
                </Link>

                <Link
                  href="/admin/profile"
                  onClick={() => setProfileOpen(false)}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
                    isActive("/admin/profile")
                      ? "bg-[#edf0e5] font-semibold text-[#2f381b]"
                      : "text-[#525744] hover:bg-[#f4f5ef]"
                  }`}
                >
                  <Settings size={17} />
                  My Profile
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-[#9a432a] transition hover:bg-[#fbf0eb]"
                >
                  <LogOut size={17} />
                  Sign out
                </button>
              </div>
            </>
          )}
        </div>

        {/* MOBILE MENU BUTTON */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen((open) => !open)}
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileMenuOpen}
          className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#e7e9df] text-[#2f381b] transition hover:bg-[#f3f5ed] md:hidden"
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* MOBILE NAVIGATION */}
      {mobileMenuOpen && (
        <div className="border-t border-[#e8eadd] bg-white px-4 pb-5 pt-4 md:hidden">
          <nav
            className="flex flex-col gap-1"
            aria-label="Mobile admin navigation"
          >
            {NAV_LINKS.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                    active
                      ? "bg-[#edf0e5] text-[#2f381b]"
                      : "text-[#747866] hover:bg-[#f5f6f1]"
                  }`}
                >
                  <Icon size={19} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* MOBILE PROFILE */}
          <div className="mt-4 flex items-center gap-3 border-t border-[#e8eadd] pt-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#e7e9df] bg-[#f5f6f1] font-bold uppercase text-[#354020]">
              {username.charAt(0)}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-[#2f381b]">
                {username}
              </p>
              <p className="mt-0.5 text-xs text-[#858a77]">
                Administrator
              </p>
            </div>

            <Link
              href="/admin/profile"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold text-[#2f381b] hover:bg-[#f3f5ed]"
            >
              <Settings size={16} />
              Profile
            </Link>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="mt-3 flex w-full items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-[#9a432a] transition hover:bg-[#fbf0eb]"
          >
            <LogOut size={17} />
            Sign out
          </button>
        </div>
      )}

      {/* BRAND ACCENT */}
      <div className="h-[2px] w-full bg-gradient-to-r from-[#2f381b] via-[#87916a] to-[#9a432a]" />
    </header>
  );
}

export default function AdminHeader() {
  return (
    <Suspense
      fallback={
        <header
          className="h-[78px] w-full border-b border-[#e7e9df] bg-white"
          aria-label="Loading admin header"
        >
          <div className="mx-auto h-full max-w-[1600px] px-4 sm:px-6 lg:px-8" />
        </header>
      }
    >
      <AdminHeaderContent />
    </Suspense>
  );
}