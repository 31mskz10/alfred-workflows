#!/usr/bin/osascript -l JavaScript
ObjC.import('AppKit');

const TEXT = {
    search: ['グループを検索', 'Search groups'],
    empty: ['＋ボタンまたは ⌘N でグループを作成します', 'Click + or press ⌘N to create a group'],
    groups: ['グループ一覧', 'Groups'],
    add: ['新規グループ (⌘N)', 'New Group (⌘N)'],
    remove: ['グループを削除 (⌘⌫)', 'Delete Group (⌘⌫)'],
    edit: ['編集…', 'Edit…'],
    editTip: ['名前とアプリを編集 (⌘E)', 'Edit name and apps (⌘E)'],
    record: ['起動時のウインドウ位置を記録', 'Save Window Positions'],
    recordTip: ['いま開いているウインドウの位置とサイズを記録 (⌘L)', 'Save the position and size of open windows (⌘L)'],
    launch: ['起動', 'Launch'],
    launchTip: ['ウインドウ位置を再現して起動 (↩)。⇧↩ で位置を再現せずに起動', 'Launch and restore window positions (↩). ⇧↩ launches without restoring'],
    name: ['名前:', 'Name:'],
    apps: ['アプリ:', 'Apps:'],
    appSearch: ['アプリを検索', 'Search apps'],
    other: ['その他…', 'Other…'],
    pick: ['追加するアプリを選択してください', 'Choose apps to add'],
    selected: ['%s個選択中。↩ またはダブルクリックで選択を切り替えます。', '%s selected. Press Return or double-click to toggle.'],
    save: ['保存', 'Save'],
    cancel: ['キャンセル', 'Cancel'],
    delete: ['削除', 'Delete'],
    confirm: ['「%s」を削除しますか？', 'Delete “%s”?'],
    irreversible: ['この操作は取り消せません。', 'This action cannot be undone.'],
    noApps: ['アプリを1つ以上選択してください。', 'Select at least one app.'],
    missing: ['見つからないアプリ: %s', 'Not found: %s'],
    untitled: ['新しいグループ', 'New Group'],
    recorded: ['%s個のウインドウの配置を記録しました。', 'Saved the layout of %s windows.'],
    noWindows: ['記録できるウインドウがありません。アプリを起動して並べてから記録してください。', 'No windows to save. Launch and arrange the apps first.'],
    permission: ['アクセシビリティの許可が必要です。システム設定 > プライバシーとセキュリティ > アクセシビリティ で Alfred を許可してください。',
        'Accessibility access is required. Allow Alfred in System Settings > Privacy & Security > Accessibility.']
};

function env(name) {
    return ObjC.unwrap($.NSProcessInfo.processInfo.environment.objectForKey(name));
}

const LANGUAGE = env('language') || 'auto';
const JAPANESE = LANGUAGE === 'ja' || (LANGUAGE !== 'en' &&
    /^ja(?:-|$)/.test(ObjC.deepUnwrap($.NSLocale.preferredLanguages)[0] || 'en'));

