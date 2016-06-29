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
export function editItemPane(moment, dataSvc) {
  return {
    restrict: 'E',
    template: require('./editItemPane.html'),
    link(scope, element, attrs, ctrl) {
      scope.toggleTempSchedule = () => {
        if(scope.tempScheduleFlag) scope.tempScheduleFlag = false;
        else {
          let task = scope.tasks[scope.editPaneIndx],
              schedule = task.schedule,
              duration;
          if(schedule.duration >= 60){
            duration = `${schedule.duration/60} Hour`;
            if(schedule.duration > 60) duration += `s`;
          } else duration = schedule.duration ? `${schedule.duration} Minutes` : `None`;
          task.scheduleNames = {
            duration,
            startTime: schedule.startTime.moment ? moment(schedule.startTime.moment).calendar() : `None`,
            softDeadline: schedule.softDeadline ? moment(schedule.softDeadline).calendar() : `None`,
            hardDeadline: schedule.hardDeadline ? moment(schedule.hardDeadline).calendar() : `None`,
            availability: `Custom`
          };
          scope.editSchedule = () => {
            dataSvc.scheduleNames = {};
            for(let i in task.scheduleNames){ dataSvc.scheduleNames[i] = task.scheduleNames[i]; }
            dataSvc.schedule = {
              duration: schedule.duration,
              startTime: {
                  moment: '',
                  top: schedule.startTime.top },
              softDeadline: schedule.softDeadline,
              hardDeadline: schedule.hardDeadline,
              availability: []
            };
            if(schedule.startTime.moment) dataSvc.schedule.startTime.moment = moment(schedule.startTime.moment);
            for (let i = 0; i < 7; i++) {
              dataSvc.schedule.availability.push(schedule.availability[i].slice());
            }
            scope.toggleQuickScheduler();
          };
          scope.tempScheduleFlag = true;
        }
      };
    }
  };
} editItemPane.$inject = [`moment`, `dataSvc`];
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
