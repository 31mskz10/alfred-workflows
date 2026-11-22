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
    noDefault: ['復帰先のルール「%s」がありません。Modeのルールがある各ハンドラに作成するか、Configure Workflowで名前を合わせてください。', 'Default rule "%s" not found. Create it for every handler that has mode rules, or fix the name in Configure Workflow.'],
    badMinutes: ['分数は0〜10080の整数で指定してください: %s', 'Minutes must be a whole number from 0 to 10080: %s'],
    quitFailed: ['OpenInを終了できなかったため、切り替えを中止しました。OpenInのダイアログを閉じてから再実行してください。', 'OpenIn did not quit, so nothing was changed. Close any OpenIn dialogs and try again.'],
    revertQuitFailed: ['OpenInを終了できなかったため、自動復帰を中止しました。手動で「%s」に戻してください。', 'OpenIn did not quit, so the auto revert was skipped. Switch back to "%s" manually.'],
    openFailed: ['OpenInを起動できませんでした: %s', 'Could not launch OpenIn: %s'],
    scheduleFailed: ['自動復帰を予約できませんでした: %s', 'could not schedule the revert: %s'],
    jobFailed: ['自動復帰を実行できませんでした。ワークフローを入れ直した場合は、もう一度切り替えてください。', 'Could not run the automatic revert. If you reinstalled the workflow, switch again.'],
    switched: ['「%s」に切り替えました', 'Switched to "%s"'],
    reverted: ['「%s」に戻しました', 'Switched back to "%s"']
};

const app = Application.currentApplication();
app.includeStandardAdditions = true;

