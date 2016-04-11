var ctrl = require('../controllers/backendControl');

module.exports = function( app ){
      // --- USERS ---
  app.route('/api/users')
     .get(ctrl.getUsers)
     .post(ctrl.postUser);
  app.route('/api/user/:id')
     .get(ctrl.getUser)
     .put(ctrl.editUser)
     .delete(ctrl.deleteUser);

     // --- TASKS ---
  app.route('/api/tasks')
     .get(ctrl.getTasks)
     .post(ctrl.postTask);
  app.route('/api/task/:id')
     .get(ctrl.getTask)
     .put(ctrl.editTask)
     .delete(ctrl.deleteTasks);

     // --- DATES ---
  // app.route('/api/dates')
  //   .get(ctrl.getDates)
  //   .post(ctrl.postDate);
  // app.route('/api/date/:id')
  //   .get(ctrl.getDate)
  //   .put(ctrl.editDate)
  //   .delete(ctrl.deleteDate);

     // --- EVENTS ---
  // app.route('/api/events')
  //   .get(ctrl.getEvents)
  //   .post(ctrl.postEvent);
  // app.route('/api/event/:id')
  //   .get(ctrl.getEvent)
  //   .put(ctrl.editEvent)
  //   .delete(ctrl.deleteEvent);
};
