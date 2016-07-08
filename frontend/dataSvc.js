export default function dataSvc ($http, moment) {

  let self = this;
  ///// VARIABLES THAT WILL BE ADDED TO dataSvc LATER //////////////
  //  self.user = {The User currently logged in}
  //          .tasks = [All tasks belonging to this user]
  //          .agenda = [All scheduled tasks organized by date]
  //  self.schedule
  //  self.scheduleNames
  //////////////////////////////////////////////////////////////////

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

/////////////////////////////////  TASKS  //////////////////////////////////////
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
  this.deleteTasks = function(id){
    return $http.delete('/api/task/'+id);
  };
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
    console.log('Agends built: ', agenda); //test
    this.agenda = agenda;
    this.agenda.map = agendaMap;
  };
  // this.updateAgenda = (task, date) => {
  //   if()
  //   for (let i = 0; i < this.agenda[date].length; i++) {
  //     this.agenda[date][i]
  //   }
  // };
//----------------------------------------------------------------------------//

}

dataSvc.$inject = [`$http`, `moment`];
