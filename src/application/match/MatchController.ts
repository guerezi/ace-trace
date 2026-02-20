import {
  MatchConfig,
  MatchState,
  PlayerId,
} from "../../domain/match/entities/MatchTypes";
import { addPoint } from "../../domain/match/use-cases/addPoint";
import { initializeMatch } from "../../domain/match/use-cases/initializeMatch";
import { undoPoint } from "../../domain/match/use-cases/undoPoint";

export interface MatchController {
  create(config: MatchConfig): MatchState;
  scorePoint(state: MatchState, winner: PlayerId): MatchState;
  undo(state: MatchState): MatchState;
  togglePause(state: MatchState): MatchState;
  tick(state: MatchState): MatchState;
}

export class DefaultMatchController implements MatchController {
  create(config: MatchConfig): MatchState {
    return initializeMatch(config);
  }

  scorePoint(state: MatchState, winner: PlayerId): MatchState {
    return addPoint(state, winner);
  }

  undo(state: MatchState): MatchState {
    return undoPoint(state);
  }

  togglePause(state: MatchState): MatchState {
    if (state.isMatchOver) {
      return state;
    }

    const now = Date.now();
    if (state.isPaused) {
      return {
        ...state,
        isPaused: false,
        startTime: now - state.durationSeconds * 1000,
      };
    }

    return {
      ...state,
      isPaused: true,
    };
  }

  tick(state: MatchState): MatchState {
    if (state.isPaused || state.isMatchOver) {
      return state;
    }

    return {
      ...state,
      durationSeconds: Math.max(
        0,
        Math.floor((Date.now() - state.startTime) / 1000)
      ),
    };
  }
}
