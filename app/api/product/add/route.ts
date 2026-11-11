import { NextResponse } from "next/server";
import { query, pool } from "@/lib/db";
import { getAuthUser } from "@/lib/serverAuth";

export async function POST(request: Request) {
  try {
    const user = await getAuthUser(request);
    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { message: "Admin access required" },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const name = (formData.get("name") as string || "").trim();
    const description = (formData.get("description") as string || "").trim();
    const groupVal = (formData.get("group") as string || "WHOLE").toUpperCase();
    const sizesRaw = formData.get("sizes");
    const file = formData.get("image") as File | null;

    if (!name || !description) {
      return NextResponse.json(
        { message: "Name and description are required." },
        { status: 400 }
      );
    }

    const category = ["WHOLE", "GROUND", "COMBO"].includes(groupVal)
      ? groupVal
      : "WHOLE";

    let sizes: any[] = [];
    if (typeof sizesRaw === "string") {
      try {
        sizes = JSON.parse(sizesRaw);
      } catch {
        sizes = [];
      }
    }

    if (!sizes.length) {
      return NextResponse.json(
        { message: "At least one size with a price is required." },
        { status: 400 }
      );
    }

    let imageBuffer: Buffer | null = null;
    let imageType = "image/jpeg";
    if (file && typeof file === "object" && file.size > 0) {
      const bytes = await file.arrayBuffer();
      imageBuffer = Buffer.from(bytes);
      imageType = file.type || "image/jpeg";
    }

    const [res]: any = await pool.execute(
      "INSERT INTO Product (name, description, category, imageData, imageType) VALUES (?,?,?,?,?)",
      [name, description, category, imageBuffer, imageType]
    );
    const productId = res.insertId;

    const imageUrl = `/api/product/${productId}/image`;
    await pool.execute("UPDATE Product SET imageUrl = ? WHERE id = ?", [imageUrl, productId]);

    for (const s of sizes) {
      if (s && s.size && Number(s.price) >= 0) {
        await pool.execute(
          "INSERT INTO ProductSize (productId, size, price) VALUES (?, ?, ?)",
          [productId, String(s.size).trim(), Number(s.price)]
        );
      }
    }

    const createdSizes = await query<any>(
      "SELECT id, size, price FROM ProductSize WHERE productId = ?",
      [productId]
    );

    return NextResponse.json(
      {
        id: productId,
        _id: String(productId),
        name,
        description,
        category,
        group: category.toLowerCase(),
        imageUrl,
        image: imageUrl,
        sizes: createdSizes.map((s) => ({ id: s.id, size: s.size, price: Number(s.price) })),
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Add product error:", error);
    return NextResponse.json(
      { message: error?.message || "Failed to add product" },
      { status: 500 }
    );
  }
}
