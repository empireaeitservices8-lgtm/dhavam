import { NextResponse } from "next/server";
import { query, pool } from "@/lib/db";
import { getAuthUser } from "@/lib/serverAuth";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, context: RouteParams) {
  try {
    const { id } = await context.params;
    const numericId = Number(id);

    const products = await query<any>(
      "SELECT id, name, description, category, imageUrl FROM Product WHERE id = ?",
      [numericId]
    );

    if (!products.length) {
      return NextResponse.json({ message: "Product not found" }, { status: 404 });
    }

    const product = products[0];
    const sizes = await query<any>(
      "SELECT id, size, price FROM ProductSize WHERE productId = ? ORDER BY id",
      [numericId]
    );

    const url = product.imageUrl || `/api/product/${product.id}/image`;
    const formatted = {
      ...product,
      _id: String(product.id),
      group: String(product.category || "").toLowerCase(),
      imageUrl: url,
      image: url,
      sizes: sizes.map((s) => ({
        id: s.id,
        size: s.size,
        price: Number(s.price),
      })),
    };

    return NextResponse.json(formatted);
  } catch (error: any) {
    return NextResponse.json(
      { message: error?.message || "Error fetching product" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request, context: RouteParams) {
  try {
    const user = await getAuthUser(request);
    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { message: "Admin access required" },
        { status: 403 }
      );
    }

    const { id } = await context.params;
    const productId = Number(id);

    const contentType = request.headers.get("content-type") || "";
    let name = "";
    let description = "";
    let category = "WHOLE";
    let sizes: any[] = [];
    let imageBuffer: Buffer | null = null;
    let imageType: string | null = null;

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      name = (formData.get("name") as string) || "";
      description = (formData.get("description") as string) || "";
      const groupVal = (formData.get("group") as string) || "WHOLE";
      category = groupVal.toUpperCase();

      const sizesRaw = formData.get("sizes");
      if (typeof sizesRaw === "string") {
        try {
          sizes = JSON.parse(sizesRaw);
        } catch {
          sizes = [];
        }
      }

      const file = formData.get("image") as File | null;
      if (file && typeof file === "object" && file.size > 0) {
        const bytes = await file.arrayBuffer();
        imageBuffer = Buffer.from(bytes);
        imageType = file.type || "image/jpeg";
      }
    } else {
      const json = await request.json();
      name = json.name || "";
      description = json.description || "";
      category = (json.group || json.category || "WHOLE").toUpperCase();
      sizes = json.sizes || [];
    }

    if (name.trim()) {
      await pool.execute("UPDATE Product SET name = ? WHERE id = ?", [name.trim(), productId]);
    }
    if (description.trim()) {
      await pool.execute("UPDATE Product SET description = ? WHERE id = ?", [description.trim(), productId]);
    }
    if (["WHOLE", "GROUND", "COMBO"].includes(category)) {
      await pool.execute("UPDATE Product SET category = ? WHERE id = ?", [category, productId]);
    }

    if (imageBuffer) {
      await pool.execute(
        "UPDATE Product SET imageData = ?, imageType = ?, imageUrl = ? WHERE id = ?",
        [imageBuffer, imageType, `/api/product/${productId}/image`, productId]
      );
    }

    if (Array.isArray(sizes) && sizes.length > 0) {
      await pool.execute("DELETE FROM ProductSize WHERE productId = ?", [productId]);
      for (const s of sizes) {
        if (s && s.size && Number(s.price) >= 0) {
          await pool.execute(
            "INSERT INTO ProductSize (productId, size, price) VALUES (?, ?, ?)",
            [productId, String(s.size).trim(), Number(s.price)]
          );
        }
      }
    }

    const updated = await query<any>(
      "SELECT id, name, description, category, imageUrl FROM Product WHERE id = ?",
      [productId]
    );
    const updatedSizes = await query<any>(
      "SELECT id, size, price FROM ProductSize WHERE productId = ?",
      [productId]
    );

    const product = updated[0];
    const url = product?.imageUrl || `/api/product/${productId}/image`;
    return NextResponse.json({
      message: "Product updated successfully.",
      product: {
        ...product,
        _id: String(product?.id),
        group: String(product?.category || "").toLowerCase(),
        imageUrl: url,
        image: url,
        sizes: updatedSizes.map((s) => ({ id: s.id, size: s.size, price: Number(s.price) })),
      },
    });
  } catch (error: any) {
    console.error("Update product error:", error);
    return NextResponse.json(
      { message: error?.message || "Failed to update product" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, context: RouteParams) {
  try {
    const user = await getAuthUser(request);
    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { message: "Admin access required" },
        { status: 403 }
      );
    }

    const { id } = await context.params;
    const productId = Number(id);

    await pool.execute("DELETE FROM ProductSize WHERE productId = ?", [productId]);
    await pool.execute("DELETE FROM Product WHERE id = ?", [productId]);

    return NextResponse.json({
      message: "Product deleted successfully.",
      productId,
    });
  } catch (error: any) {
    console.error("Delete product error:", error);
    return NextResponse.json(
      { message: error?.message || "Failed to delete product" },
      { status: 500 }
    );
  }
}
