import { readDatabase } from "@/lib/storage";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    const trackingCode = searchParams
      .get("trackingCode")
      ?.trim()
      .toUpperCase();

    if (!trackingCode) {
      return Response.json(
        {
          success: false,
          message: "Tracking code is required.",
        },
        { status: 400 }
      );
    }

    const db = readDatabase();

    const reservation = (db.reservations || []).find(
      (item) =>
        item.trackingCode?.toUpperCase() === trackingCode
    );

    if (!reservation) {
      return Response.json(
        {
          success: false,
          message: "Reservation not found. Please check your tracking code.",
        },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      reservation,
    });

  } catch (error) {
    console.error(error);

    return Response.json(
      {
        success: false,
        message: "Failed to check reservation status.",
      },
      { status: 500 }
    );
  }
}