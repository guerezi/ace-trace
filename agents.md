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

- 2026-02-18 — Iteration log (module resolution cleanup)

  - Done:
    - Fixed editor/module resolution errors in `MatchScreen` for extracted match components.
    - Added match components barrel export file at `src/presentation/components/match/index.ts`.
    - Switched `MatchScreen` imports to use barrel path (`../components/match`) for stable resolution.
  - Validation:
    - Problems check for `MatchScreen` now clean.
    - `typecheck` passing.
  - Missing:
    - Re-auth guidance UX for `requires-recent-login` delete-account flow.
    - Orchestration integration tests for landing ↔ dashboard ↔ setup transitions.
    - Firestore deployed rules/index validation in live environment.
  - Next steps:
    1. Continue decomposition of other large files (`DashboardScreen`, `AuthScreen`, `MatchSettingsModal`, `TimelineCard`).
    2. Add re-auth guidance UX for account deletion recent-login requirement.
    3. Add orchestration integration tests for transition/race recovery cases.
    4. Validate deployed Firestore rules and required indexes against live project.

- 2026-02-19 — Iteration log (app naming update)

  - Done:
    - Updated Expo app branding name to `Ace Trace` in app config.
    - Updated Expo slug to `ace-trace` for consistent project identity.
  - Validation:
    - Config update applied successfully.
  - Missing:
    - Final decision/confirmation if preferred public name should be `Ace Score` or `Tennis Score` instead.
    - Re-auth guidance UX for `requires-recent-login` delete-account flow.
    - Orchestration integration tests for landing ↔ dashboard ↔ setup transitions.
    - Firestore deployed rules/index validation in live environment.
  - Next steps:
    1. Confirm final brand name (`Ace Trace` / `Ace Score` / `Tennis Score`) and adjust config accordingly.
    2. If needed, align additional metadata/icons/store text to the chosen name.
    3. Add re-auth guidance UX for account deletion recent-login requirement.
    4. Add orchestration integration tests for transition/race recovery cases.
    5. Validate deployed Firestore rules and required indexes against live project.

- 2026-02-19 — Iteration log (android/ios identifiers)

  - Done:
    - Updated Android application id in app config to `com.guerezi.acetrace`.
    - Added iOS bundle identifier in app config as `com.guerezi.acetrace` to prepare native iOS builds.
  - Validation:
    - Config updates applied successfully in `app.json`.
  - Missing:
    - Real-device Android build/install execution (`preview` APK build) not yet run in this iteration.
    - iOS signing setup (Apple Team/certificates/provisioning) still pending before iOS device/TestFlight installs.
    - Web deployment target/config (hosting provider + CI/CD) still pending definition.
  - Next steps:
    1. Run EAS Android `preview` build and install generated APK on physical device.
    2. Configure iOS credentials and run EAS iOS build for device/TestFlight.
    3. Define web deployment target (e.g., Vercel/Netlify/Firebase Hosting) and add deploy pipeline.

- 2026-02-19 — Iteration log (workspace structure update)

  - Done:
    - Confirmed project structure change: React Native app files are now at repository root.
    - Confirmed active root now contains runtime/config files directly (`App.tsx`, `app.json`, `package.json`, `src/`).
    - Noted that the web reference folder remains out for now and can be reintroduced later if needed for parity reference.
  - Validation:
    - Workspace root listing matches the new flattened structure.
  - Missing:
    - Optional cleanup of any remaining old nested-path mentions in docs/log notes.
    - Re-auth guidance UX for `requires-recent-login` delete-account flow.
    - Orchestration integration tests for landing ↔ dashboard ↔ setup transitions.
    - Firestore deployed rules/index validation in live environment.
  - Next steps:
    1. Use repository root as the default base path for all future edits/commands.
    2. Optionally sweep docs for stale `tennis-score-native-app/` path references.
    3. Continue parity roadmap items (re-auth UX, orchestration integration tests, Firestore live validation).

- 2026-02-20 — Iteration log (preview/prod Firebase env fix)
  - Done:
    - Diagnosed likely root cause for preview/prod failures: `.env` is gitignored and not guaranteed in cloud builds.
    - Added required `EXPO_PUBLIC_FIREBASE_*` variables to all EAS build profiles (`development`, `preview`, `production`) in `eas.json`.
    - This ensures Firebase Auth/Firestore config is present in built binaries and web preview bundles.
  - Validation:
    - EAS config updated successfully.
  - Missing:
    - Rebuild and reinstall preview app to pick up embedded environment values.
    - Re-auth guidance UX for `requires-recent-login` delete-account flow.
    - Orchestration integration tests for landing ↔ dashboard ↔ setup transitions.
    - Firestore deployed rules/index validation in live environment.
  - Next steps:
    1. Run a new `preview` build and install it on device.
    2. Verify login, live matches, and match history against production Firestore project.
    3. Add re-auth guidance UX for account deletion recent-login requirement.
    4. Add orchestration integration tests for transition/race recovery cases.
    5. Validate deployed Firestore rules and required indexes against live project.
