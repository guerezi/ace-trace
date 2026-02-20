import {
  MatchConfig,
  MatchState,
  PlayerId,
  PointScore,
  SetScore,
} from "../entities/MatchTypes";

const INITIAL_POINTS: PointScore = {
  [PlayerId.P1]: "0",
  [PlayerId.P2]: "0",
};

const INITIAL_SET: SetScore = {
  [PlayerId.P1]: 0,
  [PlayerId.P2]: 0,
};

export const initializeMatch = (config: MatchConfig): MatchState => {
  const now = Date.now();

  return {
    config,
    startTime: now,
    durationSeconds: 0,
    isPaused: false,
    isMatchOver: false,
    currentSetIndex: 0,
    sets: [INITIAL_SET],
    games: {
      [PlayerId.P1]: 0,
      [PlayerId.P2]: 0,
    },
    points: { ...INITIAL_POINTS },
    isTieBreak: false,
    shouldSwitchSides: false,
    server: PlayerId.P1,
    history: [],
  };
};
