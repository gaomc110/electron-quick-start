// qiao-electron
var q = require('qiao-electron');
var fs = require('fs');
// version
//var version = require('./package.json').version;
// 获取配置文件的绝对路径（假设在 Electron 项目的根目录下）


// 控制应用生命周期和创建原生浏览器窗口的模组
const { app, protocol, BrowserWindow, Menu, globalShortcut } = require('electron')
const path = require('node:path');
const { Console } = require('console');

const isDevelopment = process.env.NODE_ENV !== 'production'
const configFilePath = path.join(__dirname,'..',  'config.json');
// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } }
])

function createWindow () {
  // 创建浏览器窗口
  const mainWindow = new BrowserWindow({
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
  })

  let splashScreen = new BrowserWindow({
    width: process.env === 'development' ? 800 : 1200, // 初始宽度
    height: 540,
    frame: false,
    transparent: true
  })
  splashScreen.loadFile('public/loading.html')
  splashScreen.show()


  mainWindow.setMenu(null);

   // 隐藏菜单
   createMenu()

   const configData = fs.readFileSync(configFilePath, 'utf-8');
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
  }


  // 显示窗口
  mainWindow.once('ready-to-show', () => {
    splashScreen.destroy()
    mainWindow.show()
  })

  // 页面加载识别或成功处理
  mainWindow.webContents.on('did-finish-load',()=>{
    console.log('finish')
  })

  // 页面加载失败处理
  mainWindow.webContents.on('did-fail-load',()=>{
    console.log('fail')
    // 显示404页面
    mainWindow.loadFile('public/error/404.html')
    // 重新加载页面
    //mainWindow.reload();
  })


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

})

app.on('activate',  () => {
  // 通常在 macOS 上，当点击 dock 中的应用程序图标时，如果没有其他
  // 打开的窗口，那么程序会重新创建一个窗口。
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

// 除了 macOS 外，当所有窗口都被关闭的时候退出程序。 因此，通常对程序和它们在
// 任务栏上的图标来说，应当保持活跃状态，直到用户使用 Cmd + Q 退出。
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

// 在这个文件中，你可以包含应用程序剩余的所有部分的代码，
// 也可以拆分成几个文件，然后用 require 导入。

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
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
}

// 设置菜单栏
function createMenu() {
  // darwin表示macOS，针对macOS的设置
  if (process.platform === 'darwin') {
    const template = [{
      label: 'Electron',
      submenu: [{
        role: 'about'
      }, {
        role: 'quit'
      }]
    }]
    Menu.setApplicationMenu(Menu.buildFromTemplate(template))
  } else {
    // windows及linux系统
    /**
     * 自定义菜单
     */
    const template = [{
      label: '工具',
      submenu: [{
        label: '重新加载',
        accelerator: 'CmdOrCtrl+R',
        click: (item, focusedWindow) => {
          if (focusedWindow) {
            if (focusedWindow.id === 1) {
              BrowserWindow.getAllWindows().forEach(function(mainWin) {
                if (mainWin.id > 1) {
                  mainWin.close()
                }
              })
            }
            focusedWindow.reload()
          }
        }
      }, {
        label: '开发者工具',
        accelerator: 'CommandOrControl+Shift+i',
        click: function(item, focusedWindow) {
          if (focusedWindow) {
            focusedWindow.toggleDevTools()
          }
        }
      }
    ]
    }]
    
    // 将菜单应用到窗口上
    Menu.setApplicationMenu(Menu.buildFromTemplate(template))
  }
}
