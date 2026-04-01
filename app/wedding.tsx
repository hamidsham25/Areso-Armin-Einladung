"use client";

import { useState, useEffect, useRef, type ReactNode } from "react";
import { motion, AnimatePresence } from "motion/react";
import Image from "next/image";

/* ================================================================
   Intersection-observer fade-in wrapper
   ================================================================ */

function FadeIn({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVisible(true);
          io.unobserve(el);
        }
      },
      { threshold: 0.15 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 36 }}
      animate={visible ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.85, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ================================================================
   Small ornamental divider
   ================================================================ */

function Ornament() {
  return (
    <svg
      viewBox="0 0 120 12"
      className="mx-auto w-28 text-gold"
      aria-hidden="true"
    >
      <line
        x1="0"
        y1="6"
        x2="48"
        y2="6"
        stroke="currentColor"
        strokeWidth="0.6"
      />
      <path
        d="M54 6 L60 1 L66 6 L60 11 Z"
        fill="currentColor"
        opacity="0.7"
      />
      <line
        x1="72"
        y1="6"
        x2="120"
        y2="6"
        stroke="currentColor"
        strokeWidth="0.6"
      />
    </svg>
  );
}

/* ================================================================
   Static envelope / splash screen  (Screen 1)
   ================================================================ */

function EnvelopeScreen({ onOpen }: { onOpen: () => void }) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-cream select-none cursor-pointer"
      onClick={onOpen}
      exit={{ y: "-100vh", opacity: 0 }}
      transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
    >
      {/* Monogram */}
      <p className="font-display text-gold text-6xl italic font-light tracking-wide mb-10">
        A{" "}
        <span className="text-4xl align-middle font-normal not-italic">&amp;</span>{" "}
        A
      </p>

      {/* Static envelope illustration (inline SVG) */}
      <svg
        viewBox="0 0 260 170"
        className="w-64 sm:w-72"
        aria-hidden="true"
      >
        {/* Body */}
        <rect
          x="4"
          y="60"
          width="252"
          height="106"
          rx="4"
          fill="#F0EBE4"
          stroke="#C9A96E"
          strokeWidth="0.8"
        />
        {/* Inner V lines */}
        <path
          d="M4 60 L130 130 L256 60"
          fill="none"
          stroke="#C9A96E"
          strokeWidth="0.5"
          opacity="0.35"
        />
        {/* Flap */}
        <path
          d="M4 60 L130 4 L256 60 Z"
          fill="#E8E2D8"
          stroke="#C9A96E"
          strokeWidth="0.8"
        />
        {/* Wax seal */}
        <circle cx="130" cy="60" r="18" fill="#8B2020" />
        <circle cx="130" cy="60" r="13" fill="none" stroke="#D4A574" strokeWidth="0.6" />
        <text
          x="130"
          y="65"
          textAnchor="middle"
          fill="#D4A574"
          fontSize="14"
          fontFamily="serif"
          fontStyle="italic"
        >
          &amp;
        </text>
        {/* Seal scallop bumps */}
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

      {/* Tap prompt */}
      <p className="mt-10 font-sc text-gray text-[11px] tracking-[0.35em] uppercase animate-pulse-soft">
        Tap to open
      </p>
    </motion.div>
  );
}

/* ================================================================
   Invitation (Screen 2)
   ================================================================ */

