import React from 'react';
import moment from 'moment';

import CalHeader from './uiComponents/calHeader';
import HourDivider from './uiComponents/HourDivider';
import Agenda from './views/agenda';
import Day from './views/day';
import Week from './views/week';
import Month from './views/month';

export default class CalendarSection extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            activeView: 'AGENDA',
            date: moment().startOf('day'),
            showOptionPane: false,
        };

        this.changeView = this.changeView.bind(this);
        this.updateDate = this.updateDate.bind(this);
        this.getPrior = this.getPrior.bind(this);
        this.getToday = this.getToday.bind(this);
        this.getNext = this.getNext.bind(this);
        this.toggleOptionPane = this.toggleOptionPane.bind(this);
    }

    shouldComponentUpdate(nextProps, nextState) {
        return nextProps.active;
    }

    render() {
        const { activeView, date, showOptionPane } = this.state;
        const { changeSection } = this.props;

        return (
            <div className="CalendarSection">

                <CalHeader
                    month={date.format('MMMM')}
                    activeView={activeView}
                    toggleOptionPane={this.toggleOptionPane}
                    changeView={this.changeView}
                    changeSection={changeSection}
                    getPrior={this.getPrior}
                    getToday={this.getToday}
                    getNext={this.getNext}
                />

                {this.buildBody()}

            </div>
        );
    }

    buildBody() {
        const { activeView, date } = this.state;
        const { USER, agenda, tasks, tIndx, openTaskDetails } = this.props;
        const userID = USER.get('_id');

        let body;

        const dateValues = {
            activeDate: date.valueOf(),
            prior: date.isBefore(moment(), 'day'),
            current: date.isSame(moment(), 'day')
        }

        const taskData = { userID, agenda, tasks, tIndx, openTaskDetails };

        const dayWeekBackground = (activeView === "DAY" || activeView === "WEEK")
                ?   <HourDivider
                        updateDate={this.updateDate}
                        {...dateValues}
                    />
                :   null;

        return (
            <div id="calendar_body">

                <div className="view" style={(activeView !== "AGENDA") ? {display: "none"} : null}>
                    <Agenda active={activeView === "AGENDA"}
                            updateDate={this.updateDate}
                            activeDate={date.valueOf()}
                            {...taskData}
                    />
                </div>

                <div className="view" style={(activeView !== "DAY") ? {display: "none"} : null}>
                    <Day active={activeView === "DAY"}
                            updateDate={this.updateDate}
                            {...dateValues}
                            {...taskData}
                    />
                </div>

                <div className="view" style={(activeView !== "WEEK") ? {display: "none"} : null}>
                    <Week active={activeView === "WEEK"}
                            updateDate={this.updateDate}
                            activeDate={date.valueOf()}
                            {...taskData}
                    />
                </div>

                {dayWeekBackground}

                <div className="view" style={(activeView !== "MONTH") ? {display: "none"} : {height: "100%"}}>
                    <Month active={activeView === "MONTH"}
                            updateDate={this.updateDate}
                            activeDate={date.valueOf()}
                            {...taskData}
                    />
                </div>

            </div>
        );
    }

    changeView(activeView) {
        this.setState({ activeView });
    }
    updateDate(newDate) { this.setState( {date: moment(newDate).startOf('day')} ); }
    getPrior() { this.setState( {date: this.state.date.clone().subtract(1, this.state.activeView)} ); }
    getToday() { this.setState( {date: moment().startOf('day')} ); }
    getNext() { this.setState( {date: this.state.date.clone().add(1, this.state.activeView)} ); }
    toggleOptionPane() { this.setState({showOptionPane: !this.state.showOptionPane}); }
}
