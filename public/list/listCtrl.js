/* jshint esversion: 6 */

angular.module('lifeApp')
.controller('listCtrl', function($scope, listSvc, PriorState){
  //record the name of the view that the user came to this state from
  if(PriorState.Name) $scope.calendarView = PriorState.Name + "({ optionFlag: 's' })";
  else $scope.calendarView = "calendar.agenda";

  $scope.title = 'Projects';

  //search query flags
  $scope.query = {
    "active": false,
    "pending": false,
    "inactive": false,
    "completed": false,
    "scheduled": false,
    "unscheduled": false,
    "highPriority": false,
    "lowPriority": false,
    "reoccuring": false,
    "and": false,
    "reverse": false
  };
  $scope.toggle = (object, key) => {
    object[key] = !object[key];
  };
  $scope.toggleAll = () => {
    for(var key in $scope.query){
      if(key !== 'and') $scope.query[key] = !$scope.query[key];
    }
  };
});
