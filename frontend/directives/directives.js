//////////////   CALENDAR DIRECTIVES   /////////////////////////////////////////
// The header on the Calendar side
export function calHeader () {
  return {
    restrict: 'E',
    template: require('./calHeader.html'),
    link(scope, element, attrs, ctrl) {
      scope.toggleOption = function() { scope.optionFlag = !scope.optionFlag; };
      scope.toggleMonth = function() { scope.monthFlag = !scope.monthFlag; };
      scope.clearOption = () => { scope.optionFlag = false; };
      scope.clear = () => { scope.optionFlag = false; scope.monthFlag = false; };
    }
  };
}

// The navigational option pane that expands from the right side of the screen
export function optionPane() {
  return {
    restrict: 'E',
    template: require('./optionPane.html')
  };
}

// The navigational Calendar in both the option pane and the header
export function calendar() {
  return {
    restrict: 'E',
    template: require('./calendar.html')
  };
}
////////////////////////////////////////////////////////////////////////////////

//////////////   LIST DIRECTIVES   /////////////////////////////////////////////
//the header for each list view
export function listHeader() {
  return {
    restrict: 'E',
    template: require('./listHeader.html'),
    link(scope, element, attrs, ctrl) {
      scope.verifyDelete = () => {
        let message = (scope.editableItems === 1) ? "Delete task?" : "Delete tasks?";
        if(confirm(message)) scope.deleteTask();
      };
    }
  };
}
//this directive makes up the task rows that exist on each of the List Views
export function taskItems() {
  return {
    restrict: 'E',
    template: require('./taskItems.html'),
    link(scope, element, attrs, ctrl) {
      scope.saveTask = (task) => {
        dataSvc.saveTask(task).then(
          function(res){ console.log("saved", res); },
          function(err){ console.log("error", err); }
        );
      };
    }
  };
}
//the last row on each view which allows you to quickly create a new item
export function addItem() {
  return {
    restrict: 'E',
    template: require('./addItem.html')
  };
}
//the form that allows you to fully edit a new item
export function newItemPane() {
  return {
    restrict: 'E',
    template: require('./newItemPane.html')
  };
}
// (MAY NOT BE NEEDED) Full scheduler directive
export function scheduler(moment) {
  return {
    restrict: 'E',
    template: require('./scheduler.html'),
    link(scope, element, attrs, ctrl) {

    }
  };
} scheduler.$inject = [`moment`];
////////////////////////////////////////////////////////////////////////////////
