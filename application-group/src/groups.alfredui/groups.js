#!/usr/bin/osascript -l JavaScript
ObjC.import('AppKit');
ObjC.import('ApplicationServices');

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
    selected: ['%s個選択中。↩・ダブルクリック・Space（一覧上）で切り替えます。', '%s selected. Return, double-click, or Space (in the list) toggles.'],
    save: ['保存', 'Save'],
    cancel: ['キャンセル', 'Cancel'],
    delete: ['削除', 'Delete'],
    confirm: ['「%s」を削除しますか？', 'Delete “%s”?'],
    irreversible: ['この操作は取り消せません。', 'This action cannot be undone.'],
    noApps: ['アプリを1つ以上選択してください。', 'Select at least one app.'],
    missing: ['見つからないアプリ: %s', 'Not found: %s'],
    untitled: ['新しいグループ', 'New Group'],
    recorded: ['%s個のウインドウの配置を記録しました。', 'Saved the layout of %s window(s).'],
    noWindows: ['記録できるウインドウがありません。アプリを起動して並べてから記録してください。', 'No windows to save. Launch and arrange the apps first.'],
    permission: ['アクセシビリティの許可が必要です。システム設定 > プライバシーとセキュリティ > アクセシビリティ で Alfred を許可してください。',
        'Accessibility access is required. Allow Alfred in System Settings > Privacy & Security > Accessibility.'],
    automation: ['System Events の操作許可が必要です。システム設定 > プライバシーとセキュリティ > オートメーション で Alfred に System Events の制御を許可してください。',
        'Automation access is required. Allow Alfred to control System Events in System Settings > Privacy & Security > Automation.'],
    corrupt: ['保存データを読み込めないため、変更を保存できません。', 'Saved groups could not be read, so changes cannot be saved.'],
    openFailed: ['起動できなかったアプリ: %s', 'Could not open: %s'],
    placeFailed: ['%s個のウインドウを配置できませんでした。', 'Could not place %s window(s).']
};

function env(name) {
    return ObjC.unwrap($.NSProcessInfo.processInfo.environment.objectForKey(name));
}

const LANGUAGE = env('language') || 'auto';
const JAPANESE = LANGUAGE === 'ja' || (LANGUAGE !== 'en' &&
    /^ja(?:-|$)/.test(ObjC.deepUnwrap($.NSLocale.preferredLanguages)[0] || 'en'));

function t(key, value) {
    return TEXT[key][JAPANESE ? 0 : 1].replace('%s', () => String(value));
}

function validGroup(group) {
    return !!group && typeof group.id === 'string' && typeof group.name === 'string' && Array.isArray(group.apps);
}

function loadGroups() {
    let all;
    try {
        all = JSON.parse(env('groups') || '[]');
    } catch (_) {
        all = null;
    }
    if (!Array.isArray(all)) return {all: null, groups: []};
    const groups = all.filter(validGroup);
    groups.forEach(group => {
        group.apps = group.apps.filter(path => typeof path === 'string');
        if (!group.layout || typeof group.layout !== 'object' || Array.isArray(group.layout)) delete group.layout;
    });
    return {all: all, groups: groups};
}

function finite(value) {
    return typeof value === 'number' && isFinite(value);
}

function validEntry(entry) {
    const display = entry && entry.display;
    return !!display && typeof display === 'object' && ['x', 'y', 'w', 'h'].every(key => finite(display[key])) &&
        display.w > 0 && display.h > 0 && Array.isArray(entry.frame) && entry.frame.length === 4 &&
        entry.frame.every(finite);
}

function normalize(text) {
    return String(text || '').normalize('NFC').toLowerCase();
}

function matches(path, query) {
    const text = normalize(query).trim();
    return normalize(appName(path)).includes(text) || normalize(fileName(path)).includes(text);
}

function list(name) {
    try {
        const value = JSON.parse(env(name) || '[]');
        return Array.isArray(value) ? value.filter(item => typeof item === 'string') : [];
    } catch (_) {
        return [];
    }
}

const NAMES = {};

function fileName(path) {
    return path.split('/').pop().replace(/\.app$/, '');
}

