import React from 'react';
import moment from 'moment';

// Static Elements
const DIVIDING_LINES = [];
for(let i = 0; i < 48; i++) DIVIDING_LINES.push(<hr key={i}/>);

const HOURS = [<span key={0} id="AM12">12 AM</span>];
for(let i = 1; i < 12; i++) HOURS.push(<span key={i} id={"AM"+i}>{i} AM</span>);
HOURS.push(<span key={12} id="PM12">12 PM</span>);
for(let i = 1; i < 12; i++) HOURS.push(<span key={i+12} id={"PM"+i}>{i} PM</span>);

export default class HourDivider extends React.Component {
    constructor(props) {
        super(props)

        this.state = { now: moment().valueOf() }

        this.updateCurrentMinute = this.updateCurrentMinute.bind(this);
        this.intervalId = setInterval(this.updateCurrentMinute, 60000);
    }

    componentDidMount() { calendar_body.scrollTop = moment(this.state.now).hour()*60; }
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
                    <svg height=".8rem" width="105%" style={{top: `${minuteBarHeight/10}rem`}} className="currentTime">
                        <circle cx=".4rem" cy=".4rem" r=".25rem"/>
                        <line x1=".4rem" y1=".4rem" x2="100%" y2=".4rem" style={{strokeWidth: '.1rem'}}/>
                    </svg>
                )
                : null;

        console.log('RENDERED:  *  HourDivider'); // __DEV__
        return (
            <section className="hour-divider">
                <div className={(prior) ? "inactive fill" : "fill"} style={{flex: '0 0 4.8rem'}}>
                    {hourStyles}
                    <div className="hours fill column" style={{flex:'0 0 4.8rem'}}>
                        {HOURS}
                    </div>
                </div>
                <div className="events fill">
                    {MINUTE_BAR}
                    <div className="dividingLines fill column">
                        {DIVIDING_LINES}
                    </div>
                </div>
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
