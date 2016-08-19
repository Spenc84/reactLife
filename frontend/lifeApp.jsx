import React from 'react';
import ReactDOM from 'react-dom';
import SERVER from 'axios';
import moment from 'moment';

import CalHeader from './ui/calHeader';
import ListHeader from './ui/listHeader';

import Day from './views/day';
import Week from './views/week';


export default class LifeApp extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            authenticated: false,
            user: {},
            tasks: [],
            agenda: [],
            map: {},
            HEADER: '',
            BODY: 'SPLASH',
            date: moment(),
            showOptionPane: false, // Cal only
            showDropNav: false // Cal only
        };

        this.toggleOptionPane = this.toggleOptionPane.bind(this);
        this.toggleDropNav = this.toggleDropNav.bind(this);
        this.updateView = this.updateView.bind(this);
        this.updateDate = this.updateDate.bind(this);
        this.getPrior = this.getPrior.bind(this);
        this.getToday = this.getToday.bind(this);
        this.getNext = this.getNext.bind(this);
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
                    HEADER: 'CALENDAR',
                    BODY: 'AGENDA'
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
        const { HEADER, BODY, date, showDropNav } = this.state;

        switch(HEADER) {
            case 'CALENDAR': return (
                <CalHeader
                    month={date.format('MMMM')}
                    view={BODY}
                    showDropNav={showDropNav}
                    toggleOptionPane={this.toggleOptionPane}
                    toggleDropNav={this.toggleDropNav}
                    updateView={this.updateView}
                    getPrior={this.getPrior}
                    getToday={this.getToday}
                    getNext={this.getNext}
                />
            );
            case 'LIST': return (
                <ListHeader />
            );
            default: return null;
        }
    }

    getBody() {
        const { BODY, date, showDropNav } = this.state;
        let body = null;

        switch(BODY) {
            case 'SPLASH':
                body = `SPLASH`; break;
            case 'LIST':
                body = `LIST`; break;
            case 'AGENDA':
                body = `AGENDA`; break;
            case 'DAY': return (
                <Day dropNav={showDropNav}
                        date={date.valueOf()}
                        updateDate={this.updateDate}
                />
            );
            case 'WEEK': return (
                <Week dropNav={showDropNav}
                        date={date.valueOf()}
                        updateDate={this.updateDate}
                />
            );
            case 'MONTH':
                body = `MONTH`; break;
            default:
                body = `Hello World!!`; break;
        }

        return (
            <main style={{marginTop: `70px`, padding: `1rem`}}><h1>{body}</h1></main>
        );
    }

    toggleOptionPane() { this.setState({showOptionPane: !this.state.showOptionPane}); }
    toggleDropNav() { this.setState({showDropNav: !this.state.showDropNav}); }
    updateView(body, header) {
        if(header) this.setState({BODY: body, HEADER: header});
        else this.setState({BODY: body});
    }
    updateDate(newDate) { this.setState( {date: moment(newDate)} ); }
    getPrior() { this.setState( {date: this.state.date.clone().subtract(1, this.state.BODY)} ); }
    getToday() { this.setState( {date: moment()} ); }
    getNext() { this.setState( {date: this.state.date.clone().add(1, this.state.BODY)} ); }
}

ReactDOM.render(<LifeApp/>, document.querySelector("App"));
