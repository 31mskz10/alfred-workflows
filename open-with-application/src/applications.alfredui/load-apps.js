#!/usr/bin/osascript -l JavaScript
ObjC.import('Foundation');

function applicationsIn(folder, depth) {
    const manager = $.NSFileManager.defaultManager;
    const names = ObjC.deepUnwrap(manager.contentsOfDirectoryAtPathError(folder, null)) || [];
    let paths = [];
    for (const name of names) {
        if (name.startsWith('.')) continue;
        const path = folder + '/' + name;
        const directory = Ref();
        if (!manager.fileExistsAtPathIsDirectory(path, directory) || !directory[0]) continue;
        if (name.endsWith('.app')) paths.push(path);
        else if (depth > 0) paths = paths.concat(applicationsIn(path, depth - 1));
    }
    return paths;
}

function applicationName(path) {
    const parts = path.split('/');
    const name = parts.pop().slice(0, -4);
    const parent = parts.pop();
    const suffix = parent.slice(name.length);
    return parent.startsWith(name) && /^ 20\d{2}$/.test(suffix) ? parent : name;
}

function historyLimit() {
    const value = ObjC.unwrap($.NSProcessInfo.processInfo.environment.objectForKey('history_limit')) || '50';
    const limit = Number(value);
    return /^\d+$/.test(value) && Number.isSafeInteger(limit) && limit >= 1 && limit <= 1000 ? limit : 50;
}

function japanese() {
    const language = ObjC.unwrap($.NSProcessInfo.processInfo.environment.objectForKey('language')) || 'auto';
    if (language === 'ja' || language === 'en') return language === 'ja';
    return /^ja(?:-|$)/.test(ObjC.deepUnwrap($.NSLocale.preferredLanguages)[0] || 'en');
}

function recentSelections() {
    try {
        const history = JSON.parse(ObjC.unwrap($.NSProcessInfo.processInfo.environment.objectForKey('app_recent')) || '[]');
        return Array.isArray(history) ? history.filter(path => typeof path === 'string' && path.startsWith('/') && path.endsWith('.app')).slice(-historyLimit()) : [];
    } catch (_) {
        return [];
    }
}

function run() {
    const roots = ['/Applications', '/System/Applications', ObjC.unwrap($.NSHomeDirectory()) + '/Applications'];
    const paths = [].concat.apply([], roots.map(folder => applicationsIn(folder, 1)));
    const history = recentSelections();
    const counts = {};
    const latest = {};
    history.forEach((path, index) => {
        counts[path] = (counts[path] || 0) + 1;
        latest[path] = index + 1;
    });
    paths.sort((a, b) => (counts[b] || 0) - (counts[a] || 0) || (latest[b] || 0) - (latest[a] || 0) || applicationName(a).localeCompare(applicationName(b)) || a.localeCompare(b));
    const rows = paths.map(path => ({
        uid: path,
        'appName.text': applicationName(path),
        'appIcon.image': {type: 'fileicon', src: path},
        'appCell.tooltip': path,
        'appPath.text': path
    }));
    const translations = {
    "search": [
        "アプリを検索",
        "Search apps"
    ],
    "help": [
        "操作方法",
        "Keyboard shortcuts"
    ],
    "help_tip": [
        "操作方法（Command＋?）",
        "Keyboard shortcuts (Command+?)"
    ],
    "choose": [
        "アプリを選ぶ",
        "Select an app"
    ],
    "open": [
        "選択したアプリで開く",
        "Open with the selected app"
    ],
    "find": [
        "開くファイル・フォルダを検索",
        "Search for a file or folder to open"
    ],
    "again": [
        "開いた後にアプリを再選択",
        "Open, then select another app"
    ],
    "cursor": [
        "検索文字の先頭・末尾へ移動",
        "Move to the start or end of the query"
    ],
    "close": [
        "画面を閉じる",
        "Close this window"
    ],
    "apps": [
        "アプリ一覧",
        "Applications"
    ],
    "empty": [
        "該当するアプリがありません",
        "No matching applications"
    ]
};
    const languageIndex = japanese() ? 0 : 1;
    const labels = {};
    Object.keys(translations).forEach(key => { labels['l_' + key] = translations[key][languageIndex]; });
    return JSON.stringify({variables: labels, update: {ids: {search: {placeholder: labels.l_search, accessibility: {label: labels.l_search}}, help: {tooltip: labels.l_help_tip, accessibility: {label: labels.l_help}}, apps: {accessibility: {label: labels.l_apps}, placeholder: labels.l_empty, data: {src: rows, filter: {type: 'basic', args: 'appName.text', match: '{value:search.text}'}}}}}});
}
