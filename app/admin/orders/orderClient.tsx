import type { Metadata } from "next";
import OrdersBoard from "@/components/OrdersBoard";

export const metadata: Metadata = {
  title: "Orders",
};

export default function AdminOrdersPage() {
  return (
    <main className="min-h-screen w-full min-w-0 overflow-x-hidden bg-[#f8f9f5]">
      <div className="mx-auto w-full min-w-0 max-w-[1600px] px-3 py-4 sm:px-5 sm:py-6 md:px-6 lg:px-8 lg:py-8 xl:px-10 2xl:px-12">
        <OrdersBoard />
      </div>
    </main>
  );
}