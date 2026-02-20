import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import {
  LiveMatchGateway,
  LiveMatchSummary,
  MatchRealtimeData,
} from "../../application/live-sync/LiveMatchGateway";
import { MatchState, PlayerId } from "../../domain/match/entities/MatchTypes";
import { getFirestoreOrNull } from "./firebaseClient";

const toScoreSummary = (state: MatchState): string => {
  const completed = state.sets
    .slice(0, state.currentSetIndex)
    .map((set) => `${set[PlayerId.P1]}-${set[PlayerId.P2]}`)
    .join(", ");

  const current = `${state.games[PlayerId.P1]}-${state.games[PlayerId.P2]}`;
  return completed ? `${completed}, ${current}` : current;
};

const sanitizeTopic = (topic: string): string => topic.trim().toLowerCase();

const toEpochMillis = (value: unknown): number => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (value && typeof value === "object" && "toMillis" in value) {
    const maybeTimestamp = value as { toMillis?: () => number };
    if (typeof maybeTimestamp.toMillis === "function") {
      return maybeTimestamp.toMillis();
    }
  }

  if (value instanceof Date) {
    return value.getTime();
  }

  return 0;
};

const normalizeSummary = (
  raw: Record<string, unknown>,
  docId: string
): LiveMatchSummary => {
  const configRaw = (raw.config ?? {}) as Record<string, unknown>;
  const p1ColorRaw =
    raw.p1Color ??
    raw.p1_color ??
    raw.player1_color ??
    configRaw.p1Color ??
    configRaw.p1_color;
  const p2ColorRaw =
    raw.p2Color ??
    raw.p2_color ??
    raw.player2_color ??
    configRaw.p2Color ??
    configRaw.p2_color;
  const p1Color =
    typeof p1ColorRaw === "string" && p1ColorRaw.trim()
      ? p1ColorRaw
      : undefined;
  const p2Color =
    typeof p2ColorRaw === "string" && p2ColorRaw.trim()
      ? p2ColorRaw
      : undefined;

  const normalized = {
    id: String(raw.id ?? docId),
    p1Name: String(raw.p1Name ?? raw.p1_name ?? "Player 1"),
    p2Name: String(raw.p2Name ?? raw.p2_name ?? "Player 2"),
    ...(p1Color ? { p1Color } : {}),
    ...(p2Color ? { p2Color } : {}),
    scoreSummary: String(raw.scoreSummary ?? raw.score_summary ?? "0-0"),
    currentGames: (raw.currentGames ??
      raw.current_games ?? {
        [PlayerId.P1]: 0,
        [PlayerId.P2]: 0,
      }) as LiveMatchSummary["currentGames"],
    currentSets: (raw.currentSets ??
      raw.current_sets ??
      []) as LiveMatchSummary["currentSets"],
    server: (raw.server ?? PlayerId.P1) as PlayerId,
    creatorUid: String(raw.creatorUid ?? raw.creator_uid ?? ""),
    isDoubles: Boolean(raw.isDoubles ?? raw.is_doubles ?? false),
    status: (raw.status === "FINISHED"
      ? "FINISHED"
      : "LIVE") as LiveMatchSummary["status"],
    durationSeconds: Number(raw.durationSeconds ?? raw.match_duration ?? 0),
    startTime: Number(raw.startTime ?? Date.now()),
    isPaused: Boolean(raw.isPaused ?? false),
    config: raw.config as LiveMatchSummary["config"],
  } satisfies LiveMatchSummary;

  return normalized;
};

const normalizeRealtime = (
  raw: Record<string, unknown>
): MatchRealtimeData => ({
  points: (raw.points ??
    raw.current_points ?? {
      [PlayerId.P1]: "0",
      [PlayerId.P2]: "0",
    }) as MatchRealtimeData["points"],
  isTieBreak: Boolean(raw.isTieBreak ?? raw.is_tie_break ?? false),
  history: (raw.history ?? []) as MatchRealtimeData["history"],
});

const assertOwnership = async (
  summaryRef: ReturnType<typeof doc>,
  actorUid: string
): Promise<void> => {
  const summarySnap = await getDoc(summaryRef);
  if (!summarySnap.exists()) {
    return;
  }

  const data = summarySnap.data() as Partial<LiveMatchSummary>;
  const ownerUid = String(
    (data as { creatorUid?: string; creator_uid?: string }).creatorUid ??
      (data as { creatorUid?: string; creator_uid?: string }).creator_uid ??
      ""
  );
  if (ownerUid && ownerUid !== actorUid) {
    throw new Error("forbidden-owner-mismatch");
  }
};

export class FirebaseLiveMatchGateway implements LiveMatchGateway {
  subscribeClubMatches(
    topic: string,
    callback: (matches: LiveMatchSummary[]) => void
  ): () => void {
    const db = getFirestoreOrNull();
    if (!db || !topic || topic === "offline") {
      callback([]);
      return () => undefined;
    }

    const clubRef = collection(
      db,
      `clubs/${sanitizeTopic(topic)}/active_matches`
    );

    return onSnapshot(clubRef, (snapshot) => {
      const matches = snapshot.docs
        .map((item) => {
          const raw = item.data() as Record<string, unknown>;
          return {
            summary: normalizeSummary(raw, item.id),
            sortValue: Math.max(
              toEpochMillis(raw.lastUpdated),
              toEpochMillis(raw.last_updated)
            ),
          };
        })
        .sort((a, b) => b.sortValue - a.sortValue)
        .map((entry) => entry.summary);

      callback(matches);
    });
  }

