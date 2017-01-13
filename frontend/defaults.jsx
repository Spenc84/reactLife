import { Map, List, fromJS } from 'immutable';

// Sky blue
const DEFAULT_TASK_COLOR = '#0078ff';

// SUN-SAT - 8am-9pm
const DEFAULT_AVAILABILITY = (()=>{
    let availability = [];
    for(let i=0;i<7;i++) {
        let day = [];
        for(let j=0;j<8;j++) day.push(false);
        for(let j=8;j<21;j++) day.push(true);
        for(let j=21;j<24;j++) day.push(false);
        availability.push(day);
    }
    return fromJS(availability);
})();

const DEFAULT_SCHEDULE = Map({
    duration: 0,
    scheduledTime: '',
    startTime: '',
    softDeadline: '',
    hardDeadline: '',
    availability: DEFAULT_AVAILABILITY
});

const DEFAULT_TASK = Map({
    title: '',
    color: DEFAULT_TASK_COLOR,
    description: '',
    users: List(),
    schedule: DEFAULT_SCHEDULE
});

export {
    DEFAULT_TASK_COLOR,
    DEFAULT_AVAILABILITY,
    DEFAULT_SCHEDULE,
    DEFAULT_TASK
};
