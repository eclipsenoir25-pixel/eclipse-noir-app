import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

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

    // normalizza un po' il testo
    code = code.trim();

    // 1) Se il QR è una URL tipo ...?c=EN-XXXXXX
    const urlMatch = code.match(/[?&]c=([^&]+)/);
    if (urlMatch) {
      code = decodeURIComponent(urlMatch[1]).trim();
    }

    const { db } = await connectToDatabase();
    const requests = db.collection('requests');

    let request: any = null;

    // 2) Prova prima a cercare per campo "code"
    request = await requests.findOne({ code });

    // 3) Se non trovato, prova a capire se dentro c'è "ID:xxxxxxxxxxxxxxxxxxxxxxxx"
    if (!request) {
      const idMatch = code.match(/ID:([0-9a-fA-F]{24})/);
      if (idMatch) {
        const objectId = new ObjectId(idMatch[1].toLowerCase());
        request = await requests.findOne({ _id: objectId });
      }
    }

    // 4) Se ancora niente, prova se il codice È direttamente un ObjectId
    if (!request && /^[0-9a-fA-F]{24}$/.test(code)) {
      const objectId = new ObjectId(code.toLowerCase());
      request = await requests.findOne({ _id: objectId });
    }

    // 5) Nessuna richiesta trovata
    if (!request) {
      return NextResponse.json(
        {
          status: 'invalid',
          message: 'QR NON VALIDO: nessuna richiesta trovata.',
        },
        { status: 404 }
      );
    }

    // 6) Controllo stato
    if (request.status !== 'approved') {
      return NextResponse.json(
        {
          status: 'invalid',
          message: `QR NON VALIDO: stato attuale "${request.status}".`,
        },
        { status: 400 }
      );
    }

    // 7) QR già usato
    if (request.usedAt) {
      return NextResponse.json({
        status: 'already_used',
        message: 'QR GIÀ UTILIZZATO.',
        guestName: request.guestName,
        eventLabel: request.eventLabel,
        usedAt: request.usedAt,
      });
    }

    // 8) Segna ingresso
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
