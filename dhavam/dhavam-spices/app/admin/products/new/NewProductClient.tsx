import type { Metadata } from "next";
import ProductForm from "@/components/ProductForm";

export const metadata: Metadata = { title: "Add product" };

export default function NewProductPage() {
  return (
    <>
      <style>{`
        @keyframes dh-pop { from { opacity: 0; transform: scale(.94); } to { opacity: 1; transform: none; } }
        @keyframes dh-draw { from { stroke-dashoffset: 30; } to { stroke-dashoffset: 0; } }
        @media (prefers-reduced-motion: reduce) { * { animation-duration: 1ms !important; } }
      `}</style>
      
      <ProductForm />
    </>
  );
}
