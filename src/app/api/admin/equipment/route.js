import { cookies } from "next/headers";
import { readDatabase, writeDatabase } from "@/lib/storage";

export const dynamic = "force-dynamic";

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

    const data = await request.json();

    const name = data.name?.trim();
    const category = data.category?.trim();
    const shortName = data.shortName?.trim() || name;
    const type = data.type?.trim() || "custom";
    const icon = data.icon?.trim() || "🔬";

    if (!name) {
      return Response.json(
        {
          success: false,
          message: "Equipment name is required.",
        },
        { status: 400 }
      );
    }

    if (!category) {
      return Response.json(
        {
          success: false,
          message: "Equipment category is required.",
        },
        { status: 400 }
      );
    }

    const db = readDatabase();

    const alreadyExists = (db.equipment || []).some(
      (item) => item.name.toLowerCase() === name.toLowerCase()
    );

    if (alreadyExists) {
      return Response.json(
        {
          success: false,
          message: "An equipment with this name already exists.",
        },
        { status: 409 }
      );
    }

    const newEquipment = {
      id: `eq-${Date.now()}`,
      name,
      category,
      shortName,
      type,
      icon,
      isDefault: false,
      createdAt: new Date().toISOString(),
    };

    if (!Array.isArray(db.equipment)) {
      db.equipment = [];
    }

    db.equipment.push(newEquipment);

    writeDatabase(db);

    return Response.json(
      {
        success: true,
        message: "Equipment added successfully.",
        equipment: newEquipment,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error adding equipment:", error);

    return Response.json(
      {
        success: false,
        message: "Failed to add equipment.",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
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

    const { id } = await request.json();

    if (!id) {
      return Response.json(
        {
          success: false,
          message: "Equipment ID is required.",
        },
        { status: 400 }
      );
    }

    const db = readDatabase();

    const initialLength = (db.equipment || []).length;
    db.equipment = (db.equipment || []).filter((item) => item.id !== id);

    if (db.equipment.length === initialLength) {
      return Response.json(
        {
          success: false,
          message: "Equipment not found.",
        },
        { status: 404 }
      );
    }

    writeDatabase(db);

    return Response.json({
      success: true,
      message: "Equipment removed successfully.",
    });
  } catch (error) {
    console.error("Error deleting equipment:", error);

    return Response.json(
      {
        success: false,
        message: "Failed to delete equipment.",
      },
      { status: 500 }
    );
  }
}
