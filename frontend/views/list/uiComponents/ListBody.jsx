import React from 'react';
import moment from 'moment';
import { Map, List, fromJS } from 'immutable';

import { getDefaultTask } from '../../../defaults';
import { Icon } from '../../../uiComponents/ui';


// PROPS: tasks, filter, starView, selectedTasks, selectTask, updateTitle, createNewTask
export default class ListBody extends React.PureComponent {
    render() {
        const { tab, tasks, tIndx, filter, starView, selectedTasks, selectTask,
                updateTitle, createNewTask, openTaskDetails, selectedProject,
                tasksInProject, openProject } = this.props;

        const buildRow = task => {
            const ID = task.get("_id");
            const selected = selectedTasks.some(id=>id===ID);
            const starred = task.get("status").get("starred");
            const isProject = task.get("status").get("isProject");

            const projectSize
                = tab === "SEARCH" ? task.get('childTasks').size
                : (() => {
                    const _tab = tab.toLowerCase();
                    let sum = 0;
                    if(tab === "COMPLETED")
                        task.get('childTasks').forEach( ID => {
                            if(
                                tasks.getIn([tIndx[ID], 'status', 'completed'])
                            ) sum++;
                        });
                    else
                        task.get('childTasks').forEach( ID => {
                            if(
                                tasks.getIn([tIndx[ID], 'status', _tab]) &&
                                !tasks.getIn([tIndx[ID], 'status', 'completed'])
                            ) sum++;
                        });
                    return sum;
                })();

            const included
                = ((filter.get(ID) && !isProject) || (isProject && (projectSize || tab === 'SEARCH')))
                && !(tasksInProject && tasksInProject.indexOf(ID) === -1)
                && !(tab !== "SEARCH" && task.get('parentTasks').size && task.get('parentTasks').indexOf(selectedProject))
                && !(starView && !starred);

            return (
                <TaskRow
                    key={ID}
                    task={task}
                    included={included}
                    selected={selected}
                    selectTask={selectTask}
                    updateTitle={updateTitle}
                    openTaskDetails={openTaskDetails}
                    openProject={openProject}
                    projectSize={projectSize}
                />
            );
        };

        // const projectList = tasks.filter( task => task.getIn(['status', 'isProject']));
        // const taskList = tasks.filter( task => !task.getIn(['status', 'isProject']));

        console.log('RENDERED: --- LISTBODY ---'); // __DEV__
        return (
            <div className="List-Body">

                {tasks.sort(
                    (x,y) =>  x.getIn(['status', 'isProject']) === y.getIn(['status', 'isProject']) ? 0
                            : x.getIn(['status', 'isProject']) ? -1
                            : 1
                ).map(buildRow)}

                <NewTaskRow
                    createNewTask={createNewTask}
                    openTaskDetails={openTaskDetails}
                    tab={tab}
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
        this.openProject = this.openProject.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        if( this.props.task !== nextProps.task ) {
            this.setState({ title: nextProps.task.get("title") });
        }
    }

    render() {
        const { title } = this.state;
        const { task, included, selected, projectSize } = this.props;
        const hidden = included ? "" : "hidden ";
        const starred = task.get("status").get("starred");
        const completed = task.get("status").get("completed");
        const isProject = task.get("status").get("isProject");

        const svgInnerColor = (selected) ? 'rgb(0,120,255)'
                : (isProject) ? task.get('color')
                : 'rgb(50,200,50)';

        const onRowClick = isProject ? this.openProject : this.openTaskDetails;

        const titleColumn = selected
            ?   <input type="text"
                    value={title}
                    onChange={this.updateTitle}
                    onBlur={this.saveTitle}
                    onKeyDown={this.handleKeyPress}
                />
            :   <span onClick={onRowClick}>{title}</span>;

        // console.log('RENDERED: TaskRow'); // __DEV__
        return (
            <div className={`${hidden}task row`}>
                <div className="checkbox column" onClick={this.selectTask}>
                    <svg width="4.8rem" height="4.8rem">
                        <circle cx="2.4rem" cy="2.4rem" r="1.2rem" fill="white"/>
                        <circle cx="2.4rem" cy="2.4rem" r=".8rem" fill={svgInnerColor} style={selected||completed||isProject?null:{display:"none"}} />
                        <line x1="1.92rem" x2="2.24rem" y1="2.4rem" y2="2.72rem" style={(!selected&&completed)?null:{display:"none"}} />
                        <line x1="2.24rem" x2="2.88rem" y1="2.72rem" y2="2.08rem" style={(!selected&&completed)?null:{display:"none"}} />
                    </svg>
                    {isProject ? <span className="projectSize" style={selected?{display:'none'}:null}>{projectSize}</span> : null}
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
        const { task, selected, selectTask, openTaskDetails } = this.props;
        openTaskDetails({task});
        if(selected) selectTask(task.get("_id"), false);
    }

    openProject() {
        const { task, openProject } = this.props;
        openProject(task.get('_id'));
    }

}

TaskRow.defaultProps = {
    task: Map()
};


class NewTaskRow extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = { title: "" };

        this.openTaskDetails = this.openTaskDetails.bind(this);
        this.updateTitle = this.updateTitle.bind(this);
        this.handleKeyPress = this.handleKeyPress.bind(this);
    }

    render() {
        const { title } = this.state;
        return (
            <div className="add task row">
                <div className="svg column" onClick={this.openTaskDetails}>
                    <svg width="4.8rem" height="4.8rem">
                        <line x1="2.4rem" x2="2.4rem" y1="1.2rem" y2="3.6rem" />
                        <line x1="1.2rem" x2="3.6rem" y1="2.4rem" y2="2.4rem" />
                    </svg>
                </div>
                <div className="title column">
                    <input ref={ref => this.title = ref}
                        type="text"
                        value={title}
                        onChange={this.updateTitle}
                        onKeyDown={this.handleKeyPress}
                    />
                </div>
            </div>
        );
    }

    openTaskDetails() {
        this.props.openTaskDetails({
            type: 'NEW',
            task: this.buildTask()
        });
        this.setState({ title: '' });
    }

    updateTitle(e) {
        this.setState({ title: e.target.value });
    }

    handleKeyPress(e) {
        if(e.keyCode === 27) {
            this.setState({ title: '' });
            this.title.blur();
        }
        if(e.keyCode === 13) {
            if(e.target.value !== "") {
                this.props.createNewTask( this.buildTask() );
                this.setState({ title: '' });
            }
            this.title.blur();
        }
    }

    buildTask() {
        const { tab } = this.props;

        let task = getDefaultTask().set('title', this.title.value);

        if( tab === 'ACTIVE' || tab === 'PENDING' ) {

            const minute = Math.floor(moment().minute()/15)*15;

            const startTime = tab === 'ACTIVE'
                ? moment().minute(minute).startOf('minute').toJSON()
                : moment().add(1, 'day').minute(minute).startOf('minute').toJSON();

            task = task.withMutations(
                task => task
                    .set('title', this.title.value)
                    .setIn( ['schedule', 'startTime'], startTime )
                    .setIn(['status', 'scheduled'], true)
                    .setIn(['status', 'active'], tab === 'ACTIVE')
                    .setIn(['status', 'pending'], tab === 'PENDING')
                    .setIn(['status', 'inactive'], false)
                    .setIn(['changeLog', 0, 'display'], 'Created and scheduled task')
            );

        }

        return task;
    }

}
