# Agent Guidelines — Tennis Score Native

## 1) Mission

Build a **new React Native app** that reproduces the behavior, flow, and UX intent of the existing web app in the reference project folder, while supporting:

- Mobile (iOS/Android)
- Web (required)
- Future expansion for smart watches

The goal is **parity first**, then safe improvements.

---

## 2) Non-Negotiable Rules

1. **Ask before coding when ambiguous.**

   - If requirements are unclear, stop and ask targeted questions.

2. **Do not import code from the reference web project.**

   - The reference project is for behavior/UI guidance only.
   - Re-implement logic and UI in the new native project.

3. **Do not modify or delete anything in the reference web project folder.**

   - It must remain intact as a migration reference.

4. **Keep behavior and UI intent close to the web app.**

   - Preserve user flows, scoring logic, and feature semantics.
   - If platform constraints require differences, document them clearly.

5. **Mobile + web support is mandatory.**

   - Any feature implementation should consider both from the start.

6. **Code quality is mandatory.**
   - Follow SOLID principles.
   - Follow Clean Architecture principles.
   - Prefer interface-driven design to maximize testability.

---

## 3) Architecture & Design Expectations

Use a layered approach:

- **Domain layer**

  - Entities, value objects, domain services, use cases.
  - Pure business rules (no UI/framework dependencies).

- **Application layer**

  - Orchestration of use cases.
  - Interface contracts (repositories, gateways, adapters).

- **Infrastructure layer**

  - Firebase/network/storage implementations.
  - External APIs and platform-specific details.

- **Presentation layer**
  - React Native screens/components/hooks/view-models.
  - Platform-aware UI wrappers when needed.

### Key design rules

- Depend on abstractions, not concrete implementations.
- Keep side effects isolated.
- Avoid “god components” and oversized hooks.
- Keep modules small, cohesive, and replaceable.

---

## 4) Migration Strategy

1. Start from **feature parity** with the web app:

   - Match setup, scoring controls, history, settings, auth/state flow, and live/spectator behavior.

2. Keep naming and concepts close to the reference app where useful:

   - Similar domain terms and use-case names.
   - Equivalent state transitions and business rules.

3. Rebuild, don’t copy/import:

   - Recreate services and types in the native project structure.

4. Implement incrementally:
   - One feature slice at a time, each slice testable and reviewable.

---

## 5) Platform Rules (Mobile + Web)

- Prefer cross-platform primitives first.
- Introduce platform-specific code only when necessary.
- Keep shared business logic platform-agnostic.
- Ensure navigation, input handling, and layout work on small and large screens.
- Avoid browser-only assumptions in core logic.

---

## 6) Testing & Reliability

- Domain/use-case logic should be straightforward to unit test.
- Use interfaces and dependency injection boundaries for mocks/stubs.
- Add tests for critical scoring and match state transitions.
- Do not merge partially working flows without documenting known gaps.

---

## 7) Coding Standards

- Prefer TypeScript with explicit types/interfaces.
- Keep functions focused and deterministic when possible.
- Handle errors explicitly (no silent failures).
- Avoid premature optimization and over-engineering.
- Keep files readable and responsibilities clear.

---

## 8) Delivery Workflow for Agents

For each task:

1. Restate scope and assumptions.
2. Flag ambiguities and ask questions before coding.
3. Propose a short implementation plan.
4. Implement the smallest safe increment.
5. Validate behavior (and tests where available).
6. Summarize what changed and any follow-ups.

---

## 9) Definition of Done (per feature)

A feature is done only if:

- It matches intended behavior from the reference app.
- It works on mobile and web.
- Architecture boundaries are respected.
- Interfaces and types are clear.
- Critical logic is testable.
- No forbidden dependency on the reference project exists.

---

## 10) Forbidden Actions

- Importing source code directly from the reference web project.
- Deleting or altering files in the reference web project.
- Shipping unclear assumptions without confirmation.
- Mixing business logic deeply into UI components.

## 11) Development logs

- After each ai iteraction, you should update this file with a log of what have been done, what is missing and the next steps
- When this section grows beyond ~250 lines (or becomes hard to scan), create a **checkpoint**:

  1.  Keep one compact checkpoint summary.
  2.  Remove older detailed entries.
  3.  Continue future logs from that checkpoint.

- 2026-02-18 — Checkpoint (log reset)

  - Done (high level):
    - Major parity slices completed across landing/dashboard/setup/match/spectator/auth.
    - Timeline + scorer behavior/visual parity significantly improved.
    - Doubles ordering and serving-indicator parity improvements completed.
    - Firestore compatibility hardening (snake_case + camelCase) and ownership checks added.
    - Safe-area and Firebase auth persistence warning cleanup implemented.
    - Validation baseline maintained.
  - Validation:
    - `typecheck` passing.
    - `test` passing (17 tests).
  - Missing:
    - Re-auth guidance UX for `requires-recent-login` delete-account flow.
    - Orchestration integration tests for landing ↔ dashboard ↔ setup transitions.
    - Firestore deployed rules/index validation in live environment.
  - Next steps:
    1. Add re-auth guidance UX for account deletion recent-login requirement.
    2. Add orchestration integration tests for transition/race recovery cases.
    3. Validate deployed Firestore rules and required indexes against live project.

- 2026-02-21 — Checkpoint (project wrap + smartwatch handoff)

  - Project state:
    - React Native + Expo app is stable and working at repository root (`App.tsx`, `app.json`, `src/`).
    - Core experience parity is implemented across landing, dashboard, setup, match, spectator, and auth/profile.
    - Current app branding is set to `Ace Trace` in Expo config.

  - Completed capabilities (high level):
    - Live scoring flow with singles/doubles support, timeline/history, spectator mode, in-match settings.
    - Auth flows: sign in/up, reset password, profile, sign out, delete account.
    - Profile enhancements:
      - Editable display name synced to Firebase user profile.
      - Preferred color persisted locally and auto-applied as default `Player 1` color.
    - Setup UX:
      - Team/color ordering parity and explicit `Back` + `Start Match` actions.
    - Firebase/Firestore hardening:
      - Mixed schema support (`snake_case` + `camelCase`) and ownership guards.
      - EAS config hardening to avoid committed public env values.
    - Maintainability improvements:
      - `MatchScreen` decomposition and match-component barrel exports.

  - Architecture snapshot (for next chat):
    - `domain/`: pure match rules and entities.
    - `application/`: gateways + orchestration helpers.
    - `infrastructure/firebase/`: auth + live sync adapters.
    - `presentation/`: screens/components.
    - `App.tsx`: top-level view orchestration/state transitions.

  - Validation baseline:
    - `typecheck` passing.
    - `test` passing (17 tests).

  - Known pending items:
    - Re-auth guidance UX for `requires-recent-login` delete-account flow.
    - App orchestration integration tests for transition/race recovery.
    - Live environment validation of deployed Firestore rules/indexes.
    - Device QA for auth persistence and preferred-color persistence across app restarts.

  - Smart watch handoff guidance:
    1. Keep shared scoring logic in `domain/` unchanged and reusable.
    2. Build watch UI as a new presentation entrypoint focused on quick actions (score/undo/pause, current game/set, server).
    3. Reuse existing app/gateway contracts for sync; avoid duplicating business rules in watch views.
    4. Define watch-first navigation states (`live control`, `read-only glance`, `handoff to phone`).
    5. Start with minimal parity slice: score point + undo + status glance, then expand.

