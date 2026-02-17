const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

// Constants
const WINDOW_CONFIG = {
    width: 413,
    height: 550,
    icon: path.join(__dirname, 'assets/cats/rainbowCat.png'),
    title: 'Kitty Slot',
    frame: false,
    resizable: false,
    autoHideMenuBar: true,
    webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        contextIsolation: false,
        nodeIntegration: true,
        enableRemoteModule: false
    }
};

// Window management
function createWindow() {
    const win = new BrowserWindow(WINDOW_CONFIG);
    
    win.loadFile('index.html');
    win.setMenu(null);
}

// IPC handlers
ipcMain.on('window-minimize', (event) => {
    const win = BrowserWindow.getFocusedWindow();
    if (win) {
        win.minimize();
    }
});

ipcMain.on('window-close', (event) => {
    const win = BrowserWindow.getFocusedWindow();
    if (win) {
        win.close();
    }
});

// app lifecycle
app.whenReady().then(() => {
    createWindow();
    
    // macOS: Re-create window when dock icon is clicked and no windows are open
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

// Quit when all windows are closed (except on macOS)
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});