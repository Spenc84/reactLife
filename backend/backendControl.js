//  OLD MONGO STYLE
// var mongo = require('mongojs'),
//      db = mongo('database', ['data']),
//      data = db.collection('data');

var Task = require('./Task'),
    User = require('./User');

var cb = function(res){
  return function(error, response){
    if(error) res.status(500).json(error);
    else res.status(200).json(response);
  };
};

module.exports = {
  // ----- USERS -----
  postUser: function( req, res ){
    User.create(req.body, cb(res));
  },
  getUsers: function( req, res ){
    User.find({}, cb(res));
  },
  getUser: function( req, res ){
    User.findById(req.params.id, cb(res));
  },
  editUser: function( req, res ){
    User.findByIdAndUpdate(req.params.id, req.body, cb(res));
  },
  editUsers: function( req, res ){
    console.log(req.params);
    var set = {},
        items = req.params.ids.split(','),
        keys = req.params.keys.split(','),
        values = JSON.parse(req.params.values);
    console.log(items);
    console.log(keys);
    console.log(values);
    for (var i = 0; i < keys.length; i++) {
      set[keys[i]] = values[i];
    }
    console.log(set);
    User.update({ _id: { $in: items } }, {$set: set}, {multi: true, upsert: true}, cb(res));
  },
  deleteUser: function( req, res ){
    User.findByIdAndRemove(req.params.id, cb(res));
  },

  // ----- TASKS -----
  postTask: function( req, res ){
    Task.create(req.body, cb(res));
  },
  getTasks: function( req, res ){
    Task.find(req.query, cb(res));
  },
  getTask: function( req, res ){
    Task.findById(req.params.id, cb(res));
  },
  editTask: function( req, res ){
    Task.findByIdAndUpdate(req.params.id, req.body, {new: true}, cb(res));
  },
  editTasks: function( req, res ){
    console.log(req.params);
    var set = {},
        items = req.params.ids.split(','),
        keys = req.params.keys.split(','),
        values = JSON.parse(req.params.values);
    console.log(items);
    console.log(keys);
    console.log(values);
    for (var i = 0; i < keys.length; i++) {
      set[keys[i]] = values[i];
    }
    console.log(set);
    Task.update({ _id: { $in: items } }, {$set: set}, {multi: true, upsert: true}, cb(res));
  },
  deleteTasks: function( req, res ){
    console.log(req.params.id);
    var items = req.params.id.split(',');
    console.log(items);
    Task.remove({ _id: { $in: items } }, cb(res));
  },
  deleteTask: function( req, res ){
    Task.findByIdAndRemove(req.params.id, cb(res));
  },

  // ----- AGENDA -----
  getAgenda: function( req, res ){
    // User.findById(req.params.id, function(error, response){
    //   if(error) res.status(500).json(error);
    //   else res.status(200).json(response.agenda);
    // });
    res.status(200).send();  // REMOVE ME
  },
  updateAgenda: function( req, res ){
    // Task.create(req.body, cb(res));
    res.status(200).send();   // REMOVE ME
  },
  updateCron: function( req, res ){
    // Task.create(req.body, cb(res));
    res.status(200).send();   // REMOVE ME
  }
};
