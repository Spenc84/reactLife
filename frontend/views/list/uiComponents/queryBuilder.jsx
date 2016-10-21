import React from 'react';
import Animator from 'react-addons-css-transition-group';

import { Icon } from '../../../uiComponents/ui';
import AdvancedQuery from './AdvancedQuery';

export default class QueryBuilder extends React.Component {
    constructor(props) {
        super(props);

        this.state = { selectedTab: 'ACTIVE' };
    }
    shouldComponentUpdate(nextProps, nextState) {
        return (true);
    }
    componentDidMount() {

    }
    render() {
        const { selectedTab } = this.state;
        const { filterTasks } = this.props;

        console.log('RENDERED:  --- QueryBuilder ---'); // __DEV__
        return (
            <div className="QueryBuilder">

                <nav className="tab Column">

                    <div className={(selectedTab === 'SEARCH')?"selected tab":"tab"} style={{flex: .6, padding: '4px 0'}}>
                        <span onClick={this.selectTab.bind(this, 'SEARCH')}><Icon i={'search'} /></span>
                    </div>

                    <div className={(selectedTab === 'ACTIVE')?"selected tab":"tab"} style={{flex: .8}}>
                        <span onClick={this.selectTab.bind(this, 'ACTIVE')}>Active</span>
                    </div>

                    <div className={(selectedTab === 'PENDING')?"selected tab":"tab"} style={{flex: 1}}>
                        <span onClick={this.selectTab.bind(this, 'PENDING')}>Pending</span>
                    </div>

                    <div className={(selectedTab === 'INACTIVE')?"selected tab":"tab"} style={{flex: 1}}>
                        <span onClick={this.selectTab.bind(this, 'INACTIVE')}>Inactive</span>
                    </div>

                    <div className={(selectedTab === 'COMPLETED')?"selected tab":"tab"} style={{flex: 1.3}}>
                        <span onClick={this.selectTab.bind(this, 'COMPLETED')}>Completed</span>
                    </div>

                </nav>

                <div style={(selectedTab === 'SEARCH')?null:{display: 'none'}}>
                    <AdvancedQuery ref="QB" filterTasks={filterTasks} />
                </div>

                <div className="query spacer" style={(selectedTab === 'SEARCH')?{display: 'none'}:null} />

            </div>
        );
    }

    selectTab(tab) { this.filterTasks(tab); this.setState({selectedTab: tab}); }
    filterTasks(tab) {
        if(tab && tab !== 'SEARCH') this.props.filterTasks({rInclude: [tab.toLowerCase()]});
        else this.refs.QB.filterTasks();
    }
}
