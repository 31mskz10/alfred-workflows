# Add New File

[English](README.en.md) · [ダウンロード](https://github.com/31mskz10/alfred-workflows/releases/download/Add_New_File/Add.New.File.alfredworkflow) · [一覧へ戻る](../README.md)

FinderまたはPath Finderで開いているフォルダに、空のファイルを作成します。

## 必要なもの

- macOS、Alfred 5以降、Alfred Powerpack
- FinderまたはPath Finder

## 使い方

1. FinderまたはPath Finderで作成先のフォルダを開き、そのウインドウを最前面にします。
2. Alfredで `nf ファイル名` を入力し、Enterを押します。例: `nf memo.txt`
3. 作成すると、作成したファイルのパスが通知されます。

FinderまたはPath Finderのウインドウが開いていない場合や、「最近の項目」など通常のフォルダではないウインドウの場合は、デスクトップに作成します。同じ名前の項目がある場合は作成せず、通知で知らせます。ファイル名に `/`、`:`、改行は使えません。`.` と `..` も使えません。作成できなかった場合は、理由を通知します。

初回実行時に操作許可を求められた場合は、AlfredからSystem Events（最前面のアプリの判定に使用）、Finder、Path Finderへの操作を許可してください。

## 設定

Alfred Preferencesでワークフローを選び、Configure Workflowで変更します。

| 設定 | 初期値 | 内容 |
| --- | --- | --- |
| 言語 | 自動 | 表示する文言の言語。自動はmacOSの最優先言語が日本語なら日本語、それ以外は英語。 |
| キーワード | `nf` | Alfredで入力するキーワード。 |
| 作成後に開く | オフ | オンにすると、作成したファイルを既定のアプリで開きます。 |
