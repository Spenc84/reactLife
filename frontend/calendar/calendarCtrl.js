export default function calendarCtrl($scope, dataSvc, moment, $interval) {
  $scope.tasks = dataSvc.tasks;
  console.log('Tasks: ', $scope.tasks);
  console.log(`User: `, dataSvc.user);
  // let agenda = buildAgenda();
  //
  // function buildAgenda(){
  //   let active = [],
  //       pending = [],
  //       now = moment();
  //   for (let i = 0; i < $scope.tasks.length; i++) {
  //     let status = $scope.tasks[i].status;
  //     if(!status.completed){
  //       if(status.active) active.push($scope.tasks[i]);
  //       if(status.pending) pending.push($scope.tasks[i]);
  //     }
  //   }
  //   // Update any active tasks
  //   for (let i = 0; i < active.length; i++) {
  //     let schedule = active[i].schedule;
  //     if(schedule.softDeadline.moment && moment(schedule.softDeadline.moment).isSameOrBefore(now)){
  //       active[i].status.pastDue = true;
  //       active[i].status.needsAttention = true;
  //       if(schedule.hardDeadline.moment) active[i].status.highPriority = true;
  //     }
  //     if(schedule.hardDeadline.moment && moment(schedule.hardDeadline.moment).isSameOrBefore(now)){
  //       active[i].status.active = false;
  //       active[i].status.scheduled = false;
  //       active[i].status.incomplete = true;
  //     }
  //   }
  //   // Update any pending tasks
  //   for (let i = 0; i < pending.length; i++) {
  //     let schedule = pending[i].schedule,
  //         status = pending[i].status;
  //     if(status.scheduled && moment(schedule.startTime.moment).isSameOrBefore(now)){
  //       status.active = true;
  //       status.pending = false;
  //     }
  //     if(!status.scheduled){
  //       // Check to see if all of the prerequisits have been met, and if so, schedule the task
  //     }
  //   }
  //   let scheduled = [];
  //   for (var i = 0; i < $scope.tasks.length; i++) {
  //     if($scope.tasks[i].status.scheduled) scheduled.push($scope.tasks[i]);
  //   }
  //   return scheduled;
  // }
  //
  // console.log('Tasks: ', $scope.tasks);

  $scope.now = moment();
  $scope.currentMinute = 5 + ($scope.now.hour()*60) + ($scope.now.minute()) + 'px';
  $scope.month = buildMonth();
  console.log($scope.now);
  console.log($scope.currentMinute);

//------------------------------  DATA TRANSFERS -----------------------------//
    // GET Methods
    // $scope.getTasks = function(){
    //   dataSvc.getTasks().then(
    //         function(result){console.log('calendar retrieve'); $scope.tasks = dataSvc.tasks = result.data;
    //         console.log(result.data[0].schedule);},
    //         function(error){console.log("Failed to get tasks.", error);}
    //   );
    // };
    // if(dataSvc.tasks) $scope.tasks = dataSvc.tasks;
    // else $scope.getTasks();
//----------------------------------------------------------------------------//

  //Update $scope.now with the current time once every 60 seconds
  let minuteIteration = $interval(function(){
    $scope.now = moment();
    let hour = $scope.now.hour(),
        minute = $scope.now.minute();
    //Move the blue time bar up a minute
    $scope.currentMinute = 5 + (hour*60) + (minute) + 'px';
    //Check for new hour or day and update the DOM accordingly
    if(hour === 0 && minute === 0) $scope.month.rebuild($scope.now);
    else if ($scope.month.moment.isSame($scope.now, 'day')) {
      for (let i = 0; i <= hour; i++) { $scope.month.hours[i] = false; }
      for (let i = hour +1; i < 24; i++) { $scope.month.hours[i] = true; }
    }
    console.log($scope.now);
    console.log($scope.currentMinute);
  }, 60000);
  $scope.$on('$destroy', function () { $interval.cancel(minuteIteration); });

  //Build the month object
  function buildMonth(selectedMoment){
    let date;
    date = selectedMoment ? moment(selectedMoment) : moment();
    let month = {
      'moment': date,
      'name': date.format('MMMM'),
      'daysInMonth': date.daysInMonth(),
      'weeks': buildWeeks(date.clone().startOf('month')),
      'currentWeek': buildWeek(date),
      'hours': buildHours(date),
      rebuild (newMoment) {$scope.month = buildMonth(newMoment);}
    };
    console.log('Month: ', month);
    return month;
  }

  //BUILD WEEKS
  function buildWeeks(day){
    let weeks = [],
        week = [],
        month = day.month();
    day = day.startOf('week');
    do {
      for (let i = 0; i < 7; i++) {
        week.push(day.clone());
        day = day.add(1, 'days');
      }
      weeks.push(week);
      week = [];
    }while(day.month() === month);
    return weeks;
  }

  //BUILD CURRENT WEEK
  function buildWeek(moment){
    let week = [],
        day = moment.clone().startOf('week');
    for (let i = 0; i < 7; i++) {
      week.push(day.clone());
      day = day.add(1, 'days');
    }
    return week;
  }

  //Update each hour with the 'invalid' property if appropriate
  function buildHours(date){
    let hours = [];
    if (date.isBefore($scope.now, 'day')){
      for (let i = 0; i < 24; i++) { hours[i] = false; }
    }
    else if (date.isAfter($scope.now, 'day')){
      for (let i = 0; i < 24; i++) { hours[i] = true; }
    }
    else {
      let hour = $scope.now.hour();
      for (let i = 0; i <= hour; i++) { hours[i] = false; }
      for (let i = hour +1; i < 24; i++) { hours[i] = true; }
    }
    return hours;
  }
}

calendarCtrl.$inject = [`$scope`, `dataSvc`, `moment`, `$interval`];
