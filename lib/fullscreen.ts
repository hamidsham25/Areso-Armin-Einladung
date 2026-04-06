/**
 * Vollbild nur sinnvoll auf Touch / schmalen Viewports; iPadOS meldet sich oft als "MacIntel".
 */
export function isMobileFullscreenContext(): boolean {
  if (typeof window === "undefined") return false;
  const ua = navigator.userAgent || "";
  const isIOSPhone = /iPhone|iPod/i.test(ua);
  const isIPad =
    /iPad/i.test(ua) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const mq = window.matchMedia.bind(window);
  const narrow = mq("(max-width: 1024px)").matches;
  const coarse = mq("(pointer: coarse)").matches;
  const noHover = mq("(hover: none)").matches;
  return isIOSPhone || isIPad || (narrow && coarse) || (coarse && noHover);
}

type FullscreenCapable = HTMLElement & {
  webkitRequestFullscreen?: () => Promise<void> | void;
  mozRequestFullScreen?: () => Promise<void> | void;
  msRequestFullscreen?: () => Promise<void> | void;
};

function tryFullscreenNode(el: Element): boolean {
  const h = el as FullscreenCapable;
  const req =
    el.requestFullscreen?.bind(el) ??
    h.webkitRequestFullscreen?.bind(el) ??
    h.mozRequestFullScreen?.bind(el) ??
    h.msRequestFullscreen?.bind(el);
  if (!req) return false;
  try {
    const out = req();
    if (out !== undefined && typeof (out as Promise<void>).catch === "function") {
      (out as Promise<void>).catch(() => {});
    }
    return true;
  } catch {
    return false;
  }
}

/** Im selben synchronen Tap-Handler aufrufen (User Activation). */
export function tryEnterFullscreenFromUserGesture(): void {
  if (typeof document === "undefined") return;
  if (tryFullscreenNode(document.documentElement)) return;
  tryFullscreenNode(document.body);
}
