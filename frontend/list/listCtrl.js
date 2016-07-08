export default function listCtrl($rootScope, $scope, $state, dataSvc, PriorState, moment) {
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
  $scope.toggleEditItemPane = (task) => {
    if(task){ $scope.editItemPaneFlag = true; $scope.task = task; }
    else { $scope.editItemPaneFlag = false; $scope.task = null; }
  };
      // new item
  $scope.newItemPaneFlag = false;
  $scope.newItem = {};
  $scope.toggleNewItemPane = () => {
      $scope.newItemPaneFlag = !$scope.newItemPaneFlag;
  };

  // quickScheduler flags
  // main modal
  $scope.openQuickScheduler = () => { $scope.quickSchedulerFlag = true; };
  $scope.closeQuickScheduler = (completed) => {
    $scope.quickSchedulerFlag = false;
    if(completed) $scope.toggleEditOff();
  };

  // toggle the individual statuses
  $scope.toggleCompleted = () => {
    let completedFlag = true;
    for (let i = 0; i < $scope.tasks.length; i++) {
      if($scope.tasks[i].status.editable){
        if($scope.tasks[i].status.completed) completedFlag = false;
        $scope.tasks[i].status.completed = completedFlag;
      }
    }
    $scope.editTasks('status.completed', [completedFlag]);
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
    $scope.editTasks('status.starred', [starFlag]);
    $scope.toggleEditOff();
  };

  // When you leave the current view, change any editable task items back to uneditable
  $rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams){
    $scope.toggleEditOff();
  });





//------------------------------  DATA TRANSFERS ------------------------------
  // Data transfer variables
  let modified = {};
  $scope.tasks = dataSvc.tasks;
  $scope.user = dataSvc.user;

  // GET Methods
  $scope.getTasks = function(){
    dataSvc.getTasks().then(
          function(result){console.log('list retrieve'); $scope.tasks = dataSvc.tasks = result.data;},
          function(error){console.log("Failed to get tasks.", error);}
    );
  };

  // POST Methods
  $scope.saveNew = () => {
    function buildNewTask(now){
      $scope.newItem.status = $scope.newItem.status || {};
      $scope.newItem.status.inactive = false;
      $scope.newItem.schedule = {
        startTime: {
            moment: now,
            year: now.year(),
            month: now.month(),
            day: now.date(),
            hour: now.hour(),
            minute: 0,
            top: (now.hour()*60)+5 },
        availability: []
      };
      for(let i = 0; i < 7; i++){
        let hourArray = [];
        for (let j = 0; j < 8; j++) { hourArray.push(0); }
        for (let j = 8; j < 22; j++) { hourArray.push(1); }
        for (let j = 22; j < 24; j++) { hourArray.push(0); }
        $scope.newItem.schedule.availability.push(hourArray);
      }
    }
    // If new item is saved from the 'active' view
    if($state.current.name === "list.active"){
      buildNewTask(moment().startOf('hour'));
      $scope.newItem.status.active = true;
    }
    // If new item is saved from the 'pending' view
    if($state.current.name === "list.pending"){
      buildNewTask(moment().add(1, 'day').startOf('hour'));
      $scope.newItem.status.pending = true;
    }
    dataSvc.saveNewTask($scope.newItem).then(
      function(res){
        console.log("saved", res);
        $scope.newItem = {};
        $scope.tasks.push(res.data);
      },
      function(err){ console.log(err); }
    );
  };

  // PUT methods
  $scope.editTasks = (keysToChange, newValues) => {
    let tasksToChange = [],
        {tasks} = $scope;
    for (let i = 0; i < tasks.length; i++) {
      if(tasks[i].status.editable) tasksToChange.push(tasks[i]._id);
    }
    dataSvc.editTasks(tasksToChange, keysToChange, newValues).then(
      function( res ){ console.log("item(s) saved", res); },
      function( err ){ console.log("Error while saving: ", err); }
    );
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

listCtrl.$inject = [`$rootScope`, `$scope`, `$state`, `dataSvc`, `PriorState`, `moment`];
