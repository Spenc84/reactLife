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
export function quickScheduler(moment, dataSvc) {
  return {
    restrict: 'E',
    template: require('./quickScheduler.html'),
    link(scope, element, attrs, ctrl) {
      scope.moment = moment;
      scope.hour = moment().hour();
      scope.day = moment().day();
      console.log(scope.hour, scope.day);

      // If one doesn't already exist, build a new schedule object
      // which can then be assigned to a task
      if(dataSvc.schedule) {
        scope.schedule = dataSvc.schedule;
        scope.scheduleNames = dataSvc.scheduleNames;
      }
      else {
        scope.schedule = {
          startTime: moment(),
          duration: 0,
          softDeadline: undefined,
          hardDeadline: undefined,
          availability: []
        };
        // scope.schedule.availability is defined as an array of 7 elements which
        // represent days. Each day that is available to complete the task will
        // contain an array of 24 elements which represent hours, otherwise it will
        // be undefined if that day is not available. Each element in the hours array
        // will contain a 1 if that hour is available to complete the task, or a 0 if not
        for(let i = 0; i < 7; i++){
          let hourArray = [];
          for (let j = 0; j < 8; j++) { hourArray.push(0); }
          for (let j = 8; j < 22; j++) { hourArray.push(1); }
          for (let j = 22; j < 24; j++) { hourArray.push(0); }
          scope.schedule.availability.push(hourArray);
        }
        console.log('schedule obj intialized: ', scope.schedule);
        scope.scheduleNames = {
          startTime: 'Now',
          duration: 'None',
          softDeadline: 'None',
          hardDeadline: 'None',
          availability: 'Anytime'
        };
        dataSvc.schedule = scope.schedule;
        dataSvc.scheduleNames = scope.scheduleNames;
      }

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////  DURATION  ////////////////////////////////////
      scope.toggleDurationModal = () => {
        scope.durationModalFlag = !scope.durationModalFlag;
      };
      scope.setDuration = value => {
        scope.scheduleNames.duration = value[0];
        scope.schedule.duration = value[1];
        // If the user selected a duration template, then set the other schedule values
        scope.durationTemplate = value[2] ? true : false;  // Referenced in deadline options
        if(scope.durationTemplate){
          scope.hour = moment().hour();
          scope.noStartTime = false;  // If the deadline fields were disabled, reenable them
          // Reset the hard deadline option
          scope.scheduleNames.hardDeadline = 'None';
          scope.schedule.hardDeadline = '';
          // Update startTime, softDeadline, and availability fields based on template
          switch(value[2]){
            case 1: // Duration: Daytime (9am to 5pm)
                if(scope.hour < 17) {  // If it's before 5:00 pm
                  scope.scheduleNames.startTime = (scope.hour < 9) ? '9:00 AM' : 'Now';
                  scope.schedule.startTime = (scope.hour < 9) ? moment().hour(9).startOf('hour') : moment();
                  scope.scheduleNames.softDeadline = '5:00 PM';
                  scope.schedule.softDeadline = moment().hour(17).startOf('hour');
                }
                else {  // If it's after 5:00 pm
                  scope.scheduleNames.startTime = '9:00 AM Tomorrow';
                  scope.schedule.startTime = moment().add(1, 'day').hour(9).startOf('hour');
                  scope.scheduleNames.softDeadline = '5:00 PM Tomorrow';
                  scope.schedule.softDeadline = moment().add(1, 'day').hour(17).startOf('hour');
                }
                scope.setAvailability.daytime();
            break;
            case 2: // Duration: Evening (6pm to 10pm)
                if(scope.hour < 22) {  // If it's before 10:00 pm
                  scope.scheduleNames.startTime = (scope.hour < 18) ? '6:00 PM' : 'Now';
                  scope.schedule.startTime = (scope.hour < 18) ? moment().hour(18).startOf('hour') : moment();
                  scope.scheduleNames.softDeadline = '10:00 PM';
                  scope.schedule.softDeadline = moment().hour(22).startOf('hour');
                }
                else {  // If it's after 10:00 pm
                  scope.scheduleNames.startTime = '6:00 PM Tomorrow';
                  scope.schedule.startTime = moment().add(1, 'day').hour(18).startOf('hour');
                  scope.scheduleNames.softDeadline = '10:00 PM Tomorrow';
                  scope.schedule.softDeadline = moment().add(1, 'day').hour(22).startOf('hour');
                }
                scope.setAvailability.evenings();
            break;
            case 3: // Duration: All Day (8am - 10pm)
                if(scope.hour < 22) {  // If it's before 10:00 pm
                  scope.scheduleNames.startTime = (scope.hour < 8) ? '8:00 AM' : 'Now';
                  scope.schedule.startTime = (scope.hour < 8) ? moment().hour(8).startOf('hour') : moment();
                  scope.scheduleNames.softDeadline = '10:00 PM';
                  scope.schedule.softDeadline = moment().hour(22).startOf('hour');
                }
                else {  // If it's after 10:00 pm
                  scope.scheduleNames.startTime = '8:00 AM Tomorrow';
                  scope.schedule.startTime = moment().add(1, 'day').hour(8).startOf('hour');
                  scope.scheduleNames.softDeadline = '10:00 PM Tomorrow';
                  scope.schedule.softDeadline = moment().add(1, 'day').hour(22).startOf('hour');
                }
                scope.setAvailability.anytime();
            break;
          }
        }
        console.log('schedule obj updated: ', scope.schedule);
        scope.toggleDurationModal();
      };
////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////
///////////////////////////////  START TIME  ///////////////////////////////////
      scope.toggleStartTimeModal = () => {
        scope.startTimeModalFlag = !scope.startTimeModalFlag;
      };

      scope.setStartTime = value => {
        scope.scheduleNames.startTime = value[0];  //Start Time's name value in string form (eg. 'Tomorrow')
        scope.schedule.startTime = value[1];  //Start Time's actual value (It should be a momentJS date object)
        scope.noStartTime = value[1] ? false : true;
        // If the user chooses 'Someday' as the start time then disable the deadline options and reset them
        if(scope.noStartTime){
          scope.scheduleNames.softDeadline = 'None';
          scope.scheduleNames.hardDeadline = 'None';
          scope.schedule.softDeadline = '';
          scope.schedule.hardDeadline = '';
        }
        // Else if the user chooses a valid start time, then set some variables for the deadline modal to use
        else {
          scope.startToday = scope.schedule.startTime.isSame(moment(), 'day') ? true : false;
          scope.startingDay = scope.schedule.startTime.day();
          scope.startingHour = scope.schedule.startTime.hour();
          // ...and reset the deadline values if they've already been chosen and they're prior to the new start time
          if(scope.schedule.softDeadline && scope.schedule.softDeadline.isBefore(scope.schedule.startTime)){
            scope.scheduleNames.softDeadline = 'None';
            scope.schedule.softDeadline = '';
          }
          if(scope.schedule.hardDeadline && scope.schedule.hardDeadline.isBefore(scope.schedule.startTime)){
            scope.scheduleNames.hardDeadline = 'None';
            scope.schedule.hardDeadline = '';
          }
        }
        console.log('schedule obj updated: ', scope.schedule);
        scope.toggleStartTimeModal();  // Close the startTime modal
      };
////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////  DEADLINE  ////////////////////////////////////
      scope.toggleDeadlineModal = (type) => {
        if(type && !scope.noStartTime) {
          scope.deadlineType = type; // softDeadline or hardDeadline
          scope.startToday = scope.schedule.startTime.isSame(moment(), 'day') ? true : false;
          scope.startingDay = scope.schedule.startTime.day();
          scope.startingHour = scope.schedule.startTime.hour();
          scope.tempDeadline = scope.schedule.startTime.clone();
          scope.deadlineModalFlag = true;
        } else scope.deadlineModalFlag = false;
      };
      scope.setDeadline = value => {
        scope.scheduleNames[scope.deadlineType] = value[0];
        scope.schedule[scope.deadlineType] = value[1];
        console.log('schedule obj updated: ', scope.schedule);
        scope.toggleDeadlineModal();
      };
////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////
//////////////////////////////  AVAILABILITY  //////////////////////////////////
      scope.toggleAvailabilityModal = () => {
        scope.availabilityModalFlag = !scope.availabilityModalFlag;
      };

      scope.setAvailability = {};
      // Anytime (8am to 10pm)
      scope.setAvailability.anytime = () => {
        scope.scheduleNames.availability = 'Anytime';
        let arrayOfDays = [];
        for(let i = 0; i < 7; i++){
          let arrayOfHours = [];
          for (let j = 0; j < 8; j++) { arrayOfHours.push(0); }
          for (let j = 8; j < 22; j++) { arrayOfHours.push(1); }
          for (let j = 22; j < 24; j++) { arrayOfHours.push(0); }
          arrayOfDays.push(arrayOfHours);
        }
        scope.schedule.availability = arrayOfDays;
        scope.availabilityModalFlag = false;
      };
      // Early Bird (6am to 8am)
      scope.setAvailability.earlyBird = () => {
        scope.scheduleNames.availability = 'Early Bird';
        let arrayOfDays = [];
        for(let i = 0; i < 7; i++){
          let arrayOfHours = [];
          for (let j = 0; j < 6; j++) { arrayOfHours.push(0); }
          for (let j = 6; j < 8; j++) { arrayOfHours.push(1); }
          for (let j = 8; j < 24; j++) { arrayOfHours.push(0); }
          arrayOfDays.push(arrayOfHours);
        }
        scope.schedule.availability = arrayOfDays;
        scope.availabilityModalFlag = false;
      };
      // Mornings (6am to 12pm)
      scope.setAvailability.mornings = () => {
        scope.scheduleNames.availability = 'Mornings';
        let arrayOfDays = [];
        for(let i = 0; i < 7; i++){
          let arrayOfHours = [];
          for (let j = 0; j < 6; j++) { arrayOfHours.push(0); }
          for (let j = 6; j < 12; j++) { arrayOfHours.push(1); }
          for (let j = 12; j < 24; j++) { arrayOfHours.push(0); }
          arrayOfDays.push(arrayOfHours);
        }
        scope.schedule.availability = arrayOfDays;
        scope.availabilityModalFlag = false;
      };
      // Daytime (9am to 5pm)
      scope.setAvailability.daytime = () => {
        scope.scheduleNames.availability = 'Daytime';
        let arrayOfDays = [];
        for(let i = 0; i < 7; i++){
          let arrayOfHours = [];
          for (let j = 0; j < 9; j++) { arrayOfHours.push(0); }
          for (let j = 9; j < 17; j++) { arrayOfHours.push(1); }
          for (let j = 17; j < 24; j++) { arrayOfHours.push(0); }
          arrayOfDays.push(arrayOfHours);
        }
        scope.schedule.availability = arrayOfDays;
        scope.availabilityModalFlag = false;
      };
      // Afternoon (12pm to 6pm)
      scope.setAvailability.afternoon = () => {
        scope.scheduleNames.availability = 'Afternoon';
        let arrayOfDays = [];
        for(let i = 0; i < 7; i++){
          let arrayOfHours = [];
          for (let j = 0; j < 12; j++) { arrayOfHours.push(0); }
          for (let j = 12; j < 18; j++) { arrayOfHours.push(1); }
          for (let j = 18; j < 24; j++) { arrayOfHours.push(0); }
          arrayOfDays.push(arrayOfHours);
        }
        scope.schedule.availability = arrayOfDays;
        scope.availabilityModalFlag = false;
      };
      // Evenings (6pm to 10pm)
      scope.setAvailability.evenings = () => {
        scope.scheduleNames.availability = 'Evenings';
        let arrayOfDays = [];
        for(let i = 0; i < 7; i++){
          let arrayOfHours = [];
          for (let j = 0; j < 18; j++) { arrayOfHours.push(0); }
          for (let j = 18; j < 22; j++) { arrayOfHours.push(1); }
          for (let j = 22; j < 24; j++) { arrayOfHours.push(0); }
          arrayOfDays.push(arrayOfHours);
        }
        scope.schedule.availability = arrayOfDays;
        scope.availabilityModalFlag = false;
      };
      // 24x7 (12am to 12am the follow day)
      scope.setAvailability._24x7 = () => {
        scope.scheduleNames.availability = '24x7';
        let arrayOfDays = [];
        for(let i = 0; i < 7; i++){
          let arrayOfHours = [];
          for (let j = 0; j < 24; j++) { arrayOfHours.push(1); }
          arrayOfDays.push(arrayOfHours);
        }
        scope.schedule.availability = arrayOfDays;
        scope.availabilityModalFlag = false;
      };

////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////  SUBMIT  /////////////////////////////////////
      scope.quickSchedule = () => {
        let scheduled = scope.schedule.startTime ? true : false;
        console.log(scope.startTime, scheduled);
        for (let i = 0; i < scope.tasks.length; i++) {
          if(scope.tasks[i].status.editable) {
            scope.tasks[i].schedule = scope.schedule;
            scope.tasks[i].status.active = scheduled;
            scope.tasks[i].status.inactive = !scheduled;
          }
        }
        scope.editTasks('schedule,status.active,status.inactive', [scope.schedule, scheduled, !scheduled]);
        console.log(scope.tasks);
        scope.toggleQuickScheduler();
        scope.toggleEditOff();
      };
////////////////////////////////////////////////////////////////////////////////
    }
  };
} quickScheduler.$inject = [`moment`, `dataSvc`];

export function scheduler(moment) {
  return {
    restrict: 'E',
    template: require('./scheduler.html'),
    link(scope, element, attrs, ctrl) {

    }
  };
} scheduler.$inject = [`moment`];
////////////////////////////////////////////////////////////////////////////////
