angular.module('lifeApp')
.controller('projectCtrl', function($scope, $state, PriorState){
  //record the name of the view that the user came to this view from
  if(PriorState.Name) $scope.priorView = PriorState.Name + "({ optionFlag: 's' })";
  else $scope.priorView = "list.star";

  
  // $scope.project = {
  //   "name": "",
  //   "completed": false
  // };
});
