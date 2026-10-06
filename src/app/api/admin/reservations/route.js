import { cookies } from "next/headers";
import { readDatabase } from "@/lib/storage";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("admin_session");

    if (session?.value !== "authenticated") {
      return Response.json(
        {
          success: false,
          message: "Unauthorized.",
        },
        { status: 401 }
      );
    }

    const db = readDatabase();

    return Response.json({
      success: true,
      reservations: db.reservations || [],
    });

  } catch (error) {
    console.error(error);

    return Response.json(
      {
        success: false,
        message: "Failed to load reservations.",
      },
      { status: 500 }
    );
  }
}