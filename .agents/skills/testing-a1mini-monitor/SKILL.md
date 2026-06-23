---
name: testing-a1mini-monitor
description: Test the A1 mini printer monitor page end-to-end. Use when verifying status dashboard, maintenance log, or reminder features.
---

# Testing the A1 mini Printer Monitor

## Overview

This is a static HTML/CSS/JS application with no build step. All state is persisted in localStorage under keys: `a1mini_status`, `a1mini_log`, `a1mini_reminders`.

## Setup

1. Start a local server from the repo root:
   ```bash
   cd /home/ubuntu/repos/a1mini && python3 -m http.server 8080
   ```
2. Open `http://localhost:8080` in Chrome
3. Clear localStorage before testing for a clean state:
   - Open DevTools Console → `localStorage.clear()` → reload

## Key Test Flows

### Status Dashboard
- Change printer state dropdown (Idle/Tlaci/Pozastavena/Chyba/Offline)
- Set numeric values in input fields (nozzle temp, bed temp, progress, speed, hours, prints)
- Select filament type from dropdown
- Click "Ulozit stav" button → expect toast "Stav ulozeny"
- Reload page → all values should persist
- Progress bars should fill proportionally (nozzle max=300, bed max=80, progress max=100, speed max=500)

### Maintenance Log
- Fill date, type (dropdown), and description (textarea)
- Click "Pridat zaznam" → expect toast "Zaznam pridany"
- Entry appears in table with color-coded type badge
- Click X button on entry → expect toast "Zaznam vymazany"
- Reload → deleted entries stay deleted, remaining entries persist
- Badge colors: Udrzba=cyan, Oprava=red, Vylepsenie=yellow, Poznamka=gray

### Maintenance Reminders
- 8 reminder cards rendered from default config
- Initial state shows "Nezbehla" (red badge) and "Posledne: Nikdy"
- Click "Hotovo" → expect toast "Pripomienka aktualizovana"
- Status changes to "Za X dni" (green) based on interval
- "Posledne" date updates to today's date in D.M.YYYY format
- Reload → reminder state persists

## Common Issues

- The page uses Slovak language for all UI text and toasts
- Number inputs accept decimals (e.g. 12.5 hours)
- Toasts appear at the bottom of the viewport and auto-dismiss after ~3s
- The date input defaults to today's date on page load
- Reminder intervals: Y-axis=30d, hotend=21d, extruder=30d, belts=90d, PTFE=90d, bed=7d, firmware=30d, Z-axis=90d

## No CI

This repo has no CI configured. Testing is purely manual via browser.

## Devin Secrets Needed

None - this is a fully static app with no external dependencies or APIs.
