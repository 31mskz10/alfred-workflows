#!/usr/bin/osascript -l JavaScript
ObjC.import('AppKit');

const COMMANDS = {
    'all-in-one': 'オールインワン',
    'capture-area': '範囲をキャプチャ',
    'capture-fullscreen': '全画面をキャプチャ',
    'capture-previous-area': '前回の範囲をキャプチャ',
    'capture-text': 'テキストを読み取り',
    'capture-window': 'ウインドウをキャプチャ',
    'hide-desktop-icons': 'デスクトップアイコンを隠す',
    'open-annotate': '注釈ツールを開く',
    'open-from-clipboard': 'クリップボードから開く',
    'open-history': '履歴を開く',
    'open-settings': '設定を開く',
    'pin': '画面にピン留め',
    'record-screen': '画面を録画',
    'restore-recently-closed': '最近閉じたものを復元',
    'scrolling-capture': 'スクロールキャプチャ',
    'self-timer': 'セルフタイマー',
    'show-desktop-icons': 'デスクトップアイコンを表示',
    'toggle-desktop-icons': 'デスクトップアイコンの表示を切り替え'
};
const CAPTURES = ['capture-area', 'capture-previous-area', 'capture-fullscreen', 'capture-window', 'self-timer'];
const ACTIONS = {copy: 'コピー', save: '保存', annotate: '注釈', upload: 'アップロード', pin: 'ピン留め'};
const TERMS = {
    'capture-fullscreen': '画面',
    'hide-desktop-icons': 'アイコン',
    'open-annotate': 'ツール',
    'record-screen': '録画',
    'restore-recently-closed': '最近 閉じた もの 復元',
    'scrolling-capture': 'スクロール キャプチャ',
    'self-timer': 'タイマー',
    'show-desktop-icons': 'アイコン',
    'toggle-desktop-icons': 'アイコン'
};

function japanese() {
    const language = ObjC.unwrap($.NSProcessInfo.processInfo.environment.objectForKey('language')) || 'auto';
    if (language === 'ja' || language === 'en') return language === 'ja';
    return /^ja(?:-|$)/.test(ObjC.deepUnwrap($.NSLocale.preferredLanguages)[0] || 'en');
}

function titleize(value) {
    return value.split('-').map(word => word[0].toUpperCase() + word.slice(1)).join(' ');
}

function words(command) {
    const japanese = COMMANDS[command];
    return [japanese, japanese.replace(/を|の|に|から/g, ' '), TERMS[command] || ''].join(' ');
}

function item(uid, title, url, match) {
    return {uid: uid, title: title, subtitle: url, arg: url, match: match};
}

function run() {
    const ja = japanese();
    if ($.NSWorkspace.sharedWorkspace.URLForApplicationToOpenURL($.NSURL.URLWithString('cleanshot://all-in-one')).isNil()) {
        return JSON.stringify({items: [{title: ja ? 'CleanShot Xが見つかりません' : 'CleanShot X not found',
            subtitle: ja ? 'CleanShot Xをインストールしてください' : 'Install CleanShot X', valid: false}]});
    }
    const items = [];
    Object.keys(COMMANDS).forEach(command => {
        const url = 'cleanshot://' + command;
        const english = titleize(command);
        const title = ja ? COMMANDS[command] : english;
        items.push(item(command, title, url, [command, english, words(command)].join(' ')));
        if (CAPTURES.indexOf(command) < 0) return;
        Object.keys(ACTIONS).forEach(action => {
            items.push(item(command + '-' + action,
                title + ' → ' + (ja ? ACTIONS[action] : titleize(action)), url + '?action=' + action,
                [command, english, words(command), action, ACTIONS[action]].join(' ')));
        });
    });
    return JSON.stringify({items: items});
}
