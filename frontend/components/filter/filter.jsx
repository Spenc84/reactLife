import React from 'react';
import { Map, List, fromJS } from 'immutable';

import { Icon } from '../../uiComponents/ui';
import { filterTasks } from '../tools';

import { EMPTY_QUERY } from '../../defaults';


export default class Filter extends React.PureComponent {
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
            <div className="Filter" style={offsetStyle}>

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

    static getDefaultFilter() {

    }

    static data(filter, data) {
        return data;
        // let filter = query.length || query.size || search ? {filtered:true} : {filtered:false};
        // tasks.forEach(task => {
        //     if(
        //         !task.getIn(['is', 'project']) &&
        //         task.get('title').toLowerCase().indexOf(search.toLowerCase()) !== -1 &&
        //         query.every(item=>every(task, item))
        //     ) filter[task.get('_id')] = true;
        // });
        // return Map(filter);
        //
        // // Children of buildFilter
        // function every(task, item) {
        //     if(List.isList(item) || Array.isArray(item)) return item.some(item=>some(task, item));
        //     if(Map.isMap(item) && item.has('search')) return task.get('title').indexOf(item.get('search')) !== -1;
        //     return item[0] === '!'
        //         ? !task.getIn(['is', item.slice(1)])
        //         : task.getIn(['is', item]);
        // };
        //
        // function some(task, item) {
        //     if(List.isList(item) || Array.isArray(item)) return item.every(item=>every(task, item));
        //     if(Map.isMap(item) && item.has('search')) return task.get('title').indexOf(item.get('search')) !== -1;
        //     return item[0] === '!'
        //         ? !task.getIn(['is', item.slice(1)])
        //         : task.getIn(['is', item]);
        // };
    }
}
