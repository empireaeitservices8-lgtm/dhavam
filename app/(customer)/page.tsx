import Image from "next/image";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import StarMark from "@/components/StarMark";
import { waLink } from "@/lib/site";

const HERO_IMG = "/images/banner2.png";
// Real pixel size of banner.png (from your original aspect-[1774/887])
const IMG_W = 1774;
const IMG_H = 887;

const WHY = [
  {
    t: "Direct from the farm",
    d: "We source our spices at the farm, so what reaches you is fresh and traceable.",
  },
  {
    t: "Pure and unadulterated",
    d: "100% natural spices with no artificial flavours and nothing added.",
  },
  {
    t: "Hygienically packed",
    d: "Sealed in clear jars that lock in aroma and show you exactly what you're getting.",
  },
  {
    t: "Whole or ground",
    d: "Choose whole spices to grind fresh, or finely ground powders ready to use.",
  },
];

const USES = [
  "Tea & beverages",
  "Rice & curries",
  "Desserts & baking",
  "Sauces & spice blends",
];

const CHIPS = ["100% natural", "No artificial flavours", "Hygienically packed"];

const SPICES = [
  "Cardamom",
  "Black pepper",
  "Cloves",
  "Cinnamon",
  "Star anise",
  "Black coffee powder",
];

const btnFocus =
  "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#e3a27f]/60";

