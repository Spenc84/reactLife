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

    app.route('/api/update')
        .get(ctrl.updateData);
    app.route('/api/test')
        .get(ctrl.getTest);

     // --- TASKS ---
    app.route('/api/tasks')
        .get(ctrl.getTasks)
        .put(ctrl.updateTasks)
        .post(ctrl.updateTasks);
    app.route('/api/task/:id')
        .get(ctrl.getTask)
    app.route('/api/tasks/:ids/:keys/:values')
        .put(ctrl.editTasks);
};
