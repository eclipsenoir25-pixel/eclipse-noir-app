import { NextResponse } from "next/server";
import { readDB, writeDB } from "@/lib/db";
import { randomUUID } from "crypto";

export async function POST(req: Request) {
  const body = await req.json();

  const { name, surname, phone, eventId, guests } = body;

  const db = readDB();

  const newRequest = {
    id: randomUUID(),
    eventId,
    name,
    surname,
    phone,
    guests: guests || [],
    status: "pending", // pending / approved / declined
    createdAt: new Date().toISOString()
  };

  db.requests.push(newRequest);
  writeDB(db);

  return NextResponse.json({ success: true, request: newRequest });
}
