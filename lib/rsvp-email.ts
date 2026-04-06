import {
  formatGuestNamesForEmail,
  guestDisplayLabel,
  type GuestEntry,
} from "@/lib/guests";

export type ResponseKind = "ja" | "nein" | "vielleicht";

/** Kurzcode für Filter / Automatisierung */
export function guestSideCode(
  guest: GuestEntry | undefined
): "areso" | "armin" | "public" {
  if (!guest?.side) return "public";
  return guest.side;
}

/** Lesbare deutsche Bezeichnung — steht in der E-Mail zuerst */
export function guestSideLabelDe(guest: GuestEntry | undefined): string {
  if (!guest?.side) return "Öffentliche Seite (kein persönlicher Link)";
  return guest.side === "areso" ? "Areso (Braut)" : "Armin (Bräutigam)";
}

function antwortLabelDe(response: ResponseKind): string {
  if (response === "ja") return "Ja — wir kommen";
  if (response === "nein") return "Nein — wir können nicht";
  return "Vielleicht — noch unsicher";
}

function formatSentAtDe(iso: string): string {
  try {
    const d = new Date(iso);
    return new Intl.DateTimeFormat("de-DE", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(d);
  } catch {
    return iso;
  }
}

export type BuildRsvpEmailFieldsInput = {
  guest: GuestEntry | undefined;
  response: ResponseKind;
  guestSlug: string;
  hasNameList: boolean;
  namesOnInvite: string[];
  attendingNames: string;
  notAttendingNames: string;
  guestCountStr: string;
  notesTrimmed: string;
  /** Aktuelle Seiten-URL (Client), z. B. https://…/einladung/behnaz */
  pageUrl: string;
};

/**
 * Alle Variablen für ein EmailJS-Template.
 * Namen mit `email_`-Präfix sind für ein komplettes Nachrichtenfeld gedacht.
 */
export function buildRsvpEmailTemplateFields(input: BuildRsvpEmailFieldsInput): Record<
  string,
  string
> {
  const {
    guest,
    response,
    guestSlug,
    hasNameList,
    namesOnInvite,
    attendingNames,
    notAttendingNames,
    guestCountStr,
    notesTrimmed,
    pageUrl,
  } = input;

  const ja = response === "ja";
  const nein = response === "nein";
  const vielleicht = response === "vielleicht";

  const label = guest ? guestDisplayLabel(guest) : "Öffentliche Einladung";
  const namesList = guest ? formatGuestNamesForEmail(guest) : "—";
  const sideCode = guestSideCode(guest);
  const sideDe = guestSideLabelDe(guest);
  const inviteNote = guest?.inviteNote?.trim() ?? "";

  const sentAt = new Date().toISOString();

  const lines: string[] = [
    "RSVP — Hochzeit Areso & Armin",
    "",
    "1) Seite / Einladung",
    `    ${sideDe}`,
    `    Code: ${sideCode}`,
    `    Einladungs-Slug: ${guestSlug}`,
    `    Bezeichnung: ${label}`,
    `    Alle Namen auf dieser Einladung: ${namesList}`,
    inviteNote ? `    Hinweis: ${inviteNote}` : "    Hinweis: —",
    "",
    "2) Antwort",
    `    ${antwortLabelDe(response)}`,
    "",
    "3) Ausgewählte Namen (kommen)",
    `    ${hasNameList ? attendingNames || "—" : "— (keine Namensliste)"}`,
    "",
    "4) Kommen nicht (bei Namensliste)",
    `    ${hasNameList ? notAttendingNames || "—" : "—"}`,
    "",
    "5) Anzahl Personen (für Rückmeldung)",
    `    ${guestCountStr}`,
    "",
    "6) Nachricht (optional)",
    `    ${notesTrimmed || "—"}`,
    "",
    "—",
    `Gesendet (UTC): ${sentAt}`,
    `Gesendet (lokal): ${formatSentAtDe(sentAt)}`,
    `Seiten-URL: ${pageUrl || "—"}`,
  ];

  const email_body_plain = lines.join("\n");

  return {
    guest_side: sideCode,
    guest_side_de: sideDe,

    guest_slug: guestSlug,
    guest_label: label,
    guest_names: namesList,
    guest_invite_note: inviteNote || "—",

    antwort: response,
    antwort_de: antwortLabelDe(response),
    antwort_ja: ja ? "1" : "0",
    antwort_nein: nein ? "1" : "0",
    antwort_vielleicht: vielleicht ? "1" : "0",
    antwort_text:
      response === "ja" ? "Ja" : response === "nein" ? "Nein" : "Vielleicht",
    antwort_label_en:
      response === "ja"
        ? "Joyfully Accept"
        : response === "nein"
          ? "Regretfully Decline"
          : "Not Sure Yet",

    guest_count: guestCountStr,
    attending_names: hasNameList ? attendingNames || "—" : "—",
    not_attending_names: hasNameList ? notAttendingNames || "—" : "—",
    has_name_list: hasNameList ? "1" : "0",

    notes: notesTrimmed || "—",
    notes_empty: notesTrimmed ? "0" : "1",

    sent_at: sentAt,
    sent_at_de: formatSentAtDe(sentAt),
    page_url: pageUrl || "—",

    email_subject_suggestion: `RSVP [${sideCode}] ${guestSlug} — ${response === "ja" ? "Ja" : response === "nein" ? "Nein" : "Vielleicht"}`,
    email_body_plain,
  };
}

export function emailJsEnvConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY?.trim() &&
      process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID?.trim() &&
      process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID?.trim()
  );
}
