/** Recurring hunt schedule maths, matching the wiki's countdown widget (period + offset from Unix epoch). */
export function parseDurationMs(d: string | null | undefined): number | null {
  const m = d?.match(/(\d+(?:\.\d+)?)\s*(second|minute|hour)/i);
  if (!m) return null;
  const n = parseFloat(m[1] ?? "0");
  const unit = (m[2] ?? "").toLowerCase();
  return n * (unit === "second" ? 1000 : unit === "minute" ? 60_000 : 3_600_000);
}

export interface SpawnState {
  /** Start of the current window if active, else null. */
  activeEndsAt: number | null;
  nextSpawnAt: number;
}

export function spawnState(nowMs: number, periodSec: number, offsetSec = 0, durationMs = 0): SpawnState {
  const p = periodSec * 1000;
  const o = offsetSec * 1000;
  const lastStart = Math.floor((nowMs - o) / p) * p + o;
  const nextSpawnAt = lastStart + p;
  const activeEndsAt = nowMs < lastStart + durationMs ? lastStart + durationMs : null;
  return { activeEndsAt, nextSpawnAt };
}

export function fmtCountdown(ms: number): string {
  const s = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return h ? `${h}h ${pad(m)}m ${pad(sec)}s` : `${pad(m)}m ${pad(sec)}s`;
}
