export enum PlayerId {
  P1 = "P1",
  P2 = "P2",
}

export type PointLabel = "0" | "15" | "30" | "40" | "Ad" | number;

export interface MatchConfig {
  p1Name: string;
  p2Name: string;
  p1Color?: string;
  p2Color?: string;
  setsToWin: 1 | 2 | 3;
  useAdvantage: boolean;
  finalSetType: "standard" | "superTieBreak";
  tieBreakAt: number;
  tieBreakPoints: number;
  mode: "singles" | "doubles";
  p1PartnerName?: string;
  p2PartnerName?: string;
}

export interface GameScore {
  [PlayerId.P1]: number;
  [PlayerId.P2]: number;
}

export interface PointScore {
  [PlayerId.P1]: PointLabel;
  [PlayerId.P2]: PointLabel;
}

export interface SetScore {
  [PlayerId.P1]: number;
  [PlayerId.P2]: number;
}

export interface HistoryEvent {
  id: string;
  timestamp: number;
  type: "POINT" | "GAME_WIN" | "SET_WIN" | "MATCH_WIN";
  winnerId: PlayerId;
  sideSwitchAfter?: boolean;
  scoreSnapshot: {
    sets: SetScore[];
    games: GameScore;
    points: PointScore;
    isTieBreak: boolean;
  };
}

export interface MatchState {
  matchId?: string;
  config: MatchConfig;
  startTime: number;
  durationSeconds: number;
  isPaused: boolean;
  isMatchOver: boolean;
  winner?: PlayerId;
  currentSetIndex: number;
  sets: SetScore[];
  games: GameScore;
  points: PointScore;
  isTieBreak: boolean;
  shouldSwitchSides: boolean;
  server: PlayerId;
  history: HistoryEvent[];
}
