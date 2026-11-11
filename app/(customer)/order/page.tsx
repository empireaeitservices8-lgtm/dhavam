"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getProducts } from "@/app/services/productService";
import { shopService } from "@/app/services/shopService";
import { imageSrc } from "@/lib/image";

type SizeOption = { size: string; price: number };

type Product = {
  id: string;
  name: string;
  image: string;
  sizes: SizeOption[];
};

type OrderItem = {
  productId: string;
  productName: string;
  productImage: string;
  size: string;
  quantity: number;
  price: number;
};

function toSizes(value: unknown): SizeOption[] {
  let v = value;
  if (typeof v === "string") {
    try {
      v = JSON.parse(v);
    } catch {
      return [];
    }
  }
  if (!Array.isArray(v)) return [];

  return v
    .map((s: any) => ({
      size: String(s?.size ?? s ?? "").trim(),
      price: Number(s?.price) || 0,
    }))
    .filter((s) => s.size);
}

const money = (n: number) => `₹${n.toLocaleString("en-IN")}`;

export default function OrderPage() {
  const router = useRouter();

  const [authorized, setAuthorized] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [selectedSize, setSelectedSize] = useState("");
  const [fromCart, setFromCart] = useState(false);

  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash on Delivery");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let active = true;

    async function initialize() {
      const token = sessionStorage.getItem("token");

      if (!token) {
        const current = window.location.pathname + window.location.search;
        router.replace(`/login?redirect=${encodeURIComponent(current)}`);
        return;
      }

      try {
        const params = new URLSearchParams(window.location.search);
        const productId = params.get("product");
        const requestedSize = params.get("size") || "";
        const cartCheckout = params.get("from") === "cart";

        if (!active) return;
        setAuthorized(true);
        setFromCart(cartCheckout);

        if (cartCheckout) {
          const data: any = await shopService.getCart(token);
          const cart: any[] = Array.isArray(data) ? data : data?.items ?? [];

          if (!cart.length) throw new Error("Your cart is empty.");
          if (!active) return;

          setItems(
            cart.map((i) => ({
              productId: String(i.productId),
              productName: i.productName,
              productImage: i.productImage,
              size: i.size,
              quantity: i.quantity,
              price: Number(i.price) || 0,
            }))
          );
        } else if (productId) {
          const data: any = await getProducts();
          const list: any[] = Array.isArray(data) ? data : data?.products ?? [];

          const raw = list.find((p) => String(p.id ?? p._id) === productId);
          if (!raw) throw new Error("Product not found.");

          const selected: Product = {
            id: String(raw.id ?? raw._id),
            name: raw.name,
            image: raw.imageUrl ?? raw.image ?? "",
            sizes: toSizes(raw.sizes),
          };

          if (!active) return;
          setProduct(selected);

          const chosen =
            selected.sizes.find((s) => s.size === requestedSize) ?? selected.sizes[0];

          setSelectedSize(chosen?.size ?? "");
          setItems(
            chosen
              ? [
                  {
                    productId: selected.id,
                    productName: selected.name,
                    productImage: selected.image,
                    size: chosen.size,
                    quantity: 1,
                    price: chosen.price,
                  },
                ]
              : []
          );
        } else {
          throw new Error("Select a product or proceed from your cart to checkout.");
        }
      } catch (e) {
        if (active) setError(e instanceof Error ? e.message : "Unable to load checkout.");
      } finally {
        if (active) setLoading(false);
      }
    }

    initialize();
    return () => {
      active = false;
    };
  }, [router]);

  function changeSize(size: string) {
    setSelectedSize(size);
    if (!product) return;

    const option = product.sizes.find((s) => s.size === size);
    if (!option) return;

    setItems((prev) => prev.map((i) => ({ ...i, size, price: option.price })));
  }

  function changeQuantity(delta: number) {
    setItems((prev) =>
      prev.map((i) => ({ ...i, quantity: Math.max(1, i.quantity + delta) }))
    );
  }

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  async function submitOrder(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const token = sessionStorage.getItem("token");
    if (!token) {
      const current = window.location.pathname + window.location.search;
      router.replace(`/login?redirect=${encodeURIComponent(current)}`);
      return;
    }

    if (!username.trim() || !phone.trim() || !address.trim()) {
      setError("Please complete all required fields.");
      return;
    }
    if (!/^\d{10}$/.test(phone.trim())) {
      setError("Enter a valid 10-digit phone number.");
      return;
    }
    if (items.length === 0 || items.some((i) => !i.productId || !i.size)) {
      setError("Please select a valid product size.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      await shopService.placeOrder(token, {
        username: username.trim(),
        phone: Number(phone),
        items,
        address: address.trim(),
        paymentMethod,
      });

      let confirmation = "Your order has been placed successfully!";

      if (fromCart) {
        try {
          await shopService.clearCart(token);
        } catch {
          confirmation += " Your order was placed, but the cart could not be cleared.";
        }
      }

      setSuccess(confirmation);
      setItems([]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to place order.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading || !authorized) {
    return (
      <p className="p-10 text-center text-[#566049]">
        {authorized ? "Loading checkout..." : "Checking login..."}
      </p>
    );
  }

  if (success) {
    return (
      <main className="mx-auto max-w-xl px-4 py-20 text-center">
        <div className="rounded-2xl border border-[#dfe3d0] bg-white p-10">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#e6ebdc] text-3xl text-[#3f4a24]">
            ✓
          </div>
          <h1 className="mt-5 text-3xl font-bold text-[#2f381b]">Order Confirmed!</h1>
          <p className="mt-4 leading-relaxed text-[#566049]">{success}</p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link
              href="/myOrders"
              className="rounded-full border border-[#3f4a24] px-6 py-3 font-semibold text-[#3f4a24]"
            >
              View my orders
            </Link>
            <Link
              href="/products"
              className="rounded-full bg-[#3f4a24] px-6 py-3 font-semibold text-white transition hover:bg-[#2f381b]"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const inputCls =
    "w-full rounded-lg border border-[#dfe3d0] p-3 outline-none focus:border-[#3f4a24] focus:ring-2 focus:ring-[#3f4a24]/20";
  const labelCls = "mb-2 block text-sm font-medium text-[#3f4a24]";

  return (
    <main className="mx-auto max-w-[1000px] px-4 py-12 md:px-6">
      <div className="mb-8">
        <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-[#9a432a]">
          Dhavam Spices
        </p>
        <h1 className="text-3xl font-bold text-[#2f381b] sm:text-4xl">Checkout</h1>
        <p className="mt-2 text-[#566049]">
          Confirm your products and enter your delivery details.
        </p>
      </div>

      {error && (
        <div
          role="alert"
          className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      <div className="grid items-start gap-8 md:grid-cols-2">
        {/* Order summary */}
        <section className="rounded-2xl border border-[#dfe3d0] bg-white p-5 sm:p-6">
          <h2 className="mb-5 text-xl font-semibold text-[#2f381b]">Order Summary</h2>

          {product && (
            <div className="mb-5">
              <label htmlFor="product-size" className={labelCls}>
                Select size
              </label>
              <select
                id="product-size"
                value={selectedSize}
                onChange={(e) => changeSize(e.target.value)}
                className={`${inputCls} bg-white`}
              >
                {product.sizes.map((s) => (
                  <option key={s.size} value={s.size}>
                    {s.size} — {money(s.price)}
                  </option>
                ))}
              </select>
              {product.sizes.length === 0 && (
                <p className="mt-2 text-sm text-red-600">
                  No sizes are available for this product. Please contact us.
                </p>
              )}
            </div>
          )}

          {items.length > 0 ? (
            <div className="space-y-4">
              {items.map((item, index) => (
                <div
                  key={`${item.productId}-${item.size}-${index}`}
                  className="flex items-center gap-4 border-b border-[#dfe3d0] pb-4 last:border-b-0"
                >
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-[#e6ebdc]">
                    {item.productImage && (
                      <Image
                        src={imageSrc(item.productImage)}
                        alt={item.productName}
                        fill
                        unoptimized
                        sizes="80px"
                        className="object-cover"
                      />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-[#2f381b]">{item.productName}</h3>
                    <p className="mt-1 text-sm text-[#566049]">Size: {item.size}</p>
                    <p className="text-sm text-[#566049]">
                      {money(item.price)} × {item.quantity}
                    </p>

                    {!fromCart && (
                      <div className="mt-2 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => changeQuantity(-1)}
                          className="h-7 w-7 rounded-full border border-[#dfe3d0]"
                        >
                          −
                        </button>
                        <span className="min-w-5 text-center text-sm">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => changeQuantity(1)}
                          className="h-7 w-7 rounded-full border border-[#dfe3d0]"
                        >
                          +
                        </button>
                      </div>
                    )}
                  </div>

                  <p className="font-semibold text-[#2f381b]">
                    {money(item.price * item.quantity)}
                  </p>
                </div>
              ))}

              <div className="flex items-center justify-between rounded-xl bg-[#f3f5ed] p-4">
                <span className="font-medium text-[#566049]">Total</span>
                <span className="text-xl font-bold text-[#2f381b]">{money(total)}</span>
              </div>
            </div>
          ) : (
            <p className="py-4 text-sm text-[#566049]">No items available to display.</p>
          )}
        </section>

        {/* Delivery form */}
        <form
          onSubmit={submitOrder}
          className="space-y-5 rounded-2xl border border-[#dfe3d0] bg-white p-5 sm:p-6"
        >
          <h2 className="text-xl font-semibold text-[#2f381b]">Delivery Details</h2>

          <div>
            <label htmlFor="username" className={labelCls}>
              Full Name
            </label>
            <input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="name"
              className={inputCls}
              placeholder="Enter your full name"
            />
          </div>

          <div>
            <label htmlFor="phone" className={labelCls}>
              Phone Number
            </label>
            <input
              id="phone"
              type="tel"
              inputMode="numeric"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
              required
              autoComplete="tel"
              maxLength={10}
              className={inputCls}
              placeholder="10-digit phone number"
            />
          </div>

          <div>
            <label htmlFor="address" className={labelCls}>
              Delivery Address
            </label>
            <textarea
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
              rows={4}
              autoComplete="street-address"
              className={`${inputCls} resize-y`}
              placeholder="House name, street, city, PIN code"
            />
          </div>

          <div>
            <label htmlFor="payment" className={labelCls}>
              Payment Method
            </label>
            <select
              id="payment"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className={`${inputCls} bg-white`}
            >
              <option value="Cash on Delivery">Cash on Delivery</option>
<option value="Online Payment">Online Payment (UPI / Card / Net Banking)</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={submitting || items.length === 0 || items.some((i) => !i.size)}
            className="w-full rounded-full bg-[#3f4a24] px-6 py-3 font-semibold text-white transition hover:bg-[#2f381b] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? "Placing Order..." : "Place Order"}
          </button>

          <Link
            href="/cart"
            className="block text-center text-sm font-medium text-[#3f4a24] underline underline-offset-4"
          >
            Back to Cart
          </Link>
        </form>
      </div>
    </main>
  );
}