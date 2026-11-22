#!/usr/bin/osascript -l JavaScript
ObjC.import('AppKit');

const TEXT = {
    error: ['エラー', 'Error'],
    noDb: ['OpenInのDBが見つかりません: %s', 'OpenIn database not found: %s'],
    readFailed: ['DBの読み取りに失敗しました: %s', 'Could not read the OpenIn database: %s'],
    writeFailed: ['DBの更新に失敗しました: %s', 'Could not update the OpenIn database: %s'],
    noRules: ['OpenInにルールがありません。先にOpenInでルールを作成してください。', 'OpenIn has no rules. Create rules in OpenIn first.'],
    noPrefixed: ['名前が「%s」で始まるルールがありません。OpenInでルール名の先頭に付けてください。', 'No rule names start with "%s". Add this prefix to rule names in OpenIn.'],
    noMatch: ['一致するルールがありません', 'No matching rules'],
    active: ['▶ 現在有効', '▶ Active'],
    switchTo: ['「%s」に切り替え', 'Switch to "%s"'],
    revertIn: ['%s分後に自動復帰', 'reverts in %s min'],
    noRevert: ['自動復帰なし', 'no auto revert'],
    backNow: ['今すぐ「%s」に戻す', 'Switch back to "%s" now'],
    noApp: ['OpenIn.appが見つかりません。Configure Workflowで「OpenIn.appのパス」を指定してください。', 'OpenIn.app not found. Set "OpenIn.app path" in Configure Workflow.'],
    noRule: ['ルール「%s」がOpenInに見つかりません。', 'Rule "%s" not found in OpenIn.'],
    switched: ['「%s」に切り替えました', 'Switched to "%s"'],
    reverted: ['「%s」に戻しました', 'Switched back to "%s"']
};

const app = Application.currentApplication();
app.includeStandardAdditions = true;

function t(key, value) {
    return TEXT[key][JAPANESE ? 0 : 1].replace('%s', value);
}

function note(text, detail) {
    return JAPANESE ? text + '（' + detail + '）' : text + ' (' + detail + ')';
}

function env(name, fallback) {
    return ObjC.unwrap($.NSProcessInfo.processInfo.environment.objectForKey(name)) || fallback;
}

function exists(path) {
    return $.NSFileManager.defaultManager.fileExistsAtPath(path);
}

