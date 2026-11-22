#!/usr/bin/osascript -l JavaScript
ObjC.import('Foundation');

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
    if (!path) return '{}';
    const directory = Ref();
    if (!path.startsWith('/') || !path.endsWith('.app') ||
        !$.NSFileManager.defaultManager.fileExistsAtPathIsDirectory(path, directory) || !directory[0]) {
        return JSON.stringify({update: {ids: {status: {text: japanese() ? 'アプリが見つかりません。画面を開き直してください。' : 'Application not found. Reopen this window.'}}}});
    }
    if (['open', 'search', 'again'].indexOf(mode) < 0) return '{}';
    const history = recentSelections().concat(path).slice(-historyLimit());
    return JSON.stringify({variables: {app_recent: JSON.stringify(history)}, finish: {args: path, variables: {owa_action: mode}}});
}
