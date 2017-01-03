import React from 'react';
import Animator from 'react-addons-css-transition-group';
import { Icon } from '../../../uiComponents/ui';

export default class calHeader extends React.Component {
    constructor(props) {
        super(props);

        this.state = { showDropNav: false };

        this.switchToAgendaView = this.switchToAgendaView.bind(this);
        this.switchToDayView = this.switchToDayView.bind(this);
        this.switchToWeekView = this.switchToWeekView.bind(this);
        this.switchToMonthView = this.switchToMonthView.bind(this);
        this.switchToListView = this.switchToListView.bind(this);
        this.toggleDropNav = this.toggleDropNav.bind(this);
    }
    shouldComponentUpdate(nextProps, nextState) {
        return (
            (this.state.showDropNav && this.props.activeView !== nextProps.activeView) ||
            this.state.showDropNav !== nextState.showDropNav ||
            this.props.month !== nextProps.month
        );
    }
    render() {
        console.log('RENDERED:  --- CALHEADER ---'); // __DEV__
        const { month, toggleOptionPane, getToday } = this.props;
        const { showDropNav } = this.state;

        const dropIcon = (showDropNav) ? 'arrow_drop_up' : 'arrow_drop_down';
        const dropNav = (showDropNav) ? this.getDropNav() : null;
        return (
            <header className="calendar">
                <div className="Column">
                    <div className="Row" style={{height: '7rem', padding: '1.6rem'}}>
                        <div style={{flexGrow: 1}}>
                            <Icon i={'menu'} size={1.75} onClick={toggleOptionPane} faded />
                            <span style={{margin: "0 .8rem 0 2.4rem", fontSize: "3.2rem"}}>{month}</span>
                            <Icon i={dropIcon} size={1.25} onClick={this.toggleDropNav} faded fluid />
                        </div>
                        <div style={{alignItems: 'center'}}>
                            <Icon i={'today'} onClick={getToday} style={{borderRight: '.2rem solid black', paddingRight: '.8rem'}} faded />
                            <Icon i={'list'} onClick={this.switchToListView} style={{paddingLeft: '.8rem'}} faded />
                        </div>
                    </div>
                    <Animator transitionName="dropNav" transitionEnterTimeout={200} transitionLeaveTimeout={200} component={FirstChild}>
                        { dropNav }
                    </Animator>
                </div>
            </header>
        );
    }
    getDropNav() {
        const { activeView, getPrior, getNext } = this.props;
        let aClass, dClass, wClass, mClass, schedule = false;
        switch(activeView) {
            case 'SCHEDULE': aClass = 'selected'; schedule = true; break;
            case 'DAY': dClass = 'selected'; break;
            case 'WEEK': wClass = 'selected'; break;
            case 'MONTH': mClass = 'selected'; break;
            default: console.log("CALHEADER: View not recognized");
        }
        return (
            <div className="Row" key={1} id="dropNav" style={{justifyContent: `space-between`, paddingBottom: `.8rem`}}>
                <Icon i={`chevron_left`} onClick={(schedule)?null:getPrior} invisible={schedule} fluid={schedule} />
                <nav style={{flexGrow: 1, alignItems: `center`, justifyContent: `space-around`, fontSize: `1.2rem`}}>
                    <span className={aClass} onClick={(aClass) ? null : this.switchToAgendaView}>SCHEDULE</span>
                    <span className={dClass} onClick={(dClass) ? null : this.switchToDayView}>DAY</span>
                    <span className={wClass} onClick={(wClass) ? null : this.switchToWeekView}>WEEK</span>
                    <span className={mClass} onClick={(mClass) ? null : this.switchToMonthView}>MONTH</span>
                </nav>
                <Icon i={`chevron_right`} onClick={(schedule)?null:getNext} invisible={schedule} fluid={schedule} />
            </div>
        );
    }
    switchToAgendaView() {this.props.changeView(`SCHEDULE`);}
    switchToDayView() {this.props.changeView(`DAY`);}
    switchToWeekView() {this.props.changeView(`WEEK`);}
    switchToMonthView() {this.props.changeView(`MONTH`);}
    switchToListView() {this.props.changeSection(`LIST`);}
    toggleDropNav() { this.setState({showDropNav: !this.state.showDropNav}); }
}

function FirstChild(props) {
    return React.Children.toArray(props.children)[0] || null;
}
