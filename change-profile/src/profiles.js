#!/usr/bin/osascript -l JavaScript
ObjC.import('Foundation');

const CLI = '/Library/Application Support/org.pqrs/Karabiner-Elements/bin/karabiner_cli';
const TEXT = {
    notFound: ['Karabiner-Elementsが見つかりません', 'Karabiner-Elements not found'],
    current: ['現在のプロファイル', 'Current profile'],
    switchTo: ['このプロファイルに切り替える', 'Switch to this profile'],
    readFailed: ['プロファイルを読み込めませんでした', 'Could not read profiles'],
    switched: ['「%s」に切り替えました', 'Switched to "%s"'],
    selectFailed: ['「%s」に切り替えられませんでした: ', 'Could not switch to "%s": '],
    missing: ['Karabiner-Elementsにこのプロファイルがありません', 'the profile does not exist in Karabiner-Elements']
};

function t(key, value) {
    const language = ObjC.unwrap($.NSProcessInfo.processInfo.environment.objectForKey('language')) || 'auto';
    const ja = language === 'ja' || (language !== 'en' &&
        /^ja(?:-|$)/.test(ObjC.deepUnwrap($.NSLocale.preferredLanguages)[0] || 'en'));
    return TEXT[key][ja ? 0 : 1].replace('%s', () => value);
}

function quote(value) {
    return "'" + value.replace(/'/g, "'\\''") + "'";
}

function cli(option) {
    const app = Application.currentApplication();
    app.includeStandardAdditions = true;
    return app.doShellScript(quote(CLI) + ' ' + option);
}

function message(title, subtitle) {
    return JSON.stringify({items: [{title: title, subtitle: subtitle, valid: false}]});
}

function select(name) {
    try {
        const names = cli('--list-profile-names').split(/\r\n|\r|\n/);
        if (names.indexOf(name) < 0) return t('selectFailed', name) + t('missing');
        cli('--select-profile=' + quote(name));
        return t('switched', name);
    } catch (error) {
        return t('selectFailed', name) + error.message;
    }
}

function run(argv) {
    if (argv[0] === 'select') return select(argv[1] || '');
    if (!$.NSFileManager.defaultManager.isExecutableFileAtPath(CLI)) return message(t('notFound'), CLI);
    let current;
    let names;
    try {
        current = cli('--show-current-profile-name');
        names = cli('--list-profile-names').split(/\r\n|\r|\n/).filter(Boolean);
    } catch (error) {
        return message(t('readFailed'), error.message);
    }
    return JSON.stringify({items: names.map(name => ({
        uid: name,
        title: name,
        subtitle: t(name === current ? 'current' : 'switchTo'),
        arg: name,
        match: name,
        valid: name !== current
    }))});
}
