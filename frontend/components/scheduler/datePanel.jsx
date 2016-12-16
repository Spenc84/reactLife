import React from 'react';
import moment from 'moment';
import ExpansionPanel from '../../uiComponents/expansionPanel/expansionPanel';

import * as DATA from './data';

const HOURS = (()=>{
    let hours = [];
    for(let i = 1; i<=12; i++) hours.push(i);
    return hours;
})();

const MINUTES = [0, 15, 30, 45];


export default class DatePanel extends React.PureComponent {
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
        this.onOpen = this.onOpen.bind(this);
    }

    render() {
        const { showHours, showMinutes } = this.state;
        const { dateTime:unix, property, updateProperty, expanded } = this.props;
        if(!(typeof property === "string" && DATA.hasOwnProperty(property))) return null;

        const data = DATA[property];

        const dateTime = (unix) ? moment(unix) : null;
        const dateTimeDisplay = (dateTime) ? dateTime.calendar() : 'None';

        const year = (dateTime)
            ?   <div className="year value">
                    {dateTime.format('Y')}
                </div>
            :   <span>YEAR</span>;

        const date = (dateTime)
            ?   <div className="date value">
                    {dateTime.format('ddd, MMM Do')}
                </div>
            :   <span>DATE</span>;

        const time = (dateTime)
            ?   <div className="time">

                    <div className="hour value" onClick={this.showHours}>

                        {dateTime.format('h')}

                        <div className="inputOptions"
                            style={(showHours) ? null : {display: 'none'}}>
                            {HOURS.map( i=> (
                                <span key={i}
                                    className="input-option"
                                    onClick={this.setHour}
                                    data-content={i}>
                                    {i}
                                </span>
                            ))}
                        </div>

                    </div>

                    {' : '}

                    <div className="minute value" onClick={this.showMinutes}>

                        {dateTime.format('mm')}

                        <div className="inputOptions"
                            style={(showMinutes) ? null : {display: 'none'}}>
                            {MINUTES.map( i=> (
                                <span key={i}
                                    className="input-option"
                                    onClick={this.setMinute}
                                    data-content={i}>
                                    {i}
                                </span>
                            ))}
                        </div>

                    </div>

                    <div className="Column" onClick={this.toggleAMPM}>
                        <span style={dateTime.hour() < 12 ? null : {opacity: .5}}>AM</span>
                        <span style={dateTime.hour() < 12 ? {opacity: .5} : null}>PM</span>
                    </div>

                </div>
            :   <span>TIME</span>;

        return (
            <ExpansionPanel
                className={data.className}
                label={data.label}
                title={data.title}
                value={dateTimeDisplay}
                expanded={expanded}
                onOpen={this.onOpen}>

                <div className="custom Row">
                    <div className="Column" style={{flexGrow: 0}}>
                        {year}
                        {date}
                    </div>

                    {time}

                </div>

                <div className="options row">
                {
                    data.defaults.map(({value, display, hide}, index)=>(

                        <div key={index}
                            className={'default option'}
                            onClick={updateProperty.bind(null, property, value)}
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

    onOpen() {
        if(typeof this.props.onOpen === "function") this.props.onOpen(this.props.property);
    }

    toggleAMPM() {
        const { dateTime, property, updateProperty } = this.props;

        const sMoment = moment(dateTime);
        const newValue = (sMoment.hour() < 12)
            ? sMoment.add(12, 'hours')
            : sMoment.subtract(12, 'hours');

        updateProperty(property, newValue.toJSON());
    }

    hideOptions(e) {
        if(this.state.showHours || this.state.showMinutes) {
            this.setState({
                showHours: false,
                showMinutes: false
            });
        }

        document.removeEventListener('click', this.hideOptions, true);
        if(e.target.className !== "input-option") e.stopPropagation();
    }

    showHours() {
        if(this.state.showHours) return;
        this.setState({ showHours: true });

        document.addEventListener('click', this.hideOptions, true);
    }

    showMinutes() {
        if(this.state.showMinutes) return;
        this.setState({ showMinutes: true });

        document.addEventListener('click', this.hideOptions, true);
    }

    setHour(e) {
        const { dateTime, property, updateProperty } = this.props;

        const sMoment = moment(dateTime);
        let hour = parseInt(e.target.dataset.content);
        if(hour === 12) hour = 0;
        if(sMoment.hour() >= 12) hour += 12;

        updateProperty(property, sMoment.hour(hour).toJSON());
        e.stopPropagation();
    }

    setMinute(e) {
        const { dateTime, property, updateProperty } = this.props;
        const newValue = moment(dateTime).minute(e.target.dataset.content).toJSON();
        updateProperty(property, newValue);
        e.stopPropagation();
    }
}
