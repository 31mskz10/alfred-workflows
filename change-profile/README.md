# Change Profile

[ダウンロード](https://github.com/31mskz10/alfred-workflows/releases/download/Change_Profile/Change.Profile.alfredworkflow) · [一覧へ戻る](../README.md)

Karabiner-ElementsのプロファイルをAlfredから切り替えます。

## 必要なもの

- macOS、Alfred Powerpack
- Karabiner-Elementsと切り替え先のプロファイル
- AlfredのTerminal設定で指定したターミナルアプリ

## 初期設定

初期状態では `JIS` と `US` の2つのプロファイルを切り替えます。別の名前を使う場合は、Alfredのワークフローエディタで次の項目を変更してください。

1. `ke` のList Filterで、表示名と説明を自分のプロファイルに合わせます。
2. 各Terminal Commandの `--select-profile` に渡す名前を、Karabiner-Elementsのプロファイル名と完全に一致させます。
3. List Filterの `Arg` を変更する場合は、接続先のConditionalの比較値も同じ値に変更します。
4. 末尾のアプリ操作には `/Applications/iTerm.app` が登録されています。使用するターミナルアプリに合わせて変更するか、不要ならこのオブジェクトを外します。

コマンドは `/Library/Application Support/org.pqrs/Karabiner-Elements/bin/karabiner_cli` を使用します。この場所にCLIがあることを確認してください。

## 使い方

1. Alfredで `ke` に続けてスペースを入力します。
2. プロファイルを選び、Enterを押します。初期状態では `ke JIS` または `ke US` で絞り込めます。

一覧にないプロファイル名を入力するだけでは切り替えられません。追加する場合はList Filter、Conditional、Terminal Commandを対応させてください。
