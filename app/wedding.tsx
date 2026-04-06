"use client";

import { useState, useEffect, useRef, type ReactNode } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import Image from "next/image";
import { RsvpForm } from "@/app/components/RsvpForm";
import {
  type GuestEntry,
  buildDetailsInvitationCopy,
  rsvpDeadlineReminder,
} from "@/lib/guests";
import {
  isMobileFullscreenContext,
  tryEnterFullscreenFromUserGesture,
} from "@/lib/fullscreen";

/* ================================================================
   Types
   ================================================================ */

const SECTIONS = ["home", "invite", "details", "schedule", "rsvp", "gallery"] as const;
type SectionId = (typeof SECTIONS)[number];
const DARK_SECTIONS: SectionId[] = ["details", "gallery"];
const EASE_OUT = [0.22, 1, 0.36, 1] as const;

/* ================================================================
   SVG Icons
   ================================================================ */

function IconHome(p: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M3 10.5L12 3l9 7.5" />
      <path d="M5 10v10a1 1 0 001 1h4v-6h4v6h4a1 1 0 001-1V10" />
    </svg>
  );
}

function IconPin(p: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M12 21c-4-4-8-7.5-8-11a8 8 0 1116 0c0 3.5-4 7-8 11z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

function IconCalendar(p: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <rect x="3" y="4" width="18" height="17" rx="2" />
      <path d="M8 2v4M16 2v4M3 9h18" />
    </svg>
  );
}

function IconMail(p: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="M22 4L12 13 2 4" />
    </svg>
  );
}

function IconCamera(p: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  );
}

function IconMusic(p: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
    </svg>
  );
}

function IconClock(p: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  );
}

function IconPhone(p: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6A19.79 19.79 0 012.12 4.18 2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
    </svg>
  );
}

function IconHeart(p: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
    </svg>
  );
}

/* ================================================================
   Small components
   ================================================================ */

function Divider({ className = "" }: { className?: string }) {
  return <div className={`w-12 h-px bg-gold/50 mx-auto ${className}`} />;
}

const sectionContainerVariants = {
  hidden: {
    opacity: 0.32,
    y: 18,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.65,
      ease: EASE_OUT,
      staggerChildren: 0.06,
      delayChildren: 0.03,
    },
  },
};

const sectionItemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: EASE_OUT },
  },
};

type SectionContainerVariants = typeof sectionContainerVariants;

function AnimatedSectionContent({
  isActive,
  className,
  children,
  containerVariants = sectionContainerVariants,
}: {
  isActive: boolean;
  className?: string;
  children: ReactNode;
  containerVariants?: SectionContainerVariants;
}) {
  return (
    <motion.div
      variants={containerVariants}
      initial={false}
      animate={isActive ? "visible" : "hidden"}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ── Section-specific container timings (stronger stagger than default) ── */

const inviteContainerVariants: SectionContainerVariants = {
  hidden: { opacity: 0.28, y: 22 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: EASE_OUT,
      staggerChildren: 0.14,
      delayChildren: 0.06,
    },
  },
};

const detailsContainerVariants: SectionContainerVariants = {
  hidden: { opacity: 0.28, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.72,
      ease: EASE_OUT,
      staggerChildren: 0.16,
      delayChildren: 0.05,
    },
  },
};

const rsvpContainerVariants: SectionContainerVariants = {
  hidden: { opacity: 0.28, y: 22 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.72,
      ease: EASE_OUT,
      staggerChildren: 0.13,
      delayChildren: 0.08,
    },
  },
};

