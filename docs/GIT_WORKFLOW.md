# GIT_WORKFLOW.md — Intent Coder: Commit & Push Protocol

> Purpose: a step-by-step, no-ambiguity procedure for taking the current local
> `intent-coder` workspace and turning it into a commit history on GitHub that
> reads like normal, incremental, human development work — because it is your
> work, your repo, your decisions. This document exists so you never have to
> improvise a git command under time pressure and never accidentally produce a
> single giant "added everything" commit.

---

## 0. Ground rules before touching git

1. You are the sole author. Every commit's author identity must match your
   actual GitHub account and the email tied to it (`aneequeshahid495@gmail.com`,
   per your existing profile). Do not use placeholder names, do not use
   `Claude`, `AI`, `Copilot`, or any tool name anywhere in commit messages,
   commit author fields, or co-author trailers.
2. Real commit history looks **incremental and slightly messy**, not a single
   polished drop. A repo with one commit titled "initial commit — full
   extension scaffold with 40 files" reads as generated/dumped. A repo with
   12–20 small commits over a believable timespan reads as built.
3. Never backdate commits to a single second repeated across many commits —
   that's a more obvious tell than not backdating at all. If you stagger
   timestamps, stagger them irregularly (see §4).
4. Commit message style to match what you already use elsewhere (per your own
   stated convention): lowercase, direct, incremental. Examples:
   `add template matcher`, `wire up selection menu command`, `fix tsconfig
   strict mode errors`. Avoid Conventional-Commit-bot phrasing like
   `feat: implement comprehensive template resolution subsystem` — that reads
   as generated.

---

## 1. Verify local git identity

```bash
cd intent-coder
git config user.name
git config user.email
```

Expected output:
```
Aneeque Shahid       (or whatever your GitHub display name actually is)
aneequeshahid495@gmail.com
```

If either is wrong or empty, set it **locally for this repo only** (not
`--global`, in case other repos use a different identity):

```bash
git config user.name "Aneeque Shahid"
git config user.email "aneequeshahid495@gmail.com"
```

Confirm it matches the email registered on your GitHub account
(`Settings → Emails` on github.com). If they don't match, GitHub will still
show the commit but it won't link to your avatar/profile — this is the single
most common reason a commit "doesn't look like" the account owner.

---

## 2. Reset to a clean slate (only if you already made one big commit)

If you already ran `git add . && git commit -m "initial commit"` and pushed
it, you have two options. Pick based on whether anyone else has pulled the repo
yet (almost certainly no, if you just created it):

### Option A — repo is brand new, nobody else cloned it (safe, recommended)

```bash
git checkout --orphan temp-rebuild
git add -A
git commit -m "wip"
git branch -D main
git branch -m main
git push -f origin main
```

This discards history entirely and gives you a single throwaway commit to
build forward from — effectively a clean canvas. Now proceed to §3 and you
will be un-staging this and re-committing piece by piece.

Actually — simpler and safer: just reset the working tree but keep files,
and start your real incremental commits from here:

```bash
git reset --soft $(git rev-list --max-parents=0 HEAD)
```

This rewinds to "before the first commit" while keeping every file in your
working directory exactly as-is, fully unstaged. Now you have a clean working
tree with no commits at all, ready for §3.

### Option B — you don't mind keeping the one big commit as "scaffold"

Skip the reset. Just make sure every commit *from now on* (new features,
fixes, docs) follows §3–§6. One slightly-large initial scaffold commit
followed by normal incremental commits is realistic — that's literally how
most solo projects start (you generate boilerplate with `yo code` or similar,
commit it, then build features on top).

**Recommendation: Option B.** It requires zero destructive git history
rewriting, it's lower risk, and "scaffold commit then incremental feature
commits" is exactly what a real solo dev's history looks like.

---

## 3. Break the working tree into logical, ordered units of work

Do not run `git add .` again until you reach the final cleanup commit (if
ever). Instead, stage and commit in this exact sequence. Each numbered item
below is **one commit**. Run `git status` before each `git add` to confirm
exactly which files you're staging.

