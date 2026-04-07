import guestsData from "@/data/guests.json";

export type GuestEntry = {
  /** Laufende Nummer (in JSON-Reihenfolge), für Airtable-Sortierung */
  number: number;
  slug: string;
  /** Kurzname für Tab-Titel / E-Mail; optional — Fallback: Namenliste */
  label?: string;
  /** Einladung von der Braut (Areso) oder vom Bräutigam (Armin) */
  side?: "areso" | "armin";
  /**
   * Eingeladene Personen pro Einladungslink.
   * Die maximale wählbare „Anzahl Personen“ im RSVP entspricht `names.length`.
   */
  names: string[];
  /** Anrede / persönliche Zeile (reserviert für künftige Nutzung) */
  greeting: string;
  /** Optionaler Absatz unter der Begrüßung */
  namesLine?: string;
  /** Wenn gesetzt: Einladung gilt ohne Kinder — erscheint im Einladungstext und im RSVP */
  inviteNote?: string;
};

/** Tab-Titel, E-Mail-Vorschau */
export function guestDisplayLabel(guest: GuestEntry | undefined): string {
  if (!guest) return "Einladung";
  const l = guest.label?.trim();
  if (l) return l;
  if (guest.names.length) return guest.names.join(", ");
  return "Einladung";
}

type GuestDataEntry = Omit<GuestEntry, "number"> & { number?: number };

const guests = (guestsData as GuestDataEntry[]).map((guest, index) => ({
  ...guest,
  // Falls keine feste Nummer gepflegt ist: automatisch nach JSON-Reihenfolge.
  number: guest.number ?? index + 1,
}));

export function getGuestBySlug(slug: string): GuestEntry | undefined {
  return guests.find((g) => g.slug === slug);
}

export function getAllGuests(): GuestEntry[] {
  return guests;
}

/** Max. Personen für RSVP: Anzahl der Namen im Token (mindestens 1). */
export function getGuestCapacity(guest: GuestEntry | undefined): number {
  if (!guest) return 1;
  const n = guest.names.length;
  return Math.max(1, n);
}

export function formatGuestNamesForEmail(guest: GuestEntry | undefined): string {
  if (!guest || guest.names.length === 0) return "—";
  return guest.names.join(", ");
}

/** Erster Vorname pro Eintrag (erstes Wort des Namens). */
export function guestFirstNames(guest: GuestEntry): string[] {
  return guest.names
    .map((n) => n.trim().split(/\s+/)[0] ?? "")
    .filter(Boolean);
}

/** z. B. „Anna“, „Anna und Tom“, „Anna, Tom und Lisa“. */
export function formatFirstNamesGerman(firstNames: string[]): string {
  if (firstNames.length === 0) return "";
  if (firstNames.length === 1) return firstNames[0];
  if (firstNames.length === 2) return `${firstNames[0]} und ${firstNames[1]}`;
  return `${firstNames.slice(0, -1).join(", ")} und ${firstNames[firstNames.length - 1]}`;
}

export function guestIsPlural(guest: GuestEntry): boolean {
  return guest.names.length > 1;
}

/** Texte für die Einladungs-Section (Singular/Plural). Ohne Gast: neutrale Mehrzahl. */
export function buildDetailsInvitationCopy(guest: GuestEntry | undefined): {
  line1: string;
  line2: string;
} {
  if (!guest || guest.names.length === 0) {
    return {
      line1:
        "Wir heiraten — und möchten diesen besonderen Tag mit euch feiern 💍",
      line2:
        "Wir laden euch herzlich zu unserer Hochzeit ein und würden uns sehr freuen, euch dabei an unserer Seite zu haben.",
    };
  }
  const plural = guestIsPlural(guest);
  const first = formatFirstNamesGerman(guestFirstNames(guest));
  const firstWithNote = guest.inviteNote?.trim()
    ? `${first} (ohne Kinder)`
    : first;
  const mit = plural ? "euch" : "dir";
  const acc = plural ? "euch" : "dich";
  return {
    line1: `Wir heiraten — und möchten diesen besonderen Tag mit ${mit} feiern 💍`,
    line2: `Liebe ${firstWithNote}, wir laden ${acc} herzlich zu unserer Hochzeit ein und würden uns sehr freuen, ${acc} dabei an unserer Seite zu haben.`,
  };
}

/** RSVP-Frist; „gib“ (du) vs „gebt“ (ihr). */
export function rsvpDeadlineReminder(guest: GuestEntry | undefined): string {
  const plural = guest && guest.names.length > 1;
  return plural
    ? "Bitte gebt uns bis zum 30.06.2026 eine Rückmeldung!"
    : "Bitte gib uns bis zum 30.06.2026 eine Rückmeldung!";
}
