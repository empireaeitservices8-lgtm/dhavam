import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const products = await query<any>(
      "SELECT id, name, description, category, imageUrl FROM Product ORDER BY id DESC"
    );

    if (!products.length) {
      return NextResponse.json([]);
    }

    const ids = products.map((p) => p.id);
    const placeholders = ids.map(() => "?").join(",");
    const sizes = await query<any>(
      `SELECT id, productId, size, price FROM ProductSize WHERE productId IN (${placeholders}) ORDER BY id`,
      ids
    );

    const sizesByProduct = new Map<number, any[]>();
    for (const s of sizes) {
      if (!sizesByProduct.has(s.productId)) sizesByProduct.set(s.productId, []);
      sizesByProduct.get(s.productId)!.push({
        id: s.id,
        size: s.size,
        price: Number(s.price),
      });
    }

    const formatted = products.map((p) => {
      const url = p.imageUrl || `/api/product/${p.id}/image`;
      return {
        ...p,
        _id: String(p.id),
        group: String(p.category || "").toLowerCase(),
        imageUrl: url,
        image: url,
        sizes: sizesByProduct.get(p.id) || [],
      };
    });

    return NextResponse.json(formatted);
  } catch (error: any) {
    console.error("Get products error:", error);
    return NextResponse.json(
      { message: error?.message || "Failed to load products" },
      { status: 500 }
    );
  }
}
