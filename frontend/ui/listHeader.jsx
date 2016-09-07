import React from 'react';
import Animator from 'react-addons-css-transition-group';
import { Icon } from './ui';
import QueryBuilder from '../components/queryBuilder'

export default class ListHeader extends React.Component {
    constructor(props) {
        super(props);

        this.state = { selectedTab: 'ACTIVE'};

        this.switchToCalendarView = this.switchToCalendarView.bind(this);
        this.toggleAdvancedQuery = this.toggleAdvancedQuery.bind(this);
        this.selectTab = this.selectTab.bind(this);
    }
    shouldComponentUpdate(nextProps, nextState) {
        return (true);
    }
    render() {
        const { selectedTab } = this.state;
        const { selectedTasks } = this.props;

        console.log('RENDERED:  --- LISTHEADER ---'); // __DEV__
        return (
            <header className="list">
                <div className="icon Row">

                </div>
                <div className={(selectedTasks.length)?"hideaway default row":"default Row"}>
                    <div style={{flexGrow: 1}}>
                        <Icon i={'today'} onClick={this.switchToCalendarView} />
                        <span style={{margin: "0 .5rem 0 1.5rem", fontSize: "2rem"}}>Projects</span>
                    </div>
                    <Icon i={'star'} onClick={null} light />
                </div>
                <nav className="tab Column">
                    <div className="tabs">
                        <div className={(selectedTab === 'SEARCH')?"selected tab":"tab"} style={{flex: .6, padding: '4px 0'}}>
                            <span onClick={this.selectTab.bind(null, 'SEARCH')}><Icon i={'search'} /></span>
                        </div>
                        <div className={(selectedTab === 'ACTIVE')?"selected tab":"tab"} style={{flex: .8}}>
                            <span onClick={this.selectTab.bind(null, 'ACTIVE')}>Active</span>
                        </div>
                        <div className={(selectedTab === 'PENDING')?"selected tab":"tab"} style={{flex: 1}}>
                            <span onClick={this.selectTab.bind(null, 'PENDING')}>Pending</span>
                        </div>
                        <div className={(selectedTab === 'INACTIVE')?"selected tab":"tab"} style={{flex: 1}}>
                            <span onClick={this.selectTab.bind(null, 'INACTIVE')}>Inactive</span>
                        </div>
                        <div className={(selectedTab === 'COMPLETED')?"selected tab":"tab"} style={{flex: 1.3}}>
                            <span onClick={this.selectTab.bind(null, 'COMPLETED')}>Completed</span>
                        </div>
                    </div>
                </nav>
                <div style={(selectedTab === 'SEARCH')?null:{display: 'none'}}>
                    <QueryBuilder />
                </div>
                <div className="query spacer" style={(selectedTab === 'SEARCH')?{display: 'none'}:null} />
            </header>
        );
    }

    switchToCalendarView() { this.props.updateView(this.props.priorBODY, 'CALENDAR'); }
    toggleAdvancedQuery() { this.setState({showAdvancedQuery: !this.state.showAdvancedQuery}); }
    selectTab(tab) { this.setState({selectedTab: tab}); }
}
