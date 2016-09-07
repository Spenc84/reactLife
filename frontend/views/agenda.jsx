import React from 'react';
import moment from 'moment';

export default class Agenda extends React.Component {
    shouldComponentUpdate(nextProps) { return !nextProps.hidden; }
    componentDidUpdate() { this.refs[this.props.date].scrollIntoView(); }
    componentDidMount() { this.refs[this.props.date].scrollIntoView(); }
    render() {
        const { hidden, dates, dMap, tasks, tMap, updateDate } = this.props;
        const date = moment(this.props.date).startOf('day').valueOf();
        const today = moment().startOf('day').valueOf();

        let check = {};
        let taskList = [];
        // let foundDate = false;
        dates.forEach(x=> {
            if(x.start.length) {
                // if (x._id === date) foundDate = true;
                const currentYear = moment().isSame(x._id, 'year');
                const m = moment(x._id).startOf('month').valueOf();
                if(!check[m]) {
                    taskList.push(<div key={m-1} className="month">{moment(m).format((currentYear)?'MMMM':'MMM YYYY')}</div>);
                    check[m] = true;
                }
                let dateClasses = (x._id < today) ? "prior date"
                                    : (x._id === today) ? "current date"
                                    : "date";
                if(x._id === date) dateClasses = "active " + dateClasses;
                taskList.push(
                    <div key={x._id} className="day">
                        <div className={dateClasses} onClick={updateDate.bind(null, x._id)}>
                            <div>{ moment(x._id).format("ddd") }</div>
                            <div>{ moment(x._id).date() }</div>
                        </div>
                        <div className="tasks">
                            {x.start.map(task=>(
                                <div key={task}
                                    className="task"
                                    style={{backgroundColor: tasks[tMap[task]].color}}>
                                    {tasks[tMap[task]].name}
                                </div>
                            ))}
                        </div>
                    </div>
                );
            }
        });
        taskList.push(<div key={date-1} ref={date} />);
        taskList.sort((a,b)=>a.key-b.key);

        console.log('RENDERED:  --- AGENDA VIEW ---'); // __DEV__
        return (
            <div className="Agenda view">
                {taskList}
            </div>
        );
    }
}
