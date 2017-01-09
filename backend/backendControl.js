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

// SERVER CONTROLS
module.exports = {
    updateData( req, res ) {
        const report = new Report(res, "UPDATE");
        //
        // User.findByIdAndUpdate(
        //     '575350c7b8833bf5125225a5',
        //     {
        //         $set: {
        //             'agenda.1482991200000.start': [
        //                 "5865943cb29f09382802d41c",
        //                 "586594b2b29f09382802d425",
        //                 "586594c0b29f09382802d428",
        //                 "586594ccb29f09382802d42b"
        //             ],
        //             'agenda.1482991200000.scheduled': [
        //                 "5865943cb29f09382802d41c",
        //                 "586594b2b29f09382802d425",
        //                 "586594c0b29f09382802d428",
        //                 "586594ccb29f09382802d42b"
        //             ],
        //             'changeLog': []
        //         }
        //         , $unset: {
        //             'agenda.1482300000000': "",
        //             'agenda.1482386400000': ""
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

                // let newTask = cloneObj(DATA);
                //
                // updateScheduledTime(newTask, report);
                //
                // Promise.all([
                //     createNewTask(newTask),
                //     getUserList(newTask)
                // ])
                // function getUserList({task, result}) {
                // .then(
                //     task => {
                //         report.logResponse(`New task '${newTask.title}' added to database`);
                //
                //         User.find( {_id: { $in: userList } }, (error, users) => {
                //
                //         }
                //     // get users
                //     // add task to users
                //     // ? Add task to users schedule
                //     // Save users
                //     },
                //     error => report.criticalError(`Error creating task '${newTask.title}'`, error);
                // );

            break;


            case 'MODIFY':
                modifyTasks({ TASK_LIST, OPERATION }, report);
            break;


            case 'SCHEDULE':
                scheduleTasks({ USER_ID, TASK_LIST, OPERATION }, report);
            break;


            default:
                report.criticalError(`<${ACTION}> is not a valid action. Aborting...`);
        }

    },
    deleteTasks( req, res ) {
        const report = new Report(res, 'DELETE');
        // Data comes in as a string of IDs seperated by dashes. The first ID is the USER,
        // and any following IDs belong to the tasks that will be removed from that USER.
        const TASK_IDS = req.params.id.split('-');
        const USER_ID = TASK_IDS.shift();
        report.logResponse(`Requesting User: '${USER_ID}'`);
        report.logResponse(`Tasks pending removal: '${TASK_IDS}'`);

        let tasksRemovedFromAgenda = [];

        // GET USER
        User.findById(USER_ID, (error, user)=> {
            if(error) return report.criticalError(`User '${USER_ID}' could not be found`, error);

            const USER_NAME = `${user.firstName} ${user.lastName}`;

            // GET TASKS
            Task.find({ _id: { $in: TASK_IDS } }, (error, tasks)=> {
                if(error) return report.criticalError('Unable to locate tasks', error);

                // For each task, perform the following opertions.
                tasks.forEach(task => {
                    const { _id, title, status:{scheduled}, schedule:{startTime, softDeadline, hardDeadline} } = task;
                    const taskID = `${_id}`;

                    // ----- UPDATE THE USER -----
                        // If the task is scheduled, it will need to be removed from the User's Schedule
                        if(scheduled) removeFromSchedule(user, task, report);

                        // Remove this task's ID from the User's Agenda as well
                        const taskIndex = user.tasks.indexOf(taskID);
                        if(taskIndex !== -1) {
                            user.tasks.splice(taskIndex, 1);
                            tasksRemovedFromAgenda.push(title);
                            report.logResponse(`Removed task '${title}' from '${USER_NAME}'s agenda.`);
                        }
                        else return report.logError(`Task '${title}' not found on user '${USER_NAME}'`);



                    // ----- UPDATE THE TASK -----
                        /* If the task belongs solely to the user requesting the removal
                            then it will be removed completely from the TASK database, but
                            it the task is shared with other users, then it will remain in
                            the database attached to those other users and will only be
                            removed from the USER requesting the removal.               */

                        if(Object.keys(task.users).length > 1) {
                            delete task.users[USER_ID];
                            task.markModified('users');

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
                    display: `Removed task${multiple?'s':''} '${tasksRemovedFromAgenda.join("', '")}' from your Agenda`
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
};

function updateScheduledTime(task, report) {
    task.schedule.scheduledTime = task.schedule.startTime; // This will change
    report.logMessage(`Scheduled task for '${moment(task.schedule.scheduledTime).toString()}'`);
}

function createNewTask(newTask) {
    const { scheduled } = newTask.status;

    newTask.changeLog = [{
            date: moment().toJSON(),
            user: USER_ID,
            display: `Created${scheduled ? ' and scheduled' : ''} task`
    }];

    return Task.create(newTask);

}

function addTaskToUsers

function Schedule_Tasks () {
        if(error) return report.criticalError(`Error creating task '${newTask.title}'`, error);
        report.logResponse(`New task '${newTask.title}' added to database`);

        const taskID = `${task._id}`;
        const userList = Object.keys(task.users);

        User.find( {_id: { $in: userList } }, (error, users)=> {
            if(error) return report.criticalError(`Error locating users '${userList}' on task '${task.title}'`, error);

            for(let uIndx=0; uIndx<users.length; uIndx++) {
                let user = users[uIndx];
                const userId = `${user._id}`;
                const userName = `${user.firstName} ${user.lastName}`;

                user.tasks.push(taskID);

                if(scheduled) addToSchedule(user, task, report);

                user.changeLog.push({
                    date: moment().toJSON(),
                    user: USER_ID,
                    display: `Created task '${task.title}' and added it to your ${scheduled?'schedule':'agenda'}`
                });

                user.save(
                    report.sendResult(
                        `Saved task to user '${userName}'`,
                        `Error saving task to user '${userName}'`
                    )
                );

            }

            report.send(task);
        });
    });

}

function modifyTasks({ TASK_LIST, OPERATION }, report) {

    Task.update(
        {_id: { $in: TASK_LIST } },
        OPERATION,
        {multi: true},
        report.sendResult(
            `Update operation successful\n${OPERATION.$push.changeLog.display}`,
            'An error occured while updating tasks. Update operation aborted...'
        )
    );

}

function scheduleTasks({ USER_ID, TASK_LIST, OPERATION }, report) {

    let USERS = {};

    Task.find( {_id: { $in: TASK_LIST } }, (error, tasks)=> {
        if(error) return report.criticalError(`Error finding task(s) in '${TASK_LIST}'.`, error);
        report.logResponse(`Located tasks: '${TASK_LIST}'`);

        tasks.forEach( task => {
            let operation = cloneObj(OPERATION);

            const newStartTime = operation.$set['schedule.startTime'];
            const wasScheduled = task.status.scheduled;
            const scheduled = operation.$set.hasOwnProperty('schedule.startTime')
                ? !!operation.$set['schedule.startTime']
                : wasScheduled;

            if(scheduled || wasScheduled) {

                operation.$set['status.scheduled'] = scheduled;
                operation.$set['status.inactive'] = !scheduled;

                if(newStartTime) {
                    operation.$set['status.pending'] = scheduled && moment().isBefore(newStartTime);
                    operation.$set['status.active'] = scheduled && !operation.$set['status.pending'];
                }

                scheduleTime({task, operation, USERS});

            }

            task.update(
                operation,
                report.sendResult(
                    `Task '${task.title}' successfully updated\n${operation.$push.changeLog.display}`,
                    `Failed to update task '${task.title}'`
                )
            );

        });

        const userList = Object.keys(USERS);
        if(userList.length) {

            report.wait();
            User.find( {_id: { $in: userList } }, (error, users) => {
                if(error) report.logError(`Error locating users '${userList}'`, error);
                else {
                    report.logResponse(`Located users: '${userList}'`);

                    users.forEach( user => {
                        const userID = `${user._id}`;
                        const userName = `${user.firstName} ${user.lastName}`;

                        let log = [];

                        USERS[userID].forEach( data => {
                            modifySchedule(user, log, data);
                        });

                        const display = log.join('\n');

                        user.changeLog.push({
                            date: moment().toJSON(),
                            user: USER_ID,
                            display
                        });

                        user.markModified('agenda');
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

    });
}

function scheduleTime({task, operation, USERS}) {

    const oldSchedule = {
        scheduled: task.schedule.startTime, // This will change
        start: task.schedule.startTime,
        soft: task.schedule.softDeadline,
        hard: task.schedule.hardDeadline
    }

    // Find a scheduled Time that works for everyone
    const newSchedule = (()=>{
        let obj = {
            // this will change
            scheduled: operation.$set.hasOwnProperty('schedule.startTime')
                ? operation.$set['schedule.startTime']
                : task.schedule.startTime
        };
        if( operation.$set.hasOwnProperty('schedule.startTime') ) {
            obj.start = operation.$set['schedule.startTime'];
        }
        if( operation.$set.hasOwnProperty('schedule.softDeadline') ) {
            obj.soft = operation.$set['schedule.softDeadline'];
        }
        if( operation.$set.hasOwnProperty('schedule.hardDeadline') ) {
            obj.hard = operation.$set['schedule.hardDeadline'];
        }
        return obj;
    })();

    /*
        Update each user on the task with that new scheduled time and create a list
        of Users that will need to have their schedules updated
    */
    for(let userID in task.users) {
        operation.$set[`users.${userID}.schedule`] = newSchedule.scheduled;

        if(!USERS.hasOwnProperty(userID)) USERS[userID] = [];

        for(let field in newSchedule) {
            USERS[userID].push({
                taskID: `${task._id}`,
                title: task.title,
                oldTime: oldSchedule[field],
                newTime: newSchedule[field],
                field
            });
        }
    }

    // Log any operations performed...
    const oldTime = oldSchedule.scheduled;
    const newTime = newSchedule.scheduled;

    if(oldTime !== newTime) {
        operation.$push.changeLog.display += newTime && !oldTime ? `\nScheduled task for '${moment(newTime).toString()}'`
            : !newTime && oldTime ? "\nUnscheduled task"
            : `\nChanged task's scheduled time from '${moment(oldTime).toString()}' to '${moment(newTime).toString()}'`;
    }
}

function modifySchedule(user, log, {taskID, title, oldTime, newTime, field}) {

    // If dateItem (field) was previously scheduled, remove it from the user's schedule
    if(oldTime !== '') {
        const oldDate = moment(oldTime).startOf('day').valueOf();
        if(user.agenda.hasOwnProperty(oldDate)) {
            const date = user.agenda[oldDate];
            const index = date[field].indexOf(taskID);
            if(index !== -1) date[field].splice(index, 1);
            if(
                date.scheduled.length === 0 &&
                date.start.length === 0 &&
                date.soft.length === 0 &&
                date.hard.length === 0
            ) delete user.agenda[oldDate];
        }
    }

    // If dateItem (field) has a new time, add it to the correct place on the user's schedule
    if(newTime !== '') {
        const newDate = moment(newTime).startOf('day').valueOf();
        if( !user.agenda[newDate] ) user.agenda[newDate] = {
            date: moment(newDate).toJSON(),
            scheduled: [],
            start: [],
            soft: [],
            hard: []
        };
        user.agenda[newDate][field].push(taskID);
    }

    // Translate the dateItem (field) into readable english
    const fieldDisplay
        = field === 'scheduled' ? 'scheduled time'
        : field === 'start' ? 'start time'
        : field === 'soft' ? 'soft deadline'
        : field === 'hard' ? 'hard deadline'
        : undefined;

    // Log any changes made
    log.push(
        oldTime && newTime ? `Updated task '${title}'s ${fieldDisplay} on your schedule`
        :   oldTime ? `Removed task '${title}'s ${fieldDisplay} from your schedule`
        :   `Added task '${title}'s ${fieldDisplay} to your schedule`
    );

}

// Used by createNewTask
function addToSchedule(user, task, report) {

    const { scheduledTime, startTime, softDeadline, hardDeadline } = task.schedule;
    const taskID = `${task._id}`;

    let modified = false;

    if(scheduledTime !== '') {
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
        modified = true;
    }

    if(startTime !== '') {
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
        modified = true;
    }

    if(softDeadline !== '') {
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
        modified = true;
    }

    if(hardDeadline !== '') {
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
        modified = true;
    }

    if(modified && user._id) user.markModified('agenda');
    if(modified && report) report.logResponse(`Added task '${task.title}' to '${user.firstName} ${user.lastName}'s schedule.`);

}

// Used by deleteTasks
function removeFromSchedule(user, task, report) {

    const { scheduledTime, startTime, softDeadline, hardDeadline } = task.schedule;
    const taskID = `${task._id}`;

    let modified = false;

    if(scheduledTime !== '') {
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
            modified = true;
        }
    }

    if(startTime !== '') {
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
            modified = true;
        }
    }

    if(softDeadline !== '') {
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
            modified = true;
        }
    }

    if(hardDeadline !== '') {
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
            modified = true;
        }
    }

    if(modified && user._id) user.markModified('agenda');
    if(modified && report) report.logResponse(`Removed task '${task.title}' from '${user.firstName} ${user.lastName}'s schedule.`);

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

        console.log(`REQUEST TYPE: ${ACTION}`);
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
            if(this.report.error.length > 0) this.report.status = "PARTIAL";
            this.res.status(200).json(this.report);
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

    criticalError(msg, error) {
        console.log(msg, error);
        this.report.status = "FAIL";
        this.report.error.push({ msg, error });
        this.res.status(500).json(this.report);
    }
}
