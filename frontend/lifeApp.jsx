import React from 'react';
import ReactDOM from 'react-dom';
import SERVER from 'axios';
import moment from 'moment';
import { Map, List, fromJS } from 'immutable';
import { Index } from './components/tools';

import Main from './main';



export default class LifeApp extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            authenticated: false,
            USER: Map(),
            tIndx: {},
            dIndx: {},
            loading: true
        };

        this.updateTasks = this.updateTasks.bind(this);
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

	render() {
        const { USER } = this.state;

        return (
            <Main
                tasks={ USER.get("tasks") || List()}
                agenda={ USER.get("agenda") || List()}
                api={{
                    this.updateTasks
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

    updateTask(selectedTasks, desiredChanges) {
        this.setState({ loading: true });
        selectedTasks = selectedTasks.toJS();
        SERVER.put("/api/tasks", {selectedTasks, desiredChanges}).then(
            incoming => {
                this.setState({ loading: false });
                console.log("incoming", incoming);
                this.getUser()
                return true;
            },
            rejected => {
                this.setState({ loading: false });
                console.log('Failed to process change: ', rejected);
                alert("An error has occured. Check console for details.");
                return false;
            }
        );
    }

    updateTasks(selectedTasks, desiredChanges) {
        if(!List.isList(selectedTasks) || typeof desiredChanges !== 'object') return;
        const userID = this.state.USER.get('_id');
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
