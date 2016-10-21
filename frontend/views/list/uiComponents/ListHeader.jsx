import React from 'react';
import Animator from 'react-addons-css-transition-group';
import { Icon } from './ui';
import QueryBuilder from '../components/queryBuilder'

export default class ListHeader extends React.Component {
    constructor(props) {
        super(props);

        this.switchToCalendarView = this.switchToCalendarView.bind(this);
    }
    shouldComponentUpdate(nextProps, nextState) {
        return (true);
    }
    componentDidMount() {

    }
    render() {
        const { tasksSelected } = this.props;

        console.log('RENDERED:  --- LISTHEADER ---'); // __DEV__
        return (
            <header className="list">

                <div className="icon Row">

                </div>

                <div className={(tasksSelected)?"hideaway default Row":"default Row"}>
                    <div style={{flexGrow: 1}}>
                        <Icon i={'today'} onClick={this.switchToCalendarView} />
                        <span style={{margin: "0 .5rem 0 1.5rem", fontSize: "2rem"}}>Projects</span>
                    </div>
                    <Icon i={'star'} onClick={null} light />
                </div>

            </header>
        );
    }

    switchToCalendarView() { this.props.changeSection('CALENDAR'); }
}
