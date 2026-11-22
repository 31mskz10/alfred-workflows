# Toggle Dark Mode

[English](README.en.md) · [ダウンロード](https://github.com/31mskz10/alfred-workflows/releases/download/Toggle_Dark_Mode/Toggle.Dark.Mode.alfredworkflow) · [一覧へ戻る](../README.md)

macOSのダークモードとライトモードを切り替えます。

## 必要なもの

- ダークモードを利用できるmacOS
- Alfred 5以降、Alfred Powerpack

## 初期設定

言語やキーワードは「設定」で変更できます。初回実行時にSystem Eventsの操作許可を求められた場合は、許可してください。

## 使い方

Alfredで `darkmode` を入力すると、現在のモードと切り替え先が表示されます。Enterを押すと、表示された切り替え先のモードに切り替わります。引数は不要です。

## 設定

Alfred Preferencesでワークフローを選び、Configure Workflowで変更します。

| 設定 | 初期値 | 内容 |
| --- | --- | --- |
| 言語 | 自動 | 表示する文言の言語。自動はmacOSの最優先言語が日本語なら日本語、それ以外は英語。 |
| キーワード | `darkmode` | Alfredで入力するキーワード。 |
