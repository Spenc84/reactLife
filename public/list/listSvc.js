angular.module('lifeApp')
.service('listSvc', function($http){

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
  this.deleteTasks = function(id){
    return $http.delete('/api/task/'+id);
  };

});
