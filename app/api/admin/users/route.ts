import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getAuthUser } from "@/lib/serverAuth";

export async function GET(request: Request) {
  try {
    const user = await getAuthUser(request);
    if (!user || user.role !== "admin") {
      return NextResponse.json({ message: "Admin access required" }, { status: 403 });
    }

    const users = await query<any>(
      "SELECT id, username, email, phone, role FROM User WHERE role != 'admin' ORDER BY id DESC"
    );

    const formatted = users.map((u) => ({
      ...u,
      _id: String(u.id),
    }));

    return NextResponse.json(formatted);
  } catch (error: any) {
    return NextResponse.json(
      { message: error?.message || "Failed to load users" },
      { status: 500 }
    );
  }
}
