"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import emailjs from "@emailjs/browser";
import { PRODUCTS } from "@/lib/products";

const SERVICE_ID = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID ?? "";
const TEMPLATE_ID = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID ?? "";
const PUBLIC_KEY = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY ?? "";

const heading = "font-[family-name:var(--font-bricolage)] text-4xl font-bold tracking-tight text-[#2f381b] sm:text-5xl";
const label = "mb-1.5 block text-sm font-semibold text-[#2f381b]";
const field =
  "w-full rounded-xl border border-[#b9c29a] bg-white px-4 py-3 text-[#2f381b] placeholder:text-[#7c8768] transition-colors focus:border-[#9a432a] focus:outline-none focus:ring-4 focus:ring-[#9a432a]/20";
const primaryBtn =
  "inline-flex items-center justify-center rounded-full bg-[#3f4a24] px-6 py-3 font-semibold text-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#2f381b] hover:shadow-lg active:translate-y-0 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#9a432a]/40 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:bg-[#3f4a24] disabled:hover:shadow-sm motion-reduce:transition-none motion-reduce:hover:translate-y-0";
const secondaryBtn =
  "inline-flex items-center justify-center rounded-full border border-[#3f4a24] px-6 py-3 font-semibold text-[#3f4a24] transition-colors hover:bg-[#3f4a24] hover:text-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#9a432a]/40";

type Status = "idle" | "sending" | "error";
type Confirmed = { id: string; name: string; phone: string; items: { name: string; qty: string }[] };

// Assumes each product in "@/lib/products" has `slug` and `name`.
const OPTIONS = PRODUCTS.map((p) => ({ slug: p.slug, name: p.name }));

function makeOrderId() {
  return "DS-" + Date.now().toString(36).toUpperCase().slice(-6);
}

function cleanPhone(v: string) {
  const digits = v.replace(/\D/g, "");
  return digits.length === 12 && digits.startsWith("91") ? digits.slice(2) : digits;
}

