import { getGuestBySlug, guestLocale } from "@/lib/guests";

export default async function EinladungSlugLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const guest = getGuestBySlug(slug);
  const lang = guestLocale(guest) === "en" ? "en" : "de";

  return <div lang={lang}>{children}</div>;
}