function appName(path) {
    if (!NAMES[path]) {
        const name = ObjC.unwrap($.NSFileManager.defaultManager.displayNameAtPath(path)) || '';
        NAMES[path] = name.replace(/\.app$/, '') || fileName(path);
    }
    return NAMES[path];
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

function save(all, extra, message, keepRows) {
    const ids = {status: {text: message || '', tooltip: message || ''}};
    if (!keepRows) ids.groups = groupsUpdate(all.filter(validGroup));
    return JSON.stringify(Object.assign({
        variables: {groups: JSON.stringify(all)},
        update: {ids: ids}
    }, extra));
}

function status(message) {
    return JSON.stringify({update: {ids: {status: {text: message, tooltip: message}}}});
}

function pickerUpdate(draft, pinned, query) {
    const home = ObjC.unwrap($.NSHomeDirectory());
    const installed = ['/Applications', '/System/Applications', home + '/Applications']
        .reduce((paths, folder) => paths.concat(installedApps(folder, 1)), [])
        .sort((a, b) => appName(a).localeCompare(appName(b)));
    return {data: {
        src: unique(pinned.concat(installed, draft)).filter(path => matches(path, query)).map(path => ({
            uid: path,
            'appPath.text': path,
            'appName.text': appName(path),
            'appIcon.image': {type: 'fileicon', src: path},
            'appCheck.image': {type: 'symbol', src: draft.indexOf(path) < 0 ? 'circle' : 'checkmark.circle.fill'}
        }))
    }};
}

function draftResponse(draft, pinned, query, search) {
    const ids = {
        picker: pickerUpdate(draft, pinned, query),
        selectedCount: {text: t('selected', draft.length), colour: 'secondaryLabelColor'}
    };
    if (search) ids.pickerSearch = search;
    return JSON.stringify({variables: {draft: JSON.stringify(draft), pinned: JSON.stringify(pinned)}, update: {ids: ids}});
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
                    {type: 'textfield', id: 'editName', focus: !group, text: group ? group.name : '', placeholder: t('untitled'),
                        accessibility: {label: t('name')}},
                    label(t('apps')),
                    {type: 'textfield', id: 'pickerSearch', focus: !!group, placeholder: t('appSearch'),
                        accessibility: {label: t('appSearch')},
                        events: [
                            {triggers: 'typingstopped', action: script('filter', '{value:pickerSearch.text}')},
                            {triggers: 'actioned', action: script('toggle', '{value:picker.selected.appPath.text}',
                                '{value:pickerSearch.text}', 'search')}
                        ]}
                ]},
                {type: 'view', id: 'pickerList', focusable: true, layout: 'inline', direction: 'vertical',
                    shortcuts: [{shortcut: '␣', action: toggle}, {shortcut: '↩', action: toggle}],
                    components: [Object.assign({
                    type: 'dataview', id: 'picker', cols: 1, spacing: 2, padding: 4,
                    constraints: {size: {height: 300}}, accessibility: {label: t('apps')},
                    events: [
                        {triggers: 'actioned', action: {type: 'json', src: {update: {ids: {pickerList: {focus: true}}}}}},
                        {triggers: 'doubleclicked', action: toggle}
                    ],
                    cell: cell(32, {type: 'view', id: 'appCell', layout: 'border', spacing: 8, padding: 6,
                        cornerradius: 6, components: [
                            {type: 'label', id: 'appPath', hidden: true},
                            {type: 'imageview', id: 'appCheck', constraints: {region: 'left', size: 16}},
                            {type: 'view', layout: 'border', spacing: 8, constraints: {region: 'centre'}, components: [
                                {type: 'imageview', id: 'appIcon', constraints: {region: 'left', size: 20}},
                                label('', {id: 'appName', linebreak: 'truncatetail', constraints: {region: 'centre'}})
                            ]}
                        ]}, ['appCell', 'appName'])
                }, pickerUpdate(draft, draft))]},
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
    for (let i = 0; i < Number(screens.count); i++) {
        const screen = screens.objectAtIndex(i);
        const frame = screen.frame;
        const visible = screen.visibleFrame;
        result.push({
            name: ObjC.unwrap(screen.localizedName) || '',
            x: frame.origin.x,
            y: primary.size.height - frame.origin.y - frame.size.height,
            w: frame.size.width,
            h: frame.size.height,
            visible: {
                x: visible.origin.x,
                y: primary.size.height - visible.origin.y - visible.size.height,
                w: visible.size.width,
                h: visible.size.height
            }
        });
    }
    return result;
}

