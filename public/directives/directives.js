/* jshint esversion: 6 */

angular.module('lifeApp')
//****************  CALENDAR DIRECTIVES  ****************
.directive('calHeader', function($state) {
  return {
    restrict: 'E',
    templateUrl: './directives/calHeader.html',
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
})
.directive('optionPane', function() {
  return {
    restrict: 'E',
    templateUrl: './directives/optionPane.html'
  };
})
.directive('calendar', () => {
  return {
    restrict: 'E',
    templateUrl: './directives/calendar.html'
  };
})
//****************  LIST DIRECTIVES  ****************
//the header for each list view
.directive('listHeader', function() {
  return {
    restrict: 'E',
    templateUrl: './directives/listHeader.html'
  };
})
//this directive makes up the task rows that exist on each of the List Views
.directive('taskItems', function() {
  return {
    restrict: 'E',
    templateUrl: './directives/taskItems.html'
  };
})
//the last row on each view which allows you to quickly create a new item
.directive('addItem', function() {
  return {
    restrict: 'E',
    templateUrl: './directives/addItem.html'
  };
})
//the form that allows you to fully edit an existing task
.directive('editItemPane', function() {
  return {
    restrict: 'E',
    templateUrl: './directives/editItemPane.html'
  };
})
//the form that allows you to fully edit a new item
.directive('newItemPane', function() {
  return {
    restrict: 'E',
    templateUrl: './directives/newItemPane.html'
  };
})
//the modal that allows you to quickly choose a time for your task
.directive('quickScheduler', function() {
  return {
    restrict: 'E',
    templateUrl: './directives/quickScheduler.html',
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
});
