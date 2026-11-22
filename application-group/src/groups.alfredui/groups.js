#!/usr/bin/osascript -l JavaScript
ObjC.import('Foundation');

const TEXT = {
    search: ['グループを検索', 'Search groups'],
    empty: ['⌘N でグループを作成します', 'Press ⌘N to create a group'],
    groups: ['グループ一覧', 'Groups'],
    new: ['新規', 'New'],
    apps: ['アプリを変更', 'Change Apps'],
    rename: ['名前を変更', 'Rename'],
    delete: ['削除', 'Delete'],
    name: ['グループ名', 'Group name'],
    create: ['アプリを選んで作成', 'Choose Apps and Create'],
    pick: ['起動するアプリを選択します（⌘クリックで複数選択）', 'Choose apps to launch (⌘-click to select several)'],
    save: ['保存', 'Save'],
    cancel: ['キャンセル', 'Cancel'],
    confirm: ['このグループを削除しますか？', 'Delete this group?'],
    missing: ['見つからないアプリ: ', 'Not found: '],
    untitled: ['新しいグループ', 'New Group']
};

function env(name) {
    return ObjC.unwrap($.NSProcessInfo.processInfo.environment.objectForKey(name));
}

function japanese() {
    const language = env('language') || 'auto';
    if (language === 'ja' || language === 'en') return language === 'ja';
    return /^ja(?:-|$)/.test(ObjC.deepUnwrap($.NSLocale.preferredLanguages)[0] || 'en');
}

function loadGroups() {
    try {
        const groups = JSON.parse(env('groups') || '[]');
        return Array.isArray(groups) ? groups.filter(group => group && typeof group.id === 'string' &&
            typeof group.name === 'string' && Array.isArray(group.apps)) : [];
    } catch (_) {
        return [];
    }
}

function appName(path) {
    return path.split('/').pop().replace(/\.app$/, '');
}

function appPaths(args) {
    const paths = [].concat.apply([], args.map(arg => {
        try {
            const parsed = JSON.parse(arg);
            return Array.isArray(parsed) ? parsed : [arg];
        } catch (_) {
            return [arg];
        }
    }));
    return paths.filter(path => typeof path === 'string').map(path => path.replace(/\/$/, ''))
        .filter(path => path.startsWith('/') && path.endsWith('.app'));
}

function quote(value) {
    return "'" + value.replace(/'/g, "'\\''") + "'";
}

function rows(groups) {
    return groups.map(group => ({
        uid: group.id,
        'groupId.text': group.id,
        'groupName.text': group.name,
        'groupApps.text': group.apps.map(appName).join(', '),
        'groupIcon.image': group.apps.length
            ? {type: 'fileicon', src: group.apps[0]}
            : {type: 'symbol', src: 'square.stack'}
    }));
}

function groupsUpdate(groups) {
    return {data: {src: rows(groups), filter: {type: 'basic', args: 'groupName.text', match: '{value:search.text}'}}};
}

function save(groups, extra) {
    return JSON.stringify(Object.assign({
        variables: {groups: JSON.stringify(groups)},
        update: {ids: {groups: groupsUpdate(groups), status: {text: ''}}}
    }, extra));
}

function run(argv) {
    const command = argv[0] || '';
    const args = argv.slice(1);
    const t = key => TEXT[key][japanese() ? 0 : 1];
    const groups = loadGroups();
    const group = groups.find(item => item.id === args[0]);

    if (command === 'load') {
        const labels = {};
        Object.keys(TEXT).forEach(key => { labels['l_' + key] = t(key); });
        const update = {
            search: {placeholder: t('search'), accessibility: {label: t('search')}},
            groups: Object.assign({placeholder: t('empty'), accessibility: {label: t('groups')}}, groupsUpdate(groups))
        };
        ['new', 'apps', 'rename', 'delete'].forEach(key => { update[key + 'Button'] = {text: t(key)}; });
        return JSON.stringify({variables: labels, update: {ids: update}});
    }

    if (command === 'create') {
        const apps = appPaths(args.slice(1));
        if (!apps.length) return '{}';
        groups.push({id: ObjC.unwrap($.NSUUID.UUID.UUIDString), name: args[0].trim() || t('untitled'), apps: apps});
        return save(groups, {sheet: {close: 'edit'}});
    }

    if (command === 'apps') {
        const apps = appPaths(args.slice(1));
        if (!group || !apps.length) return '{}';
        group.apps = apps;
        return save(groups);
    }

    if (command === 'rename') {
        const name = (args[1] || '').trim();
        if (!group || !name) return '{}';
        group.name = name;
        return save(groups, {sheet: {close: 'edit'}});
    }

    if (command === 'delete') {
        if (!group) return JSON.stringify({sheet: {close: 'edit'}});
        return save(groups.filter(item => item !== group), {sheet: {close: 'edit'}});
    }

    if (command === 'launch') {
        if (!group) return '{}';
        const manager = $.NSFileManager.defaultManager;
        const found = group.apps.filter(path => manager.fileExistsAtPath(path));
        const missing = group.apps.filter(path => found.indexOf(path) < 0);
        if (found.length) {
            const app = Application.currentApplication();
            app.includeStandardAdditions = true;
            app.doShellScript('open ' + found.map(quote).join(' '));
        }
        if (missing.length) {
            return JSON.stringify({update: {ids: {status: {text: t('missing') + missing.map(appName).join(', ')}}}});
        }
        return JSON.stringify({finish: {}});
    }

    return '{}';
}
