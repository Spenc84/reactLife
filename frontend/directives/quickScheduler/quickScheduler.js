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
      else createNewSchedule();

      function createNewSchedule() {
        scope.scheduleNames = {
          startTime: 'Now',
          duration: 'None',
          softDeadline: 'None',
          hardDeadline: 'None',
          availability: 'Anytime'
        };
        let now = moment().startOf('hour');
        scope.schedule = {
          startTime: {
              moment: now,
              year: now.year(),
              month: now.month(),
              day: now.date(),
              hour: now.hour(),
              minute: 0,
              top: (now.hour()*60)+5 },
          duration: 0,
          softDeadline: {moment: ''},
          hardDeadline: {moment: ''},
          availability: []
        };
        scope.startToday = true;
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
          // Reset the hard deadline option
          scope.scheduleNames.hardDeadline = 'None';
          scope.schedule.hardDeadline.moment = '';
          // Update startTime, softDeadline, and availability fields based on template
          scope.deadlineType = 'softDeadline';
          switch(value[2]){
            case 1: // Duration: Daytime (9am to 5pm)
                if(scope.hour < 17) {  // If it's before 5:00 pm
                  let startName = (scope.hour < 9) ? '9:00 AM' : 'Now',
                      startTime = (scope.hour < 9) ? moment().hour(9).startOf('hour') : moment().startOf('hour');
                  scope.setStartTime([startName, startTime]);
                  scope.setDeadline(['5:00 PM', moment().hour(17).startOf('hour')]);
                }
                else {  // If it's after 5:00 pm
                  scope.setStartTime(['9:00 AM Tomorrow', moment().add(1, 'day').hour(9).startOf('hour')]);
                  scope.setDeadline(['5:00 PM Tomorrow', moment().add(1, 'day').hour(17).startOf('hour')]);
                }
                scope.setAvailability.daytime();
            break;
            case 2: // Duration: Evening (6pm to 10pm)
                if(scope.hour < 22) {  // If it's before 10:00 pm
                  let startName = (scope.hour < 18) ? '6:00 PM' : 'Now',
                      startTime = (scope.hour < 18) ? moment().hour(18).startOf('hour') : moment().startOf('hour');
                  scope.setStartTime([startName, startTime]);
                  scope.setDeadline(['10:00 PM', moment().hour(22).startOf('hour')]);
                }
                else {  // If it's after 10:00 pm
                  scope.setStartTime(['6:00 PM Tomorrow', moment().add(1, 'day').hour(18).startOf('hour')]);
                  scope.setDeadline(['10:00 PM Tomorrow', moment().add(1, 'day').hour(22).startOf('hour')]);
                }
                scope.setAvailability.evenings();
            break;
            case 3: // Duration: All Day (8am - 10pm)
                if(scope.hour < 22) {  // If it's before 10:00 pm
                  let startName = (scope.hour < 8) ? '8:00 AM' : 'Now',
                      startTime = (scope.hour < 8) ? moment().hour(8).startOf('hour') : moment().startOf('hour');
                  scope.setStartTime([startName, startTime]);
                  scope.setDeadline(['10:00 PM', moment().hour(22).startOf('hour')]);
                }
                else {  // If it's after 10:00 pm
                  scope.setStartTime(['8:00 AM Tomorrow', moment().add(1, 'day').hour(8).startOf('hour')]);
                  scope.setDeadline(['10:00 PM Tomorrow', moment().add(1, 'day').hour(22).startOf('hour')]);
                }
                scope.setAvailability.anytime();
            break;
          }
        }
        console.log('duration updated: ', scope.schedule);
        scope.toggleDurationModal();
      };
////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////
///////////////////////////////  START TIME  ///////////////////////////////////
      scope.closeStartTimeModal = () => { scope.startTimeModalFlag = false; scope.customStart = false; };
      scope.toggleStartTimeModal = () => {
        scope.startTimeModalFlag = !scope.startTimeModalFlag;
      };
      scope.openCustomStart = () => {
        scope.customStartDate = new Date(moment().startOf('minute'));
        scope.customStart = true;
      };

      scope.setStartTime = value => {
        let starting = scope.schedule.startTime;
        scope.scheduleNames.startTime = value[0];  //Start Time's name value in string form (eg. 'Tomorrow')
        starting.moment = value[1];  //Start Time's actual value (It should be a momentJS date object)
        // If the user chooses 'Someday' as the start time then disable the deadline options and reset them
        if(!starting.moment){
          scope.scheduleNames.softDeadline = 'None';
          scope.scheduleNames.hardDeadline = 'None';
          scope.schedule.softDeadline.moment = '';
          scope.schedule.hardDeadline.moment = '';
        }
        // Else if the user chooses a valid start time, then set some variables for the deadline modal to use
        else {
          scope.startToday = starting.moment.isSame(moment(), 'day') ? true : false;
          starting.year = starting.moment.year()-2000;
          starting.month = starting.moment.month();
          starting.day = starting.moment.date();
          starting.hour = starting.moment.hour();
          starting.minute = starting.moment.minute();
          starting.top = starting.moment ? 5+(starting.hour*60)+(starting.minute) : undefined;
          // ...and reset the deadline values if they've already been chosen and they're prior to the new start time
          if(scope.schedule.softDeadline.moment && scope.schedule.softDeadline.moment.isBefore(starting.moment)){
            scope.scheduleNames.softDeadline = 'None';
            scope.schedule.softDeadline.moment = '';
          }
          if(scope.schedule.hardDeadline.moment && scope.schedule.hardDeadline.moment.isBefore(starting.moment)){
            scope.scheduleNames.hardDeadline = 'None';
            scope.schedule.hardDeadline.moment = '';
          }
        }
        console.log('startTime updated: ', scope.schedule);
        scope.closeStartTimeModal();  // Close the startTime modal
      };
