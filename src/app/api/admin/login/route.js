import { cookies } from "next/headers";

export async function POST(request) {
  try {
    const { password } = await request.json();

    if (!password) {
      return Response.json(
        {
          success: false,
          message: "Password is required.",
        },
        { status: 400 }
      );
    }

    if (password !== process.env.ADMIN_PASSWORD) {
      return Response.json(
        {
          success: false,
          message: "Invalid admin password.",
        },
        { status: 401 }
      );
    }

    const cookieStore = await cookies();

    cookieStore.set("admin_session", "authenticated", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 8,
    });

    return Response.json({
      success: true,
      message: "Login successful.",
    });

  } catch (error) {
    console.error(error);

    return Response.json(
      {
        success: false,
        message: "Login failed.",
      },
      { status: 500 }
    );
  }
}