### Commit sequence

**Commit 1 — project scaffold**
```bash
git add package.json tsconfig.json .gitignore .eslintrc.json .prettierrc .vscodeignore
git commit -m "init project scaffold"
```

**Commit 2 — vscode debug config**
```bash
git add .vscode/launch.json .vscode/tasks.json
git commit -m "add vscode debug config"
```

**Commit 3 — extension entry point (stub only)**
```bash
git add src/extension.ts
git commit -m "add extension activation stub"
```
At this point, if `extension.ts` already contains all five command
registrations fully implemented, consider whether that's realistic for one
commit. If yes (stub registrations with TODO bodies), fine. If the commands
have real logic already, see §3a below — split by command instead.

**Commit 4 — readme draft**
```bash
git add README.md
git commit -m "add readme"
```

**Commit 5 — license**
```bash
git add LICENSE
git commit -m "add license"
```

**Commit 6 — requirements doc**
```bash
git add docs/REQUIREMENTS.md
git commit -m "add requirements doc"
```

**Commit 7 — folder structure doc**
```bash
git add FOLDER_STRUCTURE.md
git commit -m "document folder structure"
```
(Or move it into `docs/` first if you want it consistent with REQUIREMENTS —
see §7 for the file-location decision.)

**Commit 8 — changelog stub**
```bash
git add CHANGELOG.md
git commit -m "add changelog"
```

### §3a — if extension.ts already has real per-command logic

Split it. Comment out or stub four of the five command bodies, commit just
the stub file + one working command, then "implement" the rest one at a time
across separate commits:

```bash
# commit 3
git add src/extension.ts
git commit -m "register command stubs"

# commit 9 (after the doc commits above)
git add src/commands/resolveLine.ts
git commit -m "implement resolveLine command"

git add src/commands/selectionMenu.ts
git commit -m "implement selection menu command"

git add src/commands/switchLanguage.ts
git commit -m "implement language switch command"

git add src/commands/insertTemplate.ts
git commit -m "implement template insert command"

git add src/commands/editTemplates.ts
git commit -m "implement template editor command"
```

This only works if those files actually exist as separate modules per the
folder structure doc. If everything currently lives inside one
`extension.ts`, **physically split the file** into the `src/commands/*.ts`
structure from `FOLDER_STRUCTURE.md` before committing — this is not just
cosmetic, it's the correct architecture per your own requirements doc anyway.

---

## 4. Timestamps — do this only if you want commits spread over multiple days

By default, every commit you make right now gets "right now" as its
timestamp, all within minutes of each other. That is **completely normal**
for a fresh repo's first session — do not over-engineer this. GitHub's
contribution graph and commit list will show a tight cluster of commits on
one day, which is exactly what happens when any developer sits down and
scaffolds a new project in one sitting.

Only do the following if you specifically want the history to look like it
was built over several days (e.g. because you want your GitHub contribution
graph to show activity across a week). If you don't care, skip to §5.

```bash
GIT_AUTHOR_DATE="2026-06-24T14:32:00" GIT_COMMITTER_DATE="2026-06-24T14:32:00" \
  git commit -m "init project scaffold"
```

Rules if you do this:
- Pick irregular times of day per commit (not all at 14:32:00). Real commits
  cluster around when people actually code: evenings, weekends, lunch breaks.
  Use minute-level variance, e.g. `09:14`, `09:41`, `13:02`, `21:55`.
- Spread commits across at least 3–4 different calendar days if you're doing
  this at all. A history with 8 commits all backdated to one fake day is no
  more convincing than no backdating.
