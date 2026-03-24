# Project Documentation

All teachable project documentation lives here. If you're looking for something, start with the table below.

## Where Things Go

| What | Where | Rule |
|------|-------|------|
| Creative spec / "the bible" | `design-intent.md` | One file. Written before code. Updated rarely. |
| Per-pass completion criteria | `defining-done.md` | Updated as each pass reveals what we don't know. |
| Pass build briefs | `pass-briefs/pass-N-name.md` | One file per pass. Created when we enter that pass. |
| AI direction log | `logs/ai-direction-log.md` | Append new entries. Asked/Produced/Decision format. |
| Resistance log | `logs/resistance-log.md` | Append new entries. Raw, timestamped, unpolished. |
| Case studies / lecture material | `lectures/` | One file per case study. |

## Rules for New Docs

1. Pick the right bucket from the table above before writing.
2. If it doesn't fit a bucket, put it in `docs/` root and add it to this table.
3. Logs are append-only. Don't edit old entries — add new ones.
4. Pass briefs are created when we enter a pass, not before.
5. Claude's AI context stays in `.claude/`, not here.

## Also in This Repo

- **[`.claude/`](../.claude/)** — Claude's project context and rules. Teaching material too — shows students how to set up AI context.
- **[`DEPLOY.md`](../DEPLOY.md)** — GitHub Pages deployment guide.
- **[`README.md`](../README.md)** — Public-facing project overview with resistance summary.
