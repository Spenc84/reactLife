import React from 'react';
import { Icon } from '../ui/ui';

export default class QueryBuilder extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            and: false,
            active: 0,
            pending: 0,
            inactive: 0,
            completed: 0,
            highPriority: 0,
            lowPriority: 0,
            scheduled: 0,
            unscheduled: 0,
            reoccuring: 0
        };
    }
    render() {
        const { and, active, pending, inactive, completed, highPriority, lowPriority, scheduled, unscheduled, reoccuring } = this.state;
        return (
            <div className="query">
                <div className="Row">
                    <div className="Column" style={{justifyContent: 'space-around'}}>
                        <Icon i={'find_replace'} style={{justifyContent: 'center'}} />
                        <span onClick={this.includeQueryItem.bind(this, 'and')} className={and?'included':null}>&&</span>
                    </div>
                    <div className="Column">
                        <span className={(active===1)?'included':(active===-1)?'excluded':null}
                                onClick={this.includeQueryItem.bind(this, 'active')}
                                onDoubleClick={this.excludeQueryItem.bind(this, 'active')}>
                                Active
                        </span>
                        <span onClick={this.includeQueryItem.bind(this, 'completed')} className={(completed===1)?'included':(completed===-1)?'excluded':null}>Completed</span>
                        <span onClick={this.includeQueryItem.bind(this, 'scheduled')} className={(scheduled===1)?'included':(scheduled===-1)?'excluded':null}>Scheduled</span>
                    </div>
                    <div className="Column">
                        <span onClick={this.includeQueryItem.bind(this, 'pending')} className={(pending===1)?'included':(pending===-1)?'excluded':null}>Pending</span>
                        <span onClick={this.includeQueryItem.bind(this, 'highPriority')} className={(highPriority===1)?'included':(highPriority===-1)?'excluded':null}>High Priority</span>
                        <span onClick={this.includeQueryItem.bind(this, 'unscheduled')} className={(unscheduled===1)?'included':(unscheduled===-1)?'excluded':null}>Unscheduled</span>
                    </div>
                    <div className="Column">
                        <span onClick={this.includeQueryItem.bind(this, 'inactive')} className={(inactive===1)?'included':(inactive===-1)?'excluded':null}>Inactive</span>
                        <span onClick={this.includeQueryItem.bind(this, 'lowPriority')} className={(lowPriority===1)?'included':(lowPriority===-1)?'excluded':null}>Low Priority</span>
                        <span onClick={this.includeQueryItem.bind(this, 'reoccuring')} className={(reoccuring===1)?'included':(reoccuring===-1)?'excluded':null}>Reoccuring</span>
                    </div>
                </div>
                <div className="Row">
                    <input type="text" placeholder="Search..." />
                </div>
            </div>
        );
    }
    includeQueryItem(item) {
        let newState = {};
        if (this.state[item]) newState[item] = 0;
        else newState[item] = 1;
        this.setState(newState);
    }
    excludeQueryItem(item) {
        let newState = {};
        if (this.state[item]) newState[item] = 0;
        else newState[item] = -1;
        this.setState(newState);
    }
}
