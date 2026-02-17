# MEMORY.md - Long-Term Memory

## Durable Facts

### Project: Kreative-HQ
- **Location:** `/Users/oliverstephens/Desktop/Kreative-HQ`
- **Repo:** `https://github.com/olisteveo/kreative-HQ`
- **Stack:** React + TypeScript + HTML5 Canvas
- **Status:** Active development

### Key Decisions
- No emojis in UI — professional aesthetic
- Direct API calls from React (not proxied through server)
- Whiteboard tabs: Vision, Goals, Plans, Ideas, Memos, Rules, History
- Agent mini-desks on right panel with status lights

### Preferences
- Concise responses
- Clean formatting
- Build before commit
- Git push to origin main

## Canonical IDs/Refs

| Resource | Value |
|----------|-------|
| GitHub Repo | `olisteveo/kreative-HQ` |
| Main Component | `src/components/OfficeCanvas.tsx` |
| Styles | `src/components/OfficeCanvas.css` |
| API Client | `src/api/ai.ts` |

## Lessons Learned

### What Worked
- Stacked left sidebar (dashboard → cost → rules → controls)
- Agents panel on right with mini desks
- Drawing labels above zones (not on them)
- Office carpet tile pattern for background

### What Failed
- Tunnel architecture — too complex, simplified to local
- Emojis in UI — user prefers clean/professional
- Large zone widths — caused sidebar overlap

## Active Constraints

- Must work with local OpenClaw when available
- API keys in `.env` only
- Whiteboard state not yet persistent

## Pending

- [ ] OpenClaw integration (waiting for Mac Mini setup)
- [ ] API key integration for AI model calls
- [ ] Whiteboard persistence
