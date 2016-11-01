import React from 'react';

import { Icon } from '../../../uiComponents/ui';

export default class ListBody extends React.PureComponent {
    render() {
        const { taskList, filter, starView, selectedTasks, selectTask } = this.props;

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

                <div className="add task row">
                    <div className="svg column" onClick={this.toggleNewItemPane}>
                        <svg width="3em" height="3em">
                            <line x1="1.5em" x2="1.5em" y1="0.75em" y2="2.25em" />
                            <line x1="0.75em" x2="2.25em" y1="1.5em" y2="1.5em" />
                        </svg>
                    </div>
                    <div className="title column">
                        <form onSubmit={this.saveNew}>
                            <input type="text" />
                        </form>
                    </div>
                </div>

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
                ? <circle cx="1.5em" cy="1.5em" r=".5em" fill={svgInnerColor} />
                : null;

        console.log('RENDERED: TaskRow'); // __DEV__
        return (
            <div className={`${hidden}task row`}>
                <div className="checkbox column" onClick={this.selectTask}>
                    <svg width="3em" height="3em">
                        <circle cx="1.5em" cy="1.5em" r=".75em" fill="white"/>
                        <circle cx="1.5em" cy="1.5em" r=".5em" fill="rgb(50,200,50)" style={(!selected&&completed)?null:{display:"none"}} />
                        <line x1="1.2em" x2="1.4em" y1="1.5em" y2="1.7em" style={(!selected&&completed)?null:{display:"none"}} />
                        <line x1="1.4em" x2="1.8em" y1="1.7em" y2="1.3em" style={(!selected&&completed)?null:{display:"none"}} />
                        <circle cx="1.5em" cy="1.5em" r=".5em" fill="rgb(0,120,255)" style={selected?null:{display:"none"}} />
                    </svg>
                </div>
                <div className="title column">
                    {task.get("name")}
                    {/* <form ng-submit="saveTask(task)">
                        <input type="text" ng-model="task.name" ng-if="!task.status.selected" ng-click="toggleEditItemPane(task)" readonly />
                        <input type="text" ng-model="task.name" ng-if="task.status.selected" />
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
