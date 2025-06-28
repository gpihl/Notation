# Manual Test Plan

These steps cover basic use of the Notation app. Run them on iOS Safari 16 and the latest Chrome on desktop.

## Setup
1. From the repository root, start a static server to avoid module-loading issues:
   ```bash
   npx http-server -c-1
   ```
   or
   ```bash
   python -m http.server 8000
   ```
2. Navigate to `http://localhost:8080/public/` (or `http://localhost:8000/public/` if using Python) and open `index.html`.

## Tests
1. **App loads** – Accept the prompts for key and time signature (defaults `C`, `4/4`). Verify a blank stave renders.
2. **Toolbar** – Tap the floating button to open the palette. Select each tool in turn and confirm the active tool changes (visual highlight in the score when editing).
3. **Note creation** – With the note tool, touch and drag across the staff. While dragging up/down, pitch should change chromatically. Release to commit the symbol.
4. **Rest creation** – Select the rest tool and drag to place rests at different positions.
5. **Edit existing symbol** – With the hand tool, drag an existing note to move it horizontally or vertically. The symbol should be highlighted yellow while dragging.
6. **Erase** – Choose the erase tool and tap a symbol to remove it.
7. **Panning** – With the hand tool on blank space, drag horizontally to pan the score.
8. **Responsive layout** – Confirm controls remain at least 44 px and UI functions on both iOS Safari and desktop Chrome.

Record GIFs if possible or note any failures. All steps should behave identically on both browsers.
