import { NextResponse } from "next/server";
import { query, pool } from "@/lib/db";
import { getAuthUser } from "@/lib/serverAuth";

export async function GET(request: Request) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const rows = await query<any>(
      "SELECT id, username, email, phone, role FROM User WHERE id = ?",
      [user.id]
    );

    if (!rows.length) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json(rows[0]);
  } catch (error: any) {
    return NextResponse.json(
      { message: error?.message || "Failed to load profile" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { username, phone } = body;

    if (username?.trim()) {
      await pool.execute("UPDATE User SET username = ? WHERE id = ?", [username.trim(), user.id]);
    }
    if (phone !== undefined) {
      await pool.execute("UPDATE User SET phone = ? WHERE id = ?", [phone?.trim() ?? null, user.id]);
    }

    const rows = await query<any>(
      "SELECT id, username, email, phone, role FROM User WHERE id = ?",
      [user.id]
    );

    return NextResponse.json(rows[0]);
  } catch (error: any) {
    return NextResponse.json(
      { message: error?.message || "Failed to update profile" },
      { status: 500 }
    );
  }
}
