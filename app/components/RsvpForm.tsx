"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  getGuestCapacity,
  type GuestEntry,
} from "@/lib/guests";
import { type ResponseKind } from "@/lib/rsvp-email";

function initAttendingMap(
  guest: GuestEntry | undefined,
  response: ResponseKind
): Record<number, boolean> {
  const map: Record<number, boolean> = {};
  if (!guest?.names.length) return map;
  guest.names.forEach((_, i) => {
    map[i] = response === "ja";
  });
  return map;
}

const EMPTY_NAMES: string[] = [];

const sectionBtnClass =
  "w-full py-3 border border-ink/12 font-sc text-ink text-[10px] tracking-[0.23em] uppercase transition-colors duration-200 hover:bg-gold hover:text-white hover:border-gold active:bg-gold active:text-white active:border-gold";

type Props = {
  guest?: GuestEntry;
  /** RSVP-Dialog offen — für Overlay, Nav/Dots im Parent deaktivieren */
  onOpenChange?: (open: boolean) => void;
};

export function RsvpForm({ guest, onOpenChange }: Props) {
  const [open, setOpen] = useState(false);
  const [response, setResponse] = useState<ResponseKind | null>(null);
  const [publicLinkErrorOpen, setPublicLinkErrorOpen] = useState(false);

  function handleCloseModal() {
    setOpen(false);
    onOpenChange?.(false);
  }

  function pickChoice(kind: ResponseKind) {
    if (!guest) {
      setPublicLinkErrorOpen(true);
      return;
    }
    setResponse(kind);
    setOpen(true);
    onOpenChange?.(true);
  }

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleCloseModal();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <div className="flex flex-col gap-3 w-full max-w-[290px] mt-8">
        <button
          type="button"
          onClick={() => pickChoice("ja")}
          className={sectionBtnClass}
        >
          Joyfully Accept
        </button>
        <button
          type="button"
          onClick={() => pickChoice("nein")}
          className={sectionBtnClass}
        >
          Regretfully Decline
        </button>
        <button
          type="button"
          onClick={() => pickChoice("vielleicht")}
          className={sectionBtnClass}
        >
          Not Sure Yet
        </button>
      </div>

      {publicLinkErrorOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className="fixed inset-0 z-[210] flex items-center justify-center p-4 sm:p-6"
            role="presentation"
          >
            <button
              type="button"
              aria-label="Schließen"
              className="absolute inset-0 bg-ink/30 backdrop-blur-[3px]"
              onClick={() => setPublicLinkErrorOpen(false)}
            />
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="public-link-error-title"
              className="relative z-10 w-full max-w-[min(100vw,380px)] rounded-2xl bg-cream border border-ink/[0.08] shadow-2xl shadow-black/25 p-5 text-center"
            >
              <h2
                id="public-link-error-title"
                className="font-display text-ink text-[1.25rem] font-light"
              >
                Hinweis
              </h2>
              <p className="font-display text-ink/85 text-[15px] font-light leading-relaxed mt-3">
                Bitte öffne die Einladung über deinen persönlichen Einladungslink.
              </p>
              <button
                type="button"
                onClick={() => setPublicLinkErrorOpen(false)}
                className="mt-6 w-full py-3 border border-ink/12 font-sc text-ink text-[10px] tracking-[0.23em] uppercase transition-colors duration-200 hover:bg-gold hover:text-white hover:border-gold"
              >
                Verstanden
              </button>
            </div>
          </div>,
          document.body
        )}

      {open &&
        response &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6"
            role="presentation"
          >
            <button
              type="button"
              aria-label="Schließen"
              className="absolute inset-0 bg-ink/25 backdrop-blur-[3px]"
              onClick={handleCloseModal}
            />
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="rsvp-dialog-title"
              className="relative z-10 w-full max-w-[min(100vw,400px)] max-h-[min(92svh,720px)] overflow-hidden rounded-2xl bg-cream border border-ink/[0.08] shadow-2xl shadow-black/25 flex flex-col"
            >
            <div className="flex items-center justify-between gap-3 px-5 pt-4 pb-3 border-b border-ink/[0.06] shrink-0">
              <h2
                id="rsvp-dialog-title"
                className="font-display text-ink text-[1.35rem] font-light"
              >
                Details
              </h2>
              <button
                type="button"
                onClick={handleCloseModal}
                className="p-2 -mr-1 rounded-full text-ink/50 hover:text-ink hover:bg-ink/[0.04] transition-colors"
                aria-label="Fenster schließen"
              >
                <IconClose />
              </button>
            </div>
            <div className="overflow-y-auto overscroll-contain px-5 py-5 flex-1 min-h-0">
              <RsvpFormInner
                key={`${response}-${guest?.slug ?? "x"}`}
                guest={guest}
                response={response}
                onClose={handleCloseModal}
              />
            </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}

