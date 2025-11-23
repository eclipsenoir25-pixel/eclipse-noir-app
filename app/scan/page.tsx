'use client';

import { useState } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';

type ScanStatus = 'idle' | 'loading' | 'ok' | 'already_used' | 'invalid' | 'error';

const SCAN_PIN = process.env.NEXT_PUBLIC_SCAN_PIN || '2222';

export default function ScanPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [pin, setPin] = useState('');
  const [status, setStatus] = useState<ScanStatus>('idle');
  const [message, setMessage] = useState<string>('');
  const [lastGuest, setLastGuest] = useState<string | null>(null);
  const [lastEvent, setLastEvent] = useState<string | null>(null);
  const [codeInput, setCodeInput] = useState<string>('');
  const [lastScannedCode, setLastScannedCode] = useState<string>(''); // 👈 DEBUG: ultimo QR letto

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === SCAN_PIN) {
      setAuthenticated(true);
      setPin('');
    } else {
      alert('PIN errato');
    }
  };

  // chiamata alla nostra API /api/scan
  const verifyCode = async (code: string) => {
    if (!code.trim()) return;

    const cleanedCode = code.trim();
    setStatus('loading');
    setMessage('Verifica in corso...');
    setLastGuest(null);
    setLastEvent(null);
    setLastScannedCode(cleanedCode); // 👈 mostriamo cosa stiamo davvero mandando alla API

    try {
      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: cleanedCode }),
      });

      const data = await res.json();

      if (data.status === 'ok') {
        setStatus('ok');
        setMessage(data.message || 'INGRESSO OK');
        setLastGuest(data.guestName || null);
        setLastEvent(data.eventLabel || null);
      } else if (data.status === 'already_used') {
        setStatus('already_used');
        setMessage(data.message || 'QR GIÀ UTILIZZATO');
        setLastGuest(data.guestName || null);
        setLastEvent(data.eventLabel || null);
      } else if (data.status === 'invalid') {
        setStatus('invalid');
        setMessage(data.message || 'QR NON VALIDO');
      } else {
        setStatus('error');
        setMessage(data.message || 'Errore');
      }
    } catch (err) {
      console.error(err);
      setStatus('error');
      setMessage('Errore di rete o server.');
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!codeInput.trim()) {
      alert('Inserisci un codice o scansiona il QR.');
      return;
    }
    await verifyCode(codeInput);
  };

  const handleScanFromCamera = async (codes: any[]) => {
    if (!codes || codes.length === 0) return;

    // la libreria passa un array di codici, prendiamo il primo
    const raw =
      codes[0]?.rawValue ||
      codes[0]?.value ||
      (typeof codes[0] === 'string' ? codes[0] : '');

    if (!raw) return;

    // evitiamo di spammare richieste mentre è in loading
    if (status === 'loading') return;

    await verifyCode(raw);
  };

  const handleCameraError = (error: any) => {
    console.error('Errore lettore QR:', error);
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-neutral-100">
        <form
          onSubmit={handlePinSubmit}
          className="bg-neutral-900 border border-neutral-700 rounded-2xl p-6 w-full max-w-xs flex flex-col gap-4"
        >
          <h1 className="text-xl font-semibold text-center">Accesso Staff</h1>
          <p className="text-sm text-neutral-400 text-center">
            Inserisci il PIN per accedere al controllo ingressi.
          </p>
          <input
            type="password"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            className="w-full rounded-lg bg-black border border-neutral-700 px-3 py-2 outline-none focus:border-emerald-500"
            placeholder="PIN"
          />
          <button
            type="submit"
            className="w-full rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-semibold py-2 transition"
          >
            Entra
          </button>
        </form>
      </div>
    );
  }

  const statusColor =
    status === 'ok'
      ? 'text-emerald-400'
      : status === 'already_used'
      ? 'text-amber-400'
      : status === 'invalid' || status === 'error'
      ? 'text-red-400'
      : 'text-neutral-300';

  const statusLabel =
    status === 'ok'
      ? 'INGRESSO OK'
      : status === 'already_used'
      ? 'QR GIÀ UTILIZZATO'
      : status === 'invalid'
      ? 'QR NON VALIDO'
      : status === 'loading'
      ? 'VERIFICA...'
      : 'PRONTO';

  return (
    <div className="min-h-screen flex flex-col bg-black text-neutral-100">
      <header className="px-4 py-3 border-b border-neutral-800 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold tracking-wide">
            Eclipse Noir – Ingresso
          </h1>
          <p className="text-xs text-neutral-500">Controllo biglietti</p>
        </div>
        <button
          className="text-xs text-neutral-500 underline"
          onClick={() => setAuthenticated(false)}
        >
          Esci
        </button>
      </header>

      <main className="flex-1 flex flex-col md:flex-row">
        {/* Colonna sinistra: camera + input manuale */}
        <div className="flex-1 flex flex-col items-center justify-center p-4 gap-4">
          <div className="w-full max-w-md aspect-[3/4] rounded-2xl overflow-hidden border border-neutral-800 bg-neutral-900/60">
            <Scanner
              onScan={handleScanFromCamera}
              onError={handleCameraError}
              styles={{ container: { width: '100%', height: '100%' } }}
            />
          </div>

          <form
            onSubmit={handleManualSubmit}
            className="w-full max-w-md bg-neutral-900/70 border border-neutral-800 rounded-2xl p-4 flex flex-col gap-4"
          >
            <label className="text-sm text-neutral-300 flex flex-col gap-2">
              <span className="text-xs uppercase tracking-[0.2em] text-neutral-500">
                Codice / QR (fallback)
              </span>
              <input
                type="text"
                value={codeInput}
                onChange={(e) => setCodeInput(e.target.value)}
                className="w-full rounded-lg bg-black border border-neutral-700 px-3 py-2 outline-none focus:border-emerald-500 text-sm"
                placeholder="Inserisci il codice EN-XXXXXXX o il contenuto del QR"
              />
            </label>
            <button
              type="submit"
              className="w-full rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-semibold py-2 transition"
            >
              Verifica ingresso
            </button>
          </form>
        </div>

        {/* Colonna destra: stato */}
        <div className="w-full md:w-80 border-t md:border-t-0 md:border-l border-neutral-800 p-4 flex flex-col gap-3">
          <div>
            <p className="text-xs text-neutral-500 uppercase tracking-[0.2em]">
              Stato
            </p>
            <p className={`text-2xl font-bold mt-1 ${statusColor}`}>
              {statusLabel}
            </p>
          </div>

          {message && (
            <p className="text-sm text-neutral-300">
              {message}
            </p>
          )}

          {lastGuest && (
            <div className="mt-2">
              <p className="text-xs text-neutral-500 uppercase tracking-[0.2em]">
                Ospite
              </p>
              <p className="text-lg font-semibold">{lastGuest}</p>
            </div>
          )}

          {lastEvent && (
            <div className="mt-2">
              <p className="text-xs text-neutral-500 uppercase tracking-[0.2em]">
                Evento
              </p>
              <p className="text-sm text-neutral-200">{lastEvent}</p>
            </div>
          )}

          {lastScannedCode && (
            <div className="mt-2">
              <p className="text-xs text-neutral-500 uppercase tracking-[0.2em]">
                Ultimo valore QR letto
              </p>
              <p className="text-[11px] text-neutral-400 break-all">
                {lastScannedCode}
              </p>
            </div>
          )}

          <p className="mt-auto text-[11px] text-neutral-500">
            Inquadra il QR al centro del riquadro. Se la camera dà problemi, puoi sempre inserire il codice manualmente.
          </p>
        </div>
      </main>
    </div>
  );
}
