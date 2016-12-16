import moment from 'moment';
import { Map, List, fromJS } from 'immutable';


const DATA = Map({

    duration: {
        className: "Duration",
        label: "Duration",
        title: "How long will it take?",
        defaults: [
            { display: 'None',          value: 0 },
            { display: '15 Minutes',    value: 15 },
            { display: '30 Minutes',    value: 30 },
            { display: '1 Hour',        value: 60 },
            { display: '4 Hours',       value: 240 },
            { display: '8 Hours',       value: 480 },
            { display: '24 Hours',      value: 1440 }
        ]
    },

    startTime: {
        className: "StartTime",
        label: "Start Time",
        title: "When can you start?",
        defaults: [
            {   display: 'Now',
                get value() { return moment().minute(Math.floor(moment().minute()/15)*15).startOf('minute').toJSON(); }
            },
            {   display: 'Tonight',
                get value() { return moment().hour(18).startOf('hour').toJSON() },
                get hide() { return moment().hour() > 16 }
            },
            {   display: 'Tomorrow',
                get value() { return moment().add(1, 'day').hour(8).startOf('hour').toJSON() }
            },
            {   display: 'Tomorrow Evening',
                get value() { return moment().add(1, 'day').hour(18).startOf('hour').toJSON() }
            },
            {   display: 'This Weekend',
                get value() { return moment().day(6).hour(8).startOf('hour').toJSON() },
                get hide() { return moment().day() > 4 }
            },
            {   display: 'Next Week',
                get value() { return moment().add(1, 'week').day(1).hour(8).startOf('hour').toJSON() }
            },
            {   display: 'Next Weekend',
                get value() { return moment().add(1, 'week').day(6).hour(8).startOf('hour').toJSON() }
            },
            {   display: 'Next Month',
                get value() { return moment().add(1, 'month').date(1).hour(8).startOf('hour').toJSON() }
            },
            {   display: 'Someday',
                value: ''
            }
        ]
    },

    softDeadline: {
        className: "SoftDeadline",
        label: "Soft Deadline",
        title: "When should task be completed by?",
        defaults: deadlineDefaults
    },

    hardDeadline: {
        className: "HardDeadline",
        label: "Hard Deadline",
        title: "When must task be completed by?",
        defaults: deadlineDefaults
    }
});

export default function getData(property, {duration, startTime}) {

    const isDeadline = (property === 'softDeadline' || property === 'hardDeadline') && startTime;
    let xMoment, startToday, hour, day, deadlineDefaults = [];

    if(isDeadline) {

        xMoment = moment(startTime);
        startToday = xMoment.isSame(moment(), 'day');
        hour = xMoment.hour();
        day = xMoment.day();

        deadlineDefaults = [
            {   display: 'None',
                value: ''
            },
            {   display: 'After duration',
                value: xMoment.add(duration, 'minutes').toJSON(),
                hide: !duration
            },
            {   display: '5:00 PM Today',
                value: xMoment.hour(17).startOf('hour').toJSON(),
                hide: !(startToday && (hour + (duration/60)) < 17)
            },
            {   display: 'Midnight',
                value: xMoment.add(1, 'day').startOf('day').toJSON(),
                hide: !startToday
            },
            {   display: 'Midnight Tomorrow',
                value: xMoment.add(2, 'day').startOf('day').toJSON(),
                hide: !startToday
            },
            {   display: 'End of Workday',
                value: xMoment.hour(17).startOf('hour').toJSON(),
                hide: startToday || (hour + (duration/60)) >= 17
            },
            {   display: 'End of the Day',
                value: xMoment.add(1, 'day').startOf('day').toJSON(),
                hide: startToday
            },
            {   display: 'End of Following Day',
                value: xMoment.add(2, 'day').startOf('day').toJSON(),
                hide: startToday
            },
            {   display: 'End of Workweek',
                value: xMoment.day(5).hour(17).startOf('hour').toJSON(),
                hide: day === 6 || (day === 5 && (hour + (duration/60)) > 16)
            },
            {   display: 'End of Week',
                value: xMoment.add(1, 'week').startOf('week').toJSON()
            },
            {   display: 'End of Month',
                value: xMoment.add(1, 'week').startOf('week').toJSON()
            },
        ]
    }

    return {

        duration: {
            className: "Duration",
            label: "Duration",
            title: "How long will it take?",
            defaults: [
                { display: 'None',          value: 0 },
                { display: '15 Minutes',    value: 15 },
                { display: '30 Minutes',    value: 30 },
                { display: '1 Hour',        value: 60 },
                { display: '4 Hours',       value: 240 },
                { display: '8 Hours',       value: 480 },
                { display: '24 Hours',      value: 1440 }
            ]
        },

        startTime: {
            className: "StartTime",
            label: "Start Time",
            title: "When can you start?",
            defaults: [
                {   display: 'Now',
                    get value() { return moment().minute(Math.floor(moment().minute()/15)*15).startOf('minute').toJSON(); }
                },
                {   display: 'Tonight',
                    get value() { return moment().hour(18).startOf('hour').toJSON() },
                    get hide() { return moment().hour() > 16 }
                },
                {   display: 'Tomorrow',
                    get value() { return moment().add(1, 'day').hour(8).startOf('hour').toJSON() }
                },
                {   display: 'Tomorrow Evening',
                    get value() { return moment().add(1, 'day').hour(18).startOf('hour').toJSON() }
                },
                {   display: 'This Weekend',
                    get value() { return moment().day(6).hour(8).startOf('hour').toJSON() },
                    get hide() { return moment().day() > 4 }
                },
                {   display: 'Next Week',
                    get value() { return moment().add(1, 'week').day(1).hour(8).startOf('hour').toJSON() }
                },
                {   display: 'Next Weekend',
                    get value() { return moment().add(1, 'week').day(6).hour(8).startOf('hour').toJSON() }
                },
                {   display: 'Next Month',
                    get value() { return moment().add(1, 'month').date(1).hour(8).startOf('hour').toJSON() }
                },
                {   display: 'Someday',
                    value: ''
                }
            ]
        },

        softDeadline: {
            className: "SoftDeadline",
            label: "Soft Deadline",
            title: "When should task be completed by?",
            defaults: deadlineDefaults
        },

        hardDeadline: {
            className: "HardDeadline",
            label: "Hard Deadline",
            title: "When must task be completed by?",
            defaults: deadlineDefaults
        }
    }
}