export default function Home() {
  return (
    <main className="w-full overflow-x-clip bg-[#fcfaf3]">
      <style>{`
        @keyframes dh-marquee {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }

        .dh-marquee {
          animation: dh-marquee 30s linear infinite;
          will-change: transform;
        }

        @media (hover: hover) {
          .dh-marquee-container:hover .dh-marquee {
            animation-play-state: paused;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .dh-marquee {
            animation: none !important;
            transform: none !important;
          }
        }
      `}</style>

      {/* ================= HERO ================= */}
      <section className="relative isolate bg-[#171b0c] text-[#f6f1e4]">
        <div className="relative flex flex-col xl:block">
          {/* TEXT: overlaps the top of the image on mobile/tablet,
              overlays the dark area on XL */}
          <div className="relative z-10 xl:absolute xl:inset-0">
            <div className="px-5 pt-8 sm:px-8 sm:pt-10 md:px-12 xl:w-[52%] xl:pb-0 xl:pl-[7vw] xl:pr-0 xl:pt-[3vw]">
              <Reveal>
                <span className="inline-flex max-w-full items-center gap-2 rounded-full border border-white/30 bg-black/30 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm sm:text-sm xl:px-4 xl:py-2">
                  <span className="size-2 shrink-0 rounded-full bg-[#e3a27f]" />
                  Farm-direct spices from Chennai
                </span>
              </Reveal>

              <Reveal delay={100}>
                <h1 className="mt-4 font-[family-name:var(--font-bricolage)] text-[clamp(2rem,8vw,3.25rem)] font-bold leading-[1.1] tracking-tight text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)] xl:mt-[1.2vw] xl:text-[clamp(2.25rem,3.3vw,4.5rem)]">
                  Pure spices,
                  straight from
                  the farm.
                </h1>
              </Reveal>

              <Reveal delay={180}>
                <p className="mt-3 max-w-[560px] text-sm leading-6 text-white drop-shadow-[0_1px_6px_rgba(0,0,0,0.7)] sm:text-base sm:leading-7 xl:mt-[1vw] xl:max-w-[34vw] xl:text-[clamp(0.9rem,1.1vw,1.25rem)] xl:leading-[1.6]">
                  Premium, unadulterated spices and masalas. Cardamom, pepper,
                  cloves, cinnamon and star anise, whole or freshly ground.
                </p>
              </Reveal>

              <Reveal delay={260}>
                <div className="mt-5 flex flex-row flex-wrap gap-3 xl:mt-[1.5vw]">
                  <Link
                    href="/products"
                    className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#f6f1e4] px-5 py-2.5 text-sm font-bold text-[#2f381b] shadow-lg transition duration-300 hover:-translate-y-0.5 hover:bg-white sm:px-7 sm:py-3 lg:text-base ${btnFocus}`}
                  >
                    Browse products
                    <span aria-hidden="true">→</span>
                  </Link>
                  <Link
                    href="/about"
                    className={`inline-flex min-h-11 items-center justify-center rounded-full border border-white/60 bg-black/30 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/10 sm:px-7 sm:py-3 lg:text-base ${btnFocus}`}
                  >
                    Our story
                  </Link>
                </div>
              </Reveal>
            </div>
          </div>

          {/* IMAGE: complete, sharp, no blur. On mobile it is pulled up so the
              text overlaps its top edge. */}
          <div
            className="relative z-0 -mt-[16vw] w-full overflow-hidden xl:mt-0"
            style={{ aspectRatio: `${IMG_W} / ${IMG_H}` }}
          >
            <Image
              src={HERO_IMG}
              alt="Dhavam Spices star anise jar with assorted whole spices and powders"
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />

            {/* Mobile/tablet: soft fade only on the top part, rest stays clear */}
            <div
              aria-hidden="true"
              className="absolute inset-x-0 top-0 h-[55%] bg-gradient-to-b from-[#171b0c] via-[#171b0c]/55 to-transparent xl:hidden"
            />

            {/* XL: subtle left shading for text readability */}
            <div
              aria-hidden="true"
              className="absolute inset-0 hidden bg-gradient-to-r from-[#101407]/40 via-transparent to-transparent xl:block"
            />
          </div>
        </div>

        {/* Trust chips strip */}
        <Reveal delay={340}>
          <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 border-t border-white/10 bg-[#171b0c] px-5 py-4 text-xs font-medium text-white sm:text-sm">
            {CHIPS.map((chip) => (
              <li key={chip} className="flex items-center gap-2">
                <span className="text-[#f0a47e]" aria-hidden="true">
                  ✓
                </span>
                {chip}
              </li>
            ))}
          </ul>
        </Reveal>
      </section>

      {/* SPICE MARQUEE */}
      <div
        className="dh-marquee-container overflow-hidden bg-[#5b2d21] py-3.5 text-[#f6f1e4] sm:py-4"
        aria-label="Our spices"
      >
        <div className="dh-marquee flex w-max">
          {[0, 1].map((group) => (
            <ul
              key={group}
              className="flex shrink-0 items-center"
              aria-hidden={group === 1 ? true : undefined}
            >
              {SPICES.map((spice) => (
                <li
                  key={`${spice}-${group}`}
                  className="flex shrink-0 items-center font-[family-name:var(--font-bricolage)] text-base font-semibold tracking-wide sm:text-lg"
                >
                  <span className="whitespace-nowrap px-5 sm:px-8">
                    {spice}
                  </span>

                  <StarMark className="size-4 shrink-0 text-[#f6f1e4]/70 sm:size-5" />
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>

      {/* WHY CHOOSE DHAVAM */}
      <section className="relative overflow-hidden bg-[#f6f1e4]">
        <StarMark className="pointer-events-none absolute -left-24 -top-24 size-64 text-[#3f4a24] opacity-[0.05] sm:-left-32 sm:-top-32 sm:size-[420px]" />

        <div className="relative mx-auto grid max-w-[1200px] gap-10 px-5 py-16 sm:px-6 sm:py-20 md:gap-12 md:py-24 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20 lg:px-8">
          <Reveal>
            <div className="lg:sticky lg:top-28">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9a432a] sm:text-sm">
                The Dhavam difference
              </span>

              <h2 className="mt-4 max-w-xl font-[family-name:var(--font-bricolage)] text-3xl font-bold leading-[1.08] tracking-tight text-[#2f381b] sm:text-4xl md:text-5xl">
                Why cooks choose Dhavam
              </h2>

              <p className="mt-5 max-w-md text-base leading-7 text-[#4a5538] sm:text-lg sm:leading-8">
                Nothing sits between the farm and your kitchen except a clean
                jar.
              </p>

              <Link
                href="/products"
                className={`mt-7 inline-flex min-h-12 items-center justify-center rounded-full bg-[#3f4a24] px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#2f381b] sm:mt-8 sm:text-base ${btnFocus}`}
              >
                See the range
              </Link>
            </div>
          </Reveal>

          <ul className="grid grid-cols-1 gap-x-8 gap-y-8 sm:grid-cols-2 sm:gap-x-10 sm:gap-y-10">
            {WHY.map((item, index) => (
              <Reveal key={item.t} delay={index * 100}>
                <li className="h-full border-t-2 border-[#3f4a24]/20 pt-5 sm:pt-6">
                  <StarMark className="size-7 text-[#9a432a]" />

                  <h3 className="mt-4 font-[family-name:var(--font-bricolage)] text-lg font-semibold leading-snug text-[#2f381b] sm:text-xl">
                    {item.t}
                  </h3>

                  <p className="mt-2 text-sm leading-7 text-[#4a5538] sm:text-base sm:leading-relaxed">
                    {item.d}
                  </p>
                </li>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* HOW TO USE OUR SPICES */}
      <section className="overflow-hidden bg-[#fcfaf3]">
        <div className="mx-auto grid max-w-[1200px] items-center gap-10 px-5 py-16 sm:px-6 sm:py-20 md:gap-14 md:py-24 lg:grid-cols-2 lg:gap-20 lg:px-8">
          <Reveal from="left">
            <div className="relative mx-auto w-full max-w-md lg:max-w-none">
              <div
                aria-hidden="true"
                className="absolute -bottom-3 -right-3 h-full w-full rounded-t-[999px] rounded-b-3xl bg-[#9a432a]/15 sm:-bottom-4 sm:-right-4"
              />

              <div className="relative h-[300px] overflow-hidden rounded-t-[999px] rounded-b-3xl shadow-2xl shadow-[#2f381b]/20 sm:h-[380px] md:h-[440px] lg:h-[min(500px,55vw)]">
                <Image
                  src="/images/home.png"
                  alt="Cooking at the stove with Dhavam Spices jars on the counter"
                  fill
                  sizes="(min-width: 1024px) 50vw, (min-width: 640px) 80vw, 100vw"
                  className="object-cover object-center"
                />
              </div>
            </div>
          </Reveal>

          <Reveal from="right">
            <div className="min-w-0">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9a432a] sm:text-sm">
                Made for your kitchen
              </span>

              <h2 className="mt-4 max-w-xl font-[family-name:var(--font-bricolage)] text-3xl font-bold leading-[1.08] tracking-tight text-[#2f381b] sm:text-4xl md:text-5xl">
                Five spices, endless dishes
              </h2>

              <p className="mt-5 max-w-md text-base leading-7 text-[#4a5538] sm:text-lg sm:leading-8">
                From the first cup of tea to the last pot of curry, one jar
                does a lot of work.
              </p>

              <ul className="mt-7 flex flex-wrap gap-2.5 sm:mt-8 sm:gap-3">
                {USES.map((use) => (
                  <li
                    key={use}
                    className="rounded-full border border-[#3f4a24]/25 bg-white px-4 py-2.5 text-sm font-medium text-[#3f4a24] transition-colors hover:border-[#3f4a24] hover:bg-[#3f4a24] hover:text-white sm:px-5 sm:text-base"
                  >
                    {use}
                  </li>
                ))}
              </ul>

              <Link
                href="/about"
                className={`group mt-8 inline-flex min-h-12 items-center gap-2 rounded sm:mt-10 ${btnFocus}`}
              >
                <span className="font-semibold text-[#9a432a] group-hover:underline">
                  Read our story
                </span>

                <span
                  aria-hidden="true"
                  className="text-[#9a432a] transition-transform group-hover:translate-x-1"
                >
                  →
                </span>
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* CALL TO ACTION */}
      <section className="bg-[#fcfaf3] px-5 pb-16 sm:px-6 sm:pb-20 md:pb-24 lg:px-8">
        <div className="relative mx-auto max-w-[1200px] overflow-hidden rounded-[1.5rem] bg-gradient-to-br from-[#3f4a24] to-[#2f381b] px-5 py-12 text-center sm:rounded-[2rem] sm:px-10 sm:py-16 md:px-12 md:py-20">
          <StarMark className="pointer-events-none absolute -left-8 -top-8 size-32 text-white opacity-[0.07] motion-safe:animate-[spin_100s_linear_infinite] motion-reduce:animate-none sm:-left-10 sm:-top-10 sm:size-48" />

          <StarMark className="pointer-events-none absolute -bottom-8 -right-8 size-36 text-white opacity-[0.07] motion-safe:animate-[spin_110s_linear_infinite_reverse] motion-reduce:animate-none sm:-bottom-12 sm:-right-8 sm:size-56" />

          <div className="relative mx-auto max-w-2xl">
            <h2 className="font-[family-name:var(--font-bricolage)] text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl md:text-5xl">
              Ready to order?
            </h2>

            <p className="mx-auto mt-4 max-w-md text-base leading-7 text-[#d3dbbd] sm:text-lg sm:leading-8">
              Message us on WhatsApp for prices, sizes and delivery.
            </p>

            <a
              href={waLink("Hi Dhavam Spices, I'd like to place an order.")}
              target="_blank"
              rel="noopener noreferrer"
              className={`mt-7 inline-flex min-h-12 max-w-full items-center justify-center rounded-full bg-[#f6f1e4] px-6 py-3.5 text-sm font-semibold text-[#2f381b] shadow-xl shadow-black/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-white sm:mt-9 sm:px-9 sm:py-4 sm:text-base ${btnFocus}`}
            >
              Order on WhatsApp
              <span aria-hidden="true" className="ml-2">
                →
              </span>
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
