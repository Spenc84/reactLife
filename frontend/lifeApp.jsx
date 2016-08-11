import React from 'react';
import ReactDOM from 'react-dom';
import SERVER from 'axios';
import moment from 'moment';

import CalHeader from './components/calHeader';
import listHeader from './components/listHeader';
import Splash from './splash/splash';
import List from './list/list';
import Calendar from './calendar/calendar';


export default class LifeApp extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            authenticated: false,
            user: {},
            tasks: [],
            agenda: [],
            map: {},
            HEAD: '',
            BODY: 'SPLASH',
            date: moment(),
            optionPane: false, // Cal only
        };

        this.toggleOptionPane = this.toggleOptionPane.bind(this);
    }

    componentDidMount() {
        this.serverRequest = SERVER.get("/api/user/575350c7b8833bf5125225a5").then(  // TEMP
            incoming => {
                console.log("incoming", incoming);
                this.setState({
                    authenticated: true,
                    user: incoming.data,
                    tasks: incoming.data.tasks,
                    agenda: incoming.data.agenda,
                    // map: (incoming.data.tasks) ? this.buildMap(incoming.data.tasks) : {},
                    HEAD: 'CALENDAR',
                    BODY: 'CALENDAR'
                })
                console.log(`User Authenticated: `, this.state.user);
                // notifyChange();
            },
            rejected => {
                alert("Failed to aquire user");
            }
        );
    }

	render() {
        const header = this.getHeader();
        const body = this.getBody();

        return (
            <div className="app container">
                {header}
                {body}
            </div>
        );
	}

    getHeader() {
        const { HEAD, date } = this.state;

        switch(HEAD) {
            case 'CALENDAR': return (
                <CalHeader
                    month={date.format('MMMM')}
                    toggleOptionPane={this.toggleOptionPane}

                />
            );
            case 'LIST': return (
                <ListHeader />
            );
            default: return null;
        }
    }

    getBody() {
        const { HEAD } = this.state;

        switch(HEAD) {
            case 'SPLASH':
                return <Splash />;
            case 'LIST':
                return <List />;
            case 'CALENDAR':
                return <Calendar />;
            default:
                return (
                    <div>
                        <h1>Hello World</h1>
                    </div>
                );
        }
    }

    toggleOptionPane() { setState({optionPane: !this.state.optionPane}); }
}

ReactDOM.render(<LifeApp/>, document.querySelector("App"));
