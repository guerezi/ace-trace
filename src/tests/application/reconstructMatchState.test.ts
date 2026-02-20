import { describe, expect, it } from "vitest";
import { reconstructMatchState } from "../../application/live-sync/reconstructMatchState";
import { PlayerId, PointScore } from "../../domain/match/entities/MatchTypes";
import { DEFAULT_MATCH_CONFIG } from "../../shared/defaultConfig";

describe("reconstructMatchState()", () => {
  it("rebuilds state from summary + realtime", () => {
    const summary = {
      id: "m-1",
      p1Name: "A",
      p2Name: "B",
      scoreSummary: "6-4, 2-1",
      currentGames: { [PlayerId.P1]: 2, [PlayerId.P2]: 1 },
      currentSets: [
        { [PlayerId.P1]: 6, [PlayerId.P2]: 4 },
        { [PlayerId.P1]: 0, [PlayerId.P2]: 0 },
      ],
      server: PlayerId.P1,
      creatorUid: "u1",
      isDoubles: false,
      status: "LIVE" as const,
      durationSeconds: 180,
      startTime: 100,
      isPaused: false,
      config: DEFAULT_MATCH_CONFIG,
    };

    const realtime = {
      points: { [PlayerId.P1]: "30", [PlayerId.P2]: "15" } as PointScore,
      isTieBreak: false,
      history: [],
    };

    const state = reconstructMatchState(
      summary,
      realtime,
      DEFAULT_MATCH_CONFIG
    );

    expect(state.matchId).toBe("m-1");
    expect(state.currentSetIndex).toBe(1);
    expect(state.points[PlayerId.P1]).toBe("30");
    expect(state.shouldSwitchSides).toBe(false);
  });

  it("handles drift when realtime is missing", () => {
    const summary = {
      id: "m-2",
      p1Name: "A",
      p2Name: "B",
      scoreSummary: "0-0",
      currentGames: { [PlayerId.P1]: 0, [PlayerId.P2]: 0 },
      currentSets: [{ [PlayerId.P1]: 0, [PlayerId.P2]: 0 }],
      server: PlayerId.P2,
      creatorUid: "u2",
      isDoubles: false,
      status: "LIVE" as const,
      durationSeconds: 0,
      startTime: 100,
      isPaused: true,
    };

    const state = reconstructMatchState(summary, null, DEFAULT_MATCH_CONFIG);

    expect(state.points[PlayerId.P1]).toBe("0");
    expect(state.points[PlayerId.P2]).toBe("0");
    expect(state.history).toHaveLength(0);
    expect(state.server).toBe(PlayerId.P2);
  });

  it("maps summary player colors into reconstructed config", () => {
    const summary = {
      id: "m-3",
      p1Name: "Alice",
      p2Name: "Bob",
      p1Color: "purple",
      p2Color: "green",
      scoreSummary: "1-0",
      currentGames: { [PlayerId.P1]: 1, [PlayerId.P2]: 0 },
      currentSets: [{ [PlayerId.P1]: 0, [PlayerId.P2]: 0 }],
      server: PlayerId.P1,
      creatorUid: "u3",
      isDoubles: false,
      status: "LIVE" as const,
      durationSeconds: 20,
      startTime: 100,
      isPaused: false,
    };

    const state = reconstructMatchState(summary, null, DEFAULT_MATCH_CONFIG);

    expect(state.config.p1Color).toBe("purple");
    expect(state.config.p2Color).toBe("green");
  });
});
