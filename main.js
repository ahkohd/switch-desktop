// Modules to control application life and create native browser window
const {
  app,
  BrowserWindow,
} = require('electron')
const path = require('path')
const Positioner = require('electron-positioner')
const { execFile } = require('child_process');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow
// Make switch only one instance.
const gotTheLock = app.requestSingleInstanceLock()


if (!gotTheLock) {
  app.quit()
} else {

  app.on('second-instance', (event, commandLine, workingDirectory) => {
    // Someone tried to run a second instance, we should focus our window.
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()
    }
  })



  function createWindow() {
    // Create the browser window.
    mainWindow = new BrowserWindow({
      width: 70,
      // width: 400,
      height: 600,
      frame: false,
      resizable: false,
      skipTaskbar: true,
      minimizable: false,
      alwaysOnTop: true,
      autoHideMenuBar: true,
      transparent: true,
      show: false,
      hasShadow: false,
      webPreferences: {
        nodeIntegration: true,
        preload: path.join(__dirname, 'preload.js')
      }
    })

    // and load the index.html of the app.
    mainWindow.loadFile('index.html');


    // Open the DevTools.
    // mainWindow.webContents.openDevTools()

    // Emitted when the window is closed.
    mainWindow.on('closed', function () {
      // Dereference the window object, usually you would store windows
      // in an array if your app supports multi windows, this is the time
      // when you should delete the corresponding element.
      mainWindow = null
    })

    mainWindow.once('ready-to-show', () => {
      const positioner = new Positioner(mainWindow);
      positioner.move('rightCenter');
      const pos = mainWindow.getPosition();
      mainWindow.setPosition(pos[0] - 10, pos[1]);
      mainWindow.show()
    })
  }



  // SPWAN SWITCH SERVICE
  const devmode = (process.argv[2] == "--dev") ? true : false;
  
  function SPWAN_SWITCH_SERVICE() {
    // spawn the executable approraite for the platform
    const opsys = process.platform;
    if (opsys == 'darwin') {
      return execFile((devmode) ? path.join(app.getAppPath(), '/service-binaries/switch-macos') : path.join(path.dirname(app.getAppPath()), '/service-binaries/switch-macos'), [], (error, stdout, stderr) => {});
    } else if (opsys == "win32" || 'win64') {
      return execFile((devmode) ? path.join(app.getAppPath(), '\\service-binaries\\switch-win') : path.join(path.dirname(app.getAppPath()), '\\service-binaries\\switch-win'), [], (error, stdout, stderr) => {});
    } else {
      return execFile((devmode) ? path.join(app.getAppPath(), '/service-binaries/switch-linux') : path.join(path.dirname(app.getAppPath()), '/service-binaries/switch-linux'), [], (error, stdout, stderr) => {});
    }
  }
  
  let child = SPWAN_SWITCH_SERVICE();
  // on error kill service and respawn
  child.stderr.on('data', (data) => {
    child.kill();
    child = SPWAN_SWITCH_SERVICE();
  });


  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  app.on('ready', createWindow)

  // Quit when all windows are closed.
  app.on('window-all-closed', function () {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    // kill switch service
    child.kill();
    if (process.platform !== 'darwin') app.quit()
  })

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) createWindow()
  })

  // In this file you can include the rest of your app's specific main process
  // code. You can also put them in separate files and require them here.

}