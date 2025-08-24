/**
 * Electron Main Process - 夢境の守護者
 * Electronアプリケーションのメインプロセス
 */

const { app, BrowserWindow, Menu, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs');

// 開発モードかどうか
const isDev = process.argv.includes('--dev') || process.env.NODE_ENV === 'development';

// メインウィンドウを保持する変数
let mainWindow;

/**
 * メインウィンドウを作成
 */
function createWindow() {
    // ウィンドウ設定
    const windowOptions = {
        width: 1024,
        height: 768,
        minWidth: 800,
        minHeight: 600,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            enableRemoteModule: false,
            webSecurity: !isDev,
            preload: path.join(__dirname, 'preload.js')
        },
        icon: path.join(__dirname, 'assets/icons/icon.png'),
        title: '夢境の守護者 - Dream Realm Guardians',
        show: false,
        titleBarStyle: 'default',
        frame: true,
        resizable: true,
        maximizable: true,
        minimizable: true,
        closable: true,
        fullscreenable: true,
        autoHideMenuBar: !isDev,
        backgroundColor: '#1a1a2e'
    };

    // メインウィンドウを作成
    mainWindow = new BrowserWindow(windowOptions);

    // HTMLファイルをロード
    mainWindow.loadFile('index.html');

    // ウィンドウが準備完了したら表示
    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
        
        // 開発モードの場合はDevToolsを開く
        if (isDev) {
            mainWindow.webContents.openDevTools();
        }
        
        console.log('🎮 Dream Realm Guardians window created');
    });

    // ウィンドウが閉じられる時の処理
    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    // ウィンドウが閉じられる前の処理
    mainWindow.on('close', async (event) => {
        // ゲームが進行中の場合は確認ダイアログを表示
        const choice = await dialog.showMessageBox(mainWindow, {
            type: 'question',
            buttons: ['終了', 'キャンセル'],
            defaultId: 1,
            title: '夢境の守護者',
            message: 'ゲームを終了しますか？',
            detail: '進行状況は自動的に保存されます。'
        });

        if (choice.response === 1) {
            event.preventDefault();
        }
    });

    // 外部リンクはデフォルトブラウザで開く
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        shell.openExternal(url);
        return { action: 'deny' };
    });

    // セキュリティ: ナビゲーションを制限
    mainWindow.webContents.on('will-navigate', (event, navigationUrl) => {
        const parsedUrl = new URL(navigationUrl);
        
        if (parsedUrl.origin !== `file://`) {
            event.preventDefault();
        }
    });
}

/**
 * アプリケーションメニューを設定
 */
function createApplicationMenu() {
    const template = [
        {
            label: 'ファイル',
            submenu: [
                {
                    label: '新しいゲーム',
                    accelerator: 'CmdOrCtrl+N',
                    click: () => {
                        mainWindow?.webContents.send('menu-action', 'new-game');
                    }
                },
                {
                    label: 'セーブ',
                    accelerator: 'CmdOrCtrl+S',
                    click: () => {
                        mainWindow?.webContents.send('menu-action', 'save-game');
                    }
                },
                {
                    label: 'ロード',
                    accelerator: 'CmdOrCtrl+L',
                    click: () => {
                        mainWindow?.webContents.send('menu-action', 'load-game');
                    }
                },
                { type: 'separator' },
                {
                    label: '設定',
                    accelerator: 'CmdOrCtrl+,',
                    click: () => {
                        mainWindow?.webContents.send('menu-action', 'open-settings');
                    }
                },
                { type: 'separator' },
                {
                    role: 'quit',
                    label: '終了'
                }
            ]
        },
        {
            label: '表示',
            submenu: [
                {
                    label: 'フルスクリーン',
                    accelerator: 'F11',
                    click: () => {
                        if (mainWindow) {
                            mainWindow.setFullScreen(!mainWindow.isFullScreen());
                        }
                    }
                },
                { type: 'separator' },
                { role: 'reload', label: '再読み込み' },
                { role: 'forceReload', label: '強制再読み込み' },
                { role: 'toggleDevTools', label: '開発者ツール' },
                { type: 'separator' },
                { role: 'resetZoom', label: '実際のサイズ' },
                { role: 'zoomIn', label: '拡大' },
                { role: 'zoomOut', label: '縮小' }
            ]
        },
        {
            label: 'ゲーム',
            submenu: [
                {
                    label: 'タイトル画面',
                    click: () => {
                        mainWindow?.webContents.send('menu-action', 'goto-title');
                    }
                },
                {
                    label: 'ゲーム状態を表示',
                    accelerator: 'F12',
                    click: () => {
                        mainWindow?.webContents.send('menu-action', 'show-game-state');
                    }
                }
            ]
        },
        {
            label: 'ヘルプ',
            submenu: [
                {
                    label: '遊び方',
                    click: () => {
                        mainWindow?.webContents.send('menu-action', 'show-help');
                    }
                },
                { type: 'separator' },
                {
                    label: '夢境の守護者について',
                    click: () => {
                        dialog.showMessageBox(mainWindow, {
                            type: 'info',
                            title: '夢境の守護者について',
                            message: '夢境の守護者 v1.0.0',
                            detail: 'ターン制バトルシミュレーション RPG\n\n夢の世界で活動する守護者となり、悪夢に侵食された人々の心を救う物語。\n\n© 2024 Dream Realm Guardians Development Team'
                        });
                    }
                }
            ]
        }
    ];

    // macOSの場合はアプリケーションメニューを調整
    if (process.platform === 'darwin') {
        template.unshift({
            label: app.getName(),
            submenu: [
                { role: 'about', label: 'Dream Realm Guardiansについて' },
                { type: 'separator' },
                { role: 'services', label: 'サービス' },
                { type: 'separator' },
                { role: 'hide', label: 'Dream Realm Guardiansを隠す' },
                { role: 'hideOthers', label: 'ほかを隠す' },
                { role: 'unhide', label: 'すべてを表示' },
                { type: 'separator' },
                { role: 'quit', label: 'Dream Realm Guardiansを終了' }
            ]
        });
    }

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
}

