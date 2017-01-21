import React from 'react';
import ReactDOM from 'react-dom';
import SERVER from 'axios';
import moment from 'moment';
import { Map, List, fromJS } from 'immutable';
import { getDefaultTask } from './defaults';
import {
    Index,
    buildTaskList,
    addTaskToList,
    updateTaskOnList,
    removeTasksFromList,
    addTaskToParents,
    removeTaskFromParents,
    addTaskToChildren,
    removeTaskFromChildren,
    addTaskToSchedule,
    removeTaskFromSchedule
} from './components/tools';

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
                schedule={ USER.get("schedule") || List()}
                api={{
                    createNewTask: this.createNewTask,
                    updateTasks: this.updateTasks,
                    deleteTasks: this.deleteTasks
                }}
                {...this.state}
            />
        );
	}

    // SERVER FUNCTIONS
    getUser() {
        return SERVER.get("/api/user/575350c7b8833bf5125225a5").then(  // TEMP
            incoming => {
                console.log("incoming", incoming);
                const { data:user, data:{ _id, tasks, agenda } } = incoming;
                USER_ID = _id;
                if(agenda) {
                    user.schedule = agenda;
                    delete user.agenda;
                }
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

        this.setState({ loading: true });
        SERVER.post("/api/tasks", {ACTION: 'CREATE', USER_ID: USER.get('_id'), DATA:newTask.toJS()}).then(
            ({data, data:{data:createdTask}}) => {
                console.log("SERVER-RESPONSE: ", data);
                console.log("SERVER: ---Task Created---", createdTask);

                const task = fromJS(createdTask);

                // Update task list
                const taskList = USER.get('tasks').withMutations( list => {
                    addTaskToParents(list, task, tIndx);
                    addTaskToChildren(list, task, tIndx);
                    addTaskToList(list, task);
                });

                // Update schedule
                const schedule = task.getIn(['status', 'scheduled'])
                    ?   USER.get('schedule').withMutations(
                            schedule => addTaskToSchedule(schedule, task)
                        )
                    :   undefined;

                // Update user
                const updatedUser = schedule
                    ?   USER.withMutations(user => user.set('tasks', taskList).set('schedule', schedule))
                    :   USER.set('tasks', taskList);

                this.setState({
                    USER: updatedUser,
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

        const updatedTasks
            = task ? List([task])
            : selectedTasks ? buildTaskList(TASKS, selectedTasks, operation)
            : undefined;

        if(updatedTasks === undefined) return console.warn("UpdateTasks() called without any tasks selected.");

        const user = USER.withMutations( user => {

            user.set('tasks', TASKS.withMutations( list => {
                updatedTasks.forEach( task => updateTaskOnList(list, task, tIndx) );
                updatedTasks.forEach( task => {
                    addTaskToParents(list, task, tIndx);
                    addTaskToChildren(list, task, tIndx);
                });
            }));

            if( ACTION === 'SCHEDULE' )
            user.set('schedule', USER.get('schedule').withMutations( schedule =>
                updatedTasks.forEach( task => {
                    const oldTask = TASKS.get( tIndx[ task.get('_id') ] );
                    if(oldTask.getIn(['status', 'scheduled'])) removeTaskFromSchedule(schedule, oldTask);
                })
            ));

        });

        this.setState({
            USER: user,
            loading: true
        });

        const TASK_LIST = task ? [task.get('_id')] : selectedTasks.toJS();

        SERVER.put(
            "/api/tasks",
            {
                ACTION,
                USER_ID: USER.get('_id'),
                TASK_LIST,
                OPERATION:operation
            }
        )
        .then(
            ({ data }) => {
                console.log(`SERVER: ---(${TASK_LIST.length}) Task${TASK_LIST.length>1?'s':''} updated---`, data);

                if( ACTION === 'SCHEDULE' ) {

                    const taskData = fromJS(data.data);

                    // Update user's schedule
                    const schedule = this.state.USER.get('schedule').withMutations( schedule => {
                        taskData.forEach( task => { if(task.getIn(['status', 'scheduled'])) addTaskToSchedule(schedule, task) });
                    });
                    // Update task list with any new tasks returned from the server (now that scheduledTime has been set)
                    const tasks = this.state.USER.get('tasks').withMutations( list => {
                        taskData.forEach( task => updateTaskOnList(list, task, tIndx) );
                    });

                    this.setState({
                        USER: USER.withMutations( user => user.set('schedule', schedule).set('tasks', tasks) ),
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
        const TASKS = USER.get('tasks');
        const SCHEDULE = USER.get('schedule');

        // Confirm with user that tasks are to be deleted
        if(selectedTasks.size === 1) {
            const taskName = TASKS.get( tIndx[selectedTasks.get(0)] ).get('title');
            if( !confirm(`Are you sure you want to delete task '${taskName}'?`) ) return;
        }
        else if( !confirm(`Are you sure you want to delete (${selectedTasks.size}) tasks?'`) ) return;

        // Update task list
        const taskList = removeTasksFromList(TASKS, selectedTasks, tIndx);

        // Update schedule
        const schedule = SCHEDULE.withMutations( schedule => {

            selectedTasks.forEach( taskID => {
                const task = TASKS.get( tIndx[taskID] );
                if( task.getIn(['status', 'scheduled']) ) {
                    removeTaskFromSchedule(schedule, task);
                }
            });

        });

        this.setState({
            USER: USER.withMutations(user => user.set('tasks', taskList).set('schedule', schedule)),
            tIndx: Index(taskList),
            loading: true
        });

        SERVER.put("/api/tasks", {
            ACTION: 'DELETE',
            USER_ID: USER.get('_id'),
            TASK_LIST: selectedTasks.toJS()
        })
        .then(
            approved => console.log(`SERVER: ---${selectedTasks.size} Tasks deleted---`, approved.data),
            rejected => {
                console.log('Failed to delete task(s): ', rejected);
                this.setState({
                    USER,
                    tIndx,
                    loading: false
                });
                alert("An error has occured. Check console for details.");
            }
        );

        // If user confirms that tasks are to be removed, call the callback function if there is one
        if(typeof callback === 'function') callback();
    }

}

ReactDOM.render(<LifeApp/>, document.querySelector("App"));
