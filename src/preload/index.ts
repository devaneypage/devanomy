import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

const api = {
  notes: {
    list: (tagId?: string) => ipcRenderer.invoke('notes:list', tagId),
    create: () => ipcRenderer.invoke('notes:create'),
    update: (id: string, title: string, content: string) =>
      ipcRenderer.invoke('notes:update', id, title, content),
    delete: (id: string) => ipcRenderer.invoke('notes:delete', id),
    search: (query: string) => ipcRenderer.invoke('notes:search', query),
    addTag: (noteId: string, tagId: string) =>
      ipcRenderer.invoke('notes:addTag', noteId, tagId),
    removeTag: (noteId: string, tagId: string) =>
      ipcRenderer.invoke('notes:removeTag', noteId, tagId)
  },
  tags: {
    list: () => ipcRenderer.invoke('tags:list'),
    create: (name: string, color: string) =>
      ipcRenderer.invoke('tags:create', name, color),
    delete: (id: string) => ipcRenderer.invoke('tags:delete', id)
  }
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore
  window.electron = electronAPI
  // @ts-ignore
  window.api = api
}