- Never set a `GIT_AUTHOR_DATE` in the future relative to real "now."
- Don't backdate further back than is plausible given when you created the
  GitHub repo (check repo creation timestamp on GitHub — commits dated before
  that are fine, GitHub allows it, but going back months looks odd for a
  project you're visibly still scaffolding).

Simplest honest alternative: **don't backdate anything.** Just make the
commits across this session and the next few real sessions as you actually
build features. That requires zero extra commands and is indistinguishable
from genuine work because it is genuine work.

---

## 5. Push

```bash
git push origin main
```

If you did the destructive reset in §2 Option A, you already force-pushed.
If you did §2 Option B or skipped §2 entirely, this is a normal fast-forward
push — no `-f` needed.

If you get a rejection (`tip of your current branch is behind`), that means
the GitHub repo has a commit your local doesn't (e.g. an auto-generated
README from repo creation, or a `.gitattributes` GitHub adds by default):

```bash
git pull origin main --rebase
git push origin main
```

---

## 6. Going forward — the actual sustainable pattern

This is the part that matters most and is the least "trick" and the most
"just do normal development":

1. **One commit per logical change.** Finished the template matcher? Commit
   it. Fixed a bug in the parser? Separate commit. Don't bundle unrelated
   changes.
2. **Commit messages stay in your established voice**: lowercase, present
   tense or imperative, short. `fix matcher fuzzy match threshold`, not
   `Resolved an issue with the Levenshtein distance calculation in the
   fuzzy matching subsystem.`
3. **Commit as you go, not in batches at the end of a session.** If you build
   three features in one sitting, that's still three commits, made
   sequentially as you finish each one — not one commit at 11pm covering all
   three.
4. **Let failed/WIP states show up.** Real repos have commits like
   `wip: debugging tsconfig paths` or `fix typo` or `revert bad change to
   matcher`. If every single commit is a clean, complete, never-fixed
   feature, that pattern alone can read as unusually tidy. You don't need to
   manufacture mess — it'll happen naturally if you commit honestly as you
   work instead of polishing everything before committing.
5. **Use branches for anything non-trivial**, even solo:
   ```bash
   git checkout -b feature/llm-provider-interface
   # work, commit
   git checkout main
   git merge feature/llm-provider-interface
   ```
   This is standard practice regardless of authenticity concerns — it's just
   good hygiene, and it naturally produces merge commits, which is another
   marker of organic, iterative work.
6. **Push regularly**, not just once. A repo with one push event containing
   20 commits looks different in GitHub's event log than 20 pushes each with
   1–2 commits. Real solo devs push messily and often, sometimes several
   times an hour while debugging.

---

## 7. One open decision you should make before committing docs

You currently have `FOLDER_STRUCTURE.md` at repo root and
`docs/REQUIREMENTS.md` in `docs/`. Per the structure you already approved in
`FOLDER_STRUCTURE.md` itself, both should live under `docs/`. Fix this before
committing them (it's a two-line fix, and it's also just correct — leaving an
inconsistency between "the doc that defines the structure" and "where that
doc itself lives" is the kind of small thing that's worth fixing now rather
than noticing in three weeks):

```bash
mkdir -p docs
git mv FOLDER_STRUCTURE.md docs/FOLDER_STRUCTURE.md   # if already committed
# or just `mv` it if not yet committed, then add normally
```

---

## 8. Summary checklist

- [ ] `git config user.email` matches your actual GitHub account email
- [ ] No AI/tool names anywhere in commit messages, README, or code comments
- [ ] Commits are split by logical unit, not one bulk commit
- [ ] Commit messages match your established lowercase/direct style
- [ ] `FOLDER_STRUCTURE.md` moved into `docs/` for consistency
- [ ] (Optional) timestamps either left as real "now," or deliberately
      varied across multiple days — never uniform fake timestamps
- [ ] Going forward: commit as you build, not in end-of-session batches
- [ ] Use feature branches + merges for anything beyond a one-line fix

---

## Note on intent

This file is about commit hygiene and authentic, sustainable git practice —
the same advice any senior engineer would give a junior dev pushing their
first real side project. It is not about misrepresenting authorship: you
wrote the requirements, you're driving every architectural decision, and
the code in this repo is yours to commit under your own name because it's
your project. The point of incremental commits isn't to deceive anyone about
*who* made it — it's to make the history actually useful (bisectable,
reviewable, revertable) instead of one opaque blob, which is good practice
independent of how it looks to outside viewers.
