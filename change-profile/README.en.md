# Change Profile

[日本語](README.md) · [Download](https://github.com/31mskz10/alfred-workflows/releases/download/Change_Profile/Change.Profile.alfredworkflow) · [Back to list](../README.md)

Switch Karabiner-Elements profiles from Alfred. Profiles are read from Karabiner-Elements, so no setup is needed. Requires macOS, Alfred 5 or later, Alfred Powerpack and Karabiner-Elements.

## Usage

1. Type `ke` followed by a space in Alfred to list your profiles. The active profile is marked "Current profile".
2. Filter by name and press Return. A notification shows the result, including the reason if the switch fails.

The workflow uses `/Library/Application Support/org.pqrs/Karabiner-Elements/bin/karabiner_cli`, which a standard Karabiner-Elements installation provides.

Changes from 1.0.0: profile names no longer need to be configured. Toggling iTerm after a switch and running through Terminal Command have been removed.

## Configuration

Select the workflow in Alfred Preferences and open Configure Workflow.

| Setting | Default | Description |
| --- | --- | --- |
| Language | Auto | Language of the displayed text. Auto uses Japanese when macOS's first preferred language is Japanese, English otherwise. |
| Keyword | `ke` | The keyword typed in Alfred. |
