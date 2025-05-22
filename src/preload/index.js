import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'


let keys = {};
document.addEventListener('keydown', function(event) {
    // 阻止F11的默认行为
    if (event.key === 'F11') {
        event.preventDefault(); 
        return false;
    }
    // 记录按键状态
    keys[event.key] = true;

    // 检查是否同时按下了Ctrl和S键
    // if(keys['Control'] && keys['s']) {
    //     event.preventDefault(); // 阻止默认行为
    //     console.log('Ctrl + S 被按下了');
    //     // 在这里执行你想要的操作
    // }
});

document.addEventListener('keyup', function(event) {
    // 更新按键状态
    delete keys[event.key];
});

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
  getVersion:(callback)=>{
    ipcRenderer.on('app-version', (event, message) => {
      console.log('app-version12312:', message);
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

