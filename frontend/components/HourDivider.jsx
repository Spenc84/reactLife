import React from 'react';
import moment from 'moment';
import {Column, Row, Span} from '../ui/ui';

// Static Elements
const DIVIDING_LINES = [];
for(let i = 0; i < 48; i++) DIVIDING_LINES.push(<hr key={i}/>);

const HOURS = [<Span key={0} static>12 AM</Span>];
for(let i = 1; i < 12; i++) HOURS.push(<Span key={i} static>{i} AM</Span>);
HOURS.push(<Span key={12} static>12 PM</Span>);
for(let i = 1; i < 12; i++) HOURS.push(<Span key={i+12} static>{i} PM</Span>);

export default class HourDivider extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            now: moment()
        }

        this.updateCurrentMinute = this.updateCurrentMinute.bind(this);
        this.intervalId = setInterval(this.updateCurrentMinute, 60000);
    }

    componentWillUnmount() { clearInterval(this.intervalId); }

    render() {
        const { now } = this.state;
        const date = moment(this.props.date);
        const currentHour = now.hour();
        const minuteBarHeight = currentHour*60 + now.minute() + 10;
        const hourClasses = (date.isBefore(now, 'day')) ? 'inactive hours' : 'hours';
        const hourStyles = (date.isSame(now, 'day'))
                ? (<style style={{display: 'none'}} dangerouslySetInnerHTML={{__html: [`.hours span:nth-child(-n+${currentHour}){ color: rgba(0,0,0,.5) }`].join('\n')}}></style>)
                : null;

        console.log('RENDERED:  *  HourDivider'); // __DEV__
        return (
            <section className="hour-divider">
                {hourStyles}
                <Column className={hourClasses} flex={'0 0 3rem'}>
                    {HOURS}
                </Column>
                <Row className="events">
                    <svg height="8" width="105%" style={{top: `${minuteBarHeight}px`}} className="currentTime">
                        <circle cx="4" cy="4" r="2.5"/>
                        <line x1="4" y1="4" x2="100%" y2="4" style={{strokeWidth: 1}}/>
                    </svg>
                    <div className="eventArray" />
                    <Column className="dividingLines" static>
                        {DIVIDING_LINES}
                    </Column>
                </Row>
            </section>
        );
    }

    updateCurrentMinute() {
        const now = moment();
        if(now.hour() === 0 && now.minute() === 0) this.props.updateDate(now);
        else this.setState({now: moment()});

        console.log('Updated Minute: ', now.format(`LT`)); // __DEV__
    }
}
