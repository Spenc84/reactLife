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
            tab: "ACTIVE",
            filter: filterTasks(props.tasks, DEFAULT_QUERY),
            starView: false,
            selectedTasks: List(),
            selectedProject: ''
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
        this.openProject = this.openProject.bind(this);
        this.removeFromProject = this.removeFromProject.bind(this);
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
        const { tab, filter, starView, selectedTasks, selectedProject } = this.state;
        const { tasks, tIndx, changeSection, openTaskDetails, api:{createNewTask} } = this.props;

        const project = tasks.get( tIndx[selectedProject] );
        const tasksInProject = project ? project.get('childTasks') : undefined;

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
                    project={project}
                    modifySelected={this.modifySelected}
                    removeFromProject={this.removeFromProject}
                />

                <QueryBuilder ref="QB"
                    tasksSelected={selectedTasks.size > 0}
                    tab={tab}
                    updateFilter={this.updateFilter}
                />

                <ListBody
                    tab={tab}
                    tasks={tasks}
                    tIndx={tIndx}
                    filter={filter}
                    starView={starView}
                    selectedTasks={selectedTasks}
                    selectTask={this.selectTask}
                    updateTitle={this.updateTitle}
                    createNewTask={createNewTask}
                    openTaskDetails={openTaskDetails}
                    selectedProject={selectedProject}
                    tasksInProject={tasksInProject}
                    openProject={this.openProject}
                />

            </div>
        );
    }


    modifySelected(callback1, callback2) {
        const { selectedTasks, selectedProject } = this.state;
        const { tasks, tIndx } = this.props;

        if( callback1 || callback2 ) {
            this.setState({
                selectedTasks: typeof callback1 === 'function' ? callback1(selectedTasks) || List() : selectedTasks,
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
        if(typeof taskID !== 'string' || taskID === '' || typeof newTitle !== 'string' || newTitle === '') return;
        const { api:{updateTasks}, USER } = this.props;

        const updateTitleOnTask = {
            action: 'MODIFY',
            pendingTasks: [taskID],
            operation: {
                $set: { title: newTitle },
                $push: {
                    changeLog: {
                        date: moment().toJSON(),
                        user: USER.get('_id'),
                        display: `Updated tasks title from '${oldTitle}' to '${newTitle}'`
                    }
                }
            }
        };

        updateTasks(updateTitleOnTask);
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

        const updateSelected = {
            action: 'MODIFY',
            pendingTasks: selectedTasks,
            operation: {
                $set: { 'status.starred': starred },
                $push: {
                    changeLog: {
                        date: moment().toJSON(),
                        user: USER.get('_id'),
                        display: starred ? 'Added star to task' : 'Removed star from task'
                    }
                }
            }
        };

        updateTasks(updateSelected);
        this.resetSelectedTasks();
    }

    toggleCompleted() {
        const { selectedTasks } = this.state;
        const { api:{updateTasks}, tasks, tIndx, USER } = this.props;

        const completed = !selectedTasks.every(ID=>tasks.get(tIndx[ID]).get('status').get('completed'));

        const updateSelected = {
            action: 'MODIFY',
            pendingTasks: selectedTasks,
            operation: {
                $set: { 'status.completed': completed },
                $push: {
                    changeLog: {
                        date: moment().toJSON(),
                        user: USER.get('_id'),
                        display: completed ? 'Marked task as Completed' : 'Removed Completed status'
                    }
                }
            }
        };

        updateTasks(updateSelected);
        this.resetSelectedTasks();
    }

    removeFromProject() {
        const { selectedTasks, selectedProject } = this.state;
        const { api:{updateTasks}, tasks, tIndx, USER } = this.props;

        const titles = selectedTasks.size === 1
            ?   [`'${tasks.getIn([tIndx[selectedTasks.get(0)], 'title'])}'`]
            :   selectedTasks.map( (taskID, i) => {
                    return i === selectedTasks.size - 1
                        ? `and '${tasks.getIn([tIndx[taskID], 'title'])}'`
                        : `'${tasks.getIn([tIndx[taskID], 'title'])}'`
                });

        const updateSelected = {
            action: 'MODIFY',
            pendingTasks: selectedTasks,
            operation: {
                $pull: { 'parentTasks': selectedProject },
                $push: {
                    changeLog: {
                        date: moment().toJSON(),
                        user: USER.get('_id'),
                        display: `Removed task from Project '${tasks.getIn([tIndx[selectedProject], 'title'])}'`
                    }
                }
            }
        };

        const updateParent = {
            action: 'MODIFY',
            pendingTasks: [selectedProject],
            operation: {
                $pull: { 'childTasks': { $in: selectedTasks } },
                $push: {
                    changeLog: {
                        date: moment().toJSON(),
                        user: USER.get('_id'),
                        display: `Removed task${selectedTasks.size>1?'s':''} ${titles.join(', ')}`
                    }
                }
            }
        };

        updateTasks([updateSelected, updateParent]);
        this.resetSelectedTasks();
    }

    updateFilter(tab, query) {
        const { tab:oldTab, selectedTasks } = this.state;
        this.setState({
            tab,
            filter: filterTasks(this.props.tasks, query),
            selectedTasks: (oldTab === tab) ? selectedTasks : List()
        });
    }

    selectTask(ID, selected) {
        const { selectedTasks:currentList } = this.state;

        const index = currentList.indexOf(ID);

        const selectedTasks
            = selected ? currentList.push(ID)
            : index !== -1 ? currentList.delete(index)
            : selectedTasks;

        this.setState({ selectedTasks });
    }

    resetSelectedTasks() {
        this.setState({ selectedTasks: List() });
    }

    toggleStarView() {
        this.setState({ starView: !this.state.starView });
    }

    openProject(selectedProject) {
        this.setState({
            selectedTasks: List(),
            selectedProject
        });
    }

}
