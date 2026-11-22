# Application Group

[日本語](README.md) · [Download](https://github.com/31mskz10/alfred-workflows/releases/download/Application_Group/Application.Group.alfredworkflow)

Create groups of apps and launch each group at once. Groups are created and edited in an Alfred UI window, so you never need to open the workflow editor. Requires macOS and Alfred 6 Powerpack.

For Alfred 5, use [version 1.0.0](https://github.com/31mskz10/alfred-workflows/releases/download/Launch_Applications_v1.0.0/Launch.Applications.alfredworkflow) (formerly Launch Applications). Groups configured in 1.0.0 are not carried over to 2.0.0.

## Usage

1. Type `a` in Alfred and press Return to open the group list. Type `a work` to open it filtered by group name.
2. Select a group and press Return, or double-click it. Its apps launch and the window closes.

| Key | Action |
| --- | --- |
| Up / Down | Select a group |
| Return / double-click | Launch the selected group |
| Command + N | Create a group: enter a name, then choose apps |
| Command + E | Choose the apps of the selected group again |
| Command + R | Rename the selected group |
| Command + D | Delete the selected group |
| Escape | Close |

In the app chooser, Command-click to select several apps.

Groups are stored in `~/Library/Application Support/Alfred/AlfredUI/Persist/com.31mskz10.LaunchApplications.ui/variables.json`. They survive workflow updates but are not part of Alfred's preference sync, so recreate them on other Macs.

If an app in a group can no longer be found, the other apps still launch and the missing ones are listed at the bottom of the window. Press Command + E to choose the apps again.

## Environment Variables

| Variable | Default | Values |
| --- | --- | --- |
| `language` | `auto` | `ja`: Japanese, `en`: English, `auto`: Japanese when macOS's first preferred language is Japanese; English otherwise. |
