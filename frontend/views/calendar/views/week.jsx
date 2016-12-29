import React from 'react';
import moment from 'moment';
import { Map, List, fromJS } from 'immutable';

export default class Week extends React.Component {
    shouldComponentUpdate(nextProps) { return nextProps.active; }
    render() {
        const { activeDate:unix, updateDate, agenda, tasks, tIndx, userID, openTaskDetails } = this.props;
        let activeDate = moment(unix);

        // Style the weekday names of prior weeks as prior
        const dateBarClasses = ( activeDate.isBefore(moment(), 'week') )
                ? 'prior dateBar'
                : 'dateBar';

        // Build weekday title row and events row
        const weekIsCurrent = activeDate.isSame(moment(), 'week');
        const activeWeekday = activeDate.day();
        let foundCurrent = false;
        let dateBar = [];
        let weekEvents = [];
        let weekday = moment(activeDate).startOf('week');
        for(let i = 0; i < 7; i++) {
            const unix = weekday.valueOf();
            const schedule = agenda.get(`${unix}`);

            // Style the weekday names of the current week as inactive, active, or otherwise
            let dateClasses = 'date';
            if(weekIsCurrent && !foundCurrent) {
                if(weekday.isBefore(moment(), 'day')) dateClasses = 'prior date';
                else {
                    dateClasses = 'current date';
                    foundCurrent = true;
                }
            }
            if(i === activeWeekday) dateClasses = 'active date';
            // Push the new elements to their respective arrays and increment date
            dateBar.push((
                <div key={`weekday${i}_Name`} className={dateClasses} onClick={updateDate.bind(null, unix)}>
                    <div>{ weekday.format("ddd") }</div>
                    <div>{ weekday.date() }</div>
                </div>
            ));

            // Build the task list for this particular day
            const taskList = (schedule)
                ? schedule.get("scheduled").map(
                    (taskID, indx) => {
                        const task = tasks.get(tIndx[taskID]);
                        const scheduledTime = moment(task.getIn(['users', userID, 'scheduled']));
                        const top = scheduledTime.hour() * 60 + scheduledTime.minute();
                        return (
                            <div key={`task_${indx}`}
                                className="task"
                                style={{
                                    top,
                                    backgroundColor: task.get("color"),
                                    height: task.get("schedule").get("duration")
                                }}
                                onClick={openTaskDetails.bind(null, task)}>
                                {task.get("title")}
                            </div>
                        );
                    }
                )
                : null;

            weekEvents.push((
                <div key={`weekday${i}_Events`} className="eventColumn">
                    {taskList}
                </div>
            ));

            weekday.add(1, 'day');
        }

        console.log('RENDERED:  --- WEEK VIEW ---'); // __DEV__
        return (
            <div className="Week view">
                <div className={dateBarClasses}>
                    {dateBar}
                </div>
                <div className="weekEvents">
                    {weekEvents}
                </div>

            </div>
        );
    }
}
