import { NextResponse } from "next/server";
import { query, pool } from "@/lib/db";
import { getAuthUser } from "@/lib/serverAuth";

export async function POST(request: Request) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const productId = Number(body.productId);
    const size = String(body.size || "").trim();
    const quantity = Math.max(1, Number(body.quantity || 1));

    const products = await query<any>(
      "SELECT name, imageUrl FROM Product WHERE id = ?",
      [productId]
    );
    if (!products.length) {
      return NextResponse.json({ message: "Product not found" }, { status: 404 });
    }
    const product = products[0];

    const sizes = await query<any>(
      "SELECT id FROM ProductSize WHERE productId = ? AND size = ? LIMIT 1",
      [productId, size]
    );
    if (!sizes.length) {
      return NextResponse.json(
        { message: `Size "${size}" is not available for this product.` },
        { status: 400 }
      );
    }

    const existing = await query<any>(
      "SELECT id, quantity FROM CartItem WHERE userId = ? AND productId = ? AND size = ?",
      [user.id, productId, size]
    );

    if (existing.length) {
      await pool.execute("UPDATE CartItem SET quantity = ? WHERE id = ?", [
        existing[0].quantity + quantity,
        existing[0].id,
      ]);
      return NextResponse.json({ updated: true });
    }

    const imgUrl = product.imageUrl || `/api/product/${productId}/image`;
    await pool.execute(
      `INSERT INTO CartItem (userId, productId, productName, productImage, size, quantity)
       VALUES (?,?,?,?,?,?)`,
      [user.id, productId, product.name, imgUrl, size, quantity]
    );

    return NextResponse.json({ updated: false });
  } catch (error: any) {
    console.error("Add to cart error:", error);
    return NextResponse.json(
      { message: error?.message || "Failed to add to cart" },
      { status: 500 }
    );
  }
}
