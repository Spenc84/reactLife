import React from 'react';
import moment from 'moment';
import ExpansionPanel from '../../uiComponents/expansionPanel/expansionPanel';

const START_TIME = [
    {
        display: 'Now',
        get value() { return moment().minute(Math.floor(moment().minute()/15)*15).startOf('minute').toJSON(); }
    },
    {
        display: 'Tonight',
        get value() { return moment().hour(18).startOf('hour').toJSON() },
        get hide() { return moment().hour() > 16 }
    },
    {
        display: 'Tomorrow',
        get value() { return moment().add(1, 'day').hour(8).startOf('hour').toJSON() }
    },
    {
        display: 'Tomorrow Evening',
        get value() { return moment().add(1, 'day').hour(18).startOf('hour').toJSON() }
    },
    {
        display: 'This Weekend',
        get value() { return moment().day(6).hour(8).startOf('hour').toJSON() },
        get hide() { return moment().day() > 4 }
    },
    {
        display: 'Next Week',
        get value() { return moment().add(1, 'week').day(1).hour(8).startOf('hour').toJSON() }
    },
    {
        display: 'Next Weekend',
        get value() { return moment().add(1, 'week').day(6).hour(8).startOf('hour').toJSON() }
    },
    {
        display: 'Next Month',
        get value() { return moment().add(1, 'month').date(1).hour(8).startOf('hour').toJSON() }
    },
    {
        display: 'Someday',
        value: ''
    }
]

const HOURS = (()=>{
    let hours = [12];
    for(let i = 1; i<12; i++) hours.push(i);
    return hours;
})();

const MINUTES = [0, 15, 30, 45];


export default class StartTime extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            showHours: false,
            showMinutes: false
        };

        this.toggleAMPM = this.toggleAMPM.bind(this);
        this.hideOptions = this.hideOptions.bind(this);
        this.showHours = this.showHours.bind(this);
        this.showMinutes = this.showMinutes.bind(this);
        this.setHour = this.setHour.bind(this);
        this.setMinute = this.setMinute.bind(this);
    }

    render() {
        const { showHours, showMinutes } = this.state;
        const { startTime:start, updateProperty } = this.props;

        const startTime = (start) ? moment(start) : null;
        const startTimeDisplay = (startTime) ? startTime.calendar() : 'None';

        const year = (startTime)
            ?   <div className="year value">
                    {startTime.format('Y')}
                </div>
            :   <span>YEAR</span>;

        const date = (startTime)
            ?   <div className="date value">
                    {startTime.format('ddd, MMM Do')}
                </div>
            :   <span>DATE</span>;

        const time = (startTime)
            ?   <div className="time">

                    <div className="hour value" onClick={this.showHours} onMouseLeave={this.hideOptions}>

                        {startTime.format('h')}

                        <div className="inputOptions"
                            style={(showHours) ? null : {display: 'none'}}>
                            {HOURS.map( i=> (
                                <span key={i}
                                    onClick={this.setHour}
                                    data-content={i}>
                                    {i}
                                </span>
                            ))}
                        </div>

                    </div>

                    {' : '}

                    <div className="minute value" onClick={this.showMinutes} onMouseLeave={this.hideOptions}>

                        {startTime.format('mm')}

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

                    <div className="Column" onClick={this.toggleAMPM}>
                        <span style={startTime.hour() < 12 ? null : {opacity: .5}}>AM</span>
                        <span style={startTime.hour() < 12 ? {opacity: .5} : null}>PM</span>
                    </div>

                </div>
            :   <span>TIME</span>;

        return (
            <ExpansionPanel
                className="StartTime"
                label="Start Time"
                title="When can you start?"
                value={startTimeDisplay}>

                <div className="custom Row">
                    <div className="Column" style={{flexGrow: 0}}>
                        {year}
                        {date}
                    </div>

                    {time}

                </div>

                <div className="options row">
                {
                    START_TIME.map(({value, display, hide}, index)=>(

                        <div key={index}
                            className={'StartTime option'}
                            onClick={updateProperty.bind(null, 'startTime', value)}
                            data-content={display}
                            style={(hide)?{display: 'none'}:null}>

                            <div>{display}</div>

                        </div>

                    ))
                }
                </div>

            </ExpansionPanel>
        );
    }

    toggleAMPM() {
        const { startTime, updateProperty } = this.props;

        const sMoment = moment(startTime);
        const newValue = (sMoment.hour() < 12)
            ? sMoment.add(12, 'hours')
            : sMoment.subtract(12, 'hours');

        updateProperty('startTime', newValue.toJSON());
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
        const { startTime, updateProperty } = this.props;

        const sMoment = moment(startTime);
        let hour = parseInt(e.target.dataset.content);
        if(hour === 12) hour = 0;
        if(sMoment.hour() >= 12) hour += 12;

        updateProperty('startTime', sMoment.hour(hour).toJSON());
        this.hideOptions();
    }

    setMinute(e) {
        const { startTime, updateProperty } = this.props;
        const newValue = moment(startTime).minute(e.target.dataset.content).toJSON();
        updateProperty('startTime', newValue);
        this.hideOptions();
    }
}
