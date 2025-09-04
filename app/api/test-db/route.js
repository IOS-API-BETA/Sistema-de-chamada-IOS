import { getNeonClient } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const sql = getNeonClient();
    const result = await sql`SELECT NOW()`;

    return NextResponse.json({
      success: true,
      message: "Conexão com Neon estabelecida!",
      timestamp: result[0].now,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
