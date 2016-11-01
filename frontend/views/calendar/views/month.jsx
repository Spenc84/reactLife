import React from 'react';
import moment from 'moment';
import { Map, List, fromJS } from 'immutable';

import { Column, Row } from '../../../uiComponents/ui';

// Build the weekdays title row
const WEEKDAY_TITLES = moment.weekdaysShort().map((x)=><span key={x} className="weekday title">{x}</span>);

export default class Month extends React.Component {
    shouldComponentUpdate(nextProps) { return nextProps.active; }
    render() {
        const { activeDate, updateDate, agenda, dIndx, tasks, tIndx } = this.props;
        let day = moment(activeDate).startOf('month');

        // Calculate the number of Weeks needed to build the month
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
                if(day.isSame(activeDate, 'day')) {
                    dayClasses = "active " + dayClasses;
                    currentDay = true;
                    currentWeek = true;
                }

                // Build the task list for this particular day
                const unix = day.valueOf();
                const taskList = (dIndx[unix] || dIndx[unix] === 0)
                    ? agenda.get(dIndx[unix]).get("start").map(
                        (ID,indx) => {
                            const task = tasks.get(tIndx[ID]);
                            return (
                                <span key={`task_${indx}`}
                                    className="task"
                                    style={{ backgroundColor: task.get("color") }}
                                    onClick={null} />
                            );
                        }
                    )
                    : null;

                week.push(
                    <div key={`${w}_day_${d}`} className={dayClasses} onClick={updateDate.bind(null, day.valueOf())}>
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
            <div className="Month view">
                <div className="weekday title row">
                    {WEEKDAY_TITLES}
                </div>
                <Column className="month" check={activeDate}>
                    {month}
                </Column>

            </div>
        );
    }
}
