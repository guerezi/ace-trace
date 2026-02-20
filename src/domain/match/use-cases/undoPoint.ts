import { MatchState } from "../entities/MatchTypes";
import { initializeMatch } from "./initializeMatch";

export const undoPoint = (state: MatchState): MatchState => {
  if (state.history.length === 0) {
    return state;
  }

  const trimmedHistory = state.history.slice(0, -1);

  if (trimmedHistory.length === 0) {
    const resetState = initializeMatch(state.config);
    return {
      ...resetState,
      startTime: state.startTime,
      durationSeconds: state.durationSeconds,
    };
  }

  const lastSnapshot = trimmedHistory[trimmedHistory.length - 1].scoreSnapshot;

  return {
    ...state,
    history: trimmedHistory,
    sets: lastSnapshot.sets.map((set) => ({ ...set })),
    games: { ...lastSnapshot.games },
    points: { ...lastSnapshot.points },
    isTieBreak: lastSnapshot.isTieBreak,
    shouldSwitchSides: Boolean(
      trimmedHistory[trimmedHistory.length - 1]?.sideSwitchAfter
    ),
    isMatchOver: false,
    winner: undefined,
    currentSetIndex: Math.max(0, lastSnapshot.sets.length - 1),
  };
};
