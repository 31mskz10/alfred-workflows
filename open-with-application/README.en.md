# Open with Application

[日本語](README.md) · [Download](https://github.com/31mskz10/alfred-workflows/releases/download/Open_with_Application/Open.with.Application.alfredworkflow)

Open files and folders selected in Finder or Path Finder with an application. Requires macOS and Alfred 6 Powerpack.

## Setup

Import the downloaded `.alfredworkflow`. Grant automation permissions when prompted. Applications are discovered automatically; configure the optional Hotkey in the workflow editor.

## Environment Variables

Open Environment Variables in Alfred's workflow editor. Changes apply the next time you open the picker.

| Variable | Default | Values |
| --- | --- | --- |
| `language` | `auto` | `ja`: Japanese, `en`: English, `auto`: Japanese when macOS's first preferred language is Japanese; English otherwise. |
| `history_limit` | `50` | Number of recent selections to retain: an integer from 1 to 1000. Invalid values fall back to 50. |

Reducing the limit discards older entries on the next confirmed selection. Increasing it does not restore discarded entries.

## Usage

1. Select files or folders in Finder or Path Finder and keep that window frontmost.
2. Type `o` followed by a space in Alfred to open the picker, then type an app name.
3. Choose an app and press Return, or double-click it.

| Key | Action |
| --- | --- |
| Arrow keys | Select an app |
| Command + Left / Right | Move to the start / end of the query |
| Return | Open selected items with the app |
| Command + Return | Search for a file or folder to open |
| Shift + Return | Open, then show the app picker again |
| Escape | Close |
| Command + ? | Show keyboard shortcuts |

Without a Finder selection, the current folder is used; without a Finder window, the home folder is used. If automatic launch fails, press Return on the fallback result.

## Applications and recent history

The picker scans `/Applications`, `/System/Applications`, and `~/Applications`, including one subfolder level. The window appears first; applications load asynchronously. Reopen it after installing or moving an app. Hover over an icon to see its path.

Apps are ordered by frequency within the retained recent selections, then by the most recent selection. Apps absent from history are ordered by name. Confirming with Return, Command + Return, Shift + Return, or a double-click adds one entry; arrow-key navigation does not. History is retained through Alfred UI's persistent variables.

Application names use their installed names; they are not translated by this workflow.
