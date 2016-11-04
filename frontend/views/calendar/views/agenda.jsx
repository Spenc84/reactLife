import React from 'react';
import moment from 'moment';
import { Map, List, fromJS } from 'immutable';

export default class Agenda extends React.Component {
    shouldComponentUpdate(nextProps) { return nextProps.active; }
    componentDidUpdate() { this.refs[this.props.activeDate].scrollIntoView(); }
    componentDidMount() { this.refs[this.props.activeDate].scrollIntoView(); }
    render() {
        const { activeDate:DATE, agenda, tasks, tIndx, updateDate } = this.props;
        const activeDate = moment(DATE).startOf('day').valueOf();
        const today = moment().startOf('day').valueOf();

        let check = {};
        let taskList = [];

        if(agenda === undefined) return (
            <div className="Agenda view">
                <span ref={activeDate}>- No task data found -</span>
            </div>
        );

        agenda.forEach(x => {
            const date = moment(x.get("date")).valueOf();
            const schedule = x.get("scheduled");

            if(schedule.size) {
                const currentYear = moment().isSame(date, 'year');
                const m = moment(date).startOf('month').valueOf();
                if(!check[m]) {
                    taskList.push(<div key={m-1} className="month">{moment(m).format((currentYear)?'MMMM':'MMM YYYY')}</div>);
                    check[m] = true;
                }
                let dateClasses = (date < today) ? "prior date"
                                    : (date === today) ? "current date"
                                    : "date";
                if(date === activeDate) dateClasses = "active " + dateClasses;
                taskList.push(
                    <div key={date} className="day">
                        <div className={dateClasses} onClick={updateDate.bind(null, date)}>
                            <div>{ moment(date).format("ddd") }</div>
                            <div>{ moment(date).date() }</div>
                        </div>
                        <div className="tasks">
                            {schedule.map(task => {
                                const taskID = task.get('taskID');
                                return (
                                    <div key={taskID}
                                        className="task"
                                        style={{backgroundColor: tasks.get(tIndx[taskID]).get("color")}}>
                                        {tasks.get(tIndx[taskID]).get("title")}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );
            }
        });
        taskList.push(<div key={activeDate-1} ref={activeDate} />);
        taskList.sort((a,b)=>a.key-b.key);

        console.log('RENDERED:  --- AGENDA VIEW ---'); // __DEV__
        return (
            <div className="Agenda view">
                {taskList}
            </div>
        );
    }
}
