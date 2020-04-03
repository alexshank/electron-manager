// electron requires
const electron = require('electron');
const {ipcRenderer, BrowserWindow} = electron;

// day array
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thur", "Fri", "Sat"];

/****************************************************
 * intialization
 ***************************************************/
// on refresh, display whatever data is in the data manager
window.onload = function(){
  // TODO bad practice
  let data = getScreenData()
  if(data != null && data != undefined && data.length != 0){
    drawScreen(data, 0)
  }

  // set date picker to current date
  setInitialDeadlineValue();
}

// add event listeners to sidebar input
let sidebarInput = document.getElementById('sidebar-input');
sidebarInput.addEventListener("keyup", function(event) {
    event.preventDefault();
    let sidebarText = sidebarInput.value
    if (event.keyCode === 13 && sidebarText != '') {
      addSidebarItem(sidebarText);
      drawScreen(null, -1);  // pass -1 to use last sidebar list index
      sidebarInput.value = '';
    }
});

// add event listener to content input
let contentInput = document.getElementById('content-input');
contentInput.addEventListener("keyup", function(event) {
    event.preventDefault();
    if (event.keyCode === 13) {
      getContentItemValues();
    }
});

// add event listener to deadline input
let deadlineInput = document.getElementById('deadline-input');
deadlineInput.addEventListener("keyup", function(event) {
    event.preventDefault();
    if (event.keyCode === 13) {
      getContentItemValues();
    }
});


// catch when screen should be drawn
ipcRenderer.on('draw', function(e, data){
    drawScreen(data, 0);
});

/****************************************************
 * functions
 ***************************************************/
// set date picker initial value
function setInitialDeadlineValue(){
  let date = new Date();
  let year = date.getFullYear();
  let month = (date.getMonth() + 1).toString().padStart(2, 0);
  let day = date.getDate().toString().padStart(2, 0);
  let initialDate = year + '-' + month + '-' + day;
  document.getElementById('deadline-input').value = initialDate;
}

// content item is added from bottom of page
function getContentItemValues(){
    // check that content item is not empty
    let contentText = document.getElementById('content-input').value;
    if(contentText.length > 0){
      // get additional content item details
      let activeSidebarIndex = getActiveSidebarIndex();
      let contentDeadline = document.getElementById('deadline-input').value;

      // add content item to data manager
      addContentItem(contentText, contentDeadline, activeSidebarIndex);

      // redraw screen
      drawScreen(null, activeSidebarIndex);
      contentInput.value = '';
    }
}




// sidebar item is clicked on
function sidebarItemClicked(clickedElement){
  let sidebarIndex = clickedElement.dataset.sidebarIndex;
  showActiveSidebarContent(sidebarIndex);
}

function showActiveSidebarContent(sidebarIndex){
  // clear old active sidebar item
  let sidebarItems = document.getElementsByClassName('sidebarItem');
  Array.from(sidebarItems).forEach(function(element){
    element.classList.remove('list-group-item-primary');
  })

  // set new active sidebar item
  let newActiveSidebarItem = document.querySelector('[data-sidebar-index="' + sidebarIndex + '"]');
  newActiveSidebarItem.classList.add('list-group-item-primary');

  // show new sidebar item's content
  drawContent(null, sidebarIndex);
}

// delete sidebar list
function sidebarItemDoubleClicked(doubleClickedElement){
  ipcRenderer.sendSync('sidebar-delete', doubleClickedElement.dataset.sidebarIndex)
  drawScreen(null, 0);
}

// delete list item
function contentItemDoubleClicked(doubleClickedElement){
  ipcRenderer.sendSync('content-delete', doubleClickedElement.dataset.sidebarIndex, doubleClickedElement.dataset.contentIndex)
  drawScreen(null, getActiveSidebarIndex());
}

// move sidebar item to top
function sidebarItemRightClicked(rightClickedElement){
  ipcRenderer.sendSync('sidebar-top', rightClickedElement.dataset.sidebarIndex)
  drawScreen(null, 0);
}

// when a new list is created
function addSidebarItem(text){
  ipcRenderer.sendSync('sidebar-add', text)
}

// when an item is added to a list
function addContentItem(text, deadline, activeSidebarIndex){
  ipcRenderer.sendSync('content-add', text, deadline, activeSidebarIndex)
}

// get data from the main process
function getScreenData(){
  return ipcRenderer.sendSync('data-request')
}

