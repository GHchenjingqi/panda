import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import fs from 'fs'

// 阻止F11的默认行为
window.addEventListener('keydown', function(event) {
  if (event.key === 'F11') {
      event.preventDefault(); 
      return false;
  }
}, true);


// Custom APIs for renderer
const api = {
  invoke: (channel, data) => ipcRenderer.invoke(channel, data),
  send: (channel, data) => ipcRenderer.send(channel, data),
  on: (channel, callback) => ipcRenderer.on(channel, callback),
  childOpen: (data)=>{
    ipcRenderer.send('creatChildWinow', data);
  },
  getChildParams:(callback)=>{
    ipcRenderer.on('send-params-to-child', (event, message) => {
      callback(message);
    });
  },
  storage: {
    get: (key, defaultValue) => ipcRenderer.invoke('storage:get', { key, defaultValue }),
    set: (key, value) => ipcRenderer.invoke('storage:set', { key, value }),
    delete: (key) => ipcRenderer.invoke('storage:delete', { key }),
    clear: () => ipcRenderer.invoke('storage:clear'),
    getAll: () => ipcRenderer.invoke('storage:getAll'),
    setMultiple: (items) => ipcRenderer.invoke('storage:setMultiple', items),
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
  window.electron = electronAPI
  window.api = api
}

