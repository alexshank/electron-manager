const {dialog} = require('electron')
const fs = require('fs')

let ItemList = require('./ItemList.js')
let ListItem = require('./ListItem.js')

module.exports = class DataManager {

  // constructor
  constructor(mainWindow){
    this.mainWindow = mainWindow;

    // check if a specific save exists
    let that = this;  // need to keep this context for use in callback

    // get load file path based on operating system
    let savePath = '';
    if(process.platform === "win32"){
        savePath = 'E:/MASTER/list.txt';
    }else if(process.platform === 'linux'){
	savePath = '/mnt/e/MASTER/list.txt';
    }

    fs.readFile(savePath, 'utf-8', (err, data) => {
      if(err){
        this.itemLists = [];
        console.log("No default file present: " + err.message)
        return
      }else{
        // convert JSON string to object and add to data manager
        that.itemLists = JSON.parse(data)
        // tell renderer to draw screen
        that.mainWindow.webContents.send('draw', that.data)
      }
    });
  }

  // TODO when setting data, MAYBE convert date strings to Date objects
  sortContentItemsByDate(){
    this.itemLists.forEach((list) => {
        list.listItems.sort((a, b) => {
          // this is actually crazy
          //return b.priority - a.priority || new Date(a.deadline) - new Date(b.deadline)
          return new Date(a.deadline) - new Date(b.deadline);
        });
    });
  }

  getSortedItemLists(){
    this.sortContentItemsByDate();
    return this.itemLists;
  }

  // get data from file and store in this class
  load(){
    const that = this // need to keep the context for the callback functions
    dialog.showOpenDialog(function (fileNames) {
      // fileNames is an array that contains all the selected
      if(fileNames === undefined) {
        console.log("No file selected");
      } else {
        fs.readFile(fileNames[0], 'utf-8', (err, data) => {
          if(err){
            alert("An error ocurred reading the file: " + err.message)
            return
          }
          // convert JSON string to object and store in this data manager
          that.itemLists = JSON.parse(data)
          // tell renderer to draw screen
          that.mainWindow.webContents.send('draw', that.data)
        });
      }
    });
  }

  // save class's data to file
  save(){
    const fs = require('fs')
    const {app} = require('electron')
    let fileName = app.getPath('desktop') + '\\list.txt';
    fs.writeFile(fileName, JSON.stringify(this.itemLists), (err) => {
      if(err){
        console.log("An error ocurred creating the file " + err.message)
      }else{
        console.log("The file has been succesfully saved");
      }
    });
  }

  // save class's data to file
  saveAs(){
    const {dialog} = require('electron')
    const fs = require('fs')
    // You can obviously give a direct path without using the dialog (C:/Program Files/path/myfileexample.txt)
    dialog.showSaveDialog((fileName) => {
        // user didn't select a file
        if (fileName === undefined){
            console.log("You didn't save the file");
            return;
        }

        // make sure file isn't overwritten with null
        if(this.itemLists === null){
          console.log('Error: No data to save.')
          return;
        }

        // fileName is a string that contains the path and filename created in the save file dialog.
        fs.writeFile(fileName, JSON.stringify(this.itemLists), (err) => {
            if(err){
              console.log("An error ocurred creating the file " + err.message)
            }else{
              console.log("The file has been succesfully saved");
            }
        });
    });
  }

  // create a new list
  addSidebarItem(listName){
    let il = new ItemList(listName, null);
    this.itemLists.push(il);
  }

  // add an item to a list
  addContentItem(listItem, deadline, activeSidebarIndex){
    if(this.itemLists.length < 1){
      let il = new ItemList('default', new ListItem(listItem));
      this.itemLists.push(il);
    }else{
      // TODO pass in the selected list so that items can
      // be added to lists other than the first
      this.itemLists[activeSidebarIndex].listItems.push(new ListItem(listItem, deadline));
    }
  }

  // delete a sidebar item and all of its contents
  deleteSidebarItem(sidebarIndex){
      this.itemLists.splice(sidebarIndex, 1);
  }

  // delete content item
  deleteContentItem(sidebarIndex, contentIndex){
    this.itemLists[sidebarIndex].listItems.splice(contentIndex, 1);
  }

  // move a sidebar list to the top
  moveSidebarItem(sidebarIndex){
      let movingList = this.itemLists.splice(sidebarIndex, 1);
      this.itemLists.unshift(movingList[0]);
  }

  // increment a content item's priority
  incrementPriority(sidebarIndex, contentIndex){
    this.itemLists[sidebarIndex].listItems[contentIndex].priority++;
  }

  // decrement a content item's priority
  decrementPriority(sidebarIndex, contentIndex){
    this.itemLists[sidebarIndex].listItems[contentIndex].priority--;
  }

  // increment a content item's deadline
  incrementDeadline(sidebarIndex, contentIndex){
    let deadline = new Date(this.itemLists[sidebarIndex].listItems[contentIndex].deadline)
    deadline.setDate(deadline.getDate() + 1)
    this.itemLists[sidebarIndex].listItems[contentIndex].deadline = deadline;
  }

  // decrement a content item's deadline
  decrementDeadline(sidebarIndex, contentIndex){
    let deadline = new Date(this.itemLists[sidebarIndex].listItems[contentIndex].deadline)
    deadline.setDate(deadline.getDate() - 1)
    this.itemLists[sidebarIndex].listItems[contentIndex].deadline = deadline;
  }

  // update a lists default view (simple of detailed)
  updateListView(sidebarIndex, simpleView){
    this.itemLists[sidebarIndex].simpleView = simpleView;
  }
}
