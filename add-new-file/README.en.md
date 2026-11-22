# Add New File

[日本語](README.md) · [Download](https://github.com/31mskz10/alfred-workflows/releases/download/Add_New_File/Add.New.File.alfredworkflow) · [Back to list](../README.md)

Create an empty file in the folder open in Finder or Path Finder. Requires macOS, Alfred 5 or later and Alfred Powerpack.

## Usage

1. Open the destination folder in Finder or Path Finder and keep that window frontmost.
2. Type `nf file-name` in Alfred and press Return, for example `nf memo.txt`.
3. A notification shows the path of the new file.

Without a Finder or Path Finder window, or when the front window is not a regular folder (such as Recents), the file is created on the Desktop. An existing item with the same name is never overwritten; a notification tells you instead. File names cannot contain `/`, `:`, or line breaks, and cannot be `.` or `..`. If creation fails, the notification shows the reason. Grant automation permissions when prompted: System Events (used to detect the frontmost app), Finder, and Path Finder.

## Configuration

Select the workflow in Alfred Preferences and open Configure Workflow.

| Setting | Default | Description |
| --- | --- | --- |
| Language | Auto | Language of the displayed text. Auto uses Japanese when macOS's first preferred language is Japanese, English otherwise. |
| Keyword | `nf` | The keyword typed in Alfred. |
| Open after creating | Off | When on, opens the created file in its default app. |
