# iCloud Mail - Show Archive & Delete Together

A Tampermonkey userscript that displays both the **Archive** and **Delete** buttons simultaneously in iCloud Mail's web toolbar. By default, iCloud Mail forces you to choose one or the other in settings. This script injects the missing button so you always have both available.

## The Problem

iCloud Mail on the web (`icloud.com/mail`) has a setting under **Settings > Viewing > "Show Archive button in the toolbar"** that toggles between showing Archive or Delete in the toolbar. There is no option to show both at the same time. If you want to archive one email and delete the next, you either have to change the setting each time or use the three-dot "More actions" menu, which is slow and tedious.

## The Solution

This userscript detects which button is currently native in the toolbar and injects the missing companion button next to it. The injected button matches iCloud Mail's own styling and icon set so it looks and feels completely native.

## Features

- **Both buttons, always visible** - Archive and Delete appear side by side in the toolbar
- **Native look and feel** - Uses iCloud Mail's actual SVG icons and button structure, indistinguishable from the real thing
- **Survives navigation** - MutationObserver and polling keep the button injected through React re-renders and page navigation
- **Lightweight** - Single file, no dependencies, no build step, no external requests
- **Cross-platform** - Works on macOS, Windows, and Linux
- **Compatible** - Works with Tampermonkey, Violentmonkey, and Greasemonkey

## Before & After

**Before:** You get either Archive OR Delete in the toolbar, never both.

**After:** Both buttons appear side by side. Archive a newsletter, then delete spam, without touching settings or menus.

## Installation

### From Greasy Fork

Install directly from [Greasy Fork](https://greasyfork.org/) (link TBD after publishing).

### From GitHub

1. Install [Tampermonkey](https://www.tampermonkey.net/) (or another userscript manager) in your browser.
2. Click the raw link to the script file: [`icloud-mail-both-buttons.user.js`](https://github.com/pacnpal/icloud-mail-both-buttons/raw/main/icloud-mail-both-buttons.user.js)
3. Tampermonkey should prompt you to install it.

### Manual

1. Open Tampermonkey's dashboard in your browser.
2. Click the **+** tab to create a new script.
3. Paste the contents of `icloud-mail-both-buttons.user.js`.
4. Save (Ctrl+S / Cmd+S).

## Recommended Setup

Set **Archive** as the native toolbar button in iCloud Mail settings:

**Settings > Viewing > "Show Archive button in the toolbar"** (checked)

This way the script injects the Delete button. The Delete action is triggered via a simulated `Delete` keypress, which is the most reliable approach. The native Archive button works as-is with no simulation needed.

## How It Works

1. The script runs inside iCloud Mail's `mail2` iframe where the toolbar lives.
2. A `MutationObserver` watches for toolbar changes (iCloud Mail is a React SPA that re-renders frequently).
3. When it finds a native Archive or Delete button, it injects the missing companion next to it.
4. **Injected Delete button:** Dispatches a `Delete` `KeyboardEvent` on `document.activeElement` via `mousedown` (not `click`) to preserve focus on the message area.
5. **Injected Archive button:** Clicks the native Archive button directly.

### Why mousedown instead of click?

When you click a button, the browser moves focus to that button before the `click` event fires. This means `document.activeElement` would become the injected button instead of the message pane, and the simulated keypress would go to the wrong element. Using `mousedown` with `preventDefault()` keeps focus where it needs to be.

## Compatibility

| Platform | Browser | Status |
|----------|---------|--------|
| macOS    | Firefox | Confirmed working |
| macOS    | Chrome  | Expected to work  |
| Windows  | Any     | Expected to work  |
| Linux    | Any     | Expected to work  |

The script uses standard Web APIs (`KeyboardEvent`, `MutationObserver`, `document.activeElement`) with no platform-specific code. If you test on a platform not listed as confirmed, please open an issue or PR to update this table.

## Troubleshooting

Open your browser's developer console and filter for `[iCloud Mail Both Buttons]` to see diagnostic logs.

**Script loads but no button appears:**
The script needs to run inside the `mail2` iframe. Check that Tampermonkey shows the script as active on `icloud.com/applications/mail2/*`. You may need to select the iframe context in your browser's console dropdown to see the logs.

**Button appears but Delete does nothing:**
Make sure a message is selected/focused before clicking. The `Delete` keypress is dispatched on `document.activeElement`, so the message pane needs focus.

**Button disappears after navigating:**
This is expected behavior. The MutationObserver and polling will re-inject the button when the toolbar re-renders. There may be a brief flash during navigation.

## Development

The script is a single self-contained `.user.js` file with no build step. Edit it directly and reload iCloud Mail to test changes.

Key constants you might want to tweak:

| Constant | Default | Purpose |
|----------|---------|---------|
| `INIT_DELAY_MS` | 2000 | Wait time after page load before starting injection |
| `POLL_INTERVAL_MS` | 2000 | How often to check for missing buttons |
| `POLL_MAX` | 30 | Number of polling cycles before stopping |
| `DEBOUNCE_MS` | 250 | Debounce delay for the MutationObserver |

## License

[MIT](LICENSE)

## Credits

Built by [pacnpal](https://github.com/pacnpal) with assistance from Claude (Anthropic).