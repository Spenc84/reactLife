import React from 'react';
import moment from 'moment';

import { Column, Row } from '../ui/ui';

// Build the weekdays title row
const weekdayTitles = moment.weekdaysShort().map(x=><span className="weekday title">{x}</span>);

export default class Month extends React.Component {
    shouldComponentUpdate(nextProps) { return !nextProps.hidden; }
    render() {
        const { hidden, updateDate, date, dates, dMap, tasks, tMap } = this.props;
        let day = moment(this.props.date).startOf('month');

        // Hide this view if inactive
        // const monthClasses = (hidden) ? "hidden Month view" : "Month view";
        const monthClasses = "Month view";

        // Calculate the number of Week needed to build the month
        const numDaysInMonth = day.daysInMonth();
        const numOfWeeks = Math.ceil((numDaysInMonth + day.day()) / 7);
        const currentMonth = day.month();

        //////   BUILD MONTH   //////
        let month = [];
        day.startOf('week');
        for (let i = 0; i < numOfWeeks; i++) {
            //////  BUILD WEEK  //////
            let week = [];
            for (let i = 0; i < 7; i++) {
                ////// BUILD DAY //////
                let dayClasses = (day.month() === currentMonth) ? "day" : "prior day";
                if(day.isSame(moment(this.props.date), 'day')) dayClasses = "active " + dayClasses;

                // Build the task list for this particular day
                let unix = day.valueOf();
                let taskList = (dMap[unix] || dMap[unix] === 0)
                    ? dates[dMap[unix]].start.map(
                        (x,i) => {
                            let task = tasks[tMap[x]];
                            return (
                                <span key={`task_${i}`}
                                    className="task"
                                    style={{ backgroundColor: task.color }}
                                    onClick={null} />
                            );
                        }
                    )
                    : null;

                week.push(
                    <Column key={`day_${day.date()}`} className={dayClasses}>
                        <span className="date">{day.date()}</span>
                        {taskList}
                    </Column>
                );
                day.add(1, 'day');
                // END OF DAY -
            }
            month.push(<Row key={`week_${i}`} className="week">{week}</Row>);
            // END OF WEEK --
        }
        // END OF MONTH ---


        console.log('RENDERED:  --- MONTH VIEW ---'); // __DEV__
        return (
            <div className={monthClasses}>
                <div className="weekday title row">
                    {weekdayTitles}
                </div>
                <Column className="month">
                    {month}
                </Column>

            </div>
        );
    }
}
