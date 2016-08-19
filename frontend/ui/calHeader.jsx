import React from 'react';
import Animator from 'react-addons-css-transition-group';
import { Column, Row, Icon, Span } from './ui';

export default class calHeader extends React.Component {
    constructor(props) {
        super(props)

        this.switchToAgendaView = this.switchToAgendaView.bind(this);
        this.switchToDayView = this.switchToDayView.bind(this);
        this.switchToWeekView = this.switchToWeekView.bind(this);
        this.switchToMonthView = this.switchToMonthView.bind(this);
        this.switchToListView = this.switchToListView.bind(this);
    }
    shouldComponentUpdate(nextProps) {
        return (
            (this.props.showDropNav && this.props.view !== nextProps.view) ||
            this.props.showDropNav !== nextProps.showDropNav ||
            this.props.month !== nextProps.month
        );
    }
    render() {
        console.log('RENDERED:  --- CALHEADER ---'); // __DEV__
        const { month, showDropNav, toggleOptionPane, toggleDropNav, getToday } = this.props;
        const dropIcon = (showDropNav) ? 'arrow_drop_up' : 'arrow_drop_down';
        const dropNav = (showDropNav) ? this.getDropNav() : null;
        return (
            <header>
                <Column>
                    <Row style={{height: '4.375rem', padding: '1rem'}}>
                        <div style={{flexGrow: 1}}>
                            <Icon i={'menu'} size={2} onClick={toggleOptionPane} faded />
                            <Span size={2} style={{margin: "0 .5rem 0 1.5rem"}} content={month} />
                            <Icon i={dropIcon} onClick={toggleDropNav} faded fluid />
                        </div>
                        <div style={{alignItems: 'center'}}>
                            <Icon i={'today'} onClick={getToday} style={{borderRight: '2px solid black', paddingRight: '.5rem'}} faded />
                            <Icon i={'list'} onClick={this.switchToListView} style={{paddingLeft: '.5rem'}} faded />
                        </div>
                    </Row>
                    <Animator transitionName="dropNav" transitionEnterTimeout={200} transitionLeaveTimeout={200} component={FirstChild}>
                        { dropNav }
                    </Animator>
                </Column>
            </header>
        );
    }
    getDropNav() {
        const { view, getPrior, getNext } = this.props;
        let aClass, dClass, wClass, mClass, agenda = false;
        switch(view) {
            case `DAY`: dClass = `selected`; break;
            case `WEEK`: wClass = `selected`; break;
            case `MONTH`: mClass = `selected`; break;
            default: aClass = `selected`; agenda = true; break;
        }
        return (
            <Row key={1} id="dropNav" style={{justifyContent: `space-between`, paddingBottom: `.5rem`}}>
                <Icon i={`chevron_left`} onClick={(agenda)?null:getPrior} invisible={agenda} fluid={agenda} />
                <nav style={{padding: `0 1.5rem`, flexGrow: 1, alignItems: `center`, justifyContent: `space-around`, fontSize: `12px`}}>
                    <span className={aClass} onClick={this.switchToAgendaView}>AGENDA</span>
                    <span className={dClass} onClick={this.switchToDayView}>DAY</span>
                    <span className={wClass} onClick={this.switchToWeekView}>WEEK</span>
                    <span className={mClass} onClick={this.switchToMonthView}>MONTH</span>
                </nav>
                <Icon i={`chevron_right`} onClick={(agenda)?null:getNext} invisible={agenda} fluid={agenda} />
            </Row>
        );
    }
    switchToAgendaView() {this.props.updateView(`AGENDA`);}
    switchToDayView() {this.props.updateView(`DAY`);}
    switchToWeekView() {this.props.updateView(`WEEK`);}
    switchToMonthView() {this.props.updateView(`MONTH`);}
    switchToListView() {this.props.updateView(`LIST`, 'LIST');}
}

function FirstChild(props) {
    return React.Children.toArray(props.children)[0] || null;
}