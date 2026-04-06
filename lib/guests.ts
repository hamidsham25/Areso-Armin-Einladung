import guestsData from "@/data/guests.json";

export type GuestEntry = {
  slug: string;
  /** Kurzname für E-Mails / interne Zuordnung */
  label: string;
  /**
   * Eingeladene Personen pro Einladungslink.
   * Die maximale wählbare „Anzahl Personen“ im RSVP entspricht `names.length`.
   */
  names: string[];
  /** Anrede / persönliche Zeile */
  greeting: string;
  /** Optionaler Absatz unter der Begrüßung */
  namesLine?: string;
};

const guests = guestsData as GuestEntry[];

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

/** Texte für die Details-Section (Singular/Plural). Ohne Gast: neutrale Mehrzahl. */
export function buildDetailsInvitationCopy(guest: GuestEntry | undefined): {
  line1: string;
  line2: string;
} {
  if (!guest || guest.names.length === 0) {
    return {
      line1:
        "Wir heiraten — und möchten diesen besonderen Tag mit euch feiern 💍",
      line2:
        "Wir laden euch zu unserer Hochzeit ein und würden uns sehr freuen, euch dabei an unserer Seite zu haben.",
    };
  }
  const plural = guestIsPlural(guest);
  const first = formatFirstNamesGerman(guestFirstNames(guest));
  const mit = plural ? "euch" : "dir";
  const acc = plural ? "euch" : "dich";
  return {
    line1: `Wir heiraten — und möchten diesen besonderen Tag mit ${mit} feiern 💍`,
    line2: `Liebe ${first}, wir laden ${acc} zu unserer Hochzeit ein und würden uns sehr freuen, ${acc} dabei an unserer Seite zu haben.`,
  };
}

/** RSVP-Frist; „gib“ (du) vs „gebt“ (ihr). */
export function rsvpDeadlineReminder(guest: GuestEntry | undefined): string {
  const plural = guest && guest.names.length > 1;
  return plural
    ? "Bitte gebt uns bis zum 31.07.2026 eine Rückmeldung!"
    : "Bitte gib uns bis zum 31.07.2026 eine Rückmeldung!";
}