  subscribeMatchSummary(
    topic: string,
    matchId: string,
    callback: (summary: LiveMatchSummary | null) => void
  ): () => void {
    const db = getFirestoreOrNull();
    if (!db || !topic || topic === "offline" || !matchId) {
      callback(null);
      return () => undefined;
    }

    const summaryRef = doc(
      db,
      `clubs/${sanitizeTopic(topic)}/active_matches/${matchId}`
    );
    return onSnapshot(summaryRef, (snapshot) => {
      if (!snapshot.exists()) {
        callback(null);
        return;
      }

      callback(
        normalizeSummary(
          snapshot.data() as Record<string, unknown>,
          snapshot.id
        )
      );
    });
  }

  subscribeMatchRealtime(
    topic: string,
    matchId: string,
    callback: (data: MatchRealtimeData | null) => void
  ): () => void {
    const db = getFirestoreOrNull();
    if (!db || !topic || topic === "offline" || !matchId) {
      callback(null);
      return () => undefined;
    }

    const realtimeRef = doc(
      db,
      `clubs/${sanitizeTopic(topic)}/active_matches/${matchId}/realtime/score`
    );
    return onSnapshot(realtimeRef, (snapshot) => {
      if (!snapshot.exists()) {
        callback(null);
        return;
      }

      callback(normalizeRealtime(snapshot.data() as Record<string, unknown>));
    });
  }

  async syncMatch(
    topic: string,
    matchId: string,
    state: MatchState,
    creatorUid: string
  ): Promise<void> {
    const db = getFirestoreOrNull();
    if (!db || !topic || topic === "offline" || !matchId || !creatorUid) {
      return;
    }

    const safeTopic = sanitizeTopic(topic);
    const summaryRef = doc(db, `clubs/${safeTopic}/active_matches/${matchId}`);
    const realtimeRef = doc(
      db,
      `clubs/${safeTopic}/active_matches/${matchId}/realtime/score`
    );

    await assertOwnership(summaryRef, creatorUid);

    await setDoc(
      summaryRef,
      {
        id: matchId,
        p1Name: state.config.p1Name,
        p1_name: state.config.p1Name,
        p2Name: state.config.p2Name,
        p2_name: state.config.p2Name,
        p1Color: state.config.p1Color ?? "blue",
        p1_color: state.config.p1Color ?? "blue",
        player1_color: state.config.p1Color ?? "blue",
        p2Color: state.config.p2Color ?? "red",
        p2_color: state.config.p2Color ?? "red",
        player2_color: state.config.p2Color ?? "red",
        scoreSummary: toScoreSummary(state),
        score_summary: toScoreSummary(state),
        currentGames: state.games,
        current_games: state.games,
        currentSets: state.sets,
        current_sets: state.sets,
        server: state.server,
        creatorUid,
        creator_uid: creatorUid,
        isDoubles: state.config.mode === "doubles",
        is_doubles: state.config.mode === "doubles",
        status: state.isMatchOver ? "FINISHED" : "LIVE",
        durationSeconds: state.durationSeconds,
        match_duration: state.durationSeconds,
        startTime: state.startTime,
        isPaused: state.isPaused,
        config: state.config,
        lastUpdated: serverTimestamp(),
        last_updated: serverTimestamp(),
      },
      { merge: true }
    );

    await setDoc(
      realtimeRef,
      {
        points: state.points,
        current_points: state.points,
        isTieBreak: state.isTieBreak,
        is_tie_break: state.isTieBreak,
        history: state.history,
        lastUpdated: serverTimestamp(),
        last_updated: serverTimestamp(),
      },
      { merge: true }
    );
  }

  async endMatch(
    topic: string,
    matchId: string,
    actorUid: string
  ): Promise<void> {
    const db = getFirestoreOrNull();
    if (!db || !topic || topic === "offline" || !matchId || !actorUid) {
      return;
    }

    const summaryRef = doc(
      db,
      `clubs/${sanitizeTopic(topic)}/active_matches/${matchId}`
    );
    await assertOwnership(summaryRef, actorUid);
    await setDoc(
      summaryRef,
      {
        status: "FINISHED",
        lastUpdated: serverTimestamp(),
        last_updated: serverTimestamp(),
      },
      { merge: true }
    );
  }

  async deleteMatch(
    topic: string,
    matchId: string,
    actorUid: string
  ): Promise<void> {
    const db = getFirestoreOrNull();
    if (!db || !topic || topic === "offline" || !matchId || !actorUid) {
      return;
    }

    const safeTopic = sanitizeTopic(topic);
    const summaryRef = doc(db, `clubs/${safeTopic}/active_matches/${matchId}`);
    const realtimeRef = doc(
      db,
      `clubs/${safeTopic}/active_matches/${matchId}/realtime/score`
    );

    await assertOwnership(summaryRef, actorUid);

    await Promise.all([deleteDoc(realtimeRef), deleteDoc(summaryRef)]);
  }

  async fetchMatch(topic: string, matchId: string) {
    const db = getFirestoreOrNull();
    if (!db || !topic || topic === "offline" || !matchId) {
      return null;
    }

    const safeTopic = sanitizeTopic(topic);
    const summaryRef = doc(db, `clubs/${safeTopic}/active_matches/${matchId}`);
    const realtimeRef = doc(
      db,
      `clubs/${safeTopic}/active_matches/${matchId}/realtime/score`
    );

    const [summarySnap, realtimeSnap] = await Promise.all([
      getDoc(summaryRef),
      getDoc(realtimeRef),
    ]);

    if (!summarySnap.exists() || !realtimeSnap.exists()) {
      return null;
    }

    const summary = normalizeSummary(
      summarySnap.data() as Record<string, unknown>,
      summarySnap.id
    );
    const realtime = normalizeRealtime(
      realtimeSnap.data() as Record<string, unknown>
    );

    return { summary, realtime };
  }
}
