
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Contact | Dhavam Spices",
  description:
    "Premium, pure, unadulterated spices and masalas straight from the farm. Order by WhatsApp, phone or email.",
};

const OWNER = "Dhavam Spices";

const PHONES = [
  { display: "63830 73503", tel: "+916383073503" },
  { display: "81481 23417", tel: "+918148123417" },
];

const EMAIL = "dhavamspices@gmail.com";

const ADDRESS = [
  "Casagrand Northern Star",
  "Madhavaram, Chennai 600110",
];

const MAPS_URL =
  "https://www.google.com/maps/search/?api=1&query=Casagrand+Northern+Star+Madhavaram+Chennai+600110";

const WHATSAPP_URL = `https://wa.me/916383073503?text=${encodeURIComponent(
  "Hi Dhavam Spices, I'd like to place an order."
)}`;

// Replace these with your actual social media profile URLs
const FACEBOOK_URL = "https://www.facebook.com/profile.php?id=61595939693155";
const INSTAGRAM_URL = "https://www.instagram.com/dhavam_spices?psln=MTI2emRjOG1qMzBlNw%3D%3D";

const SPICES = [
  "Cardamom",
  "Pepper",
  "Cloves",
  "Cinnamon",
  "Star anise",
  "Black coffee powder",
];

const focus =
  "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#d9825f]/40";

const link = `rounded text-lg text-white underline-offset-4 hover:underline ${focus}`;

const row = "grid gap-1 py-5 sm:grid-cols-[9rem_1fr] sm:gap-6";

const term = "text-sm font-medium text-[#b9c29a]";

export default function ContactPage() {
  return (
    <main className="bg-[#2f381b] px-6 py-20 text-[#e6ebdc] sm:py-28">
      <div className="mx-auto max-w-2xl">

        <h1 className="text-4xl font-semibold leading-tight text-white sm:text-5xl">
          Pure spices, straight from the farm to your kitchen.
        </h1>

        <p className="mt-5 max-w-prose text-lg leading-relaxed text-[#d5dcc0]">
          Dhavam Spices sells premium, unadulterated spices and masalas
          sourced directly from the farm. Message us with what you need
          and how much, and we&apos;ll reply with price and delivery details.
        </p>

        {/* WhatsApp button */}
        <a
          href={WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className={`mt-10 inline-flex items-center justify-center rounded-full bg-[#9a432a] px-7 py-3.5 text-base font-semibold text-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#b4502f] hover:shadow-lg active:translate-y-0 active:scale-[0.97] motion-reduce:transition-none motion-reduce:hover:translate-y-0 ${focus}`}
        >
          Message us on WhatsApp
        </a>

        {/* Social media links */}
        <div className="mt-8">
          <p className="mb-4 text-sm font-medium text-[#b9c29a]">
            Follow us on social media
          </p>

          <div className="flex flex-wrap gap-3">

            {/* Facebook */}
            <a
              href={FACEBOOK_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Follow Dhavam Spices on Facebook"
              className={`inline-flex items-center gap-2 rounded-full border border-[#56633a] px-5 py-3 text-white transition-all duration-300 hover:-translate-y-1 hover:bg-[#56633a] ${focus}`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-5 w-5"
              >
                <path d="M13.5 21v-8h2.7l.4-3.1h-3.1v-2c0-.9.3-1.5 1.6-1.5h1.7V3.6c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3v2.1H7.3V13h2.8v8h3.4z" />
              </svg>
              Facebook
            </a>

            {/* Instagram */}
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Follow Dhavam Spices on Instagram"
              className={`inline-flex items-center gap-2 rounded-full border border-[#56633a] px-5 py-3 text-white transition-all duration-300 hover:-translate-y-1 hover:bg-[#56633a] ${focus}`}
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
                <circle cx="17.5" cy="6.5" r=".8" fill="currentColor" />
              </svg>
              Instagram
            </a>

          </div>
        </div>

        <dl className="mt-16 divide-y divide-[#56633a] border-y border-[#56633a]">

          {/* Phone */}
          <div className={row}>
            <dt className={term}>Call {OWNER}</dt>
            <dd className="flex flex-col gap-1">
              {PHONES.map((p) => (
                <a
                  key={p.tel}
                  href={`tel:${p.tel}`}
                  className={`w-fit ${link}`}
                >
                  {p.display}
                </a>
              ))}
            </dd>
          </div>

          {/* Email */}
          <div className={row}>
            <dt className={term}>Email</dt>
            <dd>
              <a
                href={`mailto:${EMAIL}`}
                className={`break-all ${link}`}
              >
                {EMAIL}
              </a>
            </dd>
          </div>

          {/* Address */}
          <div className={row}>
            <dt className={term}>Find us</dt>
            <dd className="text-lg text-white">
              {ADDRESS.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}

              <a
                href={MAPS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className={`mt-2 inline-block rounded text-base text-[#d5dcc0] underline underline-offset-4 hover:text-white ${focus}`}
              >
                Open in Google Maps
              </a>
            </dd>
          </div>

          {/* Products */}
          <div className={row}>
            <dt className={term}>What we sell</dt>
            <dd>
              <ul className="flex flex-wrap gap-2">
                {SPICES.map((s) => (
                  <li
                    key={s}
                    className="rounded-full border border-[#56633a] px-3.5 py-1.5 text-sm text-[#d5dcc0]"
                  >
                    {s}
                  </li>
                ))}
              </ul>

              <p className="mt-3 text-base text-[#d5dcc0]">
                Powders of all these spices are also available.
              </p>
            </dd>
          </div>

        </dl>
      </div>
    </main>
  );
}