const galleryContainerVariants: SectionContainerVariants = {
  hidden: { opacity: 0.28, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.68,
      ease: EASE_OUT,
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const scheduleContainerVariants: SectionContainerVariants = {
  hidden: { opacity: 0.28, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.68,
      ease: EASE_OUT,
      staggerChildren: 0.11,
      delayChildren: 0.06,
    },
  },
};

/* ── Home: hero house → text (sequence like schedule drama) ── */

function HomeSectionContent({ isActive }: { isActive: boolean }) {
  const reduceMotion = useReducedMotion();
  const rm = reduceMotion === true;

  const homeRootVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: rm ? 0.12 : 0.48,
        delayChildren: 0,
      },
    },
  };

  const homeHouseVariants = {
    hidden: {
      scale: rm ? 1 : 1.92,
      opacity: rm ? 0 : 0.78,
      filter: rm ? "blur(0px)" : "blur(5px)",
    },
    visible: {
      scale: 1,
      opacity: 1,
      filter: "blur(0px)",
      transition: { duration: rm ? 0.38 : 0.98, ease: EASE_OUT },
    },
  };

  const homeTextStackVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: rm ? 0.07 : 0.12,
        delayChildren: rm ? 0 : 0.04,
      },
    },
  };

  const homeSoftLineVariants = {
    hidden: { opacity: 0, y: 18, filter: "blur(8px)" },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { duration: 0.55, ease: EASE_OUT },
    },
  };

  const homeNameVariants = {
    hidden: { opacity: 0, y: 22, scale: 0.94 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.62, ease: EASE_OUT },
    },
  };

  const homeAmpersandVariants = {
    hidden: { opacity: 0, scale: 0.6, rotate: -8 },
    visible: {
      opacity: 1,
      scale: 1,
      rotate: 0,
      transition: { type: "spring" as const, stiffness: 280, damping: 20 },
    },
  };

  return (
    <motion.div
      variants={homeRootVariants}
      initial={false}
      animate={isActive ? "visible" : "hidden"}
      className="flex flex-col items-center text-center"
    >
      <motion.div
        variants={homeHouseVariants}
        className="origin-top will-change-transform"
      >
        <VenueIllustration />
      </motion.div>

      <motion.div variants={homeTextStackVariants} className="flex flex-col items-center w-full">
        <motion.p
          variants={homeSoftLineVariants}
          className="font-sc text-gold/60 text-[10px] tracking-[0.38em] uppercase mt-6"
        >
          Hochzeitseinladung
        </motion.p>
        <motion.div variants={homeSoftLineVariants}>
          <Divider className="mt-9" />
        </motion.div>
        <motion.h1
          variants={homeNameVariants}
          className="font-display text-ink text-[clamp(2.65rem,9vw,3.35rem)] leading-[1.02] font-light tracking-[-0.02em] not-italic mt-8"
        >
          Areso
        </motion.h1>
        <motion.p
          variants={homeAmpersandVariants}
          className="font-script text-gold text-[clamp(2.35rem,7.5vw,3rem)] leading-none mt-2.5"
          aria-hidden="true"
        >
          &amp;
        </motion.p>
        <motion.h1
          variants={homeNameVariants}
          className="font-display text-ink text-[clamp(2.65rem,9vw,3.35rem)] leading-[1.02] font-light tracking-[-0.02em] not-italic mt-2.5"
        >
          Armin
        </motion.h1>
        <motion.div variants={homeSoftLineVariants}>
          <Divider className="mt-9" />
        </motion.div>
        <motion.p
          variants={homeSoftLineVariants}
          className="font-sc text-gray/70 text-[10px] tracking-[0.28em] uppercase mt-8"
        >
          Friday, September 4th, 2026
        </motion.p>
      </motion.div>
    </motion.div>
  );
}

function VenueIllustration() {
  return (
    <svg
      viewBox="0 0 120 80"
      className="w-28 mx-auto"
      fill="none"
      stroke="currentColor"
      strokeWidth="0.7"
      opacity="0.35"
    >
      <rect x="20" y="28" width="80" height="52" />
      <path d="M15 28 L60 8 L105 28" />
      <rect x="28" y="36" width="8" height="12" />
      <rect x="42" y="36" width="8" height="12" />
      <rect x="70" y="36" width="8" height="12" />
      <rect x="84" y="36" width="8" height="12" />
      <rect x="28" y="54" width="8" height="12" />
      <rect x="42" y="54" width="8" height="12" />
      <rect x="70" y="54" width="8" height="12" />
      <rect x="84" y="54" width="8" height="12" />
      <path d="M53 80 V62 Q60 54 67 62 V80" />
      <rect x="55" y="8" width="10" height="6" />
      <path d="M54 8 Q60 0 66 8" />
    </svg>
  );
}

/* ================================================================
   Schedule timeline
   ================================================================ */

const SCHEDULE = [
  { time: "16:30", event: "Trauung" },
  { time: "17:15", event: "Empfang" },
  { time: "17:45", event: "Beginn der Feier" },
  { time: "19:00", event: "Essen" },
  { time: "20:30", event: "Programm und Feier" },
];

const timelineTimeVariants = {
  hidden: { opacity: 0, x: -14 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.4, ease: EASE_OUT },
  },
};

const timelineDotVariants = {
  hidden: { scale: 0, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { type: "spring" as const, stiffness: 440, damping: 26 },
  },
};

const timelineLineVariants = {
  hidden: { scaleY: 0, opacity: 0 },
  visible: {
    scaleY: 1,
    opacity: 1,
    transition: { duration: 0.45, ease: EASE_OUT },
  },
};

