"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import {
  DEFAULT_LOGO_SRC,
  getLogoSrc,
  LOGO_UPDATED_EVENT,
} from "@/lib/site-settings";

let cachedLogoSrc = DEFAULT_LOGO_SRC;
let pendingLogoRequest: Promise<string> | null = null;

async function loadLogoSrc() {
  if (pendingLogoRequest) {
    return pendingLogoRequest;
  }

  pendingLogoRequest = fetch("/api/settings")
    .then(async (response) => {
      if (!response.ok) {
        return DEFAULT_LOGO_SRC;
      }

      const data = await response.json();
      return getLogoSrc(data.logo_data_url);
    })
    .catch(() => DEFAULT_LOGO_SRC)
    .then((logoSrc) => {
      cachedLogoSrc = logoSrc;
      pendingLogoRequest = null;
      return logoSrc;
    });

  return pendingLogoRequest;
}

export function Logo({ className }: { className?: string }) {
  const [src, setSrc] = useState(cachedLogoSrc);

  useEffect(() => {
    let active = true;

    loadLogoSrc().then((logoSrc) => {
      if (active) {
        setSrc(logoSrc);
      }
    });

    const handleLogoUpdated = (event: Event) => {
      const nextSrc = getLogoSrc((event as CustomEvent<string>).detail);
      cachedLogoSrc = nextSrc;
      setSrc(nextSrc);
    };

    window.addEventListener(LOGO_UPDATED_EVENT, handleLogoUpdated);

    return () => {
      active = false;
      window.removeEventListener(LOGO_UPDATED_EVENT, handleLogoUpdated);
    };
  }, []);

  return (
    <Image
      src={src}
      alt="AIBA STONE logo"
      width={240}
      height={120}
      unoptimized
      className={cn("shrink-0 object-contain", className)}
    />
  );
}
