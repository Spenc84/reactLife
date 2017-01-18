import React from 'react';

import SplashSection from './views/splash/SplashSection';
import CalendarSection from './views/calendar/CalendarSection';
import ListSection from './views/list/ListSection';

import ScheduleModal from './components/scheduler/scheduleModal';
import TaskDetails from './components/taskDetails/taskDetails';

export default class Main extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            activeSection: "SPLASH"
        };

        this.changeSection = this.changeSection.bind(this);
        this.openScheduler = this.openScheduler.bind(this);
        this.openTaskDetails = this.openTaskDetails.bind(this);
        this.modifySelected = this.modifySelected.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        if(nextProps.authenticated && !this.props.authenticated) this.setState({activeSection: 'CALENDAR'})
    }

	render() {
        const { activeSection } = this.state;

        return (
            <main id="app_container">

                <section style={(activeSection === "SPLASH") ? null : {display: "none"}}>
                    <SplashSection
                        active={(activeSection === "SPLASH")}
                        changeSection={this.changeSection}
                        {...this.props} />
                </section>

                <section style={(activeSection === "CALENDAR") ? null : {display: "none"}}>
                    <CalendarSection
                        active={(activeSection === "CALENDAR")}
                        changeSection={this.changeSection}
                        openTaskDetails={this.openTaskDetails}
                        {...this.props} />
                </section>

                <section style={(activeSection === "LIST") ? null : {display: "none"}}>
                    <ListSection ref={ref => this.ListSection = ref}
                        active={(activeSection === "LIST")}
                        changeSection={this.changeSection}
                        openScheduler={this.openScheduler}
                        openTaskDetails={this.openTaskDetails}
                        {...this.props} />
                </section>

                <ScheduleModal ref={ ref => this.ScheduleModal = ref }
                    updateTasks={this.props.api.updateTasks} />

                <TaskDetails ref={ ref => this.TaskDetails = ref }
                    createNewTask={this.props.api.createNewTask}
                    updateTasks={this.props.api.updateTasks}
                    deleteTasks={this.props.api.deleteTasks}
                    modifySelected={this.modifySelected} />

            </main>
        );
	}

    changeSection(activeSection) {
        this.setState({ activeSection });
    }

    modifySelected(props) {
        this.ListSection.modifySelected(props);
    }

    openScheduler(selectedTasks, schedule) {
        this.ScheduleModal.openScheduler(selectedTasks, schedule);
    }

    openTaskDetails(props) {
        this.TaskDetails.open(props);
    }
}
