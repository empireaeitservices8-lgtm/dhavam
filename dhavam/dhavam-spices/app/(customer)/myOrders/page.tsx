
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Package,
  Search,
  ShoppingBag,
  ChevronRight,
  Clock3,
  CheckCircle2,
  Truck,
  XCircle,
  ArrowRight,
  CalendarDays,
  MapPin,
  RefreshCw,
} from "lucide-react";
import { imageSrc } from "@/lib/image";

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
).trim().replace(/\/+$/, "");

const ORDERS_PER_PAGE = 5;

type OrderItem = {
  productId: string;
  productName: string;
  productImage: string;
  size: string;
  quantity: number;
};

type Order = {
  _id: string;
  username: string;
  phone: number | string;
  items: OrderItem[];
  address: string;
  paymentMethod: string;
  orderStatus: string;
  createdAt: string;
};

const FILTERS = [
  "All Orders",
  "Placed",
  "Shipped",
  "Delivered",
  "Cancelled",
];

const STATUS_STYLES: Record<string, string> = {
  placed: "border-amber-200 bg-amber-50 text-amber-800",
  shipped: "border-blue-200 bg-blue-50 text-blue-800",
  delivered: "border-emerald-200 bg-emerald-50 text-emerald-800",
  cancelled: "border-red-200 bg-red-50 text-red-800",
};

