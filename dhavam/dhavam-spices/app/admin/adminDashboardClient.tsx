
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { adminService } from "@/app/services/adminService";

type Order = {
  _id: string;
  username: string;
  items: {
    productName: string;
    size: string;
    quantity: number;
  }[];
  orderStatus: string;
  createdAt: string;
};

type Product = {
  _id: string;
  name: string;
};

const heading =
  "font-[family-name:var(--font-bricolage)] font-bold tracking-tight text-[#2f381b]";

const PILL: Record<string, string> = {
  placed: "bg-[#fbe9dc] text-[#9a432a]",
  shipped: "bg-[#e6ebdc] text-[#3f4a24]",
  delivered: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-red-100 text-red-800",
};

export default function AdminDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
  }, []);

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const token = sessionStorage.getItem("token");

      if (!token) {
        throw new Error("Please log in as an admin.");
      }

      const [productData, orderData] = await Promise.all([
        adminService.getProducts(token),
        adminService.getOrders(token),
      ]);

      setProducts(
        Array.isArray(productData)
          ? productData
          : productData?.products ?? []
      );

      setOrders(
        Array.isArray(orderData)
          ? orderData
          : orderData?.orders ?? []
      );
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Unable to load dashboard."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  // Start of the current week: Monday at midnight.
  const startOfWeek = now ? new Date(now) : null;

  if (startOfWeek) {
    startOfWeek.setDate(
      startOfWeek.getDate() - ((startOfWeek.getDay() + 6) % 7)
    );
    startOfWeek.setHours(0, 0, 0, 0);
  }

  const weekStartTime = startOfWeek?.getTime() ?? null;

  const thisWeek =
    weekStartTime === null
      ? []
      : orders.filter((order) => {
          const orderTime = new Date(order.createdAt).getTime();

          return (
            !Number.isNaN(orderTime) && orderTime >= weekStartTime
          );
        });

  // All order counts come from real backend orders.
  const totalOrders = orders.length;

  const countByStatus = (status: string) =>
    orders.filter(
      (order) => order.orderStatus?.toLowerCase() === status
    ).length;

  const placedCount = countByStatus("placed");
  const shippedCount = countByStatus("shipped");
  const deliveredCount = countByStatus("delivered");
  const cancelledCount = countByStatus("cancelled");

  const stats = [
    { label: "Orders this week", value: thisWeek.length },
    { label: "Total orders", value: totalOrders },
    { label: "Products listed", value: products.length },
    { label: "Placed", value: placedCount },
    { label: "Shipped", value: shippedCount },
    { label: "Delivered", value: deliveredCount },
    { label: "Cancelled", value: cancelledCount },
  ];

  // Prepare the seven daily chart values.
  const week = startOfWeek
    ? Array.from({ length: 7 }, (_, index) => {
        const day = new Date(startOfWeek);
        day.setDate(startOfWeek.getDate() + index);

        return {
          d: day.toLocaleDateString("en", { weekday: "short" }),
          v: thisWeek.filter((order) => {
            const orderDate = new Date(order.createdAt);

            return (
              !Number.isNaN(orderDate.getTime()) &&
              orderDate.toDateString() === day.toDateString()
            );
          }).length,
        };
      })
    : [];

  const max = Math.max(1, ...week.map((day) => day.v));

  const latestOrders = [...orders]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime()
    )
    .slice(0, 5);

  
