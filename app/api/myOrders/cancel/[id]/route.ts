import { NextResponse } from "next/server";
import { query, pool } from "@/lib/db";
import { getAuthUser } from "@/lib/serverAuth";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PUT(request: Request, context: RouteParams) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const orderId = Number(id);

    const orders = await query<any>(
      "SELECT * FROM `Order` WHERE id = ? AND userId = ?",
      [orderId, user.id]
    );

    if (!orders.length) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    const order = orders[0];
    if (order.status === "DELIVERED" || order.status === "CANCELLED") {
      return NextResponse.json(
        { message: "Order cannot be cancelled at this stage." },
        { status: 400 }
      );
    }

    await pool.execute("UPDATE `Order` SET status = 'CANCELLED' WHERE id = ?", [orderId]);
    return NextResponse.json({ message: "Order cancelled successfully" });
  } catch (error: any) {
    return NextResponse.json(
      { message: error?.message || "Failed to cancel order" },
      { status: 500 }
    );
  }
}
