
"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import {
  Menu,
  X,
  UserRound,
  LogOut,
  ChevronRight,
  ShoppingCart,
  Package,
  ShieldCheck,
} from "lucide-react";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Our Products", href: "/products" },
  { label: "About Us", href: "/about" },
  { label: "Contact", href: "/contact" },
];

function Logo({ onClick }: { onClick?: () => void }) {
  return (
    <Link
      href="/"
      onClick={onClick}
      aria-label="Dhavam Spices home"
      className="flex shrink-0 items-center"
    >
      <Image
        src="/images/logo.png"
        alt="Dhavam Spices"
        width={220}
        height={60}
        priority
        className="h-auto w-[160px] object-contain sm:w-[175px] md:w-[190px]"
      />
    </Link>
  );
}

function HeaderContent() {
  const pathname = usePathname();
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [username, setUsername] = useState("");
  const [role, setRole] = useState("");

  // Update the username and role after login, logout, or profile changes.
  useEffect(() => {
    const updateUser = () => {
      setUsername(sessionStorage.getItem("username") || "");
      setRole(sessionStorage.getItem("role") || "");
    };

    updateUser();
    window.addEventListener("authChanged", updateUser);

    return () => {
      window.removeEventListener("authChanged", updateUser);
    };
  }, [pathname]);

  // Header shadow on scroll.
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Close the mobile menu after navigation.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

 const handleLogout = () => {
  sessionStorage.removeItem("token");
  sessionStorage.removeItem("username");
  sessionStorage.removeItem("role");

  window.dispatchEvent(new Event("authChanged"));

  window.location.replace("/login");
};

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const accountLinkClass = (href: string) =>
    `inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold transition ${
      isActive(href)
        ? "bg-[#edf0e4] text-[#3f4a24]"
        : "text-[#3f4a24] hover:bg-[#edf0e4]"
    }`;

  const mobileAccountLinkClass = (href: string) =>
    `flex items-center justify-between rounded-xl border px-4 py-3 text-sm font-semibold transition ${
      isActive(href)
        ? "border-[#cdd5bd] bg-[#edf0e4] text-[#3f4a24]"
        : "border-[#e2e5d9] text-[#3f4a24] hover:bg-[#edf0e4]"
    }`;

  return (
    <header
      className={`sticky top-0 z-50 w-full border-b border-[#e5e8dc] transition-all duration-300 ${
        scrolled
          ? "bg-[#fffdf6]/95 shadow-[0_5px_24px_rgba(35,48,24,0.08)] backdrop-blur-xl"
          : "bg-[#fffdf6]"
      }`}
    >
      <div className="mx-auto flex h-[64px] w-full max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 md:h-[70px] lg:px-8">
        <Logo onClick={() => setOpen(false)} />

        {/* Desktop navigation */}
        <nav
          aria-label="Main navigation"
          className="hidden items-center gap-1 lg:flex"
        >
          {NAV_LINKS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(item.href) ? "page" : undefined}
              className={`relative rounded-full px-4 py-2 text-[13px] font-semibold transition-colors duration-200 ${
                isActive(item.href)
                  ? "bg-[#edf0e4] text-[#3f4a24]"
                  : "text-[#5d6252] hover:bg-[#f0f1e9] hover:text-[#3f4a24]"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Desktop account actions */}
        <div className="hidden shrink-0 items-center gap-1 lg:flex">
          {username ? (
            <>
              {role === "admin" && (
                <Link
                  href="/admin"
                  className="inline-flex items-center gap-1.5 rounded-full bg-[#3f4a24] px-3.5 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-[#2f381b]"
                >
                  <ShieldCheck size={14} />
                  Admin Panel
                </Link>
              )}

              <Link href="/cart" className={accountLinkClass("/cart")}>
                <ShoppingCart size={17} />
                My Cart
              </Link>

              <Link
                href="/myOrders"
                className={accountLinkClass("/myOrders")}
              >
                <Package size={17} />
                My Orders
              </Link>

              {/* New profile link */}
              <Link
                href="/profile"
                className={accountLinkClass("/profile")}
              >
                <UserRound size={17} />
                My Profile
              </Link>

              <span className="flex max-w-[120px] items-center gap-2 truncate px-2 text-sm font-medium text-[#3f4a24]">
                <UserRound size={17} className="shrink-0" />
                <span className="truncate">Hi, {username}</span>
              </span>

              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-2 rounded-full border border-[#dce1d1] px-3 py-2 text-sm font-semibold text-[#3f4a24] transition hover:border-[#3f4a24] hover:bg-[#edf0e4]"
              >
                <LogOut size={15} />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-full px-4 py-2 text-sm font-semibold text-[#3f4a24] transition hover:bg-[#edf0e4]"
              >
                Login
              </Link>

              <Link
                href="/register"
                className="inline-flex items-center gap-2 rounded-full bg-[#3f4a24] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#303a1b] hover:shadow-md"
              >
                Get Started
                <ChevronRight size={16} />
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          onClick={() => setOpen((previous) => !previous)}
          aria-label={open ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={open}
          aria-controls="mobile-navigation"
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#e2e5d9] text-[#3f4a24] transition hover:bg-[#edf0e4] lg:hidden"
        >
          {open ? <X size={21} /> : <Menu size={21} />}
        </button>
      </div>

      {/* Mobile navigation */}
      <div
        id="mobile-navigation"
        className={`overflow-hidden border-t border-[#e8eadf] bg-[#fffdf6] transition-all duration-300 ease-in-out lg:hidden ${
          open
            ? "max-h-[850px] translate-y-0 opacity-100"
            : "pointer-events-none max-h-0 -translate-y-1 opacity-0"
        }`}
        aria-hidden={!open}
        inert={!open}
      >
        <nav
          aria-label="Mobile navigation"
          className="mx-auto max-w-7xl px-4 py-3 sm:px-6"
        >
          <div className="flex flex-col gap-1">
            {NAV_LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                tabIndex={open ? 0 : -1}
                aria-current={isActive(item.href) ? "page" : undefined}
                className={`flex items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold transition ${
                  isActive(item.href)
                    ? "bg-[#edf0e4] text-[#3f4a24]"
                    : "text-[#555d49] hover:bg-[#f0f1e9]"
                }`}
              >
                {item.label}
                <ChevronRight size={16} className="opacity-60" />
              </Link>
            ))}
          </div>

          <div className="mt-3 border-t border-[#e8eadf] pt-3">
            {username ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 rounded-xl bg-[#f3f4ec] p-3 text-sm font-semibold text-[#3f4a24]">
                  <UserRound size={18} className="shrink-0" />
                  <span className="truncate">Welcome, {username}</span>
                </div>

                <Link
                  href="/cart"
                  tabIndex={open ? 0 : -1}
                  className={mobileAccountLinkClass("/cart")}
                >
                  <span className="flex items-center gap-3">
                    <ShoppingCart size={18} />
                    My Cart
                  </span>
                  <ChevronRight size={16} />
                </Link>

                <Link
                  href="/myOrders"
                  tabIndex={open ? 0 : -1}
                  className={mobileAccountLinkClass("/myOrders")}
                >
                  <span className="flex items-center gap-3">
                    <Package size={18} />
                    My Orders
                  </span>
                  <ChevronRight size={16} />
                </Link>

                {/* New mobile profile link */}
                <Link
                  href="/profile"
                  tabIndex={open ? 0 : -1}
                  className={mobileAccountLinkClass("/profile")}
                >
                  <span className="flex items-center gap-3">
                    <UserRound size={18} />
                    My Profile
                  </span>
                  <ChevronRight size={16} />
                </Link>

                {role === "admin" && (
                  <Link
                    href="/admin"
                    tabIndex={open ? 0 : -1}
                    className="flex items-center justify-between rounded-xl bg-[#2e371b] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#232a14]"
                  >
                    <span className="flex items-center gap-3">
                      <ShieldCheck size={18} className="text-[#a4bc61]" />
                      Admin Panel
                    </span>
                    <ChevronRight size={16} />
                  </Link>
                )}

                <button
                  type="button"
                  onClick={handleLogout}
                  tabIndex={open ? 0 : -1}
                  className="flex w-full items-center justify-center gap-2 rounded-full border border-[#dce1d1] px-4 py-3 text-sm font-semibold text-[#3f4a24] transition hover:bg-[#edf0e4]"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <Link
                  href="/login"
                  tabIndex={open ? 0 : -1}
                  className="flex items-center justify-center rounded-full border border-[#dce1d1] px-4 py-3 text-sm font-semibold text-[#3f4a24] transition hover:bg-[#edf0e4]"
                >
                  Login
                </Link>

                <Link
                  href="/register"
                  tabIndex={open ? 0 : -1}
                  className="flex items-center justify-center gap-1 rounded-full bg-[#3f4a24] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#303a1b]"
                >
                  Register
                  <ChevronRight size={16} />
                </Link>
              </div>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}

export default function Header() {
  return (
    <Suspense
      fallback={
        <header className="h-[64px] w-full border-b border-[#e5e8dc] bg-[#fffdf6] md:h-[70px]" />
      }
    >
      <HeaderContent />
    </Suspense>
  );
}
