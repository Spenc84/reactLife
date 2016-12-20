import React from 'react';
import ReactDOM from 'react-dom';
import SERVER from 'axios';
import moment from 'moment';
import { Map, List, fromJS } from 'immutable';
import { Index } from './components/tools';

import Main from './main';

// DEFAULTS
const TASK_COLOR = 'rgb(0, 120, 255)';
const DEFAULT_SCHEDULE = (()=>{
    let availability = [];
    for(let i=0;i<7;i++) {
        let day = [];
        for(let j=0;j<8;j++) day.push(false);
        for(let j=8;j<21;j++) day.push(true);
        for(let j=21;j<24;j++) day.push(false);
        availability.push(day);
    }
    return Map({
        duration: 0,
        startTime: '',
        softDeadline: '',
        hardDeadline: '',
        availability: fromJS(availability)
    });
})();


export default class LifeApp extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            authenticated: false,
            USER: Map(),
            tIndx: {},
            loading: true
        };

        this.buildTask = this.buildTask.bind(this);
        this.updateTasks = this.updateTasks.bind(this);
        this.scheduleTasks = this.scheduleTasks.bind(this);
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
                agenda={ USER.get("agenda") || List()}
                api={{
                    buildTask: this.buildTask,
                    updateTasks: this.updateTasks,
                    scheduleTasks: this.scheduleTasks,
                    deleteTasks: this.deleteTasks
                }}
                {...this.state}
            />
        );
	}

    getUser() {
        return SERVER.get("/api/user/575350c7b8833bf5125225a5").then(  // TEMP
            incoming => {
                console.log("incoming", incoming);
                const { data:user, data:{ tasks, agenda } } = incoming;
                this.setState({
                    authenticated: true,
                    USER: fromJS(user),
                    tIndx: (tasks) ? Index(tasks) : {},
                    loading: false
                });
                console.log(`User Authenticated: `, user);
            },
            rejected => {
                this.setState({ loading: false });
                console.log('Failed to acquire user', rejected);
                alert("An error has occured. Check console for details.");
            }
        );
    }

    createNewTask(newTask) {
        const { USER } = this.state;

        this.setState({ loading: true });
        SERVER.post("/api/tasks", newTask.toJS()).then(
            ({data, data:{data:createdTask}}) => {
                console.log("SERVER-RESPONSE: ", data);
                console.log("SERVER: ---Task Created---", createdTask);
                const task = fromJS(createdTask);
                const taskList = USER.get('tasks').push(task);
                const agenda = task.getIn(['status', 'scheduled']) ? this.addToAgenda(task) : USER.get('agenda');
                this.setState({
                    USER: USER.withMutations(user => user.set('tasks', taskList).set('agenda', agenda)),
                    tIndx: Index(taskList),
                    loading: false
                });
            },
            rejected => {
                this.setState({ loading: false });
                console.log('Failed to create task: ', rejected);
                alert("An error has occured. Check console for details.");
            }
        );
    }

    buildTask(title, tab) {
        const userID = this.state.USER.get('_id');
        const minute = Math.floor(moment().minute()/15)*15;
        const now = moment().minute(minute).startOf('minute');

        let status = Map();
        let schedule = DEFAULT_SCHEDULE;
        let scheduledTime = "";
        // Fix pending tasks getting added with the wrong scheduled time

        if( tab === 'ACTIVE' ) {
            status = Map({
                active: true,
                scheduled: true,
                inactive: false
            });
            scheduledTime = now.toJSON();
            schedule = schedule.set('startTime', scheduledTime);
        }
        if( tab === 'PENDING' ) {
            status = Map({
                pending: true,
                scheduled: true,
                inactive: false
            });
            scheduledTime = now.clone().add(1, 'day').toJSON();
            schedule = schedule.set('startTime', scheduledTime);
        }

        const newTask = Map({
            title,
            color: TASK_COLOR,
            description: "",
            users: Map({
                [userID]: {
                    securityAccess: 30,
                    scheduled: scheduledTime
                }
            }),
            status,
            schedule,
            changeLog: List([
                Map({
                    date: now.toJSON(),
                    user: userID,
                    display: 'Task created.'
                })
            ])
        });

        this.createNewTask(newTask);
    }

    addToAgenda(task) {
        const { USER } = this.state;
        let agenda = USER.get('agenda');

        const taskID = task.get('_id');

        const scheduledTime = task.getIn(['users', USER.get('_id'), 'scheduled']);
        const startTime = task.getIn(['schedule', 'startTime']);
        const softDeadline = task.getIn(['schedule', 'softDeadline']);
        const hardDeadline = task.getIn(['schedule', 'hardDeadline']);

        if(scheduledTime !== '') {
            const scheduledDate = moment(scheduledTime).startOf('day').valueOf().toString();
            agenda = agenda.has(scheduledDate)
                ?   agenda.updateIn( [scheduledDate, 'scheduled'], list=>list.push(taskID) )
                :   agenda.set(scheduledDate, fromJS({
                        date: moment(scheduledDate).toJSON(),
                        start: [],
                        soft: [],
                        hard: [],
                        scheduled: [taskID]
                    }));
        }
        if(startTime !== '') {
            const startDate = moment(startTime).startOf('day').valueOf().toString();
            agenda = agenda.has(startDate)
                ?   agenda.updateIn( [startDate, 'start'], list=>list.push(taskID) )
                :   agenda.set(startDate, fromJS({
                        date: moment(startDate).toJSON(),
                        start: [taskID],
                        soft: [],
                        hard: [],
                        scheduled: []
                    }));
        }
        if(softDeadline !== '') {
            const softDate = moment(softDeadline).startOf('day').valueOf().toString();
            agenda = agenda.has(softDate)
                ?   agenda.updateIn( [softDate, 'soft'], list=>list.push(taskID) )
                :   agenda.set(softDate, fromJS({
                        date: moment(softDate).toJSON(),
                        start: [],
                        soft: [taskID],
                        hard: [],
                        scheduled: []
                    }));
        }
        if(hardDeadline !== '') {
            const hardDate = moment(hardDeadline).startOf('day').valueOf().toString();
            agenda = agenda.has(hardDate)
                ?   agenda.updateIn( [hardDate, 'hard'], list=>list.push(taskID) )
                :   agenda.set(hardDate, fromJS({
                        date: moment(hardDate).toJSON(),
                        start: [],
                        soft: [],
                        hard: [taskID],
                        scheduled: []
                    }));
        }

        return agenda;
    }

    updateTasks(selectedTasks, desiredChanges) {
        if(!List.isList(selectedTasks) || typeof desiredChanges !== 'object') return;
        const { USER } = this.state;
        const userID = USER.get('_id');
        selectedTasks = selectedTasks.toJS();

        this.setState({ loading: true });
        SERVER.put("/api/tasks", {selectedTasks, desiredChanges, userID}).then(
            ({data:taskList}) => {
                console.log("SERVER: ---Tasks updated---", taskList);
                this.setState({
                    USER: USER.set('tasks', fromJS(taskList)),
                    tIndx: Index(taskList),
                    loading: false
                });
            },
            rejected => {
                this.setState({ loading: false });
                console.log('Failed to update tasks: ', rejected);
                alert("An error has occured. Check console for details.");
            }
        );
    }

    scheduleTasks(selectedTasks, schedule) {
        if(!Map.isMap(schedule) || !List.isList(selectedTasks) || selectedTasks.size === 0) {
            let error = [];
            if(!Map.isMap(schedule)) error.push(`Invalid input: 'schedule' should be of type <Map>, and not <${typeof schedule}>`, schedule);
            if(!List.isList(selectedTasks)) error.push(`Invalid input: 'selectedTasks' should be of type <List>, and not <${typeof schedule}>`, selectedTasks);
            else if(selectedTasks.size === 0) error.push("Cannot schedule tasks if no tasks are selected.", schedule.toJS());
            for(let i=0;i<error.length;i++) console.warn(error[i]);
            alert("An error has occured. Check console for details.");
            return;
        }
        const { USER } = this.state;
        
        const userID = USER.get('_id');
        selectedTasks = selectedTasks.toJS();
        schedule = schedule.toJS();

        this.setState({ loading: true });
        SERVER.put("/api/tasks/schedule", {selectedTasks, schedule, userID}).then(
            ({data:taskList}) => {
                console.log("SERVER: ---Tasks updated---", taskList);
                this.setState({
                    USER: USER.set('tasks', fromJS(taskList)),
                    tIndx: Index(taskList),
                    loading: false
                });
            },
            rejected => {
                this.setState({ loading: false });
                console.log('Failed to schedule tasks: ', rejected);
                alert("An error has occured. Check console for details.");
            }
        );
    }

    deleteTasks(selectedTasks) {
        if(!List.isList(selectedTasks) || selectedTasks.size < 1) return;
        const { USER, tIndx } = this.state;
        const existingTaskList = USER.get('tasks');

        if(selectedTasks.size === 1) {
            const taskName = existingTaskList.get( tIndx[selectedTasks.get(0)] ).get('title');
            if( !confirm(`Are you sure you want to delete task '${taskName}'?`) ) return;
        }
        else {
            if( !confirm(`Are you sure you want to delete these ${selectedTasks.size} tasks?'`) ) return;
        }

        const taskIDs = selectedTasks.join('-');
        const IDs = `${USER.get('_id')}-${taskIDs}`;

        this.setState({ loading: true });
        SERVER.delete(`/api/task/${IDs}`).then(
            approved => {
                console.log(`SERVER: ---${selectedTasks.size} Tasks deleted---`, approved.data);
                const updatedUser = approved.data.data;

                this.setState({
                    USER: fromJS(updatedUser),
                    tIndx: Index(updatedUser.tasks),
                    loading: false
                });
            },
            rejected => {
                this.setState({ loading: false });
                console.log('Failed to delete task(s): ', rejected);
                alert("An error has occured. Check console for details.");
            }
        );
    }

    // refreshTaskData() {
    //     const { USER, loading } = this.state;
    //     const userID = USER.get('_id');
    //     if(!loading) this.setState({ loading: true });
    //
    //     SERVER.get(`/api/user/${userID}/tasks`).then(
    //         ({data:taskList}) => {
    //             console.log("SERVER: ---Incoming TaskList---", taskList);
    //             this.setState({
    //                 USER: USER.set('tasks', fromJS(taskList)),
    //                 tIndx: Index(taskList),
    //                 loading: false
    //             });
    //         },
    //         rejected => {
    //             this.setState({ loading: false });
    //             console.log('Failed to refresh Task data: ', rejected);
    //             alert("An error has occured. Check console for details.");
    //         }
    //     );
    // }
}

ReactDOM.render(<LifeApp/>, document.querySelector("App"));
