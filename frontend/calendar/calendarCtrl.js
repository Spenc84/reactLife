export default function calendarCtrl($scope, dataSvc, moment, $interval) {
  $scope.tasks = dataSvc.tasks;
  $scope.user = dataSvc.user;
  console.log('Tasks: ', $scope.tasks);
  console.log(`User: `, $scope.user);
  

  $scope.now = moment();
  $scope.currentMinute = 5 + ($scope.now.hour()*60) + ($scope.now.minute()) + 'px';
  $scope.month = buildMonth();
  console.log($scope.now);
  console.log($scope.currentMinute);

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
      let newDay = day.clone(),
          tasks = [];
      for (let i = 0; i < $scope.tasks.length; i++) {
        let start = $scope.tasks[i].schedule.startTime.moment;
        if(day.isSame(start, 'day')) tasks.push($scope.tasks[i]);
      }
      newDay.tasks = tasks;
      week.push(newDay);
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