////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////  DEADLINE  ////////////////////////////////////
      scope.toggleDeadlineModal = (type) => {
        let starting = scope.schedule.startTime;
        if(type && starting.moment) {
          scope.deadlineType = type; // softDeadline or hardDeadline
          scope.startToday = starting.moment.isSame(moment(), 'day') ? true : false;
          scope.tempDeadline = starting.moment.clone();
          scope.deadlineModalFlag = true;
        } else scope.deadlineModalFlag = false;
      };
      scope.setDeadline = value => {
        let deadline = scope.schedule[scope.deadlineType];
        scope.scheduleNames[scope.deadlineType] = value[0];
        deadline.moment = value[1];
        deadline.year = deadline.moment ? deadline.moment.year()-2000 : undefined;
        deadline.month = deadline.moment ? deadline.moment.month() : undefined;
        deadline.day = deadline.moment ? deadline.moment.date() : undefined;
        deadline.hour = deadline.moment ? deadline.moment.hour() : undefined;
        deadline.minute = deadline.moment ? deadline.moment.minute() : undefined;
        console.log(`${scope.deadlineType} updated: ${scope.schedule}`);
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
        let {startTime, softDeadline, hardDeadline} = scope.schedule,
            scheduled = startTime.moment ? true : false,
            startsNow = scheduled ? startTime.moment.isSameOrBefore(moment()) : false,
            active = scheduled ? startsNow : false,
            pending = scheduled ? !startsNow : false,
            inactive = !scheduled,
            tasksToChange = [],
            taskIds = [],
            keysToChange = 'schedule,status.active,status.pending,status.scheduled,status.inactive',
            newValues = [scope.schedule, active, pending, scheduled, inactive];

        for (let i = 0; i < scope.tasks.length; i++) {
          if(scope.tasks[i].status.editable) {
            scope.tasks[i].schedule = scope.schedule;
            scope.tasks[i].status.active = active;
            scope.tasks[i].status.pending = pending;
            scope.tasks[i].status.scheduled = scheduled;
            scope.tasks[i].status.inactive = inactive;
            tasksToChange.push(scope.tasks[i]);
            taskIds.push(scope.tasks[i]._id);
          }
        }

        console.log("-----Sent to Backend-----");
        console.log("taskIds: ", taskIds);
        console.log("keysToChange: ", keysToChange);
        console.log("newValues: ", newValues);
        dataSvc.editTasks(taskIds, keysToChange, newValues).then(
          function( res ){ console.log("item(s) saved", res); },
          function( err ){ console.log("Error while saving: ", err); }
        );

        //// SET THE AGENDA VALUES ////  //test  !!!!PROBABLY NOT NEEDED!!!!
        // function updateAgenda(yr, mo, day, hr, min, key, ids, tasks){
        //   let {agenda} = dataSvc.user;
        //   agenda[yr] = agenda[yr] || [];
        //   agenda[yr][mo] = agenda[yr][mo] || [];
        //   agenda[yr][mo][day] = agenda[yr][mo][day] || [];
        //   agenda[yr][mo][day][hr] = agenda[yr][mo][day][hr] || [];
        //   agenda[yr][mo][day][hr][min] = agenda[yr][mo][day][hr][min] || {};
        //   agenda[yr][mo][day][hr][min][key] = agenda[yr][mo][day][hr][min][key] || [];
        //   agenda[yr][mo][day][hr][min][key].push(...tasks);
        //   agenda[yr][mo][day][24] = agenda[yr][mo][day][24] || [];
        //   if(key === 'startTime') agenda[yr][mo][day][24].push(...tasks);
        //   dataSvc.updateAgenda(yr, mo, day, hr, min, key, ids).then(
        //     function(res){ console.log(`Agenda updated: `, res); },
        //     function(err){ console.log(`Failed to update agenda: ${err}`); }
        //   );
        //   console.log("User's Agenda updated: ", scope.user);
        // }
        // let st = startTime,
        //     sd = softDeadline,
        //     hd = hardDeadline;
        // if(st.moment){
        //   updateAgenda(st.year, st.month, st.day, st.hour, st.minute, 'startTime', taskIds, tasksToChange);
        //   if(sd.moment) updateAgenda(sd.year, sd.month, sd.day, sd.hour, sd.minute, 'softDeadline', taskIds, tasksToChange);
        //   if(hd.moment) updateAgenda(hd.year, hd.month, hd.day, hd.hour, hd.minute, 'hardDeadline', taskIds, tasksToChange);
        // }
        createNewSchedule();
        scope.toggleQuickScheduler();
        scope.toggleEditOff();
      };
////////////////////////////////////////////////////////////////////////////////
    }
  };
} quickScheduler.$inject = [`moment`, `dataSvc`];
