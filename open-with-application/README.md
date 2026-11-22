# Open with Application

[English](README.en.md) · [ダウンロード](https://github.com/31mskz10/alfred-workflows/releases/download/Open_with_Application/Open.with.Application.alfredworkflow) · [一覧へ戻る](../README.md)

Finderで選択中のファイル・フォルダを指定のアプリで開く。

Launchpadのようなコンパクトな6列のアイコングリッドからアプリを選びます。中央の検索欄で名前を絞り込めます。操作方法は検索欄の「?」から確認できます。Path Finderにも対応しています。

## 必要なもの

- macOS、Alfred 6 Powerpack
- FinderまたはPath Finder
- 対象のファイル・フォルダを開けるアプリ

Alfred 5を使用している場合は、[旧版（2.0.0）](https://github.com/31mskz10/alfred-workflows/releases/download/owa_v2.0.0/Open.with.Application.alfredworkflow)を利用してください。

## 初期設定

ダウンロードした `.alfredworkflow` を開き、Alfredにインポートします。アプリ一覧は自動で取得するため、個別の登録は不要です。

初回実行時にアプリの操作許可を求められた場合は、Alfredから対象アプリへの操作を許可してください。ホットキーを使う場合は、ワークフローエディタのHotkeyで割り当てを確認・変更できます。

## Environment Variables

AlfredのWorkflow編集画面でEnvironment Variablesを開き、次の値を設定できます。変更は次回起動時に反映されます。

| 変数 | 初期値 | 設定 |
| --- | --- | --- |
| `language` | `auto` | `ja`: 日本語、`en`: 英語、`auto`: macOSの最優先言語が日本語なら日本語、それ以外は英語。 |
| `history_limit` | `50` | 保存する直近の選択件数。1〜1000の整数。不正な値は50件として扱います。 |

件数を減らすと、次の選択確定時に古い履歴が削除されます。後で件数を増やしても、削除済みの履歴は復元されません。

## 使い方

1. FinderまたはPath Finderでファイル・フォルダを選択し、そのウインドウを最前面にします。
2. Alfredで `o` に続けて半角スペースを入力すると、アプリ一覧へ自動で切り替わります。続けてアプリ名を検索します。
3. 検索欄にアプリ名を入力し、候補を選んでEnterを押します。アプリのダブルクリックでも開けます。

| 操作 | 動作 |
| --- | --- |
| 上下キー | 上下の行へ選択を移動 |
| 左右キー | 前後のアプリへ選択を移動 |
| Command＋左右キー | 検索文字の先頭・末尾へカーソルを移動 |
| Enter | 選択したアプリで対象を開く |
| Command＋Enter | 選択したアプリを指定して、開くファイル・フォルダをAlfredで検索 |
| Shift＋Enter | 対象を開いた後、アプリ一覧をもう一度表示 |
| Esc | アプリ一覧を閉じる |
| Command＋? | 操作方法を表示 |

Finderで何も選択していない場合は、現在開いているフォルダを対象にします。Finderのウインドウも開いていない場合は、ホームフォルダが対象です。

自動起動に失敗した場合は、表示される候補をEnterで開けます。

## アプリ一覧

`/Applications`、`/System/Applications`、ホームフォルダ内の `Applications` を検索します。それぞれ直下と1階層下の `.app` が対象です。

一覧は画面を開くたびに非同期で取得します。画面と検索欄を先に表示し、取得が完了するとアプリが表示されます。このWorkflowで`history_limit` で指定した直近の選択履歴（初期値50件）から、回数が多い順、同数なら最後に選んだ順に表示します。履歴にないアプリは名前順です。履歴はAlfred UIの永続変数に指定件数まで保存し、次回から反映されます。以前の累計回数は引き継ぎません。Enter・Command＋Enter・Shift＋Enter・ダブルクリックでの確定を数え、カーソル移動は数えません。アプリを追加・移動した場合は、画面を開き直してください。アイコンにポインタを重ねると、アプリのパスを確認できます。

## 参考

- [Alfred UI公式ドキュメント](https://www.alfredapp.com/help/alfredui/)
- ファイルを開く処理は、[franzheidl/alfred-workflowsのopen-with-sublime-text](https://github.com/franzheidl/alfred-workflows/tree/master/open-with-sublime-text)を参考に作成しました。
