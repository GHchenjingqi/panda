import { app, shell, BrowserWindow, ipcMain, screen, dialog, protocol, Tray, Menu } from 'electron'
import path from 'path'
import fs from 'fs'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import wallpaper from 'wallpaper';
import mime from 'mime-types';
import AutoLaunch from 'auto-launch';
import icon from '../../resources/icon.png?asset'
import { Storage, setupStorageIPC } from './store'
import { fetchBaiduHotSearch } from './news'
import { scanMusic } from './mp3'
import { scanMd } from './mds'
import { readImagesFromDir } from './wrap'
import packageJson from '../../package.json';

// 忽略证书问题导致的异常
app.commandLine.appendSwitch('ignore-certificate-errors')

let mainWindow = null, childWin = null, childWin2 = null, tray = null;
function createWindow() {
  // console.log('electronApp.createWindow: enter')
  // 如果窗口已存在，则聚焦它
  if (mainWindow && !mainWindow.isDestroyed()) {
    // console.log('electronApp.createWindow: is exist')
    mainWindow.show();
    return;
  }
  // console.log('electronApp.createWindow: creat')
  mainWindow = new BrowserWindow({
    width: 1024,
    height: 680,
    title: "Panda",
    show: false,
    frame: false,
    resizable: false,
    transparent: true,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })
  // 应用版本号
  // console.log('app-version:', packageJson.version)
  // mainWindow.webContents.openDevTools(); 
  mainWindow.webContents.on('did-finish-load', () => {
    // mainWindow.webContents.openDevTools();
    mainWindow.webContents.send('app-version', packageJson.version);
  });


  protocol.registerFileProtocol('electron', (request, callback) => {
    // 1. 移除协议头
    let rawPath = request.url.replace(/^electron:\/\//, '')
    let urlPath = decodeURIComponent(rawPath) // 解码 URL 编码部分
    // 如果路径以 C:/ 开头，改为 C:\ 格式
    if (/^[A-Za-z]:[\\\/]/.test(urlPath)) {
      urlPath = urlPath.replace(/\//g, '\\') // 统一为 Windows 路径
    }
    // 确保路径是绝对路径且存在
    try {
      const fullPath = path.resolve(urlPath);
      const mimeType = mime.lookup(fullPath) || 'application/octet-stream';

      // 处理Range请求头
      const rangeHeader = request.headers.Range || request.headers.range;
      if (rangeHeader) {
        const stats = fs.statSync(fullPath);
        const totalSize = stats.size;
        const range = rangeHeader.match(/bytes=(\d+)-(\d*)/);
        const start = parseInt(range[1], 10);
        const end = range[2] ? parseInt(range[2], 10) : totalSize - 1;

        // 确保范围有效
        if (start >= totalSize || end >= totalSize) {
          callback({
            statusCode: 416, // Range Not Satisfiable
            headers: { 'Content-Range': `bytes */${totalSize}` }
          });
          return;
        }

        // 返回206 Partial Content
        callback({
          statusCode: 206,
          headers: {
            'Content-Range': `bytes ${start}-${end}/${totalSize}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': end - start + 1,
            'Content-Type': mimeType
          },
          path: fullPath,
          offset: start,
          length: end - start + 1
        });
      } else {
        // 普通请求返回整个文件
        callback({
          path: fullPath,
          headers: { 'Content-Type': mimeType }
        });
      }
    } catch (e) {
      console.error('无法解析路径:', e)
      callback({ error: -6 }) // ERR_ACCESS_DENIED
    }
  })
  // 注册自定义协议,用于加载本地图片资源 asset://
  protocol.registerFileProtocol('asset', (request, callback) => {
    let urlPath = request.url.replace(/^asset:\/\//, '') // 去掉 asset://
    urlPath = decodeURIComponent(urlPath) // 解码 URL 编码部分

    // 如果路径以 C:/ 开头，改为 C:\ 格式
    if (/^[A-Za-z]:[\\\/]/.test(urlPath)) {
      urlPath = urlPath.replace(/\//g, '\\') // 统一为 Windows 路径
    }

    // 确保路径是绝对路径且存在
    try {
      const fullPath = path.resolve(urlPath)
      callback({ path: fullPath }) // 正确返回路径对象
    } catch (e) {
      console.error('无法解析路径:', e)
      callback({ error: -6 }) // ERR_ACCESS_DENIED
    }
  })

  mainWindow.on('ready-to-show', async () => {
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

// 配置开机启动
function setAutoLaunch(enabled) {
  const autoLauncher = new AutoLaunch({
    name: 'panda-app', // 必须与你的应用名称一致
    path: app.getPath('exe'), // 自动获取应用路径
    isHidden: true // 是否隐藏启动窗口（仅macOS有效）
  });

  // 检查是否已启用自启
  autoLauncher.isEnabled().then(enabled => console.log('AutoLaunch Enabled:', enabled)).catch(err => console.error(err));

  if (enabled) {
    // 禁用自启
    autoLauncher.enable();
  } else {
    // 启用自启
    autoLauncher.disable();
  }
}

async function getImgList() {
  const wrapsrc = Storage.get('warpperPath')
  if (!wrapsrc) return []
  return await readImagesFromDir(wrapsrc)
}

// 图标路径处理函数
function getIconPath() {
  if (import.meta.env.DEV) { // Vite 开发环境
    return path.join(process.cwd(), 'resources/', getPlatformIcon())
  } else { // 生产环境
    return path.join(process.resourcesPath, '', getPlatformIcon())
  }
}

// 获取平台对应图标文件名
function getPlatformIcon() {
  switch (process.platform) {
    case 'win32': return 'icon.ico'
    case 'darwin': return 'icon.icns'
    default: return 'icon.png' // Linux
  }
}

const ipcHandle = () => {
  // 创建MD编辑子窗口
  ipcMain.on('createMdEditWindow', async (event, data) => {
    // 如果窗口已存在且未被销毁，则不再创建
    if (childWin && !childWin.isDestroyed()) {
      childWin.focus(); // 可选：聚焦已有窗口
      return;
    }

    // 获取屏幕大小
    const primaryDisplay = screen.getPrimaryDisplay();
    const { width, height } = primaryDisplay.workAreaSize;

    // 创建新窗口
    childWin = new BrowserWindow({
      width,
      height,
      autoHideMenuBar: true,
      icon: getIconPath(),
      webPreferences: {
        preload: join(__dirname, '../preload/index.js'),
        sandbox: false
      }
    });

    const routepath = "/nmd";

    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
      const url = process.env['ELECTRON_RENDERER_URL'] + `/#${routepath}`;
      childWin.loadURL(url);
    } else {
      childWin.loadFile(path.join(__dirname, '../renderer/index.html'), { hash: routepath });
    }

    // 监听关闭事件，重置 childWin 引用
    childWin.on('closed', () => {
      childWin = null;
    });
  });

  // 创建子窗口
  ipcMain.on('creatChildWinow', (_, data) => {
    if (!childWin || childWin.isDestroyed()) {
      const primaryDisplay = screen.getPrimaryDisplay()
      const { width, height } = primaryDisplay.workAreaSize
      let x = 1024 + (width - 1024) / 2 + 5;
      let y = (height - 680) / 2
      let childWin = new BrowserWindow({
        width: 400,
        height: 680,
        x,
        y,
        autoHideMenuBar: true,
        // 动态加载图标（开发/生产环境兼容）
        icon: getIconPath(),
        webPreferences: {
          preload: join(__dirname, '../preload/index.js'),
          sandbox: false
        }
      })
      const { routepath, md = null, title = null } = data

      if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
        let url = process.env['ELECTRON_RENDERER_URL'] + `/#${routepath}`
        childWin.loadURL(url)
      } else {
        childWin.loadFile(path.join(__dirname, `../renderer/index.html`), { hash: routepath })
      }
      // 发送参数给子窗口
      childWin.webContents.on('did-finish-load', () => {
        childWin.setTitle(title)
        childWin.webContents.send('send-params-to-child', { title, md });
      });
      childWin.on('closed', () => {
        childWin = null;
      });
    }
  })

  // 渲染进程页面1 => 设置菜单动态隐藏 => 父窗口传递至渲染进程页面2
  ipcMain.on('set-menu-md', async (_, flag) => {
    mainWindow.webContents.send('set-menu-flag', flag)
  });
  // 获取图片列表
  ipcMain.handle('get-imgs', async (event, data) => {
    return await getImgList()
  })
  ipcMain.handle('send-path-file', async (event, data) => {
    let result = await dialog.showOpenDialog(mainWindow, { properties: ['openDirectory'], })
    if (result) {
      if (!result.canceled && result.filePaths.length > 0) {
        return result.filePaths[0]
      }
    } else {
      return null
    }
  })
  // 窗口操作
  ipcMain.handle('oper', (event, type) => {
    if (type == 'min') {
      mainWindow.minimize()
    }
    if (type == 'close') {
      // 窗口关闭
      // mainWindow.close()
      // if (BrowserWindow.getAllWindows().length === 0) app.quit()
      mainWindow.hide();
    }
  });
  // 窗口移动
  ipcMain.handle('move', (event, data) => {
    const win = BrowserWindow.getFocusedWindow()
    if (!win) return

    // 添加边界检查，遇到边界不再移动
    const { width, height } = win.getBounds()
    const { workArea } = screen.getPrimaryDisplay()

    const safeX = Math.max(0, Math.min(data.appX, workArea.width - width))
    const safeY = Math.max(0, Math.min(data.appY, workArea.height - height))
    // 设置活动窗口位置
    win.setPosition(safeX, safeY)
  });


  // 设置桌面壁纸
  ipcMain.on('set-wallpaper', async (_, src) => {
    if (!src) return
    // 设置桌面壁纸
    let paths = src.replace(/\\/g, '\\\\')
    await wallpaper.set(paths)
  });

  // 获取新闻
  ipcMain.handle('get-news', async (event, data) => {
    return await fetchBaiduHotSearch()
  })

  // 获取本地音乐
  ipcMain.handle('get-music', async (event, src) => {
    if (!src) return
    return await scanMusic(src)
  })

  // 获取md
  ipcMain.handle('get-md', async (event, data) => {
    try {
      const { filePaths } = await dialog.showOpenDialog({
        properties: ['openFile'],
        filters: [{ name: 'Markdown', extensions: ['md'] }]
      });

      if (filePaths.length > 0) {
        const content = fs.readFileSync(filePaths[0], 'utf-8');
        return {
          path: filePaths[0],
          content
        };
      }
      return null;
    } catch (err) {
      throw err;
    }
  })

  // 保存md文件
  ipcMain.handle('save-md', async (_, data) => {
    const { src, title, text } = data

    const filePath = path.join(src, title);
    // 将文本内容写入文件
    fs.writeFile(filePath, text, (err) => {
      if (err) {
        return console.error('is error:', err);
      }
      // console.log(title + ' is ok');
    });
  });

  // 示例：在某个 IPC 通信中调用
  ipcMain.handle('set-auto-launch', (_, enabled) => {
    setAutoLaunch(enabled)
  })


  ipcMain.handle('readLocalFile', async (event, filePath) => {
    return new Promise((resolve, reject) => {
      fs.readFile(filePath, 'utf-8', (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
  });

  // 获取md列表
  ipcMain.handle('get-md-list', async (event, src) => {
    if (!src) return
    return await scanMd(src)
  })

}

const trayHandle = () => {
  // 创建托盘图标
  tray = new Tray(icon);
  const contextMenu = Menu.buildFromTemplate([
    { label: '显示窗口', click: () => mainWindow.show() },
    { label: '退出', click: () => app.quit() }
  ]);
  tray.setToolTip('我的应用');
  tray.setContextMenu(contextMenu);

  // 监听托盘图标点击
  tray.on('click', () => mainWindow.show());
}



// 单例4.0版
const gotTheLock = app.requestSingleInstanceLock()
if (!gotTheLock) {
  // console.log('myWindow is quit')
  app.quit()
} else {
  // console.log('myWindow is not quit')
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    // 当运行第二个实例时,将会聚焦到myWindow这个窗口
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()
      // console.log('myWindow is focused but not visible')
    }

  })
  // console.log('myWindow is not quit 22')

  // 某些 API 在这个事件发生前不能使用。
  app.whenReady().then(() => {
    // console.log('myWindow is not quit 33')
    electronApp.setAppUserModelId('com.chenxiaozhi.home')
    app.on('browser-window-created', (_, window) => {
      optimizer.watchWindowShortcuts(window)
    })
    setupStorageIPC()
    ipcHandle()
    trayHandle()
    createWindow()
  });

  // 其他应用生命周期事件...
  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('will-quit', () => {
    // 清理托盘图标
    if (tray) {
      tray.destroy();
      tray = null;
    }
  });

  app.on('activate', () => {
    // 在macOS上，当点击Dock图标时，如果没有其他窗口打开，则应该重新创建一个窗口。
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
}
