import './scheduler.styl';
import React from 'react';
import moment from 'moment';
import Immutable, { Map, List, fromJS } from 'immutable';

import Modal from '../../uiComponents/modal/modal';
import Accordian from '../../uiComponents/accordian';
import Select from '../../uiComponents/select/select';
import { Button } from '../../uiComponents/ui';

import { buildOperation } from '../../components/tools';

import OptionPane from './optionPane';

// DEFAULTS
const DEFAULT_SCHEDULE = (()=>{
    let availability = [];
    for(let i=0;i<7;i++) {
        let day = [];
        for(let j=0;j<8;j++) day.push(false);
        for(let j=8;j<22;j++) day.push(true);
        for(let j=22;j<24;j++) day.push(false);
        availability.push(day);
    }
    return Map({
        duration: 0,
        startTime: formatMoment(),
        softDeadline: '',
        hardDeadline: '',
        availability: fromJS(availability)
    });
})();

const MINUTES = [0, 15, 30, 45].map(x=>({value:x,display:x}));


// PLACEHOLDERS (unrelated to state)
let TASK_IDS, SCHEDULE, CALLBACK;


// PROPS: updateTasks
export default class ScheduleModal extends React.PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            schedule: DEFAULT_SCHEDULE
        };

        this.openScheduler = this.openScheduler.bind(this);
        this.resetScheduler = this.resetScheduler.bind(this);

        this.updateTasks = this.updateTasks.bind(this);
        this.updateDuration = this.updateDuration.bind(this);
        this.updateStartTime = this.updateStartTime.bind(this);
        this.updateSoftDeadline = this.updateSoftDeadline.bind(this);
        this.updateHardDeadline = this.updateHardDeadline.bind(this);
    }

    render() {
        const { schedule } = this.state;

        const DATA = List([
            this.getDuration(),
            this.getStartTime(),
            this.getSoftDeadline(),
            this.getHardDeadline()
        ]);

        return (
            <main className="Scheduler">
                <Modal ref={ref=>this.modal = ref} onModalClose={this.resetScheduler}>

                    <header className="scheduler_header">
                        <span className="title">Schedule Tasks</span>
                        <Button light
                            label={'SAVE'}
                            title={'Schedule selected tasks'}
                            onClick={this.updateTasks}
                            disabled={Immutable.is(schedule, SCHEDULE)}
                        />
                    </header>

                    <Accordian ref={ref=>this.accordian=ref} data={DATA} />

                </Modal>
            </main>
        );
    }



    openScheduler({selectedTasks, schedule, callback}) {
        TASK_IDS = selectedTasks;
        SCHEDULE = schedule || Map({});
        CALLBACK = callback;

        if( !Map.isMap(schedule) ) schedule = DEFAULT_SCHEDULE.set('startTime', formatMoment());

        this.accordian.reset();
        this.setState({ schedule });

        this.modal.open();
    }

    resetScheduler() {
        TASK_IDS = SCHEDULE = CALLBACK = undefined;
    }

    updateTasks() {
        const { schedule } = this.state;
        const { updateTasks } = this.props;

        const task = Map({schedule});
        const TASK = Map({schedule: SCHEDULE});
        const multiple = SCHEDULE.size === 0;

        const taskUpdate = {
            action: 'MODIFY',
            pendingTasks: TASK_IDS,
            operation: buildOperation(task, TASK, multiple)
        };

        const scheduleUpdate = {
            action: 'SCHEDULE',
            pendingTasks: TASK_IDS
        };

        updateTasks([taskUpdate, scheduleUpdate]);

        if(typeof CALLBACK === 'function') CALLBACK();
        this.modal.close();
    }

    getDuration() {
        const duration = this.state.schedule.get('duration');

        const durationDisplay
            =   (duration === 0) ? 'None'
            :   (duration < 60) ? `${duration} Minutes`
            :   (duration === 60) ? '1 Hour'
            :   `${duration / 60} Hours`;

        const DURATION_HOURS = (()=>{
            let hours = [];
            for(let i = 0; i<25; i++) hours.push({
                display: i,
                value: i*60 + duration%60
            });
            return hours;
        })();

        const DURATION_MINUTES = [0, 15, 30, 45].map(x=>{
            return {
                display: x,
                value: Math.floor(duration/60)*60 + x
            }
        });

        const DURATION_OPTIONS = [
            { display: 'None',          value: 0 },
            { display: '15 Minutes',    value: 15 },
            { display: '30 Minutes',    value: 30 },
            { display: '1 Hour',        value: 60 },
            { display: '4 Hours',       value: 240 },
            { display: '8 Hours',       value: 480 },
            { display: '24 Hours',      value: 1440 }
        ];

        return {
            className: "Duration",
            label: "Duration",
            title: "How long will it take?",
            display: durationDisplay,
            children: [
                <div key={1} className="custom row">

                    <div>
                        <span className="label"> Hours: </span>
                        <Select
                            display={Math.floor(duration / 60)}
                            options={DURATION_HOURS}
                            onChange={this.updateDuration}
                        />
                    </div>

                    <div>
                        <span className="label"> Minutes: </span>
                        <Select
                            display={duration % 60}
                            options={DURATION_MINUTES}
                            onChange={this.updateDuration}
                        />
                    </div>

                </div>,
                <OptionPane
                    key={2}
                    options={DURATION_OPTIONS}
                    updateProperty={this.updateDuration}
                />
            ]

        };
    }

    updateDuration(value) {
        const schedule = this.state.schedule.set('duration', parseInt(value));
        this.setState({ schedule });
    }

    getStartTime() {
        const startTime = this.state.schedule.get('startTime');

        const PM = moment(startTime).hour() > 11;
        const START_TIME_HOURS = (()=>{
            let hours = [];
            for(let i = 1; i<=12; i++) hours.push({
                display: i,
                value: moment(startTime).hour(PM?i+12:i).toJSON()
            });
            return hours;
        })();

        const START_TIME_MINUTES = [0, 15, 30, 45].map(x=>{
            return {
                display: x || '00',
                value: moment(startTime).minute(x).toJSON()
            }
        });

        const START_TIME_OPTIONS = [
            {   display: 'Now',
                value: formatMoment(moment())
            },
            {   display: 'Tonight',
                value: moment().hour(18).startOf('hour').toJSON(),
                hide: moment().hour() > 16
            },
            {   display: 'Tomorrow',
                value: moment().add(1, 'day').hour(8).startOf('hour').toJSON()
            },
            {   display: 'Tomorrow Evening',
                value: moment().add(1, 'day').hour(18).startOf('hour').toJSON()
            },
            {   display: 'This Weekend',
                value: moment().day(6).hour(8).startOf('hour').toJSON(),
                hide: moment().day() > 4
            },
            {   display: 'Next Week',
                value: moment().add(1, 'week').day(1).hour(8).startOf('hour').toJSON()
            },
            {   display: 'Next Weekend',
                value: moment().add(1, 'week').day(6).hour(8).startOf('hour').toJSON()
            },
            {   display: 'Next Month',
                value: moment().add(1, 'month').date(1).hour(8).startOf('hour').toJSON()
            },
            {   display: 'Someday',
                value: ''
            }
        ];

        const startTimeDisplay = (startTime)
            ?   startTime === formatMoment(moment())
                ?   'Now'
                :   moment(startTime).calendar()
            :   'Someday';

        const year = (startTime)
            ?   <div className="year value">
                    {moment(startTime).format('Y')}
                </div>
            :   <span>YEAR</span>;

        const date = (startTime)
            ?   <div className="date value">
                    {moment(startTime).format('ddd, MMM Do')}
                </div>
            :   <span>DATE</span>;

        const toggleAMPM = PM
            ? moment(startTime).subtract(12, 'hours').toJSON()
            : moment(startTime).add(12, 'hours').toJSON();

        const time = (startTime)
            ?   <div className="time">

                    <Select
                        display={moment(startTime).format('h')}
                        options={START_TIME_HOURS}
                        onChange={this.updateStartTime}
                    />

                    {' : '}

                    <Select
                        display={moment(startTime).format('mm')}
                        options={START_TIME_MINUTES}
                        onChange={this.updateStartTime}
                    />

                    <div className="fill column" onClick={this.updateStartTime.bind(null, toggleAMPM)}>
                        <span style={PM ? {opacity: .5} : null}>AM</span>
                        <span style={PM ? null : {opacity: .5}}>PM</span>
                    </div>

                </div>
            :   <span>TIME</span>;

        return {
            className: "StartTime",
            label: "Start Time",
            title: "When can you start?",
            display: startTimeDisplay,
            children: [
                <div key={1} className="custom row">

                    <div className="column">
                        {year}
                        {date}
                    </div>

                    {time}

                </div>,
                <OptionPane
                    key={2}
                    options={START_TIME_OPTIONS}
                    updateProperty={this.updateStartTime}
                />
            ]

        };
    }

    updateStartTime(value) {
        const schedule = value
            ?   this.state.schedule.set('startTime', value)
            :   this.state.schedule.withMutations(
                s => (
                    s.set('startTime', '')
                    .set('softDeadline', '')
                    .set('hardDeadline', '')
                )
            );
        this.setState({ schedule });
    }

    getSoftDeadline() {
        const startTime = this.state.schedule.get('startTime');
        const softDeadline = this.state.schedule.get('softDeadline');
        const hardDeadline = this.state.schedule.get('hardDeadline');

        const PM = moment(softDeadline).hour() > 11;
        const SOFT_DEADLINE_HOURS = (()=>{
            let hours = [];
            for(let i = 1; i<=12; i++) hours.push({
                display: i,
                value: moment(softDeadline).hour(PM?i+12:i).toJSON()
            });
            return hours;
        })();

        const SOFT_DEADLINE_MINUTES = [0, 15, 30, 45].map(x=>{
            return {
                display: x || '00',
                value: moment(softDeadline).minute(x).toJSON()
            }
        });

        const SOFT_DEADLINE_OPTIONS = [
            {   display: 'Now',
                value: formatMoment(moment())
            },
            {   display: 'Tonight',
                value: moment().hour(18).startOf('hour').toJSON(),
                hide: moment().hour() > 16
            },
            {   display: 'Tomorrow',
                value: moment().add(1, 'day').hour(8).startOf('hour').toJSON()
            },
            {   display: 'Tomorrow Evening',
                value: moment().add(1, 'day').hour(18).startOf('hour').toJSON()
            },
            {   display: 'This Weekend',
                value: moment().day(6).hour(8).startOf('hour').toJSON(),
                hide: moment().day() > 4
            },
            {   display: 'Next Week',
                value: moment().add(1, 'week').day(1).hour(8).startOf('hour').toJSON()
            },
            {   display: 'Next Weekend',
                value: moment().add(1, 'week').day(6).hour(8).startOf('hour').toJSON()
            },
            {   display: 'Next Month',
                value: moment().add(1, 'month').date(1).hour(8).startOf('hour').toJSON()
            },
            {   display: 'Someday',
                value: ''
            }
        ];

        const softDeadlineDisplay = (softDeadline)
            ?   softDeadline === formatMoment(moment())
                ?   'Now'
                :   moment(softDeadline).calendar()
            :   'None';

        const year = (softDeadline)
            ?   <div className="year value">
                    {moment(softDeadline).format('Y')}
                </div>
            :   <span>YEAR</span>;

        const date = (softDeadline)
            ?   <div className="date value">
                    {moment(softDeadline).format('ddd, MMM Do')}
                </div>
            :   <span>DATE</span>;

        const toggleAMPM = PM
            ? moment(softDeadline).subtract(12, 'hours').toJSON()
            : moment(softDeadline).add(12, 'hours').toJSON();

        const time = (softDeadline)
            ?   <div className="time">

                    <Select
                        display={moment(softDeadline).format('h')}
                        options={SOFT_DEADLINE_HOURS}
                        onChange={this.updateSoftDeadline}
                    />

                    {' : '}

                    <Select
                        display={moment(softDeadline).format('mm')}
                        options={SOFT_DEADLINE_MINUTES}
                        onChange={this.updateSoftDeadline}
                    />

                    <div className="fill column" onClick={this.updateSoftDeadline.bind(null, toggleAMPM)}>
                        <span style={PM ? {opacity: .5} : null}>AM</span>
                        <span style={PM ? null : {opacity: .5}}>PM</span>
                    </div>

                </div>
            :   <span>TIME</span>;

        return {
            className: "SoftDeadline",
            label: "Soft Deadline",
            title: startTime ? "When should task be completed by?" : "Please select a Start Time.",
            display: softDeadlineDisplay,
            disabled: !startTime,
            children: [
                <div key={1} className="custom row">

                    <div className="column">
                        {year}
                        {date}
                    </div>

                    {time}

                </div>,
                <OptionPane
                    key={2}
                    options={SOFT_DEADLINE_OPTIONS}
                    updateProperty={this.updateSoftDeadline}
                />
            ]

        };
    }

    updateSoftDeadline(value) {
        const schedule = this.state.schedule.set('softDeadline', value);
        this.setState({ schedule });
    }

    getHardDeadline() {
        const startTime = this.state.schedule.get('startTime');
        const softDeadline = this.state.schedule.get('softDeadline');
        const hardDeadline = this.state.schedule.get('hardDeadline');

        const PM = moment(hardDeadline).hour() > 11;
        const HARD_DEADLINE_HOURS = (()=>{
            let hours = [];
            for(let i = 1; i<=12; i++) hours.push({
                display: i,
                value: moment(hardDeadline).hour(PM?i+12:i).toJSON()
            });
            return hours;
        })();

        const HARD_DEADLINE_MINUTES = [0, 15, 30, 45].map(x=>{
            return {
                display: x || '00',
                value: moment(hardDeadline).minute(x).toJSON()
            }
        });

        const HARD_DEADLINE_OPTIONS = [
            {   display: 'Now',
                value: formatMoment(moment())
            },
            {   display: 'Tonight',
                value: moment().hour(18).startOf('hour').toJSON(),
                hide: moment().hour() > 16
            },
            {   display: 'Tomorrow',
                value: moment().add(1, 'day').hour(8).startOf('hour').toJSON()
            },
            {   display: 'Tomorrow Evening',
                value: moment().add(1, 'day').hour(18).startOf('hour').toJSON()
            },
            {   display: 'This Weekend',
                value: moment().day(6).hour(8).startOf('hour').toJSON(),
                hide: moment().day() > 4
            },
            {   display: 'Next Week',
                value: moment().add(1, 'week').day(1).hour(8).startOf('hour').toJSON()
            },
            {   display: 'Next Weekend',
                value: moment().add(1, 'week').day(6).hour(8).startOf('hour').toJSON()
            },
            {   display: 'Next Month',
                value: moment().add(1, 'month').date(1).hour(8).startOf('hour').toJSON()
            },
            {   display: 'Someday',
                value: ''
            }
        ];

        const hardDeadlineDisplay = (hardDeadline)
            ?   hardDeadline === formatMoment(moment())
                ?   'Now'
                :   moment(hardDeadline).calendar()
            :   'None';

        const year = (hardDeadline)
            ?   <div className="year value">
                    {moment(hardDeadline).format('Y')}
                </div>
            :   <span>YEAR</span>;

        const date = (hardDeadline)
            ?   <div className="date value">
                    {moment(hardDeadline).format('ddd, MMM Do')}
                </div>
            :   <span>DATE</span>;

        const toggleAMPM = PM
            ? moment(hardDeadline).subtract(12, 'hours').toJSON()
            : moment(hardDeadline).add(12, 'hours').toJSON();

        const time = (hardDeadline)
            ?   <div className="time">

                    <Select
                        display={moment(hardDeadline).format('h')}
                        options={HARD_DEADLINE_HOURS}
                        onChange={this.updateHardDeadline}
                    />

                    {' : '}

                    <Select
                        display={moment(hardDeadline).format('mm')}
                        options={HARD_DEADLINE_MINUTES}
                        onChange={this.updateHardDeadline}
                    />

                    <div className="fill column" onClick={this.updateHardDeadline.bind(null, toggleAMPM)}>
                        <span style={PM ? {opacity: .5} : null}>AM</span>
                        <span style={PM ? null : {opacity: .5}}>PM</span>
                    </div>

                </div>
            :   <span>TIME</span>;

        return {
            className: "HardDeadline",
            label: "Hard Deadline",
            title: startTime ? "When must task be completed by?" : "Please select a Start Time.",
            display: hardDeadlineDisplay,
            disabled: !startTime,
            children: [
                <div key={1} className="custom row">

                    <div className="column">
                        {year}
                        {date}
                    </div>

                    {time}

                </div>,
                <OptionPane
                    key={2}
                    options={HARD_DEADLINE_OPTIONS}
                    updateProperty={this.updateHardDeadline}
                />
            ]

        };
    }

    updateHardDeadline(value) {
        const schedule = this.state.schedule.set('hardDeadline', value);
        this.setState({ schedule });
    }
}





// ----- HELPER FUNCTIONS -----
function formatMoment(time) {
    time = time ? moment(time) : moment();
    return time.minute( Math.floor(time.minute() / 15) * 15 )
            .startOf('minute')
            .toJSON();
}
