# Launch Applications

[ダウンロード](https://github.com/31mskz10/alfred-workflows/releases/download/Launch_Applications/Launch.Applications.alfredworkflow) · [一覧へ戻る](../README.md)

あらかじめ登録したアプリのグループを選び、まとめて起動します。

## 必要なもの

- macOS、Alfred Powerpack
- 起動対象として登録するアプリ

## 初期設定

Alfredのワークフローエディタで、グループと起動するアプリを自分の環境に合わせて設定します。

| グループ | 初期状態のアプリ |
| --- | --- |
| Design | Sketch、Abstract |
| Coding | Visual Studio Code、Sourcetree、iTerm |

1. 各グループに接続されたLaunch Apps / Filesオブジェクトで、起動するアプリを登録します。
2. `a` のList Filterで、グループの表示名と説明を変更します。
3. List Filterの `Arg` を変更する場合は、Conditionalの比較値も同じ値に変更します。

グループを追加する場合は、List Filterの項目、Conditionalの分岐、起動アクションを追加して接続してください。

## 使い方

1. Alfredで `a` に続けてスペースを入力します。
2. グループを選び、Enterを押します。初期状態では `a Design` または `a Coding` で絞り込めます。
3. 登録したアプリがまとめて起動します。
