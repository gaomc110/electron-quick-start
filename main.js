
// 控制应用生命周期和创建原生浏览器窗口的模组
const { app, protocol, BrowserWindow, Menu, globalShortcut, dialog,ipcMain } = require('electron');
const { autoUpdater } = require("electron-updater");
const path = require('node:path');
const { Console } = require('console');
// qiao-electron
var q = require('qiao-electron');
var fs = require('fs');

const isPackaged = app.isPackaged;

const MultiWindows = require('./window/index')
// version
//var version = require('./package.json').version;
// 获取配置文件的绝对路径（假设在 Electron 项目的根目录下）

//const isDevelopment = process.env.NODE_ENV !== 'production'
//const configFilePath = path.join(__dirname,'..',  'config.json');
// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } }
])

function createWindow () {
  // 创建浏览器窗口
  /*const mainWindow = new BrowserWindow({
    backgroundColor: '#2e2c29',
    width: process.env === 'development' ? 800 : 1200, // 初始宽度
    height: 540,
    minWidth: 960,
    minHeight: 540,
    center: true, // 是否居中
    frame: true, // 设置为false 时可以创建一个无边框窗口 默认值为true
    //窗口是否置顶
    alwaysOnTop:false,
    //窗口大小是否可以调整
    resizable: true,
    //窗口图标
    icon: path.join(__dirname, './icon/logo.ico'),
    show: false,
    webPreferences: { // 解决跨域问题
      //开启调试
      //devTools: false,
      webSecurity: false, //是否禁用同源策略
      //是否启动node
      nodeIntegration: true,
      //是否在独立 JavaScript 环境中运行 Electron API和指定的preload 脚本
      contextIsolation: false,
      //preload: path.join(__dirname, 'preload.js')
    }
  })*/

  let mainWindow = new MultiWindows()

  mainWindow.createWin({isMainWin: true})
  mainWindow.ipcMainListen()

  

   /*const configData = fs.readFileSync(configFilePath, 'utf-8');
   const config = JSON.parse(configData);

   console.log('config',config)
  if (app.isPackaged){
    mainWindow.loadURL(config.baseUrl || `http://192.168.0.187:8088`)
    //mainWindow.loadFile('public/index.html')
    //mainWindow.loadURL(`file://${path.join(__dirname,'../dist/index.html')}`)
  } else {
    //mainWindow.loadFile('public/index.html')
    mainWindow.loadURL(config.baseUrl || `http://192.168.0.187:8088`)
    //mainWindow.webContents.openDevTools()
  }*/


  // 显示窗口
  /*mainWindow.once('ready-to-show', () => {
    splashScreen.destroy()
    mainWindow.show()
  })*/

  // 页面加载识别或成功处理
  /*mainWindow.webContents.on('did-finish-load',()=>{
    console.log('finish')
  })*/

  // 页面加载失败处理
  /*mainWindow.webContents.on('did-fail-load',()=>{
    console.log('fail')
    // 显示404页面
    mainWindow.loadFile('public/error/404.html')
    // 重新加载页面
    //mainWindow.reload();
  })*/

   // 自动更新
   function handleUpdate() {
    // 更新地址
    const updateURL = "https://download.csdn.net/download/github_38400706/89492645";
    // 设置是否自动下载，默认是true,当点击检测到新版本时，会自动下载安装包，所以设置为false
    autoUpdater.autoDownload = false;
    // 如果安装包下载好了，那么当应用退出后是否自动安装更新
    autoUpdater.autoInstallOnAppQuit = true;
    // 是否接受开发版，测试版之类的版本号
    autoUpdater.allowPrerelease = false;
    // 是否可以回退版本，比如从开发版降到旧的稳定版
    autoUpdater.allowDowngrade = false;
    autoUpdater.setFeedURL(updateURL);
    autoUpdater.on("error", function (error) {
      // 检查更新出错
    });
    autoUpdater.on("checking-for-update", function () {
      // 检查中
    });
    autoUpdater.on("update-not-available", function (info) {
      // 已经是最新版
    });
    autoUpdater.on("update-available", function (info) {
      // 检测到新版本
      dialog.showMessageBox(mainWindow, {
          type: "info",
          title: "更新提示",
          defaultId: 0,
          cancelId: 1,
          message: "检测到新版本，是否立即更新？",
          buttons: ["确定", "取消"],
        })
        .then((res) => {
          if (res.response === 0) {
            // 执行下载安装包
            autoUpdater.downloadUpdate();
          }
        });
    });
    autoUpdater.on("download-progress", function (progress) {
      // 下载进度
    });
    autoUpdater.on("update-downloaded", function (info) {
      // 新安装包下载完成
      dialog.showMessageBox(mainWindow, {
          type: "info",
          title: "更新提示",
          defaultId: 0,
          cancelId: 1,
          message: "新版本下载完成，是否立即安装？",
          buttons: ["确定", "取消"],
        })
        .then((res) => {
          if (res.response === 0) {
            // 退出应用并安装更新
            autoUpdater.quitAndInstall();
            mainWindow.destroy();
          }
        });
    });

    // 执行自动更新检查
    autoUpdater.checkForUpdates();
  }

  if (isPackaged) {
    //handleUpdate();
  }


  // 打开开发工具
  /*globalShortcut.register('CommandOrControl+Shift+i', function() {
    mainWindow.webContents.openDevTools()
  });*/
}

// 这段程序将会在 Electron 结束初始化
// 和创建浏览器窗口的时候调用
// 部分 API 在 ready 事件触发后才能使用。
app.whenReady().then(() => {
  // set application menu
  //q.setApplicationMenu();

  // set about version
  //q.setAboutVersion(version);
  // 忽略认证异常，如ssl证书验证
  app.commandLine.appendSwitch('ignore-certificate-errors')
  // create window
  createWindow()

  app.on('activate',  () => {
    // 通常在 macOS 上，当点击 dock 中的应用程序图标时，如果没有其他
    // 打开的窗口，那么程序会重新创建一个窗口。
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// 除了 macOS 外，当所有窗口都被关闭的时候退出程序。 因此，通常对程序和它们在
// 任务栏上的图标来说，应当保持活跃状态，直到用户使用 Cmd + Q 退出。
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

ipcMain.on('win-create', (event, args) => this.createWin(args))

// 在这个文件中，你可以包含应用程序剩余的所有部分的代码，
// 也可以拆分成几个文件，然后用 require 导入。

// Exit cleanly on request from parent process in development mode.
/*if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', (data) => {
      if (data === 'graceful-exit') {
        app.quit()
      }
    })
  } else {
    process.on('SIGTERM', () => {
      app.quit()
    })
  }
}*/