const timelineLabelVariants = {
  hidden: { opacity: 0, x: 12 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.4, ease: EASE_OUT },
  },
};

function Timeline({ isActive }: { isActive: boolean }) {
  const reduceMotion = useReducedMotion();
  const betweenRows = reduceMotion ? 0 : 0.28;
  const betweenTimeColumnAndLabel = reduceMotion ? 0 : 0.2;
  const betweenDotAndLine = reduceMotion ? 0 : 0.1;

  const timelineRootVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: betweenRows,
        delayChildren: reduceMotion ? 0 : 0.14,
      },
    },
  };

  const timelineRowVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: betweenTimeColumnAndLabel,
        staggerDirection: 1,
      },
    },
  };

  const columnVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: betweenDotAndLine,
      },
    },
  };

  return (
    <motion.div variants={sectionItemVariants} className="w-full max-w-[280px] mx-auto mt-10 text-left">
      <motion.div
        variants={timelineRootVariants}
        initial={false}
        animate={isActive ? "visible" : "hidden"}
      >
        {SCHEDULE.map((item, i) => (
          <motion.div key={i} variants={timelineRowVariants} className="flex items-start gap-6">
            <motion.p
              variants={timelineTimeVariants}
              className="font-display text-ink text-[1.05rem] font-light w-14 text-right shrink-0 pt-0.5"
            >
              {item.time}
            </motion.p>
            <motion.div variants={columnVariants} className="flex flex-col items-center shrink-0">
              <motion.div
                variants={timelineDotVariants}
                className="w-3 h-3 rounded-full bg-gold mt-1.5"
              />
              {i < SCHEDULE.length - 1 && (
                <motion.div
                  variants={timelineLineVariants}
                  style={{ transformOrigin: "top center" }}
                  className="w-px h-14 bg-gold/25"
                />
              )}
            </motion.div>
            <motion.p
              variants={timelineLabelVariants}
              className="font-display text-ink text-[1.05rem] font-light pt-0.5"
            >
              {item.event}
            </motion.p>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}

const galleryGridVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.075,
      delayChildren: 0.08,
    },
  },
};

const rsvpHeadlinePrimaryVariants = {
  hidden: { opacity: 0, x: -32, filter: "blur(8px)" },
  visible: {
    opacity: 1,
    x: 0,
    filter: "blur(0px)",
    transition: { duration: 0.62, ease: EASE_OUT },
  },
};

const rsvpHeadlineAccentVariants = {
  hidden: { opacity: 0, x: 32, filter: "blur(8px)" },
  visible: {
    opacity: 1,
    x: 0,
    filter: "blur(0px)",
    transition: { duration: 0.62, ease: EASE_OUT, delay: 0.08 },
  },
};

const inviteIconVariants = {
  hidden: { opacity: 0, scale: 0.75, rotate: -14 },
  visible: {
    opacity: 1,
    scale: 1,
    rotate: 0,
    transition: { type: "spring" as const, stiffness: 300, damping: 20 },
  },
};

const inviteLineVariants = {
  hidden: { opacity: 0, y: 26, filter: "blur(10px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.62, ease: EASE_OUT },
  },
};

const detailsPinVariants = {
  hidden: { opacity: 0, y: -36, rotate: -12 },
  visible: {
    opacity: 1,
    y: 0,
    rotate: 0,
    transition: { type: "spring" as const, stiffness: 260, damping: 22 },
  },
};

const detailsBlockVariants = {
  hidden: (i: number) => ({
    opacity: 0,
    x: i % 2 === 0 ? -36 : 36,
    y: 14,
    filter: "blur(6px)",
  }),
  visible: {
    opacity: 1,
    x: 0,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.58, ease: EASE_OUT },
  },
};

const scheduleClockVariants = {
  hidden: { opacity: 0, scale: 0.5, rotate: -25 },
  visible: {
    opacity: 1,
    scale: 1,
    rotate: 0,
    transition: { type: "spring" as const, stiffness: 340, damping: 24 },
  },
};

const rsvpMailVariants = {
  hidden: { opacity: 0, y: 22, rotateX: 18, rotateZ: -6 },
  visible: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    rotateZ: 0,
    transition: { type: "spring" as const, stiffness: 280, damping: 22 },
  },
};

const rsvpBodyVariants = {
  hidden: { opacity: 0, y: 20, filter: "blur(8px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.58, ease: EASE_OUT },
  },
};

const galleryCellVariants = {
  hidden: (i: number) => ({
    opacity: 0,
    x: i % 2 === 0 ? -28 : 28,
    y: 20,
    rotate: i % 2 === 0 ? -2.5 : 2.5,
    scale: 0.92,
  }),
  visible: {
    opacity: 1,
    x: 0,
    y: 0,
    rotate: 0,
    scale: 1,
    transition: { duration: 0.52, ease: EASE_OUT },
  },
};

