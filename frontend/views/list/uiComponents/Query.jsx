import React from 'react';
import { Map, List, fromJS } from 'immutable';

import AdvancedQuery from './AdvancedQuery';

import { Icon } from '../../../uiComponents/ui';
import { filterTasks } from '../../../components/tools';

import { EMPTY_QUERY } from '../../../defaults';


export default class Query extends React.PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            expanded: false
        };

        this.updateSearch = this.updateSearch.bind(this);
        this.handleEscape = this.handleEscape.bind(this);
    }

    render() {
        const { expanded } = this.state;
        const { search, count, bodyOffset } = this.props;

        const options = ['Active', 'Pending', 'Inactive', 'Completed', 'Scheduled', 'Project', 'Starred'];

        const offsetStyle = bodyOffset
            ? {
                zIndex: 1,
                boxShadow: '0 1px 3px rgba(0,0,0,.34)'
            }
            : null;

        return (
            <div className="Query" style={offsetStyle}>

                <div className="search row">
                    <div className="count">
                        <span>{count}</span>
                    </div>
                    <input type="text" value={search} onChange={this.updateSearch} onKeyDown={this.handleEscape} placeholder="Search..." />
                    <Icon i={expanded ? 'arrow_drop_up' : 'arrow_drop_down'} onClick={()=>this.setState({expanded: !expanded})} />
                </div>

                { !expanded ? null :
                <div className="query row">

                    <div className="included">
                        <span className="label">Include if:</span>
                        <div className="tags"></div>
                    </div>

                    <div className="excluded">
                        <span className="label">Exclude if:</span>
                        <div className="tags"></div>
                    </div>

                    <div className="options">
                        {options.map( (option, i) => <span key={i}>{option}</span> )}
                    </div>

                </div>}



            </div>
        );
    }

    updateSearch(e) {
        this.props.updateSearch(e.target.value);
    }

    handleEscape(e) {
        if(e.keyCode === 27) {
            e.target.value = "";
            e.target.blur();
            this.updateSearch(e);
        }
    }
}



//////////////////////
class Filterx extends React.PureComponent {
    constructor(props) {
        super(props);

        this.state = { query: EMPTY_QUERY };

        this.updateQuery = this.updateQuery.bind(this);
    }

    render() {
        const { tasksSelected, tab } = this.props;

        console.log('RENDERED:  --- Filter ---'); // __DEV__
        return (
            <div className="Filter">

                <div style={(tab === 'ALL')?null:{display: 'none'}}>
                    <AdvancedQuery updateQuery={this.updateQuery} />
                </div>

                <div className="gradient spacer" />

            </div>
        );
    }

    updateQuery(item, oldStatus, newStatus) {
        const { query } = this.state;
        const { updateFilter } = this.props;
        if(typeof item !== "string" || item === "") return query;

        const newQuery = item === "search" ? query.set("search", oldStatus)
            : query.withMutations(q => {
                if(oldStatus) q.deleteIn([oldStatus, query.get(oldStatus).indexOf(item)]);
                if(newStatus) q.update(newStatus, value => value.push(item));
            });

        this.setState({ query: newQuery });

        updateFilter("ALL", newQuery.equals(EMPTY_QUERY) ? Map({isEmpty:true}) : newQuery);
    }

    getQuery() {
        const { query } = this.state;
        const { tab } = this.props;

        return tab === 'ALL' && query.equals(EMPTY_QUERY) ? Map({isEmpty:true})
        : tab === 'ALL' ? query
        : tab === 'COMPLETED' ? EMPTY_QUERY.set('rInclude', List(['completed']))
        : EMPTY_QUERY.withMutations( q =>
            q.set('rInclude', List([tab.toLowerCase()]))
            .set('rExclude', List(['completed']))
        );
    }

}
