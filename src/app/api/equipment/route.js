import { readDatabase } from "@/lib/storage";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const db = readDatabase();

    return Response.json(
      {
        success: true,
        equipment: db.equipment || [],
      },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  } catch (error) {
    console.error("Failed to load equipment:", error);

    return Response.json(
      {
        success: false,
        message: "Failed to load equipment.",
      },
      { status: 500 }
    );
  }
}