function nearest(screens, x, y) {
    return screens.slice().sort((a, b) => Math.hypot(a.x - x, a.y - y) - Math.hypot(b.x - x, b.y - y))[0];
}

function gap(d, x, y) {
    return Math.hypot(x - Math.min(Math.max(x, d.x), d.x + d.w), y - Math.min(Math.max(y, d.y), d.y + d.h));
}

function displayAt(screens, x, y) {
    return screens.find(d => x >= d.x && x < d.x + d.w && y >= d.y && y < d.y + d.h) ||
        screens.slice().sort((a, b) => gap(a, x, y) - gap(b, x, y))[0];
}

function baseName(name) {
    return String(name || '').replace(/\s*[（(]\d+[）)]$/, '');
}

function matchDisplay(screens, saved) {
    const named = screens.filter(d => baseName(d.name) === baseName(saved.name));
    const candidates = named.length ? named : screens;
    return candidates.find(d => d.x === saved.x && d.y === saved.y && d.w === saved.w && d.h === saved.h) ||
        nearest(candidates, saved.x, saved.y);
}

function processWindows(proc) {
    const titles = proc.windows.name();
    const positions = proc.windows.position();
    const sizes = proc.windows.size();
    if (titles.length !== positions.length || titles.length !== sizes.length) return [];
    const result = [];
    titles.forEach((title, index) => {
        const ref = proc.windows.at(index);
        try {
            if (ref.attributes.byName('AXSubrole').value() !== 'AXStandardWindow' ||
                ref.attributes.byName('AXMinimized').value()) return;
        } catch (_) {
            return;
        }
        result.push({ref: ref, title: title || '', position: positions[index], size: sizes[index]});
    });
    return result;
}

function resolved(path) {
    return ObjC.unwrap($(path).stringByResolvingSymlinksInPath);
}

function appWindows(path) {
    const bundle = $.NSBundle.bundleWithPath(path);
    if (bundle.isNil() || bundle.bundleIdentifier.isNil()) return [];
    const running = $.NSRunningApplication.runningApplicationsWithBundleIdentifier(bundle.bundleIdentifier);
    const all = [];
    for (let i = 0; i < Number(running.count); i++) all.push(running.objectAtIndex(i));
    const target = resolved(path);
    const same = all.filter(item => !item.bundleURL.isNil() && resolved(ObjC.unwrap(item.bundleURL.path)) === target);
    const events = Application('System Events');
    let result = [];
    (same.length ? same : all).forEach(item => {
        const processes = events.processes.whose({unixId: item.processIdentifier});
        if (processes.length) result = result.concat(processWindows(processes[0]));
    });
    return result;
}

function permissionMessage(error) {
    const number = error && error.errorNumber;
    const message = String(error && error.message);
    if (number === -1743 || /-1743|not authorized to send apple events/i.test(message)) return t('automation');
    if (number === -25211 || /-25211|assistive|補助アクセス/i.test(message)) return t('permission');
    return '';
}

function safeWindows(path) {
    try {
        return appWindows(path);
    } catch (error) {
        if (permissionMessage(error)) throw error;
        return [];
    }
}

