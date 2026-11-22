# Change Profile

[日本語](README.md) · [Download](https://github.com/31mskz10/alfred-workflows/releases/download/Change_Profile/Change.Profile.alfredworkflow)

Switch Karabiner-Elements profiles from Alfred. Profiles are read from Karabiner-Elements, so no setup is needed. Requires macOS, Alfred Powerpack and Karabiner-Elements.

## Usage

1. Type `ke` followed by a space in Alfred to list your profiles. The active profile is marked "Current profile".
2. Filter by name and press Return. A notification confirms the switch.

The workflow uses `/Library/Application Support/org.pqrs/Karabiner-Elements/bin/karabiner_cli`, which a standard Karabiner-Elements installation provides.

## Configuration

Select the workflow in Alfred Preferences and open Configure Workflow.

| Setting | Default | Description |
| --- | --- | --- |
| Language | Auto | Language of the displayed text. Auto uses Japanese when macOS's first preferred language is Japanese, English otherwise. |
| Keyword | `ke` | The keyword typed in Alfred. |
