// Import document schemas
import Task from './Task';
import User from './User';

////////////////////////////////////////////////////////////////////////////////
// Run a function every 15 minutes that will update tasks and notify users
// concerning task start times and deadlines
  import moment from 'moment';
  // Calculate an offset so that the reoccuring function starts exactly when the
  // clock hits a time that's divisable by 15
  let updateInterval;
  restartUpdateInterval();
  function restartUpdateInterval() {
    let now = moment(),
        offset = (15-(now.minute()%15))*60000;
    offset -= now.second()*1000;
    offset -= now.millisecond();
    console.log(`(re)started periodic task updates`);
    setTimeout(function(){ updateInterval = setInterval(periodicUpdate, 15*60000); periodicUpdate(); }, offset);
  }


  // This is the function that will run every 15 minutes
  function periodicUpdate(){
    let now = moment(),
        minute = moment().startOf('minute');

    console.log('Time check: ', minute._d.toJSON());
    // Over time, the small processing delay in setInterval will cause the check
    // to occur outside of the 15 minute quaters. When this happens, reset it.
    if(minute.minute() % 15 !== 0){
      clearInterval(updateInterval);
      restartUpdateInterval();
      while(minute.minute() % 15) minute.subtract(1, 'minute');
      console.log('New Minute: ', minute._d);
    }

    // This will check to see if any tasks are scheduled to start now, and if so,
    // will set it to active and notify any applicable users
    Task.find({'schedule.startTime.moment': minute._d.toJSON()}, (error, tasks)=>{
        if(error) console.log('Error finding tasks: ', error);
        else {
          console.log('tasks: ', tasks.length);
          for (let i = 0; i < tasks.length; i++) {
            console.log(tasks[i].name);
            tasks[i].status.pending = false;
            tasks[i].status.active = true;
            tasks[i].save(report);
          }
        }
    });
  }
  function report(error, resp){
    if(error) console.log('Error saving: ', error);
    else console.log('saved');
  }
////////////////////////////////////////////////////////////////////////////////

let cb = function(res){
    return function(error, response){
        if(error) res.status(500).json(error);
        else res.status(200).json(response);
    };
};


module.exports = {
    // updateData( req, res ){
    //     Task.find({}, (err, tasks)=>{
    //
    //         tasks.forEach(task => {
    //             task.schedule = {
    //               startTime: '',
    //               duration: 0,
    //               softDeadline: '',
    //               hardDeadline: '',
    //               availability
    //             }
    //             task.status.active = false;
    //             task.status.scheduled = false;
    //             task.status.inactive = true;
    //             task.save(report);
    //         });
    //     });
    // },
    getTest( req, res ){
        console.log(req.query);
        Task.find(req.query, cb(res));
    },
    // ----- USERS -----
    postUser: function( req, res ){
        User.create(req.body, cb(res));
    },
    getUsers: function( req, res ){
        User.find({}, cb(res));
    },
    getUser: function( req, res ){
        User.findById(req.params.id, cb(res)).populate('tasks');
    },
    editUser: function( req, res ){
        User.findByIdAndUpdate(req.params.id, req.body, cb(res));
    },
    editUsers: function( req, res ){
        console.log(req.params);
        let set = {},
            items = req.params.ids.split(','),
            keys = req.params.keys.split(','),
            values = JSON.parse(req.params.values);
        console.log(items);
        console.log(keys);
        console.log(values);
        for (let i = 0; i < keys.length; i++) {
          set[keys[i]] = values[i];
        }
        console.log(set);
        User.update({ _id: { $in: items } }, {$set: set}, {multi: true, upsert: true}, cb(res));
    },
    deleteUser: function( req, res ){
        User.findByIdAndRemove(req.params.id, cb(res));
    },

// ----- TASKS -----
    getTasks: function( req, res ) {
        Task.find(req.query, cb(res));
    },
    updateTasks( req, res ) {
        const { selectedTasks, desiredChanges, userID } = req.body;
        Task.update(
            {_id: { $in: selectedTasks } },
            {$set: desiredChanges},
            {multi: true},
            (error, response) => {
                if(error) return res.status(500).json(error);
                User.findById(userID, (error, response) => {
                    if(error) return res.status(500).json(error);
                    res.status(200).json(response.tasks);
                }).populate('tasks');
            }
        );
    },
    postTask: function( req, res ) {
        Task.create(req.body, cb(res));
    },
    getUserTaskList( req, res ) {
        const { userID } = req.params;
        User.findById(userID, (error, response) => {
            if(error) return res.status(500).json(error);
            res.status(200).json(response.tasks);
        }).populate('tasks');
    },
    getTask: function( req, res ){
        Task.findById(req.params.id, cb(res));
    },
    editTask: function( req, res ){
        Task.findByIdAndUpdate(req.params.id, req.body, {new: true}, cb(res));
    },
    editTasks: function( req, res ){
        console.log(req.params);
        let set = {},
            items = req.params.ids.split(','),
            keys = req.params.keys.split(','),
            values = JSON.parse(req.params.values);
        console.log(items);
        console.log(keys);
        console.log(values);
        for (let i = 0; i < keys.length; i++) {
            set[keys[i]] = values[i];
        }
        console.log(set);
        Task.update({ _id: { $in: items } }, {$set: set}, {multi: true, upsert: true}, cb(res));
    },
    deleteTasks: function( req, res ){
        console.log(req.params.id);
        let items = req.params.id.split(',');
        console.log(items);
        Task.remove({ _id: { $in: items } }, cb(res));
    },
    deleteTask: function( req, res ){
        Task.findByIdAndRemove(req.params.id, cb(res));
    }
};
