/**
 * 封装多窗口管理器
 * @author YXY  Q：282310962
 */

 const { app, protocol, BrowserWindow, Menu, globalShortcut, dialog,ipcMain } = require('electron');
 //const { join } = require('path')
 const path = require('node:path');
 var fs = require('fs');
 //process.env.ROOT = join(__dirname, '../../')
 
 const isDevelopment = process.env.NODE_ENV == 'development'

 const configFilePath = path.join(__dirname,'../..',  'config.json');
 const configData = fs.readFileSync(configFilePath, 'utf-8');
 const config = JSON.parse(configData);
 // const winURL = isDevelopment ? 'http://localhost:3000/' : join(__dirname, 'dist/index.html')
 //const winURL = isDevelopment ? process.env.VITE_DEV_SERVER_URL : join(process.env.ROOT, 'dist/index.html')
 const winURL = isDevelopment ? config.baseUrl : `http://192.168.0.187:8088`
 
 // 配置参数
 const defaultConfig = {
     id: null,               // 窗口唯一id
     background: '#fff',     // 背景色
     route: '',              // 路由地址url
     title: '',              // 标题
     data: null,             // 传入数据参数
     width: '',              // 窗口宽度
     height: '',             // 窗口高度
     minWidth: '',           // 窗口最小宽度
     minHeight: '',          // 窗口最小高度
     x: '',                  // 窗口相对于屏幕左侧坐标
     y: '',                  // 窗口相对于屏幕顶端坐标
     resize: true,           // 是否支持缩放
     maximize: false,        // 最大化窗口
     isMultiWin: false,      // 是否支持多开窗口
     isMainWin: false,       // 是否主窗口
     parent: '',             // 父窗口（需传入父窗口id）
     modal: false,           // 模态窗口（模态窗口是浮于父窗口上，禁用父窗口）
     alwaysOnTop: false      // 置顶窗口
 }
 
 class MultiWindows {
     constructor() {
         // 主窗口
         this.mainWin = null
         // 窗口组
         this.winLs = {}
 
         // ...
     }
 
     winOpts() {
         return {
             // 窗口图标
             icon: path.join(__dirname, './icon/logo.ico'),
             backgroundColor: '#2e2c29',
             //autoHideMenuBar: true,
             //titleBarStyle: 'hidden',
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
            show: false,
             webPreferences: {
                //开启调试
                //devTools: false,
                webSecurity: false, //是否禁用同源策略
                //是否启动node
                nodeIntegration: true,
                //是否在独立 JavaScript 环境中运行 Electron API和指定的preload 脚本
                 contextIsolation: true, // 启用上下文隔离(为了安全性)（默认true）
                 // nodeIntegration: false, // 启用Node集成（默认false）
                 //preload: join(process.env.ROOT, 'resource/preload.js'),
                 // devTools: true,
                 // webSecurity: false
             }
         }
     }
 
     // 创建新窗口
     createWin(options) {
         const args = Object.assign({}, defaultConfig, options)
        // console.log(args)
 
         // 判断窗口是否存在
         for(let i in this.winLs) {
             if(this.getWin(i) && this.winLs[i].route === args.route && !this.winLs[i].isMultiWin) {
                 this.getWin(i).focus()
                 return
             }
         }
 
         let opt = this.winOpts()
         if(args.parent) {
             opt.parent = this.getWin(args.parent)
         }
 
         if(typeof args.modal === 'boolean') opt.modal = args.modal
         if(typeof args.resize === 'boolean') opt.resizable = args.resize
         if(typeof args.alwaysOnTop === 'boolean') opt.alwaysOnTop = args.alwaysOnTop
         if(args.background) opt.backgroundColor = args.background
         if(args.width) opt.width = args.width
         if(args.height) opt.height = args.height
         if(args.minWidth) opt.minWidth = args.minWidth
         if(args.minHeight) opt.minHeight = args.minHeight
         if(args.x) opt.x = args.x
         if(args.y) opt.y = args.y
 
         //console.log(opt)
 
         // 创建窗口对象
         let win = new BrowserWindow(opt)
         // 是否最大化
         if(args.maximize && args.resize) {
             win.maximize()
         }
         this.winLs[win.id] = {
             route: args.route, isMultiWin: args.isMultiWin
         }
         args.id = win.id
 
 
         // 加载页面
         let $url
         if(!args.route) {
             /*if(process.env.VITE_DEV_SERVER_URL) {
                 // 打开开发者调试工具
                 // win.webContents.openDevTools()
     
                 $url = process.env.VITE_DEV_SERVER_URL
             }else {
                 $url = winURL
             }*/
             $url = winURL
         }else {
             $url = `${args.route}`
         }
        
         win.loadURL($url)
         /*if(process.env.VITE_DEV_SERVER_URL) {
             win.loadURL($url)
         }else {
             win.loadFile($url)
         }*/
         //win.webContents.openDevTools()

         let splashScreen = new BrowserWindow({
            width: process.env === 'development' ? 800 : 1200, // 初始宽度
            height: 540,
            frame: false,
            transparent: true
          })
          splashScreen.loadFile('../public/loading.html')
          splashScreen.show()
        
        
          win.setMenu(null);
        
           // 隐藏菜单
           createMenu()
 
         win.once('ready-to-show', () => {
            splashScreen.destroy()
             win.show()
         })
 
         win.on('close', () => win.setOpacity(0))
 
         // 初始化渲染进程- 页面加载识别或成功处理
         win.webContents.on('did-finish-load', () => {
             // win.webContents.send('win-loaded', '加载完成~！')
             win.webContents.send('win-loaded', args)
         })

         win.webContents.on('did-fail-load',()=>{
            console.log('fail')
            // 显示404页面
            win.loadFile('../public/error/404.html')
            // 重新加载页面
            //win.reload();
          })
     }
 
     // 获取窗口
     getWin(id) {
         return BrowserWindow.fromId(Number(id))
     }
 
     // 获取全部窗口
     getAllWin() {
         return BrowserWindow.getAllWindows()
     }
 
     // 关闭全部窗口
     closeAllWin() {
         try {
             for(let i in this.winLs) {
                 if(this.getWin(i)) {
                     this.getWin(i).close()
                 }else {
                     app.quit()
                 }
             }
         } catch (error) {
             console.log(error)
         }
     }
 
     // 开启主进程监听
     ipcMainListen() {
         // 设置标题
         ipcMain.on('set-title', (e, data) => {
             const webContents = e.sender
             const wins = BrowserWindow.fromWebContents(webContents)
             wins.setTitle(data)
         })
         // 是否最大化
         ipcMain.handle('isMaximized', (e) => {
             const win = BrowserWindow.getFocusedWindow()
             return win.isMaximized()
         })
 
         ipcMain.on('min', e => {
             const win = BrowserWindow.getFocusedWindow()
             win.minimize()
         })
         ipcMain.handle('max2min', e => {
             const win = BrowserWindow.getFocusedWindow()
             if(win.isMaximized()) {
                 win.unmaximize()
                 return false
             }else {
                 win.maximize()
                 return true
             }
         })
         ipcMain.on('close', (e, data) => {
             // const wins = BrowserWindow.getFocusedWindow()
             // wins.close()
             this.closeAllWin()
         })
 
         // ...
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
    },{
        label: '各系统平台',
        submenu: [{
            label: '大病理',
            accelerator: '',
            click: function(item, focusedWindow) {
                //window.electronAPI.send('win-create', args)
                // let posX = window.screen.availWidth - 850
                //let posY = window.screen.availHeight - 600
                let window = new MultiWindows()
                window.createWin({
                    title: '大病理',
                    route: 'http://192.168.0.187:8087',
                    width: process.env === 'development' ? 800 : 1200, // 初始宽度
                    height: 540,
                    x: 300,
                    y: 300,
                    background: '#2e2c29',
                    resize: true,
                    isMultiWin: true,
                    maximize: false
                })
            }
        },{
            label: '江苏省肿瘤',
            accelerator: '',
            click: function(item, focusedWindow) {
                //window.electronAPI.send('win-create', args)
                // let posX = window.screen.availWidth - 850
                //let posY = window.screen.availHeight - 600
                let window = new MultiWindows()
                window.createWin({
                    title: '江苏省肿瘤',
                    route: 'http://192.168.0.187:8084',
                    width: process.env === 'development' ? 800 : 1200, // 初始宽度
                    height: 540,
                    x: 300,
                    y: 300,
                    background: '#2e2c29',
                    resize: true,
                    isMultiWin: true,
                    maximize: false
                })
            }
        }]
    }]
    
    // 将菜单应用到窗口上
    Menu.setApplicationMenu(Menu.buildFromTemplate(template))
    }
 }

 
 module.exports = MultiWindows
 