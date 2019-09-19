// Modules to control application life and create native browser window
const {
  app,
  BrowserWindow
} = require("electron");
const path = require("path");
const Positioner = require("electron-positioner");
const {
  execFile
} = require("child_process");
const Sentry = require("@sentry/node");





Sentry.init({
  dsn: "https://1607ab9c0f4b4156be881c9ec9be23b5@sentry.io/1540999"
});

// Load saved configurations
const Store = require("electron-store");
const config = new Store({
  projectName: "SwitchDock"
});

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
    // Create the browser window.
    mainWindow = new BrowserWindow({
      width: 70,
      minWidth: 70,
      // width: 450,
      // width: 800,
      height: 600,
      frame: false,
      resizable: false,
      skipTaskbar: true,
      minimizable: false,
      maximizable: false,
      fullscreenable: false,
      alwaysOnTop: true,
      autoHideMenuBar: true,
      transparent: true,
      hasShadow: false,
      show: false,
      darkTheme: true,
      vibrancy: true,
      webPreferences: {
        nodeIntegration: true,
        // devTools: false,
        preload: path.join(__dirname, "preload.js")
      }
    });
    mainWindow.webContents.openDevTools({
      mode: "undocked"
    });

   

    // and load the index.html of the app.
    mainWindow.loadFile("index.html");

    // Open the DevTools.
    // mainWindow.webContents.openDevTools()

    // Emitted when the window is closed.
    mainWindow.on("closed", function () {
      // Dereference the window object, usually you would store windows
      // in an array if your app supports multi windows, this is the time
      // when you should delete the corresponding element.
      mainWindow = null;
    });

    mainWindow.once("ready-to-show", () => {
      if(process.platform == 'win32') 
      {
        const electronVibrancy = require('electron-vibrancy');
        electronVibrancy.SetVibrancy(mainWindow, 7);
      }
      // setup positioner
      const positioner = new Positioner(mainWindow);
      let placement = config.get("config");
      // get placement
      placement = placement == null ? "right" : placement.placement;
      placement == "right" ?
        positioner.move("rightCenter") :
        positioner.move("leftCenter");
      const pos = mainWindow.getPosition();
      placement == "right" ?
        mainWindow.setPosition(pos[0] - 10, pos[1]) :
        mainWindow.setPosition(pos[0] + 10, pos[1]);
      mainWindow.show();
    });


  }

  // SPWAN SWITCH SERVICE
  const devmode = process.argv[2] == "--dev" ? true : false;

  function SPWAN_SWITCH_SERVICE() {
    // spawn the executable approraite for the platform
    const opsys = process.platform;
    if (opsys == "darwin" || opsys == "linux") {
      return execFile(
        devmode ?
        path.join(app.getAppPath(), "/service-binaries/switch") :
        path.join(
          path.dirname(app.getAppPath()),
          "/service-binaries/switch"
        ),
        [],
        (error, stdout, stderr) => {}
      );
    } else if (opsys == "win32" || "win64") {
      return execFile(
        devmode ?
        path.join(app.getAppPath(), "\\service-binaries\\switch") :
        path.join(
          path.dirname(app.getAppPath()),
          "\\service-binaries\\switch"
        ),
        [],
        (error, stdout, stderr) => {}
      );
    }
  }

  let child = SPWAN_SWITCH_SERVICE();
  // on error kill service and respawn
  child.stderr.on("data", data => {
    child.kill();
    // auto spwan..
    child = SPWAN_SWITCH_SERVICE();
  });

  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  app.on("ready", createWindow);

  // Quit when all windows are closed.
  app.on("window-all-closed", function () {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    // kill switch service
    child.kill();
    if (process.platform !== "darwin") app.quit();
  });

  app.on("activate", function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) createWindow();
  });

  // In this file you can include the rest of your app's specific main process
  // code. You can also put them in separate files and require them here.

}