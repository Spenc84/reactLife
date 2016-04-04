/* jshint esversion: 6 */

angular.module('lifeApp')
.controller('calendarCtrl', function($scope, calendarSvc, moment){
  $scope.month = buildMonth();
  console.log($scope.month);

  function buildMonth(format){
    let date;
    format ? date = moment(format) : date = moment();

    let month = {
      'name': date.format('MMMM'),
      'daysInMonth': date.daysInMonth(),
      'firstDay': date.clone().startOf('month').day(),
      'weeks': buildWeeks(this.daysInMonth + this.firstDay),
      'rebuild': buildMonth
    };

    console.log(month);
    console.log(month.name);
    console.log(month.daysInMonth);
    console.log(month.firstDay);
    console.log(month.weeks);
    console.log(date);
    return month;
  }
  function buildWeeks(numDays){
    let weeks = [],
        numWeeks = 0;
    if(numDays <= 28) numWeeks = 4;
    else if(numDays >= 36) numWeeks = 6;
    else numWeeks = 5;

    for (let i = 0; i < numWeeks; i++) {
      weeks.push(buildWeek());
    }
    return weeks;
  }
  function buildWeek(){
    let week = [];
    for (let i = 0; i < 7; i++) {
      week.push(buildDay());
    }
    return week;
  }
  function buildDay(){
    let day = {};

    return day;
  }
});
