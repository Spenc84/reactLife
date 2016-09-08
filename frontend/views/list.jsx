import React from 'react';

export default class list extends React.Component {
    render() {
        return (
            <div className="List view Column">
                {this.props.taskList.map(task=><div key={task._id} className="Row">{task.name}</div>)}
            </div>
        );
    }
}
