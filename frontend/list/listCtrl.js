export default function listCtrl($rootScope, $scope, dataSvc, PriorState, moment) {
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

  // toggle the scheduler window on and off
  $scope.toggleScheduler = () => {
      $scope.schedulerFlag = !$scope.schedulerFlag;
      console.log("schedulerFlag: ", $scope.schedulerFlag);
  };
  // quickScheduler flags
  // main modal
  $scope.toggleQuickScheduler = () => {
      $scope.quickSchedulerFlag = !$scope.quickSchedulerFlag;
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
  $scope.tasks = dataSvc.tasks;

  // GET Methods
  $scope.getTasks = function(){
    dataSvc.getTasks().then(function( res, err ){
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
    dataSvc.saveNewTask($scope.newItem).then(function( res, err ){
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
    dataSvc.saveTask($scope.tasks[index]).then(function( res, err ){
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
    dataSvc.editTasks(modified.itemsToBeChanged, requestedChange, reqValue).then(function( res, err ){
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
    dataSvc.deleteTasks(modified.deletedId).then(function( res, err ){
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
}

listCtrl.$inject = [`$rootScope`, `$scope`, `dataSvc`, `PriorState`, `moment`];
