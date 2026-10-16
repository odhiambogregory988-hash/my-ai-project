"use client";

// Kept separate from lib/season.ts so the admin API route can import the data
// helpers without dragging React hooks into server code.

import { useEffect, useState } from "react";
import { DEFAULT_SEASON, loadPublishedSeason, Season } from "@/lib/season";

/** The season the admin has published, or the built-in default while loading. */
export function usePublishedSeason() {
  const [season, setSeason] = useState<Season>(DEFAULT_SEASON);
  const [seasonReady, setSeasonReady] = useState(false);

  useEffect(() => {
    let active = true;
    loadPublishedSeason()
      .then((next) => {
        if (active) setSeason(next);
      })
      .catch(() => {})
      .finally(() => {
        if (active) setSeasonReady(true);
      });
    return () => {
      active = false;
    };
  }, []);

  return { season, seasonReady };
}
