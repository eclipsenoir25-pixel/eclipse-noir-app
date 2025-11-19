"use client";

import { useState, FormEvent } from "react";

type EventItem = {
  id: string;
  title: string;
  subtitle: string;
  date: string;
  description: string;
};

const EVENTS: EventItem[] = [
  {
    id: "act1-liberta-5dic",
    title: "ACT I – LA LIBERTÀ",
    subtitle: "Eclipse Noir",
    date: "5 DICEMBRE",
    description:
      "Ore 20:30 inaugurazione con accoglienza e buffet · Ore 21:30 live music Kashmir · Ore 23:30 spettacolo coreografico con DJ set.",
  },
  {
    id: "act2-lussuria-6dic",
    title: "ACT II – LA LUSSURIA",
    subtitle: "Eclipse Noir",
    date: "6 DICEMBRE",
    description:
      "Start 23:30 · DJ set, coreografie sensoriali e visual show. Quando l’arte diventa desiderio.",
  },
  {
    id: "act3-musica-7dic",
    title: "ACT III – LA MUSICA",
    subtitle: "Eclipse Noir",
    date: "7 DICEMBRE",
    description:
      "Ore 18:00 aperitivo · Queen Official Tribute (Queen of Bulsara) · DJ set. La notte trova il suo ritmo.",
  },
];

type Companion = {
  firstName: string;
  lastName: string;
  phone: string;
};

