import React from 'react';
import { Icon } from '../../../uiComponents/ui';

export default class AdvancedQuery extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            query: {},
            require: false,
            exclude: false,
            active: "",
            pending: "",
            inactive: "",
            completed: "",
            highPriority: "",
            lowPriority: "",
            scheduled: "",
            unscheduled: "",
            reoccuring: ""
        };

        this.toggleRequire = this.toggleRequire.bind(this);
        this.toggleExclude = this.toggleExclude.bind(this);
    }
    render() {
        const { require, exclude, active, pending, inactive, completed, highPriority, lowPriority, scheduled, unscheduled, reoccuring } = this.state;

        return (
            <div className="query">
                <div className="Row">
                    <div className="Column" style={{justifyContent: 'space-around'}}>
                        <span onClick={this.toggleRequire} className={require?'active':null}>Require</span>
                        <span onClick={this.toggleExclude} className={exclude?'active':null}>Exclude</span>
                    </div>
                    <div className="Column">
                        <span className={active} onClick={this.processQueryItem.bind(this, 'active')}>Active</span>
                        <span className={completed} onClick={this.processQueryItem.bind(this, 'completed')}>Completed</span>
                        <span className={scheduled} onClick={this.processQueryItem.bind(this, 'scheduled')}>Scheduled</span>
                    </div>
                    <div className="Column">
                        <span className={pending} onClick={this.processQueryItem.bind(this, 'pending')}>Pending</span>
                        <span className={highPriority} onClick={this.processQueryItem.bind(this, 'highPriority')}>High Priority</span>
                        <span className={unscheduled} onClick={this.processQueryItem.bind(this, 'unscheduled')}>Unscheduled</span>
                    </div>
                    <div className="Column">
                        <span className={inactive} onClick={this.processQueryItem.bind(this, 'inactive')}>Inactive</span>
                        <span className={lowPriority} onClick={this.processQueryItem.bind(this, 'lowPriority')}>Low Priority</span>
                        <span className={reoccuring} onClick={this.processQueryItem.bind(this, 'reoccuring')}>Reoccuring</span>
                    </div>
                </div>
                <div className="Row">
                    <input type="text" placeholder="Search..." />
                </div>
            </div>
        );
    }

    toggleRequire() {
        this.setState({ require: !this.state.require });
    }
    toggleExclude() {
        this.setState({ exclude: !this.state.exclude });
    }
    processQueryItem(item) {
        const { require, exclude } = this.state;

        const status = this.state[item];
        const required = status.indexOf("required") !== -1;
        const included = status.indexOf("included") !== -1;
        const excluded = status.indexOf("excluded") !== -1;

        if(require) {
            if(exclude) {
                if(required && excluded) return this.updateQuery(item, "");
                else return this.updateQuery(item, "required excluded");
            }
            else {
                if(required && included) return this.updateQuery(item, "");
                else return this.updateQuery(item, "required included");
            }
        }
        else {
            if(exclude) {
                if(excluded && !required) return this.updateQuery(item, "");
                else return this.updateQuery(item, "excluded");
            }
            else {
                if(included && !required) return this.updateQuery(item, "");
                else return this.updateQuery(item, "included");
            }
        }
    }
    updateQuery(item, newStatus) {
    //     const { query } = this.state;
    //     const oldStatus = this.state[item];
    //
    //     if(oldStatus !== "") {
    //
    //     }
    //
    //
    //
    //
    //     const newState = state || this.state;
    //     const { exclude } = newState;
    //     let require = [], include = [];
    //     for(let status in newState) {
    //         if(newState[status] === 2) require.push(status);
    //         else if(newState[status] === 1) include.push(status);
    //     }
    //     this.props.updateQuery({exclude, include, require});
    // }

}