// return the index of the selected sidebar item
function getActiveSidebarIndex(){
  let sidebarItem = document.querySelector('.list-group-item-primary');
  let index;
  if(sidebarItem === null || sidebarItem === undefined){
    index = 0;
  }else{
    index = sidebarItem.dataset.sidebarIndex;
  }
  return index;
}

// draw screen using passed in data
function drawScreen(data, activeSidebarIndex){
  // TODO there's definitely a better function
  // structure for handling drawing with or
  // without data passed in or with or without
  // an active sidebar index passed in

  // get data if neccessary
  if(data == null || data == undefined){
    data = getScreenData();
  }

  // TODO is -1 thing isn't great
  // use last index if -1 is passed in
  if(activeSidebarIndex == -1){
    activeSidebarIndex = data.length - 1;
  }

  // sidebar
  drawSidebar(data, activeSidebarIndex);

  // content
  drawContent(data, activeSidebarIndex)
}

function drawContent(data, activeSidebarIndex){
  data = getScreenData();
  if(data[activeSidebarIndex].simpleView){
    drawContentSimple(data, activeSidebarIndex)
  }else{
    drawContentDetailed(data, activeSidebarIndex);
  }
}

function drawContentSimple(data, activeSidebarIndex){
  // TODO this is bad practice/design
  if(data == null || data == undefined || data.length === 0){
    data = getScreenData();
  }

  // ensure a valid activeSidebarIndex
  if(activeSidebarIndex >= data.length || activeSidebarIndex < 0){
      activeSidebarIndex = 0;
  }

  // add items to content target
  let contentTarget = document.querySelector('#content-target');
  contentTarget.innerHTML = '';
  let contentIndex = 0;

  // return if no list items for current list
  if(data[activeSidebarIndex].listItems.length < 1){
    return
  }

  // add items to list
  data[activeSidebarIndex].listItems.forEach((item) => {
    contentTarget.appendChild(buildSimpleContentItem(item, activeSidebarIndex, contentIndex))
    contentIndex++;
  })

  // add click listeners (for deleting)
  createContentItemClickListeners()
}

// draw the sidebar
function drawSidebar(data, activeSidebarIndex){
  // TODO this function and the way it's called is bad
  if(data == null || data == undefined){
    data = getScreenData();
  }

  // make sure this is defined, bad practice
  let sidebarIndex = 0;

  // add event listener for simple view checkbox
  let simpleViewCheckbox = document.getElementById('simpleViewCheckbox');

  // TODO fix the checkbox value when each list is opened
  simpleViewCheckbox.checked = data[activeSidebarIndex].simpleView;


  simpleViewCheckbox.addEventListener('change', function() {
    sidebarIndex = getActiveSidebarIndex();
    ipcRenderer.sendSync('update-list-view', sidebarIndex, this.checked);
    drawScreen(null, sidebarIndex);
  });

  // add items to sidebar target
  let sidebarTarget = document.querySelector('#sidebar-target');
  sidebarTarget.innerHTML = '';
  sidebarIndex = 0;
  data.forEach((item) => {
    sidebarTarget.appendChild(buildSidebarItem(item, sidebarIndex, activeSidebarIndex));
    sidebarIndex++;
  })

  // add event listeners to sidebar items
  let sidebarItems = document.getElementsByClassName('sidebarItem');
  Array.from(sidebarItems).forEach(function(element) {
    // add click event listener
    element.addEventListener('click', function(event){
      sidebarItemClicked(event.target);
      drawSidebar(data, event.target.dataset.sidebarIndex);
    });

    // add double-click event listener
    element.addEventListener('dblclick', function(event){
      sidebarItemDoubleClicked(event.target);
    });

    // add right-click event listener
    element.addEventListener('contextmenu', function(event){
      sidebarItemRightClicked(event.target);
      return false;
    });
  });

}

