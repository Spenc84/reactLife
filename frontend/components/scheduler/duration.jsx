import React from 'react';
import ExpansionPanel from '../../uiComponents/expansionPanel/expansionPanel';

const DURATION = [
    { value: 0, display: 'None' },
    { value: 15, display: '15 Minutes' },
    { value: 30, display: '30 Minutes' },
    { value: 60, display: '1 Hour' },
    { value: 240, display: '4 Hours' },
    { value: 480, display: '8 Hours' },
    { value: 1440, display: '24 Hours' }
]

const HOURS = (()=>{
    let hours = [];
    for(let i = 0; i<25; i++) hours.push(i);
    return hours;
})();

const MINUTES = [0, 15, 30, 45];


export default class Duration extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            showHours: false,
            showMinutes: false
        };

        this.hideOptions = this.hideOptions.bind(this);
        this.showHours = this.showHours.bind(this);
        this.showMinutes = this.showMinutes.bind(this);
        this.setHour = this.setHour.bind(this);
        this.setMinute = this.setMinute.bind(this);
    }

    render() {
        const { showHours, showMinutes } = this.state;
        const { duration, updateProperty } = this.props;

        const durationDisplay
            =   (duration === 0) ? 'None'
            :   (duration < 60) ? `${duration} Minutes`
            :   (duration === 60) ? '1 Hour'
            :   `${duration / 60} Hours`;


        return (
            <ExpansionPanel
                className="Duration"
                label="Duration"
                title="How long will it take?"
                value={durationDisplay}>

                <div className="custom row">

                    <div>
                        <span className="label"> Hours: </span>
                        <div className="value" onClick={this.showHours} onMouseLeave={this.hideOptions}>

                            {Math.floor(duration / 60)}

                            <div className="inputOptions"
                                style={(showHours) ? null : {display: 'none'}}>

                                {HOURS.map( i=> (
                                    <span key={i}
                                        onClick={this.setHour}
                                        data-content={i*60}>
                                        {i}
                                    </span>
                                ))}

                            </div>

                        </div>
                    </div>

                    <div>
                        <span className="label"> Minutes: </span>
                        <div className="value" onClick={this.showMinutes} onMouseLeave={this.hideOptions}>

                            {duration % 60}

                            <div className="inputOptions"
                                style={(showMinutes) ? null : {display: 'none'}}>

                                {MINUTES.map( i=> (
                                    <span key={i}
                                        onClick={this.setMinute}
                                        data-content={i}>
                                        {i}
                                    </span>
                                ))}

                            </div>

                        </div>
                    </div>

                </div>

                <div className="options row">
                {
                    DURATION.map(({value, display})=>(

                        <div key={value}
                            className={'Duration option'}
                            onClick={updateProperty.bind(null, 'duration', value)}
                            data-content={display}>

                            <div>{display}</div>

                        </div>

                    ))
                }
                </div>

            </ExpansionPanel>
        );
    }

    hideOptions() {
        if(this.state.showHours || this.state.showMinutes) {
            this.setState({
                showHours: false,
                showMinutes: false
            });
        }
    }

    showHours() {
        if(this.state.showHours) return;
        this.setState({ showHours: true });
    }

    showMinutes() {
        if(this.state.showMinutes) return;
        this.setState({ showMinutes: true });
    }

    setHour(e) {
        const { duration, updateProperty } = this.props;
        const newValue = Math.min(parseInt(e.target.dataset.content) + (duration % 60), 1440);
        updateProperty('duration', newValue);
        this.hideOptions();
    }

    setMinute(e) {
        const { duration, updateProperty } = this.props;
        const newValue = Math.min(Math.floor(duration/60)*60 + parseInt(e.target.dataset.content), 1440);
        updateProperty('duration', newValue);
        this.hideOptions();
    }
}
