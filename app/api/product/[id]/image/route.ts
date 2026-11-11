import { NextResponse } from "next/server";
import { query } from "@/lib/db";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, context: RouteParams) {
  try {
    const { id } = await context.params;
    const numericId = Number(id);

    const rows = await query<any>(
      "SELECT imageData, imageType FROM Product WHERE id = ?",
      [numericId]
    );

    if (!rows.length || !rows[0].imageData) {
      return new NextResponse("Image not found", { status: 404 });
    }

    const imageBuffer = rows[0].imageData;
    const contentType = rows[0].imageType || "image/jpeg";

    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=43200",
      },
    });
  } catch (error: any) {
    return new NextResponse("Error fetching image", { status: 500 });
  }
}
