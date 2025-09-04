import { getNeonClient } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Tenta primeiro com a conexão pooled
    try {
      const sql = getNeonClient();
      const result = await sql`SELECT NOW() as time`;
      return NextResponse.json({
        success: true,
        message: "Conexão com Neon estabelecida (pooled)!",
        timestamp: result[0].time,
      });
    } catch (pooledError) {
      console.log("Erro na conexão pooled, tentando unpooled...", pooledError);
      
      // Se falhar, tenta com a conexão unpooled
      const sqlUnpooled = getNeonClient(true);
      const result = await sqlUnpooled`SELECT NOW() as time`;
      return NextResponse.json({
        success: true,
        message: "Conexão com Neon estabelecida (unpooled)!",
        timestamp: result[0].time,
      });
    }
  } catch (error) {
    console.error("Erro na conexão com o banco:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        details: process.env.NETLIFY_DATABASE_URL ? "URL configurada" : "URL não encontrada"
      },
      { status: 500 }
    );
  }
}