function t(key, value) {
    return TEXT[key][JAPANESE ? 0 : 1].replace('%s', () => value);
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
const MAX_MINUTES = 10080;
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

function openinPaths() {
    const custom = ObjC.unwrap($(env('OPENIN_APP_PATH', '')).stringByExpandingTildeInPath);
    return [custom, '/Applications/OpenIn.app', '/Applications/Setapp/OpenIn.app']
        .filter(path => path && exists(path) && bundleId(path).startsWith('app.loshadki.'));
}

function openinPath() {
    return openinPaths()[0];
}

function bundleId(path) {
    const bundle = $.NSBundle.bundleWithPath(path);
    return bundle.isNil() || bundle.bundleIdentifier.isNil() ? '' : ObjC.unwrap(bundle.bundleIdentifier);
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

function scoped(rows) {
    const handlers = rows.filter(row => row.name.startsWith(PREFIX)).map(row => row.handler);
    return rows.filter(row => handlers.indexOf(row.handler) >= 0);
}

function missingDefault(rows) {
    const scope = scoped(rows);
    return scope.some(row => !scope.some(other => other.handler === row.handler && other.name === DEFAULT_RULE));
}

function fold(value) {
    return value.normalize('NFKC').toLowerCase();
}

function validMinutes(value) {
    return /^\d+$/.test(value) && Number(value) <= MAX_MINUTES;
}

function parseQuery(query) {
    const words = query.normalize('NFKC').trim().split(/\s+/).filter(Boolean);
    const numeric = /^[-+]?(\d+\.?\d*|\.\d+)$/;
    let number = '';
    if (words.length && numeric.test(words[0])) number = words.shift();
    else if (words.length && numeric.test(words[words.length - 1])) number = words.pop();
    return {number: number, filter: fold(words.join(' '))};
}

function list(query) {
    const parsed = parseQuery(query);
    const minutes = parsed.number || env('DEFAULT_MINUTES', '10').normalize('NFKC').trim();
    const filter = parsed.filter;
    if (!validMinutes(minutes)) return message(t('error'), t('badMinutes', minutes));
    const revert = AUTO_REVERT && Number(minutes) > 0;
    if (!exists(DB)) return message(t('error'), t('noDb', DB));

    let rows;
    try {
        rows = sql(`SELECT r.ZNAME AS name, r.ZDISABLED AS disabled, r.ZHANDLER AS handler,
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
    const modes = rows.filter((row, index) => row.name.startsWith(PREFIX) && row.name !== DEFAULT_RULE &&
        displayName(row.name) && rows.findIndex(other => other.name === row.name) === index);
    if (!modes.length) return message(t('error'), t('noPrefixed', PREFIX));
    if (missingDefault(rows)) return message(t('error'), t('noDefault', DEFAULT_RULE));

    const items = modes.filter(row => fold(displayName(row.name)).includes(filter)).map(row => {
        const name = displayName(row.name);
        const detail = revert ? t('revertIn', Number(minutes)) : t('noRevert');
        const icon = appIcon(row.path, row.bundle, openin);
        const active = rows.every(other => other.name !== row.name || other.disabled === 0);
        return Object.assign({
            uid: row.name,
            title: name,
            subtitle: note(active ? t('active') : t('switchTo', name), detail),
            arg: row.name + '|' + (revert ? Number(minutes) : 0)
        }, icon ? {icon: {type: 'fileicon', path: icon}} : {});
    });
    if (fold(DEFAULT_RULE).includes(filter)) {
        const active = scoped(rows).every(row => row.name !== DEFAULT_RULE || row.disabled === 0);
        items.push(Object.assign({
            uid: '__default__',
            title: DEFAULT_RULE,
            subtitle: active ? t('active') : t('backNow', DEFAULT_RULE),
            arg: '__DEFAULT__|0'
        }, openin ? {icon: {type: 'fileicon', path: openin}} : {}));
    }
    return items.length ? JSON.stringify({items: items}) : message(t('noMatch'), query);
}

function waitForExit(pids) {
    if (!pids.length) return true;
    try {
        app.doShellScript('for i in $(seq 50); do alive=0; for p in ' + pids.join(' ') + '; do ' +
            'kill -0 "$p" 2>/dev/null && alive=1; done; [ "$alive" = 0 ] && exit 0; sleep 0.1; done; exit 1');
        return true;
    } catch (error) {
        return false;
    }
}

function quitOpenin() {
    const pids = [];
    let launched = '';
    openinPaths().map(bundleId).filter((id, index, ids) => ids.indexOf(id) === index).forEach(id => {
        const running = $.NSRunningApplication.runningApplicationsWithBundleIdentifier(id);
        for (let i = 0; i < Number(running.count); i++) {
            const item = running.objectAtIndex(i);
            if (!launched && !item.bundleURL.isNil()) launched = ObjC.unwrap(item.bundleURL.path);
            pids.push(Number(item.processIdentifier));
            item.terminate;
        }
    });
    return waitForExit(pids) ? {path: launched || openinPath()} : null;
}

function scopeCondition() {
    return 'ZHANDLER IN (SELECT ZHANDLER FROM ZOPENINHANDLERRULE WHERE substr(ZNAME, 1, length(' + literal(PREFIX) +
        ')) = ' + literal(PREFIX) + ')';
}

function enable(rule) {
    const target = 'CASE WHEN EXISTS (SELECT 1 FROM ZOPENINHANDLERRULE o WHERE o.ZHANDLER = ' +
        'ZOPENINHANDLERRULE.ZHANDLER AND o.ZNAME = ' + literal(rule) + ') THEN ' + literal(rule) +
        ' ELSE ' + literal(DEFAULT_RULE) + ' END';
    const disabled = 'CASE WHEN ZNAME = (' + target + ') THEN 0 ELSE 1 END';
    sql('UPDATE ZOPENINHANDLERRULE SET Z_OPT = Z_OPT + 1, ZDISABLED = ' + disabled +
        ' WHERE ZNAME IS NOT NULL AND ' + scopeCondition() + ' AND ZDISABLED IS NOT (' + disabled + ');', true);
}

function scopedRows() {
    return sql('SELECT ZNAME AS name, ZHANDLER AS handler FROM ZOPENINHANDLERRULE WHERE ZNAME IS NOT NULL AND ' +
        scopeCondition());
}

function signalRevert(signals) {
    app.doShellScript('pid=$(cat ' + quote(PID_FILE) + ' 2>/dev/null); ' +
        'case "$pid" in ""|*[!0-9]*) ;; *) if [ "$pid" -gt 1 ] && ps -o command= -p "$pid" | grep -q "openin\\.js"; ' +
        'then for s in ' + signals + '; do kill -"$s" -- "-$pid" 2>/dev/null; done; fi;; esac; true');
}

function cancelRevert() {
    signalRevert('TERM CONT');
    app.doShellScript('rm -f ' + quote(PID_FILE));
}

function relaunch(path) {
    try {
        app.doShellScript('open -g ' + quote(path));
        return '';
    } catch (error) {
        return ' ' + t('openFailed', error.message);
    }
}

function scheduleRevert(minutes) {
    const self = ObjC.unwrap($.NSFileManager.defaultManager.currentDirectoryPath) + '/openin.js';
    const end = Math.floor(Date.now() / 1000) + minutes * 60;
    const job = 'while :; do r=$((' + end + ' - $(date +%s))); [ "$r" -le 0 ] && break; ' +
        '[ "$r" -gt 30 ] && r=30; sleep "$r"; done; ' + quote(self) + ' revert || { rm -f ' + quote(PID_FILE) +
        '; /usr/bin/osascript -e ' + quote('display notification ' + JSON.stringify(t('jobFailed')) +
        ' with title "OpenIn Temporary Switch"') + '; }';
    app.doShellScript('mkdir -p ' + quote(WORK_DIR) + '; ' +
        '/usr/bin/perl -MPOSIX -e ' + quote('POSIX::setsid(); exec @ARGV') + ' /bin/sh -c ' + quote(job) +
        ' >' + quote(WORK_DIR + '/revert.log') + ' 2>&1 </dev/null & pid=$!; echo "$pid" > ' + quote(PID_FILE) +
        '; sleep 0.2; kill -0 "$pid" || { rm -f ' + quote(PID_FILE) + '; echo "revert job exited" >&2; exit 1; }');
}

function switchRule(input) {
    const index = input.lastIndexOf('|');
    const rule = input.slice(0, index);
    const minutes = Math.min(parseInt(input.slice(index + 1), 10) || 0, MAX_MINUTES);
    if (!openinPath()) return t('noApp');
    if (!exists(DB)) return t('noDb', DB);
    const target = rule === '__DEFAULT__' ? DEFAULT_RULE : rule;
    try {
        const rows = scopedRows();
        if (!rows.some(row => row.name === target)) return t('noRule', target);
        if (missingDefault(rows)) return t('noDefault', DEFAULT_RULE);
    } catch (error) {
        return t('readFailed', error.message);
    }
    signalRevert('STOP');
    const quit = quitOpenin();
    if (!quit) {
        signalRevert('CONT');
        return t('quitFailed');
    }
    try {
        enable(target);
    } catch (error) {
        signalRevert('CONT');
        return t('writeFailed', error.message) + relaunch(quit.path);
    }
    cancelRevert();
    const launched = relaunch(quit.path);
    if (rule === '__DEFAULT__') return t('reverted', DEFAULT_RULE) + launched;
    const name = displayName(rule);
    if (!AUTO_REVERT || minutes <= 0) return note(t('switched', name), t('noRevert')) + launched;
    try {
        scheduleRevert(minutes);
    } catch (error) {
        return note(t('switched', name), t('scheduleFailed', error.message)) + launched;
    }
    return note(t('switched', name), t('revertIn', minutes)) + launched;
}

function revertNow() {
    if (!openinPath()) return t('noApp');
    if (!exists(DB)) return t('noDb', DB);
    try {
        const rows = scopedRows();
        if (!rows.some(row => row.name === DEFAULT_RULE) || missingDefault(rows)) return t('noDefault', DEFAULT_RULE);
    } catch (error) {
        return t('readFailed', error.message);
    }
    const quit = quitOpenin();
    if (!quit) return t('revertQuitFailed', DEFAULT_RULE);
    try {
        enable(DEFAULT_RULE);
    } catch (error) {
        return t('writeFailed', error.message) + relaunch(quit.path);
    }
    return t('reverted', DEFAULT_RULE) + relaunch(quit.path);
}

function revert() {
    let result;
    try {
        result = revertNow();
    } catch (error) {
        result = t('writeFailed', error.message);
    }
    app.doShellScript('rm -f ' + quote(PID_FILE));
    app.displayNotification(result, {withTitle: 'OpenIn Temporary Switch'});
    return result;
}

function run(argv) {
    if (argv[0] === 'list') return list(argv[1] || '');
    if (argv[0] === 'switch') return switchRule(argv[1] || '');
    if (argv[0] === 'revert') return revert();
    return '';
}