function t(key, value) {
    return TEXT[key][JAPANESE ? 0 : 1].replace('%s', value);
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

function list(name) {
    try {
        const value = JSON.parse(env(name) || '[]');
        return Array.isArray(value) ? value.filter(item => typeof item === 'string') : [];
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

function unique(items) {
    return items.filter((item, index) => items.indexOf(item) === index);
}

function quote(value) {
    return "'" + value.replace(/'/g, "'\\''") + "'";
}

function installedApps(folder, depth) {
    const manager = $.NSFileManager.defaultManager;
    const names = ObjC.deepUnwrap(manager.contentsOfDirectoryAtPathError(folder, null)) || [];
    let paths = [];
    names.forEach(name => {
        if (name.startsWith('.')) return;
        const path = folder + '/' + name;
        const directory = Ref();
        if (!manager.fileExistsAtPathIsDirectory(path, directory) || !directory[0]) return;
        if (name.endsWith('.app')) paths.push(path);
        else if (depth > 0) paths = paths.concat(installedApps(path, depth - 1));
    });
    return paths;
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

function save(groups, extra, message) {
    return JSON.stringify(Object.assign({
        variables: {groups: JSON.stringify(groups)},
        update: {ids: {groups: groupsUpdate(groups), status: {text: message || ''}}}
    }, extra));
}

function status(message) {
    return JSON.stringify({update: {ids: {status: {text: message}}}});
}

function pickerUpdate(draft, pinned, query) {
    const needle = (query || '').trim().toLowerCase();
    const home = ObjC.unwrap($.NSHomeDirectory());
    const installed = ['/Applications', '/System/Applications', home + '/Applications']
        .reduce((paths, folder) => paths.concat(installedApps(folder, 1)), [])
        .sort((a, b) => appName(a).localeCompare(appName(b)));
    return {data: {
        src: unique(pinned.concat(draft, installed)).filter(path => appName(path).toLowerCase().includes(needle)).map(path => ({
            uid: path,
            'appPath.text': path,
            'appName.text': appName(path),
            'appIcon.image': {type: 'fileicon', src: path},
            'appCheck.image': {type: 'symbol', src: draft.indexOf(path) < 0 ? 'circle' : 'checkmark.circle.fill'}
        }))
    }};
}

function draftResponse(draft, pinned, query) {
    return JSON.stringify({
        variables: {draft: JSON.stringify(draft), pinned: JSON.stringify(pinned)},
        update: {ids: {
            picker: pickerUpdate(draft, pinned, query),
            selectedCount: {text: t('selected', draft.length), colour: 'secondaryLabelColor'}
        }}
    });
}

function label(text, extra) {
    return Object.assign({type: 'label', text: text, font: {size: 13}}, extra || {});
}

function button(id, text, action, extra) {
    return Object.assign({type: 'button', id: id, text: text, events: [{triggers: 'actioned', action: action}]}, extra || {});
}

function script() {
    return {type: 'script', src: 'groups.js', args: [].slice.call(arguments)};
}

function closeSheet() {
    return {type: 'json', src: {sheet: {close: 'edit'}}};
}

function cell(height, root, ids) {
    const init = {}, selected = {};
    init[ids[0] + '.background'] = null;
    selected[ids[0] + '.background'] = 'alfredSelectedResultBackgroundColor';
    ids.slice(1).forEach(id => {
        init[id + '.colour'] = 'labelColor';
        selected[id + '.colour'] = 'alfredSelectedResultTextColor';
    });
    return {height: height, init: init, selected: selected, root: root};
}

function editSheet(group) {
    const draft = group ? group.apps.slice() : [];
    const toggle = script('toggle', '{value:picker.selected.appPath.text}', '{value:pickerSearch.text}');
    return {
        variables: {draft: JSON.stringify(draft), pinned: JSON.stringify(draft), edit_id: group ? group.id : ''},
        sheet: {id: 'edit', closeonescape: true, root: {
            type: 'view', layout: 'inline', direction: 'vertical', padding: 20, spacing: 12,
            constraints: {size: {width: 480}},
            shortcuts: [
                {shortcut: '↑', action: {type: 'function', src: 'picker', args: 'selectup'}},
                {shortcut: '↓', action: {type: 'function', src: 'picker', args: 'selectdown'}}
            ],
            components: [
                {type: 'view', layout: 'form', spacing: 8, components: [
                    label(t('name')),
                    {type: 'textfield', id: 'editName', text: group ? group.name : '', placeholder: t('untitled'),
                        accessibility: {label: t('name')}},
                    label(t('apps')),
                    {type: 'textfield', id: 'pickerSearch', focus: true, placeholder: t('appSearch'),
                        accessibility: {label: t('appSearch')},
                        events: [
                            {triggers: 'typingstopped', action: script('filter', '{value:pickerSearch.text}')},
                            {triggers: 'actioned', action: toggle}
                        ]}
                ]},
                Object.assign({
                    type: 'dataview', id: 'picker', cols: 1, spacing: 2, padding: 4,
                    constraints: {size: {height: 300}}, accessibility: {label: t('apps')},
                    events: [{triggers: 'doubleclicked', action: toggle}],
                    cell: cell(32, {type: 'view', id: 'appCell', layout: 'border', spacing: 8, padding: 6,
                        cornerradius: 6, components: [
                            {type: 'label', id: 'appPath', hidden: true},
                            {type: 'imageview', id: 'appCheck', constraints: {region: 'left', size: 16}},
                            {type: 'view', layout: 'border', spacing: 8, constraints: {region: 'centre'}, components: [
                                {type: 'imageview', id: 'appIcon', constraints: {region: 'left', size: 20}},
                                label('', {id: 'appName', linebreak: 'truncatetail', constraints: {region: 'centre'}})
                            ]}
                        ]}, ['appCell', 'appName'])
                }, pickerUpdate(draft, draft)),
                label(t('selected', draft.length), {id: 'selectedCount', font: {size: 12}, colour: 'secondaryLabelColor'}),
                {type: 'view', layout: 'border', components: [
                    button('otherButton', t('other'), {type: 'json', src: {opendialog: {
                        canchoosefiles: true, canchoosefolders: false, multiselect: true,
                        filetypes: ['com.apple.application-bundle'], folder: '/Applications',
                        message: t('pick'), setvariable: 'picked',
                        action: Object.assign(script('add', '{value:pickerSearch.text}', '{var:picked}'),
                            {flattenarrayargs: true})
                    }}}, {constraints: {region: 'left'}}),
                    {type: 'view', layout: 'inline', direction: 'horizontal', spacing: 8,
                        constraints: {region: 'right'}, components: [
                            button('cancelButton', t('cancel'), closeSheet()),
                            button('saveButton', t('save'), script('save', '{var:edit_id}', '{value:editName.text}'),
                                {shortcut: '⌘S'})
                        ]}
                ]}
            ]
        }}
    };
}

function deleteSheet(group) {
    return {sheet: {id: 'edit', closeonescape: true, root: {
        type: 'view', layout: 'inline', direction: 'vertical', padding: 20, spacing: 8,
        constraints: {size: {width: 340}},
        components: [
            label(t('confirm', group.name), {font: {size: 13, weight: 'bold'}, linebreak: 'wordwrap'}),
            label(t('irreversible'), {font: {size: 11}, colour: 'secondaryLabelColor'}),
            {type: 'view', layout: 'border', components: [
                {type: 'view', layout: 'inline', direction: 'horizontal', spacing: 8,
                    constraints: {region: 'right'}, components: [
                        button('cancelButton', t('cancel'), closeSheet()),
                        button('confirmDeleteButton', t('delete'), script('delete', group.id))
                    ]}
            ]}
        ]
    }}};
}

function displays() {
    const screens = $.NSScreen.screens;
    const primary = screens.objectAtIndex(0).frame;
    const result = [];
    for (let i = 0; i < screens.count; i++) {
        const screen = screens.objectAtIndex(i);
        const frame = screen.frame;
        result.push({
            name: ObjC.unwrap(screen.localizedName) || '',
            x: frame.origin.x,
            y: primary.size.height - frame.origin.y - frame.size.height,
            w: frame.size.width,
            h: frame.size.height
        });
    }
    return result;
}

function nearest(screens, x, y) {
    return screens.slice().sort((a, b) => Math.hypot(a.x - x, a.y - y) - Math.hypot(b.x - x, b.y - y))[0];
}

function displayAt(screens, x, y) {
    return screens.find(d => x >= d.x && x < d.x + d.w && y >= d.y && y < d.y + d.h) ||
        nearest(screens, x, y);
}

function matchDisplay(screens, saved) {
    const named = screens.filter(d => d.name === saved.name);
    return nearest(named.length ? named : screens, saved.x, saved.y);
}

function appWindows(path) {
    const bundle = $.NSBundle.bundleWithPath(path);
    if (bundle.isNil() || bundle.bundleIdentifier.isNil()) return [];
    const running = $.NSRunningApplication.runningApplicationsWithBundleIdentifier(bundle.bundleIdentifier);
    if (!running.count) return [];
    const processes = Application('System Events').processes.whose({unixId: running.objectAtIndex(0).processIdentifier});
    if (!processes.length) return [];
    return processes[0].windows().filter(win => {
        try {
            return win.attributes.byName('AXSubrole').value() === 'AXStandardWindow' &&
                !win.attributes.byName('AXMinimized').value();
        } catch (_) {
            return false;
        }
    });
}

function permissionError(error) {
    return /-25211|-1719|assistive|補助アクセス/i.test(String(error && error.message));
}

function record(group) {
    const screens = displays();
    const layout = {};
    let count = 0;
    group.apps.forEach(path => {
        const windows = appWindows(path);
        if (!windows.length) return;
        layout[path] = windows.map(win => {
            const position = win.position();
            const size = win.size();
            const display = displayAt(screens, position[0] + size[0] / 2, position[1] + size[1] / 2);
            return {
                title: win.name() || '',
                display: display,
                frame: [(position[0] - display.x) / display.w, (position[1] - display.y) / display.h,
                    size[0] / display.w, size[1] / display.h].map(value => Math.round(value * 100000) / 100000)
            };
        });
        count += windows.length;
    });
    if (!count) return 0;
    const kept = {};
    Object.keys(group.layout || {}).forEach(path => {
        if (group.apps.indexOf(path) >= 0) kept[path] = group.layout[path];
    });
    group.layout = Object.assign(kept, layout);
    return count;
}

function place(win, entry, screens) {
    const display = matchDisplay(screens, entry.display);
    const width = Math.round(Math.min(entry.frame[2] * display.w, display.w));
    const height = Math.round(Math.min(entry.frame[3] * display.h, display.h));
    const x = Math.round(display.x + Math.min(Math.max(entry.frame[0] * display.w, 0), display.w - width));
    const y = Math.round(display.y + Math.min(Math.max(entry.frame[1] * display.h, 0), display.h - height));
    win.position = [x, y];
    win.size = [width, height];
    win.position = [x, y];
}

function apply(windows, saved, screens) {
    const remaining = windows.slice();
    saved.forEach(entry => {
        const index = entry.title ? remaining.findIndex(win => win.name() === entry.title) : -1;
        const win = remaining.splice(index < 0 ? 0 : index, 1)[0];
        if (win) place(win, entry, screens);
    });
}

function restore(layout) {
    const screens = displays();
    const deadline = Date.now() + 20000;
    let pending = Object.keys(layout);
    while (pending.length && Date.now() < deadline) {
        pending = pending.filter(path => {
            const windows = appWindows(path);
            if (windows.length < layout[path].length) return true;
            delay(0.5);
            apply(appWindows(path), layout[path], screens);
            return false;
        });
        if (pending.length) delay(0.5);
    }
    pending.forEach(path => apply(appWindows(path), layout[path], screens));
}

function selfPath() {
    const args = ObjC.deepUnwrap($.NSProcessInfo.processInfo.arguments) || [];
    return args.find(arg => /groups\.js$/.test(arg)) ||
        ObjC.unwrap($.NSFileManager.defaultManager.currentDirectoryPath) + '/groups.js';
}

function run(argv) {
    const command = argv[0] || '';
    const args = argv.slice(1);
    const groups = loadGroups();
    const group = groups.find(item => item.id === args[0]);
    const app = Application.currentApplication();
    app.includeStandardAdditions = true;

    if (command === 'load') {
        const labels = {};
        Object.keys(TEXT).forEach(key => { labels['l_' + key] = t(key); });
        return JSON.stringify({variables: labels, update: {ids: {
            search: {placeholder: t('search'), accessibility: {label: t('search')}},
            groups: Object.assign({placeholder: t('empty'), accessibility: {label: t('groups')}}, groupsUpdate(groups)),
            addButton: {tooltip: t('add'), accessibility: {label: t('add')}},
            removeButton: {tooltip: t('remove'), accessibility: {label: t('remove')}},
            editButton: {text: t('edit'), tooltip: t('editTip')},
            recordButton: {text: t('record'), tooltip: t('recordTip')},
            launchButton: {text: t('launch'), tooltip: t('launchTip')}
        }}});
    }

    if (command === 'edit') return JSON.stringify(editSheet(group));

    if (command === 'toggle') {
        if (!args[0]) return '{}';
        const draft = list('draft');
        const index = draft.indexOf(args[0]);
        if (index < 0) draft.push(args[0]);
        else draft.splice(index, 1);
        return draftResponse(draft, list('pinned'), args[1]);
    }

    if (command === 'filter') {
        return JSON.stringify({update: {ids: {picker: pickerUpdate(list('draft'), list('pinned'), args[0])}}});
    }

    if (command === 'add') {
        const picked = appPaths(args.slice(1));
        if (!picked.length) return '{}';
        return draftResponse(unique(list('draft').concat(picked)), unique(list('pinned').concat(picked)), args[0]);
    }

    if (command === 'save') {
        const apps = appPaths(list('draft'));
        if (!apps.length) {
            return JSON.stringify({update: {ids: {selectedCount: {text: t('noApps'), colour: 'systemRedColor'}}}});
        }
        const name = (args[1] || '').trim() || t('untitled');
        if (group) {
            group.name = name;
            group.apps = apps;
            Object.keys(group.layout || {}).forEach(path => {
                if (apps.indexOf(path) < 0) delete group.layout[path];
            });
        } else {
            groups.push({id: ObjC.unwrap($.NSUUID.UUID.UUIDString), name: name, apps: apps});
        }
        return save(groups, {sheet: {close: 'edit'}});
    }

    if (command === 'confirm') return group ? JSON.stringify(deleteSheet(group)) : '{}';

    if (command === 'delete') {
        if (!group) return JSON.stringify({sheet: {close: 'edit'}});
        return save(groups.filter(item => item !== group), {sheet: {close: 'edit'}});
    }

    if (command === 'record') {
        if (!group) return '{}';
        let count;
        try {
            count = record(group);
        } catch (error) {
            return status(permissionError(error) ? t('permission') : error.message);
        }
        return count ? save(groups, {}, t('recorded', count)) : status(t('noWindows'));
    }

    if (command === 'launch') {
        if (!group) return '{}';
        const manager = $.NSFileManager.defaultManager;
        const found = group.apps.filter(path => manager.fileExistsAtPath(path));
        const missing = group.apps.filter(path => found.indexOf(path) < 0);
        const layout = {};
        if (args[1] !== 'plain') {
            found.forEach(path => {
                if (group.layout && group.layout[path]) layout[path] = group.layout[path];
            });
        }
        if (found.length) app.doShellScript('open ' + found.map(quote).join(' '));
        if (Object.keys(layout).length) {
            app.doShellScript('/usr/bin/perl -MPOSIX -e ' + quote('POSIX::setsid(); exec @ARGV') +
                ' /usr/bin/osascript -l JavaScript ' + quote(selfPath()) + ' restore ' +
                quote(JSON.stringify(layout)) + ' >/dev/null 2>&1 </dev/null &');
        }
        if (missing.length) return status(t('missing', missing.map(appName).join(', ')));
        return JSON.stringify({finish: {}});
    }

    if (command === 'restore') {
        try {
            restore(JSON.parse(args[0] || '{}'));
        } catch (error) {
            app.displayNotification(permissionError(error) ? t('permission') : error.message,
                {withTitle: 'Application Group'});
        }
        return '';
    }

    return '{}';
}
