import React from 'react';
import ReactDOM from 'react-dom';
import SERVER from 'axios';
import moment from 'moment';
import { Map, List, fromJS } from 'immutable';
import { getDefaultTask } from './defaults';
import {
    Index,
    applyOperation,
    addTaskToList,
    addTaskToParents,
    addTaskToChildren,
    updateTaskOnList,
    updateTaskOnParents,
    updateTaskOnChildren,
    removeTasksFromList,
    removeTaskFromParents,
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
                schedule={ USER.get("schedule") || List() }
                tasks={ USER.get("tasks") || List() }
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
                const { data:user, data:{ _id } } = incoming;
                USER_ID = _id;
                if(USER_ID) {
                    user.tasks.sort(
                        (x,y) =>  x.is.project === y.is.project ? 0
                                : x.is.project ? -1
                                : 1
                    );
                    this.setState({
                        authenticated: true,
                        USER: fromJS(user),
                        tIndx: Index(user.tasks),
                        loading: false
                    });
                    console.log(`User Authenticated: `, user);
                }
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
        SERVER.post( "/api/tasks", {
            USER_ID: USER.get('_id'),
            ACTIONS: {
                action: 'CREATE',
                data: newTask.toJS()
            }
        })
        .then(
            ({data, data:{data:createdTask}}) => {
                console.log("SERVER-RESPONSE: ", data);
                console.log("SERVER: ---Task Created---", createdTask);

                const task = fromJS(createdTask);

                // Update task list
                const taskList = USER.get('tasks').withMutations( list => {
                    addTaskToParents(list, task, tIndx);
                    addTaskToChildren(list, task, tIndx);
                    addTaskToList(list, task);
                }).sort(
                    (x,y) =>  x.getIn(['is','project']) === y.getIn(['is','project']) ? 0
                            : x.getIn(['is','project']) ? -1
                            : 1
                );

                // Update schedule
                const schedule = task.getIn(['is', 'scheduled'])
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

    updateTasks({ACTIONS, action, pendingTasks, operation, onSubmit, onSuccess}) {
        if(Array.isArray(arguments[0])) ACTIONS = arguments[0];
        if(!ACTIONS) ACTIONS = [{action, pendingTasks, operation}];

        const { USER, tIndx } = this.state;
        const TASKS = USER.get('tasks');

        let taskTotal = 0;

        const user = USER.withMutations( user => {

            ACTIONS.forEach( ({action, pendingTasks, operation}) => {

                if(pendingTasks) taskTotal += pendingTasks.length || pendingTasks.size;

                switch(action) {

                    case 'SCHEDULE':
                        user.set(
                            'schedule',
                            user.get('schedule').withMutations(
                                schedule => {
                                    pendingTasks.forEach( taskID => {
                                        const oldTask = TASKS.get( tIndx[ taskID ] );
                                        if(oldTask.getIn(['is', 'scheduled'])) removeTaskFromSchedule(schedule, oldTask);
                                    });
                                }
                            )
                        );
                    break;

                    case 'MODIFY':
                    default:
                        user.set(
                            'tasks',
                            user.get('tasks').withMutations(
                                applyOperation({pendingTasks, operation, tIndx})
                            )
                        );
                    break;

                }

            });

        });

        this.setState({
            USER: user,
            loading: true
        });

        if(typeof onSubmit === 'function') onSubmit();

        SERVER.put( "/api/tasks", {
            USER_ID: USER.get('_id'),
            ACTIONS: List(ACTIONS).toJS()
        })
        .then(
            ({ data }) => {
                console.log(`SERVER: ---(${taskTotal}) Task${taskTotal>1?'s':''} updated---`, data);

                if( data.data ) {

                    const taskData = fromJS(data.data);

                    // Update user's schedule
                    const schedule = this.state.USER.get('schedule').withMutations( schedule => {
                        taskData.forEach( task => { if(task.getIn(['is', 'scheduled'])) addTaskToSchedule(schedule, task) });
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

                if(typeof onSuccess === 'function') onSuccess();
            },
            rejected => {
                console.log('Failed to update tasks: ', rejected);
                this.setState({
                    USER,
                    loading: false
                });
                if(typeof onFail === 'function') onFail();
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
                if( task.getIn(['is', 'scheduled']) ) {
                    removeTaskFromSchedule(schedule, task);
                }
            });

        });

        this.setState({
            USER: USER.withMutations(user => user.set('tasks', taskList).set('schedule', schedule)),
            tIndx: Index(taskList),
            loading: true
        });


        SERVER.put( "/api/tasks", {
            USER_ID: USER.get('_id'),
            ACTIONS: {
                action: 'DELETE',
                pendingTasks: selectedTasks.toJS()
            }
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