const galleryHeaderVariants = {
  hidden: { opacity: 0, scale: 0.92, filter: "blur(6px)" },
  visible: {
    opacity: 1,
    scale: 1,
    filter: "blur(0px)",
    transition: { duration: 0.6, ease: EASE_OUT },
  },
};

/* ================================================================
   Gallery data
   ================================================================ */

const GALLERY_IMAGES = [
  "https://images.unsplash.com/photo-1529634597503-139d3726fed5?w=400&q=80",
  "https://images.unsplash.com/photo-1519741497674-611481863552?w=400&q=80",
  "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=400&q=80",
  "https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=400&q=80",
  "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=400&q=80",
  "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=400&q=80",
];

/* ================================================================
   Envelope Screen (placeholder for future video)
   ================================================================ */

const ENVELOPE_FLAP_CLOSED = "M4 60 L130 116 L256 60 Z";
const ENVELOPE_FLAP_OPEN = "M4 60 L130 4 L256 60 Z";
const FLAP_SEAL_Y = { closed: 106, open: 18 } as const;

function EnvelopeScreen({ onOpen }: { onOpen: () => void }) {
  const [flapOpen, setFlapOpen] = useState(false);
  const didReveal = useRef(false);

  const handleOpen = () => {
    if (flapOpen) return;
    if (isMobileFullscreenContext()) {
      tryEnterFullscreenFromUserGesture();
    }
    setFlapOpen(true);
  };

  const sealY = flapOpen ? FLAP_SEAL_Y.open : FLAP_SEAL_Y.closed;

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-cream select-none cursor-pointer"
      onClick={handleOpen}
      exit={{ y: "-100vh", opacity: 0 }}
      transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
    >
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.85, ease: EASE_OUT }}
        className="mb-10 flex flex-col items-center"
      >
        <p
          className="flex items-baseline justify-center gap-1.5 sm:gap-2.5 leading-none [text-shadow:0_1px_0_rgba(255,255,255,0.45)]"
          aria-label="Monogramm A und A"
        >
          <span className="font-display text-gold text-[clamp(3.5rem,12vw,5rem)] font-light uppercase tracking-[0.14em]">
            A
          </span>
          <span className="font-script text-gold text-[clamp(2.35rem,7.5vw,3.35rem)] translate-y-[0.06em] pb-0.5">
            &amp;
          </span>
          <span className="font-display text-gold text-[clamp(3.5rem,12vw,5rem)] font-light uppercase tracking-[0.14em]">
            A
          </span>
        </p>
        <div className="mt-5 h-px w-16 bg-gradient-to-r from-transparent via-gold/45 to-transparent" aria-hidden />
      </motion.div>

      <svg viewBox="0 0 260 170" className="w-72 sm:w-80" aria-hidden="true">
        <rect x="4" y="60" width="252" height="106" rx="4" fill="#F0EBE4" stroke="#C9A96E" strokeWidth="0.8" />
        {/* Innenfalz (V) — erst sichtbar wenn die Klappe offen ist */}
        <motion.path
          d="M4 60 L130 130 L256 60"
          fill="none"
          stroke="#C9A96E"
          strokeWidth="0.5"
          initial={false}
          animate={{ opacity: flapOpen ? 0.35 : 0 }}
          transition={{ duration: 0.55, ease: EASE_OUT }}
        />
        {/* Zu: Klappe liegt auf dem Umschlag (Spitze unten im Rechteck). Offen: Klappe nach oben — per Pfad-Morph, kein CSS-rotate auf <g> (verrutscht im SVG). */}
        <motion.path
          fill="#E8E2D8"
          stroke="#C9A96E"
          strokeWidth="0.8"
          initial={false}
          animate={{ d: flapOpen ? ENVELOPE_FLAP_OPEN : ENVELOPE_FLAP_CLOSED }}
          transition={{ duration: 0.55, ease: EASE_OUT }}
          onAnimationComplete={() => {
            if (flapOpen && !didReveal.current) {
              didReveal.current = true;
              onOpen();
            }
          }}
        />
        <motion.circle
          cx="130"
          r="18"
          fill="#8B2020"
          initial={false}
          animate={{ cy: sealY }}
          transition={{ duration: 0.55, ease: EASE_OUT }}
        />
        <motion.circle
          cx="130"
          r="13"
          fill="none"
          stroke="#D4A574"
          strokeWidth="0.6"
          initial={false}
          animate={{ cy: sealY }}
          transition={{ duration: 0.55, ease: EASE_OUT }}
        />
        {Array.from({ length: 14 }).map((_, i) => {
          const a = ((i * 360) / 14) * (Math.PI / 180);
          return (
            <motion.circle
              key={i}
              cx={130 + 19 * Math.cos(a)}
              r="4.5"
              fill="#8B2020"
              initial={false}
              animate={{ cy: sealY + 19 * Math.sin(a) }}
              transition={{ duration: 0.55, ease: EASE_OUT }}
            />
          );
        })}
      </svg>

      <p className="mt-10 font-sc text-gray text-[12px] tracking-[0.35em] uppercase animate-pulse-soft">
        Tap to open
      </p>
    </motion.div>
  );
}

