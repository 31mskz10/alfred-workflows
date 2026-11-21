# CleanShot X Actions

[ダウンロード](https://github.com/31mskz10/alfred-workflows/releases/download/CleanShot_X_Actions/CleanShot.X.Actions.alfredworkflow) · [一覧へ戻る](../README.md)

CleanShot Xの撮影・録画・注釈などのアクションを検索し、実行します。

## 必要なもの

- macOS、Alfred Powerpack
- CleanShot X
- AlfredからPython 3スクリプトを実行できる環境

## 初期設定

1. CleanShot Xをインストールして起動します。
2. 撮影・録画に必要なmacOSの権限を、CleanShot Xの案内に従って許可します。
3. ワークフローをインポートします。追加の変数設定は不要です。

## 使い方

1. Alfredで `cs` を入力すると、アクションの一覧が表示されます。
2. 英語のアクション名で絞り込みます。例: `cs capture`、`cs record`、`cs annotate`
3. アクションを選び、Enterを押します。

撮影アクションには、撮影後にコピー・保存・注釈・アップロード・ピン留めを行う候補もあります。候補名とURLを確認して選んでください。`Upload` を選ぶと、CleanShot Xのアップロード処理が実行されます。

## アクション一覧の取得

初回とキャッシュの有効期限切れ時に、CleanShot XのAPIドキュメントからアクション一覧を取得します。取得結果は7日間キャッシュされます。通信に失敗した場合は、ワークフローに同梱した一覧を使用します。

利用できるアクションは、インストールしているCleanShot Xの対応状況に依存します。
