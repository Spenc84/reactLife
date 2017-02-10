import React from 'react';
import moment from 'moment';
import { Map, List, fromJS } from 'immutable';

import { getDefaultTask } from '../../../defaults';
import { Icon } from '../../../uiComponents/ui';


// PROPS: tasks, filter, search, selectedTasks, selectTask, updateTitle, createNewTask
export default class ListBody extends React.PureComponent {
    render() {
        const { tab, tasks, tIndx, filter, search, selectedTasks, selectTask,
                updateTitle, createNewTask, openTaskDetails, openProject,
                handleScroll, project } = this.props;

        const projectID = project ? project.get('_id') : undefined;
        const childIDs = project ? project.get('childTasks') : undefined;

        const buildRow = task => {
            const ID = task.get('_id');
            const selected = selectedTasks.some(id=>id===ID);

            const isProject = task.getIn(['is', 'project']);
            const projectSize = !isProject ? 0
                : (()=>{
                    let sum = 0;
                    const add = ID => {
                        const task = tasks.get( tIndx[ID] );
                        if(task.getIn(['is', 'project'])) task.get('childTasks').forEach(add);
                        else if(filter.get(ID)) sum++;
                    };
                    task.get('childTasks').forEach(add);
                    return sum;
                })();


            const included = (

                // If there is a project selected only include it's children
                !(project && task.get('parentTasks').indexOf(projectID) === -1) &&

                // If a project isn't selected only include orphans
                (project || !task.get('parentTasks').size) &&

                // Anything remaining must also satisfy one of the following conditions...
                (
                    // If there is no filter then automatically include any remaining items
                    filter.get('filtered') === false ||
                    // If there IS a filter then reject any tasks that don't pass it's criteria
                    filter.get(ID) ||
                    // Display any projects that have included tasks, or that match the search string (if there is one)
                    (
                        isProject &&
                        (
                            projectSize ||
                            (search && task.get('title').toLowerCase().indexOf(search.toLowerCase()) !== -1)
                        )
                    )
                )

            );


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

        console.log('RENDERED: --- LISTBODY ---'); // __DEV__
        return (
            <div className="List-Body" onScroll={e=>handleScroll(e.target.scrollTop)}>

                {tasks.map(buildRow)}

                <NewTaskRow
                    tab={tab}
                    project={project}
                    createNewTask={createNewTask}
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

        this.state = { title: props.task.get('title') || '' };

        this.selectTask = this.selectTask.bind(this);
        this.updateTitle = this.updateTitle.bind(this);
        this.saveTitle = this.saveTitle.bind(this);
        this.handleKeyPress = this.handleKeyPress.bind(this);
        this.openTaskDetails = this.openTaskDetails.bind(this);
        this.openProject = this.openProject.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        if( this.props.task !== nextProps.task ) {
            this.setState({ title: nextProps.task.get('title') });
        }
    }

    render() {
        const { title } = this.state;
        const { task, included, selected, projectSize } = this.props;
        const hidden = included ? '' : 'hidden ';
        const starred = task.getIn(['is', 'starred']);
        const completed = task.getIn(['is', 'completed']);
        const isProject = task.getIn(['is', 'project']);

        const svgInnerColor = (selected) ? 'rgb(0,120,255)'
                : (isProject) ? task.get('color')
                : 'rgb(50,200,50)';

        const onRowClick = isProject ? this.openProject : this.openTaskDetails;

        const titleColumn = selected
            ?   <input type='text'
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
        const { tab, project } = this.props;

        let task = getDefaultTask().set('title', this.title.value);

        if( tab === 'ACTIVE' || tab === 'PENDING' ) {

            const minute = Math.floor(moment().minute()/15)*15;

            const startTime = tab === 'ACTIVE'
                ? moment().minute(minute).startOf('minute').toJSON()
                : moment().add(1, 'day').minute(minute).startOf('minute').toJSON();

            task = task.withMutations(
                task => task
                    .setIn( ['schedule', 'startTime'], startTime )
                    .setIn(['is', 'scheduled'], true)
                    .setIn(['is', 'active'], tab === 'ACTIVE')
                    .setIn(['is', 'pending'], tab === 'PENDING')
                    .setIn(['is', 'inactive'], false)
                    .setIn(['changeLog', 0, 'display'], 'Created and scheduled task')
            );

        }

        if(project) {
            task = task.withMutations(
                task => task
                    .set('parentTasks', List([project.get('_id')]))
                    .updateIn(['changeLog', 0, 'display'], value => value += `\nAssigned task to project '${project.get('title')}'`)
            );
        }

        return task;
    }

}
