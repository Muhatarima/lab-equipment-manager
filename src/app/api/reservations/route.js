import { readDatabase, writeDatabase } from "@/lib/storage";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const db = readDatabase();

    return Response.json(
      {
        success: true,
        reservations: db.reservations || [],
        equipment: db.equipment || [],
      },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
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

export async function POST(request) {
  try {
    const data = await request.json();

    const requiredFields = [
      "name",
      "studentId",
      "equipment",
      "date",
      "startTime",
      "endTime",
      "purpose",
    ];

    for (const field of requiredFields) {
      if (
        !data[field] ||
        String(data[field]).trim() === ""
      ) {
        return Response.json(
          {
            success: false,
            message: `${field} is required.`,
          },
          { status: 400 }
        );
      }
    }

    const db = readDatabase();
    const validEquipmentNames = (db.equipment || []).map((e) => e.name);

    if (!validEquipmentNames.includes(data.equipment)) {
      return Response.json(
        {
          success: false,
          message: "Invalid equipment selected.",
        },
        { status: 400 }
      );
    }

    const startMinutes = timeToMinutes(
      data.startTime
    );

    const endMinutes = timeToMinutes(
      data.endTime
    );

    if (
      startMinutes === null ||
      endMinutes === null
    ) {
      return Response.json(
        {
          success: false,
          message: "Invalid time.",
        },
        { status: 400 }
      );
    }

    if (endMinutes <= startMinutes) {
      return Response.json(
        {
          success: false,
          message:
            "End time must be later than start time.",
        },
        { status: 400 }
      );
    }

    const selectedDate = new Date(
      `${data.date}T00:00:00`
    );

    if (Number.isNaN(selectedDate.getTime())) {
      return Response.json(
        {
          success: false,
          message: "Invalid date.",
        },
        { status: 400 }
      );
    }

    const reservation = {
      id: Date.now(),

      trackingCode: `LAB-${Math.random()
        .toString(36)
        .substring(2, 7)
        .toUpperCase()}`,

      name: String(data.name).trim(),

      studentId: String(
        data.studentId
      ).trim(),

      equipment: data.equipment,

      date: data.date,

      startTime: data.startTime,

      endTime: data.endTime,

      purpose: String(
        data.purpose
      ).trim(),

      status: "pending",

      createdAt:
        new Date().toISOString(),
    };

    db.reservations.push(reservation);

    writeDatabase(db);

    return Response.json(
      {
        success: true,
        message:
          "Reservation request submitted.",
        trackingCode:
          reservation.trackingCode,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);

    return Response.json(
      {
        success: false,
        message:
          "Failed to save reservation.",
      },
      { status: 500 }
    );
  }
}

function timeToMinutes(time) {
  if (
    typeof time !== "string" ||
    !/^\d{2}:\d{2}$/.test(time)
  ) {
    return null;
  }

  const [hours, minutes] =
    time.split(":").map(Number);

  if (
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    return null;
  }

  return hours * 60 + minutes;
}