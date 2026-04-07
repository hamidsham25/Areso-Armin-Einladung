import { NextResponse } from "next/server";
import { getGuestBySlug, getGuestCapacity } from "@/lib/guests";

type ResponseKind = "ja" | "nein" | "vielleicht";

type RsvpRequestBody = {
  guestSlug?: string;
  response?: ResponseKind;
  attendingCount?: number;
  attendingNames?: string;
  notes?: string;
};

function env(name: string): string | null {
  const value = process.env[name]?.trim();
  return value ? value : null;
}

function isResponseKind(value: unknown): value is ResponseKind {
  return value === "ja" || value === "nein" || value === "vielleicht";
}

export async function POST(req: Request) {
  const token = env("AIRTABLE_TOKEN");
  const baseId = env("AIRTABLE_BASE_ID");
  const tableName = env("AIRTABLE_TABLE_NAME");
  if (!token || !baseId || !tableName) {
    const missing = [
      !token ? "AIRTABLE_TOKEN" : null,
      !baseId ? "AIRTABLE_BASE_ID" : null,
      !tableName ? "AIRTABLE_TABLE_NAME" : null,
    ]
      .filter(Boolean)
      .join(", ");
    return NextResponse.json(
      { error: `Airtable ist nicht vollständig konfiguriert. Fehlend: ${missing}` },
      { status: 500 }
    );
  }

  let body: RsvpRequestBody;
  try {
    body = (await req.json()) as RsvpRequestBody;
  } catch {
    return NextResponse.json({ error: "Ungültiger JSON-Body." }, { status: 400 });
  }

  const guestSlug = (body.guestSlug ?? "").trim();
  const response = body.response;
  const notes = (body.notes ?? "").trim();
  const attendingNames = (body.attendingNames ?? "").trim();

  if (!guestSlug) {
    return NextResponse.json({ error: "guestSlug fehlt." }, { status: 400 });
  }
  if (!isResponseKind(response)) {
    return NextResponse.json({ error: "Ungültige Antwort." }, { status: 400 });
  }

  const guest = getGuestBySlug(guestSlug);
  const maxGuests = getGuestCapacity(guest);
  const rawCount = Number(body.attendingCount);
  const attendingCount = Number.isFinite(rawCount)
    ? Math.max(0, Math.min(rawCount, maxGuests))
    : 0;

  const airtableUrl = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(
    tableName
  )}`;

  const fields = {
    number: guest?.number,
    submitted_at: new Date().toISOString(),
    guest_slug: guestSlug,
    guest_names: guest?.names.join(", ") || "Öffentliche Einladung",
    response,
    attending_count: attendingCount,
    attending_names: attendingNames,
    message: notes,
  };

  try {
    const res = await fetch(airtableUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ records: [{ fields }] }),
      cache: "no-store",
    });

    if (!res.ok) {
      let details = "";
      try {
        details = await res.text();
      } catch {
        details = "";
      }
      return NextResponse.json(
        {
          error: details
            ? `Speichern in Airtable fehlgeschlagen: ${details}`
            : "Speichern in Airtable fehlgeschlagen.",
        },
        { status: 502 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Airtable ist derzeit nicht erreichbar." },
      { status: 502 }
    );
  }
}
