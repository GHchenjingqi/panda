// storage.js
import { app , ipcMain} from 'electron'
import fs from 'fs'
import path from 'path'
import { configs } from '../renderer/config.js';

class ElectronStorage {
  constructor(options = {}) {
    const { name = 'storage', encryptionKey } = options
    
    this.filePath = path.join(app.getPath('userData'), `${name}.json`)
    this.encryptionKey = encryptionKey
    this.data = this.load()
  }

  // 加载存储文件
  load() {
    try {
      if (fs.existsSync(this.filePath)) {
        const content = fs.readFileSync(this.filePath, 'utf-8')
        const data = this.encryptionKey 
          ? this.decrypt(content) 
          : JSON.parse(content)
        return data || {}
      }
    } catch (error) {
      console.error('Storage load error:', error)
    }
    return {}
  }

  // 保存到文件
  save() {
    try {
      const content = this.encryptionKey 
        ? this.encrypt(JSON.stringify(this.data))
        : JSON.stringify(this.data, null, 2)
      
      fs.writeFileSync(this.filePath, content, 'utf-8')
    } catch (error) {
      console.error('Storage save error:', error)
    }
  }


  // 简单的加密方法（示例）
  encrypt(text) {
    // 这里应该使用更安全的加密算法
    return Buffer.from(text).toString('base64')
  }

  // 简单的解密方法（示例）
  decrypt(text) {
    try {
      return JSON.parse(Buffer.from(text, 'base64').toString('utf-8'))
    } catch {
      return {}
    }
  }

  // 设置值
  set(key, value) {
    this.data[key] = value
    this.save()
  }

  /**
   * 批量设置多个键值对
   * @param {Object} items 要设置的键值对对象
   */
  setMultiple(items) {
        if (typeof items !== 'object' || items === null) {
            throw new Error('setMultiple 参数必须是一个对象')
        }

        let hasChanges = false
        
        // 只更新有变化的键值
        Object.entries(items).forEach(([key, value]) => {
            if (!(key in this.data) || this.data[key] !== value) {
                this.data[key] = value
                hasChanges = true
            }
        })

        // 只有数据有变化时才保存
        if (hasChanges) {
            this.save()
        }
  }

  // 获取值
  get(key, defaultValue = null) {
    return key in this.data ? this.data[key] : defaultValue
  }

  // 删除值
  delete(key) {
    delete this.data[key]
    this.save()
  }

  // 清空存储
  clear() {
    this.data = {}
    this.save()
  }

  // 获取全部数据
  getAll() {
    // 返回深拷贝以避免外部修改影响内部数据
    return JSON.parse(JSON.stringify(this.data))
  }
}

export const Storage = new ElectronStorage({
    name: 'appConfig',
    encryptionKey: 'electronViteApp' // 可选
})

export function setupStorageIPC() {
  ipcMain.handle('storage:get', (event, { key, defaultValue }) => {
    return Storage.get(key, defaultValue)
  })

  ipcMain.handle('storage:getAll', () => {
    return Storage.getAll()
  })

  ipcMain.handle('storage:set', (event, { key, value }) => {
    Storage.set(key, value)
  })

  ipcMain.handle('storage:delete', (event, { key }) => {
    Storage.delete(key)
  })

  ipcMain.handle('storage:clear', () => {
    Storage.clear()
  })

  ipcMain.handle('storage:setMultiple', (event, items) => {
    Storage.setMultiple(items)
  })
}


// 初始化本地配置
function configInit() {
    const config = configs();
    const { musicPath, warpperPath, windowBG, appBG} = config
    if(!Storage.get('musicPath')) {
        Storage.set('musicPath', musicPath)
    }
    if(!Storage.get('warpperPath')) {
        Storage.set('warpperPath', warpperPath)
    }
    if(!Storage.get('windowBG')) {
        Storage.set('windowBG', windowBG)
    }
    if(!Storage.get('mdPath')) {
      Storage.set('mdPath', windowBG)
  }
    if(!Storage.get('appBG')) {
        Storage.set('appBG', appBG)
    }
}
configInit()


export default Storage