/* ================================================================
   Bottom Navigation Bar
   ================================================================ */

const NAV_ITEMS: { id: SectionId; icon: React.FC<React.SVGProps<SVGSVGElement>> }[] = [
  { id: "home", icon: IconHome },
  { id: "invite", icon: IconHeart },
  { id: "details", icon: IconPin },
  { id: "schedule", icon: IconCalendar },
  { id: "rsvp", icon: IconMail },
  { id: "gallery", icon: IconCamera },
];

function BottomNav({
  active,
  onNavigate,
  musicPlaying,
  onToggleMusic,
  isDark,
  chromeBlocked,
}: {
  active: SectionId;
  onNavigate: (id: SectionId) => void;
  musicPlaying: boolean;
  onToggleMusic: () => void;
  isDark: boolean;
  chromeBlocked?: boolean;
}) {
  return (
    <motion.nav
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.4, duration: 0.6, ease: "easeOut" }}
      aria-hidden={chromeBlocked}
      className={`fixed bottom-3.5 left-1/2 -translate-x-1/2 z-40 flex items-center gap-0.5 backdrop-blur-md rounded-full px-2.5 py-1.5 shadow-lg border transition-colors duration-300 ${
        isDark
          ? "bg-black/25 border-white/12 shadow-black/25"
          : "bg-white/90 border-ink/[0.06] shadow-black/8"
      } ${chromeBlocked ? "pointer-events-none" : ""}`}
    >
      {NAV_ITEMS.map(({ id, icon: Icon }) => (
        <button
          key={id}
          onClick={() => onNavigate(id)}
          className={`relative p-2.5 rounded-full transition-colors duration-200 ${
            active === id
              ? isDark
                ? "text-cream"
                : "text-ink"
              : isDark
              ? "text-cream/35"
              : "text-ink/30"
          }`}
          aria-label={
            id === "invite"
              ? "Einladung"
              : id === "details"
                ? "Details"
                : id === "schedule"
                  ? "Ablauf"
                  : id === "rsvp"
                    ? "RSVP"
                    : id === "gallery"
                      ? "Galerie"
                      : "Start"
          }
        >
          <Icon className="w-4 h-4" />
          {active === id && (
            <motion.span
              layoutId="nav-dot"
              className="absolute -bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-gold"
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
          )}
        </button>
      ))}

      <div className={`w-px h-4 mx-1.5 ${isDark ? "bg-cream/15" : "bg-ink/10"}`} />

      <button
        onClick={onToggleMusic}
        className={`relative p-2 rounded-full transition-opacity duration-200 ${
          isDark ? "text-cream/70" : "text-ink/70"
        }`}
        aria-label="Toggle music"
      >
        <IconMusic className="w-4 h-4" />
        {!musicPlaying && (
          <span
            aria-hidden="true"
            className={`absolute left-1/2 top-1/2 h-[1.5px] w-6 -translate-x-1/2 -translate-y-1/2 rotate-[-40deg] rounded-full ${
              isDark ? "bg-cream/70" : "bg-ink/70"
            }`}
          />
        )}
      </button>
    </motion.nav>
  );
}

/* ================================================================
   Page indicator dots
   ================================================================ */

