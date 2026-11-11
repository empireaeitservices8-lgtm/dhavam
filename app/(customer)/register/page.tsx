import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import RegisterForm from "@/components/RegisterForm";

export const metadata: Metadata = { title: "Create account", description: "Create your Dhavam Spices account." };

const PERKS = ["Faster checkout every time", "Track your orders", "Be first to know about new spices"];

export default function RegisterPage() {
  return (
    <section className="grid min-h-[calc(100vh-72px)] lg:grid-cols-[1fr_1.05fr]">
      {/* Brand panel */}
      <div className="relative hidden overflow-hidden bg-[#2f381b] lg:block">
        <Image src="/images/reg.png" alt="" fill sizes="50vw" priority className="object-cover opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#2f381b] via-[#2f381b]/80 to-[#2f381b]/30" />
        <div className="relative p-12 xl:p-16">
          <div className="sticky top-28">
          <Reveal>
            <h2 className="max-w-md font-[family-name:var(--font-bricolage)] text-4xl font-bold leading-tight text-white xl:text-5xl">
              Join the Dhavam Spices family.
            </h2>
          </Reveal>
          <ul className="mt-8 space-y-3">
            {PERKS.map((p, i) => (
              <li key={p}>
                <Reveal delay={150 + i * 120} from="left">
                  <span className="flex items-center gap-3 text-lg text-[#e3e8d3]">
                    <span className="flex size-7 items-center justify-center rounded-full bg-[#e3a27f]/20 text-[#e3a27f]">
                      <svg viewBox="0 0 20 20" className="size-4" aria-hidden="true"><path d="M4 10.5l4 4 8-9" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </span>
                    {p}
                  </span>
                </Reveal>
              </li>
            ))}
          </ul>
          </div>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center bg-[#fbfcf8] px-4 py-12 sm:px-8">
        <Reveal className="w-full max-w-lg">
          <div className="rounded-3xl border border-[#e3e8dc] bg-white p-6 shadow-xl shadow-[#2f381b]/5 sm:p-10">
            <Link href="/" aria-label="Dhavam Spices, home" className="mx-auto block w-40">
              <Image src="/images/logo.png" alt="Dhavam Spices" width={0} height={0} sizes="160px" className="h-auto w-full" />
            </Link>
            <h1 className="mt-6 text-center font-[family-name:var(--font-bricolage)] text-3xl font-bold text-[#2f381b]">Create your account</h1>
            <p className="mb-8 mt-2 text-center text-[#566049]">It takes less than a minute.</p>
            <RegisterForm />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