function formatDate(date: string) {
  const parsedDate = new Date(date);

  if (!date || Number.isNaN(parsedDate.getTime())) {
    return "Date unavailable";
  }

  return parsedDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getImageUrl(image: string) {
  return imageSrc(image);
}

function StatusBadge({ status }: { status: string }) {
  const normalized = (status || "Placed").toLowerCase();

  const Icon =
    normalized === "shipped"
      ? Truck
      : normalized === "delivered"
        ? CheckCircle2
        : normalized === "cancelled"
          ? XCircle
          : Clock3;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold ${
        STATUS_STYLES[normalized] ??
        "border-gray-200 bg-gray-50 text-gray-700"
      }`}
    >
      <Icon size={14} />
      {status || "Placed"}
    </span>
  );
}

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeFilter, setActiveFilter] = useState("All Orders");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancellingId, setCancellingId] = useState("");
  const [cancelError, setCancelError] = useState("");
  const [cancelMessage, setCancelMessage] = useState("");
  const [imageErrors, setImageErrors] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchMyOrders = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const token = sessionStorage.getItem("token");

      if (!token) {
        window.location.href = "/login";
        return;
      }

      const response = await fetch(`${API_URL}/myOrders`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });

      if (response.status === 401 || response.status === 403) {
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("username");
        window.location.href = "/login";
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Unable to load your orders.");
      }

      if (!Array.isArray(data)) {
        throw new Error("The server returned an invalid orders response.");
      }

      setOrders(data);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Unable to load your orders."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchMyOrders();
  }, [fetchMyOrders]);

  // Summary counts
  const totalOrders = orders.length;

  const placedOrders = orders.filter(
    (order) => order.orderStatus?.toLowerCase() === "placed"
  ).length;

  const shippedOrders = orders.filter(
    (order) => order.orderStatus?.toLowerCase() === "shipped"
  ).length;

  const deliveredOrders = orders.filter(
    (order) => order.orderStatus?.toLowerCase() === "delivered"
  ).length;

  const cancelledOrders = orders.filter(
    (order) => order.orderStatus?.toLowerCase() === "cancelled"
  ).length;

  const stats = [
    {
      title: "Total Orders",
      count: totalOrders,
      subtitle: "All your orders",
      icon: Package,
      style: "bg-[#eff1e8] text-[#354020]",
    },
    {
      title: "Placed",
      count: placedOrders,
      subtitle: "Orders received",
      icon: Clock3,
      style: "bg-amber-50 text-amber-700",
    },
    {
      title: "Shipped",
      count: shippedOrders,
      subtitle: "On the way",
      icon: Truck,
      style: "bg-blue-50 text-blue-700",
    },
    {
      title: "Delivered",
      count: deliveredOrders,
      subtitle: "Successfully delivered",
      icon: CheckCircle2,
      style: "bg-emerald-50 text-emerald-700",
    },
    {
      title: "Cancelled",
      count: cancelledOrders,
      subtitle: "Cancelled orders",
      icon: XCircle,
      style: "bg-red-50 text-red-700",
    },
  ];

  // Search and status filtering happen before pagination.
  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase();

    return orders.filter((order) => {
      const matchesFilter =
        activeFilter === "All Orders" ||
        order.orderStatus?.toLowerCase() === activeFilter.toLowerCase();

      const matchesSearch =
        !query ||
        (order._id || "").toLowerCase().includes(query) ||
        (order.items || []).some((item) =>
          (item.productName || "").toLowerCase().includes(query)
        );

      return matchesFilter && matchesSearch;
    });
  }, [orders, activeFilter, search]);

  const totalPages = Math.ceil(
    filteredOrders.length / ORDERS_PER_PAGE
  );

  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * ORDERS_PER_PAGE;

    return filteredOrders.slice(
      startIndex,
      startIndex + ORDERS_PER_PAGE
    );
  }, [filteredOrders, currentPage]);

  const startOrder =
    filteredOrders.length === 0
      ? 0
      : (currentPage - 1) * ORDERS_PER_PAGE + 1;

  const endOrder = Math.min(
    currentPage * ORDERS_PER_PAGE,
    filteredOrders.length
  );

  // Reset to page 1 when searching or changing the status filter.
  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilter, search]);

  // Keep the page valid if an order is cancelled or removed.
  useEffect(() => {
    if (currentPage > Math.max(1, totalPages)) {
      setCurrentPage(Math.max(1, totalPages));
    }
  }, [currentPage, totalPages]);

  async function cancelOrder(orderId: string) {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this order? This action cannot be undone."
    );

    if (!confirmed) return;

    const token = sessionStorage.getItem("token");

    if (!token) {
      window.location.href = "/login";
      return;
    }

    try {
      setCancellingId(orderId);
      setCancelError("");
      setCancelMessage("");

      const response = await fetch(
        `${API_URL}/myOrders/cancel/${orderId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.message || "Unable to cancel this order."
        );
      }

      setOrders((previous) =>
        previous.map((order) =>
          order._id === orderId
            ? {
                ...order,
                orderStatus:
                  data?.order?.orderStatus || "Cancelled",
              }
            : order
        )
      );

      setCancelMessage("Your order has been cancelled successfully.");
    } catch (e) {
      setCancelError(
        e instanceof Error ? e.message : "Unable to cancel this order."
      );
    } finally {
      setCancellingId("");
    }
  }

  return (
    <main className="min-h-screen bg-[#f8f7f2] text-[#2f381b]">
      {/* Page heading */}
      <section className="border-b border-[#e8e7de] bg-[#f0f1e8]">
        <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
          <div className="mb-3 flex items-center gap-2 text-sm text-[#777d68]">
            <Link href="/" className="hover:text-[#9a432a]">
              Home
            </Link>
            <ChevronRight size={15} />
            <span className="font-medium text-[#2f381b]">
              My Orders
            </span>
          </div>

          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.24em] text-[#9a432a]">
                Your shopping journey
              </p>

              <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">
                My Orders<span className="text-[#9a432a]">.</span>
              </h1>

              <p className="mt-3 max-w-lg text-sm leading-6 text-[#707565] sm:text-base">
                Track your orders and manage eligible cancellations.
              </p>
            </div>

            <Link
              href="/products"
              className="inline-flex w-fit items-center gap-2 rounded-full bg-[#354020] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#9a432a]"
            >
              <ShoppingBag size={17} />
              Continue shopping
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-10">
        {/* Summary cards */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <button
                key={stat.title}
                type="button"
                onClick={() =>
                  setActiveFilter(
                    stat.title === "Total Orders"
                      ? "All Orders"
                      : stat.title
                  )
                }
                className="rounded-2xl border border-[#e8e7de] bg-white p-5 text-left transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium text-[#777d68]">
                    {stat.title}
                  </span>
                  <span className={`rounded-xl p-2.5 ${stat.style}`}>
                    <Icon size={20} />
                  </span>
                </div>

                <p className="mt-4 text-3xl font-bold">{stat.count}</p>
                <p className="mt-1 text-xs text-[#8a8d80]">
                  {stat.subtitle}
                </p>
              </button>
            );
          })}
        </div>

        {/* Search and refresh */}
        <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-xl font-bold sm:text-2xl">
              Order history
            </h2>
            <p className="mt-1 text-sm text-[#858879]">
              Your most recent orders appear first.
            </p>
          </div>

          <div className="flex gap-2">
            <div className="relative min-w-0 flex-1 sm:w-72">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8b8e7f]"
              />
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search orders or products"
                aria-label="Search orders or products"
                className="w-full rounded-full border border-[#e2e2d8] bg-white py-3 pl-11 pr-4 text-sm outline-none focus:border-[#69744c] focus:ring-2 focus:ring-[#69744c]/10"
              />
            </div>

            <button
              type="button"
              onClick={() => void fetchMyOrders()}
              disabled={loading}
              aria-label="Refresh orders"
              className="flex shrink-0 items-center justify-center rounded-full border border-[#e2e2d8] bg-white px-4 text-[#354020] hover:bg-[#eff1e8] disabled:opacity-50"
            >
              <RefreshCw
                size={17}
                className={loading ? "animate-spin" : ""}
              />
            </button>
          </div>
        </div>

        {/* Status filters */}
        <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
          {FILTERS.map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setActiveFilter(filter)}
              aria-pressed={activeFilter === filter}
              className={`shrink-0 rounded-full border px-4 py-2.5 text-sm font-medium transition ${
                activeFilter === filter
                  ? "border-[#354020] bg-[#354020] text-white"
                  : "border-[#e3e3d9] bg-white text-[#6f7462] hover:border-[#354020] hover:text-[#354020]"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Cancellation messages */}
        {cancelError && (
          <p
            role="alert"
            className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            {cancelError}
          </p>
        )}

        {cancelMessage && (
          <p
            role="status"
            className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"
          >
            {cancelMessage}
          </p>
        )}

        {/* Loading state */}
        {loading ? (
          <div className="rounded-2xl border border-[#e8e7de] bg-white py-20 text-center">
            <RefreshCw
              size={28}
              className="mx-auto animate-spin text-[#68734d]"
            />
            <p className="mt-4 text-sm text-[#777d68]">
              Loading your orders...
            </p>
          </div>
        ) : error ? (
          /* Error state */
          <div className="rounded-2xl border border-red-200 bg-white px-5 py-12 text-center">
            <XCircle size={30} className="mx-auto text-red-600" />
            <h3 className="mt-4 font-bold">
              Could not load your orders
            </h3>
            <p className="mt-2 text-sm text-[#777d68]">{error}</p>
            <button
              type="button"
              onClick={() => void fetchMyOrders()}
              className="mt-5 rounded-full bg-[#354020] px-5 py-3 text-sm font-semibold text-white hover:bg-[#9a432a]"
            >
              Try again
            </button>
          </div>
        ) : filteredOrders.length === 0 ? (
          /* Empty state */
          <div className="rounded-2xl border border-dashed border-[#d9dccd] bg-white px-5 py-14 text-center sm:py-20">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#eff1e8]">
              <Package size={29} className="text-[#53613a]" />
            </div>

            <h3 className="mt-5 text-xl font-bold">
              {orders.length === 0
                ? "No orders yet"
                : "No matching orders"}
            </h3>

            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#858879]">
              {orders.length === 0
                ? "Your orders will appear here after you place your first order."
                : "Try a different status or search term."}
            </p>

            {orders.length === 0 ? (
              <Link
                href="/products"
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#354020] px-5 py-3 text-sm font-semibold text-white hover:bg-[#9a432a]"
              >
                Explore products <ArrowRight size={16} />
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setActiveFilter("All Orders");
                }}
                className="mt-5 text-sm font-semibold text-[#9a432a] hover:underline"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Paginated order cards */}
            <div className="space-y-5">
              {paginatedOrders.map((order) => (
                <article
                  key={order._id}
                  className="overflow-hidden rounded-2xl border border-[#e7e6dc] bg-white transition hover:border-[#c9cdbb]"
                >
                  <div className="flex flex-col gap-4 border-b border-[#eeeee7] bg-[#fdfdfb] px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="font-bold">
                          Order #{order._id.slice(-8).toUpperCase()}
                        </h3>
                        <StatusBadge status={order.orderStatus} />
                      </div>

                      <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-[#818575]">
                        <span className="inline-flex items-center gap-1.5">
                          <CalendarDays size={14} />
                          {formatDate(order.createdAt)}
                        </span>

                        <span>
                          {(order.items || []).reduce(
                            (total, item) => total + item.quantity,
                            0
                          )}{" "}
                          item(s)
                        </span>
                      </div>
                    </div>

                    <div className="sm:text-right">
                      <p className="text-xs text-[#858879]">
                        Payment method
                      </p>
                      <p className="mt-1 text-sm font-semibold">
                        {order.paymentMethod || "Cash on Delivery"}
                      </p>
                    </div>
                  </div>

                  <div className="px-5 py-5 sm:px-6">
                    <div className="space-y-4">
                      {(order.items || []).map((item, index) => {
                        const imageKey = `${order._id}-${index}`;
                        const imageUrl = getImageUrl(item.productImage);

                        return (
                          <div
                            key={imageKey}
                            className="flex items-center gap-4"
                          >
                            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[#e7e5d9] bg-[#f1f0e7] sm:h-20 sm:w-20">
                              {imageUrl &&
                              !imageErrors.includes(imageKey) ? (
                                <img
                                  src={imageUrl}
                                  alt={item.productName}
                                  className="h-full w-full object-cover"
                                  onError={() =>
                                    setImageErrors((previous) =>
                                      previous.includes(imageKey)
                                        ? previous
                                        : [...previous, imageKey]
                                    )
                                  }
                                />
                              ) : (
                                <Package
                                  size={26}
                                  className="text-[#68734d]"
                                />
                              )}
                            </div>

                            <div className="min-w-0 flex-1">
                              <h4 className="text-sm font-semibold text-[#333b24] sm:text-base">
                                {item.productName}
                              </h4>
                              <p className="mt-1 text-xs text-[#858879]">
                                Size: {item.size}
                              </p>
                              <p className="mt-1 text-xs text-[#858879]">
                                Quantity: {item.quantity}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="mt-5 border-t border-[#eeeee7] pt-5">
                      <div className="flex items-start gap-2 text-sm text-[#777d68]">
                        <MapPin
                          size={17}
                          className="mt-0.5 shrink-0"
                        />
                        <div>
                          <p className="font-semibold text-[#354020]">
                            Delivery address
                          </p>
                          <p className="mt-1 leading-6">
                            {order.address}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center gap-2 text-xs text-[#858879]">
                        <Package size={15} />
                        <span>Ordered by {order.username}</span>
                      </div>

                      {/* Cancel only when the order is Placed */}
                      {order.orderStatus?.toLowerCase() === "placed" && (
                        <div className="mt-5 border-t border-[#eeeee7] pt-4">
                          <button
                            type="button"
                            onClick={() => void cancelOrder(order._id)}
                            disabled={cancellingId === order._id}
                            className="rounded-full border border-red-200 px-5 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {cancellingId === order._id
                              ? "Cancelling..."
                              : "Cancel order"}
                          </button>
                        </div>
                      )}

                      {order.orderStatus?.toLowerCase() === "shipped" && (
                        <p className="mt-5 border-t border-[#eeeee7] pt-4 text-sm text-[#777d68]">
                          Your order has shipped and can no longer be cancelled.
                        </p>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {/* Pagination controls */}
            <div className="mt-6 flex flex-col gap-4 rounded-2xl border border-[#e7e6dc] bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-[#777d68]">
                Showing{" "}
                <span className="font-semibold text-[#354020]">
                  {startOrder}–{endOrder}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-[#354020]">
                  {filteredOrders.length}
                </span>{" "}
                orders
              </p>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setCurrentPage((page) => Math.max(1, page - 1))
                  }
                  disabled={currentPage === 1}
                  className="rounded-full border border-[#e2e2d8] px-4 py-2 text-sm font-semibold text-[#354020] transition hover:bg-[#eff1e8] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Previous
                </button>

                {Array.from(
                  { length: totalPages },
                  (_, index) => index + 1
                ).map((page) => (
                  <button
                    key={page}
                    type="button"
                    onClick={() => setCurrentPage(page)}
                    aria-label={`Go to page ${page}`}
                    aria-current={
                      currentPage === page ? "page" : undefined
                    }
                    className={`h-9 min-w-9 rounded-full px-3 text-sm font-semibold transition ${
                      currentPage === page
                        ? "bg-[#354020] text-white"
                        : "border border-[#e2e2d8] text-[#354020] hover:bg-[#eff1e8]"
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() =>
                    setCurrentPage((page) =>
                      Math.min(totalPages, page + 1)
                    )
                  }
                  disabled={currentPage === totalPages}
                  className="rounded-full border border-[#e2e2d8] px-4 py-2 text-sm font-semibold text-[#354020] transition hover:bg-[#eff1e8] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}

        {/* Bottom shopping banner */}
        <div className="mt-10 flex flex-col items-start justify-between gap-4 rounded-2xl bg-[#354020] p-6 text-white sm:flex-row sm:items-center sm:p-8">
          <div>
            <p className="text-lg font-bold">Need more spices?</p>
            <p className="mt-1 text-sm leading-6 text-white/70">
              Discover authentic spices for your kitchen.
            </p>
          </div>

          <Link
            href="/products"
            className="inline-flex shrink-0 items-center gap-2 rounded-full bg-[#f4f0df] px-5 py-3 text-sm font-bold text-[#354020] hover:bg-white"
          >
            Explore products <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </main>
  );
}
