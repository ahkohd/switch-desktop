// Modules to control application life and create native browser window
const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const Positioner = require("electron-positioner");
const { execFile } = require("child_process");
const Sentry = require("@sentry/node");
Sentry.init({
  dsn: "https://1607ab9c0f4b4156be881c9ec9be23b5@sentry.io/1540999"
});

// Load saved configurations
const Store = require("electron-store");
const config = new Store({
  projectName: "SwitchDock"
});

// SPWAN SWITCH SERVICE
const devmode = process.argv[2] == "--dev" ? true : false;

function SPWAN_SWITCH_SERVICE_WIN() {
  // windows specific spawn
  return execFile(
    devmode
      ? path.join(app.getAppPath(), "\\service-binaries\\switch")
      : path.join(path.dirname(app.getAppPath()), "\\service-binaries\\switch"),
    [],
    (error, stdout, stderr) => {}
  );
}

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;
// Make switch only one instance.
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on("second-instance", (event, commandLine, workingDirectory) => {
    // Someone tried to run a second instance, we should focus our window.
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  function createWindow() {
    const dimension = {
      mac: [65, 600],
      win: [70, 600]
    };
    const getDim = function() {
      return process.platform == "darwin" ? dimension.mac : dimension.win;
    };

    // Create the browser window.
    mainWindow = new BrowserWindow({
      width: getDim()[0],
      height: getDim()[1],
      frame: false,
      resizable: false,
      skipTaskbar: true,
      minimizable: false,
      maximizable: false,
      fullscreenable: false,
      alwaysOnTop: true,
      autoHideMenuBar: true,
      transparent: true,
      show: false,
      vibrancy: "popover",
      hasShadow: false,
      webPreferences: {
        nodeIntegration: true,
        devTools: false,
        preload: path.join(__dirname, "preload.js")
      }
    });

    // and load the index.html of the app.
    mainWindow.loadFile("index.html");

    // Open the DevTools.
    // mainWindow.webContents.openDevTools()

    // Emitted when the window is closed.
    mainWindow.on("closed", function() {
      // Dereference the window object, usually you would store windows
      // in an array if your app supports multi windows, this is the time
      // when you should delete the corresponding element.
      mainWindow = null;
    });

    mainWindow.once("ready-to-show", () => {
      // setup positioner
      const positioner = new Positioner(mainWindow);
      let placement = config.get("config");
      // get placement
      placement = placement == null ? "right" : placement.placement;
      placement == "right"
        ? positioner.move("rightCenter")
        : positioner.move("leftCenter");
      const pos = mainWindow.getPosition();
      placement == "right"
        ? mainWindow.setPosition(pos[0] - 10, pos[1])
        : mainWindow.setPosition(pos[0] + 10, pos[1]);
      // delay a  bit
      setTimeout(() => mainWindow.show(), 1000);
    });

    // spawn the executable approraite for the windows os.
    if (process.platform == "win32") {
      let child = SPWAN_SWITCH_SERVICE_WIN();
      // on error kill service and respawn
      child.stderr.on("data", data => {
        child.kill();
        // auto spwan..
        child = SPWAN_SWITCH_SERVICE_WIN();
      });
    }
  }

  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  app.on("ready", createWindow);

  // Quit when all windows are closed.
  app.on("window-all-closed", function() {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== "darwin") app.quit();
  });

  app.on("activate", function() {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) createWindow();
  });

  // In this file you can include the rest of your app's specific main process
  // code. You can also put them in separate files and require them here.

  ipcMain.on("quit-switch", function(event, arg) {
    app.exit(0);
  });
}
