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
        // User.findByIdAndUpdate(
        //     '575350c7b8833bf5125225a5',
        //     {
        //         // $set: {
        //         //     'agenda.1482991200000.start': [
        //         //         "5865943cb29f09382802d41c",
        //         //         "586594b2b29f09382802d425",
        //         //         "586594c0b29f09382802d428",
        //         //         "586594ccb29f09382802d42b"
        //         //     ],
        //         //     'agenda.1482991200000.scheduled': [
        //         //         "5865943cb29f09382802d41c",
        //         //         "586594b2b29f09382802d425",
        //         //         "586594c0b29f09382802d428",
        //         //         "586594ccb29f09382802d42b"
        //         //     ],
        //         //     'changeLog': []
        //         // } ,
        //         $unset: {
        //             'agenda.1485928800000': ""
        //         }
        //     },
        //     sendReport(res)
        // );
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
        // Task.findByIdAndRemove('587fa09df467bd3451741b01', report.sendResult('Done', 'Error'));
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
        const postpone = new Postpone({USER_ID, report});


        switch(ACTION) {

            case 'CREATE':

                let newTask = cloneObj(DATA);
                const userList = getUserList(newTask);

                const scheduled = newTask.status.scheduled;

                if(scheduled) updateScheduledTime({task:newTask}, report);

                Promise.all([
                    Task.create(newTask),
                    getUsers(userList)
                ])

                .then( ([task, users]) => {

                    if(task) {
                        report.logResponse(`New task '${task.title}' added to database`);
                        report.setData(task);

                        if(task.parentTasks.length) addTaskToParents({task, report, USER_ID});
                        if(task.childTasks.length) addTaskToChildren({task, report, USER_ID});

                    }

                    if(users) {
                        report.logResponse(`Users pending update: '${userList}'`);

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
                    }

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

                report.logResponse(`Requesting User: '${USER_ID}'`);
                report.logResponse(`Tasks pending removal: '${TASK_LIST.join("', '")}'`);

                postpone.setType('TASKS');

                Promise.all([
                    Task.find({ _id: { $in: TASK_LIST } }).exec(),
                    User.findById(USER_ID).exec()
                ])

                .then( ([tasks, user]) => {
                    const USER_NAME = `${user.firstName} ${user.lastName}`;

                    let removed = [];

                    tasks.forEach( task => {
                        const { title, status:{scheduled} } = task;

                        removed.push(`'${title}'`);

                        // Update user object
                        if(scheduled) removeTaskFromAgendaAndSchedule(user, task, report);
                        else removeTaskFromAgenda(user, task, report);

                        // Update task object and save it, or remove it from the database
                        if(task.users.length < 2) {
                            removeTaskFromParents({task, postpone});
                            removeTaskFromChildren({task, postpone});
                            removeTaskFromDatabase({task, report});
                        }
                        else {
                            removeUserFromTask({user, task, report});

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
                    });

                    // Log and save changes to the user
                    if(removed.length > 1) removed.push(`and ${removed.pop()}`);

                    user.changeLog.push({
                        date: moment().toJSON(),
                        user: USER_ID,
                        display: `Removed task${removed.length > 1?'s':''} ${removed.join(", ")} from your Agenda`
                    });

                    user.save(
                        report.sendResult(
                            `User '${USER_NAME}' was successfully modified`,
                            `Error saving User '${USER_NAME}'`
                        )
                    );

                    postpone.run();

                })

                .catch( error => report.criticalError(`Error deleting tasks '${TASK_LIST.join("', '")}'`, error) );

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
    if(report) report.logResponse(`Added task '${task.title}' to user ${user.firstName} ${user.lastName}'s agenda`);
}

function removeTaskFromAgenda(user, task, report) {
    const taskIndex = user.tasks.indexOf(`${task._id}`);
    if(taskIndex !== -1) {
        user.tasks.splice(taskIndex, 1);
        if(report) report.logResponse(`Removed task '${task.title}' from user ${user.firstName} ${user.lastName}'s agenda`);
    }
    else report.logError(`Task '${task.title}' not found on user '${user.firstName} ${user.lastName}'`);
}


function addTaskToAgendaAndSchedule(user, task, report) {
    addTaskToAgenda(user, task);
    addTaskToSchedule(user, task);
    if(report) report.logResponse(`Added task '${task.title}' to user ${user.firstName} ${user.lastName}'s agenda and schedule`);
}

function removeTaskFromAgendaAndSchedule(user, task, report) {
    removeTaskFromAgenda(user, task);
    removeTaskFromSchedule(user, task);
    if(report) report.logResponse(`Removed task '${task.title}' from user ${user.firstName} ${user.lastName}'s agenda and schedule`);
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

function updateTaskOnSchedule({user, oldTask, newTask, report}) {
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

function removeUserFromTask({user, task, report}) {
    if(task.users.length < 2) report.logError(`Insufficient USERS on task '${task.title}'. Cannot remove last USER.`);

    const userIndex = task.users.findIndex( data => data.user === user._id );

    if(userIndex === -1) report.logError(`Unable to locate user '${user.firstName} ${user.lastName}' on task '${task.title}'`);
    else {
        task.users.splice(userIndex, 1);
        report.logResponse(`Removed user '${user.firstName} ${user.lastName}' from task '${task.title}'`);
    }
}

function removeParentFromTask({task, parentID, title, report}) {
    const index = task.parentTasks.findIndex( id => `${id}` === `${parentID}`);

    if(index === -1) {
        report.logError(`Unable to find parent ${title || parentID} on task ${task.title}`);
        return false;
    }

    task.parentTasks.splice(index, 1);

    if(report) report.logResponse(`Removed task '${task.title}' from project '${title || parentID}'`);
    return `Removed task from project '${title || parentID}'`;
}

function removeChildFromTask({task, childID, title, report}) {
    const index = task.childTasks.findIndex( id => `${id}` === `${childID}`);

    if(index === -1) {
        report.logError(`Unable to find child ${title || childID} on task ${task.title}`);
        return false;
    }

    task.childTasks.splice(index, 1);

    if(report) report.logResponse(`Removed task '${title || childID}' from project '${task.title}'`);
    return `Removed task '${title || childID} from project'`;
}

function removeTaskFromParents({task, postpone}) {
    task.parentTasks.forEach( taskID => postpone.method(`${taskID}`, removeChildFromTask, {childID:task._id, title:task.title}) );
}

function removeTaskFromChildren({task, postpone}) {
    task.childTasks.forEach( taskID => postpone.method(`${taskID}`, removeParentFromTask, {parentID:task._id, title:task.title}) );
}




////////////////////////////////////////   DATABASE   ////////////////////////////////////////

//////////   ACCESSOR FUNCTIONS
function getUsers(userList) {
    return User.find( {_id: { $in: userList } } ).exec();
}


//////////   MUTATOR FUNCTIONS
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

function addTaskToParents({task, report, USER_ID}) {
    if(!(task && report)) return report.logError('Unable to addTaskToParent(). Invalid input...');

    Task.update(
        { _id: { $in: task.parentTasks } },
        {
            $push: {
                'childTasks': task._id,
                'changeLog': {
                    date: moment().toJSON(),
                    user: USER_ID,
                    display: `Added task '${task.title}'`
                }
            }
        },
        {multi: true},
        report.sendResult(
            `Added task '${task.title}' to Projects '${task.parentTasks}'`,
            `Error occured while adding task '${task.title}' to Projects '${task.parentTasks}'`
        )
    );
}

function addTaskToChildren({task, report, USER_ID}) {
    if(!(task && report)) return report.logError('Unable to addTaskToChildren(). Invalid input...');

    Task.update(
        { _id: { $in: task.childTasks } },
        {
            $push: {
                'parentTasks': task._id,
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

function removeTaskFromDatabase({task, report}) {
    task.remove(
        report.sendResult(
            `!!! Task '${task.title}' was REMOVED from the TASK Database !!!`,
            `Failed to remove Task '${task.title}' from the TASK Database`
        )
    );
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
    constructor({USER_ID, report, TYPE}) {
        this.USER_ID = USER_ID;
        this.report = report;
        this.TYPE = TYPE || 'USERS';
        this.USERS = {};
        this.TASKS = {};
    }

    setType(TYPE) {
        this.TYPE = TYPE;
    }

    method(ID, method, args) {
        const TYPE = this.TYPE
        if(!this[TYPE][ID]) this[TYPE][ID] = [];
        this[TYPE][ID].push({ method, args });

    }

    run() {
        const TYPE = this.TYPE
        const report = this.report;
        const list = Object.keys(this[TYPE]);

        if(list.length === 0) return;

        const promise = TYPE === 'USERS'
            ? User.find( {_id: { $in: list } } ).exec()
            : Task.find( {_id: { $in: list } } ).exec();

        report.wait();
        promise.then( items => {
            report.logResponse(`${TYPE} pending update: '${list}'`);

            items.forEach( item => {
                const ID = `${item._id}`;
                const name = TYPE === 'USERS'
                    ? `${item.firstName} ${item.lastName}`
                    : `${item.title}`;

                let log = [];

                this[TYPE][ID].forEach( ({method, args}) => {
                    if(TYPE === 'USERS') args.user = item;
                    else args.task = item;
                    args.report = report;
                    log.push(method(args));
                });

                const display = log.join('\n');

                item.changeLog.push({
                    date: moment().toJSON(),
                    user: this.USER_ID,
                    display
                });

                item.save(
                    report.sendResult(
                        `${TYPE.slice(0, -1)} '${name}' was successfully updated.\n${display}`,
                        `Unable to save changes to ${TYPE.slice(0, -1)} '${name}'`
                    )
                );
            });

            report.doneWaiting();
        })
        .catch( error => {
            report.logError(`Error locating ${TYPE}: '${list}'`, error);
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
