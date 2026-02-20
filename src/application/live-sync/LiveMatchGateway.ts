import {
  HistoryEvent,
  MatchConfig,
  MatchState,
  PlayerId,
  PointScore,
  SetScore,
} from "../../domain/match/entities/MatchTypes";

export interface LiveMatchSummary {
  id: string;
  p1Name: string;
  p2Name: string;
  p1Color?: string;
  p2Color?: string;
  scoreSummary: string;
  currentGames: { [PlayerId.P1]: number; [PlayerId.P2]: number };
  currentSets: SetScore[];
  server: PlayerId;
  creatorUid: string;
  isDoubles: boolean;
  status: "LIVE" | "FINISHED";
  durationSeconds: number;
  startTime: number;
  isPaused: boolean;
  config?: MatchConfig;
}

export interface MatchRealtimeData {
  points: PointScore;
  isTieBreak: boolean;
  history: HistoryEvent[];
}

export interface ResumableMatchData {
  summary: LiveMatchSummary;
  realtime: MatchRealtimeData;
}

export interface LiveMatchGateway {
  subscribeClubMatches(
    topic: string,
    callback: (matches: LiveMatchSummary[]) => void
  ): () => void;

  subscribeMatchSummary(
    topic: string,
    matchId: string,
    callback: (summary: LiveMatchSummary | null) => void
  ): () => void;

  subscribeMatchRealtime(
    topic: string,
    matchId: string,
    callback: (data: MatchRealtimeData | null) => void
  ): () => void;

  syncMatch(
    topic: string,
    matchId: string,
    state: MatchState,
    creatorUid: string
  ): Promise<void>;

  endMatch(topic: string, matchId: string, actorUid: string): Promise<void>;
  deleteMatch(topic: string, matchId: string, actorUid: string): Promise<void>;
  fetchMatch(
    topic: string,
    matchId: string
  ): Promise<ResumableMatchData | null>;
}
