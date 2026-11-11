import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { query, pool } from "@/lib/db";
import { signToken } from "@/lib/serverAuth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, email, password, phone } = body;

    if (!email?.trim() || !password) {
      return NextResponse.json(
        { message: "Email and password are required" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existing = await query("SELECT id FROM User WHERE email = ?", [normalizedEmail]);
    if (existing.length) {
      return NextResponse.json(
        { message: "User already exists with this email" },
        { status: 409 }
      );
    }

    const hashed = await bcrypt.hash(password, 10);
    const [result]: any = await pool.execute(
      "INSERT INTO User (username, email, password, phone, role) VALUES (?,?,?,?, 'user')",
      [username?.trim() ?? null, normalizedEmail, hashed, phone?.trim() ?? null]
    );

    const users = await query<any>(
      "SELECT id, email, username, phone, role FROM User WHERE id = ?",
      [result.insertId]
    );
    const user = users[0];

    const token = signToken({ email: user.email, role: user.role });
    return NextResponse.json({ user, token }, { status: 201 });
  } catch (error: any) {
    console.error("Register error:", error);
    return NextResponse.json(
      { message: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
