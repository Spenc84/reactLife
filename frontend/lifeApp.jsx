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

        this.updateTasks = this.updateTasks.bind(this);
        this.buildTask = this.buildTask.bind(this);
    }

    componentDidMount() {
        this.serverRequest = SERVER.get("/api/user/575350c7b8833bf5125225a5").then(  // TEMP
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

	render() {
        const { USER } = this.state;

        return (
            <Main
                tasks={ USER.get("tasks") || List()}
                agenda={ USER.get("agenda") || List()}
                api={{
                    updateTasks: this.updateTasks,
                    buildTask: this.buildTask
                }}
                {...this.state}
            />
        );
	}

    getUser() {
        SERVER.get("/api/user/575350c7b8833bf5125225a5").then(  // TEMP
            incoming => {
                console.log("incoming", incoming);
                const { data:user, data:{ tasks, agenda } } = incoming;
                this.setState({
                    authenticated: true,
                    USER: fromJS(user),
                    tIndx: (tasks) ? Index(tasks) : {},
                    dIndx: (agenda) ? Index(agenda) : {},
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
            ({data:createdTask}) => {
                console.log("SERVER: ---Task Created---", createdTask);
                const taskList = USER.get('tasks').push(fromJS(createdTask));
                this.setState({
                    USER: USER.set('tasks', taskList),
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

        if( tab === 'ACTIVE' ) {
            status = Map({
                active: true,
                scheduled: true,
                inactive: false
            });
            schedule = schedule.set('startTime', now.toJSON());
        }
        if( tab === 'PENDING' ) {
            status = Map({
                pending: true,
                scheduled: true,
                inactive: false
            });
            schedule = schedule.set('startTime', moment(now).add(1, 'day').toJSON());
        }

        const newTask = Map({
            title,
            color: TASK_COLOR,
            description: "",
            users: List([
                Map({
                    access: 30,
                    user: userID
                })
            ]),
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

    updateAgenda() {
        const { USER, dIndex } = this.state;


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

    refreshTaskData() {
        const { USER, loading } = this.state;
        const userID = USER.get('_id');
        if(!loading) this.setState({ loading: true });

        SERVER.get(`/api/user/${userID}/tasks`).then(
            ({data:taskList}) => {
                console.log("SERVER: ---Incoming TaskList---", taskList);
                this.setState({
                    USER: USER.set('tasks', fromJS(taskList)),
                    tIndx: Index(taskList),
                    loading: false
                });
            },
            rejected => {
                this.setState({ loading: false });
                console.log('Failed to refresh Task data: ', rejected);
                alert("An error has occured. Check console for details.");
            }
        );
    }
}

ReactDOM.render(<LifeApp/>, document.querySelector("App"));
