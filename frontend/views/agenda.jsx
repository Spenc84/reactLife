import React from 'react';
import moment from 'moment';

export default class Agenda extends React.Component {
    shouldComponentUpdate(nextProps) { return !nextProps.hidden; }
    render() {
        const { hidden, dates, dMap, tasks, tMap } = this.props;
        let date = moment(this.props.date);

        const today = moment().startOf('day').valueOf();
        let taskList = [];
        let foundToday = false;
        dates.forEach(x=> {
            if (x === today) foundToday = true;
            if(x.start.length) {
                taskList.push(
                    <div key={x._id} id={x._id} className="day">
                        <div className="date">
                            <div>{ moment(x._id).format("ddd") }</div>
                            <div>{ moment(x._id).date() }</div>
                        </div>
                        {x.start.map(task=><div key={task} className="task">{tasks[tMap[task]].name}</div>)}
                    </div>
                );
            }
        });
        if(!foundToday) taskList.push(<div key={today} id={today} className="day" />);
        taskList.sort((a,b)=>a.key-b.key);

        console.log('RENDERED:  --- AGENDA VIEW ---'); // __DEV__
        return (
            <div className="Agenda view">
                {taskList}
            </div>
        );
    }
}
