# Change Profile

[English](README.en.md) · [ダウンロード](https://github.com/31mskz10/alfred-workflows/releases/download/Change_Profile/Change.Profile.alfredworkflow) · [一覧へ戻る](../README.md)

Karabiner-ElementsのプロファイルをAlfredから切り替えます。プロファイルの一覧はKarabiner-Elementsから自動で読み込むため、設定は不要です。

## 必要なもの

- macOS、Alfred Powerpack
- Karabiner-Elements

## 使い方

1. Alfredで `ke` に続けてスペースを入力すると、プロファイルの一覧が表示されます。現在のプロファイルには「現在のプロファイル」と表示されます。
2. プロファイル名で絞り込み、Enterを押します。切り替えが完了すると通知が表示されます。

コマンドは `/Library/Application Support/org.pqrs/Karabiner-Elements/bin/karabiner_cli` を使用します。Karabiner-Elementsを標準の方法でインストールしていれば、この場所にあります。

1.0.0からの変更点: プロファイル名を設定する必要がなくなりました。切り替え後にiTermの表示・非表示を切り替える処理と、Terminal Commandによる実行は削除しました。
