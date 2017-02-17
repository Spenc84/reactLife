import React from 'react';

import SplashSection from './views/splash/SplashSection';
import CalendarSection from './views/calendar/CalendarSection';
import ListSection from './views/list/ListSection';

import Picker from './components/picker/picker';
import ScheduleModal from './components/scheduler/scheduleModal';
import TaskDetails from './components/taskDetails/taskDetails';

export default class Main extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            activeSection: "SPLASH"
        };

        this.changeSection = this.changeSection.bind(this);
        this.openPicker = this.openPicker.bind(this);
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
                        openPicker={this.openPicker}
                        openScheduler={this.openScheduler}
                        openTaskDetails={this.openTaskDetails}
                        {...this.props} />
                </section>

                <Picker ref={ ref => this.Picker = ref } />

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

    modifySelected(callback1, callback2) {
        this.ListSection.modifySelected(callback1, callback2);
    }

    openPicker(save, available, existing) {
        this.Picker.open(save, available, existing);
    }

    openScheduler(selectedTasks, schedule) {
        this.ScheduleModal.openScheduler(selectedTasks, schedule);
    }

    openTaskDetails(props) {
        this.TaskDetails.open(props);
    }
}
