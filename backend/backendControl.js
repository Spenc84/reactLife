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

        User.update(
            { _id: '575350c7b8833bf5125225a5' },
            { $pull: {tasks:'588a7d2124403a642909a69c'}},
            report.sendResult('done')
        );

        // Task.findByIdAndRemove('588a7aceeb2998d81ce373f4', report.sendResult('done', 'error'));
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
        User.findById(req.params.id).populate('tasks').exec( (error, user) => {
            if(error) {
                console.log(`Error aquiring User: ${req.params.id}`, error);
                return res.status(500).json(error);
            }
            buildSchedule(user);
            res.status(200).json(user);
        });
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
        let { USER_ID, ACTIONS } = req.body;
        if( ACTIONS && !Array.isArray(ACTIONS) ) ACTIONS = [ACTIONS];

        const report = new Report(res);
        const postpone = new Postpone(USER_ID, report);

        if(!(USER_ID && ACTIONS)) report.criticalError('Unable to updateTasks. Invalid input sent to server. Operation aborted.');

        ACTIONS.forEach( ({action:ACTION, pendingTasks:TASK_LIST, operation:OPERATION, data:DATA}) => {

            report.logAction(ACTION);

            switch(ACTION) {

                case 'CREATE':

                    let newTask = cloneObj(DATA);
                    report.logResponse(`(1) Task '${newTask.title}' pending creation`);
                    if(newTask.status.scheduled) updateScheduledTime(newTask, report);

                    Task.create(newTask)
                    .then( task => {

                        report.logResponse(`New task '${task.title}' added to database`);
                        report.setData(task);

                        if(task.parentTasks.length) addTaskToParents({task, report, USER_ID});
                        if(task.childTasks.length) addTaskToChildren({task, report, USER_ID});
                        if(task.users.length) addTaskToUsers({task, report, USER_ID});

                    })
                    .catch( error => report.criticalError(`Error creating task '${newTask.title}'`, error) );

                break;


                case 'MODIFY':

                    report.logResponse(`(${TASK_LIST.length}) task${TASK_LIST.length>1?'s':''} pending update: '${TASK_LIST}'`);
                    TASK_LIST.forEach( ID => postpone.task.mergeOperations(ID, cloneObj(OPERATION)) );

                break;


                case 'SCHEDULE':

                    report.logResponse(`(${TASK_LIST.length}) task${TASK_LIST.length>1?'s':''} pending update: '${TASK_LIST}'`);

                    postpone.wait();
                    Task.find({ _id: { $in: TASK_LIST }}).exec()

                    .then( tasks => {
                        tasks.forEach( postpone.updateScheduledTime );
                        postpone.endWait();
                    })

                    .catch( error => {
                        report.logError(`An ERROR occured while scheduling tasks '${TASK_LIST.join("', '")}'`, error);
                        postpone.endWait();
                    });

                break;


                case 'DELETE':

                    report.logResponse(`Requesting User: '${USER_ID}'`);
                    report.logResponse(`Tasks pending removal: '${TASK_LIST.join("', '")}'`);

                    postpone.wait();
                    Promise.all([
                        Task.find({ _id: { $in: TASK_LIST } }).exec(),
                        User.findById(USER_ID).exec()
                    ])

                    .then( ([tasks, user]) => {
                        const USER_NAME = `${user.firstName} ${user.lastName}`;
                        let titles = [];

                        tasks.forEach( task => {
                            const { title } = task;
                            titles.push(`'${title}'`);

                            // Update task object and save it, or remove it from the database
                            if(task.users.length < 2) {
                                postpone.removeTaskFromParents(task);
                                postpone.removeTaskFromChildren(task);
                                postpone.removeTaskFromDatabase(task);
                            }
                            else postpone.removeUserFromTask(user, task);
                        });

                        // Log and save changes to the user
                        if(titles.length > 1) titles.push(`and ${titles.pop()}`);
                        postpone.removeTasksFromUser({TASK_LIST, USER_ID, titles});

                        postpone.endWait();
                    })

                    .catch( error => {
                        report.logError(`Error deleting tasks '${TASK_LIST.join("', '")}'`, error);
                        postpone.endWait();
                    });

                break;

            }

        });

        postpone.run();
    }
};