// draw the content items in detailed view
function drawContentDetailed(data, activeSidebarIndex){
  // TODO this is bad practice/design
  if(data == null || data == undefined || data.length === 0){
    data = getScreenData();
  }

  // ensure a valid activeSidebarIndex
  if(activeSidebarIndex >= data.length || activeSidebarIndex < 0){
      activeSidebarIndex = 0;
  }

  // add items to content target
  let contentTarget = document.querySelector('#content-target');
  contentTarget.innerHTML = '';
  let contentIndex = 0;

  // return if no list items for current list
  if(data[activeSidebarIndex].listItems.length < 1){
    return
  }

  let workingDayDiff = getDateStyles(data[activeSidebarIndex].listItems[0].deadline).dateDayDifference;
  let firstItemDateAdded = false
  let currentWeekFound = false;
  let endOfWeekMarked = false;
  data[activeSidebarIndex].listItems.forEach((item) => {
    let testDayDiff = getDateStyles(item.deadline).dateDayDifference;
    if(workingDayDiff != testDayDiff || !firstItemDateAdded){

      // make sure first date is added
      if(firstItemDateAdded){
        contentTarget.appendChild(document.createElement('hr'));
      }
      firstItemDateAdded = true

      // highlight start of current week
      if(testDayDiff >= 0 && !currentWeekFound){
        contentTarget.innerHTML += '<div class=\'row\'><div class=\'col-12\'><p class="text-center">----------Start Week----------</p></div></div><hr>'
        currentWeekFound = true;
      }

      // highlight end of current week
      if(testDayDiff > 7 && currentWeekFound && !endOfWeekMarked){
        contentTarget.innerHTML += '<div class=\'row\'><div class=\'col-12\'><p class="text-center">----------End Week----------</p></div></div>'
        endOfWeekMarked = true;
      }

      // create date header and horizontal rule
      let deadlineSpan = document.createElement('span')
      deadlineSpan.classList.add('badge', 'badge-secondary')
      deadlineSpan.style.width = '130px'
      let dateStyles = getDateStyles(item.deadline);
      let textNode = document.createTextNode(dateStyles.dateWeekday + ' --- ' + dateStyles.dateFull)
      deadlineSpan.appendChild(textNode)
      contentTarget.appendChild(deadlineSpan)
      contentTarget.appendChild(deadlineSpan)

      // update day to test against
      workingDayDiff = testDayDiff;
    }
    contentTarget.appendChild(buildContentItem(item, activeSidebarIndex, contentIndex))
    contentIndex++;
  })

  // add event listeners to content items
  createContentItemClickListeners();

  // add event listeners to priority and deadline spans
  createPriorityListeners();
  createDeadlineListeners();
}

// add event listeners to content items
function createContentItemClickListeners(){
  let contentItems = document.getElementsByClassName('contentItem');
  Array.from(contentItems).forEach(function(element) {
    // add click event listener
    element.addEventListener('click', function(event){
      console.log('content item clicked')
    });

    // add double-click event listener
    element.addEventListener('dblclick', function(event){
      contentItemDoubleClicked(event.target);
    });
  });
}

// create content priority click listeners
function createPriorityListeners(){
  let priorityElements = document.getElementsByClassName('priority-target');
  Array.from(priorityElements).forEach(function(element) {
    // increment priority
    element.addEventListener('click', function(event){
      // get needed indices
      let sidebarIndex = event.target.parentElement.dataset.sidebarIndex;
      let contentIndex = event.target.parentElement.dataset.contentIndex;

      // send message to main process
      ipcRenderer.sendSync('priority-increment', sidebarIndex, contentIndex)
      drawScreen(null, sidebarIndex);

      // stop event bubbling
      event.stopPropagation();
    });

    // stop crashing on double click
    element.addEventListener('dblclick', function(event){
      event.stopPropagation();
    });

    // decrement priority
    element.addEventListener('contextmenu', function(event){
      // get needed indices
      let sidebarIndex = event.target.parentElement.dataset.sidebarIndex;
      let contentIndex = event.target.parentElement.dataset.contentIndex;

      // send message to main process
      ipcRenderer.sendSync('priority-decrement', sidebarIndex, contentIndex)
      drawScreen(null, sidebarIndex);

      // stop event bubbling
      event.stopPropagation();
    });
  });
}

// create content deadline click listeners
function createDeadlineListeners(){
  let deadlineElements = document.getElementsByClassName('deadline-target');
  Array.from(deadlineElements).forEach(function(element) {
    // increment deadline
    element.addEventListener('click', function(event){
      // get needed indices
      let sidebarIndex = event.target.parentElement.dataset.sidebarIndex;
      let contentIndex = event.target.parentElement.dataset.contentIndex;

      // send message to main process
      ipcRenderer.sendSync('deadline-increment', sidebarIndex, contentIndex)
      drawScreen(null, sidebarIndex);

      // stop event bubbling
      event.stopPropagation();
    });

    // stop crashing on double click
    element.addEventListener('dblclick', function(event){
      event.stopPropagation();
    });

    // decrement deadline
    element.addEventListener('contextmenu', function(event){
      // get needed indices
      let sidebarIndex = event.target.parentElement.dataset.sidebarIndex;
      let contentIndex = event.target.parentElement.dataset.contentIndex;

      // send message to main process
      ipcRenderer.sendSync('deadline-decrement', sidebarIndex, contentIndex)
      drawScreen(null, sidebarIndex);

      // stop event bubbling
      event.stopPropagation();
    });
  });
}

