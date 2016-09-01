import React from 'react';
import moment from 'moment';
import {Column, Row, Span} from '../ui/ui';

// Static Elements
const DIVIDING_LINES = [];
for(let i = 0; i < 48; i++) DIVIDING_LINES.push(<hr key={i}/>);

const HOURS = [<Span key={0} id="AM12" static>12 AM</Span>];
for(let i = 1; i < 12; i++) HOURS.push(<Span key={i} id={"AM"+i} static>{i} AM</Span>);
HOURS.push(<Span key={12} id="PM12" static>12 PM</Span>);
for(let i = 1; i < 12; i++) HOURS.push(<Span key={i+12} id={"PM"+i} static>{i} PM</Span>);

export default class HourDivider extends React.Component {
    constructor(props) {
        super(props)

        this.state = { now: moment().valueOf() }

        this.updateCurrentMinute = this.updateCurrentMinute.bind(this);
        this.intervalId = setInterval(this.updateCurrentMinute, 60000);
    }

    componentDidMount() { view_container.scrollTop = moment(this.state.now).hour()*60; }
    shouldComponentUpdate(nextProps, nextState) {
        return (
            this.props.prior !== nextProps.prior ||
            this.props.current !== nextProps.current ||
            this.state.now !== nextState.now
        );
    }
    componentWillUnmount() { clearInterval(this.intervalId); }

    render() {
        const now = moment(this.state.now);
        const { prior, current } = this.props;

        const hour = now.hour();
        const minuteBarHeight = hour*60 + now.minute() - 5;
        const hourStyles = (current)
                ? ( <style style={{display: 'none'}} dangerouslySetInnerHTML={{__html: [`.hours span:nth-child(-n+${hour}){ color: rgba(0,0,0,.5) }`].join('\n')}} /> )
                : null;
        const MINUTE_BAR = (current)
                ? (
                    <svg height="8" width="105%" style={{top: `${minuteBarHeight}px`}} className="currentTime">
                        <circle cx="4" cy="4" r="2.5"/>
                        <line x1="4" y1="4" x2="100%" y2="4" style={{strokeWidth: 1}}/>
                    </svg>
                )
                : null;

        console.log('RENDERED:  *  HourDivider'); // __DEV__
        return (
            <section className="hour-divider">
                <div className={(prior) ? "inactive Row" : "Row"} style={{flex: '0 0 3rem'}}>
                    {hourStyles}
                    <Column className="hours" flex={'0 0 3rem'} static>
                        {HOURS}
                    </Column>
                </div>
                <Row className="events" static={!current}>
                    {MINUTE_BAR}
                    <Column className="dividingLines" static>
                        {DIVIDING_LINES}
                    </Column>
                </Row>
            </section>
        );
    }

    updateCurrentMinute() {
        if(!this.props.current) return;
        const now = moment();
        if(now.hour() === 0 && now.minute() === 0) this.props.updateDate(now);
        else this.setState({now: moment().valueOf()});

        console.log('Updated Minute: ', now.format(`LT`)); // __DEV__
    }
}
