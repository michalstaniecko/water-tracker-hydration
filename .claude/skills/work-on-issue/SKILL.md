---
name: work-on-issue
description: Start work using a 3-phase pipeline — Opus (medium) plans (dopytuje gdy coś niejasne), Opus (medium) implements, Opus (medium) verifies acceptance criteria. Works in three modes — (a) bez argumentu → wybór issue z listy otwartych, (b) jeden lub wiele numerów issue (np. "12" albo "12 13 14"), (c) wolny opis zadania bez issue. Use when the user asks to "rozpocznij pracę nad issue N" / "work on issue N" / "rozpocznij pracę" / "popraw X".
argument-hint: [issue-number(s) | free-text description | empty]
disable-model-invocation: true
allowed-tools: Bash(gh issue view *) Bash(gh issue list *) Bash(gh pr *) Bash(git status *) Bash(git diff *) Bash(git log *) Bash(git checkout *) Bash(git switch *) Bash(git branch *) Bash(npm test *) Bash(npm run *) Read Grep Glob
---

# Work on Issue / Task — 3-phase pipeline

Orchestrate work for the **hydration-project** (Expo / React Native + TypeScript app: expo-router, Zustand + AsyncStorage, NativeWind, i18next, Firebase, AdMob, native home-screen widgets w `widgets/{ios,android}`).

You are the **orchestrator**. You do not write the implementation yourself — you delegate to subagents and pass artifacts between them. Keep your own context lean: tool output from sub-phases is heavy, so use `Agent` calls (which keep raw output out of your context) rather than Reading every file the implementer touches.

Three phases, run sequentially: **PLAN** → **IMPLEMENT** → **VERIFY**. All three phases run on **Opus with medium effort** — pass `model: "opus"` in every `Agent` call and instruct each subagent explicitly to work at *medium reasoning effort* (thorough, but nie rozwlekaj — nie potrzeba maksymalnego namysłu). Plan carefully up front and resolve open questions with the user before implementing; the VERIFY phase is a closing check that each acceptance criterion is actually met, not a substitute for good planning.

## Input parsing — three modes

Raw arguments: `$ARGUMENTS`

Inspect the argument string and pick exactly one mode:

1. **Empty mode** — `$ARGUMENTS` is empty / whitespace only.
   → Run `gh issue list --state open --limit 30 --json number,title,labels,milestone` (preloaded below), present a short numbered list to the user, and ask which issue (or issues) to work on. Do **not** start the pipeline before the user answers.

2. **Issue-number mode** — every whitespace/comma-separated token is purely numeric (e.g. `12`, `12 13`, `12,13,14`, `#12 #13`). Strip leading `#`.
   → Fetch each issue with `gh issue view <N>`. If any fetch fails, stop and report — do not fabricate. With multiple issues: **one branch, one PR** referencing all numbers (e.g. `feature/issues-12-13-<slug>`), unless the issues are clearly incompatible (different areas / conflicting acceptance criteria) — in that case ask the user whether to split into separate runs.

3. **Free-text mode** — argument is non-empty and contains non-numeric content (e.g. `popraw walidację celu dziennego w setup store`).
   → Treat the text verbatim as the task spec. No `gh issue view`. Branch name: `feature/<slug-from-description>` (lowercase ascii, kebab-case, max ~40 chars). Surface this in your first status line so the user can correct the slug before the planner starts.

If the mode is ambiguous (e.g. `12 popraw bug`), ask the user one short clarifying question instead of guessing.

## Preloaded context

