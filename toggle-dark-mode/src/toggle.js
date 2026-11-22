#!/usr/bin/osascript -l JavaScript
ObjC.import('Foundation');

function japanese() {
    const language = ObjC.unwrap($.NSProcessInfo.processInfo.environment.objectForKey('language')) || 'auto';
    if (language === 'ja' || language === 'en') return language === 'ja';
    return /^ja(?:-|$)/.test(ObjC.deepUnwrap($.NSLocale.preferredLanguages)[0] || 'en');
}

function run() {
    const dark = ObjC.unwrap($.NSUserDefaults.standardUserDefaults.stringForKey('AppleInterfaceStyle')) === 'Dark';
    const ja = japanese();
    return JSON.stringify({items: [{
        uid: 'toggle',
        title: dark ? (ja ? 'ライトモードに切り替え' : 'Switch to Light Mode') : (ja ? 'ダークモードに切り替え' : 'Switch to Dark Mode'),
        subtitle: dark ? (ja ? '現在: ダークモード' : 'Current: Dark Mode') : (ja ? '現在: ライトモード' : 'Current: Light Mode'),
        arg: dark ? 'light' : 'dark'
    }]});
}
