# Open with Application

[ダウンロード](https://github.com/31mskz10/alfred-workflows/releases/download/owa_v2.0.0/Open.with.Application.alfredworkflow) · [一覧へ戻る](../README.md)

FinderまたはPath Finderで選択したファイル・フォルダを、指定したアプリで開きます。

## 必要なもの

- macOS、Alfred Powerpack
- FinderまたはPath Finder
- 対象のファイル・フォルダを開けるアプリ

## 初期設定

`o` はアプリを自動で列挙するため、一覧への登録は不要です。初回実行時にアプリの操作許可を求められた場合は、Alfredから対象アプリへの操作を許可してください。

自分で候補を管理する場合は、ワークフローエディタで `ol` のList Filterを開き、使用するアプリを登録します。各項目の `Arg` には、正式なアプリ名を指定してください。インストールしていないアプリの項目は削除できます。

## 使い方

1. FinderまたはPath Finderでファイル・フォルダを選択し、そのウインドウを最前面にします。
2. Alfredで `o アプリ名` を入力します。例: `o Visual Studio Code`
3. アプリを選び、Enterを押します。

| キーワード | 候補の取得方法 |
| --- | --- |
| `o` | Applicationsフォルダから自動取得 |
| `ol` | List Filterに登録した候補を表示 |

Finderで何も選択していない場合は、現在開いているフォルダを対象にします。Finderのウインドウも開いていない場合は、ホームフォルダが対象です。

[![実行画面](https://i.gyazo.com/4b5f8aadb79453598e322787f93d1a87.png)](https://gyazo.com/4b5f8aadb79453598e322787f93d1a87)

## アプリが一覧に出ない場合

自動取得の対象は `/Applications` とホームフォルダ内の `Applications` で、それぞれ直下と1階層下にある `.app` です。アプリ一覧は7日間キャッシュされるため、新しくインストールしたアプリがすぐには表示されない場合があります。

自動取得の対象外のアプリや、一覧にまだ反映されていないアプリは、`ol` のList Filterに登録して利用できます。

## 参考

[franzheidl/alfred-workflowsのopen-with-sublime-text](https://github.com/franzheidl/alfred-workflows/tree/master/open-with-sublime-text)を参考に作成しました。
