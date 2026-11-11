import { NextResponse } from "next/server";
import { query, pool } from "@/lib/db";
import { getAuthUser } from "@/lib/serverAuth";

export async function GET(request: Request) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const items = await query<any>(
      `SELECT ci.id, ci.productId, ci.productName, ci.productImage, ci.size, ci.quantity, ps.price
       FROM CartItem ci
       JOIN ProductSize ps ON ps.productId = ci.productId AND ps.size = ci.size
       WHERE ci.userId = ?
       ORDER BY ci.id`,
      [user.id]
    );

    const formatted = items.map((i) => ({
      ...i,
      _id: String(i.id),
      price: Number(i.price),
      productImage: i.productImage || `/api/product/${i.productId}/image`,
    }));

    return NextResponse.json(formatted);
  } catch (error: any) {
    console.error("Get cart error:", error);
    return NextResponse.json(
      { message: error?.message || "Failed to fetch cart" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await pool.execute("DELETE FROM CartItem WHERE userId = ?", [user.id]);
    return NextResponse.json({ message: "Cart cleared" });
  } catch (error: any) {
    return NextResponse.json(
      { message: error?.message || "Failed to clear cart" },
      { status: 500 }
    );
  }
}
