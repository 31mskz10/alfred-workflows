# OpenIn Temporary Switch

[日本語](README.md) · [Download](https://github.com/31mskz10/alfred-workflows/releases/download/OpenIn_Temporary_Switch/OpenIn.Temporary.Switch.alfredworkflow)

Temporarily switch OpenIn rules from Alfred and switch back to the default rule after a set number of minutes. Requires macOS, Alfred Powerpack and OpenIn (App Store or Setapp).

## Setup

1. In OpenIn, create the rules you want to switch to and start their names with `[Mode]`, such as `[Mode] Work` or `[Mode] Private`.
2. Create a rule named `Default` to switch back to, or set another name in the configuration below.
3. Open Configure Workflow in Alfred and check the settings.

| Setting | Default | Description |
| --- | --- | --- |
| Default rule name | `Default` | The rule enabled when switching back. Must match the OpenIn rule name exactly. |
| Mode prefix | `[Mode]` | Rules whose names start with this text are listed. |
| Default minutes | `10` | Minutes until switching back when no number is typed. |
| Auto revert | On | Switch back to the default rule after the given minutes. |
| OpenIn database path | empty | Leave empty to use the standard location. |
| OpenIn.app path | empty | Leave empty to search `/Applications` and `/Applications/Setapp`. |

## Usage

1. Type `oi` in Alfred. Rules with the prefix are listed without it, with the icon of the app each rule opens.
2. Choose a rule and press Return. By default it switches back to `Default` after 10 minutes.
3. Type a number such as `oi 30` to change the delay. Add a name, as in `oi 30 work`, to filter the rules.

Choose `Default` (or your default rule name) to switch back immediately. With auto revert off, or after switching with `oi 0`, the rule stays until you switch back yourself.

## How it works

- OpenIn is quit, its settings database is updated, and OpenIn is relaunched.
- All rules are disabled and only the chosen rule is enabled, including rules without the prefix.
- Switching back enables only the default rule; the previous state is not restored. If the default rule does not exist, all rules end up disabled.
- A new switch or a manual switch back cancels the pending revert. Pending reverts do not survive a restart.
- The workflow edits OpenIn's internal database, so an OpenIn update that changes the database may break it. Back up your OpenIn settings first.
