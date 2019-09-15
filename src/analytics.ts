import Analytics from 'electron-google-analytics';
const analytics = new Analytics('UA-126189060-5');
import { readFileSync } from 'fs';
import * as path from 'path';
const uuid = require('uuid/v4');


const username = require('username');
const appVersion = getAppVersion();
const uid = localStorage.getItem('uid') || uuid();
localStorage.setItem('uid', uid);
const details = {uname: username.sync(), platform:  process.platform,  version: appVersion};


// usage dock analytics
export function initDockAnalytics() {
    console.log('[Info]: Intialize analytics');
    try {
        analytics.set('uid', uid);
        analytics.set('clientID', uid);
        analytics.set('trackID', uid);
        analytics.set('appName', 'Switch');
        analytics.set('appVersion', appVersion);
    } catch (e) {
        console.log('Failed to log Switch dock version.')
    }
    logOnShowDock(true);
}


// installs and setup analytics
export function firstUseAnalytics() {
    initDockAnalytics();
    const isFirstTime = localStorage.getItem('first-time');
    if (isFirstTime == null) {
        // its user's first time, log it using the app...
        try {
            analytics.pageview('switch-dock', 'intro?newUser=yes', 'Intro', new Date().getTime(), uid)
            .then((response) => {
                return response;
            }).catch((err) => {
                return err;
            });
        } catch(e) { }
        localStorage.setItem('first-time', 'no');
    } else if (isFirstTime == 'no') {
        // user is just rechecking intro...
        try {
            analytics.pageview('switch-dock', 'intro?newUser=no', 'Intro', new Date().getTime(), uid)
            .then((response) => {
                return response;
            }).catch((err) => {
                return err;
            });
        } catch (e) {}
    }
}

// on dock show log to analytics...
export function logOnShowDock(startup = false) {
    if (startup) {
        try {
            analytics.pageview('switch-dock', 'dock?version=' + appVersion + '&startup=true', 'Dock', new Date().getTime(), uid)
            .then((response) => {
                return response;
            }).catch((err) => {
                return err;
            });
        } catch (e) {}
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


