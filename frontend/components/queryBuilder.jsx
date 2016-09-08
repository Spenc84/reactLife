import React from 'react';
import { Icon } from '../ui/ui';

export default class QueryBuilder extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            exclude: 0,
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
        const { exclude, active, pending, inactive, completed, highPriority, lowPriority, scheduled, unscheduled, reoccuring } = this.state;
        return (
            <div className="query">
                <div className="Row">
                    <div className="Column" style={{justifyContent: 'space-around'}}>
                        <Icon i={'find_replace'} style={{justifyContent: 'center'}} />
                        <span onClick={this.includeQueryItem.bind(this, 'exclude')} className={exclude?'included':null}>&&</span>
                    </div>
                    <div className="Column">
                        <span className={(active===1)?'included':(active===2)?'required':null}
                                onClick={this.includeQueryItem.bind(this, 'active')}
                                onDoubleClick={this.requireQueryItem.bind(this, 'active')}>
                                Active
                        </span>
                        <span onClick={this.includeQueryItem.bind(this, 'completed')} className={(completed===1)?'included':(completed===2)?'required':null}>Completed</span>
                        <span onClick={this.includeQueryItem.bind(this, 'scheduled')} className={(scheduled===1)?'included':(scheduled===2)?'required':null}>Scheduled</span>
                    </div>
                    <div className="Column">
                        <span onClick={this.includeQueryItem.bind(this, 'pending')} className={(pending===1)?'included':(pending===2)?'required':null}>Pending</span>
                        <span onClick={this.includeQueryItem.bind(this, 'highPriority')} className={(highPriority===1)?'included':(highPriority===2)?'required':null}>High Priority</span>
                        <span onClick={this.includeQueryItem.bind(this, 'unscheduled')} className={(unscheduled===1)?'included':(unscheduled===2)?'required':null}>Unscheduled</span>
                    </div>
                    <div className="Column">
                        <span onClick={this.includeQueryItem.bind(this, 'inactive')} className={(inactive===1)?'included':(inactive===2)?'required':null}>Inactive</span>
                        <span onClick={this.includeQueryItem.bind(this, 'lowPriority')} className={(lowPriority===1)?'included':(lowPriority===2)?'required':null}>Low Priority</span>
                        <span onClick={this.includeQueryItem.bind(this, 'reoccuring')} className={(reoccuring===1)?'included':(reoccuring===2)?'required':null}>Reoccuring</span>
                    </div>
                </div>
                <div className="Row">
                    <input type="text" placeholder="Search..." />
                </div>
            </div>
        );
    }
    includeQueryItem(item) {
        let newState = this.state;
        if (newState[item]) newState[item] = 0;
        else newState[item] = 1;
        this.updateQuery(newState);
        this.setState(newState);
    }
    requireQueryItem(item) {
        let newState = this.state;
        if (newState[item] !== 2) newState[item] = 2;
        else newState[item] = 0;
        this.updateQuery(newState);
        this.setState(newState);
    }
    updateQuery(state) {
        const newState = state || this.state;
        const { exclude } = newState;
        let require = [], include = [];
        for(let status in newState) {
            if(newState[status] === 2) require.push(status);
            else if(newState[status] === 1) include.push(status);
        }
        this.props.updateQuery({exclude, include, require});
    }

}
