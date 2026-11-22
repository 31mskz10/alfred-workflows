# Application Group

[日本語](README.md) · [Download](https://github.com/31mskz10/alfred-workflows/releases/download/Application_Group/Application.Group.alfredworkflow)

Create groups of apps and launch each group at once. Groups are created and edited in an Alfred UI window, so you never need to open the workflow editor. Requires macOS and Alfred 6 Powerpack. Saving and restoring window layouts also requires Accessibility access for Alfred.

For Alfred 5, use [version 1.0.0](https://github.com/31mskz10/alfred-workflows/releases/download/Launch_Applications_v1.0.0/Launch.Applications.alfredworkflow) (formerly Launch Applications). Groups configured in 1.0.0 are not carried over to 2.0.0.

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

The create and edit sheet lists the apps in `/Applications`, `/System/Applications` and `~/Applications`. Type in the search field to filter, then press Return or double-click to select or deselect an app. Search again to pick the next one. Selected apps are listed at the top. Use Other… for apps outside these folders. Press Command + S or click Save to finish.

### Saving a window layout

1. Launch the group's apps and arrange their windows. Windows can span several displays.
2. Open the window with `ag`, select the group and press Command + L.

Windows of running apps are saved, except minimized ones. Saved windows of apps that are not running are kept. Groups with saved positions show "Window positions saved".

Positions and sizes are stored relative to the display each window is on, so windows return to the same place on the same display even if the display arrangement or resolution changes. When the saved display is not connected, windows are fitted onto the nearest display. Multiple windows of one app are matched by title, then by stacking order.

Restoring waits up to 20 seconds for each app's windows to open. Allow Alfred in System Settings > Privacy & Security > Accessibility. Without access, a message appears at the bottom of the window or as a notification.

### Storage

Groups are stored in `~/Library/Application Support/Alfred/AlfredUI/Persist/com.31mskz10.LaunchApplications.ui/variables.json`. They survive workflow updates but are not part of Alfred's preference sync, so recreate them on other Macs.

If an app in a group can no longer be found, the other apps still launch and the missing ones are listed at the bottom of the window. Press Command + E to choose the apps again.

## Configuration

Select the workflow in Alfred Preferences and open Configure Workflow.

| Setting | Default | Description |
| --- | --- | --- |
| Language | Auto | Language of the window. Auto uses Japanese when macOS's first preferred language is Japanese, English otherwise. |
| Keyword | `ag` | The keyword typed in Alfred. |
