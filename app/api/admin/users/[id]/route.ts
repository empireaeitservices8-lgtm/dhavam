import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { getAuthUser } from "@/lib/serverAuth";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function DELETE(request: Request, context: RouteParams) {
  try {
    const user = await getAuthUser(request);
    if (!user || user.role !== "admin") {
      return NextResponse.json({ message: "Admin access required" }, { status: 403 });
    }

    const { id } = await context.params;
    const userId = Number(id);

    await pool.execute("DELETE FROM User WHERE id = ? AND role != 'admin'", [userId]);
    return NextResponse.json({ success: true, message: "User deleted successfully" });
  } catch (error: any) {
    return NextResponse.json(
      { message: error?.message || "Failed to delete user" },
      { status: 500 }
    );
  }
}
