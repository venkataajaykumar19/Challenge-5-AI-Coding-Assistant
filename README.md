# Challenge 5 — AI-Assisted Feature: Search / Filter

## Challenge 5 Summary

- **Feature**: Search / Filter
- **Tool**: GitHub Copilot
- **Implementation**: A live text input (`#search-input`) that filters task titles as the user types, handling empty queries, case-insensitivity, and integration with active status tabs (`All`, `Active`, `Completed`).
- **Evidence**: See [`PROMPTS.md`](file:///C:/Users/ajayk/.gemini/antigravity-ide/scratch/Challenge-5-AI-Coding-Assistant/PROMPTS.md) for the Copilot interaction audit log.

---

# Pair Version — Task Manager

This folder contains the task manager app built using an **AI pair programming** approach with **GitHub Copilot** as the AI assistant.

## Tool Used

**Tool:** GitHub Copilot (inline suggestions + chat)

## Workflow

Unlike the vibe version, this was **not** built from a single prompt. The workflow was:

1. **Created `index.html`** manually — wrote the semantic HTML structure myself, accepted Copilot's attribute suggestions (aria labels, IDs)
2. **Created `style.css`** — architectural decision to separate concerns. Copilot suggested inline `<style>` block; **rejected** that and created a standalone CSS file
3. **Created `app.js`** — Copilot suggested a procedural approach with functions; **modified** to use a class-based `TaskManager` + `UIController` pattern for separation of state and rendering
4. **XSS protection** — Copilot suggested `createTextNode`; **accepted** that suggestion
5. **Event delegation** — Copilot suggested attaching individual listeners per button; **modified** to use delegation on the parent nav element
6. **ARIA live regions** — Copilot omitted these; **added manually** for accessibility

## Time to Build

**~98 seconds** (from first file creation to fully working application)

## Files Created

| File | Purpose | Lines |
|------|---------|-------|
| `index.html` | HTML structure + semantic markup | ~94 |
| `style.css` | All styles, design tokens, animations | ~434 |
| `app.js` | State management + UI controller classes | ~286 |

**Total files: 3**  
**Total lines: ~814**

## Suggestions Log

| # | Copilot Suggestion | Action | Reason |
|---|-------------------|--------|--------|
| 1 | Inline `<style>` in HTML | **Rejected** | Separation of concerns |
| 2 | Procedural JS functions | **Modified** | Used class pattern instead |
| 3 | `innerHTML` for task rendering | **Modified** | Used `createTextNode` for XSS safety |
| 4 | Attach listener to each filter button individually | **Modified** | Used event delegation on parent |
| 5 | `createTextNode` for task title | **Accepted** | Correct XSS-safe approach |
| 6 | `DOMContentLoaded` entrypoint | **Accepted** | Correct pattern |
| 7 | No ARIA live region on count | **Overridden** | Added manually for a11y |

## Live URL

**https://venkataajaykumar19.github.io/Project-Engineering/pair-version/**

## Folder Structure

```
pair-version/
├── index.html    ← Semantic HTML structure
├── style.css     ← Stylesheet with CSS custom properties
└── app.js        ← TaskManager + UIController classes
```

## Observations

### What pair programming improved over vibe
- **Architecture**: Clean separation of HTML/CSS/JS — each file has a single responsibility
- **Code quality**: Class-based state management, immutable updates, documented decision points
- **Control**: Every architectural choice was deliberate and documented
- **Correctness**: XSS protection, ARIA accessibility, and edge cases handled explicitly

### Limitations compared to vibe
- **Speed**: Took ~37 seconds longer than the vibe version
- **Effort**: Required knowing what to ask Copilot for — not fire-and-forget
- **Styling**: The initial CSS skeleton required more manual iteration than vibe's instant result

### Key decisions made during pair programming
- Chose `class` pattern over procedural — enables future unit testing of `TaskManager` independently
- Used CSS custom properties (design tokens) — makes theming/maintenance easier
- Separated `UIController` concerns from `TaskManager` — state management is now pure and testable
