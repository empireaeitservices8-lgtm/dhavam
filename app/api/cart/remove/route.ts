import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { getAuthUser } from "@/lib/serverAuth";

export async function DELETE(request: Request) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await pool.execute("DELETE FROM CartItem WHERE userId = ?", [user.id]);
    return NextResponse.json({ success: true, message: "All cart items removed" });
  } catch (error: any) {
    return NextResponse.json(
      { message: error?.message || "Error clearing cart" },
      { status: 500 }
    );
  }
}
