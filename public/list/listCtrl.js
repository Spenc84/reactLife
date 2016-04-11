/* jshint esversion: 6 */
angular.module('lifeApp')
.controller('listCtrl', function($rootScope, $scope, listSvc, PriorState){
  //record the name of the view that the user came to this view from
  if(PriorState.Name) $scope.priorView = PriorState.Name + "({ optionFlag: 's' })";
  else $scope.priorView = "calendar.agenda";

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

  //Search Toggles
  $scope.toggle = (object, key) => {
    object[key] = !object[key];
  };
  $scope.toggleAll = () => {
    for(var key in $scope.query){
      if(key !== 'and') $scope.query[key] = !$scope.query[key];
    }
  };


  //  ----------  Edit Toggles  ----------
  $scope.editableItems = 0;
  $scope.toggleEdit = (task) => {
    $scope.tasks[task].status.editable = !$scope.tasks[task].status.editable;
    if($scope.tasks[task].status.editable) $scope.editableItems++;
    else $scope.editableItems--;
  };
  $scope.toggleEditOff = () => {
    $scope.editableItems = 0;
    for (var i = 0; i < $scope.tasks.length; i++) {
      $scope.tasks[i].status.editable = false;
    }
  };
  $scope.toggleCompleted = () => {
    for (var i = 0; i < $scope.tasks.length; i++) {
      if($scope.tasks[i].status.editable)
        $scope.tasks[i].status.completed = !$scope.tasks[i].status.completed;
    }
    $scope.toggleEditOff();
  };
  $scope.toggleStarred = () => {
    for (var i = 0; i < $scope.tasks.length; i++) {
      if($scope.tasks[i].status.editable)
        $scope.tasks[i].status.starred = !$scope.tasks[i].status.starred;
    }
  };
  $rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams){
    $scope.toggleEditOff();
  });





  // ----------  Data Transfers ----------
  $scope.newItem = {};
  let modified = {};
  $scope.saveNew = () => {
    listSvc.saveNewTask($scope.newItem).then(function( res, err ){
      if(err) console.log(err);
      else {
        console.log("saved", res);
        $scope.newItem = {};
        $scope.tasks.push(res.data);
      }
    });
  };
  $scope.saveTask = (index) => {
    listSvc.saveTask($scope.tasks[index]).then(function( res, err ){
      if(err) console.log(err);
      else {
        console.log("saved", res);
        $scope.tasks[index] = res.data;
      }
    });
  };
  $scope.getTasks = function(){
    listSvc.getTasks().then(function( res, err ){
      if(err) console.log(err);
      else {
        console.log("tasks retrieved", res.data);
        $scope.tasks = res.data;
      }
    });
  };
  $scope.getTasks();

  //DELETE METHODS
  $scope.deleteTask = function(){
    modified.deleted = [];
    for (var i = 0; i < $scope.tasks.length; i++) {
      if($scope.tasks[i].status.editable){
        modified.deleted.push($scope.tasks[i]._id);
      }
    }
    console.log(modified);
    listSvc.deleteTasks(modified.deleted).then(function( res, err ){
      if(err) console.log(err);
      else {
        console.log("task(s) deleted");
        console.log(res.data);
        // $scope.getTasks();
      }
    });
    modified = {};
  };
  this.getTask = function(index){
    return $http.get("/api/task/"+id);
  };
  this.saveTask = function(id){
    return $http.put('/api/task/'+id);
  };
});
