import React from 'react';
import moment from 'moment';
import HourDivider from '../components/HourDivider';
import { Div } from '../ui/ui';

export default class Day extends React.Component {
    render() {
        let { dropNav, ...passDownProps } = this.props;
        let date = moment(this.props.date);
        const prior = date.isBefore(moment(), 'week');
        const currentWeek = date.isSame(moment(), 'week');
        const current = date.isSame(moment(), 'day');
        const dateBarClasses = (prior) ? 'inactive dateBar' : 'dateBar';
        passDownProps.prior = prior;
        passDownProps.current = current;

        let dateBar = [];
        let foundActive = false;
        date = date.startOf('week');
        for(let i = 0; i < 7; i++) {
            let dateClasses = 'date';
            if(currentWeek && !foundActive) {
                if(date.isBefore(moment(), 'day')) dateClasses = 'inactive date';
                else {
                    dateClasses = 'active date';
                    foundActive = true;
                }
            }
            dateBar.push((
                <div className={dateClasses}>
                    <div>{ date.format("ddd") }</div>
                    <div>{ date.date() }</div>
                </div>
            ));
            date.add(1, 'day');
        }

        console.log('RENDERED:  --- WEEK VIEW ---'); // __DEV__
        return (
            <main className="Week view">
                <div className={dateBarClasses}>
                    {dateBar}
                </div>
                <Div style={{paddingTop: '60px'}} static></Div>
                <HourDivider {...passDownProps} />
            </main>
        );
    }
}
