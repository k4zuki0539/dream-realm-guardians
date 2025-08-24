/**
 * Electron Preload Script - 夢境の守護者
 * レンダラープロセスとメインプロセス間の安全な通信
 */

const { contextBridge, ipcRenderer } = require('electron');

// セキュアなAPIをレンダラープロセスに公開
contextBridge.exposeInMainWorld('electronAPI', {
    // ファイルダイアログ
    showSaveDialog: () => ipcRenderer.invoke('show-save-dialog'),
    showOpenDialog: () => ipcRenderer.invoke('show-open-dialog'),
    
    // ファイル読み書き
    readFile: (filePath) => ipcRenderer.invoke('read-file', filePath),
    writeFile: (filePath, data) => ipcRenderer.invoke('write-file', filePath, data),
    
    // アプリ情報
    getAppInfo: () => ipcRenderer.invoke('get-app-info'),
    
    // ウィンドウ制御
    minimizeWindow: () => ipcRenderer.invoke('window-minimize'),
    maximizeWindow: () => ipcRenderer.invoke('window-maximize'),
    closeWindow: () => ipcRenderer.invoke('window-close'),
    
    // メニューアクションの受信
    onMenuAction: (callback) => {
        ipcRenderer.on('menu-action', (event, action) => callback(action));
    },
    
    // メニューアクションリスナーの削除
    removeAllListeners: (channel) => {
        ipcRenderer.removeAllListeners(channel);
    }
});

// 開発モードの場合はコンソールログを有効にする
if (process.env.NODE_ENV === 'development') {
    contextBridge.exposeInMainWorld('electronDev', {
        log: (...args) => console.log('[Preload]', ...args),
        error: (...args) => console.error('[Preload]', ...args)
    });
}

console.log('🔗 Electron preload script loaded');