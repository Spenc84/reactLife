import React from 'react';
import { Column, Row, Icon, Span } from '../ui';

export default class calHeader extends React.Component {
    shouldComponentUpdate(nextProps) {
        return (this.props.month !== nextProps.month ||
                this.props.showDropCalendar !== nextProps.showDropCalendar);
    }
    render() {
        console.log('RENDERED: calHeader'); // __DEV__
        const { month, showDropCalendar, toggleOptionPane, toggleDropCalendar } = this.props;
        const dropIcon = (showDropCalendar) ? 'arrow_drop_up' : 'arrow_drop_down';
        const dropCalendar = (showDropCalendar) ? <Row>dropCalendar</Row> : null;
        return (
            <header>
                <Column>
                    <Row style={{height: '70px'}} padding={1} fluid>
                        <div style={{flexGrow: 1}}>
                            <Icon i={'menu'} size={2} onClick={toggleOptionPane} faded />
                            <Span size={2} style={{margin: "0 .5rem 0 1.5rem"}}>{month}</Span>
                            <Icon i={dropIcon} onClick={toggleDropCalendar} faded fluid />
                        </div>
                        <div style={{alignItems: 'center'}}>
                            <Icon i={'today'} style={{borderRight: '2px solid black', paddingRight: '.5rem'}} faded />
                            <Icon i={'list'} style={{paddingLeft: '.5rem'}} faded />
                        </div>
                    </Row>
                    { dropCalendar }
                </Column>
            </header>
        );
    }
}
