import React from 'react';

import SplashSection from './views/splash/SplashSection';
import CalendarSection from './views/calendar/CalendarSection';
import ListSection from './views/list/ListSection';

import Scheduler from './components/scheduler/scheduler';

export default class Main extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            activeSection: "SPLASH"
        };

        this.changeSection = this.changeSection.bind(this);
        this.openScheduler = this.openScheduler.bind(this);
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
                        {...this.props} />
                </section>

                <section style={(activeSection === "LIST") ? null : {display: "none"}}>
                    <ListSection
                        active={(activeSection === "LIST")}
                        changeSection={this.changeSection}
                        openScheduler={this.openScheduler}
                        {...this.props} />
                </section>

                <Scheduler ref={ ref => this.Scheduler = ref } />

            </main>
        );
	}

    changeSection(activeSection) {
        this.setState({ activeSection });
    }

    openScheduler() {
        this.Scheduler.openScheduler();
    }
}