function RsvpFormInner({
  guest,
  response,
  onClose,
}: {
  guest?: GuestEntry;
  response: ResponseKind;
  onClose: () => void;
}) {
  const slug = guest?.slug ?? "website";
  const namesOnInvite = guest?.names ?? EMPTY_NAMES;
  const hasNameList = namesOnInvite.length > 0;
  const maxGuests = getGuestCapacity(guest);

  const [attending, setAttending] = useState<Record<number, boolean>>(() =>
    initAttendingMap(guest, response)
  );
  const [count, setCount] = useState(1);
  const [notes, setNotes] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">(
    "idle"
  );

  const { attendingNames, notAttendingNames, attendingCount } = useMemo(() => {
    const yes: string[] = [];
    const no: string[] = [];
    namesOnInvite.forEach((name, i) => {
      if (attending[i]) yes.push(name);
      else no.push(name);
    });
    return {
      attendingNames: yes.join(", "),
      notAttendingNames: no.join(", "),
      attendingCount: yes.length,
    };
  }, [attending, namesOnInvite]);

  const safeCount = hasNameList
    ? Math.min(Math.max(attendingCount, 0), maxGuests)
    : Math.min(Math.max(1, count), maxGuests);

  function toggleName(index: number) {
    setAttending((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
    setValidationError(null);
    setSubmitError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status === "sending") return;
    if (honeypot.trim() !== "") {
      setStatus("success");
      return;
    }

    if (hasNameList && response === "ja" && attendingCount === 0) {
      setValidationError(
        "Bitte wählt aus, wer von der Einladung kommt — mindestens eine Person."
      );
      return;
    }
    setValidationError(null);
    setSubmitError(null);

    setStatus("sending");
    try {
      const res = await fetch("/api/rsvp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          guestSlug: slug,
          response,
          attendingCount: hasNameList ? attendingCount : safeCount,
          attendingNames: hasNameList ? attendingNames : "",
          notes: notes.trim(),
        }),
      });
      if (!res.ok) {
        let serverMessage = "";
        try {
          const payload = (await res.json()) as { error?: string };
          serverMessage = (payload.error ?? "").trim();
        } catch {
          serverMessage = "";
        }
        throw new Error(serverMessage || "RSVP API request failed");
      }
      setStatus("success");
    } catch (error) {
      if (error instanceof Error && error.message.trim()) {
        setSubmitError(error.message.trim());
      } else {
        setSubmitError(null);
      }
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="text-center py-4 px-1">
        <p
          className="font-display text-gold text-[2rem] leading-none mb-4"
          aria-hidden
        >
          ✓
        </p>
        <p className="font-display text-ink text-[1.25rem] font-light leading-snug">
          Bestätigung
        </p>
        <p className="font-display text-ink/85 text-[15px] font-light leading-relaxed mt-3">
          Vielen Dank — wir haben eure Rückmeldung erhalten und freuen uns sehr.
        </p>
        <p className="font-display text-gray text-[13px] font-light mt-2">
          Ihr könnt dieses Fenster schließen.
        </p>
        <button
          type="button"
          onClick={onClose}
          className="mt-8 w-full py-3 border border-ink/12 font-sc text-ink text-[10px] tracking-[0.23em] uppercase transition-colors duration-200 hover:bg-gold hover:text-white hover:border-gold"
        >
          Schließen
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-left" noValidate>
      <p className="font-display text-gray text-[13px] font-light">
        <span className="font-sc text-ink/45 text-[10px] tracking-[0.2em] uppercase block mb-1.5">
          Response
        </span>
        {response === "ja" && "Joyfully Accept"}
        {response === "nein" && "Regretfully Decline"}
        {response === "vielleicht" && "Not Sure Yet"}
      </p>

      {hasNameList && (
        <fieldset className="border-0 p-0 m-0">
          <legend className="font-sc text-ink/50 text-[10px] tracking-[0.2em] uppercase mb-3 block w-full">
            Wer kommt? (für den Tischplan)
          </legend>
          <ul className="flex flex-col gap-2.5">
            {namesOnInvite.map((name, i) => (
              <li key={`${name}-${i}`}>
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={Boolean(attending[i])}
                    onChange={() => toggleName(i)}
                    disabled={status === "sending"}
                    className="mt-1 h-[1.05rem] w-[1.05rem] shrink-0 rounded-sm border border-ink/25 accent-gold focus:ring-2 focus:ring-gold/35 focus:ring-offset-1"
                  />
                  <span className="font-display text-[15px] font-light text-ink leading-snug group-hover:text-ink/90">
                    {name}
                    {guest?.inviteNote?.trim() ? " (ohne Kinder)" : ""}
                  </span>
                </label>
              </li>
            ))}
          </ul>
          <p className="font-display text-gray text-[12px] font-light mt-3">
            Ausgewählt: {attendingCount} von {namesOnInvite.length}
          </p>
        </fieldset>
      )}

      {!hasNameList && (
        <label className="block">
          <span className="font-sc text-ink/50 text-[10px] tracking-[0.2em] uppercase">
            Anzahl Personen (max. {maxGuests})
          </span>
          <input
            type="number"
            min={1}
            max={maxGuests}
            value={safeCount}
            onChange={(ev) => {
              const v = Number(ev.target.value);
              if (Number.isNaN(v)) return;
              setCount(Math.min(Math.max(1, v), maxGuests));
            }}
            disabled={status === "sending"}
            className="mt-2 w-full border border-ink/12 bg-transparent px-3 py-2.5 font-display text-[15px] font-light text-ink outline-none focus:border-gold/60"
          />
        </label>
      )}

      <label className="block">
        <span className="font-sc text-ink/50 text-[10px] tracking-[0.2em] uppercase">
          Nachricht (optional)
        </span>
        <textarea
          rows={3}
          value={notes}
          onChange={(ev) => setNotes(ev.target.value)}
          disabled={status === "sending"}
          className="mt-2 w-full resize-none border border-ink/12 bg-transparent px-3 py-2.5 font-display text-[15px] font-light text-ink outline-none focus:border-gold/60"
        />
      </label>

      <label className="sr-only" aria-hidden>
        <span>Website</span>
        <input
          tabIndex={-1}
          name="company"
          value={honeypot}
          onChange={(ev) => setHoneypot(ev.target.value)}
          autoComplete="off"
        />
      </label>

      {validationError && (
        <p className="font-display text-[13px] text-red-900/85 text-center">
          {validationError}
        </p>
      )}

      {status === "error" && (
        <p className="font-display text-[13px] text-red-900/80 text-center">
          {submitError ||
            "Das hat leider nicht geklappt. Bitte versucht es später erneut oder meldet euch direkt."}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "sending"}
        className="w-full py-3 border border-ink/12 font-sc text-ink text-[10px] tracking-[0.23em] uppercase transition-colors duration-200 hover:bg-gold hover:text-white hover:border-gold disabled:opacity-40 disabled:pointer-events-none"
      >
        {status === "sending" ? "Wird gesendet…" : "Absenden"}
      </button>
    </form>
  );
}

function IconClose() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
    >
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}
