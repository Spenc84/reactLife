import React from 'react';
import moment from 'moment';
import { Map, List, fromJS } from 'immutable';


export default class Day extends React.Component {
    shouldComponentUpdate(nextProps) { return nextProps.active; }
    render() {
        const { activeDate:unix, prior, current, schedule:Schedule, tasks, tIndx, userID, openTaskDetails } = this.props;
        const activeDate = moment(unix);
        const schedule = Schedule.get(`${unix}`);

        // Style each day as inactive, active, or otherwise
        const dateClasses = (prior) ? 'inactive date'
                        : (current) ? 'active date'
                        : 'date';

        const taskList = (schedule)
            ? schedule.get("scheduled").map(
                (taskID, indx) => {
                    const task = tasks.get(tIndx[taskID]);
                    const scheduledTime = moment(task.getIn(['schedule', 'scheduledTime']));
                    const top = scheduledTime.hour() * 60 + scheduledTime.minute();
                    return (
                        <div key={`task_${indx}`}
                            className="task"
                            style={{
                                top,
                                backgroundColor: task.get("color"),
                                height: task.get("schedule").get("duration")
                            }}
                            onClick={openTaskDetails.bind(null, {task})}>
                            {task.get("title")}
                        </div>
                    );
                }
            )
            : null;

        console.log('RENDERED:  --- DAY VIEW ---'); // __DEV__
        return (
            <div className="Day view">
                <div className={dateClasses}>
                    <div>{ activeDate.format("ddd") }</div>
                    <div>{ activeDate.date() }</div>
                </div>
                <div className="eventColumn">
                    {taskList}
                </div>
            </div>
        );
    }
}
