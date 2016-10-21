import React from 'react';
import { Map, List, fromJS, toJS } from 'immutable';

import ListHeader from './uiComponents/ListHeader';
import QueryBuilder from './uiComponents/QueryBuilder';
import ListBody from './uiComponents/ListBody';

import { filterTasks } from '../../components/tools';

const DEFAULT_QUERY = {
    rInclude: ['active'],
    rExclude: [],
    include: [],
    exclude: []
};

export default class CalendarSection extends Component {
    constructor(props) {
        super(props);

        this.state = {
            filteredTasks: filterTasks(props.tasks, DEFAULT_QUERY)
            selectedTasks: []
        };

        this.filterTasks = this.filterTasks.bind(this);
    }

    shouldComponentUpdate(nextProps, nextState) {
        return nextProps.active;
    }

    render() {
        const { filteredTasks, selectedTasks } = this.state;
        const { changeSection } = this.props;

        return (
            <div className="ListSection">

                <ListHeader
                    tasksSelected={selectedTasks.length > 0}
                    changeSection={changeSection}
                />

                <QueryBuilder
                    filterTasks={this.filterTasks}
                />

                <ListBody taskList={filteredTasks} />

            </div>
        );
    }

    filterTasks(newQuery) { this.setState( {filteredTasks: filterTasks(this.props.tasks, newQuery)} ) };
}
