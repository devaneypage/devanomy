import { app, BrowserWindow, ipcMain, shell } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { getStore } from './store'

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 800,
    minHeight: 600,
    show: false,
    autoHideMenuBar: true,
    backgroundColor: '#1c1c1e',
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.devanomy.app')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  setupIpcHandlers()
  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

function setupIpcHandlers(): void {
  const store = getStore()

  // Notes
  ipcMain.handle('notes:list', (_event, tagId?: string) => {
    return store.getNotes(tagId)
  })

  ipcMain.handle('notes:create', () => {
    return store.createNote()
  })

  ipcMain.handle('notes:update', (_event, id: string, title: string, content: string) => {
    return store.updateNote(id, title, content)
  })

  ipcMain.handle('notes:delete', (_event, id: string) => {
    store.deleteNote(id)
  })

  ipcMain.handle('notes:search', (_event, query: string) => {
    return store.searchNotes(query)
  })

  ipcMain.handle('notes:addTag', (_event, noteId: string, tagId: string) => {
    return store.addTagToNote(noteId, tagId)
  })

  ipcMain.handle('notes:removeTag', (_event, noteId: string, tagId: string) => {
    return store.removeTagFromNote(noteId, tagId)
  })

  // Tags
  ipcMain.handle('tags:list', () => {
    return store.getTags()
  })

  ipcMain.handle('tags:create', (_event, name: string, color: string) => {
    return store.createTag(name, color)
  })

  ipcMain.handle('tags:delete', (_event, id: string) => {
    store.deleteTag(id)
  })
}
