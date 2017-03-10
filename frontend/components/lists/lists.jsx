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
            query: Map()
        };
        this.updateQuery = this.updateQuery.bind(this);
    }

    render() {
        const { query } = this.state;
        const { ListComponent = FixedList, data, ...props } = this.props;

        // projectSizes will be mutated by Filter.filterItems and will contain the sizes of each project
        let projectSizes = {};
        const filteredData = Filter.filterItems({list:data, query, projectSizes});
        // const filteredData = data.filter(query);

        console.log('RENDERED:  --- FILTERED LIST ---'); // __DEV__
        return (
            <div className="Filtered List">

                <Filter
                    query={query}
                    updateQuery={this.updateQuery}
                    count={filteredData.size}
                />

                { data.size
                    ? <ListComponent {...props} data={filteredData} />
                    : null
                }

            </div>
        );
    }

    updateQuery(query) {
        this.setState({ query });
    }
}

FilteredList.defaultProps = {
    data: List()
}

FilteredList.propTypes = {
    data: PropTypes.instanceOf(List)
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
                    <div className="top shadow" ref={ref=>this.topShadow=ref} />
                    {list.map((item, i)=><RowComponent key={i} id={item.get('_id')} onClick={onRowClick} item={item} />)}
                    <div className="bottom shadow" ref={ref=>this.bottomShadow=ref} />
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
        this.topShadow.style.display = e.target.scrollTop ? 'flex' : 'none';
        this.topShadow.style.top = e.target.scrollTop;
        // this.bottomShadow.style.display = e.target.scrollTop ===  ? 'flex' : 'none';
        console.log(`scroll: ${e.target.scrollTop}, scrollHeight: ${e.target.scrollHeight}, height: ${e.target.clientHeight}`);
        this.setState({ index: Math.floor(e.target.scrollTop/48) });
    }
}

FixedList.propTypes = {
    data: PropTypes.instanceOf(List)
};

FixedList.defaultProps = {
    data: List()
};
