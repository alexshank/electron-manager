
module.exports = class ListItem{
  // constructor
  constructor(note, deadline){
    this.note = note;
    this.priority = 1;
    this.basicItem = [];

    // handle empty date picker field
    if(deadline != ""){
      this.deadline = new Date(deadline);
    }else{
      this.deadline = new Date();
    }
  }

}
