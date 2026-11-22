#!/usr/bin/osascript -l JavaScript
ObjC.import('Foundation');

const CLI = '/Library/Application Support/org.pqrs/Karabiner-Elements/bin/karabiner_cli';

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
            title: 'Karabiner-Elementsが見つかりません / Karabiner-Elements not found',
            subtitle: CLI,
            valid: false
        }]});
    }
    const current = cli('--show-current-profile-name');
    const names = cli('--list-profile-names').split(/\r\n|\r|\n/).filter(Boolean);
    return JSON.stringify({items: names.map(name => ({
        uid: name,
        title: name,
        subtitle: name === current
            ? '現在のプロファイル / Current profile'
            : 'このプロファイルに切り替える / Switch to this profile',
        arg: name,
        match: name,
        valid: name !== current
    }))});
}
