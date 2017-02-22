import './lists.styl';
import React, {PureComponent, PropTypes} from 'react';
import { fromJS, Map, List } from 'immutable';

import Filter from '../filter/filter';
import { Icon } from '../../uiComponents/ui';
import { TitleRow } from '../../uiComponents/rows/rows';


export class FilteredList extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            filter: Filter.buildFilter()
        };
        this.updateFilter = this.updateFilter.bind(this);
    }

    render() {
        const { filter } = this.state;
        const { ListComponent = FixedList, data, ...props } = this.props;

        // const filteredData = Filter.data(filter, data);
        const filteredData = data.filter(filter);

        console.log('RENDERED:  --- FILTERED LIST ---'); // __DEV__
        return (
            <div className="Filtered List">

                <Filter
                    count={filteredData.size}
                    filter={filter}
                    updateFilter={this.updateSearch}
                />

                { data.size
                    ? <ListComponent {...props} data={filteredData} />
                    : null
                }

            </div>
        );
    }

    updateFilter(filter) {
        this.setState({ filter });
    }
}

FilteredList.defaultProps = {
    data: List()
}

FilteredList.propTypes = {
    data: PropTypes.instanceOf(List),
    title: PropTypes.string
}



export class FixedList extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            rowCount: 10,
            index: 0
        };
        this.updateRowCount = this.updateRowCount.bind(this);
        this.handleScroll = this.handleScroll.bind(this);
    }

    componentDidMount() {
        console.log('MOUNTED: --- FIXED LIST ---'); // __DEV__
        this.updateRowCount();
        window.addEventListener("resize", this.updateRowCount);
    }

    componentWillUnmount() {
        console.log('UNMOUNTED: --- FIXED LIST ---'); // __DEV__
        window.removeEventListener("resize", this.updateRowCount);
    }

    componentWillReceiveProps(nextProps) {
        if(this.props.data.size === 0 && nextProps.data.size !== 0) this.updateRowCount();
    }

    render() {
        const { rowCount, index } = this.state;
        const { data, RowComponent = TitleRow, onRowClick } = this.props;

        const list = data.slice(index, index+rowCount);
        const handleScroll = data.size < rowCount-1 ? null : this.handleScroll;

        console.log('RENDERED:  --- FIXED LIST ---'); // __DEV__
        return (
            <div className="Fixed List" ref={ref=>this.container=ref} onScroll={handleScroll} data-height={`${data.size*48}px`}>
                <div className="data column" ref={ref=>this.list=ref}>
                    {list.map((item, i)=><RowComponent key={i} id={item.get('_id')} onClick={onRowClick} item={item} />)}
                </div>
                <div className="sizer" style={{height: `${data.size*48}px`}} />
            </div>
        );
    }

    updateRowCount() {
        console.log('resize'); // __DEV__
        this.setState({ rowCount: 1 + Math.ceil(this.container.clientHeight/48) });
    }

    handleScroll(e) {
        this.list.style.top = `${e.target.scrollTop - e.target.scrollTop % 48}px`;
        this.setState({ index: Math.floor(e.target.scrollTop/48) });
    }
}

FixedList.propTypes = {
    data: PropTypes.instanceOf(List)
};

FixedList.defaultProps = {
    data: List()
};
