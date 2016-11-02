import React from 'react';
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
    exclude: []
};


export default class ListSection extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            selectedFilter: "ACTIVE",
            filter: filterTasks(props.tasks, DEFAULT_QUERY),
            starView: false,
            selectedTasks: List()
        };

        this.updateTasks = this.updateTasks.bind(this);
        this.toggleStarred = this.toggleStarred.bind(this);
        this.updateFilter = this.updateFilter.bind(this);
        this.selectTask = this.selectTask.bind(this);
        this.resetSelectedTasks = this.resetSelectedTasks.bind(this);
        this.toggleStarView = this.toggleStarView.bind(this);
        this.createNewTask = this.createNewTask.bind(this);
    }

    shouldComponentUpdate(nextProps, nextState) {
        return nextProps.active;
    }

    componentWillReceiveProps(nextProps) {
        if(this.props.tasks !== nextProps.tasks) {
            const query = this.refs.QB.getQuery();
            this.setState( {filter: filterTasks(nextProps.tasks, query)} );
        }
    }

    render() {
        const { selectedFilter, filter, starView, selectedTasks } = this.state;
        const { tasks, changeSection, api:{buildTask} } = this.props;

        return (
            <div className="ListSection">

                <ListHeader
                    tasksSelected={selectedTasks.size > 0}
                    changeSection={changeSection}
                    resetSelectedTasks={this.resetSelectedTasks}
                    toggleStarView={this.toggleStarView}
                    updateTasks={this.updateTasks}
                    toggleStarred={this.toggleStarred}
                />

                <QueryBuilder ref="QB"
                    tasksSelected={selectedTasks.size > 0}
                    selectedFilter={selectedFilter}
                    updateFilter={this.updateFilter}
                />

                <ListBody
                    taskList={tasks}
                    filter={filter}
                    starView={starView}
                    selectedTasks={selectedTasks}
                    selectTask={this.selectTask}
                    createNewTask={this.createNewTask}
                />

            </div>
        );
    }

    updateTasks(desiredChange) {
        const { selectedTasks } = this.state;
        const { updateTasks } = this.props;
        updateTasks(selectedTasks, desiredChange);
    }

    toggleStarred() {
        const { selectedTasks } = this.state;
        const { api:{updateTasks}, tasks, tIndx } = this.props;

        const starred = !selectedTasks.every(ID=>tasks.get(tIndx[ID]).get('status').get('starred'));
        updateTasks(selectedTasks, {'status.starred': starred});
    }

    createNewTask(title) {
        const { selectedFilter } = this.state;
        const { api:{buildTask} } = this.props;

        buildTask(title, selectedFilter);
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

}
