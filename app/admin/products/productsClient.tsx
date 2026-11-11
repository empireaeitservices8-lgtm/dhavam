
import type { Metadata } from "next";
import ProductsTable from "@/components/ProductsTable";

export const metadata: Metadata = {
  title: "Products",
};

export default function AdminProductsPage() {
  return (
    <div className="w-full px-4 py-6 sm:px-6 sm:py-8 lg:px-10 xl:px-12">
      <div className="mx-auto w-full max-w-[1600px]">
        <div className="mb-6 sm:mb-8">
        </div>
        <ProductsTable />
      </div>
    </div>
  );
}
