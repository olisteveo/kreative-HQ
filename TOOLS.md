# TOOLS.md - Environment Cheat Sheet

## Local Tool Specifics

### Git
```bash
cd /Users/oliverstephens/Desktop/Kreative-HQ
git pull origin main
git add -A
git commit -m "message"
git push origin main
```

### Build
```bash
npm run build    # Creates dist/ folder
npm run dev      # Development server
```

### File Paths
- **Workspace:** `/Users/oliverstephens/Desktop/Kreative-HQ`
- **Main component:** `src/components/OfficeCanvas.tsx`
- **Styles:** `src/components/OfficeCanvas.css`
- **API:** `src/api/ai.ts`

## Gotchas & Limits

### Canvas Rendering
- Zones positioned by percentage (x: 0.0-1.0)
- Labels drawn AFTER agents to appear on top
- Water cooler has no desk/monitor (special case)

### Git
- Remote URL may redirect (warning is OK)
- Always build before commit

### React/TypeScript
- Use `useCallback` for functions passed to dependencies
- State updates are batched — don't rely on immediate changes

## Repeatable Patterns

### Add New Zone
1. Add to `ZONES` constant with position, size, color, label
2. Add agent to `INITIAL_AGENTS` if needed
3. Adjust positions to avoid overlap
4. Build and test

### Add New Panel
1. Create panel div with class
2. Add CSS for positioning
3. Ensure z-index layers correctly
4. Test hover/active states

### Update Layout
1. Check zone positions don't overlap sidebars
2. Left sidebar: ~300px width
3. Right agents panel: ~200px width
4. Keep center clear for office visualization

## Rate Limits / Safety

- Web search: reasonable use, no rapid-fire
- GitHub API: not currently used directly
- Local commands: safe to run builds, unsafe to force push
