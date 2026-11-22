#!/usr/bin/osascript -l JavaScript
ObjC.import('Foundation');

function env(name) {
    return ObjC.unwrap($.NSProcessInfo.processInfo.environment.objectForKey(name)) || '';
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

function run(args) {
    const path = args[0] || '';
    const mode = args[1] || 'open';
    if (!path || path.startsWith('{')) {
        return JSON.stringify({update: {ids: {status: {text: japanese() ? '該当するアプリがありません。' : 'No matching applications.'}}}});
    }
    const directory = Ref();
    if (!path.startsWith('/') || !path.endsWith('.app') ||
        !$.NSFileManager.defaultManager.fileExistsAtPathIsDirectory(path, directory) || !directory[0]) {
        return JSON.stringify({update: {ids: {status: {text: japanese() ? 'アプリが見つかりません。画面を開き直してください。' : 'Application not found. Reopen this window.'}}}});
    }
    if (['open', 'search', 'again'].indexOf(mode) < 0) return '{}';
    const history = recentSelections().concat(path).slice(-historyLimit());
    const name = applicationName(path);
    const ja = japanese();
    return JSON.stringify({variables: {app_recent: JSON.stringify(history)}, finish: {args: path, variables: {
        owa_action: mode,
        owa_targets: env('owa_targets'),
        owa_title: ja ? name + 'で開く' : 'Open with ' + name,
        owa_subtitle: ja ? '開くファイル・フォルダを検索して' + name + 'で開きます' : 'Find files and folders and open with ' + name
    }}});
}