function PageDots({
  active,
  onNavigate,
  isDark,
  chromeBlocked,
}: {
  active: SectionId;
  onNavigate: (id: SectionId) => void;
  isDark: boolean;
  chromeBlocked?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.6 }}
      aria-hidden={chromeBlocked}
      className={`fixed right-3 top-1/2 -translate-y-1/2 z-40 flex flex-col gap-2 ${
        chromeBlocked ? "pointer-events-none" : ""
      }`}
    >
      {SECTIONS.map((id) => (
        <button
          key={id}
          onClick={() => onNavigate(id)}
          className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
            active === id
              ? "bg-gold scale-125"
              : isDark
              ? "border border-cream/25 bg-transparent"
              : "border border-ink/15 bg-transparent"
          }`}
          aria-label={`Go to ${id}`}
        />
      ))}
    </motion.div>
  );
}

/* ================================================================
   Main Wedding component
   ================================================================ */

export default function Wedding({ guest }: { guest?: GuestEntry }) {
  const [revealed, setRevealed] = useState(false);
  /** Startet die Home-Animation erst, wenn der Umschlag die Exit-Animation beendet hat (nicht schon beim Tap). */
  const [homeIntroReady, setHomeIntroReady] = useState(false);
  const [activeSection, setActiveSection] = useState<SectionId>("home");
  const [rsvpModalOpen, setRsvpModalOpen] = useState(false);
  const [musicPlaying, setMusicPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<Partial<Record<SectionId, HTMLElement | null>>>({});

  useEffect(() => {
    window.scrollTo(0, 1);
  }, []);

  useEffect(() => {
    if (!revealed) return;
    const container = scrollRef.current;
    if (!container) return;
    const root = container;

    /** Aktive Section = letzte, deren Oberkante noch über der Viewport-Mitte liegt. Funktioniert auch bei sehr hohen Sections (Galerie auf Desktop). */
    function updateActiveFromScroll() {
      const mid = root.scrollTop + root.clientHeight / 2;
      let active: SectionId = SECTIONS[0];
      for (const id of SECTIONS) {
        const el = sectionRefs.current[id];
        if (!el) continue;
        if (el.offsetTop <= mid) active = id;
      }
      setActiveSection(active);
    }

    updateActiveFromScroll();
    root.addEventListener("scroll", updateActiveFromScroll, { passive: true });
    window.addEventListener("resize", updateActiveFromScroll);
    return () => {
      root.removeEventListener("scroll", updateActiveFromScroll);
      window.removeEventListener("resize", updateActiveFromScroll);
    };
  }, [revealed]);

  const scrollTo = (id: SectionId) => {
    sectionRefs.current[id]?.scrollIntoView({ behavior: "smooth" });
  };

  const tryPlayMusic = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    try {
      await audio.play();
      setMusicPlaying(true);
    } catch {
      setMusicPlaying(false);
    }
  };

  const handleEnvelopeOpen = () => {
    setRevealed(true);
    void tryPlayMusic();
  };

  const handleToggleMusic = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (musicPlaying) {
      audio.pause();
      setMusicPlaying(false);
      return;
    }

    void tryPlayMusic();
  };

  const isDark = DARK_SECTIONS.includes(activeSection);
  const detailsCopy = buildDetailsInvitationCopy(guest);
  const rsvpDeadlineText = rsvpDeadlineReminder(guest);

  return (
    <>
      <audio
        ref={audioRef}
        src="/music/backgroundmusic.mp3"
        preload="auto"
        loop
      />
      <AnimatePresence onExitComplete={() => setHomeIntroReady(true)}>
        {!revealed && <EnvelopeScreen onOpen={handleEnvelopeOpen} />}
      </AnimatePresence>

      <div ref={scrollRef} className="snap-container">
        {/* ── HOME ─────────────────────────────────────── */}
        <section
          ref={(el) => { sectionRefs.current.home = el; }}
          className="snap-section h-[100svh] flex flex-col items-center justify-center bg-cream px-6 pt-6 pb-24 text-center"
        >
          <HomeSectionContent isActive={activeSection === "home" && homeIntroReady} />
        </section>

        {/* ── EINLADUNG (Gästetext) ────────────────────── */}
        <section
          ref={(el) => { sectionRefs.current.invite = el; }}
          className="snap-section h-[100svh] flex flex-col items-center justify-center bg-cream px-6 pt-6 pb-24 text-center"
        >
          <AnimatedSectionContent
            isActive={activeSection === "invite"}
            containerVariants={inviteContainerVariants}
          >
            <motion.div variants={inviteIconVariants} className="flex justify-center">
              <IconHeart className="w-8 h-8 text-gold/50 mx-auto" />
            </motion.div>
            <motion.p variants={inviteLineVariants} className="font-sc text-gold/60 text-[10px] tracking-[0.36em] uppercase mt-3">
              Einladung
            </motion.p>
            <motion.div variants={inviteLineVariants}>
              <Divider className="mt-6" />
            </motion.div>
            <motion.p
              variants={inviteLineVariants}
              className="font-display text-ink text-[1.15rem] font-light leading-relaxed mt-8 max-w-[min(90vw,340px)] mx-auto"
            >
              {detailsCopy.line1}
            </motion.p>
            <motion.p
              variants={inviteLineVariants}
              className="font-display text-gray text-[15px] font-light leading-relaxed mt-5 max-w-[min(90vw,340px)] mx-auto"
            >
              {detailsCopy.line2}
            </motion.p>
            {detailsCopy.line3 && (
              <motion.p
                variants={inviteLineVariants}
                className="font-display text-gray text-[15px] font-light leading-relaxed mt-5 max-w-[min(90vw,340px)] mx-auto"
              >
                {detailsCopy.line3}
              </motion.p>
            )}
          </AnimatedSectionContent>
        </section>

        {/* ── DETAILS ──────────────────────────────────── */}
        <section
          ref={(el) => { sectionRefs.current.details = el; }}
          className="snap-section h-[100svh] flex flex-col items-center justify-center bg-ink px-6 pt-6 pb-24 text-center"
        >
          <AnimatedSectionContent
            isActive={activeSection === "details"}
            containerVariants={detailsContainerVariants}
          >
            <motion.div variants={detailsPinVariants} className="flex justify-center">
              <IconPin className="w-8 h-8 text-gold/50 mx-auto" />
            </motion.div>
            <motion.p variants={inviteLineVariants} className="font-sc text-gold/60 text-[10px] tracking-[0.36em] uppercase mt-3">
              The Details
            </motion.p>
            <motion.div variants={inviteLineVariants}>
              <Divider className="mt-6" />
            </motion.div>

            <motion.div variants={detailsBlockVariants} custom={0} className="mt-8">
              <p className="font-sc text-gold/50 text-[10px] tracking-[0.35em] uppercase">
                Location
              </p>
              <p className="font-display text-cream text-xl font-medium mt-2">
                Haverlahwiese
              </p>
              <p className="font-display text-cream/60 text-[15px] font-light mt-1 leading-relaxed">
                Gustedter Str. 201, 38229 Salzgitter
              </p>
              <p className="font-display text-gold/70 text-[15px] italic mt-2">
                Arrive from 16:00
              </p>
              <a
                href="https://www.google.com/maps/place/Eventlocation+Haverlahwiese/@52.0959001,10.3276364,1135m/data=!3m1!1e3!4m15!1m8!3m7!1s0x47a5500dc0cd43c1:0xc6f9ce343e0dbc37!2sGustedter+Str.+201,+38229+Salzgitter!3b1!8m2!3d52.0957711!4d10.3318371!16s%2Fg%2F11bw3xlpzn!3m5!1s0x47a5500c45b1c3ad:0xe38dd5915f2aa856!8m2!3d52.0961856!4d10.3350609!16s%2Fg%2F11cs40prky?entry=ttu&g_ep=EgoyMDI2MDMyOS4wIKXMDSoASAFQAw%3D%3D"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block font-sc text-gold text-[10px] tracking-[0.25em] uppercase mt-3.5 border-b border-gold/30 pb-0.5 hover:border-gold transition-colors"
              >
                View on Map
              </a>
            </motion.div>

            <motion.div variants={detailsBlockVariants} custom={1} className="mt-10">
              <p className="font-sc text-gold/50 text-[10px] tracking-[0.35em] uppercase">
                Additional Info
              </p>
              <p className="font-display text-cream/60 text-[15px] font-light mt-2">
                Parkmöglichkeiten sind gegeben.
              </p>
            </motion.div>

            <motion.div variants={detailsBlockVariants} custom={2} className="mt-8">
              <p className="font-sc text-gold/50 text-[10px] tracking-[0.35em] uppercase">
                Contact
              </p>
              <a
                href="tel:015254104825"
                className="inline-flex items-center gap-2.5 mt-2.5 text-cream/70 hover:text-cream transition-colors"
              >
                <IconPhone className="w-4 h-4" />
              <span className="font-display text-[15px] font-light">015254104825</span>
              </a>
            </motion.div>
          </AnimatedSectionContent>
        </section>

        {/* ── SCHEDULE ─────────────────────────────────── */}
        <section
          ref={(el) => { sectionRefs.current.schedule = el; }}
          className="snap-section h-[100svh] flex flex-col items-center justify-center bg-cream px-6 pt-6 pb-24 text-center"
        >
          <AnimatedSectionContent
            isActive={activeSection === "schedule"}
            containerVariants={scheduleContainerVariants}
          >
            <motion.div variants={scheduleClockVariants} className="flex justify-center">
              <IconClock className="w-8 h-8 text-gold/50 mx-auto" />
            </motion.div>
            <motion.p variants={inviteLineVariants} className="font-sc text-gold/60 text-[10px] tracking-[0.36em] uppercase mt-3">
              The Schedule
            </motion.p>
            <motion.h2 variants={inviteLineVariants} className="font-display text-ink text-[1.7rem] italic font-light mt-4">
              Order of the Day
            </motion.h2>
            <motion.div variants={inviteLineVariants}>
              <Divider className="mt-5" />
            </motion.div>
            <Timeline isActive={activeSection === "schedule"} />
          </AnimatedSectionContent>
        </section>

        {/* ── RSVP ─────────────────────────────────────── */}
        <section
          ref={(el) => { sectionRefs.current.rsvp = el; }}
          className="snap-section h-[100svh] flex flex-col items-center justify-center bg-cream px-6 pt-6 pb-24 text-center"
        >
          <AnimatedSectionContent
            isActive={activeSection === "rsvp"}
            containerVariants={rsvpContainerVariants}
          >
            <div className="[perspective:960px] flex justify-center">
              <motion.div
                variants={rsvpMailVariants}
                style={{ transformStyle: "preserve-3d" }}
                className="inline-flex"
              >
                <IconMail className="w-8 h-8 text-gold/50 mx-auto" />
              </motion.div>
            </div>
            <motion.p variants={inviteLineVariants} className="font-sc text-gold/60 text-[10px] tracking-[0.36em] uppercase mt-3">
              RSVP
            </motion.p>
            <motion.h2 variants={rsvpHeadlinePrimaryVariants} className="font-display text-ink text-[1.7rem] font-light mt-5 leading-snug">
              We&apos;d love to
            </motion.h2>
            <motion.h2 variants={rsvpHeadlineAccentVariants} className="font-display text-gold text-[1.7rem] italic font-light leading-snug">
              see you there
            </motion.h2>
            <motion.div variants={inviteLineVariants}>
              <Divider className="mt-5" />
            </motion.div>
            <motion.p variants={rsvpBodyVariants} className="font-display text-gray text-[15px] font-light leading-relaxed mt-6 max-w-[290px]">
              Wir freuen uns auf euch und können es nicht erwarten diesen
              besonderen Tag mit euch zu verbringen!
            </motion.p>
            <motion.p variants={rsvpBodyVariants} className="font-display text-ink/85 text-[15px] font-light leading-relaxed mt-5 max-w-[290px]">
              {rsvpDeadlineText}
            </motion.p>
            <motion.div variants={rsvpBodyVariants} className="w-full flex justify-center mt-2">
              <RsvpForm guest={guest} onOpenChange={setRsvpModalOpen} />
            </motion.div>
          </AnimatedSectionContent>
        </section>

        {/* ── GALLERY ──────────────────────────────────── */}
        <section
          ref={(el) => { sectionRefs.current.gallery = el; }}
          className="snap-section bg-ink px-5 pt-14 pb-24 text-center"
        >
          <AnimatedSectionContent
            isActive={activeSection === "gallery"}
            containerVariants={galleryContainerVariants}
          >
            <motion.div variants={galleryHeaderVariants} className="flex justify-center">
              <IconCamera className="w-8 h-8 text-gold/50 mx-auto" />
            </motion.div>
            <motion.p variants={galleryHeaderVariants} className="font-sc text-gold/60 text-[10px] tracking-[0.36em] uppercase mt-3">
              Moments
            </motion.p>
            <motion.h2 variants={galleryHeaderVariants} className="font-display text-cream text-[1.7rem] italic font-light mt-4">
              Our Story So Far
            </motion.h2>
            <motion.div variants={galleryGridVariants} className="grid grid-cols-2 gap-1.5 mt-7">
              {GALLERY_IMAGES.map((src, i) => (
                <motion.div
                  key={i}
                  custom={i}
                  variants={galleryCellVariants}
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 400, damping: 28 }}
                  className="relative aspect-[4/5] overflow-hidden rounded"
                >
                  <Image
                    src={src}
                    alt=""
                    fill
                    sizes="50vw"
                    className="object-cover"
                  />
                </motion.div>
              ))}
            </motion.div>
          </AnimatedSectionContent>
        </section>
      </div>

      {/* ── Bottom navbar & page dots ──────────────────── */}
      {revealed && (
        <>
          <BottomNav
            active={activeSection}
            onNavigate={scrollTo}
            musicPlaying={musicPlaying}
            onToggleMusic={handleToggleMusic}
            isDark={isDark}
            chromeBlocked={rsvpModalOpen}
          />
          <PageDots
            active={activeSection}
            onNavigate={scrollTo}
            isDark={isDark}
            chromeBlocked={rsvpModalOpen}
          />
        </>
      )}
    </>
  );
}
