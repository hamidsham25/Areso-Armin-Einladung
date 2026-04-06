import Wedding from "@/app/wedding";
import { getAllGuests, getGuestBySlug, guestDisplayLabel } from "@/lib/guests";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

export const dynamicParams = false;

export async function generateStaticParams() {
  return getAllGuests().map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const guest = getGuestBySlug(slug);
  if (!guest) {
    return { title: "Einladung — Areso & Armin" };
  }
  const label = guestDisplayLabel(guest);
  return {
    title: `${label} — Areso & Armin`,
    description: `Hochzeitseinladung für ${label}`,
  };
}

export default async function EinladungPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const guest = getGuestBySlug(slug);
  if (!guest) notFound();

  return <Wedding guest={guest} />;
}
