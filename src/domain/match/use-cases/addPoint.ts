import {
  HistoryEvent,
  MatchState,
  PlayerId,
  PointLabel,
} from "../entities/MatchTypes";

const nextPointLabel = (current: PointLabel): PointLabel => {
  if (current === "0") {
    return "15";
  }
  if (current === "15") {
    return "30";
  }
  if (current === "30") {
    return "40";
  }

  return current;
};

const otherPlayer = (id: PlayerId): PlayerId =>
  id === PlayerId.P1 ? PlayerId.P2 : PlayerId.P1;

const cloneState = (state: MatchState): MatchState => ({
  ...state,
  sets: state.sets.map((set) => ({ ...set })),
  games: { ...state.games },
  points: { ...state.points },
  history: state.history.map((entry) => ({
    ...entry,
    scoreSnapshot: {
      sets: entry.scoreSnapshot.sets.map((set) => ({ ...set })),
      games: { ...entry.scoreSnapshot.games },
      points: { ...entry.scoreSnapshot.points },
      isTieBreak: entry.scoreSnapshot.isTieBreak,
    },
  })),
});

const countSetWins = (state: MatchState, playerId: PlayerId): number =>
  state.sets.reduce((wins, set) => {
    if (set[playerId] > set[otherPlayer(playerId)]) {
      return wins + 1;
    }
    return wins;
  }, 0);

const isDeciderSet = (state: MatchState): boolean => {
  const currentSetNumber = state.currentSetIndex + 1;
  const maxSets = state.config.setsToWin * 2 - 1;

  return currentSetNumber === maxSets;
};

const addHistoryEvent = (
  state: MatchState,
  winner: PlayerId,
  type: HistoryEvent["type"],
  sideSwitchAfter: boolean
): void => {
  state.history.push({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
    timestamp: Date.now(),
    winnerId: winner,
    type,
    sideSwitchAfter,
    scoreSnapshot: {
      sets: state.sets.map((set) => ({ ...set })),
      games: { ...state.games },
      points: { ...state.points },
      isTieBreak: state.isTieBreak,
    },
  });
};

const shouldSwitchSides = (
  state: MatchState,
  eventType: HistoryEvent["type"],
  wasTieBreak: boolean
): boolean => {
  if (state.isTieBreak && eventType === "POINT") {
    const p1 = Number(state.points[PlayerId.P1]);
    const p2 = Number(state.points[PlayerId.P2]);
    const total = p1 + p2;
    return total > 0 && total % 6 === 0;
  }

  const isSetTransition = eventType === "SET_WIN" && !state.isMatchOver;
  if (
    eventType !== "GAME_WIN" &&
    !isSetTransition &&
    eventType !== "MATCH_WIN"
  ) {
    return false;
  }

  if (eventType === "SET_WIN" || eventType === "MATCH_WIN") {
    const finishedSet =
      state.sets[state.currentSetIndex - (eventType === "SET_WIN" ? 1 : 0)] ??
      state.sets[state.currentSetIndex] ??
      state.sets[state.currentSetIndex - 1];
    if (!finishedSet) {
      return false;
    }
    const totalGames = finishedSet[PlayerId.P1] + finishedSet[PlayerId.P2];
    return totalGames % 2 !== 0;
  }

  const totalGames = state.games[PlayerId.P1] + state.games[PlayerId.P2];
  return totalGames > 0 && totalGames % 2 !== 0;
};

const resolveTieBreakPoint = (state: MatchState, winner: PlayerId): boolean => {
  const loser = otherPlayer(winner);

  const winnerScore = Number(state.points[winner]) + 1;
  const loserScore = Number(state.points[loser]);

  state.points[winner] = winnerScore;

  const requiredPoints =
    state.config.finalSetType === "superTieBreak" && isDeciderSet(state)
      ? 10
      : state.config.tieBreakPoints;

  return winnerScore >= requiredPoints && winnerScore - loserScore >= 2;
};

