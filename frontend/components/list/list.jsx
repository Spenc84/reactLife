import './list.styl';
import React, {PureComponent} from 'react';
import Filter from '../filter/filter';

import { Icon } from '../../uiComponents/ui';


export default class List extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            filter: Filter.getDefaultFilter(),
            bodyOffset: 0
        };
        this.updateFilter = this.updateFilter.bind(this);
        this.handleScroll = this.handleScroll.bind(this);
    }

    render() {
        const { filter, bodyOffset } = this.state;
        const { onRowClick, title, data, includeFilter, RowComponent = Row } = this.props;

        const filteredData = includeFilter ? Filter.data(filter, data) : data;

        const filterUI = includeFilter
            ? <Filter
                count={filteredData.size-1}
                filter={filter}
                updateFilter={this.updateSearch}
                bodyOffset={bodyOffset}
            />
            // ? <div className="filter">
            //     <div className="count">
            //         <span>{data.size}</span>
            //     </div>
            //     <input type='text' placeholder="Search..." />
            //     <Icon i={'arrow_drop_down'} />
            // </div>
            : null;

        return (
            <div className="List">
                <header> {title} </header>
                {filterUI}
                <div className="expanded column" onScroll={this.handleScroll}>
                    {filteredData.map((item, i)=><RowComponent key={i} index={i} onClick={onRowClick} item={item} />)}
                </div>
            </div>
        );
    }

    updateFilter() {

    }

    handleScroll(e) {
        this.setState({bodyOffset: e.target.scrollTop});
    }
}

function Row({index, onClick, item}) {
    return (
        <div
            data-index={index}
            className="item row"
            onClick={onClick}
        >
            <Icon i={item.getIn(['is','project']) ? 'group_work' : 'fiber_manual_record'} />
            <span>{item.get('title')}</span>
        </div>
    );
}
