import { NextResponse } from "next/server";
import { query, pool } from "@/lib/db";
import { getAuthUser } from "@/lib/serverAuth";

interface RouteParams {
  params: Promise<{ cartId: string }>;
}

export async function PUT(request: Request, context: RouteParams) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { cartId } = await context.params;
    const numericId = Number(cartId);

    const items = await query<any>(
      "SELECT quantity FROM CartItem WHERE id = ? AND userId = ?",
      [numericId, user.id]
    );

    if (!items.length) {
      return NextResponse.json({ message: "Cart item not found" }, { status: 404 });
    }

    const newQty = items[0].quantity + 1;
    await pool.execute("UPDATE CartItem SET quantity = ? WHERE id = ? AND userId = ?", [
      newQty,
      numericId,
      user.id,
    ]);

    return NextResponse.json({ success: true, quantity: newQty });
  } catch (error: any) {
    return NextResponse.json(
      { message: error?.message || "Error updating quantity" },
      { status: 500 }
    );
  }
}
