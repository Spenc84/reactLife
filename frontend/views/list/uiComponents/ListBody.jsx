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
                ? <circle cx="24px" cy="24px" r="8px" fill={svgInnerColor} />
                : null;

        console.log('RENDERED: TaskRow'); // __DEV__
        return (
            <div className={`${hidden}task row`}>
                <div className="checkbox column" onClick={this.selectTask}>
                    <svg width="48px" height="48px">
                        <circle cx="24px" cy="24px" r="12px" fill="white"/>
                        <circle cx="24px" cy="24px" r="8px" fill="rgb(50,200,50)" style={(!selected&&completed)?null:{display:"none"}} />
                        <line x1="19.2px" x2="22.4px" y1="24px" y2="27.2px" style={(!selected&&completed)?null:{display:"none"}} />
                        <line x1="22.4px" x2="28.8px" y1="27.2px" y2="20.8px" style={(!selected&&completed)?null:{display:"none"}} />
                        <circle cx="24px" cy="24px" r="8px" fill="rgb(0,120,255)" style={selected?null:{display:"none"}} />
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
                    <svg width="48px" height="48px">
                        <line x1="24px" x2="24px" y1="12px" y2="36px" />
                        <line x1="12px" x2="36px" y1="24px" y2="24px" />
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
