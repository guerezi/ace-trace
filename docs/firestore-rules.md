# Firestore rules guidance (Tennis Score Native)

This document describes the ownership assumptions implemented in app code and how they should be mirrored in Firestore security rules.

## Data model

- Summary doc: `clubs/{topic}/active_matches/{matchId}`
- Realtime doc: `clubs/{topic}/active_matches/{matchId}/realtime/score`

Summary includes `creatorUid`.

## Field structure parity (web ↔ native)

The original web app uses snake_case field names. Native now reads both formats and writes both for compatibility.

### Summary doc (`clubs/{topic}/active_matches/{matchId}`)

- `id`
- Player names:
  - web: `p1_name`, `p2_name`
  - native: `p1Name`, `p2Name`
- Score summary:
  - web: `score_summary`
  - native: `scoreSummary`
- Games/Sets:
  - web: `current_games`, `current_sets`
  - native: `currentGames`, `currentSets`
- Ownership:
  - web: `creator_uid`
  - native: `creatorUid`
- Doubles mode:
  - web: `is_doubles`
  - native: `isDoubles`
- Duration:
  - web: `match_duration`
  - native: `durationSeconds`
- Shared keys: `status`, `server`, `startTime`, `isPaused`, `config`
- Update timestamps:
  - web: `last_updated`
  - native: `lastUpdated`

### Realtime doc (`clubs/{topic}/active_matches/{matchId}/realtime/score`)

- Points:
  - web: `current_points`
  - native: `points`
- Tie-break flag:
  - web: `is_tie_break`
  - native: `isTieBreak`
- Shared: `history`
- Update timestamps:
  - web: `last_updated`
  - native: `lastUpdated`

### Club subscription behavior

- Club feed subscription listens to: `clubs/{topic}/active_matches`.
- Native feed sorting uses both `last_updated` and `lastUpdated`, so mixed old/new docs are ordered correctly.

## Ownership constraints expected by app

App code enforces owner checks before:

- `syncMatch()` writes
- `endMatch()` writes
- `deleteMatch()` deletes

Owner is the user where `request.auth.uid == resource.data.creatorUid` (or incoming `creatorUid` for first create).

## Suggested baseline rules (example)

```rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function isSignedIn() {
      return request.auth != null;
    }

    function isOwner(topic, matchId) {
      return isSignedIn() &&
        get(/databases/$(database)/documents/clubs/$(topic)/active_matches/$(matchId)).data.creatorUid == request.auth.uid;
    }

    match /clubs/{topic}/active_matches/{matchId} {
      allow read: if true;

      allow create: if isSignedIn() && request.resource.data.creatorUid == request.auth.uid;
      allow update: if isOwner(topic, matchId);
      allow delete: if isOwner(topic, matchId);

      match /realtime/{docId} {
        allow read: if true;
        allow create, update, delete: if isOwner(topic, matchId);
      }
    }
  }
}
```

## Validation checklist

1. Create match with user A succeeds.
2. User B cannot update/delete user A match.
3. User B cannot update/delete realtime doc under user A match.
4. User A can end and delete own match.
5. Read-only spectator access works unauthenticated if desired.

## Notes

- If public read is not desired, change `allow read: if true`.
- Keep indexes aligned with `orderBy('lastUpdated', 'desc')` queries.
