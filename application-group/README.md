# Application Group

[English](README.en.md) · [ダウンロード](https://github.com/31mskz10/alfred-workflows/releases/download/Application_Group/Application.Group.alfredworkflow) · [一覧へ戻る](../README.md)

アプリのグループを作成し、グループ単位でまとめて起動します。グループの作成・編集はAlfred UIの画面で行うため、ワークフローエディタを開く必要はありません。

## 必要なもの

- macOS、Alfred 6 Powerpack

Alfred 5を使用している場合は、[旧版（1.0.0、旧名 Launch Applications）](https://github.com/31mskz10/alfred-workflows/releases/download/Launch_Applications_v1.0.0/Launch.Applications.alfredworkflow)を利用してください。旧版のグループはワークフローエディタで設定する方式のため、2.0.0へ更新した場合はグループを作り直してください。

## 使い方

1. Alfredで `a` を入力してEnterを押すと、グループ一覧の画面が開きます。`a 仕事` のように続けて入力すると、グループ名で絞り込んだ状態で開きます。
2. グループを選び、Enterを押すか、ダブルクリックします。グループのアプリがまとめて起動し、画面が閉じます。

| 操作 | 動作 |
| --- | --- |
| 上下キー | グループを選択 |
| Enter / ダブルクリック | 選択したグループのアプリを起動 |
| Command＋N | グループを作成。名前を入力し、起動するアプリを選択します |
| Command＋E | 選択したグループのアプリを選び直す |
| Command＋R | 選択したグループの名前を変更 |
| Command＋D | 選択したグループを削除 |
| Esc | 画面を閉じる |

アプリの選択画面では、Commandキーを押しながらクリックすると複数のアプリを選べます。

グループは `~/Library/Application Support/Alfred/AlfredUI/Persist/com.31mskz10.LaunchApplications.ui/variables.json` に保存されます。ワークフローを更新しても保持されます。Alfredの設定同期の対象外のため、別のMacでは作り直してください。

見つからないアプリがあるグループを起動した場合は、見つかったアプリだけを起動し、見つからなかったアプリ名を画面の下部に表示します。Command＋Eでアプリを選び直してください。

## Environment Variables

| 変数 | 初期値 | 設定 |
| --- | --- | --- |
| `language` | `auto` | `ja`: 日本語、`en`: 英語、`auto`: macOSの最優先言語が日本語なら日本語、それ以外は英語。 |
