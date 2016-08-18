import React from 'react';
import HourDivider from '../components/HourDivider';

export default class Day extends React.Component {
    render() {
        const { dropNav, ...other } = this.props;
        const spacer = (dropNav) ? '5.875rem' : '4.375rem';
        console.log('RENDERED:  --- DAY VIEW ---'); // __DEV__

        return (
            <main className="Day view" style={{paddingTop: spacer}}>
                <HourDivider {...other} />
            </main>
        );
    }
}