return (
  <div className="w-full px-4 py-6 sm:px-6 sm:py-8 lg:px-10 xl:px-12">
    <div className="mx-auto w-full max-w-[1600px]">
      <>
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className={`${heading} text-3xl`}>
              Good to see you
            </h1>

            <p className="mt-2 text-[#566049]">
              Here is how Dhavam Spices is doing this week.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => void loadDashboard()}
              disabled={loading}
              className="rounded-full border border-[#dfe3d0] bg-white px-5 py-2.5 font-semibold text-[#3f4a24] transition hover:bg-[#f4f6ef] disabled:opacity-60"
            >
              {loading ? "Refreshing..." : "Refresh"}
            </button>

            <Link
              href="/admin/products/new"
              className="rounded-full bg-[#3f4a24] px-6 py-2.5 font-semibold text-white transition hover:bg-[#2f381b]"
            >
              Add product
            </Link>
          </div>
        </header>

        {error && (
          <div
            role="alert"
            className="mt-6 rounded-xl bg-red-50 p-4 text-red-700"
          >
            {error}
          </div>
        )}

        {loading ? (
          <p className="mt-8 rounded-2xl border border-[#e3e8dc] bg-white p-10 text-center text-[#566049]">
            Loading dashboard...
          </p>
        ) : (
          <>
            {/* Dashboard summary cards */}
            <section
              aria-label="Dashboard summary"
              className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4"
            >
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-[#e3e8dc] bg-white p-6 transition-shadow hover:shadow-md"
                >
                  <p className="text-sm font-medium text-[#566049]">
                    {stat.label}
                  </p>

                  <p className="mt-3 text-3xl font-bold text-[#2f381b]">
                    {stat.value}
                  </p>
                </div>
              ))}
            </section>

            {/* Charts and latest orders */}
            <div className="mt-8 grid gap-6 xl:grid-cols-[1.1fr_1fr]">
              {/* Weekly orders chart */}
              <section className="min-w-0 rounded-2xl border border-[#e3e8dc] bg-white p-5 sm:p-7">
                <h2 className={`${heading} text-xl`}>
                  Orders by day
                </h2>

                <p className="mt-2 text-sm text-[#566049]">
                  Orders created since Monday this week.
                </p>

                <div
                  className="mt-8 flex h-52 items-end gap-3 sm:gap-5"
                  role="img"
                  aria-label={`Orders per day: ${week
                    .map((day) => `${day.d}: ${day.v}`)
                    .join(", ")}`}
                >
                  {week.map((day) => (
                    <div
                      key={day.d}
                      className="group flex h-full min-w-0 flex-1 flex-col justify-end text-center"
                    >
                      <span className="mb-2 text-xs font-semibold text-[#3f4a24]">
                        {day.v}
                      </span>

                      <div
                        className="rounded-t-lg bg-[#3f4a24] transition-colors group-hover:bg-[#9a432a]"
                        style={{
                          height: `${(day.v / max) * 100}%`,
                          minHeight: day.v ? "4px" : "0",
                        }}
                      />

                      <span className="mt-3 text-xs text-[#566049]">
                        {day.d}
                      </span>
                    </div>
                  ))}
                </div>
              </section>

              {/* Latest orders */}
              <section className="min-w-0 rounded-2xl border border-[#e3e8dc] bg-white p-5 sm:p-7">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className={`${heading} text-xl`}>
                    Latest orders
                  </h2>

                  <Link
                    href="/admin/orders"
                    className="text-sm font-semibold text-[#9a432a] hover:underline"
                  >
                    See all
                  </Link>
                </div>

                {latestOrders.length === 0 ? (
                  <p className="py-8 text-sm text-[#566049]">
                    No orders have been placed yet.
                  </p>
                ) : (
                  <ul className="mt-5 divide-y divide-[#edf0e4]">
                    {latestOrders.map((order) => {
                      const status = order.orderStatus || "Placed";
                      const normalizedStatus = status.toLowerCase();

                      return (
                        <li
                          key={order._id}
                          className="flex items-start justify-between gap-4 py-4"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-semibold text-[#2f381b]">
                              {order.username}
                            </p>

                            <p className="mt-1 break-words text-sm leading-6 text-[#566049]">
                              {order.items
                                ?.map(
                                  (item) =>
                                    `${item.productName} (${item.size}) × ${item.quantity}`
                                )
                                .join(", ") || "No items"}
                            </p>

                            <p className="mt-2 text-xs text-[#7a8470]">
                              {order.createdAt &&
                              !Number.isNaN(
                                new Date(order.createdAt).getTime()
                              )
                                ? new Date(
                                    order.createdAt
                                  ).toLocaleDateString("en-IN")
                                : "Date unavailable"}
                            </p>
                          </div>

                          <span
                            className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                              PILL[normalizedStatus] ??
                              "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {status}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </section>
            </div>
          </>
        )}
      </>
    </div>
  </div>
);

}
