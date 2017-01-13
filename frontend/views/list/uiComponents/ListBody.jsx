import React from 'react';
import { Map, List, fromJS } from 'immutable';

import { Icon } from '../../../uiComponents/ui';


// PROPS: taskList, filter, starView, selectedTasks, selectTask, updateTitle, buildTask
export default class ListBody extends React.PureComponent {
    render() {
        const { taskList, filter, starView, selectedTasks, selectTask, updateTitle, buildTask, openTaskDetails } = this.props;

        console.log('RENDERED: --- LISTBODY ---'); // __DEV__
        return (
            <div className="List-Body">

                {taskList.map( (task, index) => {
                    const ID = task.get("_id");
                    const selected = selectedTasks.some(id=>id===ID);
                    const starred = task.get("status").get("starred");
                    const included = !filter.get(index) ? false
                            : (starView && !starred) ? false
                            : true;

                    return (
                        <TaskRow
                            key={`task_${index}`}
                            task={task}
                            included={included}
                            selected={selected}
                            selectTask={selectTask}
                            updateTitle={updateTitle}
                            openTaskDetails={openTaskDetails}
                        />
                    );
                })}

                <NewTaskRow
                    buildTask={buildTask}
                    openTaskDetails={openTaskDetails}
                />

            </div>
        );
    }
}

//PROPS: task, included, selected, selectTask, updateTitle
class TaskRow extends React.PureComponent {
    constructor(props) {
        super(props);

        this.state = { title: props.task.get("title") || "" };

        this.selectTask = this.selectTask.bind(this);
        this.updateTitle = this.updateTitle.bind(this);
        this.saveTitle = this.saveTitle.bind(this);
        this.handleKeyPress = this.handleKeyPress.bind(this);
        this.openTaskDetails = this.openTaskDetails.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        if( this.props.task !== nextProps.task ) {
            this.setState({ title: nextProps.task.get("title") });
        }
    }

    render() {
        const { title } = this.state;
        const { task, included, selected } = this.props;
        const hidden = included ? "" : "hidden ";
        const starred = task.get("status").get("starred");
        const completed = task.get("status").get("completed");
        const svgInnerColor = (selected) ? 'rgb(0,120,255)' : 'rgb(50,200,50)';
        const svgInner = (selected || completed)
                ? <circle cx="2.4rem" cy="2.4rem" r=".8rem" fill={svgInnerColor} />
                : null;

        const titleColumn = selected
            ?   <input type="text"
                    value={title}
                    onChange={this.updateTitle}
                    onBlur={this.saveTitle}
                    onKeyDown={this.handleKeyPress}
                />
            :   <span onClick={this.openTaskDetails}>{title}</span>;

        // console.log('RENDERED: TaskRow'); // __DEV__
        return (
            <div className={`${hidden}task row`}>
                <div className="checkbox column" onClick={this.selectTask}>
                    <svg width="4.8rem" height="4.8rem">
                        <circle cx="2.4rem" cy="2.4rem" r="1.2rem" fill="white"/>
                        <circle cx="2.4rem" cy="2.4rem" r=".8rem" fill="rgb(50,200,50)" style={(!selected&&completed)?null:{display:"none"}} />
                        <line x1="1.92rem" x2="2.24rem" y1="2.4rem" y2="2.72rem" style={(!selected&&completed)?null:{display:"none"}} />
                        <line x1="2.24rem" x2="2.88rem" y1="2.72rem" y2="2.08rem" style={(!selected&&completed)?null:{display:"none"}} />
                        <circle cx="2.4rem" cy="2.4rem" r=".8rem" fill="rgb(0,120,255)" style={selected?null:{display:"none"}} />
                    </svg>
                </div>
                <div className="title column">
                    {titleColumn}
                </div>
                <Icon i={"star"} hidden={!starred} />
                <Icon i={"info_outline"} onClick={this.openTaskDetails} hidden={!selected} />
            </div>
        );
    }

    selectTask() {
        const { task, selected, selectTask } = this.props;
        selectTask(task.get("_id"), !selected);
    }

    updateTitle(e) {
        this.setState({ title: e.target.value });
    }

    saveTitle(e) {
        const { task, updateTitle } = this.props;
        const { title:newTitle } = this.state;
        const oldTitle = task.get('title');

        if(e && e.target.value !== oldTitle) {
            updateTitle(task.get('_id'), newTitle, oldTitle);
        }
    }

    handleKeyPress(e) {
        const { task, updateTitle } = this.props;

        // <27: ESCAPE> <13: ENTER>
        if(e.keyCode === 27) {
            e.target.value = this.props.task.get('title');
            this.setState({ title: this.props.task.get('title') });
        }

        if(e.keyCode === 27 || e.keyCode === 13) {
            e.target.blur();
        }
    }

    openTaskDetails() {
        const { task, openTaskDetails } = this.props;
        openTaskDetails(task);
    }

    toggleEdit(indx) {}
    toggleStarred() {}
    toggleEditItemPane(task) {}
}

TaskRow.defaultProps = {
    task: Map()
};

class NewTaskRow extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = { title: "" };

        this.updateTitle = this.updateTitle.bind(this);
        this.handleKeyPress = this.handleKeyPress.bind(this);
    }

    render() {
        const { title } = this.state;
        return (
            <div className="add task row">
                <div className="svg column" onClick={this.props.openTaskDetails}>
                    <svg width="4.8rem" height="4.8rem">
                        <line x1="2.4rem" x2="2.4rem" y1="1.2rem" y2="3.6rem" />
                        <line x1="1.2rem" x2="3.6rem" y1="2.4rem" y2="2.4rem" />
                    </svg>
                </div>
                <div className="title column">
                    <input type="text"
                        value={title}
                        onChange={this.updateTitle}
                        onKeyDown={this.handleKeyPress}
                    />
                </div>
            </div>
        );
    }

    updateTitle(e) {
        this.setState({ title: e.target.value });
    }

    handleKeyPress(e) {
        if(e.keyCode === 27) {
            e.target.value = "";
            e.target.blur();
        }
        if(e.keyCode === 13) {
            if(e.target.value !== "") {
                this.props.buildTask(e.target.value);
                e.target.value = "";
            }
            e.target.blur();
        }
    }
}
