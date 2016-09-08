import React from 'react';
import ReactDOM from 'react-dom';
import SERVER from 'axios';
import moment from 'moment';

import CalHeader from './ui/calHeader';
import ListHeader from './ui/listHeader';
import HourDivider from './components/HourDivider';
import { Span } from './ui/ui';

import Agenda from './views/agenda';
import Day from './views/day';
import Week from './views/week';
import Month from './views/month';
import List from './views/list';

import { buildMap, filterTasks } from './components/tools';

const DEFAULT_QUERY = {
    exclude: 0,
    require: [],
    include: ['active']
}


export default class LifeApp extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            authenticated: false,
            user: {},
            tasks: [],
            dates: [],
            tMap: {},
            dMap: {},
            selectedTasks: [],
            HEADER: '',
            BODY: 'SPLASH',
            priorBODY: 'AGENDA',
            date: moment().startOf('day'),
            showOptionPane: false,
            query: DEFAULT_QUERY
        };

        this.updateView = this.updateView.bind(this);
        this.updateDate = this.updateDate.bind(this);
        this.updateQuery = this.updateQuery.bind(this);
        this.getPrior = this.getPrior.bind(this);
        this.getToday = this.getToday.bind(this);
        this.getNext = this.getNext.bind(this);
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
                    tMap: (incoming.data.tasks) ? buildMap(incoming.data.tasks) : {},
                    dates: incoming.data.agenda,
                    dMap: (incoming.data.agenda) ? buildMap(incoming.data.agenda) : {},
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
        const { HEADER, BODY, priorView, date, selectedTasks } = this.state;

        switch(HEADER) {
            case 'CALENDAR': return (
                <CalHeader
                    month={date.format('MMMM')}
                    view={BODY}
                    toggleOptionPane={this.toggleOptionPane}
                    updateView={this.updateView}
                    getPrior={this.getPrior}
                    getToday={this.getToday}
                    getNext={this.getNext}
                />
            );
            case 'LIST': return (
                <ListHeader
                    priorBODY={this.state.priorBODY}
                    updateView={this.updateView}
                    selectedTasks={selectedTasks}
                    updateQuery={this.updateQuery}
                />
            );
            default: return null;
        }
    }

    getBody() {
        const { BODY, date, dates, dMap, tasks, tMap, query } = this.state;
        let body, dayWeekBackground;

        const taskData = { dates, dMap, tasks, tMap };

        switch(BODY) {
            case 'SPLASH':
                body = <main id="view_container"><h1>SPLASH</h1></main>;
            break;

            case 'LIST':
                body = <main id="view_container"><List taskList={filterTasks(tasks, query)} /></main>;
            break;

            case 'DAY':
            case 'WEEK':
                const dateValues = {
                    date: date.valueOf(),
                    prior: date.isBefore(moment(), 'day'),
                    current: date.isSame(moment(), 'day')
                }
                dayWeekBackground = (
                    <HourDivider
                            updateDate={this.updateDate}
                            {...dateValues}
                    />
                );
            case 'MONTH':
            case 'AGENDA':
                body = (
                    <main id="view_container">

                        <div className="view" style={(BODY !== "AGENDA") ? {display: "none"} : null}>
                            <Agenda hidden={BODY !== "AGENDA"}
                                    updateDate={this.updateDate}
                                    date={date.valueOf()}
                                    {...taskData}
                            />
                        </div>

                        <div className="view" style={(BODY !== "DAY") ? {display: "none"} : null}>
                            <Day hidden={BODY !== "DAY"}
                                    updateDate={this.updateDate}
                                    {...dateValues}
                                    {...taskData}
                            />
                        </div>

                        <div className="view" style={(BODY !== "WEEK") ? {display: "none"} : null}>
                            <Week hidden={BODY !== "WEEK"}
                                    updateDate={this.updateDate}
                                    date={date.valueOf()}
                                    {...taskData}
                            />
                        </div>
                        {dayWeekBackground}

                        <div className="view" style={(BODY !== "MONTH") ? {display: "none"} : {height: "100%"}}>
                            <Month hidden={BODY !== "MONTH"}
                                    updateDate={this.updateDate}
                                    date={date.valueOf()}
                                    {...taskData}
                            />
                        </div>

                    </main>
                );
            break;

            default:
                body = <main id="view_container"><h1>Hello World!!</h1></main>;
        }

        return body;
    }

    updateView(body, header) {
        if(header) this.setState({HEADER: header, BODY: body, priorBODY: this.state.BODY});
        else this.setState({BODY: body});
    }
    updateDate(newDate) { this.setState( {date: moment(newDate).startOf('day')} ); }
    updateQuery(newQuery) { this.setState( {query: newQuery} ) };
    getPrior() { this.setState( {date: this.state.date.clone().subtract(1, this.state.BODY)} ); }
    getToday() { this.setState( {date: moment().startOf('day')} ); }
    getNext() { this.setState( {date: this.state.date.clone().add(1, this.state.BODY)} ); }
    toggleOptionPane() { this.setState({showOptionPane: !this.state.showOptionPane}); }
}

ReactDOM.render(<LifeApp/>, document.querySelector("App"));
