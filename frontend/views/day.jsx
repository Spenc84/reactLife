import React from 'react';
import moment from 'moment';
import HourDivider from '../components/HourDivider';

export default class Day extends React.Component {
    render() {
        let { dropNav, ...passDownProps } = this.props;
        const date = moment(this.props.date);
        const prior = date.isBefore(moment(), 'day');
        const current = date.isSame(moment(), 'day');
        const dateClasses = (prior) ? 'inactive date'
                        : (current) ? 'active date'
                        : 'date';
        passDownProps.prior = prior;
        passDownProps.current = current;

        console.log('RENDERED:  --- DAY VIEW ---'); // __DEV__
        return (
            <main className="Day view">
                <div className={dateClasses}>
                    <div>{ date.format("ddd") }</div>
                    <div>{ date.date() }</div>
                </div>
                <HourDivider {...passDownProps} />
            </main>
        );
    }
}
