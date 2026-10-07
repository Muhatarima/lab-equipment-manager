import { cookies } from "next/headers";
import {
  readDatabase,
  writeDatabase,
} from "@/lib/storage";

export const dynamic = "force-dynamic";

export async function POST(request) {
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

    const { id, status, rejectNote } =
      await request.json();

    if (
      !id ||
      !["approved", "rejected"].includes(status)
    ) {
      return Response.json(
        {
          success: false,
          message: "Invalid request.",
        },
        { status: 400 }
      );
    }

    const db = readDatabase();

    const reservation =
      db.reservations.find(
        (item) => item.id === id
      );

    if (!reservation) {
      return Response.json(
        {
          success: false,
          message: "Reservation not found.",
        },
        { status: 404 }
      );
    }

    if (status === "approved") {
      const hasOverlap =
        db.reservations.some((item) => {
          if (item.id === reservation.id) {
            return false;
          }

          if (item.status !== "approved") {
            return false;
          }

          if (
            item.equipment !==
            reservation.equipment
          ) {
            return false;
          }

          if (item.date !== reservation.date) {
            return false;
          }

          const existingStart =
            timeToMinutes(item.startTime);

          const existingEnd =
            timeToMinutes(item.endTime);

          const newStart =
            timeToMinutes(
              reservation.startTime
            );

          const newEnd =
            timeToMinutes(
              reservation.endTime
            );

          return (
            newStart < existingEnd &&
            newEnd > existingStart
          );
        });

      if (hasOverlap) {
        return Response.json(
          {
            success: false,
            message:
              "Cannot approve. This equipment already has an approved reservation during that time.",
          },
          { status: 409 }
        );
      }
    }

    reservation.status = status;

    if (status === "rejected") {
      reservation.rejectNote =
        rejectNote?.trim() ||
        "Reservation rejected.";
    } else {
      delete reservation.rejectNote;
    }

    reservation.updatedAt =
      new Date().toISOString();

    writeDatabase(db);

    return Response.json({
      success: true,
      message:
        status === "approved"
          ? "Reservation approved."
          : "Reservation rejected.",
      reservation,
    });

  } catch (error) {
    console.error(error);

    return Response.json(
      {
        success: false,
        message:
          "Failed to update reservation.",
      },
      { status: 500 }
    );
  }
}

function timeToMinutes(time) {
  const [hours, minutes] =
    time.split(":").map(Number);

  return hours * 60 + minutes;
}