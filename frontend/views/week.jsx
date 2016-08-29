import React from 'react';
import moment from 'moment';
import { Div } from '../ui/ui';

export default class Day extends React.Component {
    render() {
        const { hidden, current } = this.props;
        let date = moment(this.props.date);

        // Hide this view if inactive
        const weekClasses = (hidden) ? "hidden Week view" : "Week view";

        // Style the weekday names of prior weeks as inactive
        const dateBarClasses = ( date.isBefore(moment(), 'week') )
                ? 'inactive dateBar'
                : 'dateBar';


        // Build weekday title row and events row
        const currentWeek = date.isSame(moment(), 'week');
        let dateBar = [];
        let weekEvents = [];
        let foundActive = false;
        date = date.startOf('week');
        for(let i = 0; i < 7; i++) {
            // Style the weekday names of the current week as inactive, active, or otherwise
            let dateClasses = 'date';
            if(currentWeek && !foundActive) {
                if(date.isBefore(moment(), 'day')) dateClasses = 'inactive date';
                else {
                    dateClasses = 'active date';
                    foundActive = true;
                }
            }
            // Push the new elements to their respective arrays and increment date
            dateBar.push((
                <div key={`weekday${i}_Name`} className={dateClasses}>
                    <div>{ date.format("ddd") }</div>
                    <div>{ date.date() }</div>
                </div>
            ));
            weekEvents.push((
                <div key={`weekday${i}_Events`} className="eventColumn">
                    {/* Stuff */}
                </div>
            ));

            date.add(1, 'day');
        }

        console.log('RENDERED:  --- WEEK VIEW ---'); // __DEV__
        return (
            <div className={weekClasses}>
                <div className={dateBarClasses}>
                    {dateBar}
                </div>
                {/* <Div style={{paddingTop: '60px'}} static></Div> */}
                <div className="weekEvents">
                    {weekEvents}
                </div>

            </div>
        );
    }
}