export const softDeadline = {
    className: "SoftDeadline",
    label: "Soft Deadline",
    title: "When should task be completed by?",
    base: '',
    defaults:  [
        {
            display: 'Now',
            get value() { return moment().minute(Math.floor(moment().minute()/15)*15).startOf('minute').toJSON(); }
        },
        {
            display: 'Tonight',
            get value() { return moment().hour(18).startOf('hour').toJSON() },
            get hide() { return moment().hour() > 16 }
        },
        {
            display: 'Tomorrow',
            get value() { return moment().add(1, 'day').hour(8).startOf('hour').toJSON() }
        },
        {
            display: 'Tomorrow Evening',
            get value() { return moment().add(1, 'day').hour(18).startOf('hour').toJSON() }
        },
        {
            display: 'This Weekend',
            get value() { return moment().day(6).hour(8).startOf('hour').toJSON() },
            get hide() { return moment().day() > 4 }
        },
        {
            display: 'Next Week',
            get value() { return moment().add(1, 'week').day(1).hour(8).startOf('hour').toJSON() }
        },
        {
            display: 'Next Weekend',
            get value() { return moment().add(1, 'week').day(6).hour(8).startOf('hour').toJSON() }
        },
        {
            display: 'Next Month',
            get value() { return moment().add(1, 'month').date(1).hour(8).startOf('hour').toJSON() }
        },
        {
            display: 'Someday',
            value: ''
        }
    ]
};

export const hardDeadline = {
    className: "HardDeadline",
    label: "Hard Deadline",
    title: "When must task be completed by?",
    defaults: [
        {
            display: 'Now',
            get value() { return moment().minute(Math.floor(moment().minute()/15)*15).startOf('minute').toJSON(); }
        },
        {
            display: 'Tonight',
            get value() { return moment().hour(18).startOf('hour').toJSON() },
            get hide() { return moment().hour() > 16 }
        },
        {
            display: 'Tomorrow',
            get value() { return moment().add(1, 'day').hour(8).startOf('hour').toJSON() }
        },
        {
            display: 'Tomorrow Evening',
            get value() { return moment().add(1, 'day').hour(18).startOf('hour').toJSON() }
        },
        {
            display: 'This Weekend',
            get value() { return moment().day(6).hour(8).startOf('hour').toJSON() },
            get hide() { return moment().day() > 4 }
        },
        {
            display: 'Next Week',
            get value() { return moment().add(1, 'week').day(1).hour(8).startOf('hour').toJSON() }
        },
        {
            display: 'Next Weekend',
            get value() { return moment().add(1, 'week').day(6).hour(8).startOf('hour').toJSON() }
        },
        {
            display: 'Next Month',
            get value() { return moment().add(1, 'month').date(1).hour(8).startOf('hour').toJSON() }
        },
        {
            display: 'Someday',
            value: ''
        }
    ]
};
