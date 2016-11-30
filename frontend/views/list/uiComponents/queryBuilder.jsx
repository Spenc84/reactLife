import React from 'react';
import Animator from 'react-addons-css-transition-group';
import { Map, List, fromJS } from 'immutable';

import { Icon } from '../../../uiComponents/ui';
import AdvancedQuery from './AdvancedQuery';

export default class QueryBuilder extends React.PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            query: {
                include: [],
                exclude: [],
                rInclude: [],
                rExclude: [],
                search: ""
            }
        };

        this.updateQuery = this.updateQuery.bind(this);
    }

    render() {
        const { tasksSelected, selectedFilter } = this.props;

        console.log('RENDERED:  --- QueryBuilder ---'); // __DEV__
        return (
            <div className="QueryBuilder" style={(tasksSelected)?{backgroundColor: 'white'}:null}>

                <nav className="tab Row">

                    <div className={(selectedFilter === 'SEARCH')?"selected tab":"tab"} style={{flex: .6, padding: '4px 0'}}>
                        <span onClick={(selectedFilter === 'SEARCH')?null:this.selectFilter.bind(this, 'SEARCH')}><Icon i={'search'} /></span>
                    </div>

                    <div className={(selectedFilter === 'ACTIVE')?"selected tab":"tab"} style={{flex: .8}}>
                        <span onClick={(selectedFilter === 'ACTIVE')?null:this.selectFilter.bind(this, 'ACTIVE')}>Active</span>
                    </div>

                    <div className={(selectedFilter === 'PENDING')?"selected tab":"tab"} style={{flex: 1}}>
                        <span onClick={(selectedFilter === 'PENDING')?null:this.selectFilter.bind(this, 'PENDING')}>Pending</span>
                    </div>

                    <div className={(selectedFilter === 'INACTIVE')?"selected tab":"tab"} style={{flex: 1}}>
                        <span onClick={(selectedFilter === 'INACTIVE')?null:this.selectFilter.bind(this, 'INACTIVE')}>Inactive</span>
                    </div>

                    <div className={(selectedFilter === 'COMPLETED')?"selected tab":"tab"} style={{flex: 1.3}}>
                        <span onClick={(selectedFilter === 'COMPLETED')?null:this.selectFilter.bind(this, 'COMPLETED')}>Completed</span>
                    </div>

                </nav>

                <div style={(selectedFilter === 'SEARCH')?null:{display: 'none'}}>
                    <AdvancedQuery updateQuery={this.updateQuery} />
                </div>

                <div className="gradient spacer" />

            </div>
        );
    }

    selectFilter(tab = "ACTIVE") {
        const { query:advancedQuery } = this.state;
        const { updateFilter } = this.props;

        const query = (tab === 'SEARCH')
            ? advancedQuery
            : (tab === 'COMPLETED')
                ?   {   rInclude: ['completed'] }
                :   {
                        rInclude: [tab.toLowerCase()],
                        rExclude: ['completed']
                    };

        updateFilter(tab, query);
    }

    updateQuery(item, oldStatus, newStatus) {
        const { query } = this.state;
        const { updateFilter } = this.props;
        if(typeof item !== "string" || item === "") return query;

        let newQuery = fromJS(query);
        if(item === "search") {
            const newValue = oldStatus;
            newQuery = newQuery.set("search", newValue);
        }
        else {
            if(oldStatus) newQuery = newQuery.deleteIn([oldStatus, newQuery.get(oldStatus).indexOf(item)]);
            if(newStatus) newQuery = newQuery.set(newStatus, newQuery.get(newStatus).push(item));
        }
        newQuery = newQuery.toJS();

        this.setState({ query: newQuery });

        updateFilter("SEARCH", newQuery);
    }

    getQuery() {
        const { query } = this.state;
        const { selectedFilter } = this.props;

        return (selectedFilter === 'SEARCH')
            ? query
            : (selectedFilter === 'COMPLETED')
                ?   {   rInclude: ['completed'] }
                :   {
                        rInclude: [selectedFilter.toLowerCase()],
                        rExclude: ['completed']
                    };
    }

}