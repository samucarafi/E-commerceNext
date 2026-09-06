"use client";

import { useEffect } from "react";

const COOKIE_NAME = "affiliate_ref";

export default function AffiliateTracker() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref")?.trim().toUpperCase();

    if (!ref) return;

    const maxAge = 60 * 60 * 24 * 30;
    document.cookie = `${COOKIE_NAME}=${encodeURIComponent(ref)}; path=/; max-age=${maxAge}; samesite=lax`;
  }, []);

  return null;
}
