"use client";

import { useState, useEffect, useRef, type ReactNode } from "react";
import { motion, AnimatePresence } from "motion/react";
import Image from "next/image";

/* ================================================================
   Types
   ================================================================ */

const SECTIONS = ["home", "details", "schedule", "rsvp", "gallery"] as const;
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

function AnimatedSectionContent({
  isActive,
  className,
  children,
}: {
  isActive: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <motion.div
      variants={sectionContainerVariants}
      initial={false}
      animate={isActive ? "visible" : "hidden"}
      className={className}
    >
      {children}
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

function Timeline() {
  return (
    <motion.div variants={sectionItemVariants} className="w-full max-w-[280px] mx-auto mt-10 text-left">
      {SCHEDULE.map((item, i) => (
        <motion.div key={i} variants={sectionItemVariants} className="flex items-start gap-6">
          <p className="font-display text-ink text-[1.05rem] font-light w-14 text-right shrink-0 pt-0.5">
            {item.time}
          </p>
          <div className="flex flex-col items-center shrink-0">
            <div className="w-3 h-3 rounded-full bg-gold mt-1.5" />
            {i < SCHEDULE.length - 1 && <div className="w-px h-14 bg-gold/25" />}
          </div>
          <p className="font-display text-ink text-[1.05rem] font-light pt-0.5">
            {item.event}
          </p>
        </motion.div>
      ))}
    </motion.div>
  );
}

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

function EnvelopeScreen({ onOpen }: { onOpen: () => void }) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-cream select-none cursor-pointer"
      onClick={onOpen}
      exit={{ y: "-100vh", opacity: 0 }}
      transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
    >
      <p className="font-display text-gold text-[4.2rem] italic font-light tracking-wide mb-10">
        A{" "}
        <span className="text-5xl align-middle font-normal not-italic">&amp;</span>{" "}
        A
      </p>

      <svg viewBox="0 0 260 170" className="w-72 sm:w-80" aria-hidden="true">
        <rect x="4" y="60" width="252" height="106" rx="4" fill="#F0EBE4" stroke="#C9A96E" strokeWidth="0.8" />
        <path d="M4 60 L130 130 L256 60" fill="none" stroke="#C9A96E" strokeWidth="0.5" opacity="0.35" />
        <path d="M4 60 L130 4 L256 60 Z" fill="#E8E2D8" stroke="#C9A96E" strokeWidth="0.8" />
        <circle cx="130" cy="60" r="18" fill="#8B2020" />
        <circle cx="130" cy="60" r="13" fill="none" stroke="#D4A574" strokeWidth="0.6" />
        <text x="130" y="65" textAnchor="middle" fill="#D4A574" fontSize="14" fontFamily="serif" fontStyle="italic">&amp;</text>
        {Array.from({ length: 14 }).map((_, i) => {
          const a = ((i * 360) / 14) * (Math.PI / 180);
          return (
            <circle
              key={i}
              cx={130 + 19 * Math.cos(a)}
              cy={60 + 19 * Math.sin(a)}
              r="4.5"
              fill="#8B2020"
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
}: {
  active: SectionId;
  onNavigate: (id: SectionId) => void;
  musicPlaying: boolean;
  onToggleMusic: () => void;
  isDark: boolean;
}) {
  return (
    <motion.nav
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.4, duration: 0.6, ease: "easeOut" }}
      className={`fixed bottom-5 left-1/2 -translate-x-1/2 z-40 flex items-center gap-0.5 backdrop-blur-md rounded-full px-3 py-2 shadow-lg border transition-colors duration-300 ${
        isDark
          ? "bg-black/25 border-white/12 shadow-black/25"
          : "bg-white/90 border-ink/[0.06] shadow-black/8"
      }`}
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
          aria-label={id}
        >
          <Icon className="w-[18px] h-[18px]" />
          {active === id && (
            <motion.span
              layoutId="nav-dot"
              className="absolute -bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-gold"
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
          )}
        </button>
      ))}

      <div className={`w-px h-5 mx-1.5 ${isDark ? "bg-cream/15" : "bg-ink/10"}`} />

      <button
        onClick={onToggleMusic}
        className={`relative p-2.5 rounded-full transition-opacity duration-200 ${
          isDark ? "text-cream/70" : "text-ink/70"
        }`}
        aria-label="Toggle music"
      >
        <IconMusic className="w-[18px] h-[18px]" />
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
}: {
  active: SectionId;
  onNavigate: (id: SectionId) => void;
  isDark: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.6 }}
      className="fixed right-4 top-1/2 -translate-y-1/2 z-40 flex flex-col gap-2.5"
    >
      {SECTIONS.map((id) => (
        <button
          key={id}
          onClick={() => onNavigate(id)}
          className={`w-2 h-2 rounded-full transition-all duration-300 ${
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

export default function Wedding() {
  const [revealed, setRevealed] = useState(false);
  const [activeSection, setActiveSection] = useState<SectionId>("home");
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

    const observers: IntersectionObserver[] = [];
    SECTIONS.forEach((id) => {
      const el = sectionRefs.current[id];
      if (!el) return;
      const io = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActiveSection(id);
        },
        { root: container, threshold: 0.55 }
      );
      io.observe(el);
      observers.push(io);
    });
    return () => observers.forEach((io) => io.disconnect());
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

  return (
    <>
      <audio
        ref={audioRef}
        src="/music/backgroundmusic.mp3"
        preload="auto"
        loop
      />
      <AnimatePresence>
        {!revealed && <EnvelopeScreen onOpen={handleEnvelopeOpen} />}
      </AnimatePresence>

      <div ref={scrollRef} className="snap-container">
        {/* ── HOME ─────────────────────────────────────── */}
        <section
          ref={(el) => { sectionRefs.current.home = el; }}
          className="snap-section h-[100svh] flex flex-col items-center justify-center bg-cream px-7 text-center"
        >
          <AnimatedSectionContent isActive={activeSection === "home"}>
            <motion.div variants={sectionItemVariants}>
              <VenueIllustration />
            </motion.div>
            <motion.p variants={sectionItemVariants} className="font-sc text-gold/60 text-[11px] tracking-[0.4em] uppercase mt-7">
              Hochzeitseinladung
            </motion.p>
            <motion.div variants={sectionItemVariants}>
              <Divider className="mt-9" />
            </motion.div>
            <motion.h1 variants={sectionItemVariants} className="font-display text-ink text-[3.45rem] leading-none italic font-light mt-9">
              Areso
            </motion.h1>
            <motion.p variants={sectionItemVariants} className="font-display text-gold text-2xl italic mt-2">&amp;</motion.p>
            <motion.h1 variants={sectionItemVariants} className="font-display text-ink text-[3.45rem] leading-none italic font-light mt-2">
              Armin
            </motion.h1>
            <motion.div variants={sectionItemVariants}>
              <Divider className="mt-9" />
            </motion.div>
            <motion.p variants={sectionItemVariants} className="font-sc text-gray/70 text-[11px] tracking-[0.3em] uppercase mt-9">
              Friday, September 4th, 2026
            </motion.p>
          </AnimatedSectionContent>
        </section>

        {/* ── DETAILS ──────────────────────────────────── */}
        <section
          ref={(el) => { sectionRefs.current.details = el; }}
          className="snap-section h-[100svh] flex flex-col items-center justify-center bg-ink px-7 text-center"
        >
          <AnimatedSectionContent isActive={activeSection === "details"}>
            <motion.div variants={sectionItemVariants}>
              <IconPin className="w-9 h-9 text-gold/50 mx-auto" />
            </motion.div>
            <motion.p variants={sectionItemVariants} className="font-sc text-gold/60 text-[11px] tracking-[0.4em] uppercase mt-3.5">
              The Details
            </motion.p>
            <motion.div variants={sectionItemVariants}>
              <Divider className="mt-6" />
            </motion.div>

            <motion.div variants={sectionItemVariants} className="mt-8">
              <p className="font-sc text-gold/50 text-[10px] tracking-[0.35em] uppercase">
                Location
              </p>
              <p className="font-display text-cream text-2xl font-medium mt-2.5">
                Haverlahwiese
              </p>
              <p className="font-display text-cream/60 text-base font-light mt-1.5 leading-relaxed">
                Gustedter Str. 201, 38229 Salzgitter
              </p>
              <p className="font-display text-gold/70 text-base italic mt-2.5">
                Arrive from 16:30
              </p>
              <a
                href="https://maps.google.com/?q=Gustedter+Str.+201+38229+Salzgitter"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block font-sc text-gold text-[10px] tracking-[0.25em] uppercase mt-3.5 border-b border-gold/30 pb-0.5 hover:border-gold transition-colors"
              >
                View on Map
              </a>
            </motion.div>

            <motion.div variants={sectionItemVariants} className="mt-10">
              <p className="font-sc text-gold/50 text-[10px] tracking-[0.35em] uppercase">
                Additional Info
              </p>
              <p className="font-display text-cream/60 text-base font-light mt-2.5">
                Parkmöglichkeiten sind gegeben.
              </p>
            </motion.div>

            <motion.div variants={sectionItemVariants} className="mt-8">
              <p className="font-sc text-gold/50 text-[10px] tracking-[0.35em] uppercase">
                Contact
              </p>
              <a
                href="tel:015254104825"
                className="inline-flex items-center gap-2.5 mt-2.5 text-cream/70 hover:text-cream transition-colors"
              >
                <IconPhone className="w-4 h-4" />
                <span className="font-display text-base font-light">015254104825</span>
              </a>
            </motion.div>
          </AnimatedSectionContent>
        </section>

        {/* ── SCHEDULE ─────────────────────────────────── */}
        <section
          ref={(el) => { sectionRefs.current.schedule = el; }}
          className="snap-section h-[100svh] flex flex-col items-center justify-center bg-cream px-7 text-center"
        >
          <AnimatedSectionContent isActive={activeSection === "schedule"}>
            <motion.div variants={sectionItemVariants}>
              <IconClock className="w-9 h-9 text-gold/50 mx-auto" />
            </motion.div>
            <motion.p variants={sectionItemVariants} className="font-sc text-gold/60 text-[11px] tracking-[0.4em] uppercase mt-3.5">
              The Schedule
            </motion.p>
            <motion.h2 variants={sectionItemVariants} className="font-display text-ink text-[1.9rem] italic font-light mt-5">
              Order of the Day
            </motion.h2>
            <motion.div variants={sectionItemVariants}>
              <Divider className="mt-5" />
            </motion.div>
            <Timeline />
          </AnimatedSectionContent>
        </section>

        {/* ── RSVP ─────────────────────────────────────── */}
        <section
          ref={(el) => { sectionRefs.current.rsvp = el; }}
          className="snap-section h-[100svh] flex flex-col items-center justify-center bg-cream px-7 text-center"
        >
          <AnimatedSectionContent isActive={activeSection === "rsvp"}>
            <motion.div variants={sectionItemVariants}>
              <IconMail className="w-9 h-9 text-gold/50 mx-auto" />
            </motion.div>
            <motion.p variants={sectionItemVariants} className="font-sc text-gold/60 text-[11px] tracking-[0.4em] uppercase mt-3.5">
              RSVP
            </motion.p>
            <motion.h2 variants={sectionItemVariants} className="font-display text-ink text-[1.9rem] font-light mt-6 leading-snug">
              We&apos;d love to
            </motion.h2>
            <motion.h2 variants={sectionItemVariants} className="font-display text-gold text-[1.9rem] italic font-light leading-snug">
              see you there
            </motion.h2>
            <motion.div variants={sectionItemVariants}>
              <Divider className="mt-5" />
            </motion.div>
            <motion.p variants={sectionItemVariants} className="font-display text-gray text-base font-light leading-relaxed mt-7 max-w-[300px]">
              Wir freuen uns auf euch und können es nicht erwarten diesen
              besonderen Tag mit euch zu verbringen!
            </motion.p>
            <motion.div variants={sectionItemVariants} className="flex flex-col gap-3.5 w-full max-w-[300px] mt-9">
              <button className="w-full py-3.5 border border-ink/12 font-sc text-ink text-[11px] tracking-[0.25em] uppercase transition-colors duration-200 hover:bg-gold hover:text-white hover:border-gold active:bg-gold active:text-white active:border-gold">
                Joyfully Accept
              </button>
              <button className="w-full py-3.5 border border-ink/12 font-sc text-ink text-[11px] tracking-[0.25em] uppercase transition-colors duration-200 hover:bg-gold hover:text-white hover:border-gold active:bg-gold active:text-white active:border-gold">
                Regretfully Decline
              </button>
              <button className="w-full py-3.5 border border-ink/12 font-sc text-ink text-[11px] tracking-[0.25em] uppercase transition-colors duration-200 hover:bg-gold hover:text-white hover:border-gold active:bg-gold active:text-white active:border-gold">
                Not Sure Yet
              </button>
            </motion.div>
          </AnimatedSectionContent>
        </section>

        {/* ── GALLERY ──────────────────────────────────── */}
        <section
          ref={(el) => { sectionRefs.current.gallery = el; }}
          className="snap-section bg-ink px-6 pt-16 pb-24 text-center"
        >
          <AnimatedSectionContent isActive={activeSection === "gallery"}>
            <motion.div variants={sectionItemVariants}>
              <IconCamera className="w-9 h-9 text-gold/50 mx-auto" />
            </motion.div>
            <motion.p variants={sectionItemVariants} className="font-sc text-gold/60 text-[11px] tracking-[0.4em] uppercase mt-3.5">
              Moments
            </motion.p>
            <motion.h2 variants={sectionItemVariants} className="font-display text-cream text-[1.9rem] italic font-light mt-5">
              Our Story So Far
            </motion.h2>
            <motion.div variants={sectionItemVariants} className="grid grid-cols-2 gap-2 mt-9">
              {GALLERY_IMAGES.map((src, i) => (
                <motion.div key={i} variants={sectionItemVariants} className="relative aspect-[4/5] overflow-hidden rounded">
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
          />
          <PageDots
            active={activeSection}
            onNavigate={scrollTo}
            isDark={isDark}
          />
        </>
      )}
    </>
  );
}
