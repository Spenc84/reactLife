import React from 'react';
import moment from 'moment';
import { Div } from '../ui/ui';

export default class Day extends React.Component {
    render() {
        const { hidden, updateDate, dates, dMap, tasks, tMap } = this.props;
        let date = moment(this.props.date);

        // Hide this view if inactive
        const weekClasses = (hidden) ? "hidden Week view" : "Week view";

        // Style the weekday names of prior weeks as prior
        const dateBarClasses = ( date.isBefore(moment(), 'week') )
                ? 'prior dateBar'
                : 'dateBar';


        // Build weekday title row and events row
        const currentWeek = date.isSame(moment(), 'week');
        const activeDay = date.day();
        let foundCurrent = false;
        let dateBar = [];
        let weekEvents = [];
        date.startOf('week');
        for(let i = 0; i < 7; i++) {
            // Style the weekday names of the current week as inactive, active, or otherwise
            let dateClasses = 'date';
            if(currentWeek && !foundCurrent) {
                if(date.isBefore(moment(), 'day')) dateClasses = 'prior date';
                else {
                    dateClasses = 'current date';
                    foundCurrent = true;
                }
            }
            if(activeDay === i) dateClasses = 'active date';
            // Push the new elements to their respective arrays and increment date
            dateBar.push((
                <div key={`weekday${i}_Name`} className={dateClasses} onClick={updateDate.bind(null, date.clone())}>
                    <div>{ date.format("ddd") }</div>
                    <div>{ date.date() }</div>
                </div>
            ));

            let taskList = (dMap[date.valueOf()])
                ? dates[dMap[date.valueOf()]].start.map(
                    x=> {
                        let task = tasks[tMap[x]];
                        return (
                            <div style={{backgroundColor: task.color}}>{task.name}</div>
                        );
                    }
                )
                : null;

            weekEvents.push((
                <div key={`weekday${i}_Events`} className="eventColumn">
                    {taskList}
                </div>
            ));

            date.add(1, 'day');
        }

        console.log('RENDERED:  --- WEEK VIEW ---'); // __DEV__
        return (
            <div className={weekClasses}>
                <div className={dateBarClasses}>
                    {dateBar}
                </div>
                {/* <Div style={{paddingTop: '60px'}} static></Div> */}
                <div className="weekEvents">
                    {weekEvents}
                </div>

            </div>
        );
    }
}
