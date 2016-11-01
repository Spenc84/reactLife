import React from 'react';
import Animator from 'react-addons-css-transition-group';
import { Icon } from '../../../uiComponents/ui';

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
        const { tasksSelected, resetSelectedTasks, toggleStarView } = this.props;

        console.log('RENDERED:  --- LISTHEADER ---'); // __DEV__
        return (
            <header className="list">

                <div className={`${tasksSelected?"":"hidden "}icon Row`}>
                    <Icon i={"arrow_back"} onClick={resetSelectedTasks} size={1.75}/>
                    <div className="functional icons">
                        <Icon i={'delete'} onClick={this.verifyDelete} />
                        <Icon i={'group_work'} />
                        <Icon i={'linear_scale'} />
                        <Icon i={'info'} />
                        <Icon i={'group_add'} />
                        <Icon i={'schedule'} onClick={this.openQuickScheduler} />
                        <Icon i={'star'} style={{color:'rgb(241,196,15)'}} onClick={this.toggleStarred} />
                        {/* <Icon i={'more_vert'} /> */}
                    </div>
                    <Icon i={'check_circle'} onClick={this.toggleCompleted} size={1.75} />
                </div>

                <div className={`${tasksSelected?"hidden ":""}default Row`}>
                    <Icon i={'today'} onClick={this.switchToCalendarView} />
                    <div style={{flexGrow: 1}}>
                        <span style={{margin: "0 .5rem 0 1.5rem", fontSize: "2rem"}}>Projects</span>
                    </div>
                    <Icon i={'star'} onClick={toggleStarView} light />
                </div>

            </header>
        );
    }

    switchToCalendarView() { this.props.changeSection('CALENDAR'); }

    verifyDelete() { console.log("verifyDelete()"); }
    openQuickScheduler() { console.log("openQuickScheduler()"); }
    toggleStarred() {
        const { updateTasks } = this.props;
        // updateTasks({"status.starred": })
    }
    toggleCompleted() { console.log("toggleCompleted()"); }
}