Raw arguments string (orchestrator parses this itself — see „Input parsing"):

```
$ARGUMENTS
```

Always-useful working-tree state:

```!
git status --short
```

```!
git rev-parse --abbrev-ref HEAD
```

Open issues (cheap, helpful regardless of mode — w empty mode to twoja lista do zaprezentowania użytkownikowi; w pozostałych trybach to kontekst pokrewnych ticketów):

```!
gh issue list --state open --limit 30 --json number,title,labels,milestone
```

## Fetching issue bodies

If you detected **issue-number mode**, fetch each issue body yourself with one `gh issue view <N> --json number,title,body,labels,state,assignees,milestone` call per number (run them in parallel — they are independent). If any call fails, stop and report — do not fabricate.

In **empty mode** and **free-text mode** skip this step entirely.

## Stack detection

Decide which area(s) the task touches before picking subagents:

- **App / UI / nawigacja** → `app/**` (expo-router), `components/**`, `hooks/**`, NativeWind + `tailwind.config.js` → use `voltagent-lang:expo-react-native-expert` (albo `voltagent-lang:react-specialist` gdy rzecz jest czysto reactowa: hooki, re-rendery, kompozycja komponentów).
- **Logika / stan / utils** → `stores/**` (Zustand + AsyncStorage), `utils/**`, `services/**` → use `voltagent-lang:typescript-pro`. Pamiętaj: `utils/validation.ts` i `utils/numbers.ts` trzymamy na **100% pokrycia testami**.
- **Natywne widgety** → `widgets/ios/**` + `modules/hydration-widget/ios/**` (Swift/WidgetKit) → `voltagent-lang:swift-expert`; `widgets/android/**` + `modules/hydration-widget/android/**` (Kotlin/AppWidget) → `voltagent-lang:kotlin-specialist`. Most danych: `utils/sharedData.ts`. Są też skille projektowe `swift-widgetkit` i `android-widget` — wskaż je implementerowi.
- **AdMob / consent** → `components/ads/**`, `services/consentService.ts`, konfiguracja `react-native-google-mobile-ads` w `app.json` → `voltagent-lang:expo-react-native-expert` + wskazanie skilla projektowego `admob`.
- **i18n** → `i18n/<lang>/*.json` (`cs, de, en, es, fr, hr, id, it, ja, pl, pt, uk`) → każda nowa widoczna dla użytkownika stringa musi trafić do **wszystkich** języków, nie tylko `en`/`pl`.
- **CI / build / infra** → `.github/workflows/**`, `app.json`, `eas.json`, `package.json` → use `devops-engineer`.
- **Multi-area** → pick the dominant area for the implementer; mention secondary concerns in the brief.

If the task is ambiguous about scope (np. „dodaj przypomnienie" bez wskazania czy chodzi o UI, o store, czy o `services/notifications`), **ask the user one clarifying question** before phase 1 instead of guessing.

## Pipeline

Run phases sequentially. Each phase is one `Agent` tool call. Do **not** Read the agent's transcript file mid-flight; wait for the completion notification.

### Phase 1 — PLAN (Opus, medium effort)

Spawn a planner. Use `subagent_type: "Plan"` with `model: "opus"` — read-only, perfect for design without touching code.

Brief the planner with:
- **Task source** — depending on mode:
  - Issue-number mode (single): full issue body (title + description + labels + acceptance criteria if present).
  - Issue-number mode (multi): all issue bodies, plus an explicit note that they are being delivered together. Ask the planner to flag if it considers them too unrelated to bundle.
  - Free-text mode: the user's description verbatim, plus a note that there is no GitHub issue — the planner should propose acceptance criteria itself and surface them for user confirmation in the plan.
- Current branch and branching instruction. Default: branch off `development` (długo-żyjący branch deweloperski), name `feature/issue-<N>-<slug>` for single issue, `feature/issues-<N1>-<N2>-<slug>` for multi, `feature/<slug>` for free-text. If already on a relevant feature branch, stay on it.
- Project conventions from `CLAUDE.md`: wzorzec store'a (`fetchOrInitData()` wołane z `app/_layout.tsx`, walidacja/sanityzacja przy wczytaniu, natychmiastowa persystencja — kanoniczny przykład `stores/water.ts`), routing plikowy expo-router, NativeWind zamiast StyleSheet, paleta z `tailwind.config.js`, i18n przez i18next dla wszystkich 12 języków, testy Jest z presetem `jest-expo` (unit w `__tests__/` obok źródła, integracyjne w `__tests__/integration/`, store'y w `__tests__/stores/`), `npm run lint` (expo lint).
- Relevant docs: `CLAUDE.md`, `docs/TESTING.md`, `docs/GAMIFICATION.md`, `docs/BACKUP.md`, `docs/ANALYTICS.md`, `docs/ios-widget-development-guide.md`.
- Demand a deliverable plan with: file-by-file changes, wpływ na kształt danych w AsyncStorage (czy potrzebna migracja/backfill przy wczytaniu starych danych), test strategy (unit + integracyjne gdy dotyczy), wpływ na i18n (lista nowych kluczy), wpływ na natywne widgety / build (czy zmiana wymaga rebuildu natywnego, czy przechodzi przez OTA), risks. Plan must include an explicit, **numbered list of acceptance criteria** (AC1, AC2, …) — this list is the contract verified in Phase 3, so each item must be concrete and checkable (najlepiej powiązane z konkretnym testem, ekranem lub zachowaniem). Sources by mode: free-text → planner proposes them; issue with acceptance criteria → take them from the issue verbatim; **issue without acceptance criteria → planner derives them from the issue body and flags that they were inferred** (surface for user confirmation like in free-text mode).
- Tell it to work at **medium reasoning effort** and to NOT write any code.
- **Tell it to surface open questions.** If anything about scope, requirements, or approach is unclear or ambiguous, the planner must list concrete questions rather than guessing.

**Clarification gate (obowiązkowy przed Phase 2).** After the plan returns:
- If the planner raised open questions / assumptions / ambiguities, **surface them to the user and wait for answers** before implementing. Do not start Phase 2 with unresolved questions.
- In **free-text mode** (and in **issue mode where the planner had to infer acceptance criteria** because the issue lacked them), always surface the proposed acceptance criteria to the user and get a quick confirmation — there is no authoritative acceptance list to anchor on.
- If the plan is unambiguous and the user's intent is fully covered, you may proceed straight to Phase 2.

Capture the returned plan verbatim — it is the contract for Phase 2.

### Phase 2 — IMPLEMENT (Opus, medium effort)

Spawn the implementer. Pick `subagent_type` from stack detection above. Pass `model: "opus"`.

Brief the implementer with:
- The full plan from Phase 1 (verbatim, as the contract).
- The issue number(s) `#<N>` (or "no issue — ad-hoc task: <short description>" in free-text mode) and branch instruction.
- Hard rules:
  - follow `CLAUDE.md`;
  - TypeScript — bez `any` na siłę, typy współdzielone tam gdzie już mieszkają (`types/`, sąsiedni moduł);
  - stan tylko przez istniejące store'y w `stores/` zgodnie z wzorcem `stores/water.ts` — żadnego równoległego mechanizmu persystencji;
  - style przez NativeWind + paleta z `tailwind.config.js`, nie hardkodowane hexy;
  - każdy nowy user-facing string przez i18next i dodany do **wszystkich** plików `i18n/<lang>/*.json`;
  - testy muszą przechodzić `npm test`; lint musi przechodzić `npm run lint`; jeśli zmiana dotyka `utils/validation.ts` lub `utils/numbers.ts` — utrzymać 100% pokrycia;
  - do **not** introduce new dependencies without flagging them (nowa zależność natywna = rebuild, to decyzja użytkownika).
- Jeśli zadanie dotyka widgetów lub AdMob — wskaż skille projektowe (`swift-widgetkit`, `android-widget`, `admob`) jako obowiązkową lekturę.
- Tell it to work at **medium reasoning effort** and to report a concise summary of: files changed, commands run, test/lint results, anything skipped vs the plan and why.
- Tell it **not to commit** unless the user has previously authorized auto-commit — final commit + PR is a user-confirmed step at the end.

After it returns, spot-check the diff with `git diff --stat` and `git status` (these are cheap and worth doing).

### Phase 3 — VERIFY acceptance criteria (Opus, medium effort)

Spawn a verifier. Use `subagent_type: "Plan"` with `model: "opus"` — read-only (może czytać kod i uruchamiać `git diff` / `npm test` / `npm run lint`, ale nie zmienia plików), więc nie „naprawia" po cichu tego, co miało zweryfikować.

Brief the verifier with:
- The **numbered acceptance criteria list** from Phase 1 (verbatim) — to jest jedyny kontrakt, względem którego ocenia.
- The implementer's summary from Phase 2 (files changed, commands run, test/lint results, co pominięto vs plan).
- Branch name and instruction to inspect the **actual diff against `development`** (`git diff development...HEAD`), przeczytać zmienione pliki i — jeśli to potrzebne do oceny danego kryterium — uruchomić `npm test` / `npm run lint` (a dla pojedynczego pliku `npm test -- <plik>`).
- Hard instruction: **for each AC, return a verdict `met` / `partially met` / `not met` with concrete evidence** (nazwa testu, ścieżka pliku + linia, fragment zachowania). No hand-waving — „wygląda dobrze" nie jest werdyktem. Jeśli kryterium jest sprawdzalne tylko przez uruchomienie aplikacji na urządzeniu/symulatorze albo przez rebuild natywny (typowe dla widgetów i reklam), ma to jawnie oznaczyć jako `unverifiable` z uzasadnieniem i wskazać, co użytkownik ma ręcznie sprawdzić.
- Dodatkowo, poza listą AC, ma zgłosić: brakujące klucze i18n w którymkolwiek z 12 języków oraz spadek pokrycia w `utils/validation.ts` / `utils/numbers.ts`, jeśli je zmieniono.
- Tell it to work at **medium reasoning effort** and **not to modify any code** — jego jedynym zadaniem jest ocena. Braki zgłasza jako listę, nie jako poprawki.

**Verification gate.** After the verifier returns:
- If **every AC is `met`** and lint/tests pass → zreferuj to userowi i przejdź do Finish.
- If **any AC is `not met` / `partially met`** → surface the gap list to the user. Domyślnie zaproponuj drugą iterację Phase 2 (implementer dostaje listę braków jako doprecyzowany kontrakt), ale **nie startuj jej bez zgody użytkownika** — user może uznać brak za akceptowalny / poza zakresem. Nie raportuj zadania jako ukończonego, dopóki bramka nie jest przejściem albo user świadomie nie odpuścił danego kryterium.

### Finish

Report the result to the user with: branch name, files changed, test/lint status, the **per-AC verdict table from Phase 3**, and anything skipped vs the plan. Ask the user whether to commit and open a PR (against `development` — always pass `--base development` explicitly). Do not push or create the PR without explicit confirmation. Do not propose commit + PR as the next step while any acceptance criterion is still `not met` / `partially met` and the user hasn't explicitly accepted the gap.

## Reporting back to the user

State the chosen mode in your first status line (e.g. „Tryb: opis zadania — branch `feature/<slug>`", „Tryb: 3 issue (#12, #13, #14) — bundle do jednego PR"). Between phases, send one short status line („Plan gotowy, startuję implementację"; „Implementacja gotowa, startuję weryfikację kryteriów akceptacji"). At the end, report:
- Branch + diff stat.
- Test/lint results.
- **Acceptance criteria verdict** — per-AC `met` / `partially met` / `not met` / `unverifiable` z Phase 3, z krótkim dowodem przy tych niespełnionych.
- Issue references (or "no issue — ad-hoc" in free-text mode).
- Anything skipped vs the plan, open follow-ups, deferred work (w tym: co wymaga ręcznego sprawdzenia na urządzeniu / rebuildu natywnego).
- Suggested next action (commit + PR against `development`; druga iteracja implementacji dla niespełnionych AC; lub address X first).

## Guardrails

- Never run destructive git ops (`reset --hard`, `push --force`, `branch -D`) without user confirmation.
- Never auto-merge or auto-push.
- In issue-number mode, if any `gh issue view <N>` failed, stop and tell the user — do not fabricate issue content.
- In empty mode, never start the pipeline before the user picks issue(s) or supplies a description.
- If the working tree was dirty at start, ask the user how to proceed (stash, commit, or abort) before creating a new branch.
- Branche robocze tworzymy od `development`, a PR-y celują w `development`. **Zawsze `gh pr create --base development ...`** — bez `--base` `gh` celuje w default branch repo (`master`), co łamie politykę. Nigdy nie kieruj PR-a bezpośrednio do `master`; integracja `development` → `master` (release) jest ręczną procedurą maintainera.
- Nie bumpuj wersji w `package.json` / `app.json` w ramach feature brancha — wersjonowanie to osobny krok release'owy.
