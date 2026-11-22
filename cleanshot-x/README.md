# CleanShot X Actions

[English](README.en.md) · [ダウンロード](https://github.com/31mskz10/alfred-workflows/releases/download/CleanShot_X_Actions/CleanShot.X.Actions.alfredworkflow) · [一覧へ戻る](../README.md)

CleanShot Xの撮影・録画・注釈などのアクションを検索し、実行します。

## 必要なもの

- macOS、Alfred Powerpack
- CleanShot X

## 初期設定

1. CleanShot Xをインストールして起動します。
2. 撮影・録画に必要なmacOSの権限を、CleanShot Xの案内に従って許可します。
3. ワークフローをインポートします。追加の設定は不要です。

## 使い方

1. Alfredで `cs` に続けてスペースを入力すると、アクションの一覧が表示されます。
2. 英語のアクション名で絞り込みます。例: `cs capture`、`cs record`、`cs annotate`
3. アクションを選び、Enterを押します。

撮影アクションには、撮影後にコピー・保存・注釈・アップロード・ピン留めを行う候補もあります。`Upload` を選ぶと、CleanShot Xのアップロード処理が実行されます。

利用できるアクションは、インストールしているCleanShot Xの対応状況に依存します。

1.0.0からの変更点: Python 3が不要になりました。アクション一覧をCleanShot XのWebサイトから取得する処理は削除し、ワークフローに含めた一覧を使います。
