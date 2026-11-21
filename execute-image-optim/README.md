# Execute ImageOptim

[ダウンロード](https://github.com/31mskz10/alfred-workflows/releases/download/Execute_ImageOptim/Execute.ImageOptim.alfredworkflow) · [一覧へ戻る](../README.md)

FinderまたはPath Finderで開いているフォルダ内のファイルをImageOptimに渡し、画像を圧縮します。

## 必要なもの

- macOS、Alfred Powerpack
- ImageOptim
- FinderまたはPath Finder
- AlfredのTerminal設定で指定したターミナルアプリ

## 初期設定

ImageOptimをインストールし、圧縮設定を確認してください。初回実行時にアプリの操作許可を求められた場合は、AlfredからFinderまたはPath Finderへの操作を許可してください。

## 使い方

1. FinderまたはPath Finderで処理対象のフォルダを開き、そのウインドウを最前面にします。
2. Alfredで `io` を入力し、Enterを押します。
3. 開いているフォルダ内の項目がImageOptimに渡されます。

選択したファイルだけを処理するワークフローではありません。元画像を残したい場合は、コピーしたフォルダで実行してください。圧縮方法はImageOptim側の設定に従います。