const resolveStandardPoint = (state: MatchState, winner: PlayerId): boolean => {
  const loser = otherPlayer(winner);
  const winnerPoint = state.points[winner];
  const loserPoint = state.points[loser];

  if (winnerPoint === "Ad") {
    return true;
  }

  if (winnerPoint !== "40") {
    state.points[winner] = nextPointLabel(winnerPoint);
    return false;
  }

  if (loserPoint === "Ad") {
    state.points[loser] = "40";
    return false;
  }

  if (loserPoint === "40" && state.config.useAdvantage) {
    state.points[winner] = "Ad";
    return false;
  }

  return true;
};

const maybeFinishSet = (state: MatchState, winner: PlayerId): boolean => {
  const loser = otherPlayer(winner);
  const winnerGames = state.games[winner];
  const loserGames = state.games[loser];

  if (state.isTieBreak) {
    return true;
  }

  if (
    winnerGames >= state.config.tieBreakAt + 1 &&
    winnerGames - loserGames >= 2
  ) {
    return true;
  }

  if (
    winnerGames === state.config.tieBreakAt &&
    loserGames <= state.config.tieBreakAt - 2
  ) {
    return true;
  }

  if (
    winnerGames === state.config.tieBreakAt &&
    loserGames === state.config.tieBreakAt
  ) {
    state.isTieBreak = true;
    state.points = {
      [PlayerId.P1]: 0,
      [PlayerId.P2]: 0,
    };
  }

  return false;
};

export const addPoint = (state: MatchState, winner: PlayerId): MatchState => {
  if (state.isMatchOver || state.isPaused) {
    return state;
  }

  const nextState = cloneState(state);
  const wasTieBreak = nextState.isTieBreak;

  const hasGameBeenWon = nextState.isTieBreak
    ? resolveTieBreakPoint(nextState, winner)
    : resolveStandardPoint(nextState, winner);

  if (!hasGameBeenWon) {
    const switchSides = shouldSwitchSides(nextState, "POINT", wasTieBreak);
    nextState.shouldSwitchSides = switchSides;
    addHistoryEvent(nextState, winner, "POINT", switchSides);
    return nextState;
  }

  nextState.games[winner] += 1;
  nextState.points = {
    [PlayerId.P1]: "0",
    [PlayerId.P2]: "0",
  };

  const shouldSetEnd = maybeFinishSet(nextState, winner);

  if (!shouldSetEnd) {
    nextState.server = otherPlayer(nextState.server);
    const switchSides = shouldSwitchSides(nextState, "GAME_WIN", wasTieBreak);
    nextState.shouldSwitchSides = switchSides;
    addHistoryEvent(nextState, winner, "GAME_WIN", switchSides);
    return nextState;
  }

  nextState.sets[nextState.currentSetIndex] = {
    [PlayerId.P1]: nextState.games[PlayerId.P1],
    [PlayerId.P2]: nextState.games[PlayerId.P2],
  };

  const p1Wins = countSetWins(nextState, PlayerId.P1);
  const p2Wins = countSetWins(nextState, PlayerId.P2);

  if (
    p1Wins >= nextState.config.setsToWin ||
    p2Wins >= nextState.config.setsToWin
  ) {
    nextState.isMatchOver = true;
    nextState.winner = p1Wins > p2Wins ? PlayerId.P1 : PlayerId.P2;
    const switchSides = shouldSwitchSides(nextState, "MATCH_WIN", wasTieBreak);
    nextState.shouldSwitchSides = switchSides;
    addHistoryEvent(nextState, winner, "MATCH_WIN", switchSides);
    return nextState;
  }

  nextState.currentSetIndex += 1;
  nextState.sets.push({
    [PlayerId.P1]: 0,
    [PlayerId.P2]: 0,
  });
  nextState.games = {
    [PlayerId.P1]: 0,
    [PlayerId.P2]: 0,
  };

  const startSuperTieBreak =
    nextState.config.finalSetType === "superTieBreak" &&
    isDeciderSet(nextState);

  nextState.isTieBreak = startSuperTieBreak;
  nextState.server = otherPlayer(nextState.server);

  if (startSuperTieBreak) {
    nextState.points = {
      [PlayerId.P1]: 0,
      [PlayerId.P2]: 0,
    };
  }

  const switchSides = shouldSwitchSides(nextState, "SET_WIN", wasTieBreak);
  nextState.shouldSwitchSides = switchSides;
  addHistoryEvent(nextState, winner, "SET_WIN", switchSides);

  return nextState;
};
