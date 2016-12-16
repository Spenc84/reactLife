import React from 'react';
import ExpansionPanel from '../../uiComponents/expansionPanel/expansionPanel';

import * as DATA from './data';

const HOURS = (()=>{
    let hours = [];
    for(let i = 0; i<25; i++) hours.push(i);
    return hours;
})();

const MINUTES = [0, 15, 30, 45];


export default class DurationPanel extends React.PureComponent {
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
        this.onOpen = this.onOpen.bind(this);
    }

    render() {
        const { showHours, showMinutes } = this.state;
        const { duration, property, updateProperty, expanded } = this.props;
        if(!(typeof property === "string" && DATA.hasOwnProperty(property))) return null;

        const data = DATA[property];

        const durationDisplay
            =   (duration === 0) ? 'None'
            :   (duration < 60) ? `${duration} Minutes`
            :   (duration === 60) ? '1 Hour'
            :   `${duration / 60} Hours`;


        return (
            <ExpansionPanel
                className={data.className}
                label={data.label}
                title={data.title}
                value={durationDisplay}
                expanded={expanded}
                onOpen={this.onOpen}>

                <div className="custom row">

                    <div>
                        <span className="label"> Hours: </span>
                        <div className="value" onClick={this.showHours}>

                            {Math.floor(duration / 60)}

                            <div className="inputOptions"
                                style={(showHours) ? null : {display: 'none'}}>

                                {HOURS.map( i=> (
                                    <span key={i}
                                        className="input-option"
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
                        <div className="value" onClick={this.showMinutes}>

                            {duration % 60}

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
                    </div>

                </div>

                <div className="options row">
                {
                    data.defaults.map(({value, display}, index)=>(

                        <div key={index}
                            className={'default option'}
                            onClick={updateProperty.bind(null, property, value)}
                            data-content={display}>

                            <div>{display}</div>

                        </div>

                    ))
                }
                </div>

            </ExpansionPanel>
        );
    }

    onOpen() {
        if(typeof this.props.onOpen === "function") this.props.onOpen('duration');
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
        const { duration, updateProperty } = this.props;
        const newValue = Math.min(parseInt(e.target.dataset.content) + (duration % 60), 1440);
        updateProperty('duration', newValue);
        e.stopPropagation();
    }

    setMinute(e) {
        const { duration, updateProperty } = this.props;
        const newValue = Math.min(Math.floor(duration/60)*60 + parseInt(e.target.dataset.content), 1440);
        updateProperty('duration', newValue);
        e.stopPropagation();
    }
}
