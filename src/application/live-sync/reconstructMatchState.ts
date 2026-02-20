import {
  MatchConfig,
  MatchState,
  PlayerId,
} from "../../domain/match/entities/MatchTypes";
import { LiveMatchSummary, MatchRealtimeData } from "./LiveMatchGateway";

const defaultPoints = {
  [PlayerId.P1]: "0",
  [PlayerId.P2]: "0",
} as const;

export const reconstructMatchState = (
  summary: LiveMatchSummary,
  realtime: MatchRealtimeData | null,
  fallbackConfig: MatchConfig
): MatchState => {
  const sets = summary.currentSets?.length
    ? summary.currentSets
    : [{ [PlayerId.P1]: 0, [PlayerId.P2]: 0 }];

  const resolvedConfig: MatchConfig = {
    ...fallbackConfig,
    ...(summary.config ?? {}),
    p1Name: summary.p1Name ?? summary.config?.p1Name ?? fallbackConfig.p1Name,
    p2Name: summary.p2Name ?? summary.config?.p2Name ?? fallbackConfig.p2Name,
    p1Color:
      summary.p1Color ?? summary.config?.p1Color ?? fallbackConfig.p1Color,
    p2Color:
      summary.p2Color ?? summary.config?.p2Color ?? fallbackConfig.p2Color,
  };

  return {
    matchId: summary.id,
    config: resolvedConfig,
    startTime: summary.startTime ?? Date.now(),
    durationSeconds: summary.durationSeconds ?? 0,
    isPaused: summary.isPaused ?? false,
    isMatchOver: summary.status === "FINISHED",
    winner: undefined,
    currentSetIndex: Math.max(0, sets.length - 1),
    sets,
    games: summary.currentGames ?? { [PlayerId.P1]: 0, [PlayerId.P2]: 0 },
    points: realtime?.points ?? defaultPoints,
    isTieBreak: realtime?.isTieBreak ?? false,
    shouldSwitchSides: false,
    server: summary.server,
    history: realtime?.history ?? [],
  };
};
