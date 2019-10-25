const { remote, app } = require("electron");

const find = require("find-process");
const ps = require("ps-node");
const isDev = require("electron-is-dev");

const { Tray, Menu, BrowserWindow } = remote;
const url = require("url");
const path = require("path");
const { execFile } = require("child_process");

const Store = require("electron-store");
const config = new Store({
  projectName: "SwitchDock"
});

let trayIcon = new Tray(
  path.join(
    __dirname,
    `/assets/app-icons/${
      process.platform == "darwin" ? "tray/icon.png" : "icon.png"
    }`
  )
);
let settingsWindowOpened = false;

canShowIntro = () => {
  const status = config.get("showIntro");
  return status == null ? true : status;
};

// creates an intro window
createIntroWindow = () => {
  let win = new remote.BrowserWindow({
    width: 600,
    height: 400,
    show: false,
    frame: false,
    hasShadow: false,
    transparent: true,
    maximizable: false,
    minimizable: false,
    skipTaskbar: true,
    resizable: false,
    webPreferences: {
      devTools: false,
      nodeIntegration: true
    }
  });

  win.loadURL(
    url.format({
      pathname: path.join(__dirname, "intro.html"),
      protocol: "file:",
      slashes: true
    })
  );
  win.on("closed", () => {});
  win.once("ready-to-show", () => {
    win.show();
  });
};
//show intro on startup.
if (canShowIntro()) createIntroWindow();

createSettingsWindow = () => {
  let win = new BrowserWindow({
    width: 600,
    height: 400,
    show: false,
    maximizable: false,
    minimizable: false,
    resizable: false,
    webPreferences: {
      // devTools: true,
      nodeIntegration: true
    }
  });
  win.loadURL(
    url.format({
      pathname: path.join(__dirname, "settings.html"),
      protocol: "file:",
      slashes: true
    })
  );

  win.on("closed", () => {
    settingsWindowOpened = false;
    trayMenu.items[1].enabled = true;
    // send the update to the switch service..
    try {
      window.SWITCH_SERVICE_CHANNEL.emit(
        "switch-service-incoming",
        JSON.stringify({
          type: "config-update",
          data: {
            ...config.get("config"),
            disableAltGr: config.get("disableAltGr")
          }
        })
      );
    } catch (e) {}
  });

  win.once("ready-to-show", () => {
    settingsWindowOpened = true;
    win.setMenu(null);
    win.show();
    trayIcon.setContextMenu(trayMenu);
    trayMenu.items[1].enabled = false;
  });
};

const trayMenuTemplate = [
  {
    label: "Show dock",
    click: () => {
      try {
        window.SWITCH_SERVICE_CHANNEL.emit(
          "switch-service-incoming",
          JSON.stringify({
            type: "show-dock"
          })
        );
      } catch (e) {}
    }
  },

  {
    label: "Settings",
    click: () => createSettingsWindow(),
    enabled: !settingsWindowOpened
  },
  {
    label: "Quit",
    click: function() {
      app.quit();
    }
  }
];

if (process.platform == "darwin") {
  // If platform is mac add extra menu item to cater for starting
  // and stoping services ...
  trayMenuTemplate.unshift({
    label: "Start Switch",
    click: () => {
      StartOrStopSwitchMacService(true);
    }
  });
  // try and stop any existing switch service
  // and then build up tray menu
  StartOrStopSwitchMacService(false);
} else {
  // build and show tray menu ...
  buildTrayMenu();
}

function buildTrayMenu() {
  let trayMenu = Menu.buildFromTemplate(trayMenuTemplate);
  trayIcon.setContextMenu(trayMenu);
}

/**
 * Swicth service spawn stategy for mac OS
 */
const SPWAN_SWITCH_SERVICE_MAC = function() {
  return execFile(
    isDev
      ? path.join(__dirname, "/service-binaries/switch")
      : path.join(path.dirname(__dirname), "/service-binaries/switch"),
    [],
    (error, stdout, stderr) => {}
  );
};

/**
 * Tries to start a new switch service but then kills the existing ones
 * @param {boolean} start If true, its a start operation otherwise its a stop
 */
function StartOrStopSwitchMacService(start = true) {
  find("name", "/service-binaries/switch", false).then(function(list) {
    // alert("Num: " + list.length);
    list.forEach(p => {
      ps.kill(p.pid, err => {});
    });

    if (start) {
      let child = SPWAN_SWITCH_SERVICE_MAC();
      // on error kill service and respawn
      child.stderr.on("data", data => {
        child.kill();
        // auto spwan..
        child = SPWAN_SWITCH_SERVICE_MAC();
      });

      trayMenuTemplate[0].label = "Stop Switch";
      trayMenuTemplate[0].click = () => {
        StartOrStopSwitchMacService(false);
      };
    } else {
      trayMenuTemplate[0].label = "Start Switch";
      trayMenuTemplate[0].click = () => {
        StartOrStopSwitchMacService(true);
      };
    }
    buildTrayMenu();
  });
}