/**
 * アプリケーション起動準備完了
 */
app.whenReady().then(async () => {
    console.log('🚀 Electron app ready');
    
    // ウィンドウを作成
    createWindow();
    
    // メニューを設定
    createApplicationMenu();
    
    // macOSの場合、ドックアイコンがクリックされた時にウィンドウを再作成
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

/**
 * 全ウィンドウが閉じられた時の処理
 */
app.on('window-all-closed', () => {
    // macOS以外では全ウィンドウが閉じられたらアプリを終了
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

/**
 * アプリ終了前の処理
 */
app.on('before-quit', (event) => {
    console.log('📤 Application shutting down...');
});

/**
 * IPC通信ハンドラー
 */

// ファイル保存ダイアログ
ipcMain.handle('show-save-dialog', async () => {
    if (!mainWindow) return null;
    
    const result = await dialog.showSaveDialog(mainWindow, {
        title: 'セーブデータを保存',
        defaultPath: 'dream-guardians-save.json',
        filters: [
            { name: 'セーブデータ', extensions: ['json'] },
            { name: 'すべてのファイル', extensions: ['*'] }
        ]
    });
    
    return result;
});

// ファイル読み込みダイアログ
ipcMain.handle('show-open-dialog', async () => {
    if (!mainWindow) return null;
    
    const result = await dialog.showOpenDialog(mainWindow, {
        title: 'セーブデータを読み込み',
        filters: [
            { name: 'セーブデータ', extensions: ['json'] },
            { name: 'すべてのファイル', extensions: ['*'] }
        ],
        properties: ['openFile']
    });
    
    return result;
});

// ファイル読み書き
ipcMain.handle('read-file', async (event, filePath) => {
    try {
        const data = fs.readFileSync(filePath, 'utf8');
        return { success: true, data };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('write-file', async (event, filePath, data) => {
    try {
        fs.writeFileSync(filePath, data, 'utf8');
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

// アプリ情報取得
ipcMain.handle('get-app-info', () => {
    return {
        name: app.getName(),
        version: app.getVersion(),
        path: app.getAppPath(),
        userDataPath: app.getPath('userData'),
        platform: process.platform
    };
});

// ウィンドウ制御
ipcMain.handle('window-minimize', () => {
    mainWindow?.minimize();
});

ipcMain.handle('window-maximize', () => {
    if (mainWindow?.isMaximized()) {
        mainWindow.restore();
    } else {
        mainWindow?.maximize();
    }
});

ipcMain.handle('window-close', () => {
    mainWindow?.close();
});

// 開発モードでのホットリロード対応
if (isDev) {
    try {
        require('electron-reload')(__dirname, {
            electron: require(`${__dirname}/node_modules/electron/dist/electron`),
            hardResetMethod: 'exit'
        });
    } catch (error) {
        console.log('Hot reload not available');
    }
}

console.log(`🎮 Dream Realm Guardians Electron main process loaded (dev: ${isDev})`);