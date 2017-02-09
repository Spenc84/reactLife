import React from 'react';
import moment from 'moment';
import { Map, List, fromJS } from 'immutable';

import ListHeader from './uiComponents/ListHeader';
import Query from './uiComponents/Query';
import ListBody from './uiComponents/ListBody';

import { DEFAULT_QUERY, DEFAULT_TASK_COLOR } from '../../defaults';
import { buildFilter } from '../../components/tools';


const Nav = ({tab, onTabChange}) => (
    <nav className="tab row">

        <div className={(tab === 'ALL')?"selected tab":"tab"} style={{flex: .6}}>
            <span onClick={(tab === 'ALL')?null:()=>onTabChange('ALL')}>All</span>
        </div>

        <div className={(tab === 'ACTIVE')?"selected tab":"tab"} style={{flex: .8}}>
            <span onClick={(tab === 'ACTIVE')?null:()=>onTabChange('ACTIVE')}>Active</span>
        </div>

        <div className={(tab === 'PENDING')?"selected tab":"tab"} style={{flex: 1}}>
            <span onClick={(tab === 'PENDING')?null:()=>onTabChange('PENDING')}>Pending</span>
        </div>

        <div className={(tab === 'INACTIVE')?"selected tab":"tab"} style={{flex: 1}}>
            <span onClick={(tab === 'INACTIVE')?null:()=>onTabChange('INACTIVE')}>Inactive</span>
        </div>

        <div className={(tab === 'COMPLETED')?"selected tab":"tab"} style={{flex: 1.3}}>
            <span onClick={(tab === 'COMPLETED')?null:()=>onTabChange('COMPLETED')}>Completed</span>
        </div>

    </nav>
);

export default class ListSection extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            tab: 'ACTIVE',  // <ENUM> ['ALL', 'ACTIVE', 'PENDING', 'INACTIVE', 'COMPLETED']
            query: List(['!completed', 'active']),
            search: '',
            selectedTasks: List(),
            selectedProject: '',
            bodyOffset: 0
        };

        this.modifySelected = this.modifySelected.bind(this);

        this.openScheduler = this.openScheduler.bind(this);
        this.deleteTasks = this.deleteTasks.bind(this);
        this.updateTitle = this.updateTitle.bind(this);
        this.toggleStarred = this.toggleStarred.bind(this);
        this.toggleCompleted = this.toggleCompleted.bind(this);

        this.updateSearch = this.updateSearch.bind(this);
        this.selectTask = this.selectTask.bind(this);
        this.resetSelectedTasks = this.resetSelectedTasks.bind(this);
        this.toggleStarView = this.toggleStarView.bind(this);
        this.openProject = this.openProject.bind(this);
        this.removeFromProject = this.removeFromProject.bind(this);

        this.handleScroll = this.handleScroll.bind(this);
        this.onTabChange = this.onTabChange.bind(this);
    }

    shouldComponentUpdate(nextProps, nextState) {
        return nextProps.active;
    }

    render() {
        const { tab, query, search, selectedTasks, selectedProject, bodyOffset } = this.state;
        const { tasks, tIndx, changeSection, openTaskDetails, api:{createNewTask} } = this.props;

        const project = tasks.get( tIndx[selectedProject] );
        const children = !project ? undefined
            : (()=>{
                let list = [];
                const add = ID => {
                    const task = tasks.get( tIndx[ID] );
                    if(task.getIn(['is', 'project'])) task.get('childTasks').forEach(add);
                    else list.push(task);
                };
                project.get('childTasks').forEach(add);
                return List(list);
            })();

        const backgroundColor
            = selectedTasks.size ? 'white'
            : project ? project.get('color')
            : DEFAULT_TASK_COLOR;

        const filter = buildFilter(project ? children : tasks, query, search);

        console.log('RENDERED: --- LIST_SECTION ---'); // __DEV__
        return (
            <div className="ListSection" style={{background: backgroundColor}}>

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

                <Nav tab={tab} onTabChange={this.onTabChange} />

                <Query
                    tab={tab}
                    count={filter.size-1}
                    search={search}
                    updateSearch={this.updateSearch}
                    bodyOffset={bodyOffset}
                />

                <ListBody
                    tab={tab}
                    tasks={tasks}
                    tIndx={tIndx}
                    filter={filter}
                    search={search}
                    selectedTasks={selectedTasks}
                    selectTask={this.selectTask}
                    updateTitle={this.updateTitle}
                    createNewTask={createNewTask}
                    openTaskDetails={openTaskDetails}
                    openProject={this.openProject}
                    handleScroll={this.handleScroll}
                    project={project}
                />

            </div>
        );
    }


    handleScroll(bodyOffset) {
        this.setState({bodyOffset});
    }

    onTabChange(tab) {
        const query
            = tab === 'ALL' ? List()
            : tab === 'ACTIVE' ? List(['!completed', 'active'])
            : tab === 'PENDING' ? List(['!completed', 'pending'])
            : tab === 'INACTIVE' ? List(['!completed', 'inactive'])
            : tab === 'COMPLETED' ? List(['completed'])
            : List();

        this.setState({ tab, query });
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

        const starred = !selectedTasks.every(ID=>tasks.getIn([tIndx[ID], 'is', 'starred']));

        const updateSelected = {
            action: 'MODIFY',
            pendingTasks: selectedTasks,
            operation: {
                $set: { 'is.starred': starred },
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

        const completed = !selectedTasks.every(ID=>tasks.getIn([tIndx[ID], 'is', 'completed']));

        const updateSelected = {
            action: 'MODIFY',
            pendingTasks: selectedTasks,
            operation: {
                $set: { 'is.completed': completed },
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

    updateSearch(search) {
        this.setState({ search });
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
        const { query } = this.state;
        const index = query.indexOf('starred');
        this.setState({
            query: index === -1
                ? query.push('starred')
                : query.remove(index)
        });
    }

    openProject(selectedProject) {
        this.setState({
            selectedTasks: List(),
            selectedProject
        });
    }

}
