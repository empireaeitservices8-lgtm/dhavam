import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { getAuthUser } from "@/lib/serverAuth";

interface RouteParams {
  params: Promise<{ cartId: string }>;
}

export async function DELETE(request: Request, context: RouteParams) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { cartId } = await context.params;
    const numericId = Number(cartId);

    await pool.execute("DELETE FROM CartItem WHERE id = ? AND userId = ?", [
      numericId,
      user.id,
    ]);

    return NextResponse.json({ success: true, message: "Item removed" });
  } catch (error: any) {
    return NextResponse.json(
      { message: error?.message || "Error removing cart item" },
      { status: 500 }
    );
  }
}
