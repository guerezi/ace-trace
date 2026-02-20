import { beforeEach, describe, expect, it, vi } from "vitest";
import { initializeMatch } from "../../domain/match/use-cases/initializeMatch";
import { DEFAULT_MATCH_CONFIG } from "../../shared/defaultConfig";

const mocks = vi.hoisted(() => ({
  getFirestoreOrNull: vi.fn(),
  doc: vi.fn(),
  setDoc: vi.fn(),
  deleteDoc: vi.fn(),
  getDoc: vi.fn(),
  collection: vi.fn(),
  orderBy: vi.fn(),
  query: vi.fn(),
  onSnapshot: vi.fn(),
  serverTimestamp: vi.fn(),
}));

vi.mock("../../infrastructure/firebase/firebaseClient", () => ({
  getFirestoreOrNull: mocks.getFirestoreOrNull,
}));

vi.mock("firebase/firestore", () => ({
  doc: mocks.doc,
  setDoc: mocks.setDoc,
  deleteDoc: mocks.deleteDoc,
  getDoc: mocks.getDoc,
  collection: mocks.collection,
  orderBy: mocks.orderBy,
  query: mocks.query,
  onSnapshot: mocks.onSnapshot,
  serverTimestamp: mocks.serverTimestamp,
}));

import { FirebaseLiveMatchGateway } from "../../infrastructure/firebase/firebaseLiveMatchGateway";

describe("FirebaseLiveMatchGateway", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getFirestoreOrNull.mockReturnValue({});
    mocks.serverTimestamp.mockReturnValue("server-ts");
    mocks.doc.mockImplementation((_db: unknown, path: string) => ({ path }));
    mocks.setDoc.mockResolvedValue(undefined);
    mocks.deleteDoc.mockResolvedValue(undefined);
    mocks.getDoc.mockResolvedValue({ exists: () => false });
  });

  it("syncs summary and realtime documents", async () => {
    const gateway = new FirebaseLiveMatchGateway();
    const state = initializeMatch(DEFAULT_MATCH_CONFIG);

    await gateway.syncMatch("my-club", "match-1", state, "uid-1");

    expect(mocks.setDoc).toHaveBeenCalledTimes(2);
    expect(mocks.setDoc.mock.calls[0]?.[0]).toEqual({
      path: "clubs/my-club/active_matches/match-1",
    });
    expect(mocks.setDoc.mock.calls[1]?.[0]).toEqual({
      path: "clubs/my-club/active_matches/match-1/realtime/score",
    });
  });

  it("deletes both summary and realtime docs", async () => {
    const gateway = new FirebaseLiveMatchGateway();

    await gateway.deleteMatch("my-club", "match-1", "uid-1");

    expect(mocks.deleteDoc).toHaveBeenCalledTimes(2);
  });

  it("blocks delete when actor is not owner", async () => {
    const gateway = new FirebaseLiveMatchGateway();
    mocks.getDoc.mockResolvedValueOnce({
      exists: () => true,
      data: () => ({ creatorUid: "owner-uid" }),
    });

    await expect(
      gateway.deleteMatch("my-club", "match-1", "other-uid")
    ).rejects.toThrow("forbidden-owner-mismatch");
    expect(mocks.deleteDoc).not.toHaveBeenCalled();
  });

  it("returns null when summary or realtime doc is missing", async () => {
    const gateway = new FirebaseLiveMatchGateway();

    mocks.getDoc
      .mockResolvedValueOnce({ exists: () => true, data: () => ({ id: "m1" }) })
      .mockResolvedValueOnce({ exists: () => false });

    await expect(gateway.fetchMatch("my-club", "m1")).resolves.toBeNull();
  });

  it("returns resumable match data when both docs exist", async () => {
    const gateway = new FirebaseLiveMatchGateway();
    const summary = {
      id: "m2",
      p1Name: "P1",
      p2Name: "P2",
      scoreSummary: "6-4, 2-1",
      currentGames: { P1: 2, P2: 1 },
      currentSets: [
        { P1: 6, P2: 4 },
        { P1: 0, P2: 0 },
      ],
      server: "P1",
      creatorUid: "uid-1",
      isDoubles: false,
      status: "LIVE",
      durationSeconds: 120,
      startTime: 100,
      isPaused: false,
    };
    const realtime = {
      points: { P1: "30", P2: "15" },
      isTieBreak: false,
      history: [],
    };

    mocks.getDoc
      .mockResolvedValueOnce({ exists: () => true, data: () => summary })
      .mockResolvedValueOnce({ exists: () => true, data: () => realtime });

    const result = await gateway.fetchMatch("my-club", "m2");

    expect(result).toEqual({ summary, realtime });
  });

  it("normalizes snake_case web summary/realtime schema", async () => {
    const gateway = new FirebaseLiveMatchGateway();
    const summarySnake = {
      id: "m3",
      p1_name: "Alice",
      p2_name: "Bob",
      score_summary: "6-4, 1-0",
      current_games: { P1: 1, P2: 0 },
      current_sets: [{ P1: 6, P2: 4 }],
      server: "P2",
      creator_uid: "uid-x",
      is_doubles: false,
      status: "LIVE",
      match_duration: 90,
      startTime: 10,
      isPaused: true,
    };
    const realtimeSnake = {
      current_points: { P1: "15", P2: "30" },
      is_tie_break: true,
      history: [],
    };

    mocks.getDoc
      .mockResolvedValueOnce({
        exists: () => true,
        id: "m3",
        data: () => summarySnake,
      })
      .mockResolvedValueOnce({ exists: () => true, data: () => realtimeSnake });

    const result = await gateway.fetchMatch("my-club", "m3");

    expect(result).toEqual({
      summary: {
        id: "m3",
        p1Name: "Alice",
        p2Name: "Bob",
        scoreSummary: "6-4, 1-0",
        currentGames: { P1: 1, P2: 0 },
        currentSets: [{ P1: 6, P2: 4 }],
        server: "P2",
        creatorUid: "uid-x",
        isDoubles: false,
        status: "LIVE",
        durationSeconds: 90,
        startTime: 10,
        isPaused: true,
        config: undefined,
      },
      realtime: {
        points: { P1: "15", P2: "30" },
        isTieBreak: true,
        history: [],
      },
    });
  });
});
