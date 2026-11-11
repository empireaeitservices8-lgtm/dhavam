import { NextResponse } from "next/server";
import { query, pool } from "@/lib/db";
import { getAuthUser } from "@/lib/serverAuth";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PUT(request: Request, context: RouteParams) {
  try {
    const user = await getAuthUser(request);
    if (!user || user.role !== "admin") {
      return NextResponse.json({ message: "Admin access required" }, { status: 403 });
    }

    const { id } = await context.params;
    const orderId = Number(id);

    const body = await request.json();
    const statusInput = String(body.status || "").trim().toUpperCase();

    let dbStatus = "";
    if (statusInput === "SHIPPED") dbStatus = "SHIPPED";
    else if (statusInput === "DELIVERED") dbStatus = "DELIVERED";
    else if (statusInput === "CONFIRMED") dbStatus = "CONFIRMED";
    else if (statusInput === "CANCELLED") dbStatus = "CANCELLED";
    else {
      return NextResponse.json({ message: "Invalid status" }, { status: 400 });
    }

    const orders = await query<any>("SELECT * FROM `Order` WHERE id = ?", [orderId]);
    if (!orders.length) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    await pool.execute("UPDATE `Order` SET status = ? WHERE id = ?", [dbStatus, orderId]);
    return NextResponse.json({ message: "Order status updated", status: dbStatus });
  } catch (error: any) {
    return NextResponse.json(
      { message: error?.message || "Failed to update status" },
      { status: 500 }
    );
  }
}
