import { describe, expect, it } from "vitest";
import { parseDurationMs, spawnState } from "./huntTimer";

const H = 3_600_000;
const MIN = 60_000;

describe("hunt timers", () => {
  it("Mosslurker spawns every 4 hours on the UTC 4-hour marks", () => {
    const now = Date.UTC(2026, 9, 7, 9, 30);
    expect(spawnState(now, 14400, 0, 15 * MIN).nextSpawnAt).toBe(Date.UTC(2026, 9, 7, 12, 0));
  });
  it("is active for 15 minutes after a spawn, then inactive", () => {
    expect(spawnState(Date.UTC(2026, 9, 7, 8, 10), 14400, 0, 15 * MIN).activeEndsAt).toBe(Date.UTC(2026, 9, 7, 8, 15));
    expect(spawnState(Date.UTC(2026, 9, 7, 8, 16), 14400, 0, 15 * MIN).activeEndsAt).toBeNull();
  });
  it("Dreadfin uses a 3.5 hour period", () => {
    const s = spawnState(0 + 1, 12600, 0, 0);
    expect(s.nextSpawnAt).toBe(3.5 * H);
  });
  it("parses wiki durations", () => {
    expect(parseDurationMs("15 Minutes")).toBe(15 * MIN);
    expect(parseDurationMs(null)).toBeNull();
  });
});