function record(group) {
    const screens = displays();
    const layout = {};
    let count = 0;
    group.apps.forEach(path => {
        const entries = safeWindows(path).map(win => {
            const display = displayAt(screens, win.position[0] + win.size[0] / 2, win.position[1] + win.size[1] / 2);
            return {
                title: win.title,
                display: {name: display.name, x: display.x, y: display.y, w: display.w, h: display.h},
                frame: [(win.position[0] - display.x) / display.w, (win.position[1] - display.y) / display.h,
                    win.size[0] / display.w, win.size[1] / display.h].map(value => Math.round(value * 100000) / 100000)
            };
        });
        if (!entries.length) return;
        layout[path] = entries;
        count += entries.length;
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
    const area = display.visible || display;
    const width = Math.round(Math.min(entry.frame[2] * display.w, area.w));
    const height = Math.round(Math.min(entry.frame[3] * display.h, area.h));
    const x = Math.round(Math.min(Math.max(display.x + entry.frame[0] * display.w, area.x), area.x + area.w - width));
    const y = Math.round(Math.min(Math.max(display.y + entry.frame[1] * display.h, area.y), area.y + area.h - height));
    win.ref.position = [x, y];
    try {
        win.ref.size = [width, height];
    } catch (error) {
        if (permissionMessage(error)) throw error;
    }
    win.ref.position = [x, y];
}

function apply(windows, saved, screens) {
    const remaining = windows.slice();
    const matched = saved.map(entry => {
        const title = typeof entry.title === 'string' ? entry.title : '';
        const index = title ? remaining.findIndex(win => win.title === title) : -1;
        return index < 0 ? null : remaining.splice(index, 1)[0];
    });
    let failed = 0;
    saved.forEach((entry, index) => {
        const win = matched[index] || remaining.shift();
        if (!win) return;
        try {
            place(win, entry, screens);
        } catch (error) {
            if (permissionMessage(error)) throw error;
            failed++;
        }
    });
    return failed;
}

function timeout() {
    const value = (env('restore_timeout') || '').normalize('NFKC').trim();
    const seconds = /^\d+$/.test(value) ? Number(value) : 0;
    return seconds >= 1 && seconds <= 300 ? seconds : 20;
}

function restore(layout) {
    const screens = displays();
    const deadline = Date.now() + timeout() * 1000;
    const paths = Object.keys(layout).filter(path => Array.isArray(layout[path]));
    paths.forEach(path => { layout[path] = layout[path].filter(validEntry); });
    let pending = paths.slice();
    const settling = [];
    let failed = 0;
    const settle = () => {
        const item = settling.shift();
        delay(Math.max(0, item.at - Date.now()) / 1000);
        failed += apply(safeWindows(item.path), layout[item.path], screens);
    };
    while (pending.length && Date.now() < deadline) {
        pending = pending.filter(path => {
            if (safeWindows(path).length < layout[path].length) return true;
            delay(0.5);
            apply(safeWindows(path), layout[path], screens);
            settling.push({path: path, at: Date.now() + 1500});
            return false;
        });
        while (settling.length && settling[0].at <= Date.now()) settle();
        if (pending.length) delay(0.5);
    }
    while (settling.length) settle();
    if (pending.length) delay(1.5);
    return pending.reduce((sum, path) => sum + apply(safeWindows(path), layout[path], screens), failed);
}

function layoutFor(group, paths) {
    const layout = {};
    paths.forEach(path => {
        const entries = group && group.layout && Array.isArray(group.layout[path]) ? group.layout[path].filter(validEntry) : [];
        if (entries.length) layout[path] = entries;
    });
    return layout;
}

function selfPath() {
    const args = ObjC.deepUnwrap($.NSProcessInfo.processInfo.arguments) || [];
    return args.find(arg => /groups\.js$/.test(arg)) ||
        ObjC.unwrap($.NSFileManager.defaultManager.currentDirectoryPath) + '/groups.js';
}

function run(argv) {
    const command = argv[0] || '';
    const args = argv.slice(1);
    const loaded = loadGroups();
    const all = loaded.all;
    const groups = loaded.groups;
    const group = groups.find(item => item.id === args[0]);
    const app = Application.currentApplication();
    app.includeStandardAdditions = true;

    if (command === 'load') {
        const ids = {
            search: {placeholder: t('search'), accessibility: {label: t('search')}},
            groups: Object.assign({placeholder: t('empty'), accessibility: {label: t('groups')}}, groupsUpdate(groups)),
            addButton: {tooltip: t('add'), accessibility: {label: t('add')}},
            removeButton: {tooltip: t('remove'), accessibility: {label: t('remove')}},
            editButton: {text: t('edit'), tooltip: t('editTip')},
            recordButton: {text: t('record'), tooltip: t('recordTip')},
            launchButton: {text: t('launch'), tooltip: t('launchTip')}
        };
        if (!all) ids.status = {text: t('corrupt'), tooltip: t('corrupt')};
        return JSON.stringify({update: {ids: ids}});
    }

    if (!all && ['edit', 'save', 'confirm', 'delete', 'record'].indexOf(command) >= 0) return status(t('corrupt'));

    if (command === 'edit') {
        if (args.length && !group) return '{}';
        return JSON.stringify(editSheet(group));
    }

    if (command === 'toggle') {
        const draft = list('draft');
        const pinned = list('pinned');
        let path = args[0];
        if (args[2] === 'search' && (!path || !matches(path, args[1]))) {
            const first = pickerUpdate(draft, pinned, args[1]).data.src[0];
            path = first && first['appPath.text'];
        }
        if (!path) return '{}';
        const index = draft.indexOf(path);
        if (index < 0) draft.push(path);
        else draft.splice(index, 1);
        return draftResponse(draft, pinned, args[1], args[2] === 'search' && {focus: true});
    }

    if (command === 'filter') {
        return JSON.stringify({update: {ids: {picker: pickerUpdate(list('draft'), list('pinned'), args[0]),
            pickerSearch: {focus: true}}}});
    }

    if (command === 'add') {
        const picked = appPaths(args.slice(1));
        if (!picked.length) return '{}';
        return draftResponse(unique(list('draft').concat(picked)), unique(list('pinned').concat(picked)), '', {text: ''});
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
            all.push({id: ObjC.unwrap($.NSUUID.UUID.UUIDString), name: name, apps: apps});
        }
        return save(all, {sheet: {close: 'edit'}});
    }

    if (command === 'confirm') return group ? JSON.stringify(deleteSheet(group)) : '{}';

    if (command === 'delete') {
        if (!group) return JSON.stringify({sheet: {close: 'edit'}});
        return save(all.filter(item => !(validGroup(item) && item.id === group.id)), {sheet: {close: 'edit'}});
    }

    if (command === 'record') {
        if (!group) return '{}';
        if (!$.AXIsProcessTrusted()) return status(t('permission'));
        let count;
        try {
            count = record(group);
        } catch (error) {
            return status(permissionMessage(error) || error.message);
        }
        return count ? save(all, {}, t('recorded', count), true) : status(t('noWindows'));
    }

    if (command === 'launch') {
        if (!group) return '{}';
        const manager = $.NSFileManager.defaultManager;
        const found = group.apps.filter(path => manager.fileExistsAtPath(path));
        const missing = group.apps.filter(path => found.indexOf(path) < 0);
        const failed = found.filter(path => {
            try {
                app.doShellScript('open ' + quote(path));
                return false;
            } catch (_) {
                return true;
            }
        });
        const messages = [];
        const paths = args[1] === 'plain' ? [] :
            Object.keys(layoutFor(group, found.filter(path => failed.indexOf(path) < 0)));
        if (paths.length && !$.AXIsProcessTrusted()) {
            messages.push(t('permission'));
        } else if (paths.length) {
            try {
                app.doShellScript('/usr/bin/perl -MPOSIX -e ' + quote('POSIX::setsid(); exec @ARGV') +
                    ' /usr/bin/osascript -l JavaScript ' + quote(selfPath()) + ' restore ' +
                    quote(group.id) + ' ' + quote(JSON.stringify(paths)) + ' >/dev/null 2>&1 </dev/null &');
            } catch (error) {
                messages.push(error.message);
            }
        }
        if (missing.length) messages.push(t('missing', missing.map(appName).join(', ')));
        if (failed.length) messages.push(t('openFailed', failed.map(appName).join(', ')));
        return messages.length ? status(messages.join(' ')) : JSON.stringify({finish: {}});
    }

    if (command === 'restore') {
        let message = '';
        try {
            const failed = restore(layoutFor(group, appPaths([args[1] || '[]'])));
            if (failed) message = t('placeFailed', failed);
        } catch (error) {
            message = permissionMessage(error) || error.message;
        }
        if (message) app.displayNotification(message, {withTitle: 'Application Group'});
        return '';
    }

    return '{}';
}
