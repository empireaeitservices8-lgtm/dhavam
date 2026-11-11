import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getAuthUser } from "@/lib/serverAuth";

const STATUS_MAP: Record<string, string> = {
  PENDING: "Placed",
  CONFIRMED: "Confirmed",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

export async function GET(request: Request) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const orders = await query<any>(
      `SELECT o.*, u.email AS userMail, u.username AS accountName
       FROM \`Order\` o
       JOIN User u ON u.id = o.userId
       WHERE o.userId = ?
       ORDER BY o.createdAt DESC`,
      [user.id]
    );

    if (!orders.length) {
      return NextResponse.json([]);
    }

    const ids = orders.map((o) => o.id);
    const placeholders = ids.map(() => "?").join(",");
    const items = await query<any>(
      `SELECT oi.id, oi.orderId, oi.productId, oi.size, oi.price, oi.quantity,
              p.name AS productName, p.imageUrl AS productImage
       FROM OrderItem oi
       LEFT JOIN Product p ON p.id = oi.productId
       WHERE oi.orderId IN (${placeholders})`,
      ids
    );

    const itemsByOrder = new Map<number, any[]>();
    for (const i of items) {
      if (!itemsByOrder.has(i.orderId)) itemsByOrder.set(i.orderId, []);
      itemsByOrder.get(i.orderId)!.push({
        ...i,
        price: Number(i.price),
        productName: i.productName || "Removed product",
        productImage: i.productImage || `/api/product/${i.productId}/image`,
      });
    }

    const formatted = orders.map((o) => ({
      ...o,
      _id: String(o.id),
      totalAmount: Number(o.totalAmount),
      orderStatus: STATUS_MAP[o.status] || o.status,
      username: o.customerName || o.accountName || "",
      items: itemsByOrder.get(o.id) || [],
    }));

    return NextResponse.json(formatted);
  } catch (error: any) {
    console.error("Fetch orders error:", error);
    return NextResponse.json(
      { message: error?.message || "Failed to load orders" },
      { status: 500 }
    );
  }
}
