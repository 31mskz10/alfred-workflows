# Execute ImageOptim

[English](README.en.md) · [ダウンロード](https://github.com/31mskz10/alfred-workflows/releases/download/Execute_ImageOptim/Execute.ImageOptim.alfredworkflow) · [一覧へ戻る](../README.md)

FinderまたはPath Finderで選択中のファイル・フォルダをImageOptimに渡し、画像を圧縮します。何も選択していない場合は、開いているフォルダを渡します。

## 必要なもの

- macOS、Alfred Powerpack
- [ImageOptim](https://imageoptim.com/mac)
- FinderまたはPath Finder

## 使い方

1. FinderまたはPath Finderで画像を選択するか、画像のあるフォルダを開きます。
2. Alfredで `io` を入力し、Enterを押します。

フォルダを渡した場合、ImageOptimはサブフォルダ内の画像も処理します。ImageOptimは元のファイルを上書きするため、元画像を残したい場合はコピーしてから実行してください。圧縮方法はImageOptim側の設定に従います。

ImageOptimがインストールされていない場合は、通知で知らせます。初回実行時にアプリの操作許可を求められた場合は、AlfredからFinderまたはPath Finderへの操作を許可してください。

## 設定

Alfred Preferencesでワークフローを選び、Configure Workflowで変更します。

| 設定 | 初期値 | 内容 |
| --- | --- | --- |
| 言語 | 自動 | 表示する文言の言語。自動はmacOSの最優先言語が日本語なら日本語、それ以外は英語。 |
| キーワード | `io` | Alfredで入力するキーワード。 |
