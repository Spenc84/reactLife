import React from 'react';
import Animator from 'react-addons-css-transition-group';
import { Icon } from '../../../uiComponents/ui';

export default class ListHeader extends React.PureComponent {
    constructor(props) {
        super(props);

        this.switchToCalendarView = this.switchToCalendarView.bind(this);
    }

    render() {
        const { tasksSelected, resetSelectedTasks, toggleStarView, deleteTasks, toggleStarred, toggleCompleted, openScheduler } = this.props;

        console.log('RENDERED:  --- LISTHEADER ---'); // __DEV__
        return (
            <header className="list">

                <div className={`${tasksSelected?"":"hidden "}icons Row`}>
                    <Icon i={"arrow_back"} onClick={resetSelectedTasks} size={1.25}/>
                    <div className="functional icons">
                        <Icon i={'delete'} onClick={deleteTasks} />
                        <Icon i={'group_work'} />
                        <Icon i={'linear_scale'} />
                        <Icon i={'info'} />
                        <Icon i={'group_add'} />
                        <Icon i={'schedule'} onClick={openScheduler} />
                        <Icon i={'star'} style={{color:'rgb(241,196,15)'}} onClick={toggleStarred} />
                        {/* <Icon i={'more_vert'} /> */}
                    </div>
                    <Icon i={'check_circle'} onClick={toggleCompleted} size={1.25} />
                </div>

                <div className={`${tasksSelected?"hidden ":""}default Row`}>
                    <Icon i={'today'} onClick={this.switchToCalendarView} size={1.25} />
                    <div style={{flexGrow: 1}}>
                        <span style={{margin: "0 .8rem 0 2.4rem", fontSize: "3.2rem"}}>Projects</span>
                    </div>
                    <Icon i={'star'} onClick={toggleStarView} size={1.25} light />
                </div>

            </header>
        );
    }

    switchToCalendarView() { this.props.changeSection('CALENDAR'); }

    verifyDelete() { console.log("verifyDelete()"); }
    openQuickScheduler() { console.log("openQuickScheduler()"); }
}
