import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { query } from "@/lib/db";
import { signToken } from "@/lib/serverAuth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const identifier = (body.email || body.username || "").trim();
    const password = body.password;

    if (!identifier || !password) {
      return NextResponse.json(
        { message: "Username or email and password are required" },
        { status: 400 }
      );
    }

    const users = await query<any>(
      "SELECT * FROM User WHERE LOWER(email) = LOWER(?) OR LOWER(username) = LOWER(?) LIMIT 1",
      [identifier, identifier]
    );

    const user = users[0];
    if (!user) {
      return NextResponse.json(
        { message: "Invalid username or email" },
        { status: 401 }
      );
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return NextResponse.json(
        { message: "Incorrect password" },
        { status: 401 }
      );
    }

    const token = signToken({ email: user.email, role: user.role });
    const { password: _, ...userInfo } = user;

    return NextResponse.json({ user: userInfo, token });
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json(
      { message: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
