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
    Task.find({'schedule.startTime': minute._d.toJSON()}, (error, tasks)=>{
        if(error) console.log('Error finding tasks: ', error);
        else {
          console.log('tasks: ', tasks.length);
          for (let i = 0; i < tasks.length; i++) {
            console.log(tasks[i].title);
            tasks[i].status.pending = false;
            tasks[i].status.active = true;
            tasks[i].save(report);
          }
        }
    });
  }
////////////////////////////////////////////////////////////////////////////////

// HELPER FUNCTIONS
let cb = function(res){
    return function(error, response){
        if(error) res.status(500).json(error);
        else res.status(200).json(response);
    };
};

function report(error, resp){
    if(error) console.log('Error saving: ', error);
    else console.log('saved');
};

function sendReport(res) {
    return (error, response) => {
        if(error) {
            console.log('Error saving: ', error);
            return res.status(500).json(error);
        }
        console.log('saved');
        res.status(200).json(response);
    };

}

////////////////////////////////////////   SERVER   ////////////////////////////////////////
module.exports = {
    updateData( req, res ) {
        const report = new Report(res, "UPDATE");
        //
        User.findByIdAndUpdate(
            '575350c7b8833bf5125225a5',
            {
                // $set: {
                //     'agenda.1482991200000.start': [
                //         "5865943cb29f09382802d41c",
                //         "586594b2b29f09382802d425",
                //         "586594c0b29f09382802d428",
                //         "586594ccb29f09382802d42b"
                //     ],
                //     'agenda.1482991200000.scheduled': [
                //         "5865943cb29f09382802d41c",
                //         "586594b2b29f09382802d425",
                //         "586594c0b29f09382802d428",
                //         "586594ccb29f09382802d42b"
                //     ],
                //     'changeLog': []
                // } ,
                $unset: {
                    'agenda.1485928800000': ""
                }
            },
            sendReport(res)
        );
        //
        // const set = {
        //     'users.575350c7b8833bf5125225a5': {
        //         securityAccess: 30,
        //         scheduled: ""
        //     }
        // };
        // Task.update({}, {$set: set}, {multi: true}, report);
        //
        // const id = [
        //     "5715ab983bda76260a98b099",
        //     "581cdb77f0b180cc3e61a7d2",
        //     "581cde3697614c68456d4ca4",
        //     "581ce4f9bace1834469d1c53",
        //     "582a2278a5bd650c1f078868",
        //     "582a2261a5bd650c1f078865"
        // ];
        // const time = [
        //     "2016-11-04T15:00:00.000Z",
        //     "2016-11-04T19:00:00.000Z",
        //     "2016-11-05T19:15:00.000Z",
        //     "2016-11-05T19:30:00.000Z",
        //     "2016-11-14T20:45:00.000Z",
        //     "2016-11-15T20:45:00.000Z"
        // ];
        // for(let i=0; i<id.length; i++) {
        //     Task.findByIdAndUpdate(
        //         id[i],
        //         {$set: {
        //             'users.575350c7b8833bf5125225a5': {
        //                 securityAccess: 30,
        //                 scheduled: time[i]
        //             }
        //         }},
        //         report.sendResult(
        //             `Updated task ${id[i]}`,
        //             `Error updating task ${id[i]}`
        //         )
        //     );
        // }
        // report.add();
        // report.sendReport({response: "All done"});

        // Task.find({}, (err, tasks)=>{
        //
        //     tasks.forEach(task => {
        //         task.users = [{
        //             user: "575350c7b8833bf5125225a5",
        //             securityAccess: 30
        //         }];
        //         task.schedule.scheduledTime = task.schedule.startTime;
        //         task.save(report.sendResult());
        //     });
        //
        // });

        // Task.collection.update({}, { $rename: { name: 'title' } }, { multi: true }, sendReport(res))
        //
        // Task.update({ _id: { $in: items } }, {$set: set}, {multi: true}, cb(res));
        //
        // User.findByIdAndUpdate('575350c7b8833bf5125225a5', {$set: {
        //     'agenda.1478322000000.scheduled': [{
        //         time: "2016-11-05T19:15:00.000Z",
        //         taskID: "581cde3697614c68456d4ca4"
        //     }]
        // }}, sendReport(res));
        //
        // Task.findByIdAndUpdate('5715ab983bda76260a98b099', {$set: {
        //     'schedule.startTime': '2016-11-04T15:30:00.000Z',
        //     'schedule.softDeadline': '2016-11-05T15:30:00.000Z',
        //     'schedule.hardDeadline': '2016-11-06T15:30:00.000Z',
        //     'schedule.duration': 75,
        //     'status.active': true,
        //     'status.inactive': false,
        //     'status.scheduled': true
        // }}, sendReport(res));
    },
    getTest( req, res ){
        console.log(req.query);
        Task.find(req.query, cb(res));
    },


// -------------------------------- USERS --------------------------------------
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


// -------------------------------- TASKS --------------------------------------
    getTasks: function( req, res ) {
        Task.find(req.query, cb(res));
    },
    getTask: function( req, res ) {
        Task.findById(req.params.id, cb(res));
    },
    editTasks: function( req, res ) {
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
    updateTasks( req, res ) {
        const { ACTION, USER_ID, TASK_LIST, OPERATION, DATA } = req.body;

        const report = new Report(res, ACTION);

        switch(ACTION) {

            case 'CREATE':

                let newTask = cloneObj(DATA);
                const userList = getUserList(newTask);

                const scheduled = newTask.status.scheduled;

                if(scheduled) updateScheduledTime({task:newTask}, report);

                Promise.all([
                    createNewTask(newTask),
                    getUsers(userList)
                ])

                .then( ([task, users]) => {

                    if(task) {
                        report.logResponse(`New task '${task.title}' added to database`);
                        report.setData(task);

                        if(task.parentTask) addTaskToParent({task, report});
                        if(task.childTasks) addTaskToChildren({task, report});

                    }

                    if(users) report.logResponse(`Users pending update: '${userList}'`);

                    users.forEach( user => {
                        const userName = `${user.firstName} ${user.lastName}`;

                        if(scheduled) addTaskToAgendaAndSchedule(user, task, report);
                        else addTaskToAgenda(user, task, report);

                        user.changeLog.push({
                            date: moment().toJSON(),
                            user: USER_ID,
                            display: `Created task '${task.title}' and added it to your ${scheduled?'schedule':'agenda'}`
                        });

                        user.save(
                            report.sendResult(
                                `User '${userName}' updated successfully`,
                                `Error occured while saving user '${userName}'`
                            )
                        );
                    });

                })
                .catch( error => report.criticalError(`Error creating task '${newTask.title}'`, error) );

            break;


            case 'MODIFY':

                report.logResponse(`(${TASK_LIST.length}) task${TASK_LIST.length>1?'s':''} pending update: '${TASK_LIST}'`);
                Task.update(
                    {_id: { $in: TASK_LIST } },
                    OPERATION,
                    {multi: true},
                    report.sendResult(
                        `Update operation successful\n${OPERATION.$push.changeLog.display}`,
                        'An error occured while updating tasks. Update operation aborted...'
                    )
                );

            break;


            case 'SCHEDULE':

                let postpone = new Postpone(USER_ID, report);

                Task.find( {_id: { $in: TASK_LIST } }, (error, tasks)=> {
                    if(error) return report.criticalError(`Error finding task${TASK_LIST.length>1?'s':''}: '${TASK_LIST}'`, error);
                    report.logResponse(`(${TASK_LIST.length}) task${TASK_LIST.length>1?'s':''} pending update: '${TASK_LIST}'`);

                    tasks.forEach( task => {
                        scheduleTask({task, operation: cloneObj(OPERATION), postpone, report});
                    });

                    postpone.run();

                });

            break;


            case 'DELETE':
                deleteTasks({ USER_ID, TASK_LIST }, report);
            break;


            default:
                report.criticalError(`<${ACTION}> is not a valid action. Aborting...`);
        }

    }
};

////////////////////////////////////////   USER   ////////////////////////////////////////
//////////   ACCESSOR FUNCTIONS

//////////   MUTATOR FUNCTIONS
function addTaskToAgenda(user, task, report) {
    user.tasks.push(task._id);
    if(report) report.logResponse(`Added task '${task.title}' to user '${user.firstName} ${user.lastName}'s agenda`);
}

function addTaskToSchedule(user, task, report) {
    const { scheduledTime, startTime, softDeadline, hardDeadline } = task.schedule;
    const taskID = `${task._id}`;

    if(scheduledTime) {
        const scheduledDate = moment(scheduledTime).startOf('day').valueOf();
        if( user.agenda[scheduledDate] ) {
            user.agenda[scheduledDate].scheduled.push(taskID);
        }
        else {
            user.agenda[scheduledDate] = {
                date: moment(scheduledDate).toJSON(),
                start: [],
                soft: [],
                hard: [],
                scheduled: [taskID]
            }
        }
    }

    if(startTime) {
        const startDate = moment(startTime).startOf('day').valueOf();
        if( user.agenda[startDate] ) {
            user.agenda[startDate].start.push(taskID);
        }
        else {
            user.agenda[startDate] = {
                date: moment(startDate).toJSON(),
                start: [taskID],
                soft: [],
                hard: [],
                scheduled: []
            }
        }
    }

    if(softDeadline) {
        const softDate = moment(softDeadline).startOf('day').valueOf();
        if( user.agenda[softDate] ) {
            user.agenda[softDate].soft.push(taskID);
        }
        else {
            user.agenda[softDate] = {
                date: moment(softDate).toJSON(),
                start: [],
                soft: [taskID],
                hard: [],
                scheduled: []
            }
        }
    }

    if(hardDeadline) {
        const hardDate = moment(hardDeadline).startOf('day').valueOf();
        if( user.agenda[hardDate] ) {
            user.agenda[hardDate].hard.push(taskID);
        }
        else {
            user.agenda[hardDate] = {
                date: moment(hardDate).toJSON(),
                start: [],
                soft: [],
                hard: [taskID],
                scheduled: []
            }
        }
    }

    user.markModified('agenda');

    if(report) report.logResponse(`Added task '${task.title}' to '${user.firstName} ${user.lastName}'s schedule.`);
}

function addTaskToAgendaAndSchedule(user, task, report) {
    addTaskToAgenda(user, task);
    addTaskToSchedule(user, task);
    if(report) report.logResponse(`Added task '${task.title}' to user '${user.firstName} ${user.lastName}'s agenda and schedule`);
}

function updateTaskOnSchedule({user, oldTask, newTask}, report) {
    removeTaskFromSchedule(user, oldTask);
    addTaskToSchedule(user, newTask);
    if(report) report.logResponse(`Updated task '${newTask.title}' on user '${user.firstName} ${user.lastName}'s schedule`);
    return `Updated task '${newTask.title}' on your schedule`;
}

function removeTaskFromSchedule(user, task, report) {
    const { scheduledTime, startTime, softDeadline, hardDeadline } = task.schedule;
    const taskID = `${task._id}`;

    if(scheduledTime) {
        const scheduledDate = moment(scheduledTime).startOf('day').valueOf();
        if(user.agenda.hasOwnProperty(scheduledDate)) {
            const date = user.agenda[scheduledDate];
            const index = date.scheduled.indexOf(taskID);
            if(index !== -1) date.scheduled.splice(index, 1);
            if(
                date.scheduled.length === 0 &&
                date.start.length === 0 &&
                date.soft.length === 0 &&
                date.hard.length === 0
            ) delete user.agenda[scheduledDate];
        }
    }

    if(startTime) {
        const startDate = moment(startTime).startOf('day').valueOf();
        if(user.agenda.hasOwnProperty(startDate)) {
            const date = user.agenda[startDate];
            const index = date.start.indexOf(taskID);
            if(index !== -1) date.start.splice(index, 1);
            if(
                date.scheduled.length === 0 &&
                date.start.length === 0 &&
                date.soft.length === 0 &&
                date.hard.length === 0
            ) delete user.agenda[startDate];
        }
    }

    if(softDeadline) {
        const softDate = moment(softDeadline).startOf('day').valueOf();
        if(user.agenda.hasOwnProperty(softDate)) {
            const date = user.agenda[softDate];
            const index = date.soft.indexOf(taskID);
            if(index !== -1) date.soft.splice(index, 1);
            if(
                date.scheduled.length === 0 &&
                date.start.length === 0 &&
                date.soft.length === 0 &&
                date.hard.length === 0
            ) delete user.agenda[softDate];
        }
    }

    if(hardDeadline) {
        const hardDate = moment(hardDeadline).startOf('day').valueOf();
        if(user.agenda.hasOwnProperty(hardDate)) {
            const date = user.agenda[hardDate];
            const index = date.hard.indexOf(taskID);
            if(index !== -1) date.hard.splice(index, 1);
            if(
                date.scheduled.length === 0 &&
                date.start.length === 0 &&
                date.soft.length === 0 &&
                date.hard.length === 0
            ) delete user.agenda[hardDate];
        }
    }

    user.markModified('agenda');

    if(report) report.logResponse(`Removed task '${task.title}' from '${user.firstName} ${user.lastName}'s schedule.`);
}



////////////////////////////////////////   TASK   ////////////////////////////////////////
//////////   ACCESSOR FUNCTIONS
function getUserList(task, preserveReference) {
    return preserveReference
        ?   task.users.map( data => data.user )
        :   task.users.map( data => `${data.user}` );
}

//////////   MUTATOR FUNCTIONS
function updateScheduledTime({task, operation}, report) {
    const oldTime = task ? task.schedule.scheduledTime : '';
    //// This part will change ///////////////
    const newTime = operation && operation.$set.hasOwnProperty('schedule.startTime')
        ?   operation.$set['schedule.startTime']
        : task
            ? task.schedule.startTime
            : '';
    /////////////////////////////////////

    if(newTime !== oldTime) {

        if(operation) operation.$set['schedule.scheduledTime'] = newTime;
        else task.schedule.scheduledTime = newTime;

        // Log any operations performed...
        const result = newTime && !oldTime ? `Scheduled task '${task.title}' for '${moment(newTime).toString()}'`
            : !newTime && oldTime ? `Unscheduled task '${task.title}'`
            : `Changed task '${task.title}'s scheduled time from '${moment(oldTime).toString()}' to '${moment(newTime).toString()}'`;

        if(report) report.logResponse(result);
        if(operation) operation.$push.changeLog.display += `\n${result}`;
    }
}




////////////////////////////////////////   DATABASE   ////////////////////////////////////////
//////////   ACCESSOR FUNCTIONS
function getUsers(userList) {
    return User.find( {_id: { $in: userList } } ).exec();
}

//////////   MUTATOR FUNCTIONS
function createNewTask(newTask) {
    const { scheduled } = newTask.status;

    newTask.changeLog = [{
            date: moment().toJSON(),
            user: newTask.users[0].user,
            display: `Created${scheduled ? ' and scheduled' : ''} task`
    }];

    return Task.create(newTask);

}

function scheduleTask({task, operation, postpone, report}) {

    // Find an appropriate time to schedule this task and add it to the operation object
    updateScheduledTime({task, operation}, report);

    // Build props to update each user's schedule with
    let oldSchedule = {}, newSchedule = {};
    ['scheduledTime', 'startTime', 'softDeadline', 'hardDeadline'].forEach( item => {
        if( operation.$set.hasOwnProperty(`schedule.${item}`) ) {
            oldSchedule[item] = task.schedule[item];
            newSchedule[item] = operation.$set[`schedule.${item}`];
        }
    });
    const oldTask = {
        _id: task._id,
        title: task.title,
        schedule: oldSchedule
    };
    const newTask = {
        _id: task._id,
        title: task.title,
        schedule: newSchedule
    };

    // Postpone updates to the user until all tasks are accounted for
    getUserList(task).forEach( userID => {
        postpone.method(userID, updateTaskOnSchedule, {oldTask, newTask});
    });

    Task.findByIdAndUpdate(
        task._id,
        operation,
        { new: true },
        report.addData(
            `Task '${task.title}' successfully updated\n${operation.$push.changeLog.display}`,
            `Failed to update task '${task.title}'`
        )
    );

}

function addTaskToParent({task, report}) {
    if(!(task && report)) return console.log('Unable to addTaskToParent(). Invalid input...');

    const operation = {
        $push: {
            'childTasks': task._id,
            'changeLog': {
                date: moment().toJSON(),
                user: USER_ID,
                display: `Added task '${task.title}'`
            }
        }
    };

    report.wait();
    Task.findByIdAndUpdate( task.parentTask, operation, (error, parentTask) => {
        if(error) report.logError(`Error occured while adding task '${task.title}' to Project '${task.parentTask}'`);
        else report.logResponse(`Added task '${task.title}' to Project '${parentTask.title}'`);
        report.doneWaiting();
    });
}

function addTaskToChildren({task, report}) {
    if(!(task && report)) return console.log('Unable to addTaskToChildren(). Invalid input...');

    Task.update(
        { _id: { $in: task.childTasks } },
        {
            $set: { 'parentTask': task._id },
            $push: {
                'changeLog': {
                    date: moment().toJSON(),
                    user: USER_ID,
                    display: `Added to Project '${task.title}'`
                }
            }
        },
        {multi: true},
        report.sendResult(
            `Added tasks '${task.childTasks}' to Project '${task.title}'`,
            `Error occured while adding tasks '${task.childTasks}' to Project '${task.title}'`
        )
    );
}

function deleteTasks({ USER_ID, TASK_LIST }, report) {
    report.logResponse(`Requesting User: '${USER_ID}'`);
    report.logResponse(`Tasks pending removal: '${TASK_LIST.join("', '")}'`);

    let tasksRemovedFromAgenda = [];

    // GET USER
    User.findById(USER_ID, (error, user) => {
        if(error) return report.criticalError(`User '${USER_ID}' could not be found`, error);

        const USER_NAME = `${user.firstName} ${user.lastName}`;

        // GET TASKS
        Task.find({ _id: { $in: TASK_LIST } }, (error, tasks)=> {
            if(error) return report.criticalError('Unable to locate tasks', error);

            // For each task, perform the following operations.
            tasks.forEach(task => {
                const { _id, title, status:{scheduled}, schedule:{startTime, softDeadline, hardDeadline} } = task;
                const taskID = `${_id}`;

                // ----- UPDATE THE USER -----
                    // If the task is scheduled, it will need to be removed from the User's Schedule
                    if(scheduled) removeTaskFromSchedule(user, task);

                    // Remove this task's ID from the User's Agenda as well
                    const taskIndex = user.tasks.indexOf(taskID);
                    if(taskIndex !== -1) {
                        user.tasks.splice(taskIndex, 1);
                        tasksRemovedFromAgenda.push(`'${title}'`);
                        report.logResponse(`Removed task '${title}' from '${USER_NAME}'s ${scheduled?'schedule and ':''}agenda.`);
                    }
                    else return report.logError(`Task '${title}' not found on user '${USER_NAME}'`);


                // ----- UPDATE THE TASK -----
                    /* If the task belongs solely to the user requesting the removal
                        then it will be removed completely from the TASK database, but
                        it the task is shared with other users, then it will remain in
                        the database attached to those other users and will only be
                        removed from the USER requesting the removal.               */

                    if(task.users.length > 1) {
                        const userIndex = task.users.findIndex( data => `${data.user}` === USER_ID )
                        if(userIndex !== -1) {
                            task.changeLog.push({
                                date: moment().toJSON(),
                                user: USER_ID,
                                display: `Removed '${USER_NAME}' from task`
                            });

                            task.save(
                                report.sendResult(
                                    `User '${USER_NAME}' was successfully removed from Task '${title}'`,
                                    `Failed to save Task '${title}'`
                                )
                            );
                        }
                        else report.logError(`Unable to locate user '${USER_NAME}' on task '${title}'`);
                    }
                    else task.remove(
                        report.sendResult(
                            `!!! Task '${title}' was REMOVED from the TASK Database !!!`,
                            `Failed to remove Task '${title}' from the TASK Database`
                        )
                    );

            })

            // Log and save changes to the user and send the updated user object back to the Client
            const multiple = tasksRemovedFromAgenda.length > 1;
            if(multiple) tasksRemovedFromAgenda.push(`and ${tasksRemovedFromAgenda.pop()}`);
            user.changeLog.push({
                date: moment().toJSON(),
                user: USER_ID,
                display: `Removed task${multiple?'s':''} ${tasksRemovedFromAgenda.join(", ")} from your Agenda`
            });

            user.save(
                report.sendResult(
                    `User '${USER_NAME}' was successfully modified`,
                    `Error saving User '${USER_NAME}'`
                )
            );

            user.populate('tasks', report.sendData());
        });

    });
}


///// HELPER FUNCTIONS /////
// Clone an object
function cloneObj(obj1) {
    let obj2 = Array.isArray(obj1) ? [] : {};
    for(let key in obj1) {
        obj2[key] = typeof obj1[key] === 'object' && obj1[key] !== null
            ?   obj2[key] = cloneObj(obj1[key])
            :   obj2[key] = obj1[key];
    }
    return obj2;
}

class Postpone {
    constructor(USER_ID, report) {
        this.USER_ID = USER_ID;
        this.report = report;
        this.USERS = {};
    }

    method(userID, method, args) {

        if(!this.USERS[userID]) this.USERS[userID] = [];
        this.USERS[userID].push({ method, args });

    }

    run() {
        const report = this.report;
        const userList = Object.keys(this.USERS);

        if(userList.length === 0) return;

        report.wait();
        User.find( {_id: { $in: userList } }, (error, users) => {
            if(error) report.logError(`Error locating users: '${userList}'`, error);
            else {
                report.logResponse(`Users pending update: '${userList}'`);

                users.forEach( user => {
                    const userID = `${user._id}`;
                    const userName = `${user.firstName} ${user.lastName}`;

                    let log = [];

                    this.USERS[userID].forEach( ({method, args}) => {
                        args.user = user;
                        log.push(method(args, report));
                    });

                    const display = log.join('\n');

                    user.changeLog.push({
                        date: moment().toJSON(),
                        user: this.USER_ID,
                        display
                    });

                    user.save(
                        report.sendResult(
                            `User '${userName}' was successfully updated.\n${display}`,
                            `Unable to save changes to user '${userName}'`
                        )
                    );

                });

            }
            report.doneWaiting();
        });
    }
}

class Report {
    constructor(res, ACTION) {
        this.res = res;
        this.waiting = 0;
        this.report = {
            ACTION: ACTION,
            status: "SUCCESS",
            response: [],    // { msg, response }
            error: [],     // { msg, error }
            data: null
        };

        console.log(`\nREQUEST TYPE: ${ACTION}`);
    }

    wait() {
        this.waiting++;
    }

    doneWaiting() {
        this.waiting--;
        this.send();
    }

    send(data) {
        if(data) this.report.data = data;
        if(this.waiting === 0) {
            if(this.report.error.length > 0) this.report.status = "PARTIAL SUCCESS";
            this.res.status(200).json(this.report);
            console.log(`STATUS: ${this.report.status}\n`);
        }
    }

    logError(msg = "", error = "") {
        console.log(`--ERROR-- : ${msg}`);
        if(error !== "") console.log(error);
        this.report.error.push({ msg, error });
    }

    logResponse(msg = "") {
        console.log(`UPDATE: ${msg}`);
        this.report.response.push({ msg });
    }

    setData(data) {
        this.report.data = data;
    }

    sendResult(msg = "", errorMsg = "") {
        this.wait();
        return (error, response) => {
            if(error) {
                console.log(`--ERROR-- : ${errorMsg}`, error);
                this.report.error.push({ errorMsg, error });
            }
            else {
                console.log(`UPDATE: ${msg}`);
                this.report.response.push({ msg, response });
            }
            this.doneWaiting();
        };
    }

    sendData() {
        this.wait();
        return (error, response) => {
            this.report.data = error || response;
            this.doneWaiting();
        };
    }

    addData(msg, errorMsg) {
        const next = this.sendResult(msg, errorMsg);
        return (error, response) => {
            if(response)  {
                if( !Array.isArray(this.report.data) ) this.report.data = this.report.data ? [this.report.data] : [];
                this.report.data.push( response );
            }
            next(error, response);
        };
    }

    criticalError(msg, error) {
        console.log(msg, error);
        this.report.status = "FAILED";
        this.report.error.push({ msg, error });
        this.res.status(500).json(this.report);
        console.log(`STATUS: ${this.report.status}\n`);
    }
}
