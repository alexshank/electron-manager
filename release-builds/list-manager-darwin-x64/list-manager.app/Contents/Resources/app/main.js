// Modules to control application life and create native browser window
const {app, BrowserWindow, Menu, ipcMain} = require('electron')

// my data Manager
let DataManager = require('./classes/DataManager.js');
let dataManager;

// menu template
const mainMenuTemplate =  [
  // Each object is a dropdown
  {
    label: 'File',
    submenu:[
      {
        label:'Open',
        accelerator:process.platform == 'darwin' ? 'Command+o' : 'Ctrl+o',
        click(){
          dataManager.load();
        }
      },
      {
        label:'Save',
        accelerator:process.platform == 'darwin' ? 'Command+s' : 'Ctrl+s',
        click(){
          dataManager.save();
        }
      },
      {
        label:'Save As',
        click(){
          dataManager.saveAs();
        }
      },
      {
        label: 'Quit',
        accelerator:process.platform == 'darwin' ? 'Command+q' : 'Ctrl+q',
        click(){
          app.quit();
        }
      }
    ]
  }
];

// set environment variable ('production' for actual releases, 'dev' otherwise)
process.env.NODE_ENV = 'dev'

// Add developer tools option if in dev
if(process.env.NODE_ENV !== 'production'){
  mainMenuTemplate.push({
    label: 'Developer Tools',
    submenu:[
      {
        role: 'reload'
      },
      {
        label: 'Toggle DevTools',
        accelerator:process.platform == 'darwin' ? 'Command+i' : 'Ctrl+i',
        click(item, focusedWindow){
          focusedWindow.toggleDevTools();
        }
      }
    ]
  });
}

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 850,
    height: 900,

    // fixes issue with "require" not existing on client side
    webPreferences: {
	    nodeIntegration: true
    }
  })

  // and load the index.html of the app.
  mainWindow.loadFile('./index/index.html')

  // Open the developer tools
  if(process.env.NODE_ENV != 'production'){
    mainWindow.webContents.openDevTools()
  }

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  createWindow();

  // add menu to window
  const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
  Menu.setApplicationMenu(mainMenu);

  // create instance of my data manager
  dataManager = new DataManager(mainWindow);
})

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})

// handle data requests
ipcMain.on('data-request', (event, arg) => {
  event.returnValue = dataManager.getSortedItemLists();
})

// handle added sidebar addContentItem
ipcMain.on('sidebar-add', (event, arg) => {
  dataManager.addSidebarItem(arg)
  event.returnValue = 'success'
})

// handle added content item
ipcMain.on('content-add', (event, text, deadline, activeSidebarIndex) => {
  dataManager.addContentItem(text, deadline, activeSidebarIndex)
  event.returnValue = 'success'
})

// handle sidebar item delete
ipcMain.on('sidebar-delete', (event, sidebarIndex) => {
  dataManager.deleteSidebarItem(sidebarIndex)
  event.returnValue = 'success'
})

// handle content item delete
ipcMain.on('content-delete', (event, sidebarIndex, contentIndex) => {
  dataManager.deleteContentItem(sidebarIndex, contentIndex)
  event.returnValue = 'success'
})

// handle sidebar item delete
ipcMain.on('sidebar-top', (event, sidebarIndex) => {
  dataManager.moveSidebarItem(sidebarIndex)
  event.returnValue = 'success'
})

// handle content item delete
ipcMain.on('content-top', (event, sidebarIndex, contentIndex) => {
  dataManager.moveContentItem(sidebarIndex, contentIndex)
  event.returnValue = 'success'
})

// handle content item priority increment
ipcMain.on('priority-increment', (event, sidebarIndex, contentIndex) => {
  dataManager.incrementPriority(sidebarIndex, contentIndex)
  event.returnValue = 'success'
})

// handle content item priority decrement
ipcMain.on('priority-decrement', (event, sidebarIndex, contentIndex) => {
  dataManager.decrementPriority(sidebarIndex, contentIndex)
  event.returnValue = 'success'
})

// handle content item deadline increment
ipcMain.on('deadline-increment', (event, sidebarIndex, contentIndex) => {
  dataManager.incrementDeadline(sidebarIndex, contentIndex)
  event.returnValue = 'success'
})

// handle content item deadline decrement
ipcMain.on('deadline-decrement', (event, sidebarIndex, contentIndex) => {
  dataManager.decrementDeadline(sidebarIndex, contentIndex)
  event.returnValue = 'success'
})

// handle content item deadline decrement
ipcMain.on('update-list-view', (event, sidebarIndex, simpleView) => {
  dataManager.updateListView(sidebarIndex, simpleView)
  event.returnValue = 'success'
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