////////////////////////////////////////   USER   ////////////////////////////////////////

//////////   ACCESSOR FUNCTIONS

//////////   MUTATOR FUNCTIONS
function buildSchedule(user) {
    user.schedule = {};
    user.tasks.forEach( task => {
        if(task.status.scheduled) addTaskToSchedule(user, task);
    });
}


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
    const taskID = `${task._id}`;

    const time = {
        scheduled: task.schedule.scheduledTime,
        start: task.schedule.startTime,
        soft: task.schedule.softDeadline,
        hard: task.schedule.hardDeadline
    };

    for(let key in time) {
        if(time[key]) {
            const date = moment(time[key]).startOf('day').valueOf().toString();
            if( !user.schedule.hasOwnProperty(date) ) user.schedule[date] = {
                date: moment(date).toJSON(),
                start: [],
                soft: [],
                hard: [],
                scheduled: []
            };
            user.schedule[date][key].push(taskID);
        }
    }
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
function updateScheduledTime(task, report) {
    //// This part will change ///////////////
    const oldTime = task ? task.schedule.scheduledTime : '';
    const newTime = task ? task.schedule.startTime : '';
    /////////////////////////////////////

    if(newTime !== oldTime) {

        task.schedule.scheduledTime = newTime;

        // Log any operations performed...
        if(report) report.logResponse(
            newTime && !oldTime ? `Scheduled task '${task.title}' for '${moment(newTime).toString()}'` :
            !newTime && oldTime ? `Unscheduled task '${task.title}'` :
            `Changed task '${task.title}'s scheduled time from '${moment(oldTime).toString()}' to '${moment(newTime).toString()}'`
        );

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
function addTaskToUsers({task, report, USER_ID}) {
    const userList = getUserList(task);
    report.logResponse(`Users pending update: '${userList}'`);
    User.update(
        {_id: { $in: userList } },
        {
            $push: {
                tasks: task._id,
                changeLog: {
                    date: moment().toJSON(),
                    user: USER_ID,
                    display: `Created task '${task.title}' and added it to your ${task.status.scheduled?'schedule':'agenda'}`
                }
            }
        },
        {multi:true},
        report.sendResult(
            `(${userList.length}) User${userList.length===1?'':'s'} updated successfully`,
            `Error occured while saving users`
        )
    );
}

function removeTasksFromUser({USER_ID, TASK_LIST, titles, report}) {
    report.logResponse(`User pending update: '${USER_ID}'`);
    User.findByIdAndUpdate(
        USER_ID,
        {
            $pull: {
                tasks: {
                    $in: TASK_LIST
                }
            },
            $push: {
                changeLog: {
                    date: moment().toJSON(),
                    user: USER_ID,
                    display: `Removed (${titles.length}) task${titles.length > 1?'s':''} ${titles.join(", ")} from your Agenda`
                }
            }
        },
        report.sendResult(
            `User '${USER_NAME}' was successfully modified`,
            `Error saving User '${USER_NAME}'`
        )
    );
}

function addTaskToParents({task, report, USER_ID}) {
    report.logResponse(`Projects pending update: '${task.parentTasks}'`);
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
    report.logResponse(`Tasks pending update: '${task.parentTasks}'`);
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
            `Tasks '${task.childTasks}' added to Project '${task.title}'`,
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


///// HELPER CLASSES /////
class Postpone {
    constructor(USER_ID, report) {
        this.USER_ID = USER_ID;
        this.report = report;
        this.USERS = {};
        this.TASKS = {};

        this.user = {
            addOperation: (ID, operation) => this.addOperation('USERS', ID, operation),
            mergeOperations: (ID, operation) => this.mergeOperations('USERS', ID, operation),
            updateOperation: (ID, callback) => this.updateOperation('USERS', ID, callback),
            getOperation: ID => this.getOperation('USERS', ID)
        };

        this.task = {
            addOperation: (ID, operation) => this.addOperation('TASKS', ID, operation),
            mergeOperations: (ID, operation) => this.mergeOperations('TASKS', ID, operation),
            updateOperation: (ID, callback) => this.updateOperation('TASKS', ID, callback),
            getOperation: ID => this.getOperation('TASKS', ID)
        };

        this.count = 0;

        this.updateScheduledTime = this.updateScheduledTime.bind(this);
    }

    method(ID, method, args) {
        const TYPE = this.TYPE
        if(!this[TYPE][ID]) this[TYPE][ID] = [];
        this[TYPE][ID].push({ method, args });

    }

    addOperation(TYPE, ID, operation) {
        if(this[TYPE][ID]) return;
        this[TYPE][ID] = operation;
    }

    mergeOperations(TYPE, ID, operation) {
        if(!this[TYPE][ID]) return this[TYPE][ID] = operation;
        let op = this[TYPE][ID];
        for(let key in operation) {
            if(!op[key]) op[key] = operation[key];
            else {

                if(key === '$set') for(let key in operation['$set']) {
                    op['$set'][key] = operation['$set'][key];
                }

                if(key === '$pull') for(let key in operation['$pull']) {
                    if(!op['$pull'][key]) op['$pull'][key] = operation['$pull'][key];
                    else if(op['$pull'][key]['$in']) {
                        if(operation['$pull'][key]['$in']) {
                            operation['$pull'][key]['$in'].forEach( item => op['$pull'][key]['$in'].push(item) );
                        }
                        else op['$pull'][key]['$in'].push( operation['$pull'][key] );
                    }
                    else if(operation['$pull'][key]['$in']) {
                        const item = op['$pull'][key];
                        op['$pull'][key] = operation['$pull'][key];
                        op['$pull'][key]['$in'].unshift(item);
                    }
                    else {
                        op['$pull'][key] = {
                            $in: [
                                op['$pull'][key],
                                operation['$pull'][key]
                            ]
                        }
                    }
                }

                if(key === '$push') for(let key in operation['$push']) {
                    if(!op['$push'][key]) op['$push'][key] = operation['$push'][key];
                    else if(key === 'changeLog') {
                        op['$push']['changeLog']['display'] += `\n${operation['$push']['changeLog']['display']}`;
                    }
                    else if(op['$push'][key]['$each']) {
                        if(operation['$push'][key]['$each']) {
                            operation['$push'][key]['$each'].forEach( item => {
                                if(op['$push'][key]['$each'].indexOf(item) === -1) op['$push'][key]['$each'].push(item);
                            });
                        }
                        else if(op['$push'][key]['$each'].indexOf(operation['$push'][key]) === -1) {
                            op['$push'][key]['$each'].push( operation['$push'][key] );
                        }
                    }
                    else if(operation['$push'][key]['$each']) {
                        const item = op['$push'][key];
                        op['$push'][key] = operation['$push'][key];
                        if(op['$push'][key]['$each'].indexOf(item) === -1) op['$push'][key]['$each'].unshift(item);
                    }
                    else if(op['$push'][key] !== operation['$push'][key]) {
                        op['$push'][key] = {
                            $each: [
                                op['$push'][key],
                                operation['$push'][key]
                            ]
                        }
                    }
                }

            }
        }
    }

    updateOperation(TYPE, ID, callback) {
        this[TYPE][ID] = callback(this[TYPE][ID]);
    }

    getOperation(TYPE, ID) {
        return this[TYPE][ID];
    }

    wait() {
        this.count++;
    }

    endWait() {
        this.count--;
        if(this.count === 0 && this.ready) this.run();
    }

    run() {
        this.ready = true;
        if(this.count) return;

        const report = this.report;

        for(let ID in this.TASKS) {
            const operation = this.TASKS[ID];

            if(operation['delete']) Task.findByIdAndRemove(ID, report.sendResult(
                `!!! Task '${ID}' was REMOVED from the TASK Database !!!`,
                `Failed to remove Task '${ID}' from the TASK Database`
            ))
            else {
                const callback = operation['$set'] && operation['$set']['schedule.scheduledTime']
                    ? report.addData
                    : report.sendResult;

                Task.findByIdAndUpdate(ID, operation, {new: true}, callback(
                    `Task '${ID}' successfully updated\n${operation.$push.changeLog.display}`,
                    `Failed to update task '${ID}'`
                ))
            }
        }

        for(let ID in this.USERS) {
            const operation = this.USERS[ID];

            if(operation['delete']) User.findByIdAndRemove(ID, report.sendResult(
                `!!! User '${ID}' was REMOVED from the USER Database !!!`,
                `Failed to remove User '${ID}' from the USER Database`
            ))
            else {
                User.findByIdAndUpdate(ID, operation, {new: true}, report.sendResult(
                    `User '${ID}' successfully updated\n${operation.$push.changeLog.display}`,
                    `Failed to update user '${ID}'`
                ))
            }
        }

    }

    // TASK OPERATION METHODS
    updateScheduledTime(task) {
        let operation = this.TASKS[task._id];

        const oldTime = task ? task.schedule.scheduledTime : '';
        //// This part will change ///////////////
        const newTime = operation && operation.$set && operation.$set.hasOwnProperty('schedule.startTime')
            ? operation.$set['schedule.startTime']
            : task ? task.schedule.startTime
            : '';
        /////////////////////////////////////

        if(newTime !== oldTime) {

            // Log any operations performed...
            const result = newTime && !oldTime ? `Scheduled task '${task.title}' for '${moment(newTime).toString()}'`
                : !newTime && oldTime ? `Unscheduled task '${task.title}'`
                : `Changed task '${task.title}'s scheduled time from '${moment(oldTime).toString()}' to '${moment(newTime).toString()}'`;

            if( !operation ) operation = {};

            if( !operation.$set ) operation.$set = {
                'schedule.scheduledTime': newTime
            };
            else operation.$set['schedule.scheduledTime'] = newTime;

            if( !operation.$push ) operation.$push = {};
            if( !operation.$push.changeLog ) operation.$push.changeLog = {
                date: moment().toJSON(),
                user: this.USER_ID,
                display: result
            };
            else operation.$push.changeLog.display += `\n${result}`;

            if(this.report) this.report.logResponse(result);
        }
    }
    removeTaskFromParents(task) {
        task.parentTasks.forEach( taskID => {

            this.pull('TASKS', taskID, 'childTasks', task._id);
            this.log(
                'TASKS',
                taskID,
                `Removed task '${task.title}' from project`,
                `Task '${task.title}' to be removed from project '${taskID}'`
            );

        });
    }
    removeTaskFromChildren(task) {
        task.childTasks.forEach( taskID => {

            this.pull('TASKS', taskID, 'parentTasks', task._id);
            this.log(
                'TASKS',
                taskID,
                `Removed task from project '${task.title}'`,
                `Task '${taskID}' to be removed from project '${task.title}'`
            );

        });
    }
    removeTaskFromDatabase(task) {
        this.delete('TASKS', task._id);
    }
    removeUserFromTask(user, task) {
        this.pull('TASKS', `${task._id}`, 'users', { user: user._id });
        this.log(
            'TASKS',
            `${task._id}`,
            `Removed '${user.firstName} ${user.lastName}' from task`,
            `User '${user.firstName} ${user.lastName}' to be removed from task '${task.title}'`
        );
    }

    // USER OPERATION METHODS
    updateTaskOnSchedule({user, oldTask, newTask}) {
        removeTaskFromSchedule(user, oldTask);
        addTaskToSchedule(user, newTask);
        this.log(
            'USERS',
            user._id,
            `Updated task '${newTask.title}' on your schedule`,
            `Updated task '${newTask.title}' on user '${user.firstName} ${user.lastName}'s schedule`
        );
    }
    removeTasksFromUser({USER_ID, TASK_LIST, titles}) {
        this.pull('USERS', USER_ID, 'tasks', { $in: TASK_LIST });
        this.log(
            'USERS',
            USER_ID,
            `Removed ${titles.length} task${titles.length > 1?'s':''} from your Agenda: ${titles.join(", ")}`,
            `(${titles.length}) task${titles.length > 1?'s':''} ${titles.join(", ")} to be removed from user '${USER_ID}'`
        );
    }


    // HELPER METHODS
    log(TYPE, ID, log, report) {
        if(!(TYPE && ID && log)) return;

        if(!this[TYPE][ID]) this[TYPE][ID] = {};
        if(!this[TYPE][ID]['$push']) this[TYPE][ID]['$push'] = {};
        if(!this[TYPE][ID]['$push']['changeLog']) this[TYPE][ID]['$push']['changeLog'] = {
            date: moment().toJSON(),
            user: this.USER_ID,
            display: log
        };
        else this[TYPE][ID]['$push']['changeLog']['display'] += `\n${log}`;

        if(this.report && report) this.report.logResponse(report);
    }

    pull(TYPE, ID, path, item) {
        if(!(TYPE && ID && path && item)) return;

        if(!this[TYPE][ID]) this[TYPE][ID] = {};
        if(!this[TYPE][ID]['$pull']) this[TYPE][ID]['$pull'] = {};
        if(!this[TYPE][ID]['$pull'][path]) this[TYPE][ID]['$pull'][path] = item;
        else if(this[TYPE][ID]['$pull'][path]['$in']) {
            if(item['$in']) this[TYPE][ID]['$pull'][path]['$in'] = this[TYPE][ID]['$pull'][path]['$in'].concat(item['$in']);
            else this[TYPE][ID]['$pull'][path]['$in'].push(item);
        }
        else if(item['$in']) this[TYPE][ID]['$pull'][path] = { $in: [].concat(this[TYPE][ID]['$pull'][path], item['$in']) };
        else this[TYPE][ID]['$pull'][path] = {
            $in: [
                this[TYPE][ID]['$pull'][path],
                item
            ]
        };
    }

    delete(TYPE, ID) {
        if(!(this[TYPE][ID])) this[TYPE][ID] = { delete: true };
        else this[TYPE][ID]['delete'] = true;
    }

}

class Report {
    constructor(res) {
        this.res = res;
        this.waiting = 0;
        this.report = {
            status: "SUCCESS",
            response: [],    // { msg, response }
            error: [],     // { msg, error }
            data: null
        };

        this.sendResult = this.sendResult.bind(this);
        this.addData = this.addData.bind(this);
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
        if(this.waiting === 0 && this.report.status !== 'SENT') {
            if(this.report.error.length > 0) this.report.status = "PARTIAL SUCCESS";
            this.res.status(200).json(this.report);
            console.log(`STATUS: ${this.report.status}\n`);
            this.report.status = 'SENT';
        }
    }

    logAction(action) {
        console.log(`\nREQUEST TYPE: ${action}`);
        this.report.response.push({ msg: `REQUEST TYPE: ${action}` });
    }

    logResponse(msg = "") {
        console.log(`UPDATE: ${msg}`);
        this.report.response.push({ msg });
    }

    logError(msg = "", error = "") {
        console.log(`--ERROR-- : ${msg}`);
        if(error !== "") console.log(error);
        this.report.error.push({ msg, error });
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
        if(this.report.status === 'SENT') return console.log('CRITICAL ERROR: ---HEADERS ALREADY SENT!---');
        this.report.status = "FAILED";
        this.report.error.push({ msg, error });
        this.res.status(500).json(this.report);
        console.log(`STATUS: ${this.report.status}\n`);
        this.report.status = 'SENT';
    }
}
