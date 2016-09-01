import React from 'react';
import moment from 'moment';

import { Column, Row } from '../ui/ui';

// Build the weekdays title row
const weekdayTitles = moment.weekdaysShort().map((x)=><span key={x} className="weekday title">{x}</span>);

export default class Month extends React.Component {
    shouldComponentUpdate(nextProps) { return !nextProps.hidden; }
    render() {
        const { hidden, updateDate, date, dates, dMap, tasks, tMap } = this.props;
        let day = moment(date).startOf('month');

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
        for (let w = 0; w < numOfWeeks; w++) {
            //////  BUILD WEEK  //////
            let week = [];
            let currentWeek = false;
            for (let d = 0; d < 7; d++) {
                ////// BUILD DAY //////
                let currentDay = false;
                let dayClasses = (day.month() === currentMonth) ? "day Column" : "faded day Column";
                if(day.isSame(moment(date), 'day')) {
                    dayClasses = "active " + dayClasses;
                    currentDay = true;
                    currentWeek = true;
                }

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
                    <div key={`${w}_day_${d}`} className={dayClasses} onClick={updateDate.bind(null, day.clone())}>
                        <span className="date">{day.date()}</span>
                        {taskList}
                    </div>
                );
                day.add(1, 'day');
                // END OF DAY -
            }
            month.push(<div key={`week_${w}`} className="week Row">{week}</div>);
            // END OF WEEK --
        }
        // END OF MONTH ---


        console.log('RENDERED:  --- MONTH VIEW ---'); // __DEV__
        return (
            <div className={monthClasses}>
                <div className="weekday title row">
                    {weekdayTitles}
                </div>
                <Column className="month" check={date}>
                    {month}
                </Column>

            </div>
        );
    }
}
