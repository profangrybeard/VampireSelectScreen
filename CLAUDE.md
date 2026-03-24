# Vampire Clan Select Screen

Read `.claude/CLAUDE.md` for full project context, creative constraints, and pipeline rules.

## Documentation Structure

All teachable docs live in `docs/`. AI context lives in `.claude/`.

```
docs/
  design-intent.md          <- The bible. Read first.
  defining-done.md          <- Per-pass completion criteria.
  pass-briefs/              <- One file per pass.
  logs/                     <- AI direction log + resistance log.
  lectures/                 <- Case studies and lecture material.
.claude/
  CLAUDE.md                 <- Claude's project rules. Also teaching material.
  settings.local.json       <- Claude tool config.
```

## Quick Rules
- Check which **pass** we are on before making changes. Do not jump ahead.
- **Silhouette posture** is the #1 priority. It must read without text.
- **Mobile-first portrait** layout. Always.
- **Tap only** — no swipe gestures.
- New docs go in `docs/` under the appropriate subfolder. See `docs/` README for placement rules.
