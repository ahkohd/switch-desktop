import Analytics from 'electron-google-analytics';
const analytics = new Analytics('UA-126189060-5');
import { readFileSync } from 'fs';
import * as path from 'path';
const uuid = require('uuid/v4');


const username = require('username');
const appVersion = getAppVersion();
const details = { uname: username.sync(), platform: process.platform, version: appVersion };

// usage dock analytics
export function initAnalytics(store) {
    console.log('[Info]: Intialize analytics');
    const uid = store.get('uid', uuid());
    try {
        analytics.set('uid', uid);
        analytics.set('clientID', uid);
        analytics.set('trackID', uid);
        analytics.set('appName', 'Switch');
        analytics.set('appVersion', appVersion);
    } catch (e) {
        console.log('Failed to log Switch dock version.')
    }

    store.set('uid', uid);
    return uid;
}


// installs and setup analytics
export function firstUseAnalytics(uid) {
    const isFirstTime = localStorage.getItem('first-time');
    if (isFirstTime == null) {
        // its user's first time, log it using the app...
        try {
            analytics.send('pageview', {
                dh: 'switch-dock',
                dp: 'intro?newUser=yes',
                dt: 'Intro',
            }, uid).then((response) => {
                return response;
            }).catch((err) => {
                return err;
            });
        } catch (e) { }
        localStorage.setItem('first-time', 'no');
    } else if (isFirstTime == 'no') {
        // user is just rechecking intro...
        try {
            analytics.send('pageview', {
                dh: 'switch-dock',
                dp: 'intro?newUser=no',
                dt: 'Intro',
            }, uid).then((response) => {
                return response;
            }).catch((err) => {
                return err;
            });
        } catch (e) { }
    }
}

// on dock show log to analytics...
export function logOnShowDock(uid, startup = false) {
    if (startup) {
        try {
            analytics.send('pageview', {
                dh: 'switch-dock',
                dp: 'dock?version=' + appVersion + '&startup=true',
                dt: 'Dock',
            }, uid).then((response) => {
                return response;
            }).catch((err) => {
                return err;
            });
        } catch (e) { }
    } else {
        try {
            analytics.event('ShowDock', 'show', { ec: 'ShowDock', ea: 'show', el: 'dock', ev: details, clientID: uid })
                .then((response) => {
                    return response;
                }).catch((err) => {
                    return err;
                });
        } catch (e) { }
    }
}

function getAppVersion() {
    return JSON.parse(readFileSync(path.join(__dirname, '../package.json')).toString()).version;
}


