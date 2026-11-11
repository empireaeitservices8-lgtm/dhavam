import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/products";

export default function ProductCard({ p }: { p: Product }) {
  return (
    <article id={p.slug} className="flex scroll-mt-24 flex-col overflow-hidden rounded-2xl border border-[#dfe3d0] bg-white">
      <div className="relative aspect-square bg-[#e6ebdc]">
        {p.image ? (
          <Image src={`/images/products/${p.image}.jpeg`} alt={`${p.name} jar`} fill sizes="(min-width:1024px) 25vw, (min-width:640px) 50vw, 100vw" className="object-cover" />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-[#3f4a24]">
            <span className="text-sm">Photo coming soon</span>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-[family-name:var(--font-bricolage)] text-xl font-semibold text-[#2f381b]">{p.name}</h3>
        <p className="mt-2 flex-1 leading-relaxed text-[#566049]">{p.blurb}</p>
        <p className="mt-4 text-sm text-[#566049]">
          {p.sizes.length ? p.sizes.join(" · ") : "Ask us for available sizes"}
        </p>
        <Link
          href={`/order?product=${p.slug}`}
          className="mt-4 inline-flex justify-center rounded-full bg-[#3f4a24] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#2f381b] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#9a432a]/40"
        >
          Order now
        </Link>
      </div>
    </article>
  );
}
