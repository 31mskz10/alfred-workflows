# Execute ImageOptim

[日本語](README.md) · [Download](https://github.com/31mskz10/alfred-workflows/releases/download/Execute_ImageOptim/Execute.ImageOptim.alfredworkflow)

Send the files and folders selected in Finder or Path Finder to [ImageOptim](https://imageoptim.com/mac). If nothing is selected, the open folder is sent. Requires macOS and Alfred Powerpack.

## Usage

1. Select images, or open a folder of images, in Finder or Path Finder.
2. Type `io` in Alfred and press Return.

ImageOptim also processes images in subfolders and overwrites the original files, so work on a copy if you need the originals. Compression follows ImageOptim's own settings. A notification appears if ImageOptim is not installed. Grant automation permissions when prompted.

## Configuration

Select the workflow in Alfred Preferences and open Configure Workflow.

| Setting | Default | Description |
| --- | --- | --- |
| Language | Auto | Language of the displayed text. Auto uses Japanese when macOS's first preferred language is Japanese, English otherwise. |
| Keyword | `io` | The keyword typed in Alfred. |