function quote(value) {
    return "'" + String(value).replace(/'/g, "'\\''") + "'";
}

function literal(value) {
    return "'" + value.replace(/'/g, "''") + "'";
}

const LANGUAGE = env('language', 'auto');
const JAPANESE = LANGUAGE === 'ja' || (LANGUAGE !== 'en' &&
    /^ja(?:-|$)/.test(ObjC.deepUnwrap($.NSLocale.preferredLanguages)[0] || 'en'));
const DEFAULT_RULE = env('DEFAULT_RULE_NAME', 'Default');
const PREFIX = env('MODE_PREFIX', '[Mode]');
const AUTO_REVERT = /^(true|1|yes)$/i.test(env('AUTO_REVERT', 'true'));
const DB = ObjC.unwrap($(env('OPENIN_DB_PATH',
    '~/Library/Group Containers/4QE86VV38D.app.loshadki.OpenIn/Library/Application Support/OpenIn/local.sqlite'
)).stringByExpandingTildeInPath);
const WORK_DIR = env('alfred_workflow_cache', '/tmp/openin-alfred');
const PID_FILE = WORK_DIR + '/revert.pid';

function sql(query, write) {
    const options = '-cmd ' + quote('.timeout 5000') + (write ? '' : ' -json');
    const output = app.doShellScript('/usr/bin/sqlite3 ' + options + ' ' + quote(DB) + ' ' + quote(query));
    return write || !output ? [] : JSON.parse(output);
}

function openinPath() {
    const custom = ObjC.unwrap($(env('OPENIN_APP_PATH', '')).stringByExpandingTildeInPath);
    return [custom, '/Applications/OpenIn.app', '/Applications/Setapp/OpenIn.app']
        .find(path => path && exists(path));
}

function displayName(rule) {
    return rule.slice(PREFIX.length).replace(/^ /, '');
}

function appIcon(path, bundle, fallback) {
    if (path && exists(path)) return path;
    const url = bundle && $.NSWorkspace.sharedWorkspace.URLForApplicationWithBundleIdentifier(bundle);
    return url && !url.isNil() ? ObjC.unwrap(url.path) : fallback;
}

function message(title, subtitle) {
    return JSON.stringify({items: [{title: title, subtitle: subtitle, valid: false}]});
}

function list(query) {
    const number = (query.match(/\d+/) || [])[0];
    const minutes = number || env('DEFAULT_MINUTES', '10');
    const filter = query.replace(/\d+/g, '').trim().toLowerCase();
    const revert = AUTO_REVERT && Number(minutes) > 0;
    if (!exists(DB)) return message(t('error'), t('noDb', DB));

    let rows;
    try {
        rows = sql(`SELECT r.ZNAME AS name, r.ZDISABLED AS disabled,
            COALESCE((SELECT a.ZPATH FROM Z_6USEDINRULES j JOIN ZOPENINHANDLERAPP a ON a.Z_PK = j.Z_6SELECTEDAPPS
                WHERE j.Z_7USEDINRULES = r.Z_PK ORDER BY a.ZAPPORDER LIMIT 1), '') AS path,
            COALESCE((SELECT a.ZBUNDLEIDENTIFIER FROM Z_6USEDINRULES j JOIN ZOPENINHANDLERAPP a ON a.Z_PK = j.Z_6SELECTEDAPPS
                WHERE j.Z_7USEDINRULES = r.Z_PK ORDER BY a.ZAPPORDER LIMIT 1), '') AS bundle
            FROM ZOPENINHANDLERRULE r WHERE r.ZNAME IS NOT NULL ORDER BY r.ZNAME`);
    } catch (error) {
        return message(t('error'), t('readFailed', error.message));
    }
    if (!rows.length) return message(t('error'), t('noRules'));

    const openin = openinPath();
    const modes = rows.filter(row => row.name.startsWith(PREFIX) && row.name !== DEFAULT_RULE && displayName(row.name));
    if (!modes.length) return message(t('error'), t('noPrefixed', PREFIX));

    const items = modes.filter(row => displayName(row.name).toLowerCase().includes(filter)).map(row => {
        const name = displayName(row.name);
        const detail = revert ? t('revertIn', minutes) : t('noRevert');
        const icon = appIcon(row.path, row.bundle, openin);
        return Object.assign({
            uid: name,
            title: name,
            subtitle: note(row.disabled === 0 ? t('active') : t('switchTo', name), detail),
            arg: row.name + '|' + (revert ? minutes : 0)
        }, icon ? {icon: {type: 'fileicon', path: icon}} : {});
    });
    if (DEFAULT_RULE.toLowerCase().includes(filter)) {
        const active = rows.some(row => row.name === DEFAULT_RULE && row.disabled === 0);
        items.push(Object.assign({
            uid: '__default__',
            title: DEFAULT_RULE,
            subtitle: active ? t('active') : t('backNow', DEFAULT_RULE),
            arg: '__DEFAULT__|0'
        }, openin ? {icon: {type: 'fileicon', path: openin}} : {}));
    }
    return items.length ? JSON.stringify({items: items}) : message(t('noMatch'), query);
}

function quitOpenin(path) {
    const running = $.NSRunningApplication.runningApplicationsWithBundleIdentifier(
        $.NSBundle.bundleWithPath(path).bundleIdentifier);
    const apps = [];
    for (let i = 0; i < running.count; i++) apps.push(running.objectAtIndex(i));
    apps.forEach(item => item.terminate);
    for (let i = 0; i < 50 && apps.some(item => !item.isTerminated); i++) delay(0.1);
}

function enable(rule) {
    sql('BEGIN; UPDATE ZOPENINHANDLERRULE SET ZDISABLED = 1; ' +
        'UPDATE ZOPENINHANDLERRULE SET ZDISABLED = 0 WHERE ZNAME = ' + literal(rule) + '; COMMIT;', true);
}

function cancelRevert() {
    app.doShellScript('pid=$(cat ' + quote(PID_FILE) + ' 2>/dev/null); ' +
        'case "$pid" in ""|*[!0-9]*) ;; *) kill -TERM -- "-$pid" 2>/dev/null;; esac; rm -f ' + quote(PID_FILE));
}

function scheduleRevert(minutes) {
    const self = ObjC.unwrap($.NSFileManager.defaultManager.currentDirectoryPath) + '/openin.js';
    const job = 'sleep ' + minutes * 60 + '; exec ' + quote(self) + ' revert';
    app.doShellScript('mkdir -p ' + quote(WORK_DIR) + '; ' +
        '/usr/bin/perl -MPOSIX -e ' + quote('POSIX::setsid(); exec @ARGV') + ' /bin/sh -c ' + quote(job) +
        ' >>' + quote(WORK_DIR + '/revert.log') + ' 2>&1 </dev/null & echo $! > ' + quote(PID_FILE));
}

function switchRule(input) {
    const index = input.lastIndexOf('|');
    const rule = input.slice(0, index);
    const minutes = parseInt(input.slice(index + 1), 10) || 0;
    const path = openinPath();
    if (!path) return t('noApp');
    if (!exists(DB)) return t('noDb', DB);
    try {
        if (rule !== '__DEFAULT__' && !sql('SELECT 1 FROM ZOPENINHANDLERRULE WHERE ZNAME = ' + literal(rule)).length) {
            return t('noRule', rule);
        }
    } catch (error) {
        return t('readFailed', error.message);
    }
    cancelRevert();
    quitOpenin(path);
    try {
        enable(rule === '__DEFAULT__' ? DEFAULT_RULE : rule);
    } catch (error) {
        return t('writeFailed', error.message);
    } finally {
        app.doShellScript('open ' + quote(path));
    }
    if (rule === '__DEFAULT__') return t('reverted', DEFAULT_RULE);
    const name = displayName(rule);
    if (!AUTO_REVERT || minutes <= 0) return note(t('switched', name), t('noRevert'));
    scheduleRevert(minutes);
    return note(t('switched', name), t('revertIn', minutes));
}

function revert() {
    const path = openinPath();
    if (!path) return t('noApp');
    try {
        quitOpenin(path);
        enable(DEFAULT_RULE);
    } finally {
        app.doShellScript('open ' + quote(path) + '; rm -f ' + quote(PID_FILE));
    }
    app.displayNotification(t('reverted', DEFAULT_RULE), {withTitle: 'OpenIn Temporary Switch'});
    return t('reverted', DEFAULT_RULE);
}

function run(argv) {
    if (argv[0] === 'list') return list(argv[1] || '');
    if (argv[0] === 'switch') return switchRule(argv[1] || '');
    if (argv[0] === 'revert') return revert();
    return '';
}
