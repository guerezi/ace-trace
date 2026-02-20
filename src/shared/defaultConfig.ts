import { MatchConfig } from "../domain/match/entities/MatchTypes";

export const DEFAULT_MATCH_CONFIG: MatchConfig = {
  p1Name: "Player 1",
  p2Name: "Player 2",
  p1Color: "blue",
  p2Color: "red",
  setsToWin: 2,
  useAdvantage: false,
  finalSetType: "superTieBreak",
  tieBreakAt: 6,
  tieBreakPoints: 7,
  mode: "singles",
};
