import React from 'react';
import moment from 'moment';
import { Map, List, fromJS } from 'immutable';

import ListHeader from './uiComponents/ListHeader';
import QueryBuilder from './uiComponents/QueryBuilder';
import ListBody from './uiComponents/ListBody';

import { filterTasks } from '../../components/tools';

// DEFAULTS
const DEFAULT_QUERY = {
    rInclude: ['active'],
    rExclude: ['completed'],
    include: [],
    exclude: [],
    search: ''
};


export default class ListSection extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            selectedFilter: "ACTIVE",
            filter: filterTasks(props.tasks, DEFAULT_QUERY),
            starView: false,
            selectedTasks: List(),
            selectedProject: null
        };

        this.modifySelected = this.modifySelected.bind(this);

        this.openScheduler = this.openScheduler.bind(this);
        this.deleteTasks = this.deleteTasks.bind(this);
        this.updateTitle = this.updateTitle.bind(this);
        this.toggleStarred = this.toggleStarred.bind(this);
        this.toggleCompleted = this.toggleCompleted.bind(this);

        this.updateFilter = this.updateFilter.bind(this);
        this.selectTask = this.selectTask.bind(this);
        this.resetSelectedTasks = this.resetSelectedTasks.bind(this);
        this.toggleStarView = this.toggleStarView.bind(this);
        this.updateSelectedProject = this.updateSelectedProject.bind(this);
    }

    shouldComponentUpdate(nextProps, nextState) {
        return nextProps.active;
    }

    componentWillReceiveProps(nextProps) {
        if(this.props.tasks !== nextProps.tasks) {
            const query = this.refs.QB.getQuery();
            this.setState({
                filter: filterTasks(nextProps.tasks, query),
                // selectedTasks: List()
            });
        }
    }

    render() {
        const { selectedFilter, filter, starView, selectedTasks, selectedProject } = this.state;
        const { tasks, changeSection, openTaskDetails, api:{createNewTask} } = this.props;

        const tasksInProject = selectedProject ? selectedProject.get('childTasks') : List();
        const projectID = selectedProject ? selectedProject.get('_id') : '';

        console.log('RENDERED: --- LIST_SECTION ---'); // __DEV__
        return (
            <div className="ListSection">

                <ListHeader
                    selectedTasks={selectedTasks}
                    changeSection={changeSection}
                    resetSelectedTasks={this.resetSelectedTasks}
                    toggleStarView={this.toggleStarView}
                    deleteTasks={this.deleteTasks}
                    toggleStarred={this.toggleStarred}
                    toggleCompleted={this.toggleCompleted}
                    openScheduler={this.openScheduler}
                    openTaskDetails={openTaskDetails}
                    project={selectedProject}
                    closeProject={this.updateSelectedProject}
                />

                <QueryBuilder ref="QB"
                    tasksSelected={selectedTasks.size > 0}
                    selectedFilter={selectedFilter}
                    updateFilter={this.updateFilter}
                />

                <ListBody
                    tab={selectedFilter}
                    taskList={tasks}
                    filter={filter}
                    starView={starView}
                    selectedTasks={selectedTasks}
                    selectTask={this.selectTask}
                    updateTitle={this.updateTitle}
                    createNewTask={createNewTask}
                    openTaskDetails={openTaskDetails}
                    projectID={projectID}
                    tasksInProject={tasksInProject}
                    openProject={this.updateSelectedProject}
                />

            </div>
        );
    }


    modifySelected(callback1, callback2) {
        const { selectedTasks, selectedProject } = this.state;

        if( callback1 || callback2 ) {
            this.setState({
                selectedTasks: typeof callback1 === 'function' ? callback1(selectedTasks) : selectedTasks,
                selectedProject: typeof callback2 === 'function' ? callback2(selectedProject) : selectedProject
            });
        }
    }

    openScheduler() {
        const { selectedTasks } = this.state;
        const { openScheduler, tasks } = this.props;

        let props = {
            selectedTasks,
            callback: this.resetSelectedTasks
        };

        if(selectedTasks.size === 1) {
            const _id = selectedTasks.get(0);
            const index = tasks.findIndex( task => task.get("_id") === _id );
            if(index !== -1) props.schedule = tasks.get(index).get("schedule");
        }

        openScheduler(props);
    }

    updateTitle(taskID, newTitle, oldTitle) {
        if(typeof taskID !== 'string' || taskID === '') return;
        const { api:{updateTasks}, USER } = this.props;

        const selectedTasks = List([taskID]);

        const action = {
            date: moment().toJSON(),
            user: USER.get('_id'),
            display: `Updated tasks title from '${oldTitle}' to '${newTitle}'`
        };

        const operation = {
            $set: { title: newTitle },
            $push: { changeLog: action }
        };

        updateTasks({selectedTasks, operation});
    }

    deleteTasks() {
        const { selectedTasks } = this.state;
        const { api:{deleteTasks} } = this.props;
        deleteTasks(selectedTasks, this.resetSelectedTasks);
    }

    toggleStarred() {
        const { selectedTasks } = this.state;
        const { api:{updateTasks}, tasks, tIndx, USER } = this.props;

        const starred = !selectedTasks.every(ID=>tasks.get(tIndx[ID]).get('status').get('starred'));
        const action = {
            date: moment().toJSON(),
            user: USER.get('_id'),
            display: (starred) ? 'Added star to task' : 'Removed star from task'
        };

        const operation = {
            $set: { 'status.starred': starred },
            $push: { changeLog: action }
        };

        updateTasks({selectedTasks, operation});
        this.resetSelectedTasks();
    }

    toggleCompleted() {
        const { selectedTasks } = this.state;
        const { api:{updateTasks}, tasks, tIndx, USER } = this.props;

        const completed = !selectedTasks.every(ID=>tasks.get(tIndx[ID]).get('status').get('completed'));
        const action = {
            date: moment().toJSON(),
            user: USER.get('_id'),
            display: (completed) ? 'Marked task as Completed' : 'Removed Completed status'
        };

        const operation = {
            $set: { 'status.completed': completed },
            $push: { changeLog: action }
        };

        updateTasks({selectedTasks, operation});
        this.resetSelectedTasks();
    }

    updateFilter(tab, query) {
        const { selectedFilter, selectedTasks } = this.state;
        this.setState({
            selectedFilter: tab,
            filter: filterTasks(this.props.tasks, query),
            selectedTasks: (tab === selectedFilter) ? selectedTasks : List()
        });
    }

    selectTask(ID, selected) {
        const { selectedTasks:currentList } = this.state;

        const selectedTasks = (selected)
                ? currentList.push(ID)
                : currentList.delete(currentList.indexOf(ID))

        this.setState({ selectedTasks });
    }

    resetSelectedTasks() {
        this.setState({ selectedTasks: List() });
    }

    toggleStarView() {
        this.setState({ starView: !this.state.starView });
    }

    updateSelectedProject(selectedProject) {
        this.setState({selectedProject});
    }

}
