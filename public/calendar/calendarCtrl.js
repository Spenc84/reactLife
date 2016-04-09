/* jshint esversion: 6 */

angular.module('lifeApp')
.controller('calendarCtrl', function($scope, $rootScope, $state, calendarSvc, moment, $interval){
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
      for (let i = 0; i < 24; i++) {
        if(i <= hour) $scope.month.hours[i] = false;
        else $scope.month.hours[i] = true;
      }
    }
    console.log($scope.now);
    console.log($scope.currentMinute);
  }, 60000);
  $scope.$on('$destroy', function () { console.log('DANGER WILL ROBINSON!!'); $interval.cancel(minuteIteration); });

  //Build the month object
  function buildMonth(format){
    let date;
    format ? date = moment(format) : date = moment();
    let month = {
      'moment': date,
      'name': date.format('MMMM'),
      'daysInMonth': date.daysInMonth(),
      'weeks': buildWeeks(date.clone().startOf('month')),
      'currentWeek': buildWeek(date),
      'hours': buildHours(date),
      rebuild (format) {$scope.month = buildMonth(format);}
    };
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
    console.log(hours);
    if (date.isBefore($scope.now, 'day')){
      for (let i = 0; i < 24; i++) {
        hours[i] = false;
      }
      console.log('Hidy');
    }
    else if (date.isAfter($scope.now, 'day')){
      for (let i = 0; i < 24; i++) {
        hours[i] = true;
      }
      console.log('ho');
    }
    else {
      for (let i = 0; i < 24; i++) {
        if(i <= $scope.now.hour()) hours[i] = false;
        else hours[i] = true;
      }
      console.log('neighbor');
    }
    console.log(hours);
    return hours;
  }
});
