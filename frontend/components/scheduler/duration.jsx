import React from 'react';
import moment from 'moment';
import { Map, List, fromJS } from 'immutable';

import Modal from '../../uiComponents/modal/modal';
import ExpansionPanel from '../../uiComponents/expansionPanel/expansionPanel';
import { Button } from '../../uiComponents/ui';

const DURATION = [
    { value: 0, display: 'None' },
    { value: 15, display: '15 Minutes' },
    { value: 30, display: '30 Minutes' },
    { value: 60, display: '1 Hour' },
    { value: 240, display: '4 Hours' },
    { value: 480, display: '8 Hours' },
    { value: 1440, display: '24 Hours' }
]

export default class Duration extends React.PureComponent {
    render() {
        const { duration, updateProperty } = this.props;

        const durationDisplay
            =   (duration === 0) ? 'None'
            :   (duration < 60) ? `${duration} Minutes`
            :   (duration === 60) ? '1 Hour'
            :   `${duration / 60} Hours`;


        return (
            <div className="Duration picker">
                <ExpansionPanel
                    label="Duration"
                    title="How long will it take?"
                    value={durationDisplay}>

                    <div className="custom row">
                        <div>
                            <span className="label"> Hours: </span>
                            <span className="value">{Math.floor(duration / 60)}</span>
                        </div>
                        <div>
                            <span className="label"> Minutes: </span>
                            <span className="value">{duration % 60}</span>
                        </div>
                    </div>

                    <div className="options row">
                    {
                        DURATION.map(option=>(

                            <div className={'Duration option'}
                                onClick={updateProperty.bind(null, 'duration', option)}
                                data-content={option.display}>

                                <div>{option.display}</div>

                            </div>

                        ))
                    }
                    </div>

                </ExpansionPanel>
            </div>
        );
    }

    getDurationDisplay() {
        const { duration } = this.props;

        return
    }

    getDurationValue() {}
}
