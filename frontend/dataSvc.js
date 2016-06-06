export default function dataSvc ($http) {

  let self = this;
  ///// VARIABLES THAT WILL BE ADDED TO dataSvc LATER //////////////
  //  self.user = {The User currently logged in}
  //          .tasks = [All tasks belonging to this user]
  //          .agenda = [All scheduled tasks organized by date]
  //  self.schedule
  //  self.scheduleNames
  //////////////////////////////////////////////////////////////////

/////////////////////////////////  TASKS  //////////////////////////////////////
  this.getTasks = function(){
    return $http.get("/api/tasks");
  };
  this.getTask = function(id){
    return $http.get("/api/task/"+id);
  };
  this.saveNewTask = function(task){
    console.log("sending " + task);
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

////////////////////////////////  AGENDA  //////////////////////////////////////
  this.getAgenda = function(){
    return $http.get(`/api/user/${self.user._id}/agenda`);
  };
  this.updateAgenda = function(yr, mo, day, hr, min, key, ids){
    $http.put(`/api/cron/${yr}/${mo}/${day}/${hr}/${min}/${key}/${ids}`);
    return $http.put(`/api/user/${self.user._id}/agenda/${yr}/${mo}/${day}/${hr}/${min}/${key}/${ids}`);
  };
//----------------------------------------------------------------------------//

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

}

dataSvc.$inject = [`$http`];
