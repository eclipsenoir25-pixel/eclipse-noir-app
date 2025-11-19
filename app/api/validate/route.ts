import { NextResponse } from "next/server";
import { readDB, writeDB } from "@/lib/db";

export async function POST(req: Request) {
  const { token } = await req.json();

  const db = readDB();

  const request = db.requests.find((r: any) => r.qrToken === token);

  if (!request) {
    return NextResponse.json({ error: "Invalid token" }, { status: 400 });
  }

  // Se già usato → non entra
  if (request.used) {
    return NextResponse.json({ error: "Token already used" }, { status: 400 });
  }

  // Segna come utilizzato
  request.used = true;
  request.usedAt = new Date().toISOString();

  writeDB(db);

  return NextResponse.json({ success: true, message: "Valid QR" });
}
