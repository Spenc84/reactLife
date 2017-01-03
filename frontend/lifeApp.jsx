import React from 'react';
import ReactDOM from 'react-dom';
import SERVER from 'axios';
import moment from 'moment';
import { Map, List, fromJS } from 'immutable';
import { Index } from './components/tools';

import Main from './main';

// DEFAULTS
const TASK_COLOR = '#0078ff';
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
        this.saveTask = this.saveTask.bind(this);
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
                schedule={ USER.get("agenda") || List()}
                api={{
                    buildTask: this.buildTask,
                    saveTask: this.saveTask,
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

        const status = Map({
            scheduled: tab === 'ACTIVE' || tab === 'PENDING',
            active: tab === 'ACTIVE',
            pending: tab === 'PENDING',
            inactive: !(tab === 'ACTIVE' || tab === 'PENDING')
        });

        const newTask = Map({
            title,
            color: TASK_COLOR,
            description: "",
            users: Map({
                [userID]: {
                    securityAccess: 30,
                    scheduled: ''
                }
            }),
            schedule,
            status
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

    saveTask(task, callBack) {
        const { USER } = this.state;
        const userID = USER.get('_id');
        const taskID = task.get('_id');

        const index = USER.get("tasks").findIndex(task=>task.get("_id") === taskID)
        const TASK = USER.getIn(['tasks', index]);

        let update = {};
        let log = [];
        let scheduleUpdated = false;

        if(TASK.get("title") !== task.get("title")) {
            update.title = task.get("title");
            log.push(` - Changed task's title from '${TASK.get("title")}' to '${task.get("title")}'`);
        }
        if(TASK.get("description") !== task.get("description")) {
            update.description = task.get("description");
            log.push(` - Changed task's description from '${TASK.get("description")}' to '${task.get("description")}'`);
        }
        if(TASK.get("color") !== task.get("color")) {
            update.color = task.get("color");
            log.push(` - Changed task's color from '${TASK.get("color")}' to '${task.get("color")}'`);
        }
        if(TASK.get("schedule") !== task.get("schedule")) {
            update.schedule = task.get("schedule");
            scheduleUpdated = true;

            const oldDuration = TASK.getIn(["schedule", "duration"]);
            const newDuration = task.getIn(["schedule", "duration"]);
            if(oldDuration !== newDuration) {
                const oldDurationDisplay
                    =   (oldDuration === 0) ? 'None'
                    :   (oldDuration < 60) ? `${oldDuration} Minutes`
                    :   (oldDuration === 60) ? '1 Hour'
                    :   `${oldDuration / 60} Hours`;
                const newDurationDisplay
                    =   (newDuration === 0) ? 'None'
                    :   (newDuration < 60) ? `${newDuration} Minutes`
                    :   (newDuration === 60) ? '1 Hour'
                    :   `${newDuration / 60} Hours`;
                log.push(` - Changed task's duration from '${oldDurationDisplay}' to '${newDurationDisplay}'`);
            }

            const oldStartTime = TASK.getIn(["schedule", "startTime"]);
            const newStartTime = task.getIn(["schedule", "startTime"]);
            if(oldStartTime !== newStartTime) {
                log.push(` - Changed task's start time from '${moment(oldStartTime).toString()}' to '${moment(newStartTime).toString()}'`);
            }

            const oldSoftDeadline = TASK.getIn(["schedule", "softDeadline"]);
            const newSoftDeadline = task.getIn(["schedule", "softDeadline"]);
            if(oldSoftDeadline !== newSoftDeadline) {
                log.push(` - Changed task's soft deadline from '${moment(oldSoftDeadline).toString()}' to '${moment(newSoftDeadline).toString()}'`);
            }

            const oldHardDeadline = TASK.getIn(["schedule", "hardDeadline"]);
            const newHardDeadline = task.getIn(["schedule", "hardDeadline"]);
            if(oldHardDeadline !== newHardDeadline) {
                log.push(` - Changed task's hard deadline from '${moment(oldHardDeadline).toString()}' to '${moment(newHardDeadline).toString()}'`);
            }
        }

        if(log.length === 0) return;
        log = log.join('/n');


        this.setState({
            USER: USER.setIn(['tasks', index], task),
            loading: true
        });

        const uploadData = {
            update,
            log,
            userID,
            scheduleUpdated
        }

        SERVER.put(`/api/task/${taskID}`, uploadData).then(
            ({data}) => {
                const task = data.data;
                console.log(`SERVER: ---Task '${task.get('title')}' updated---`, data);

                this.setState({
                    USER: USER.setIn(['tasks', index], task),
                    loading: false
                });

                if(typeof callBack === 'function') callBack();
            },
            rejected => {
                console.log('Failed to save task: ', rejected);
                this.setState({
                    USER: USER.setIn(['tasks', index], TASK),
                    loading: false
                });
                alert("An error has occured. Check console for details.");
            }
        );
    }

    updateTasks(selectedTasks, operation, callBack) {
        if(!List.isList(selectedTasks) || typeof operation !== 'object') return;
        const { USER } = this.state;
        const TASKS = USER.get('tasks');

        let tasks = TASKS;
        selectedTasks.forEach(taskID => {
            const index = TASKS.findIndex(task => task.get('_id') === taskID);
            if(index === -1) console.log(`Unable to find taskID '${taskID}' in TASKS`);
            else {
                for(let key in operation['$set']) {
                    tasks = tasks.setIn([index].concat(key.split('.')), operation['$set'][key]);
                }
                tasks = tasks.setIn([index, 'changeLog'], tasks.getIn([index, 'changeLog']).push(operation['$push']['changeLog']));
            }
        });

        this.setState({
            USER: USER.set('tasks', tasks),
            loading: true
        });

        SERVER.put("/api/tasks", { TYPE: "MODIFY_TASKS", selectedTasks: selectedTasks.toJS(), operation }).then(
            ({ data }) => {
                console.log(`SERVER: ---${selectedTasks.size} Task${selectedTasks.size>1?'s':''} updated---`, data);
                this.setState({ loading: false });
                if(typeof callBack === 'function') callBack();
            },
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

    scheduleTasks(selectedTasks, schedule, callBack) {
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
            approved => {
                console.log(`SERVER: ---${selectedTasks.length} Task${selectedTasks.length>1?'s':''} scheduled---`, approved.data);
                const updatedUser = approved.data.data;

                this.setState({
                    USER: fromJS(updatedUser),
                    tIndx: Index(updatedUser.tasks),
                    loading: false
                });

                if(typeof callBack === 'function') callBack();
            },
            rejected => {
                this.setState({ loading: false });
                console.log('Failed to schedule task(s): ', rejected);
                alert("An error has occured. Check console for details.");
            }
        );
    }

    deleteTasks(selectedTasks, callBack) {
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

                if(typeof callBack === 'function') callBack();
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
