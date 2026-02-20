import { describe, expect, it } from "vitest";
import { PlayerId } from "../../domain/match/entities/MatchTypes";
import { addPoint } from "../../domain/match/use-cases/addPoint";
import { initializeMatch } from "../../domain/match/use-cases/initializeMatch";
import { DEFAULT_MATCH_CONFIG } from "../../shared/defaultConfig";

describe("addPoint()", () => {
  it("wins a no-ad game at deuce", () => {
    let state = initializeMatch({
      ...DEFAULT_MATCH_CONFIG,
      useAdvantage: false,
    });

    // Reach 40-40
    state = addPoint(state, PlayerId.P1);
    state = addPoint(state, PlayerId.P1);
    state = addPoint(state, PlayerId.P1);
    state = addPoint(state, PlayerId.P2);
    state = addPoint(state, PlayerId.P2);
    state = addPoint(state, PlayerId.P2);

    expect(state.points[PlayerId.P1]).toBe("40");
    expect(state.points[PlayerId.P2]).toBe("40");

    // Next point wins game in no-ad
    state = addPoint(state, PlayerId.P1);

    expect(state.games[PlayerId.P1]).toBe(1);
    expect(state.games[PlayerId.P2]).toBe(0);
    expect(state.points[PlayerId.P1]).toBe("0");
    expect(state.points[PlayerId.P2]).toBe("0");
    expect(state.history[state.history.length - 1]?.type).toBe("GAME_WIN");
  });

  it("handles advantage/deuce transitions correctly", () => {
    let state = initializeMatch({
      ...DEFAULT_MATCH_CONFIG,
      useAdvantage: true,
    });

    // Reach deuce
    for (let i = 0; i < 3; i += 1) {
      state = addPoint(state, PlayerId.P1);
      state = addPoint(state, PlayerId.P2);
    }

    state = addPoint(state, PlayerId.P1); // Ad P1
    expect(state.points[PlayerId.P1]).toBe("Ad");

    state = addPoint(state, PlayerId.P2); // back to deuce
    expect(state.points[PlayerId.P1]).toBe("40");
    expect(state.points[PlayerId.P2]).toBe("40");
  });

  it("enters tie-break at configured game threshold", () => {
    let state = initializeMatch({
      ...DEFAULT_MATCH_CONFIG,
      tieBreakAt: 2,
      tieBreakPoints: 7,
      useAdvantage: false,
    });

    // P1 wins one game, P2 wins one game, then both win to 2-2 (tiebreak trigger)
    const winGame = (winner: PlayerId, current: typeof state) => {
      let next = current;
      next = addPoint(next, winner);
      next = addPoint(next, winner);
      next = addPoint(next, winner);
      next = addPoint(next, winner);
      return next;
    };

    state = winGame(PlayerId.P1, state); // 1-0
    state = winGame(PlayerId.P2, state); // 1-1
    state = winGame(PlayerId.P1, state); // 2-1
    state = winGame(PlayerId.P2, state); // 2-2 => tiebreak

    expect(state.isTieBreak).toBe(true);
    expect(state.points[PlayerId.P1]).toBe(0);
    expect(state.points[PlayerId.P2]).toBe(0);
  });

  it("wins deciding super tie-break at 10 points", () => {
    const state = initializeMatch({
      ...DEFAULT_MATCH_CONFIG,
      setsToWin: 2,
      finalSetType: "superTieBreak",
    });

    // Simulate deciding set in super tie-break mode: 1 set each and current TB at 9-8.
    state.sets = [
      { [PlayerId.P1]: 6, [PlayerId.P2]: 4 },
      { [PlayerId.P1]: 4, [PlayerId.P2]: 6 },
      { [PlayerId.P1]: 0, [PlayerId.P2]: 0 },
    ];
    state.currentSetIndex = 2;
    state.games = { [PlayerId.P1]: 0, [PlayerId.P2]: 0 };
    state.isTieBreak = true;
    state.points = { [PlayerId.P1]: 9, [PlayerId.P2]: 8 };

    const next = addPoint(state, PlayerId.P1);

    expect(next.isMatchOver).toBe(true);
    expect(next.winner).toBe(PlayerId.P1);
    expect(next.history[next.history.length - 1]?.type).toBe("MATCH_WIN");
  });
});
