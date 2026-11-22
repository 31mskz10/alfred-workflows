#!/usr/bin/osascript -l JavaScript
ObjC.import('Foundation');

function japanese() {
    const language = ObjC.unwrap($.NSProcessInfo.processInfo.environment.objectForKey('language')) || 'auto';
    if (language === 'ja' || language === 'en') return language === 'ja';
    return /^ja(?:-|$)/.test(ObjC.deepUnwrap($.NSLocale.preferredLanguages)[0] || 'en');
}

function run(args) {
    const input = args[0] || '';
    if (!input.startsWith(' ')) return JSON.stringify({items: []});
    const query = input.slice(1);
    try {
        const result = Application('com.runningwithcrayons.Alfred').runTrigger('open', {
            inWorkflow: 'com.31mskz10.openWithApplication',
            withArgument: query
        });
        if (typeof result === 'number' && result < 0) throw new Error('UIを起動できませんでした');
        return JSON.stringify({items: []});
    } catch (error) {
        return JSON.stringify({items: [{
            title: 'Open with Application',
            subtitle: japanese() ? '自動起動できませんでした。Enterで開きます。' : 'Could not open automatically. Press Return to open.',
            arg: query,
            valid: true
        }]});
    }
}
