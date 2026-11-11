import { NextResponse } from "next/server";
import { query, pool } from "@/lib/db";
import { getAuthUser } from "@/lib/serverAuth";

export async function POST(request: Request) {
  const user = await getAuthUser(request);
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const conn = await pool.getConnection();

  try {
    const body = await request.json();
    const { username, phone, address, paymentMethod, items } = body;
    const method = /online/i.test(paymentMethod || "") ? "ONLINE" : "COD";

    await conn.beginTransaction();

    let lines: Array<{ productId: number; size: string; quantity: number; price: number }> = [];
    let fromCart = false;

    if (Array.isArray(items) && items.length) {
      for (const it of items) {
        const productId = Number(it.productId);
        const quantity = Math.max(1, Number(it.quantity || 1));
        const size = String(it.size || "").trim();

        const [psRows]: any = await conn.execute(
          "SELECT price FROM ProductSize WHERE productId = ? AND size = ? LIMIT 1",
          [productId, size]
        );
        if (!psRows.length) {
          throw new Error(`Size "${size}" is not available for product ${productId}.`);
        }
        lines.push({ productId, size, quantity, price: Number(psRows[0].price) });
      }
    } else {
      fromCart = true;
      const [cartRows]: any = await conn.execute(
        `SELECT ci.productId, ci.size, ci.quantity, ps.price
         FROM CartItem ci
         JOIN ProductSize ps ON ps.productId = ci.productId AND ps.size = ci.size
         WHERE ci.userId = ?`,
        [user.id]
      );
      lines = cartRows.map((c: any) => ({
        productId: c.productId,
        size: c.size,
        quantity: c.quantity,
        price: Number(c.price),
      }));
    }

    if (!lines.length) {
      throw new Error("Cart is empty.");
    }

    const total = lines.reduce((sum, l) => sum + l.price * l.quantity, 0);

    const [orderRes]: any = await conn.execute(
      "INSERT INTO `Order` (userId, customerName, phone, address, totalAmount, paymentMethod) VALUES (?,?,?,?,?,?)",
      [user.id, username ?? user.username, phone ?? user.phone ?? null, address ?? null, total, method]
    );
    const orderId = orderRes.insertId;

    for (const l of lines) {
      await conn.execute(
        "INSERT INTO OrderItem (orderId, productId, size, price, quantity) VALUES (?,?,?,?,?)",
        [orderId, l.productId, l.size, l.price, l.quantity]
      );
    }

    if (fromCart) {
      await conn.execute("DELETE FROM CartItem WHERE userId = ?", [user.id]);
    }

    await conn.commit();

    return NextResponse.json({
      id: orderId,
      _id: String(orderId),
      totalAmount: total,
      orderStatus: "Placed",
      paymentMethod: method,
      items: lines,
    });
  } catch (error: any) {
    await conn.rollback().catch(() => {});
    console.error("Order creation error:", error);
    return NextResponse.json(
      { message: error?.message || "Failed to place order" },
      { status: 400 }
    );
  } finally {
    conn.release();
  }
}