function Invitation() {
  return (
    <div className="min-h-screen">
      {/* ── Hero: photo ~2/3 screen + text below ──── */}
      <section className="image-section image-section-hero relative h-[78svh] overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=1600&q=90"
          alt=""
          fill
          sizes="100vw"
          className="object-cover"
          priority
        />
      </section>

      {/* ── Invitation text (visible on first viewport) */}
      <section className="relative bg-cream pt-10 pb-24 px-6 text-center">
        <FadeIn className="max-w-md mx-auto">
          <p className="font-display text-ink text-4xl sm:text-5xl italic font-light leading-tight">
            Areso &amp; Armin
          </p>
          <p className="font-sc text-gold text-xs tracking-[0.3em] mt-4 uppercase">
            20. September 2025
          </p>
        </FadeIn>

        <FadeIn className="max-w-md mx-auto mt-12" delay={0.1}>
          <Ornament />
          <p className="font-display text-ink text-xl sm:text-2xl italic font-light leading-relaxed mt-8">
            Together with their families
          </p>
          <p className="font-display text-ink text-3xl sm:text-4xl italic font-light mt-4 mb-4">
            Areso &amp; Armin
          </p>
          <p className="font-display text-ink text-xl sm:text-2xl italic font-light leading-relaxed">
            request the honour of your presence
            <br />
            at the celebration of their marriage
          </p>
        </FadeIn>

        <FadeIn className="max-w-md mx-auto mt-12" delay={0.2}>
          <Ornament />
          <p className="font-display text-ink text-lg sm:text-xl font-light mt-8 leading-relaxed">
            Saturday, the twentieth of September
            <br />
            Two thousand and twenty-five
            <br />
            at five o&apos;clock in the evening
          </p>
          <p className="font-sc text-gray text-sm tracking-[0.2em] mt-6 uppercase">
            Düsseldorf
          </p>
        </FadeIn>
      </section>

      {/* ── Full-bleed image 2 ───────────────────────── */}
      <section className="image-section relative h-[82svh] overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=1600&q=90"
          alt=""
          fill
          sizes="100vw"
          className="object-cover"
        />
      </section>

      {/* ── Quote ────────────────────────────────────── */}
      <section className="relative bg-cream py-24 px-6 text-center">
        <FadeIn className="max-w-sm mx-auto">
          <blockquote className="font-display text-ink text-xl sm:text-2xl italic font-light leading-relaxed">
            &ldquo;Whatever our souls are made of, his and mine are the
            same.&rdquo;
          </blockquote>
          <p className="font-sc text-gray text-xs tracking-[0.2em] mt-6 uppercase">
            Emily Brontë
          </p>
          <div className="mt-10">
            <Ornament />
          </div>
        </FadeIn>
      </section>

      {/* ── Full-bleed image 3 ───────────────────────── */}
      <section className="image-section relative h-[82svh] overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=1600&q=90"
          alt=""
          fill
          sizes="100vw"
          className="object-cover"
        />
      </section>

      {/* ── Details ──────────────────────────────────── */}
      <section className="relative bg-cream py-24 px-6 text-center">
        <FadeIn className="max-w-md mx-auto">
          <p className="font-sc text-gold text-[11px] tracking-[0.35em] uppercase mb-6">
            Details
          </p>
          <Ornament />

          <div className="mt-10 space-y-8 font-display text-ink text-lg font-light leading-relaxed">
            <div>
              <p className="font-sc text-gray text-xs tracking-[0.25em] uppercase mb-2">
                Dress Code
              </p>
              <p>Formal Attire</p>
            </div>
            <div>
              <p className="font-sc text-gray text-xs tracking-[0.25em] uppercase mb-2">
                RSVP
              </p>
              <p>Kindly respond by August 15, 2025</p>
            </div>
            <div>
              <p className="font-display italic text-base text-gray leading-relaxed max-w-xs mx-auto mt-4">
                We can&apos;t wait to celebrate this special day with the people
                who mean the most to us. Your presence is the greatest gift.
              </p>
            </div>
          </div>
        </FadeIn>

        {/* ── Buttons ─────────────────────────────────── */}
        <FadeIn className="mt-16" delay={0.1}>
          <div className="flex flex-wrap justify-center gap-4 max-w-md mx-auto">
            <a
              href="#"
              className="flex-1 min-w-[120px] inline-flex items-center justify-center gap-2 py-3.5 px-5 border border-ink/20 rounded-none font-sc text-ink text-xs tracking-[0.2em] uppercase transition-colors duration-300 hover:bg-gold hover:text-white hover:border-gold"
            >
              <span aria-hidden="true">📍</span> Location
            </a>
            <a
              href="#"
              className="flex-1 min-w-[120px] inline-flex items-center justify-center gap-2 py-3.5 px-5 border border-ink/20 rounded-none font-sc text-ink text-xs tracking-[0.2em] uppercase transition-colors duration-300 hover:bg-gold hover:text-white hover:border-gold"
            >
              <span aria-hidden="true">🗓</span> Calendar
            </a>
            <a
              href="#"
              className="flex-1 min-w-[120px] inline-flex items-center justify-center gap-2 py-3.5 px-5 border border-ink/20 rounded-none font-sc text-ink text-xs tracking-[0.2em] uppercase transition-colors duration-300 hover:bg-gold hover:text-white hover:border-gold"
            >
              <span aria-hidden="true">✉️</span> RSVP
            </a>
          </div>
        </FadeIn>
      </section>

      {/* ── Footer ────────────────────────────────────── */}
      <footer className="bg-cream pt-8 pb-16 px-6 text-center">
        <Ornament />
        <p className="font-display text-gold text-4xl italic font-light mt-8">
          A{" "}
          <span className="text-2xl align-middle not-italic font-normal">
            &amp;
          </span>{" "}
          A
        </p>
        <p className="font-display text-ink text-lg font-light mt-2">
          Areso &amp; Armin
        </p>
        <p className="font-sc text-gray text-xs tracking-[0.25em] mt-1 uppercase">
          20.09.2025
        </p>
        <div className="mt-8">
          <Ornament />
        </div>
      </footer>
    </div>
  );
}

/* ================================================================
   Main export – orchestrates envelope → invitation
   ================================================================ */

export default function Wedding() {
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 1);
  }, []);

  useEffect(() => {
    document.body.style.overflow = revealed ? "" : "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [revealed]);

  return (
    <>
      <AnimatePresence>
        {!revealed && <EnvelopeScreen onOpen={() => setRevealed(true)} />}
      </AnimatePresence>
      <Invitation />
    </>
  );
}
