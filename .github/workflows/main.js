const { app, BrowserWindow, ipcMain, Tray, Menu } = require("electron");
const path = require("path");
const fs = require("fs");

let mainWindow;
let tray = null;

function createWindow() {// ... inside app.whenReady() ...
  createWindow();
  createTray();

  // [NEW] Grant permissions for Web Serial API
  mainWindow.webContents.session.setPermissionCheckHandler((webContents, permission, requestingOrigin, details) => {
    if (permission === 'serial') return true;
    return false;
  });

  mainWindow.webContents.session.setDevicePermissionHandler((details) => {
    if (details.deviceType === 'serial') return true;
    return false;
  });

  // [NEW] Auto-select the first available Serial Port (Simple Mode)
  mainWindow.webContents.session.on('select-serial-port', (event, portList, webContents, callback) => {
    event.preventDefault();
    if (portList && portList.length > 0) {
      callback(portList[0].portId); // Selects the first device found (usually the ESP)
    } else {
      callback(''); // No device found
    }
  });
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1000,
    minHeight: 700,
    backgroundColor: "#0d0f10",
    title: "Hydrogen Furnace Monitor",
    // Icon path logic
    icon: fs.existsSync(path.join(__dirname, 'asset/images/logo-64.png')) 
          ? path.join(__dirname, 'asset/images/logo-64.png') 
          : path.join(__dirname, 'logo-64.png'),
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  });

  // Load index.html
  const rendererIndex = path.join(__dirname, "renderer/index.html");
  mainWindow.loadFile(rendererIndex);

  mainWindow.setMenuBarVisibility(false);

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

function createTray() {
  const iconPath = path.join(__dirname, 'asset/images/logo-64.png');
  if (fs.existsSync(iconPath)) {
      tray = new Tray(iconPath);
      tray.setToolTip('Hydrogen Furnace Monitor');
      const contextMenu = Menu.buildFromTemplate([
        { label: 'Show App', click: () => mainWindow.show() },
        { label: 'Quit', click: () => app.quit() }
      ]);
      tray.setContextMenu(contextMenu);
      tray.on('click', () => {
        mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
      });
  }
}

app.whenReady().then(() => {
  createWindow();
  createTray();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

// --- IPC HANDLERS ---

ipcMain.handle("app:get-version", () => {
  return app.getVersion();
});

// FIXED: Robust File Loader
ipcMain.handle("app:load-html", async (event, fileName) => {
  try {
    // Construct path: Root/renderer/fileName
    const filePath = path.join(__dirname, "renderer", fileName);
    
    console.log(`[Main] Loading file: ${filePath}`); // Debug log

    if (fs.existsSync(filePath)) {
        return fs.readFileSync(filePath, "utf8");
    } else {
        console.error(`[Main] File NOT FOUND at: ${filePath}`);
        throw new Error("File not found");
    }
  } catch (error) {
    console.error(`[Main] Error loading ${fileName}:`, error);
    return `<div style="color:red; padding:20px;">
              <h2>Error Loading Page</h2>
              <p>Could not find: <b>${fileName}</b></p>
              <p> looked in: <i>renderer/${fileName}</i></p>
            </div>`;
  }
});