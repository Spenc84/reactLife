import React from 'react';
import ReactDOM from 'react-dom';
import SERVER from 'axios';
import moment from 'moment';
import { Map, List, fromJS, toJS } from 'immutable';
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
                console.log('Failed to acquire user', rejected);
                this.setState({ loading: false });
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
                {...this.state}
            />
        );
	}
}

ReactDOM.render(<LifeApp/>, document.querySelector("App"));
