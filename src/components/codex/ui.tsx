import { createContext, useContext, type CSSProperties, type ReactNode } from "react";
import type { MaxKg } from "@/lib/data";
import { STAGE_VAR, type Stage } from "@/lib/stages";

export function Q({ v, suffix = "" }: { v: string | number | null | undefined; suffix?: string }) {
  if (v === null || v === undefined || v === "") return <span className="num text-muted-foreground">?</span>;
  return (
    <span className="num">
      {v}
      {suffix}
    </span>
  );
}

export function fmtKg(v: MaxKg) {
  if (v === null) return null;
  if (v === "inf") return "∞";
  return v.toLocaleString("en-US");
}

export function Src({ url }: { url: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="text-xs text-primary underline-offset-2 hover:underline"
      title={url}
    >
      source ↗
    </a>
  );
}

export function StageBadge({ stage }: { stage: Stage }) {
  return (
    <span
      className="inline-flex items-center rounded border px-1.5 py-0.5 text-[11px] font-semibold uppercase tracking-widest text-glow-seafoam"
      style={{ color: STAGE_VAR[stage], borderColor: STAGE_VAR[stage] }}
    >
      {stage}
    </span>
  );
}

export function LimitedTag() {
  return (
    <span className="rounded bg-destructive/20 px-1.5 py-0.5 text-[11px] font-semibold text-destructive">
      [limited]
    </span>
  );
}

export function Bar({ have, need, color = "var(--primary)" }: { have: number; need: number; color?: string }) {
  const pct = need ? Math.min(100, (have / need) * 100) : 0;
  return (
    <div>
      <div className="mb-1 flex justify-between text-sm">
        <span className="num">
          {have} / {need}
        </span>
        <span className="num text-muted-foreground">{pct.toFixed(1)}%</span>
      </div>
      <div className="h-3 overflow-hidden rounded bg-muted">
        <div className="h-full rounded transition-all" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

export function Panel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`glass rounded-xl border p-4 ${className}`}>{children}</div>;
}

/** Official game render from the wiki's image server; hides itself if offline or missing. */
export function GameImg({ src, alt, className = "" }: { src?: string | null | undefined; alt: string; className?: string }) {
  if (!src) return null;
  return (
    <img src={src} alt={alt} loading="lazy" decoding="async" referrerPolicy="no-referrer"
      className={`object-contain drop-shadow-[0_0_12px_var(--glow)] ${className}`}
      onError={(e) => { e.currentTarget.style.display = "none"; }} />
  );
}

/** Per-page themed header: game render floating in tinted water. `hue` sets the page's water colour. */
export function PageHero({ title, img, hue, children }: { title: string; img?: string | null | undefined; hue: number; children: ReactNode }) {
  return (
    <div className="hero glass relative overflow-hidden rounded-xl border p-5"
      style={{ "--hue": hue } as CSSProperties}>
      <div className="relative z-10 max-w-[70%] sm:max-w-[75%]">
        <h1 className="mb-1 text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
        <div className="text-sm text-muted-foreground">{children}</div>
      </div>
      <GameImg src={img} alt="" className="bob absolute inset-y-3 right-3 h-[calc(100%-1.5rem)] w-28 sm:right-8 sm:w-40" />
      <div className="waves" />
    </div>
  );
}

export const inputCls =
  "glass-ctl h-9 rounded-md px-3 text-sm outline-none focus:ring-2 focus:ring-ring";
export const btnCls =
  "glass-ctl h-9 rounded-md px-3 text-sm font-medium disabled:opacity-40 disabled:shadow-none";

/** Router-agnostic rod links: routes provide a <Link>, the offline file provides a hash button. */
export type EntryKind = "rod" | "fish" | "item" | "hunt";
export type RodLinkFn = (id: string, children: ReactNode, className?: string, kind?: EntryKind) => ReactNode;
export const RodLinkCtx = createContext<RodLinkFn>((_id, children, className) => <span className={className}>{children}</span>);
export function RodLink({ id, children, className }: { id: string; children: ReactNode; className?: string }) {
  return <>{useContext(RodLinkCtx)(id, children, className, "rod")}</>;
}
/** Link to a fish/item/rod detail page in whichever build (routes or offline hash). */
export function EntryLink({ kind, id, children, className }: { kind: EntryKind; id: string; children: ReactNode; className?: string }) {
  return <>{useContext(RodLinkCtx)(id, children, className, kind)}</>;
}

/** 4-tier wrap-around fills: base, gold, prismatic, magma (overflow). Static, no animation. */
export const TIER_FILLS = [
  "oklch(0.55 0.02 240)",
  "linear-gradient(90deg, #d97706, #fbbf24)",
  "linear-gradient(90deg, #ec4899, #8b5cf6, #3b82f6, #10b981, #f59e0b)",
  "linear-gradient(90deg, #b91c1c, #ea580c, #f59e0b)",
] as const;

/** Which tier a value is in and how full that tier's bar is (0–100). */
export function tierOf(v: number, step: number) {
  const x = Math.max(0, v);
  const tier = Math.min(3, Math.floor(x / step));
  const pct = Math.min(100, ((x - tier * step) / step) * 100);
  return { tier, pct };
}

/** 8px stat gauge: track shows the tier below, the current tier's bar fills on top. */
export function TierMeter({ v, step }: { v: number | null; step: number }) {
  const { tier, pct } = v == null ? { tier: 0, pct: 0 } : tierOf(v, step);
  return (
    <div className="relative mt-1 h-2 overflow-hidden rounded bg-muted-foreground/30"
      style={tier > 0 ? { background: TIER_FILLS[tier - 1] } : undefined}
      title={v == null ? undefined : `Tier ${tier + 1}`}>
      <div className="absolute inset-y-0 left-0 rounded" style={{ width: `${pct}%`, background: TIER_FILLS[tier] }} />
    </div>
  );
}
