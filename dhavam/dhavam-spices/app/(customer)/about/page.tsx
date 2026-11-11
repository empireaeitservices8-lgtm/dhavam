"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";

const VALUES = [
  { t: "Straight from the farm", d: "We buy directly from farms, so the spices on your shelf are as fresh and honest as possible." },
  { t: "Nothing added", d: "Every spice is 100% natural, with no artificial flavours or fillers." },
  { t: "Packed with care", d: "Hygienically packed in clear jars so you can see the quality before you open the lid." },
];

const HEADLINE = "Spices the way they should taste.";
const EASE = "ease-[cubic-bezier(0.22,1,0.36,1)]";

/** Render-prop wrapper: gives children a `shown` flag once the block scrolls into view. */
function InView({ children, className = "" }: { children: (shown: boolean) => ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.2, rootMargin: "0px 0px -8% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className={className}>
      {children(shown)}
    </div>
  );
}

export default function AboutPage() {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setLoaded(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const words = HEADLINE.split(" ");

  return (
    <>
      <title>Our story</title>
      <meta name="description" content="Dhavam Spices sells premium, pure, unadulterated spices directly from the farm." />

      {/* Hero: the one orchestrated moment. Words rise out of a mask on load. */}
      <section className="bg-[#e6ebdc]">
        <div className="mx-auto max-w-[1200px] px-4 py-14 md:px-6">
          <h1
            aria-label={HEADLINE}
            className="max-w-3xl font-[family-name:var(--font-bricolage)] text-4xl font-bold leading-tight tracking-tight text-[#2f381b] sm:text-5xl"
          >
            {words.map((w, i) => (
              <span key={i} aria-hidden className="inline-block overflow-hidden align-bottom pb-[0.1em] -mb-[0.1em]">
                <span
                  className={`inline-block transition-transform duration-[900ms] ${EASE} motion-reduce:translate-y-0 motion-reduce:transition-none ${
                    loaded ? "translate-y-0" : "translate-y-[110%]"
                  }`}
                  style={{ transitionDelay: `${120 + i * 80}ms` }}
                >
                  {w}
                </span>
                {i < words.length - 1 && "\u00A0"}
              </span>
            ))}
          </h1>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1200px] items-center gap-10 px-4 py-16 md:px-6 lg:grid-cols-2">
        <InView className="max-w-xl space-y-4 text-lg leading-relaxed text-[#3d4733]">
          {(shown) =>
            [
              "Dhavam Spices is a Chennai-based spice brand. We sell premium, pure and unadulterated spices and masalas, sourced directly from the farm.",
              "Our range covers the spices every kitchen reaches for: cardamom, pepper, cloves, cinnamon, star anise and black coffee powder. Most are available whole or as freshly ground powders, so you can cook the way you like.",
              "We make them for everyone who cooks, from a weekday chai to a festival biryani.",
            ].map((text, i) => (
              <p
                key={i}
                className={`transition-all duration-700 ${EASE} motion-reduce:translate-y-0 motion-reduce:opacity-100 motion-reduce:transition-none ${
                  shown ? "translate-y-0 opacity-100" : "translate-y-3.5 opacity-0"
                }`}
                style={{ transitionDelay: `${i * 120}ms` }}
              >
                {text}
              </p>
            ))
          }
        </InView>

        {/* Image wipes up into view while settling from a slight zoom */}
        <InView>
          {(shown) => (
            <div
              className={`relative aspect-[1404/650] overflow-hidden rounded-3xl transition-[clip-path] duration-[1200ms] delay-150 ${EASE} motion-reduce:transition-none motion-reduce:[clip-path:inset(0_0_0_0_round_1.5rem)] ${
                shown ? "[clip-path:inset(0_0_0_0_round_1.5rem)]" : "[clip-path:inset(100%_0_0_0_round_1.5rem)]"
              }`}
            >
              <Image
                src="/images/kitchen.jpg"
                alt="Dhavam Spices jars in a home kitchen"
                fill
                sizes="(min-width:1024px) 50vw, 100vw"
                className={`object-cover transition-transform duration-[1600ms] delay-150 ${EASE} motion-reduce:scale-100 motion-reduce:transition-none ${
                  shown ? "scale-100" : "scale-[1.15]"
                }`}
              />
            </div>
          )}
        </InView>
      </section>

      <section className="bg-[#2f381b] text-[#e9edd9]">
        <div className="mx-auto max-w-[1200px] px-4 py-16 md:px-6">
          <h2 className="font-[family-name:var(--font-bricolage)] text-3xl font-bold text-white">What we stand for</h2>
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {VALUES.map((v, i) => (
              <InView key={v.t} className="relative pt-5">
                {(shown) => (
                  <>
                    {/* Top rule draws across, then the text eases in */}
                    <span
                      aria-hidden
                      className={`absolute inset-x-0 top-0 h-px origin-left bg-[#6b7747] transition-transform duration-[900ms] ${EASE} motion-reduce:scale-x-100 motion-reduce:transition-none ${
                        shown ? "scale-x-100" : "scale-x-0"
                      }`}
                      style={{ transitionDelay: `${i * 140}ms` }}
                    />
                    <div
                      className={`transition-all duration-700 ${EASE} motion-reduce:translate-y-0 motion-reduce:opacity-100 motion-reduce:transition-none ${
                        shown ? "translate-y-0 opacity-100" : "translate-y-2.5 opacity-0"
                      }`}
                      style={{ transitionDelay: `${i * 140 + 250}ms` }}
                    >
                      <h3 className="text-lg font-semibold text-white">{v.t}</h3>
                      <p className="mt-2 leading-relaxed text-[#c9d1b2]">{v.d}</p>
                    </div>
                  </>
                )}
              </InView>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto flex max-w-[1200px] flex-col items-start gap-4 px-4 py-14 md:px-6">
        <h2 className="font-[family-name:var(--font-bricolage)] text-2xl font-bold text-[#2f381b]">Taste the difference</h2>
        <Link
          href="/products"
          className="rounded-full bg-[#3f4a24] px-6 py-3 font-semibold text-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#2f381b] hover:shadow-lg active:translate-y-0 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#9a432a]/40 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
        >
          Browse products
        </Link>
      </section>
    </>
  );
}
