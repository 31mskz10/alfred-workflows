#!/usr/bin/osascript -l JavaScript

const COMMANDS = [
    'all-in-one', 'capture-area', 'capture-fullscreen', 'capture-previous-area', 'capture-text',
    'capture-window', 'hide-desktop-icons', 'open-annotate', 'open-from-clipboard', 'open-history',
    'open-settings', 'pin', 'record-screen', 'restore-recently-closed', 'scrolling-capture',
    'self-timer', 'show-desktop-icons', 'toggle-desktop-icons'
];
const CAPTURES = ['capture-area', 'capture-previous-area', 'capture-fullscreen', 'capture-window', 'self-timer'];
const ACTIONS = ['copy', 'save', 'annotate', 'upload', 'pin'];

function titleize(value) {
    return value.split('-').map(word => word[0].toUpperCase() + word.slice(1)).join(' ');
}

function item(uid, title, url, match) {
    return {uid: uid, title: title, subtitle: url, arg: url, match: match};
}

function run() {
    const items = [];
    COMMANDS.forEach(command => {
        const url = 'cleanshot://' + command;
        const title = titleize(command);
        items.push(item(command, title, url, command + ' ' + title));
        if (CAPTURES.indexOf(command) < 0) return;
        ACTIONS.forEach(action => {
            items.push(item(command + '-' + action, title + ' -> ' + titleize(action),
                url + '?action=' + action, command + ' ' + title + ' ' + action));
        });
    });
    return JSON.stringify({items: items});
}
