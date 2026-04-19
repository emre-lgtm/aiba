"use client";

import { useEffect } from "react";
import {
  DEFAULT_LOGO_SRC,
  getLogoSrc,
  LOGO_UPDATED_EVENT,
} from "@/lib/site-settings";

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

  iconLinks.forEach((link) => {
    link.href = href;
  });
}

export function FaviconSync() {
  useEffect(() => {
    let active = true;

    const syncFromSettings = async () => {
      try {
        const response = await fetch("/api/settings");
        if (!response.ok) {
          return;
        }

        const data = await response.json();
        if (!active) {
          return;
        }

        const logoSrc = getLogoSrc(data.logo_data_url);
        updateFavicon(
          logoSrc === DEFAULT_LOGO_SRC ? `/icon?v=${crypto.randomUUID()}` : logoSrc
        );
      } catch {}
    };

    syncFromSettings();

    const handleLogoUpdated = (event: Event) => {
      const nextSrc = getLogoSrc((event as CustomEvent<string>).detail);
      updateFavicon(
        nextSrc === DEFAULT_LOGO_SRC ? `/icon?v=${crypto.randomUUID()}` : nextSrc
      );
    };

    window.addEventListener(LOGO_UPDATED_EVENT, handleLogoUpdated);

    return () => {
      active = false;
      window.removeEventListener(LOGO_UPDATED_EVENT, handleLogoUpdated);
    };
  }, []);

  return null;
}
