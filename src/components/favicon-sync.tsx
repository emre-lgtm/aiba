"use client";

import { useEffect } from "react";
import { DEFAULT_LOGO_SRC, getLogoSrc, LOGO_UPDATED_EVENT } from "@/lib/site-settings";

export const FAVICON_UPDATED_EVENT = "aiba:favicon-updated";

function updateFavicon(href: string) {
  const head = document.head;
  const iconLinks = Array.from(
    head.querySelectorAll<HTMLLinkElement>("link[rel='icon'], link[rel='shortcut icon']")
  );
  if (iconLinks.length === 0) {
    const link = document.createElement("link");
    link.rel = "icon";
    link.href = href;
    head.appendChild(link);
    return;
  }
  iconLinks.forEach((link) => { link.href = href; });
}

export function FaviconSync() {
  useEffect(() => {
    let active = true;

    const sync = async () => {
      try {
        const res = await fetch("/api/settings");
        if (!res.ok) return;
        const data = await res.json();
        if (!active) return;

        // favicon_data_url takes priority, else fall back to logo, else default
        if (data.favicon_data_url && /^data:image\//.test(data.favicon_data_url)) {
          updateFavicon(data.favicon_data_url);
        } else {
          const logoSrc = getLogoSrc(data.logo_data_url);
          updateFavicon(logoSrc === DEFAULT_LOGO_SRC ? `/icon?v=${crypto.randomUUID()}` : logoSrc);
        }
      } catch {}
    };
    sync();

    const handleFavicon = (event: Event) => {
      const src = (event as CustomEvent<string>).detail;
      updateFavicon(src || `/icon?v=${crypto.randomUUID()}`);
    };

    const handleLogo = (event: Event) => {
      // Only update favicon from logo if no custom favicon is set
      fetch("/api/settings").then(r => r.json()).then(data => {
        if (!data.favicon_data_url) {
          const nextSrc = getLogoSrc((event as CustomEvent<string>).detail);
          updateFavicon(nextSrc === DEFAULT_LOGO_SRC ? `/icon?v=${crypto.randomUUID()}` : nextSrc);
        }
      }).catch(() => {});
    };

    window.addEventListener(FAVICON_UPDATED_EVENT, handleFavicon);
    window.addEventListener(LOGO_UPDATED_EVENT, handleLogo);

    return () => {
      active = false;
      window.removeEventListener(FAVICON_UPDATED_EVENT, handleFavicon);
      window.removeEventListener(LOGO_UPDATED_EVENT, handleLogo);
    };
  }, []);

  return null;
}
