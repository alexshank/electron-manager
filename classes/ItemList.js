let ListItem = require('./ListItem.js')

module.exports = class ItemList{
  // constructor
  constructor(name, listItem){
    this.name = name;
    this.priority = 3;
    this.deadline = new Date();
    // when new list is created, there's no content items
    if(listItem === null){
      this.listItems = [];
    }else{
      this.listItems = [new ListItem(listItem)];
    }
    this.simpleView = false;
  }

}
