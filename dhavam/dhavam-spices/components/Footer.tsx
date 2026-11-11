
import Link from "next/link";

const PHONES = [
  { display: "+91 63830 73503", tel: "+916383073503" },
  { display: "+91 81481 23417", tel: "+918148123417" },
];

const FACEBOOK_URL =
  "https://www.facebook.com/profile.php?id=61595939693155";

const INSTAGRAM_URL =
  "https://www.instagram.com/dhavam_spices?psln=MTI2emRjOG1qMzBlNw%3D%3D";

const SHOP_LINKS = [
  { label: "Cardamom", href: "/products" },
  { label: "Pepper", href: "/products" },
  { label: "Cloves", href: "/products" },
  { label: "Cinnamon", href: "/products" },
  { label: "Star anise", href: "/products" },
  { label: "Black coffee powder", href: "/products" },
  { label: "Spice powders", href: "/products" },
];

const COMPANY_LINKS = [
  { label: "Our story", href: "/about" },
  { label: "Contact us", href: "/contact" },
  { label: "Our Products", href: "/products" },
  { label: "Admin Portal", href: "/admin" },
];

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e3a27f] focus-visible:ring-offset-2 focus-visible:ring-offset-[#2f381b] rounded-sm";

const linkClass = `text-[#c9d1b2] transition-colors hover:text-white ${focusRing}`;

function ColumnHeading({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <h3 className="mb-4 font-[family-name:var(--font-bricolage)] text-lg font-semibold text-white">
      {children}
    </h3>
  );
}

export default function Footer() {
  return (
    <footer className="bg-[#2f381b] font-[family-name:var(--font-dm-sans)] text-[#c9d1b2]">
      <div className="mx-auto max-w-[1200px] px-4 pb-8 pt-14 md:px-6">

        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.3fr]">

          {/* Brand */}
          <div>
            <Link
              href="/"
              aria-label="Dhavam Spices, home"
              className={`inline-flex items-center gap-3 ${focusRing}`}
            >
              <span className="flex flex-col leading-none text-[#e9edd9]">
                <span className="font-[family-name:var(--font-bricolage)] text-2xl font-bold tracking-tight">
                  Dhavam
                </span>
                <span className="mt-1 text-sm font-medium tracking-wide text-[#b3bd98]">
                  Spices
                </span>
              </span>
            </Link>

            <p className="mt-5 max-w-xs leading-relaxed">
              Premium, pure and unadulterated spices and masalas, brought
              directly from the farm to your kitchen.
            </p>
          </div>

          {/* Shop */}
          <nav aria-label="Shop">
            <ColumnHeading>Shop</ColumnHeading>

            <ul className="space-y-2.5">
              {SHOP_LINKS.map((link, index) => (
                <li key={`${link.label}-${index}`}>
                  <Link href={link.href} className={linkClass}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Company */}
          <nav aria-label="Company">
            <ColumnHeading>Dhavam Spices</ColumnHeading>

            <ul className="space-y-2.5">
              {COMPANY_LINKS.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className={linkClass}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Contact */}
          <div>
            <ColumnHeading>Contact</ColumnHeading>

            <address className="space-y-3 not-italic">
              <p className="text-white">Dhavam Spices</p>

              <p className="leading-relaxed">
                Casagrand Northern Star,
                <br />
                Madhavaram, Chennai 600110
              </p>

              <ul className="space-y-1.5">
                {PHONES.map((phone) => (
                  <li key={phone.tel}>
                    <a href={`tel:${phone.tel}`} className={linkClass}>
                      {phone.display}
                    </a>
                  </li>
                ))}
              </ul>

              <a
                href="mailto:dhavamspices@gmail.com"
                className={`inline-block break-all ${linkClass}`}
              >
                dhavamspices@gmail.com
              </a>

              {/* Social Media */}
              <div className="pt-3">
                <p className="mb-3 text-sm font-semibold text-white">
                  Follow us
                </p>

                <div className="flex items-center gap-3">

                  {/* Facebook */}
                  <a
                    href={FACEBOOK_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Dhavam Spices on Facebook"
                    title="Facebook"
                    className={`flex h-10 w-10 items-center justify-center rounded-full border border-[#56633a] text-[#c9d1b2] transition-all duration-300 hover:-translate-y-1 hover:bg-[#56633a] hover:text-white ${focusRing}`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="h-5 w-5"
                    >
                      <path d="M13.5 21v-8h2.7l.4-3.1h-3.1v-2c0-.9.3-1.5 1.6-1.5h1.7V3.6c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3v2.1H7.3V13h2.8v8h3.4z" />
                    </svg>
                  </a>

                  {/* Instagram */}
                  <a
                    href={INSTAGRAM_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Dhavam Spices on Instagram"
                    title="Instagram"
                    className={`flex h-10 w-10 items-center justify-center rounded-full border border-[#56633a] text-[#c9d1b2] transition-all duration-300 hover:-translate-y-1 hover:bg-[#56633a] hover:text-white ${focusRing}`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      className="h-5 w-5"
                    >
                      <rect x="3" y="3" width="18" height="18" rx="5" />
                      <circle cx="12" cy="12" r="4" />
                      <circle
                        cx="17.5"
                        cy="6.5"
                        r=".8"
                        fill="currentColor"
                      />
                    </svg>
                  </a>

                </div>
              </div>
            </address>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 flex flex-col gap-2 border-t border-[#4a5530] pt-6 text-sm text-[#a9b48d] sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Dhavam Spices. All rights reserved.</p>
          <p>Pure spices, straight from the farm.</p>
        </div>

      </div>
    </footer>
  );
}
