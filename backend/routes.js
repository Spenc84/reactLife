var ctrl = require('./backendControl');

module.exports = function( app ){
      // --- USERS ---
  app.route('/api/users')
     .get(ctrl.getUsers)
     .post(ctrl.postUser);
  app.route('/api/user/:id')
     .get(ctrl.getUser)
     .put(ctrl.editUser)
     .delete(ctrl.deleteUser);
  app.route('/api/users/:ids/:keys/:values')
     .put(ctrl.editUsers);

     // --- TASKS ---
  app.route('/api/tasks')
     .get(ctrl.getTasks)
     .post(ctrl.postTask);
  app.route('/api/task/:id')
     .get(ctrl.getTask)
     .put(ctrl.editTask)
     .delete(ctrl.deleteTasks);
  app.route('/api/tasks/:ids/:keys/:values')
     .put(ctrl.editTasks);

  app.route('/api/test')
     .get(ctrl.getTest);

     // --- EVENTS ---
  // app.route('/api/events')
  //   .get(ctrl.getEvents)
  //   .post(ctrl.postEvent);
  // app.route('/api/event/:id')
  //   .get(ctrl.getEvent)
  //   .put(ctrl.editEvent)
  //   .delete(ctrl.deleteEvent);
};
