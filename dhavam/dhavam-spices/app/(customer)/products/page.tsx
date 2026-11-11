"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { getProducts } from "@/app/services/productService";
import { shopService } from "@/app/services/shopService";
import { imageSrc } from "@/lib/image";

type ProductSize = {
  size: string;
  price: string | number;
};

type Product = {
  _id: string;
  name: string;
  description: string;
  group: string;
  image: string;
  sizes: ProductSize[] | string[] | string;
};

type Notification = {
  type: "success" | "error";
  message: string;
};

const categories = [
  { key: "whole", title: "Whole Spices" },
  { key: "ground", title: "Spice Powders" },
  { key: "combo", title: "Spice Combos" },
];

// Convert backend sizes into a consistent format
function getSizes(sizes: Product["sizes"]): ProductSize[] {
  let parsed: unknown = sizes;

  if (typeof sizes === "string") {
    try {
      parsed = JSON.parse(sizes);
    } catch {
      parsed = sizes.split(",");
    }
  }

  if (!Array.isArray(parsed)) {
    return [];
  }

  return parsed
    .map((item): ProductSize | null => {
      // New format: { size, price }
      if (item && typeof item === "object" && "size" in item) {
        const value = item as { size: unknown; price?: unknown };
        const size = String(value.size ?? "").trim();

        if (!size) return null;

        return {
          size,
          price:
            typeof value.price === "string" || typeof value.price === "number"
              ? value.price
              : "",
        };
      }

      // Old format: "50 g"
      const size = String(item ?? "").trim();

      if (!size) return null;

      return { size, price: "" };
    })
    .filter((item): item is ProductSize => item !== null);
}

function getProductSizes(product: Product): ProductSize[] {
  return getSizes(product.sizes);
}