export default function EventsPage() {
  const [selectedEventId, setSelectedEventId] = useState<string>(
    EVENTS[0]?.id ?? ""
  );
  const [guestFirstName, setGuestFirstName] = useState("");
  const [guestLastName, setGuestLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [arrivalTime, setArrivalTime] = useState("");
  const [companions, setCompanions] = useState<Companion[]>([]);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [loading, setLoading] = useState(false);

  function addCompanion() {
    if (companions.length >= 10) {
      alert("Puoi aggiungere al massimo 10 accompagnatori.");
      return;
    }
    setCompanions([
      ...companions,
      { firstName: "", lastName: "", phone: "" },
    ]);
  }

  function updateCompanion(index: number, field: keyof Companion, value: string) {
    const clone = [...companions];
    clone[index] = { ...clone[index], [field]: value };
    setCompanions(clone);
  }

  function removeCompanion(index: number) {
    const clone = [...companions];
    clone.splice(index, 1);
    setCompanions(clone);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (!guestFirstName || !guestLastName || !phone || !selectedEventId) {
      alert("Nome, cognome, telefono ed evento sono obbligatori.");
      return;
    }

    if (!arrivalTime) {
      const conferma = confirm(
        "Non hai indicato l'orario di arrivo. Vuoi continuare comunque?"
      );
      if (!conferma) return;
    }

    if (!privacyAccepted) {
      alert("Devi accettare l'informativa sulla privacy per proseguire.");
      return;
    }

    // Controllo accompagnatori compilati a metà
    for (const c of companions) {
      const filled = c.firstName || c.lastName || c.phone;
      const complete = c.firstName && c.lastName && c.phone;
      if (filled && !complete) {
        alert(
          "Ogni accompagnatore deve avere nome, cognome e telefono, oppure lascia i campi vuoti."
        );
        return;
      }
    }

    setLoading(true);

    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guestName: guestFirstName,
          guestSurname: guestLastName,
          phone,
          eventId: selectedEventId,
          arrivalTime,
          companions,
          privacyAccepted,
        }),
      });

      const data = await res.json();
      alert(data.message || "Richiesta inviata.");

      if (data.ok) {
        // reset form
        setGuestFirstName("");
        setGuestLastName("");
        setPhone("");
        setArrivalTime("");
        setCompanions([]);
        setPrivacyAccepted(false);
        setSelectedEventId(EVENTS[0]?.id ?? "");
      }
    } catch (err) {
      alert("Errore nell'invio della richiesta.");
    } finally {
      setLoading(false);
    }
  }

  const selectedEvent = EVENTS.find((e) => e.id === selectedEventId);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#050308",
        color: "#fefce8",
        padding: "32px 16px",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div style={{ width: "100%", maxWidth: "900px" }}>
        {/* HEADER */}
        <h1
          style={{
            fontSize: "32px",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            textAlign: "center",
            marginBottom: "6px",
            color: "#fbbf24",
          }}
        >
          Eclipse Noir
        </h1>
        <p
          style={{
            textAlign: "center",
            color: "#e5e7eb",
            marginBottom: "28px",
            fontSize: "14px",
          }}
        >
          Seleziona l&apos;atto, inserisci i tuoi dati e quelli dei tuoi
          accompagnatori. Se la richiesta verrà approvata, riceverai su
          WhatsApp un codice univoco di ingresso.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1.2fr) minmax(0, 1fr)",
            gap: "24px",
          }}
        >
          {/* COLONNA EVENTI */}
          <div>
            <h2
              style={{
                fontSize: "18px",
                marginBottom: "12px",
                color: "#fde68a",
              }}
            >
              Scegli l&apos;Atto
            </h2>

            <div style={{ display: "grid", gap: "12px" }}>
              {EVENTS.map((ev) => {
                const isSelected = ev.id === selectedEventId;
                return (
                  <button
                    key={ev.id}
                    type="button"
                    onClick={() => setSelectedEventId(ev.id)}
                    style={{
                      textAlign: "left",
                      padding: "14px 16px",
                      borderRadius: "10px",
                      border: isSelected
                        ? "1px solid #fbbf24"
                        : "1px solid #374151",
                      background: isSelected ? "#111827" : "#020617",
                      cursor: "pointer",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "12px",
                        letterSpacing: "0.18em",
                        textTransform: "uppercase",
                        color: "#facc15",
                        marginBottom: "4px",
                      }}
                    >
                      {ev.date}
                    </div>
                    <div
                      style={{
                        fontSize: "15px",
                        fontWeight: 600,
                        marginBottom: "4px",
                      }}
                    >
                      {ev.title}
                    </div>
                    <div
                      style={{
                        fontSize: "12px",
                        color: "#9ca3af",
                        marginBottom: "4px",
                      }}
                    >
                      {ev.subtitle}
                    </div>
                    <div
                      style={{
                        fontSize: "13px",
                        color: "#d1d5db",
                      }}
                    >
                      {ev.description}
                    </div>
                  </button>
                );
              })}
            </div>

            {selectedEvent && (
              <div
                style={{
                  marginTop: "20px",
                  padding: "12px 14px",
                  borderRadius: "10px",
                  border: "1px dashed #4b5563",
                  fontSize: "13px",
                  color: "#e5e7eb",
                }}
              >
                <div style={{ fontWeight: 600, marginBottom: "4px" }}>
                  Evento selezionato:
                </div>
                <div>{selectedEvent.date}</div>
                <div>{selectedEvent.title}</div>
              </div>
            )}
          </div>

          {/* COLONNA FORM */}
          <div>
            <h2
              style={{
                fontSize: "18px",
                marginBottom: "12px",
                color: "#fde68a",
              }}
            >
              Richiesta di accesso
            </h2>

            <form
              onSubmit={handleSubmit}
              style={{ display: "flex", flexDirection: "column", gap: "10px" }}
            >
              {/* Nome + cognome */}
              <div style={{ display: "flex", gap: "8px" }}>
                <input
                  value={guestFirstName}
                  onChange={(e) => setGuestFirstName(e.target.value)}
                  placeholder="Nome*"
                  required
                  style={{
                    flex: 1,
                    padding: "10px 12px",
                    borderRadius: "6px",
                    border: "1px solid #4b5563",
                    background: "#020617",
                    color: "#f9fafb",
                  }}
                />
                <input
                  value={guestLastName}
                  onChange={(e) => setGuestLastName(e.target.value)}
                  placeholder="Cognome*"
                  required
                  style={{
                    flex: 1,
                    padding: "10px 12px",
                    borderRadius: "6px",
                    border: "1px solid #4b5563",
                    background: "#020617",
                    color: "#f9fafb",
                  }}
                />
              </div>

              {/* Telefono */}
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Numero WhatsApp*"
                required
                style={{
                  padding: "10px 12px",
                  borderRadius: "6px",
                  border: "1px solid #4b5563",
                  background: "#020617",
                  color: "#f9fafb",
                }}
              />

              {/* Orario arrivo */}
              <div>
                <label
                  style={{
                    fontSize: "13px",
                    marginBottom: "4px",
                    display: "block",
                    color: "#e5e7eb",
                  }}
                >
                  Orario indicativo di arrivo
                </label>
                <input
                  type="time"
                  value={arrivalTime}
                  onChange={(e) => setArrivalTime(e.target.value)}
                  style={{
                    padding: "8px 10px",
                    borderRadius: "6px",
                    border: "1px solid #4b5563",
                    background: "#020617",
                    color: "#f9fafb",
                  }}
                />
              </div>

              {/* Accompagnatori */}
              <div
                style={{
                  marginTop: "10px",
                  paddingTop: "10px",
                  borderTop: "1px solid #374151",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "6px",
                  }}
                >
                  <span style={{ fontSize: "13px", color: "#e5e7eb" }}>
                    Accompagnatori (max 10)
                  </span>
                  <button
                    type="button"
                    onClick={addCompanion}
                    style={{
                      fontSize: "12px",
                      padding: "4px 10px",
                      borderRadius: "999px",
                      border: "1px solid #fbbf24",
                      background: "transparent",
                      color: "#fbbf24",
                      cursor: "pointer",
                    }}
                  >
                    + Aggiungi
                  </button>
                </div>

                {companions.length === 0 && (
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#9ca3af",
                      marginBottom: "4px",
                    }}
                  >
                    Puoi aggiungere fino a 10 accompagnatori. Per ognuno sono
                    necessari nome, cognome e numero di telefono.
                  </div>
                )}

                {companions.map((c, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1.1fr 1.1fr 1.2fr auto",
                      gap: "6px",
                      marginBottom: "6px",
                    }}
                  >
                    <input
                      value={c.firstName}
                      onChange={(e) =>
                        updateCompanion(idx, "firstName", e.target.value)
                      }
                      placeholder="Nome"
                      style={{
                        padding: "8px 8px",
                        borderRadius: "6px",
                        border: "1px solid #4b5563",
                        background: "#020617",
                        color: "#f9fafb",
                        fontSize: "12px",
                      }}
                    />
                    <input
                      value={c.lastName}
                      onChange={(e) =>
                        updateCompanion(idx, "lastName", e.target.value)
                      }
                      placeholder="Cognome"
                      style={{
                        padding: "8px 8px",
                        borderRadius: "6px",
                        border: "1px solid #4b5563",
                        background: "#020617",
                        color: "#f9fafb",
                        fontSize: "12px",
                      }}
                    />
                    <input
                      value={c.phone}
                      onChange={(e) =>
                        updateCompanion(idx, "phone", e.target.value)
                      }
                      placeholder="Telefono"
                      style={{
                        padding: "8px 8px",
                        borderRadius: "6px",
                        border: "1px solid #4b5563",
                        background: "#020617",
                        color: "#f9fafb",
                        fontSize: "12px",
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => removeCompanion(idx)}
                      style={{
                        fontSize: "11px",
                        padding: "6px 8px",
                        borderRadius: "999px",
                        border: "none",
                        background: "#b91c1c",
                        color: "#fff",
                        cursor: "pointer",
                      }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>

              {/* Privacy */}
              <label
                style={{
                  marginTop: "10px",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "8px",
                  fontSize: "12px",
                  color: "#e5e7eb",
                }}
              >
                <input
                  type="checkbox"
                  checked={privacyAccepted}
                  onChange={(e) => setPrivacyAccepted(e.target.checked)}
                  style={{ marginTop: "3px" }}
                />
                <span>
                  Dichiaro di aver letto e accettato l&apos;informativa sul
                  trattamento dei dati personali e acconsento al contatto via
                  WhatsApp per comunicazioni relative all&apos;evento.
                </span>
              </label>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  marginTop: "14px",
                  padding: "12px 18px",
                  borderRadius: "999px",
                  border: "none",
                  background: loading
                    ? "#4b5563"
                    : "linear-gradient(90deg,#fbbf24,#eab308)",
                  color: "#111827",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.12em",
                  fontSize: "12px",
                  cursor: loading ? "not-allowed" : "pointer",
                }}
              >
                {loading ? "Invio in corso..." : "Invia richiesta"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