// create the item that will be put in the sidebar target
function buildSidebarItem(sidebarList, sidebarIndex, activeSidebarIndex){
  // create list item element and add classes
  let li = document.createElement('li');
  li.classList.add('list-group-item', 'sidebarItem');

  // add active class if active index matches
  if(sidebarIndex == activeSidebarIndex){
    li.classList.add('list-group-item-primary');
  }

  // add text node with list name to list item element
  let textNode = document.createTextNode(sidebarList.name);
  li.appendChild(textNode);

  // create badge with number of content items
  let span = document.createElement('span')
  span.classList.add('badge', 'badge-secondary', 'float-right')
  let listCount = sidebarList.listItems.length
  if(sidebarList.listItems.length < 10){
    listCount = '0' + listCount
  }
  textNode = document.createTextNode(listCount)
  span.appendChild(textNode)
  li.appendChild(span)

  // add index data to element
  li.setAttribute('data-sidebar-index', sidebarIndex);
  return li;
}

function buildSimpleContentItem(contentItem, activeSidebarIndex, contentIndex){
  // create list item element and add classes
  let li = document.createElement('li');
  li.classList.add('list-group-item');
  li.classList.add('contentItem');

  // add text node with content notes to list item
  let noteNode = document.createTextNode(contentItem.note);
  li.appendChild(noteNode)

  // add index data to list item
  li.setAttribute('data-sidebar-index', activeSidebarIndex);
  li.setAttribute('data-content-index', contentIndex);
  return li;
}

// create the item that will be put in the content target
function buildContentItem(contentItem, activeSidebarIndex, contentIndex){
  // create list item element and add classes
  let li = document.createElement('li');
  li.classList.add('list-group-item');
  li.classList.add('contentItem');

  // add text node with content notes to list item
  let noteNode = document.createTextNode(contentItem.note);
  li.appendChild(noteNode)

  // add priority to list item
  let prioritySpan = document.createElement('span')
  prioritySpan.classList.add('badge', 'badge-warning', 'float-right', 'priority-target')  // add custom class for event listener
  let priorityNum = contentItem.priority
  let textNode = document.createTextNode('P-' + priorityNum)
  prioritySpan.appendChild(textNode)
  li.appendChild(prioritySpan)

  // add date to list item (must convert deadline to Date)
  let dateSpan = document.createElement('span')
  dateSpan.classList.add('badge', 'badge-info', 'float-right', 'deadline-target')  // add custom class for event listener)
  let dateStyles = getDateStyles(contentItem.deadline);
  let dateDisplayString = dateStyles.dateDayDifference
  if(dateDisplayString > -1 && dateDisplayString < 10){
    dateDisplayString = '0' + dateDisplayString
  }
  textNode = document.createTextNode(dateDisplayString);
  dateSpan.style.marginRight = '10px' // put space between date and priority
  dateSpan.appendChild(textNode)
  li.appendChild(dateSpan)

  // color item background based on priority
  li.style.backgroundColor = getPriorityColorHexCode(contentItem.priority)
  li.style.color = getPriorityTextColor(contentItem.priority)

  // add index data to list item
  li.setAttribute('data-sidebar-index', activeSidebarIndex);
  li.setAttribute('data-content-index', contentIndex);
  return li;
}

function getPriorityColorHexCode(contentItemPriority){
  switch(contentItemPriority){
    case 2:
      return '#e3a4a4';
    case 3:
      return '#ba6767';
    case 4:
      return '#ba4242';
    case 5:
      return '#7a1717';
    default:
      return '#ffffff';
  }
}

function getPriorityTextColor(priority){
  if(priority == 4 || priority == 5){
      return 'white'
  }else{
      return 'black'
  }
}

function getDateStyles(contentItemDeadline){
  let dateFull = new Date(contentItemDeadline)
  let dateWeekday = DAYS[dateFull.getDay()];
  let dateDayDifference = dateFull - new Date();
  dateDayDifference = Math.round(dateDayDifference / (1000*60*60*24));
  dateFull = dateFull.toLocaleDateString();
  return {dateFull, dateWeekday, dateDayDifference};
}
