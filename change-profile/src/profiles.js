#!/usr/bin/osascript -l JavaScript
ObjC.import('Foundation');

const CLI = '/Library/Application Support/org.pqrs/Karabiner-Elements/bin/karabiner_cli';
const TEXT = {
    notFound: ['Karabiner-Elementsが見つかりません', 'Karabiner-Elements not found'],
    current: ['現在のプロファイル', 'Current profile'],
    switchTo: ['このプロファイルに切り替える', 'Switch to this profile']
};

function t(key) {
    const language = ObjC.unwrap($.NSProcessInfo.processInfo.environment.objectForKey('language')) || 'auto';
    const ja = language === 'ja' || (language !== 'en' &&
        /^ja(?:-|$)/.test(ObjC.deepUnwrap($.NSLocale.preferredLanguages)[0] || 'en'));
    return TEXT[key][ja ? 0 : 1];
}

function quote(value) {
    return "'" + value.replace(/'/g, "'\\''") + "'";
}

function cli(option) {
    const app = Application.currentApplication();
    app.includeStandardAdditions = true;
    return app.doShellScript(quote(CLI) + ' ' + option);
}

function run() {
    if (!$.NSFileManager.defaultManager.isExecutableFileAtPath(CLI)) {
        return JSON.stringify({items: [{
            title: t('notFound'),
            subtitle: CLI,
            valid: false
        }]});
    }
    const current = cli('--show-current-profile-name');
    const names = cli('--list-profile-names').split(/\r\n|\r|\n/).filter(Boolean);
    return JSON.stringify({items: names.map(name => ({
        uid: name,
        title: name,
        subtitle: t(name === current ? 'current' : 'switchTo'),
        arg: name,
        match: name,
        valid: name !== current
    }))});
}
