import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import LoginForm from "@/components/LoginForm";

export const metadata: Metadata = { title: "Log in", description: "Log in to your Dhavam Spices account." };

export default function LoginPage() {
  return (
    <section className="grid min-h-[calc(100vh-72px)] lg:grid-cols-[1fr_1.05fr]">
      {/* Brand panel */}
      <div className="relative hidden overflow-hidden bg-[#2f381b] lg:block">
        <Image src="/images/reg.png" alt="" fill sizes="50vw" priority className="object-cover opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#2f381b] via-[#2f381b]/80 to-[#2f381b]/30" />
        <div className="relative p-12 xl:p-16">
          <Reveal>
            <h2 className="max-w-md font-[family-name:var(--font-bricolage)] text-4xl font-bold leading-tight text-white xl:text-5xl">
              Welcome back to Dhavam Spices.
            </h2>
          </Reveal>
          <Reveal delay={150}>
            <p className="mt-5 max-w-sm text-lg leading-relaxed text-[#d3dbbd]">
              Log in to pick up where you left off, with pure spices straight from the farm.
            </p>
          </Reveal>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center bg-[#fbfcf8] px-4 py-12 sm:px-8">
        <Reveal className="w-full max-w-lg">
          <div className="rounded-3xl border border-[#e3e8dc] bg-white p-6 shadow-xl shadow-[#2f381b]/5 sm:p-10">
            <Link href="/" aria-label="Dhavam Spices, home" className="mx-auto block w-40">
              <Image src="/images/logo.png" alt="Dhavam Spices" width={0} height={0} sizes="160px" className="h-auto w-full" />
            </Link>
            <h1 className="mt-6 text-center font-[family-name:var(--font-bricolage)] text-3xl font-bold text-[#2f381b]">Log in</h1>
            <p className="mb-8 mt-2 text-center text-[#566049]">Enter your email and password.</p>
            <LoginForm />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
