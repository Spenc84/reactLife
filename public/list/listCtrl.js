/* jshint esversion: 6 */
angular.module('lifeApp')
.controller('listCtrl', function($rootScope, $scope, listSvc, PriorState, moment){
  //record the name of the view that the user came to this view from
  if(PriorState.Name) $scope.priorView = PriorState.Name; // + "({ optionFlag: 's' })";
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
    for(let key in $scope.query){
      if(key !== 'and') $scope.query[key] = !$scope.query[key];
    }
  };


  //---------------------------  Edit Toggles  ---------------------------------
  // toggles whether or not individual item rows are editable
  $scope.editableItems = 0;
  $scope.toggleEdit = (task) => {
    $scope.tasks[task].status.editable = !$scope.tasks[task].status.editable;
    if($scope.tasks[task].status.editable) $scope.editableItems++;
    else $scope.editableItems--;
  };
  $scope.toggleEditOff = () => {
    $scope.editableItems = 0;
    for (let i = 0; i < $scope.tasks.length; i++) {
      $scope.tasks[i].status.editable = false;
    }
  };
  // toggle the main edit panes
      // existing item
  $scope.editItemPaneFlag = false;
  $scope.editPaneIndx = null;
  $scope.toggleEditItemPane = (indx) => {
    if(indx || indx === 0){
      $scope.editItemPaneFlag = true;
      $scope.editPaneIndx = indx;
    }
    else {
      $scope.editItemPaneFlag = false;
      $scope.editPaneIndx = null;
    }
  };
      // new item
  $scope.newItemPaneFlag = false;
  $scope.newItem = {};
  $scope.toggleNewItemPane = () => {
      $scope.newItemPaneFlag = !$scope.newItemPaneFlag;
  };

  // quickScheduler flags
  // main modal
  $scope.toggleQuickScheduler = () => {
      $scope.quickSchedulerFlag = !$scope.quickSchedulerFlag;
  };
      // header (for selecting the duration)
      $scope.duration = {
        instant: true,
        min30: false,
        hr1: false,
        hr4: false,
        hr8: false,
        hr24: false,
        hidden: true,
        length: 0
      };
      $scope.toggleDuration = key => {
        if($scope.duration.hidden) {
          for (let keys in $scope.duration) {
            $scope.duration[keys] = true;
          }
          $scope.duration.hidden = false;
        } else {
          for (let keys in $scope.duration) {
            $scope.duration[keys] = false;
          }
          $scope.duration[key] = true;
          $scope.duration.hidden = true;
          switch (key) {
            case 'instant':
                $scope.duration.length = 0;
                break;
            case 'min30':
                $scope.duration.length = 30;
                break;
            case 'hr1':
                $scope.duration.length = 60;
                break;
            case 'hr4':
                $scope.duration.length = 240;
                break;
            case 'hr8':
                $scope.duration.length = 480;
                break;
            case 'hr24':
                $scope.duration.length = 1440;
                break;
          }
        }
      };

  // toggle individual statuses
  $scope.toggleCompleted = () => {
    let completedFlag = true;
    for (let i = 0; i < $scope.tasks.length; i++) {
      if($scope.tasks[i].status.editable){
        if($scope.tasks[i].status.completed) completedFlag = false;
        $scope.tasks[i].status.completed = !$scope.tasks[i].status.completed;
      }
    }
    $scope.editTasks('status.completed', completedFlag);
    $scope.toggleEditOff();
  };
  $scope.toggleActive = () => {
    for (let i = 0; i < $scope.tasks.length; i++) {
      if($scope.tasks[i].status.editable){
        $scope.tasks[i].status.active = !$scope.tasks[i].status.active;
        $scope.tasks[i].status.inactive = !$scope.tasks[i].status.inactive;
        $scope.tasks[i].status.pending = false;
      }
    }
    $scope.toggleEditOff();
  };
  $scope.toggleStarred = () => {
    let starFlag = false;
    for (let i = 0; i < $scope.tasks.length; i++) {
      if($scope.tasks[i].status.editable && !$scope.tasks[i].status.starred){
          starFlag = true;
      }
    }
    for (let i = 0; i < $scope.tasks.length; i++) {
      if($scope.tasks[i].status.editable)
        $scope.tasks[i].status.starred = starFlag;
    }
    $scope.editTasks('status.starred', starFlag);
    $scope.toggleEditOff();
  };
  $rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams){
    $scope.toggleEditOff();
  });





//------------------------------  DATA TRANSFERS ------------------------------
  // Data transfer variables
  let modified = {};

  // GET Methods
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

  // POST Methods
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

  // PUT methods
  $scope.saveTask = (index) => {
    listSvc.saveTask($scope.tasks[index]).then(function( res, err ){
      if(err) console.log(err);
      else {
        console.log("saved", res);
        $scope.tasks[index] = res.data;
      }
    });
  };
  $scope.editTasks = (requestedChange, reqValue) => {
    modified.itemsToBeChanged = [];
    for (let i = 0; i < $scope.tasks.length; i++) {
      if($scope.tasks[i].status.editable){
        modified.itemsToBeChanged.push($scope.tasks[i]._id);
      }
    }
    listSvc.editTasks(modified.itemsToBeChanged, requestedChange, reqValue).then(function( res, err ){
      if(err) console.log(err);
      else console.log("item(s) saved", res);
    });
  };

  //DELETE METHODS
  $scope.deleteTask = function(){
    modified.deletedId = [];
    modified.deletedIndx = [];
    for (let i = 0; i < $scope.tasks.length; i++) {
      if($scope.tasks[i].status.editable){
        modified.deletedId.push($scope.tasks[i]._id);
        modified.deletedIndx.push(i);
      }
    }
    listSvc.deleteTasks(modified.deletedId).then(function( res, err ){
      if(err) console.log(err);
      else {
        console.log("task(s) deleted");
        console.log(res.data);
        for (let i = modified.deletedIndx.length; i > 0; i--) {
          $scope.tasks.splice(modified.deletedIndx[i-1], 1);
        }
        modified.deletedId = [];
        modified.deletedIndx = [];
        $scope.editableItems = 0;
      }
    });
  };
});
