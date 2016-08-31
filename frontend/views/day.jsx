import React from 'react';
import moment from 'moment';

export default class Day extends React.Component {
    shouldComponentUpdate(nextProps) { return !nextProps.hidden; }
    render() {
        let { hidden, prior, current, dates, dMap, tasks, tMap } = this.props;
        const date = moment(this.props.date);

        // Hide this view if inactive
        // const dayClasses = (hidden) ? "hidden Day view" : "Day view";
        const dayClasses = "Day view";

        // Style each day as inactive, active, or otherwise
        const dateClasses = (prior) ? 'inactive date'
                        : (current) ? 'active date'
                        : 'date';

        let unix = date.valueOf();
        let taskList = (dMap[unix] || dMap[unix] === 0)
            ? dates[dMap[unix]].start.map(
                (x,i) => {
                    let task = tasks[tMap[x]];
                    return (
                        <div key={`task_${i}`}
                            className="task"
                            style={{
                                backgroundColor: task.color,
                                top: task.schedule.startTime.top-5,
                                minHeight: task.schedule.duration,
                                maxHeight: task.schedule.duration
                            }}>
                            {task.name}
                        </div>
                    );
                }
            )
            : null;

        console.log('RENDERED:  --- DAY VIEW ---'); // __DEV__
        return (
            <div className={dayClasses}>
                <div className={dateClasses}>
                    <div>{ date.format("ddd") }</div>
                    <div>{ date.date() }</div>
                </div>
                <div className="eventColumn">
                    {taskList}
                </div>
            </div>
        );
    }
}