function formatPrice(price: string | number): string {
  const value = Number(price);

  if (!Number.isFinite(value) || value <= 0) {
    return "";
  }

  return `₹${value.toLocaleString("en-IN")}`;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [notification, setNotification] = useState<Notification | null>(null);

  // Load products without requiring login
  useEffect(() => {
    let active = true;

    async function loadProducts() {
      try {
        const data: any = await getProducts();

        const rawProducts = Array.isArray(data)
          ? data
          : Array.isArray(data?.products)
            ? data.products
            : [];

        const list: Product[] = rawProducts.map((product: any) => ({
          _id: String(product.id ?? product._id),
          name: product.name,
          description: product.description,
          group: String(product.category ?? product.group ?? "").toLowerCase(),
          image: product.imageUrl ?? product.image ?? "",
          sizes: product.sizes ?? [],
        }));

        if (!active) return;

        setProducts(list);

        const initial: Record<string, string> = {};

        list.forEach((product) => {
          const sizes = getProductSizes(product);
          initial[product._id] = sizes[0]?.size ?? "";
        });

        setSelectedSizes(initial);
      } catch (e) {
        if (!active) return;

        setNotification({
          type: "error",
          message: e instanceof Error ? e.message : "Unable to load products.",
        });
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadProducts();

    return () => {
      active = false;
    };
  }, []);

  // Get selected size details
  function getSelectedSize(product: Product) {
    const sizes = getProductSizes(product);
    return sizes.find((item) => item.size === selectedSizes[product._id]);
  }

  // Add product to cart
  async function addToCart(product: Product) {
    const token = sessionStorage.getItem("token");
    const selectedSize = getSelectedSize(product);

    if (!token) {
      window.location.href = `/login?redirect=${encodeURIComponent("/products")}`;
      return;
    }

    if (!selectedSize) {
      setNotification({
        type: "error",
        message: "Please select a size first.",
      });
      return;
    }

    try {
      setBusy(product._id);
      setNotification(null);

      const result = await shopService.addToCart(
        token,
        product._id,
        selectedSize.size
      );

      const isUpdated = result?.message === "Cart quantity updated";

      setNotification({
        type: "success",
        message: isUpdated
          ? `${product.name} (${selectedSize.size}) quantity updated in your cart.`
          : `${product.name} (${selectedSize.size}) added to your cart.`,
      });
    } catch (e) {
      setNotification({
        type: "error",
        message:
          e instanceof Error ? e.message : "Could not add the item to your cart.",
      });
    } finally {
      setBusy("");
    }
  }

  // Order a product directly
  function orderNow(product: Product) {
    const token = sessionStorage.getItem("token");
    const selectedSize = getSelectedSize(product);

    if (!selectedSize) {
      setNotification({
        type: "error",
        message: "Please select a size first.",
      });
      return;
    }

    const orderUrl =
      `/order?product=${encodeURIComponent(product._id)}` +
      `&size=${encodeURIComponent(selectedSize.size)}`;

    if (!token) {
      window.location.href = `/login?redirect=${encodeURIComponent(orderUrl)}`;
      return;
    }

    window.location.href = orderUrl;
  }

  // Automatically dismiss notifications
  useEffect(() => {
    if (!notification) return;

    const timeout = window.setTimeout(
      () => setNotification(null),
      notification.type === "success" ? 3000 : 5000
    );

    return () => window.clearTimeout(timeout);
  }, [notification]);

  if (loading) {
    return (
      <p className="p-10 text-center text-[#566049]">Loading products...</p>
    );
  }

  return (
    <main className="mx-auto max-w-[1320px] px-4 py-12 md:px-6">
      {/* Notification */}
      {notification && (
        <div
          key={`${notification.type}-${notification.message}`}
          role={notification.type === "error" ? "alert" : "status"}
          aria-live={notification.type === "error" ? "assertive" : "polite"}
          className={`fixed right-4 top-24 z-50 flex max-w-[calc(100vw-2rem)] items-start gap-3 rounded-xl border bg-white px-5 py-4 shadow-xl sm:right-6 sm:max-w-md ${
            notification.type === "success"
              ? "border-green-200"
              : "border-red-200"
          }`}
        >
          <span
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-lg font-bold ${
              notification.type === "success"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {notification.type === "success" ? "✓" : "!"}
          </span>

          <div className="flex-1">
            <p
              className={`font-semibold ${
                notification.type === "success"
                  ? "text-green-800"
                  : "text-red-800"
              }`}
            >
              {notification.type === "success"
                ? "Cart updated!"
                : "Something went wrong"}
            </p>

            <p className="mt-1 text-sm leading-relaxed text-gray-600">
              {notification.message}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setNotification(null)}
            aria-label="Dismiss notification"
            className="ml-1 text-xl leading-none text-gray-400 hover:text-gray-700"
          >
            ×
          </button>
        </div>
      )}

      {/* Page heading */}
      <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-4xl font-bold tracking-tight text-[#2f381b]">
          Our Products
        </h1>

        <Link
          href="/cart"
          className="rounded-full border border-[#3f4a24] px-5 py-2.5 font-semibold text-[#3f4a24] transition-colors hover:bg-[#f3f5ed]"
        >
          View Cart
        </Link>
      </div>

      {/* Product categories */}
      {categories.map((category) => {
        const items = products.filter(
          (product) => product.group?.trim().toLowerCase() === category.key
        );

        if (!items.length) return null;

        return (
          <section
            key={category.key}
            id={category.key}
            className="mb-16 scroll-mt-24"
          >
            <h2 className="mb-8 border-b border-[#dfe3d0] pb-3 text-2xl font-semibold text-[#2f381b]">
              {category.title}
            </h2>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
              {items.map((product) => {
                const sizes = getProductSizes(product);
                const selectedSize = getSelectedSize(product);

                return (
                  <article
                    key={product._id}
                    className="group flex flex-col overflow-hidden rounded-3xl border border-[#e3e8dc] bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#2f381b]/10"
                  >
                    {/* Image */}
                    <div className="relative aspect-[4/3] overflow-hidden bg-[#e6ebdc]">
                      {product.image ? (
                        <Image
                          src={imageSrc(product.image)}
                          alt={product.name}
                          fill
                          unoptimized
                          sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-sm text-[#566049]">
                          Photo coming soon
                        </div>
                      )}

                      <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-[#3f4a24] backdrop-blur">
                        {category.title}
                      </span>
                    </div>

                    {/* Details */}
                    <div className="flex flex-1 flex-col p-6">
                      <h3 className="text-xl font-bold tracking-tight text-[#2f381b]">
                        {product.name}
                      </h3>

                      <p className="mt-2 line-clamp-3 flex-1 text-sm leading-6 text-[#566049]">
                        {product.description}
                      </p>

                      {/* Sizes */}
                      {sizes.length === 0 ? (
                        <p className="mt-5 text-sm text-red-600">
                          No sizes available yet.
                        </p>
                      ) : (
                        <div className="mt-5">
                          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#7a8470]">
                            Select size
                          </p>

                          <div
                            role="radiogroup"
                            aria-label={`Size for ${product.name}`}
                            className="flex flex-wrap gap-2"
                          >
                            {sizes.map((item) => {
                              const active =
                                selectedSizes[product._id] === item.size;

                              return (
                                <button
                                  key={item.size}
                                  type="button"
                                  role="radio"
                                  aria-checked={active}
                                  onClick={() =>
                                    setSelectedSizes((previous) => ({
                                      ...previous,
                                      [product._id]: item.size,
                                    }))
                                  }
                                  className={`rounded-full border px-4 py-1.5 text-sm font-medium transition ${
                                    active
                                      ? "border-[#3f4a24] bg-[#3f4a24] text-white"
                                      : "border-[#dfe3d0] bg-white text-[#3f4a24] hover:border-[#3f4a24]"
                                  }`}
                                >
                                  {item.size}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Price */}
                      <div className="mt-5 flex items-end justify-between border-t border-[#edf0e4] pt-5">
                        <div>
                          <p className="text-xs text-[#7a8470]">Price</p>
                          <p className="text-2xl font-bold text-[#2f381b]">
                            {selectedSize
                              ? formatPrice(selectedSize.price) || "Unavailable"
                              : "—"}
                          </p>
                        </div>
                      </div>

                      {/* Buttons */}
                      <div className="mt-4 grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => addToCart(product)}
                          disabled={busy === product._id || !sizes.length}
                          className="rounded-full bg-[#3f4a24] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#2f381b] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {busy === product._id ? "Adding..." : "Add to Cart"}
                        </button>

                        <button
                          type="button"
                          onClick={() => orderNow(product)}
                          disabled={!sizes.length}
                          className="rounded-full border border-[#3f4a24] px-4 py-3 text-sm font-semibold text-[#3f4a24] transition hover:bg-[#f3f5ed] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Order Now
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        );
      })}

      {/* No products */}
      {products.length === 0 && (
        <p className="py-10 text-center text-[#566049]">
          No products available.
        </p>
      )}
    </main>
  );
}