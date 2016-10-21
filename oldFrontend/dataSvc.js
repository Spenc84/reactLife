export default function dataSvc ($http, $q, moment) {
    /* DATA STRUCTURE--
        user = {userObject}
        agenda = [
            {
                date: "String",
                start: [taskIds],
                soft: [taskIds],
                hard: [taskIds]
            }
        ]
        tasks = [taskObjects]
        map = { ${taskIds}: ${index in task array} }
    */

    this.loaded = false;
    this.user = {};
    this.tasks = [];
    this.agenda = [];
    this.map = {};

    let _changeListeners = [];

    init.call(this);  // TEMP

    // Aquire data from the server
    function init(id, password) {
        let deferred = $q.defer();
        // $http.get(`/api/user/${id}/${password}`).then(
        $http.get("/api/user/575350c7b8833bf5125225a5").then(  // TEMP
            incoming => {
                this.loaded = true;
                this.user = incoming.data || {};
                this.tasks = this.user.tasks || [];
                this.agenda = this.user.agenda || [];
                this.map = (this.tasks) ? Index(this.tasks) : {};
                console.log(`User Authenticated: `, this.user);
                deferred.resolve(`User Authenticated.`);
                notifyChange();
            },
            rejected => {
                alert("Failed to aquire user");
                deferred.reject("Failed to aquire user");
            }
        );
        return deferred.promise;
    }

    // Used to index the tasks array by tasks._id
    function Index(array) {
        let newMap = {};
        array.forEach((e,i)=>newMap[e._id] = i);
        return newMap;
    }

    // Used to add, call, and remove custom event listeners
    function notifyChange() { _changeListeners.forEach(listener=>listener()); }
    this.addListener = (listener) => {
        _changeListeners.push(listener);
        return this.removeListener.bind(this, listener);
    };
    this.removeListener = function(listener) {_changeListeners = _changeListeners.filter(l=>listener !== l); };

  /////////////////////////////////  USERS  //////////////////////////////////////
    this.getUsers = function(){
      return $http.get("/api/users");
    };
    this.getUser = function(id){
      // return $http.get("/api/user/"+id);
      return $http.get("/api/user/575350c7b8833bf5125225a5");  // TEMP
    };
    this.saveNewUser = function(user){
      console.log("sending " + user);
      return $http.post('/api/users', user);
    };
    this.saveUser = function(user){
      return $http.put('/api/user/'+user._id, user);
    };
    this.editUsers = function(itemsToBeChanged, keysToChange, newValues){
      console.log(itemsToBeChanged, keysToChange, newValues);
      return $http.put('/api/users/'+itemsToBeChanged+"/"+keysToChange+"/"+JSON.stringify(newValues));
    };
    this.deleteUsers = function(id){
      return $http.delete('/api/user/'+id);
    };
  //----------------------------------------------------------------------------//

///////////////////////////////  NEW TASKS  ////////////////////////////////////
this.addTask = (task) => {
    console.log("sending ", task);
    $http.post('/api/tasks', task).then(
        res=>{
            if(task.status.scheduled) updateAgenda.addItem(task);
            tasks.push(task);
            map[task._id] = tasks.length-1;
            notifyChange();
        },
        err=>alert(err)
    );
};
this.deleteTasks = (ids) => {
    if(typeof ids === 'string') ids = [ids];
    $http.delete(`/api/task/${ids}`).then(
        res=>{
            for(let id in ids) {
                let indx = map[ids[id]],
                    task = tasks[indx];
                if(task.status.scheduled) updateAgenda.removeItem(task);
                tasks.splice(indx, 1);
            }
            map = Index(tasks);
            notifyChange();
        },
        err=>alert(err)
    );
};
this.updateTask = (task) => {
    $http.put(`/api/task/${task._id}`, task).then(
        res=>{
            tasks[map[task.id]] = task;
            notifyChange();
        },
        err=>alert(err)
    );
};
///////////////////////////////  OLD TASKS  ////////////////////////////////////
  this.getTasks = function(){
    return $http.get("/api/tasks");
  };
  this.getTask = function(id){
    return $http.get("/api/task/"+id);
  };
  this.saveNewTask = function(task){
    console.log("sending ", task);
    return $http.post('/api/tasks', task);
  };
  this.saveTask = function(task){
    return $http.put('/api/task/'+task._id, task);
  };
  this.editTasks = function(itemsToBeChanged, keysToChange, newValues){
    console.log(itemsToBeChanged, keysToChange, newValues);
    return $http.put('/api/tasks/'+itemsToBeChanged+"/"+keysToChange+"/"+JSON.stringify(newValues));
  };
  // this.deleteTasks = function(id){
  //   return $http.delete('/api/task/'+id);
  // };
//----------------------------------------------------------------------------//

////////////////////////////////  AGENDA  ////////////////////////////////////// //test
  this.buildAgenda = () => {
    let agenda = {},
        today = moment().startOf('day').format('x'),
        agendaMap = [today];
        agenda[today] = [];

    for (let i = 0; i < this.tasks.length; i++) {
      let task = this.tasks[i];
      if(task.status.scheduled) {
        let sDate = moment(task.schedule.startTime.moment).startOf('day').format('x');
        if(agenda[sDate]) agenda[sDate].push(task);
        else { agenda[sDate] = [task]; agendaMap.push(sDate); }
      }
    }
    console.log('Agenda built: ', agenda); //test
    this.agenda = agenda;
    this.agenda.map = agendaMap;
  };
  function displayAgenda() {
      for(let day in agenda){
          console.log(day.date);
          for(let task in day.start){
              console.log(task.name);
          }
      }
  }

} dataSvc.$inject = [`$http`, `$q`, `moment`];
