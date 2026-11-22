# OpenIn Temporary Switch

[日本語](README.md) · [Download](https://github.com/31mskz10/alfred-workflows/releases/download/OpenIn_Temporary_Switch/OpenIn.Temporary.Switch.alfredworkflow) · [Back to list](../README.md)

Temporarily switch OpenIn rules from Alfred and switch back to the default rule after a set number of minutes. Requires macOS, Alfred 5 or later, Alfred Powerpack and OpenIn (App Store or Setapp).

## Setup

1. In OpenIn, create the rules you want to switch to and start their names with `[Mode]`, such as `[Mode] Work` or `[Mode] Private`.
2. Create a rule named `Default` to switch back to, or set another name in the configuration below.
3. Open Configure Workflow in Alfred and check the settings.

| Setting | Default | Description |
| --- | --- | --- |
| Language | Auto | Language of the displayed text. Auto uses Japanese when macOS's first preferred language is Japanese, English otherwise. |
| Keyword | `oi` | The keyword typed in Alfred. |
| Default rule name | `Default` | The rule enabled when switching back. Must match the OpenIn rule name exactly. |
| Mode prefix | `[Mode]` | Rules whose names start with this text are listed. |
| Default minutes | `10` | Minutes until switching back when no number is typed. |
| Auto revert | On | Switch back to the default rule after the given minutes. |
| OpenIn database path | empty | Leave empty to use the standard location. |
| OpenIn.app path | empty | Leave empty to search `/Applications` and `/Applications/Setapp`. |

## Usage

1. Type `oi` in Alfred. Rules with the prefix are listed without it, with the icon of the app each rule opens.
2. Choose a rule and press Return. By default it switches back to `Default` after 10 minutes.
3. Type a number such as `oi 30` to change the delay. Combine it with a name, as in `oi 30 work` or `oi work 30`, to filter the rules. Put the minutes, a whole number from 0 to 10080 (7 days), at the start or end. A number at the start or end is always read as minutes, so it cannot filter by a number in a rule name.

Choose `Default` (or your default rule name) to switch back immediately. With auto revert off, or after switching with `oi 0`, the rule stays until you switch back yourself.

## How it works

- OpenIn is quit, its settings database is updated, and OpenIn is relaunched. If OpenIn does not quit within 5 seconds, the database is not changed. OpenIn may still quit later and stay closed. OpenIn is launched on every switch and revert, even if you had quit it.
- Only handlers (such as the web browser) that have `[Mode]` rules are changed. In those handlers only the chosen rule is enabled and every other rule, including rules without the prefix, is disabled. Handlers without the chosen rule get the default rule. Rules of other handlers are left alone.
- Switching back enables only the default rule in the same handlers; the previous state is not restored.
- If any handler with `[Mode]` rules lacks the default rule, the list shows an error and nothing is switched.
- A successful new switch or manual switch back cancels the pending revert. A failed switch keeps it. Pending reverts do not survive a restart. A pending revert uses the settings from when it was scheduled, even if you change Configure Workflow meanwhile. Time spent asleep counts, so an overdue revert runs after the Mac wakes.
- A failed automatic revert is reported in a notification.
- The workflow edits OpenIn's internal database, so an OpenIn update that changes the database may break it. Back up your OpenIn settings first.
