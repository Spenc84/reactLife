import React from 'react';
import moment from 'moment';

export default class Day extends React.Component {
    render() {
        let { hidden, prior, current } = this.props;
        const date = moment(this.props.date);

        // Hide this view if inactive
        const dayClasses = (hidden) ? "hidden Day view" : "Day view";

        // Style each day as inactive, active, or otherwise
        const dateClasses = (prior) ? 'inactive date'
                        : (current) ? 'active date'
                        : 'date';

        console.log('RENDERED:  --- DAY VIEW ---'); // __DEV__
        return (
            <div className={dayClasses}>
                <div className={dateClasses}>
                    <div>{ date.format("ddd") }</div>
                    <div>{ date.date() }</div>
                </div>
            </div>
        );
    }
}
