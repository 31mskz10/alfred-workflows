# Application Group

[日本語](README.md) · [Download](https://github.com/31mskz10/alfred-workflows/releases/download/Application_Group/Application.Group.alfredworkflow) · [Back to list](../README.md)

Create groups of apps and launch each group at once. Groups are created and edited in an Alfred UI window, so you never need to open the workflow editor. Requires macOS and Alfred 6 Powerpack. Saving and restoring window layouts also requires Accessibility access for Alfred and permission for Alfred to control System Events (Automation).

For Alfred 5, use [version 1.0.0](https://github.com/31mskz10/alfred-workflows/releases/download/Launch_Applications/Launch.Applications.alfredworkflow) (formerly Launch Applications). Groups configured in 1.0.0 are not carried over to 2.0.0.

## Usage

1. Type `ag` in Alfred and press Return to open the group list. Type `ag work` to open it filtered by group name.
2. Select a group and press Return, or double-click it. Its apps launch, and windows with a saved layout move to their saved position and size.

| Key | Action |
| --- | --- |
| Up / Down | Select a group |
| Return / double-click / Launch button | Launch the apps and restore the window layout |
| Shift + Return | Launch the apps without restoring the layout |
| Command + N / + button | Create a group |
| Command + E / Edit… button | Edit the name and apps of the selected group |
| Command + L / Save Window Positions button | Save the window layout of the selected group |
| Command + Delete / − button | Delete the selected group |
| Escape | Close |

### Choosing apps

The create and edit sheet lists the apps in `/Applications`, `/System/Applications` and `~/Applications`. Type in the search field to filter, then press Return or double-click to select or deselect an app. After clicking the list to focus it, Return and Space toggle the selected app. Search again to pick the next one. After using the list, click the search field before typing. Apps that were selected when the sheet opened and apps added with Other… are listed at the top. Use Other… for apps outside these folders. Press Command + S or click Save to finish.

### Saving a window layout

1. Launch the group's apps and arrange their windows. You can use several displays.
2. Open the window with `ag`, select the group and press Command + L.

Windows of running apps are saved, except minimized ones. Saved windows are kept for apps that are not running or have no windows to save.

Positions and sizes are stored relative to the display that contains each window's center, so windows return to the same place on the same display even if the display arrangement or resolution changes. When the saved display is not connected, windows are fitted onto the nearest display. A window spanning several displays is restored inside the display that contains its center. Multiple windows of one app are matched by title, then by stacking order.

Restoring waits until each app has opened as many windows as were saved, up to 20 seconds (configurable) for the whole group. Apps that do not open all their windows in time have only their open windows placed. Allow Alfred in System Settings > Privacy & Security > Accessibility and > Automation (System Events). Without access, a message appears at the bottom of the window or as a notification.

### Storage

Groups are stored in `~/Library/Application Support/Alfred/AlfredUI/Persist/com.31mskz10.LaunchApplications.ui/variables.json`. They survive workflow updates but are not part of Alfred's preference sync, so recreate them on other Macs. If this file is damaged and cannot be read, the window says so at the bottom and changes cannot be saved. Fix the file, or move it elsewhere and reopen the window to start empty.

If an app in a group can no longer be found, the other apps still launch and the missing ones are listed at the bottom of the window. Press Command + E to choose the apps again.

## Configuration

Select the workflow in Alfred Preferences and open Configure Workflow.

| Setting | Default | Description |
| --- | --- | --- |
| Language | Auto | Language of the window. Auto uses Japanese when macOS's first preferred language is Japanese, English otherwise. |
| Keyword | `ag` | The keyword typed in Alfred. |
| Window wait time (seconds) | `20` | Maximum seconds to wait for app windows to open when restoring positions, for the whole group: an integer from 1 to 300. Invalid values fall back to 20. |
