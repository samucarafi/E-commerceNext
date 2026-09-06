"use client";

import { Check, Copy, Share2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

export default function AffiliateShareButton({ slug, name }: { slug: string; name: string }) {
  const { user } = useAuth();
  const [code, setCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [canShare, setCanShare] = useState(false);

  useEffect(() => {
    setCanShare(typeof navigator !== "undefined" && Boolean(navigator.share));
  }, []);

  useEffect(() => {
    if (!user) return;
    fetch("/api/affiliate")
      .then((response) => response.ok ? response.json() : null)
      .then((data) => setCode(data?.affiliate?.couponCode ?? null))
      .catch(() => setCode(null));
  }, [user]);

  if (!code) return null;

  const affiliateCode = code;

  async function share() {
    const url = `${window.location.origin}/produtos/${encodeURIComponent(slug)}?ref=${encodeURIComponent(affiliateCode)}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: name, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // O usuário pode cancelar o compartilhamento nativo.
    }
  }

  return (
    <button
      type="button"
      onClick={share}
      className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-[#d9ccbf] bg-white px-4 py-3 text-sm font-medium text-[#5b2333] transition hover:border-[#C6A75E]"
    >
      {copied ? <Check size={16} /> : canShare ? <Share2 size={16} /> : <Copy size={16} />}
      {copied ? "Link copiado" : "Compartilhar como afiliado"}
    </button>
  );
}
