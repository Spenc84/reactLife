import React from 'react';
import ReactDOM from 'react-dom';
import SERVER from 'axios';
import moment from 'moment';
import { Map, List, fromJS } from 'immutable';
import { Index } from './components/tools';
import { getDefaultTask } from './defaults';

import Main from './main';

// EXTERNAL API
let USER_ID;
export function getUSER_ID() { return USER_ID; }


export default class LifeApp extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            authenticated: false,
            USER: Map(),
            tIndx: {},
            loading: true
        };

        this.createNewTask = this.createNewTask.bind(this);
        this.updateTasks = this.updateTasks.bind(this);
        this.deleteTasks = this.deleteTasks.bind(this);
    }

    componentDidMount() {
        this.serverRequest = this.getUser();
    }

	render() {
        const { USER } = this.state;

        return (
            <Main
                tasks={ USER.get("tasks") || List()}
                schedule={ USER.get("agenda") || List()}
                api={{
                    createNewTask: this.createNewTask,
                    updateTasks: this.updateTasks,
                    deleteTasks: this.deleteTasks
                }}
                {...this.state}
            />
        );
	}

    // LOCAL FUNCTIONS
    addToSchedule(task, schedule) {
        const { USER } = this.state;
        schedule = schedule || USER.get('agenda');

        const taskID = task.get('_id');

        const scheduledTime = task.getIn(['schedule', 'scheduledTime']);
        const startTime = task.getIn(['schedule', 'startTime']);
        const softDeadline = task.getIn(['schedule', 'softDeadline']);
        const hardDeadline = task.getIn(['schedule', 'hardDeadline']);

        if(scheduledTime !== '') {
            const scheduledDate = moment(scheduledTime).startOf('day').valueOf().toString();
            schedule = schedule.has(scheduledDate)
                ?   schedule.updateIn( [scheduledDate, 'scheduled'], list=>list.push(taskID) )
                :   schedule.set(scheduledDate, fromJS({
                        date: moment(scheduledDate).toJSON(),
                        start: [],
                        soft: [],
                        hard: [],
                        scheduled: [taskID]
                    }));
        }
        if(startTime !== '') {
            const startDate = moment(startTime).startOf('day').valueOf().toString();
            schedule = schedule.has(startDate)
                ?   schedule.updateIn( [startDate, 'start'], list=>list.push(taskID) )
                :   schedule.set(startDate, fromJS({
                        date: moment(startDate).toJSON(),
                        start: [taskID],
                        soft: [],
                        hard: [],
                        scheduled: []
                    }));
        }
        if(softDeadline !== '') {
            const softDate = moment(softDeadline).startOf('day').valueOf().toString();
            schedule = schedule.has(softDate)
                ?   schedule.updateIn( [softDate, 'soft'], list=>list.push(taskID) )
                :   schedule.set(softDate, fromJS({
                        date: moment(softDate).toJSON(),
                        start: [],
                        soft: [taskID],
                        hard: [],
                        scheduled: []
                    }));
        }
        if(hardDeadline !== '') {
            const hardDate = moment(hardDeadline).startOf('day').valueOf().toString();
            schedule = schedule.has(hardDate)
                ?   schedule.updateIn( [hardDate, 'hard'], list=>list.push(taskID) )
                :   schedule.set(hardDate, fromJS({
                        date: moment(hardDate).toJSON(),
                        start: [],
                        soft: [],
                        hard: [taskID],
                        scheduled: []
                    }));
        }

        return schedule;
    }

    removeFromSchedule(task, schedule) {
        const { USER } = this.state;
        schedule = schedule || USER.get('agenda');

        const taskID = task.get('_id');

        const time = {
            scheduled: task.getIn(['schedule', 'scheduledTime']),
            start: task.getIn(['schedule', 'startTime']),
            soft: task.getIn(['schedule', 'softDeadline']),
            hard: task.getIn(['schedule', 'hardDeadline'])
        };

        for(let key in time) {
            if(time[key]) {
                const unix = `${moment(time[key]).startOf('day').valueOf()}`;
                if(schedule.has(unix)) {
                    const index = schedule.getIn([unix, key]).indexOf(taskID);
                    if(index !== -1) schedule = schedule.deleteIn([unix, key, index]);
                    if(
                        schedule.getIn([unix, 'scheduled']).size === 0 &&
                        schedule.getIn([unix, 'start']).size === 0 &&
                        schedule.getIn([unix, 'soft']).size === 0 &&
                        schedule.getIn([unix, 'hard']).size === 0
                    ) schedule = schedule.delete(unix);
                }
            }
        }

        return schedule;
    }


    // SERVER FUNCTIONS
    getUser() {
        return SERVER.get("/api/user/575350c7b8833bf5125225a5").then(  // TEMP
            incoming => {
                console.log("incoming", incoming);
                const { data:user, data:{ _id, tasks, agenda } } = incoming;
                USER_ID = _id;
                this.setState({
                    authenticated: true,
                    USER: fromJS(user),
                    tIndx: (tasks) ? Index(tasks) : {},
                    loading: false
                });
                console.log(`User Authenticated: `, user);
            },
            rejected => {
                console.log('Failed to acquire user', rejected);
                this.setState({ loading: false });
                alert("An error has occured. Check console for details.");
            }
        );
    }

    createNewTask(newTask) {
        const { USER, tIndx } = this.state;

        // Set status of newTask
        const startTime = newTask.getIn(['schedule', 'startTime']);
        newTask = newTask.withMutations( task =>
            task.setIn(['status', 'scheduled'], !!startTime)
                .setIn(['status', 'active'], moment().isSameOrAfter(startTime))
                .setIn(['status', 'pending'], moment().isBefore(startTime))
                .setIn(['status', 'inactive'], !startTime)
        );

        this.setState({ loading: true });
        SERVER.post("/api/tasks", {ACTION: 'CREATE', USER_ID: USER.get('_id'), DATA:newTask.toJS()}).then(
            ({data, data:{data:createdTask}}) => {
                console.log("SERVER-RESPONSE: ", data);
                console.log("SERVER: ---Task Created---", createdTask);
                const task = fromJS(createdTask);

                const taskID = task.get('_id');
                const parentTasks = task.get('parentTasks');
                const childTasks = task.get('childTasks');

                const taskList = USER.get('tasks').withMutations( tasks => {
                    tasks.push(task);
                    parentTasks.forEach( ID => tasks.updateIn([tIndx[ID], 'childTasks'], value => value.push(taskID)) );
                    childTasks.forEach( ID => tasks.updateIn([tIndx[ID], 'parentTasks'], value => value.push(taskID)) );
                });

                const schedule = task.getIn(['status', 'scheduled']) ? this.addToSchedule(task) : USER.get('agenda');

                this.setState({
                    USER: USER.withMutations(user => user.set('tasks', taskList).set('agenda', schedule)),
                    tIndx: Index(taskList),
                    loading: false
                });
            },
            rejected => {
                console.log('Failed to create task: ', rejected);
                this.setState({ loading: false });
                alert("An error has occured. Check console for details.");
            }
        );
    }

    updateTasks({task, selectedTasks, operation, callback}, ACTION = 'MODIFY') {
        const { USER, tIndx } = this.state;
        const TASKS = USER.get('tasks');
        const USER_ID = USER.get('_id');

        // Update the local version of each task before sending the changes to the server
        if(task) {

            const taskID = task.get('_id');
            const index = tIndx[ task.get('_id') ];
            const oldTask = TASKS.get( index );

            const user = ACTION === 'SCHEDULE' && oldTask.getIn(['status', 'scheduled'])
                ? USER.withMutations( user => user.set('agenda', this.removeFromSchedule(oldTask)).setIn(['tasks', index], task) )
                : USER.setIn(['tasks', index], task);

            this.setState({
                USER: user,
                loading: true
            });

        }
        else if(selectedTasks) {

            const schedule = ACTION === 'SCHEDULE'
                ?   USER.get('agenda').withMutations( schedule => {
                        selectedTasks.forEach( taskID => {
                            const oldTask = TASKS.get( tIndx[ taskID ] );
                            if(oldTask.getIn(['status', 'scheduled'])) this.removeFromSchedule(oldTask, schedule);
                        });
                    })
                :   undefined;

            const tasks = TASKS.withMutations( tasks => {
                selectedTasks.forEach( taskID => {
                    const index = tIndx[ taskID ];

                    for(let key in operation['$set']) {
                        tasks.setIn([index].concat(key.split('.')), operation['$set'][key]);
                    }
                    tasks.setIn([index, 'changeLog'], tasks.getIn([index, 'changeLog']).push(operation['$push']['changeLog']));
                });
            });

            const user = ACTION === 'SCHEDULE'
                ?   USER.withMutations( user => user.set('agenda', schedule).set('tasks', tasks) )
                :   USER.set('tasks', tasks);

            this.setState({
                USER: user,
                loading: true
            });

        }
        else return console.warn("UpdateTasks() called without any tasks selected.");

        const TASK_LIST = task ? [task.get('_id')] : selectedTasks.toJS();
        const numTasks = task ? 1 : selectedTasks.size;

        SERVER.put("/api/tasks", { ACTION, USER_ID, TASK_LIST, OPERATION:operation }).then(
            ({ data }) => {
                console.log(`SERVER: ---${numTasks} Task${numTasks>1?'s':''} updated---`, data);

                if( ACTION === 'SCHEDULE' ) {

                    const taskData = fromJS(data.data);

                    // Update user's schedule
                    const schedule = this.state.USER.get('agenda').withMutations( schedule => {
                        taskData.forEach( task => { if(task.getIn(['status', 'scheduled'])) this.addToSchedule(task, schedule) });
                    });
                    // Update task list with any new tasks returned from the server (now that scheduledTime has been set)
                    const tasks = this.state.USER.get('tasks').withMutations( tasks => {
                        taskData.forEach( task => tasks.set( tIndx[ task.get('_id') ], task ) );
                    });

                    this.setState({
                        USER: USER.withMutations( user => user.set('agenda', schedule).set('tasks', tasks) ),
                        loading: false
                    });

                }
                else this.setState({ loading: false });

                if(typeof callback === 'function') callback();
            },
            // If the changes fail on the server, revert the local tasks to their original state
            rejected => {
                console.log('Failed to update tasks: ', rejected);
                this.setState({
                    USER,
                    loading: false
                });
                alert("An error has occured. Check console for details.");
            }
        );
    }

    deleteTasks(selectedTasks, callback) {
        if(!List.isList(selectedTasks) || selectedTasks.size < 1) return;
        const { USER, tIndx } = this.state;
        const existingTaskList = USER.get('tasks');

        if(selectedTasks.size === 1) {
            const taskName = existingTaskList.get( tIndx[selectedTasks.get(0)] ).get('title');
            if( !confirm(`Are you sure you want to delete task '${taskName}'?`) ) return;
        }
        else {
            if( !confirm(`Are you sure you want to delete (${selectedTasks.size}) tasks?'`) ) return;
        }

        this.setState({ loading: true });

        SERVER.put("/api/tasks", {
            ACTION: 'DELETE',
            USER_ID: USER.get('_id'),
            TASK_LIST: selectedTasks.toJS()
        })
        .then(
            approved => {
                console.log(`SERVER: ---${selectedTasks.size} Tasks deleted---`, approved.data);
                const updatedUser = approved.data.data;

                this.setState({
                    USER: fromJS(updatedUser),
                    tIndx: Index(updatedUser.tasks),
                    loading: false
                });

                if(typeof callback === 'function') callback();
            },
            rejected => {
                console.log('Failed to delete task(s): ', rejected);
                this.setState({
                    USER,
                    loading: false
                });
                alert("An error has occured. Check console for details.");
            }
        );
    }

}

ReactDOM.render(<LifeApp/>, document.querySelector("App"));
