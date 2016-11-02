import React from 'react';
import { Icon } from '../../../uiComponents/ui';

const STATUS = {
    0: "",
    1: "included",
    2: "excluded",
    3: "required included",
    4: "required excluded"
}

const QUERY = {
    0: "",
    1: "include",
    2: "exclude",
    3: "rInclude",
    4: "rExclude"
}

export default class AdvancedQuery extends React.PureComponent {
    constructor(props) {
        super(props);

        this.state = {
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
            reoccuring: "",
            search: ""
        };

        this.toggleRequire = this.toggleRequire.bind(this);
        this.toggleExclude = this.toggleExclude.bind(this);
        this.updateSearch = this.updateSearch.bind(this);
        this.handleEscape = this.handleEscape.bind(this);
    }

    render() {
        const { require, exclude, active, pending, inactive, completed, highPriority, lowPriority, scheduled, unscheduled, reoccuring, search } = this.state;

        console.log('RENDERED: AdvancedQuery'); // __DEV__
        return (
            <div className="query">
                <div className="Row">
                    <div className="Column" style={{justifyContent: 'space-around'}}>
                        <span className={require?'required-active':null} onClick={this.toggleRequire}>Require</span>
                        <span className={exclude?'excluded-active':null} onClick={this.toggleExclude}>Exclude</span>
                    </div>
                    <div className="Column">
                        <span className={STATUS[active]} onClick={this.processQueryItem.bind(this, 'active')}>Active</span>
                        <span className={STATUS[completed]} onClick={this.processQueryItem.bind(this, 'completed')}>Completed</span>
                        <span className={STATUS[scheduled]} onClick={this.processQueryItem.bind(this, 'scheduled')}>Scheduled</span>
                    </div>
                    <div className="Column">
                        <span className={STATUS[pending]} onClick={this.processQueryItem.bind(this, 'pending')}>Pending</span>
                        <span className={STATUS[highPriority]} onClick={this.processQueryItem.bind(this, 'highPriority')}>High Priority</span>
                        <span className={STATUS[unscheduled]} onClick={this.processQueryItem.bind(this, 'unscheduled')}>Unscheduled</span>
                    </div>
                    <div className="Column">
                        <span className={STATUS[inactive]} onClick={this.processQueryItem.bind(this, 'inactive')}>Inactive</span>
                        <span className={STATUS[lowPriority]} onClick={this.processQueryItem.bind(this, 'lowPriority')}>Low Priority</span>
                        <span className={STATUS[reoccuring]} onClick={this.processQueryItem.bind(this, 'reoccuring')}>Reoccuring</span>
                    </div>
                </div>
                <div className="Row">
                    <input type="text" value={search} onChange={this.updateSearch} onKeyDown={this.handleEscape} placeholder="Search..." />
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
        const { updateQuery } = this.props;
        const oldStatus = this.state[item];

        let newStatus = 0;
        if(require) {
            if(exclude) {
                if(oldStatus !== 4) newStatus = 4;
            }
            else {
                if(oldStatus !== 3) newStatus = 3;
            }
        }
        else {
            if(exclude) {
                if(oldStatus !== 2) newStatus = 2;
            }
            else {
                if(oldStatus !== 1) newStatus = 1;
            }
        }

        this.setState({ [item]: newStatus });
        updateQuery(item, QUERY[oldStatus], QUERY[newStatus]);
    }
    updateSearch(e) {
        this.setState({ search: e.target.value });
        this.props.updateQuery("search", e.target.value);
    }
    handleEscape(e) {
        if(e.keyCode === 27) {
            e.target.value = "";
            e.target.blur();
            this.updateSearch(e);
        }
    }
}
