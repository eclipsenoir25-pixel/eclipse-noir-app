import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb'; // ⬅️ qui ora usiamo l'export giusto

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    let { code } = body as { code?: string };

    if (!code) {
      return NextResponse.json(
        { status: 'invalid', message: 'Codice mancante' },
        { status: 400 }
      );
    }

    // Se il QR contiene una URL tipo https://.../ticket?c=EN-XXXX
    const urlMatch = code.match(/[?&]c=([^&]+)/);
    if (urlMatch) {
      code = decodeURIComponent(urlMatch[1]);
    }

    // ⬇️ ci connettiamo al DB con la tua funzione esistente
    const { db } = await connectToDatabase();
    const requests = db.collection('requests');

    const request = await requests.findOne({ code });

    if (!request) {
      return NextResponse.json(
        {
          status: 'invalid',
          message: 'QR NON VALIDO: nessuna richiesta trovata.',
        },
        { status: 404 }
      );
    }

    if (request.status !== 'approved') {
      return NextResponse.json(
        {
          status: 'invalid',
          message: `QR NON VALIDO: stato attuale "${request.status}".`,
        },
        { status: 400 }
      );
    }

    if (request.usedAt) {
      return NextResponse.json({
        status: 'already_used',
        message: 'QR GIÀ UTILIZZATO.',
        guestName: request.guestName,
        eventLabel: request.eventLabel,
        usedAt: request.usedAt,
      });
    }

    const now = new Date();

    await requests.updateOne(
      { _id: request._id },
      { $set: { usedAt: now } }
    );

    return NextResponse.json({
      status: 'ok',
      message: 'INGRESSO OK.',
      guestName: request.guestName,
      eventLabel: request.eventLabel,
      usedAt: now,
    });
  } catch (err) {
    console.error('Errore in /api/scan', err);
    return NextResponse.json(
      { status: 'error', message: 'Errore interno.' },
      { status: 500 }
    );
  }
}
