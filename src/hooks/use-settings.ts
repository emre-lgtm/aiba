"use client";

import { useState, useEffect } from "react";
import { normalizeSiteSettings, DEFAULT_SITE_SETTINGS, type SiteSettings } from "@/lib/site-settings";

// Module-level cache so multiple components share a single fetch
let cachedSettings: SiteSettings | null = null;
let pendingPromise: Promise<SiteSettings> | null = null;

async function fetchSettings(): Promise<SiteSettings> {
  if (cachedSettings) return cachedSettings;
  if (pendingPromise) return pendingPromise;

  pendingPromise = fetch("/api/settings")
    .then((res) => (res.ok ? res.json() : null))
    .then((data) => {
      const normalized = normalizeSiteSettings(data);
      cachedSettings = normalized;
      pendingPromise = null;
      return normalized;
    })
    .catch(() => {
      pendingPromise = null;
      return DEFAULT_SITE_SETTINGS;
    });

  return pendingPromise;
}

/**
 * Returns site settings fetched from /api/settings.
 * Multiple components calling this hook share a single request thanks to the module-level cache.
 */
export function useSettings(): SiteSettings {
  const [settings, setSettings] = useState<SiteSettings>(
    cachedSettings ?? DEFAULT_SITE_SETTINGS
  );

  useEffect(() => {
    let active = true;
    fetchSettings().then((s) => {
      if (active) setSettings(s);
    });
    return () => {
      active = false;
    };
  }, []);

  return settings;
}
