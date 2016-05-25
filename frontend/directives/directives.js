//////////////   CALENDAR DIRECTIVES   /////////////////////////////////////////
// The header on the Calendar side
export function calHeader ($state) {
  return {
    restrict: 'E',
    template: require('./calHeader.html'),
    scope: {
      icon: '@',
      view: '@',
      month: '=',
      optionFlag: '=flag1',
      monthFlag: '=flag2'
    },
    link(scope, element, attrs, ctrl) {
      scope.eyeFlag = true;
      scope.monthFlag = false;
      if($state.params.optionFlag) scope.optionFlag = $state.params.optionFlag;
      else scope.optionFlag = false;
      console.log($state.params);

      scope.toggleOption = function() {
        scope.optionFlag = !scope.optionFlag;
      };
      scope.toggleMonth = function() {
        scope.monthFlag = !scope.monthFlag;
      };
      scope.toggleEye = function() {
        scope.eyeFlag = !scope.eyeFlag;
      };
      scope.clear = () => {
        scope.optionFlag = false;
        scope.monthFlag = false;
      };
      scope.clearOption = () => {
        scope.optionFlag = false;
      };
    },
  };
}
calHeader.$inject = [`$state`];

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
    template: require('./listHeader.html')
  };
}
//this directive makes up the task rows that exist on each of the List Views
export function taskItems() {
  return {
    restrict: 'E',
    template: require('./taskItems.html')
  };
}
//the last row on each view which allows you to quickly create a new item
export function addItem() {
  return {
    restrict: 'E',
    template: require('./addItem.html')
  };
}
//the form that allows you to fully edit an existing task
export function editItemPane() {
  return {
    restrict: 'E',
    template: require('./editItemPane.html')
  };
}
//the form that allows you to fully edit a new item
export function newItemPane() {
  return {
    restrict: 'E',
    template: require('./newItemPane.html')
  };
}
//the modal that allows you to quickly choose a time for your task
export function quickScheduler(moment) {
  return {
    restrict: 'E',
    template: require('./quickScheduler.html'),
    link(scope, element, attrs, ctrl) {
      scope.moment = moment;
      scope.hour = moment().hour();
      scope.day = moment().day();
      console.log(scope.hour, scope.day);

      scope.quickSchedule = startTime => {
        console.log(scope.duration.length);
        console.log(startTime);
        if(startTime) {
          for (let i = 0; i < scope.tasks.length; i++) {
            if(scope.tasks[i].status.editable) {
              let scheduled = {startTime, length: scope.duration.length};
              scope.tasks[i].scheduled = scheduled;
              scope.tasks[i].status.active = true;
              scope.tasks[i].status.inactive = false;
            }
          }
          scope.editTasks('scheduled.startTime,scheduled.length,status.active,status.inactive', [startTime, scope.duration.length, true, false]);
        } else {
          for (let i = 0; i < scope.tasks.length; i++) {
            if(scope.tasks[i].status.editable) {
              let scheduled = {startTime: undefined, length: scope.duration.length};
              scope.tasks[i].scheduled = scheduled;
              scope.tasks[i].status.active = false;
              scope.tasks[i].status.inactive = true;
            }
          }
          scope.editTasks('scheduled.startTime,scheduled.length,status.active,status.inactive', [startTime, scope.duration.length, false, true]);
        }
        console.log(scope.tasks);
        scope.toggleQuickScheduler();
        scope.toggleEditOff();
      };
    }
  };
}
quickScheduler.$inject = [`moment`];

export function scheduler(moment) {
  return {
    restrict: 'E',
    template: require('./scheduler.html'),
    link(scope, element, attrs, ctrl) {
      
    }
  };
}

scheduler.$inject = [`moment`];
////////////////////////////////////////////////////////////////////////////////