export default function OrderForm({ initialSlug }: { initialSlug?: string }) {
  const startPicks = initialSlug && OPTIONS.some((o) => o.slug === initialSlug) ? [initialSlug] : [];

  const [picks, setPicks] = useState<string[]>(startPicks);
  const [qty, setQty] = useState<Record<string, string>>({});
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [done, setDone] = useState<Confirmed | null>(null);

  const doneRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (done) doneRef.current?.focus();
  }, [done]);

  const nameOf = (slug: string) => OPTIONS.find((o) => o.slug === slug)?.name ?? slug;
  const toggle = (slug: string) =>
    setPicks((p) => (p.includes(slug) ? p.filter((x) => x !== slug) : [...p, slug]));

  const phoneOk = cleanPhone(phone).length === 10;
  const canSend =
    picks.length > 0 &&
    picks.every((s) => (qty[s] ?? "").trim() !== "") &&
    name.trim() !== "" &&
    phoneOk &&
    address.trim() !== "";

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!canSend || status === "sending") return;

    const id = makeOrderId();
    const items = picks.map((s) => ({ name: nameOf(s), qty: qty[s].trim() }));

    setStatus("sending");
    try {
      await emailjs.send(
        SERVICE_ID,
        TEMPLATE_ID,
        {
          order_id: id,
          from_name: name.trim(),
          phone: cleanPhone(phone),
          reply_to: email.trim(),
          address: address.trim(),
          items: items.map((i) => `${i.name}: ${i.qty}`).join("\n"),
          notes: notes.trim() || "None",
        },
        { publicKey: PUBLIC_KEY }
      );
      setDone({ id, name: name.trim(), phone: cleanPhone(phone), items });
      setStatus("idle");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setStatus("error");
    }
  }

  function reset() {
    setPicks([]);
    setQty({});
    setName("");
    setPhone("");
    setEmail("");
    setAddress("");
    setNotes("");
    setDone(null);
  }

  if (done) {
    return (
      <div role="status" className="rounded-3xl border border-[#b9c29a] bg-white p-6 sm:p-10">
        <div
          aria-hidden="true"
          className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[#3f4a24] text-white"
        >
          <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12.5l4.5 4.5L19 7.5" />
          </svg>
        </div>

        <h1 ref={doneRef} tabIndex={-1} className={`${heading} focus:outline-none`}>
          Order placed
        </h1>
        <p className="mt-3 text-lg leading-relaxed text-[#4a5538]">
          Thank you, {done.name}. We'll call you on {done.phone} to confirm the price, delivery and payment.
        </p>

        <dl className="mt-8 divide-y divide-[#dfe5cf] border-y border-[#dfe5cf]">
          <div className="flex justify-between gap-4 py-3">
            <dt className="text-[#566049]">Order number</dt>
            <dd className="font-semibold text-[#2f381b]">{done.id}</dd>
          </div>
          {done.items.map((i) => (
            <div key={i.name} className="flex justify-between gap-4 py-3">
              <dt className="text-[#566049]">{i.name}</dt>
              <dd className="font-semibold text-[#2f381b]">{i.qty}</dd>
            </div>
          ))}
        </dl>

        <p className="mt-4 text-sm text-[#566049]">Keep your order number handy when we call.</p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link href="/products" className={primaryBtn}>
            Back to products
          </Link>
          <button type="button" onClick={reset} className={secondaryBtn}>
            Place another order
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-8">
      <div>
        <h1 className={heading}>Place your order</h1>
        <p className="mt-4 text-lg leading-relaxed text-[#4a5538]">
          Choose your spices, tell us how much you need, and we'll call to confirm the price and delivery.
        </p>
      </div>

      <fieldset>
        <legend className={label}>1. Pick your spices</legend>
        <div className="flex flex-wrap gap-2">
          {OPTIONS.map((o) => {
            const on = picks.includes(o.slug);
            return (
              <button
                key={o.slug}
                type="button"
                aria-pressed={on}
                onClick={() => toggle(o.slug)}
                className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#9a432a]/40 ${
                  on
                    ? "border-[#3f4a24] bg-[#3f4a24] text-white"
                    : "border-[#3f4a24] text-[#3f4a24] hover:bg-[#dfe5cf]"
                }`}
              >
                {on && <span aria-hidden="true">✓ </span>}
                {o.name}
              </button>
            );
          })}
        </div>
      </fieldset>

      {picks.length > 0 && (
        <fieldset>
          <legend className={label}>2. How much of each?</legend>
          <div className="space-y-3">
            {picks.map((s) => (
              <div key={s} className="grid items-center gap-2 sm:grid-cols-[1fr_12rem] sm:gap-4">
                <label htmlFor={`qty-${s}`} className="font-medium text-[#2f381b]">
                  {nameOf(s)}
                </label>
                <input
                  id={`qty-${s}`}
                  value={qty[s] ?? ""}
                  onChange={(e) => setQty((q) => ({ ...q, [s]: e.target.value }))}
                  className={field}
                  placeholder="e.g. 250 g"
                />
              </div>
            ))}
          </div>
        </fieldset>
      )}

      <fieldset className="space-y-5">
        <legend className={label}>{picks.length > 0 ? "3. Where should we deliver?" : "2. Where should we deliver?"}</legend>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="o-name" className={label}>Your name</label>
            <input id="o-name" value={name} onChange={(e) => setName(e.target.value)} className={field} autoComplete="name" />
          </div>
          <div>
            <label htmlFor="o-phone" className={label}>Phone number</label>
            <input
              id="o-phone"
              type="tel"
              inputMode="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={field}
              autoComplete="tel"
              placeholder="10-digit mobile number"
              aria-invalid={phone !== "" && !phoneOk}
            />
            {phone !== "" && !phoneOk && (
              <p className="mt-1.5 text-sm text-[#9a432a]">Enter a 10-digit mobile number.</p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="o-email" className={label}>Email (optional)</label>
          <input id="o-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={field} autoComplete="email" />
        </div>

        <div>
          <label htmlFor="o-address" className={label}>Delivery address</label>
          <textarea
            id="o-address"
            rows={3}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className={field}
            autoComplete="street-address"
            placeholder="House or flat number, street, area, city, pincode"
          />
        </div>

        <div>
          <label htmlFor="o-notes" className={label}>Notes (optional)</label>
          <textarea
            id="o-notes"
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className={field}
            placeholder="Whole or powder, best time to call, anything else"
          />
        </div>
      </fieldset>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <button type="submit" disabled={!canSend || status === "sending"} className={primaryBtn}>
          {status === "sending" ? "Placing order…" : "Place order"}
        </button>
        <p role="status" aria-live="polite" className="text-sm">
          {status === "error" ? (
            <span className="text-[#9a432a]">
              We couldn't place your order. Check your connection and try again, or call 63830 73503.
            </span>
          ) : !canSend ? (
            <span className="text-[#566049]">Pick a spice, add a quantity, and fill in your name, phone and address.</span>
          ) : null}
        </p>
      </div>
    </form>
  );
}
