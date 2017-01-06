import React from 'react';
import ReactDOM from 'react-dom';
import SERVER from 'axios';
import moment from 'moment';
import { Map, List, fromJS } from 'immutable';
import { Index } from './components/tools';

import Main from './main';

// DEFAULTS
const DEFAULT_TASK_COLOR = '#0078ff';
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

        this.buildTask = this.buildTask.bind(this);
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
                    buildTask: this.buildTask,
                    updateTasks: this.updateTasks,
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
                this.setState({ loading: false });
                console.log('Failed to acquire user', rejected);
                alert("An error has occured. Check console for details.");
            }
        );
    }

    createNewTask(newTask) {
        const { USER } = this.state;

        // Set status of newTask
        const startTime = newTask.getIn(['schedule', 'startTime']);
        newTask.set('status', Map({
            scheduled: startTime,
            active: moment().isSameOrAfter(startTime),
            pending: moment().isBefore(startTime),
            inactive: !startTime
        }));

        this.setState({ loading: true });
        SERVER.post("/api/tasks", {newTask:newTask.toJS(), userID:USER.get('_id')}).then(
            ({data, data:{data:createdTask}}) => {
                console.log("SERVER-RESPONSE: ", data);
                console.log("SERVER: ---Task Created---", createdTask);
                const task = fromJS(createdTask);
                const taskList = USER.get('tasks').push(task);
                const schedule = task.getIn(['status', 'scheduled']) ? this.addToSchedule(task) : USER.get('agenda');
                this.setState({
                    USER: USER.withMutations(user => user.set('tasks', taskList).set('agenda', schedule)),
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

        const startTime = tab === 'ACTIVE'
            ? moment().minute(minute).startOf('minute').toJSON()
            : moment().add(1, 'day').minute(minute).startOf('minute').toJSON();

        const schedule = tab === 'ACTIVE' || tab === 'PENDING'
            ? DEFAULT_SCHEDULE.set('startTime', startTime)
            : DEFAULT_SCHEDULE;

        const newTask = Map({
            title,
            color: DEFAULT_TASK_COLOR,
            description: "",
            users: fromJS([{
                user: userID,
                securityAccess: 30
            }]),
            schedule
        });

        this.createNewTask(newTask);
    }

    addToSchedule(task) {
        const { USER } = this.state;
        let schedule = USER.get('agenda');

        const taskID = task.get('_id');

        const scheduledTime = task.getIn(['users', USER.get('_id'), 'scheduled']);
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

    updateTasks({task, selectedTasks, operation}, TYPE = 'MODIFY') {
        const { USER } = this.state;
        const TASKS = USER.get('tasks');
        const USER_ID = USER.get('_id');

        // Update the local version of each task before sending the changes to the server
        if(task) {

            const taskID = task.get('_id');
            const index = TASKS.findIndex(task=>task.get("_id") === taskID);

            this.setState({
                USER: USER.setIn(['tasks', index], task),
                loading: true
            });

        }
        else if(selectedTasks) {

            const tasks = TASKS.withMutations( map => {
                selectedTasks.forEach(taskID => {
                    const index = TASKS.findIndex(task => task.get('_id') === taskID);
                    if(index === -1) return console.log(`Unable to find taskID '${taskID}' in TASKS`);

                    for(let key in operation['$set']) {
                        map.setIn([index].concat(key.split('.')), operation['$set'][key]);
                    }
                    map.setIn([index, 'changeLog'], map.getIn([index, 'changeLog']).push(operation['$push']['changeLog']));
                });
            });

            this.setState({
                USER: USER.set('tasks', tasks),
                loading: true
            });

        }
        else return console.warn("UpdateTasks() called without any tasks selected.");

        const TASK_LIST = task ? [task.get('_id')] : selectedTasks.toJS();

        SERVER.put("/api/tasks", { TYPE, USER_ID, TASK_LIST, OPERATION:operation }).then(
            ({ data }) => {
                console.log(`SERVER: ---${selectedTasks.length} Task${selectedTasks.length>1?'s':''} updated---`, data);
                this.setState({ loading: false });
            },
            // If the changes fail on the server, revert the local tasks to their original state
            rejected => {
                this.setState({
                    USER: USER.set('tasks', TASKS),
                    loading: false
                });
                console.log('Failed to update tasks: ', rejected);
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

                if(typeof callback === 'function') callback();
            },
            rejected => {
                this.setState({ loading: false });
                console.log('Failed to delete task(s): ', rejected);
                alert("An error has occured. Check console for details.");
            }
        );
    }

}

ReactDOM.render(<LifeApp/>, document.querySelector("App"));
