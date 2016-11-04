import React from 'react';
import moment from 'moment';
import { Map, List, fromJS } from 'immutable';


export default class Day extends React.Component {
    shouldComponentUpdate(nextProps) { return nextProps.active; }
    render() {
        const { activeDate:unix, prior, current, agenda, tasks, tIndx } = this.props;
        const activeDate = moment(unix);
        const schedule = agenda.get(`${unix}`);

        // Style each day as inactive, active, or otherwise
        const dateClasses = (prior) ? 'inactive date'
                        : (current) ? 'active date'
                        : 'date';

        const taskList = (schedule)
            ? schedule.get("scheduled").map(
                (taskRef,indx) => {
                    const ID = taskRef.get('taskID');
                    const scheduledTime = moment(taskRef.get('time'));
                    const task = tasks.get(tIndx[ID]);
                    const top = scheduledTime.hour() * 60 + scheduledTime.minute();
                    return (
                        <div key={`task_${indx}`}
                            className="task"
                            style={{
                                top,
                                backgroundColor: task.get("color"),
                                height: task.get("schedule").get("duration")
                            }}>
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
