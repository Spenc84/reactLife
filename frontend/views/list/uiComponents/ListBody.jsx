import React from 'react';

import { Icon } from '../../../uiComponents/ui';

export default class ListBody extends React.PureComponent {
    render() {
        const { taskList, filter, starView, selectedTasks, selectTask, buildTask } = this.props;

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
                        />
                    );
                })}

                <NewTaskRow
                    toggleNewItemPane={this.toggleNewItemPane}
                    buildTask={buildTask}
                />

            </div>
        );
    }

    toggleNewItemPane() { console.log("toogleNewItemPane()"); }
    saveNew() { console.log("saveNew()"); }
}

class TaskRow extends React.PureComponent {
    constructor(props) {
        super(props);
        this.selectTask = this.selectTask.bind(this);
    }
    render() {
        const { task, included, selected } = this.props;
        const hidden = included ? "" : "hidden ";
        const starred = task.get("status").get("starred");
        const completed = task.get("status").get("completed");
        const svgInnerColor = (selected) ? 'rgb(0,120,255)' : 'rgb(50,200,50)';
        const svgInner = (selected || completed)
                ? <circle cx="2.4rem" cy="2.4rem" r=".8rem" fill={svgInnerColor} />
                : null;

        console.log('RENDERED: TaskRow'); // __DEV__
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
                    {task.get("title")}
                    {/* <form ng-submit="saveTask(task)">
                        <input type="text" ng-model="task.title" ng-if="!task.status.selected" ng-click="toggleEditItemPane(task)" readonly />
                        <input type="text" ng-model="task.title" ng-if="task.status.selected" />
                    </form> */}
                </div>
                <Icon i={"star"} hidden={!starred} style={{color:"rgb(241,196,15)"}} onClick={this.toggleStarred()} />
                <Icon i={"info_outline"} hidden={!selected} onClick={this.toggleEditItemPane(task)} />
            </div>
        );
    }

    selectTask() {
        const { task, selected, selectTask } = this.props;
        selectTask(task.get("_id"), !selected);
    }
    toggleEdit(indx) {}
    toggleStarred() {}
    toggleEditItemPane(task) {}
}

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
                <div className="svg column" onClick={this.props.toggleNewItemPane}>
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
            this.props.buildTask(e.target.value)
            e.target.value = "";
            e.target.blur();
        }
    }
}
