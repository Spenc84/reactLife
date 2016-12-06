import './scheduler.styl';
import React from 'react';
import moment from 'moment';
import { Map, List, fromJS } from 'immutable';

import Modal from '../../uiComponents/modal/modal';
import ExpansionPanel from '../../uiComponents/expansionPanel/expansionPanel';
import { Button } from '../../uiComponents/ui';

import Duration from './duration';

// DEFAULTS
const PROPERTIES = {

    duration: {
        options: [
            { display: 'None', value: 0 },
            { display: '15 Minutes', value: 15 },
            { display: '30 Minutes', value: 30 },
            { display: '1 Hour', value: 60 },
            { display: '4 Hours', value: 240 },
            { display: '8 Hours', value: 480 },
            { display: '24 Hours', value: 1440 }
        ]
    },
    startTime: {
        options: [
            { display: 'None', value: 0 },
            { display: '15 Minutes', value: 15 },
            { display: '30 Minutes', value: 30 },
            { display: '1 Hour', value: 60 },
            { display: '4 Hours', value: 240 },
            { display: '8 Hours', value: 480 },
            { display: '24 Hours', value: 1440 }
        ]
    },
    softDeadline: {
        options: [
            { display: 'None', value: 0 },
            { display: '15 Minutes', value: 15 },
            { display: '30 Minutes', value: 30 },
            { display: '1 Hour', value: 60 },
            { display: '4 Hours', value: 240 },
            { display: '8 Hours', value: 480 },
            { display: '24 Hours', value: 1440 }
        ]
    },
    hardDeadline: {
        options: [
            { display: 'None', value: 0 },
            { display: '15 Minutes', value: 15 },
            { display: '30 Minutes', value: 30 },
            { display: '1 Hour', value: 60 },
            { display: '4 Hours', value: 240 },
            { display: '8 Hours', value: 480 },
            { display: '24 Hours', value: 1440 }
        ]
    },
    availability: {
        options: [
            { display: 'None', value: 0 },
            { display: '15 Minutes', value: 15 },
            { display: '30 Minutes', value: 30 },
            { display: '1 Hour', value: 60 },
            { display: '4 Hours', value: 240 },
            { display: '8 Hours', value: 480 },
            { display: '24 Hours', value: 1440 }
        ]
    }

};

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
        startTime: formatMoment(moment()),
        softDeadline: '',
        hardDeadline: '',
        availability: fromJS(availability)
    });
})();
const DEFAULT_DISPLAY = Map({
    duration: 'None',
    startTime: 'Now',
    softDeadline: 'None',
    hardDeadline: 'None',
    availability: 'Anytime'
});



export default class Scheduler extends React.PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            schedule: DEFAULT_SCHEDULE,
            display: DEFAULT_DISPLAY
        };

        this.openScheduler = this.openScheduler.bind(this);
        this.resetScheduler = this.resetScheduler.bind(this);

        this.toggleDurationModal = this.toggleDurationModal.bind(this);
        this.toggleStartTimeModal = this.toggleStartTimeModal.bind(this);
        this.toggleDeadlineModal = this.toggleDeadlineModal.bind(this);
        this.toggleAvailabilityModal = this.toggleAvailabilityModal.bind(this);
        this.scheduleTasks = this.scheduleTasks.bind(this);
        this.updateProperty = this.updateProperty.bind(this);
    }

    render() {
        const { schedule, display } = this.state;

        let body = [];
        for(let key in schedule.toJS()) {
            body.push((
                <ExpansionPanel
                    key={key}
                    label={key}
                    title={display.get(key)}
                    value={display.get(key)}
                >
                    <div className="custom row">

                    </div>

                    <div className="options row">
                    {
                        PROPERTIES[key].options.map(option=>(

                            <div className={`${key} option`}
                                onClick={this.updateProperty.bind(null, key, option)}
                                data-content={option.display}>

                                <div>{option.display}</div>

                            </div>

                        ))
                    }
                    </div>

                </ExpansionPanel>
            ));
        }

        return (
            <main className="Scheduler">
                <Modal ref={ref=>this.modal = ref}
                    onModalClose={this.resetScheduler}
                >
                    <header className="scheduler_header">
                        <span className="title">Schedule Tasks</span>
                        <Button light
                            label={'SAVE'}
                            title={'Schedule selected tasks'}
                            onClick={this.scheduleTasks}
                        />
                    </header>

                    <div className="scheduler_body">

                        <Duration
                            duration={schedule.get('duration')}
                            updateProperty={this.updateProperty}
                        />

                        { body }

                        {/* <div className="duration row" onClick={this.toggleDurationModal}>
                            <span>Duration</span>
                            <div className="value"> {display.get('duration')} </div>
                        </div>

                        <div className="startTime row" onClick={this.toggleStartTimeModal}>
                            <span>Start Time</span>
                            <div className="value"> {display.get('startTime')} </div>
                        </div>

                        <div className="softDeadline row" onClick={this.toggleDeadlineModal}>
                            <span>Soft Deadline</span>
                            <div className="value"> {display.get('softDeadline')} </div>
                        </div>

                        <div className="hardDeadline row" onClick={this.toggleDeadlineModal}>
                            <span>Hard Deadline</span>
                            <div className="value"> {display.get('hardDeadline')} </div>
                        </div>

                        <div className="availability row" onClick={this.toggleAvailabilityModal}>
                            <span>Availability</span>
                            <div className="value"> {display.get('availability')} </div>
                        </div> */}
                    </div>

                    {/* <footer>
                        <div className="save_button" onClick={this.scheduleTasks}> SAVE </div>
                    </footer> */}

                </Modal>
            </main>
        );
    }



    updateProperty(key, {value, display:optionDisplay}) {
        const { schedule, display } = this.state;
        this.setState({
            schedule: schedule.set(key, value),
            display: display.set(key, optionDisplay)
        });
    }

    openScheduler(schedule) {
        this.modal.openModal();
        schedule = schedule || DEFAULT_SCHEDULE;
        this.setState({ schedule });
    }

    resetScheduler() {
        this.setState({
            schedule: DEFAULT_SCHEDULE,
            display: DEFAULT_DISPLAY
        });
    }

    toggleDurationModal() { console.log("toggleDurationModal()"); }
    toggleStartTimeModal() { console.log("toggleStartTimeModal()"); }
    toggleDeadlineModal() { console.log("toggleDeadlineModal()"); }
    toggleAvailabilityModal() { console.log("toggleAvailabilityModal()"); }
    scheduleTasks() { console.log("scheduleTasks()"); }
}





// ----- HELPER FUNCTIONS -----
function formatMoment(time) {
    time = moment(time);
    return time.minute( Math.floor(time.minute() / 15) * 15 )
            .startOf('minute')
            .toJSON();
}


    // <!--__________________ ITEM MODALS __________________-->
    // <!-- Duration -->
    // <div className="duration modal" ng-if="durationModalFlag">
    //   <div className="top row" onClick={this.closeDurationModal()}>
    //     <span>Duration</span>
    //     <div className="duration item">{{scheduleNames.duration}}</div>
    //   </div><div className="spacer"></div>
    //   <!-- Defaults -->
    //   <div className="bottom row" ng-if="!customDurationFlag">
    //     <div className="duration item" onClick={this.setDuration(['None', 0])}>None</div>
    //     <div className="duration item" onClick={this.setDuration(['30 Minutes', 30])}>30 Minutes</div>
    //     <div className="duration item" onClick={this.setDuration(['1 Hour', 60])}>1 Hour</div>
    //     <div className="duration item" onClick={this.setDuration(['4 Hours', 240])}>4 Hours</div>
    //     <div className="duration item" onClick={this.setDuration(['Work Day', 480, 1])}>Work Day</div>
    //     <div className="duration item" onClick={this.setDuration(['Evening', 240, 2])}>Evening</div>
    //     <div className="duration item" onClick={this.setDuration(['All Day', 1440, 3])}>All Day</div>
    //     <div className="duration item" onClick={this.openCustomDuration()}>Custom</div>
    //   </div>
    //   <!-- Custom -->
    //   <div className="custom row" ng-if="customDurationFlag">
    //     <form name="custDurationForm" ng-submit="setCustomDuration(durationHours, durationMinutes)}>
    //       <span>Hours: <input type="number" id="hours" name="hours" ng-model="durationHours"
    //         value="0" min="0" max="24" required /></span>
    //       <div role="alert" style="color:red">
    //         <span className="error" ng-show="custDurationForm.hours.$error.min || custDurationForm.hours.$error.max || custDurationForm.hours.$error.required">
    //           Please pick a number between 0 and 24</span>
    //       </div>
    //       <span>Minutes: <input type="number" id="minutes" name="minutes" ng-model="durationMinutes"
    //         value="0" min="0" max="45" step="15" required /></span>
    //       <div role="alert" style="color:red">
    //         <span className="error" ng-show="custDurationForm.minutes.$error.min || custDurationForm.minutes.$error.max || custDurationForm.minutes.$error.required">
    //           Minutes should be 0, 15, 30, or 45</span>
    //       </div>
    //       <p><input type="submit" ng-disabled="custDurationForm.hours.$invalid || custDurationForm.minutes.$invalid" /></p>
    //     </form>
    //   </div>
    // </div>
    // <!-- Start Time -->
    // <div className="startTime modal" ng-if="startTimeModalFlag">
    //   <!-- Defaults -->
    //   <div className="top row" onClick={this.closeStartTimeModal()}>
    //       <span>Start Time</span>
    //       <div className="startTime item">{{scheduleNames.startTime}}</div>
    //   </div><div className="spacer"></div>
    //   <div className="bottom row" ng-if="!customDateFlag">
    //       <div className="startTime item" onClick={this.setStartTime(['Now', moment().startOf('hour')])}>Now</div>
    //       <div className="startTime item" ng-if="hour < 17" onClick={this.setStartTime(['Tonight', moment().hour(18).startOf('hour')])}>Tonight</div>
    //       <div className="startTime item" onClick={this.setStartTime(['Tomorrow', moment().add(1, 'day').hour(8).startOf('hour')])}>Tomorrow</div>
    //       <div className="startTime item" onClick={this.setStartTime(['Tomorrow Evening', moment().add(1, 'day').hour(18).startOf('hour')])}>Tomorrow Evening</div>
    //       <div className="startTime item" ng-if="day < 5" onClick={this.setStartTime(['This Weekend', moment().day(6).hour(8).startOf('hour')])}>This Weekend</div>
    //       <div className="startTime item" onClick={this.setStartTime(['Next Week', moment().add(1, 'week').day(1).hour(8).startOf('hour')])}>Next Week</div>
    //       <div className="startTime item" onClick={this.setStartTime(['Next Weekend', moment().add(1, 'week').day(6).hour(8).startOf('hour')])}>Next Weekend</div>
    //       <div className="startTime item" onClick={this.setStartTime(['Next Month', moment().add(1, 'month').date(1).hour(8).startOf('hour')])}>Next Month</div>
    //       <div className="startTime item" onClick={this.setStartTime(['Someday', ''])}>Someday</div>
    //       <div className="startTime item" onClick={this.openCustomDate()}>Custom</div>
    //   </div>
    //   <!-- Custom -->
    //   <div className="custom row" ng-if="customDateFlag">
    //     <form name="myForm" ng-submit="setCustomDate([moment(customDate).calendar(), moment(customDate)], true)}>
    //       <label for="customStartDateInput">Pick a date and time:</label>
    //       <input type="datetime-local" id="customStartDateInput" name="input" ng-model="customDate"
    //         min="{{minCustomDate}}" max="2020-12-31T00:00:00" step="900" required />
    //       <div role="alert" style="color:red">
    //         <span className="error" ng-show="myForm.input.$error.required">
    //           Required!</span>
    //         <span className="error" ng-show="myForm.input.$error.datetimelocal">
    //           Not a valid date!</span>
    //       </div>
    //       <p><input type="submit" ng-disabled="myForm.input.$invalid" /></p>
    //     </form>
    //   </div>
    // </div>
    // <!-- Deadline -->
    // <div className="deadline modal" ng-if="deadlineModalFlag">
    //   <div className="top row" onClick={this.toggleDeadlineModal()}>
    //       <span>Deadline is realative to start time</span>
    //       <div className="deadline item" ng-if="deadlineType == 'softDeadline'">{{scheduleNames.softDeadline}}</div>
    //       <div className="deadline item" ng-if="deadlineType == 'hardDeadline'">{{scheduleNames.hardDeadline}}</div>
    //   </div><div className="spacer"></div>
    //   <!-- Defaults -->
    //   <div className="bottom row" ng-if="!customDateFlag">
    //       <div className="deadline item" onClick={this.setDeadline(['None', ''])}>None</div>
    //       <div className="deadline item" ng-if="schedule.duration && !durationTemplate" onClick={this.setDeadline([scheduleNames.duration, tempDeadline.add(schedule.duration, 'minute')])}>{{scheduleNames.duration}}</div>
    //       <div className="deadline item" ng-if="startToday && schedule.startTime.moment.hour() < 17" onClick={this.setDeadline(['5:00 PM Today', tempDeadline.hour(17).startOf('hour')])}>5:00 PM Today</div>
    //       <div className="deadline item" ng-if="startToday" onClick={this.setDeadline(['Midnight', tempDeadline.add(1, 'day').startOf('day')])}>Midnight</div>
    //       <div className="deadline item" ng-if="startToday" onClick={this.setDeadline(['Midnight Tomorrow', tempDeadline.add(2, 'day').startOf('day')])}>Midnight Tomorrow</div>
    //       <div className="deadline item" ng-if="!startToday && schedule.startTime.moment.hour() < 17" onClick={this.setDeadline(['End of Workday', tempDeadline.hour(17).startOf('hour')])}>End of Workday</div>
    //       <div className="deadline item" ng-if="!startToday" onClick={this.setDeadline(['End of the Day', tempDeadline.add(1, 'day').startOf('day')])}>End of Day</div>
    //       <div className="deadline item" ng-if="!startToday" onClick={this.setDeadline(['End of Following Day', tempDeadline.add(2, 'day').startOf('day')])}>End of Following Day</div>
    //       <div className="deadline item" ng-if="schedule.startTime.moment.day() < 5 || (schedule.startTime.moment.day() === 5 && schedule.startTime.moment.hour() < 17)" onClick={this.setDeadline(['End of Workweek', tempDeadline.day(5).hour(17).startOf('hour')])}>End of Workweek</div>
    //       <div className="deadline item" onClick={this.setDeadline(['End of Week', tempDeadline.add(1, 'week').startOf('week')])}>End of Week</div>
    //       <div className="deadline item" onClick={this.setDeadline(['End of Month', tempDeadline.add(1, 'month').startOf('month')])}>End of Month</div>
    //       <div className="deadline item" onClick={this.openCustomDate()}>Custom</div>
    //   </div>
    //   <!-- Custom -->
    //   <div className="custom row" ng-if="customDateFlag">
    //     <form name="myForm" ng-submit="setCustomDate([moment(customDate).calendar(), moment(customDate)])}>
    //       <label for="customDeadlineInput">Pick a date and time:</label>
    //       <input type="datetime-local" id="customDeadlineInput" name="input" ng-model="customDate"
    //         min={{minCustomDate}} max="2020-12-31T00:00:00" step="900" required />
    //       <div role="alert" style="color:red">
    //         <span className="error" ng-show="myForm.input.$error.required">
    //           Required!</span>
    //         <span className="error" ng-show="myForm.input.$error.datetimelocal">
    //           Not a valid date!</span>
    //       </div>
    //       <p><input type="submit" ng-disabled="myForm.input.$invalid" /></p>
    //     </form>
    //   </div>
    // </div>
    // <!-- Availability -->
    // <div className="availability modal" ng-if="availabilityModalFlag">
    //   <div className="top row" onClick={this.toggleAvailabilityModal()}>
    //       <span>Availability</span>
    //       <div className="availability item">{{scheduleNames.availability}}</div>
    //   </div><div className="spacer"></div>
    //   <!-- Defaults -->
    //   <div className="bottom row" ng-if="!customAvailabilityFlag">
    //       <div className="availability item" onClick={this.setAvailability.anytime()}>Anytime</div>
    //       <div className="availability item" onClick={this.setAvailability.earlyBird()}>Early Bird</div>
    //       <div className="availability item" onClick={this.setAvailability.mornings()}>Mornings</div>
    //       <div className="availability item" onClick={this.setAvailability.daytime()}>Daytime</div>
    //       <div className="availability item" onClick={this.setAvailability.afternoon()}>Afternoon</div>
    //       <div className="availability item" onClick={this.setAvailability.evenings()}>Evenings</div>
    //       <div className="availability item" onClick={this.setAvailability._24x7()}>24x7</div>
    //       <div className="availability item" onClick={this.openCustomAvailability()}>Custom</div>
    //   </div>
    //   <!-- Custom -->
    //   <div className="custom row" ng-if="customAvailabilityFlag">
    //     <form name="custAvailabilityForm" ng-submit="setCustomAvailability()}>
    //       <span onClick={this.toggleDays()}>Days: </span>
    //       <div className="day checkbox items">
    //         S<input type="checkbox" name="sunday" ng-model="customAvailabilityDays[0]" />
    //         M<input type="checkbox" name="monday" ng-model="customAvailabilityDays[1]" />
    //         T<input type="checkbox" name="tuesday" ng-model="customAvailabilityDays[2]" />
    //         W<input type="checkbox" name="wednesday" ng-model="customAvailabilityDays[3]" />
    //         T<input type="checkbox" name="thursday" ng-model="customAvailabilityDays[4]" />
    //         F<input type="checkbox" name="friday" ng-model="customAvailabilityDays[5]" />
    //         S<input type="checkbox" name="saturday" ng-model="customAvailabilityDays[6]" />
    //       </div><br/>
    //       <span onClick={this.toggleHours(0,24)}>Hours: </span>
    //       <div className="hour checkbox items">
    //         <div className="am">
    //           <span onClick={this.toggleHours(0,12)}>AM</span>
    //           <div className="labels">
    //             <span onClick={this.toggleHours(0,6)}>12-5</span>
    //             <span onClick={this.toggleHours(6,12)}>6-11</span>
    //           </div>
    //           <div className="checkboxes">
    //             <input type="checkbox" ng-model="customAvailabilityHours[0]"/>
    //             <input type="checkbox" ng-model="customAvailabilityHours[1]"/>
    //             <input type="checkbox" ng-model="customAvailabilityHours[2]"/>
    //             <input type="checkbox" ng-model="customAvailabilityHours[3]"/>
    //             <input type="checkbox" ng-model="customAvailabilityHours[4]"/>
    //             <input type="checkbox" ng-model="customAvailabilityHours[5]"/><br/>
    //             <input type="checkbox" ng-model="customAvailabilityHours[6]"/>
    //             <input type="checkbox" ng-model="customAvailabilityHours[7]"/>
    //             <input type="checkbox" ng-model="customAvailabilityHours[8]"/>
    //             <input type="checkbox" ng-model="customAvailabilityHours[9]"/>
    //             <input type="checkbox" ng-model="customAvailabilityHours[10]"/>
    //             <input type="checkbox" ng-model="customAvailabilityHours[11]"/>
    //           </div>
    //         </div>
    //         <div className="pm">
    //           <span onClick={this.toggleHours(12,24)}>PM</span>
    //           <div className="labels">
    //             <span onClick={this.toggleHours(12,18)}>12-5</span>
    //             <span onClick={this.toggleHours(18,24)}>6-11</span>
    //           </div>
    //           <div className="checkboxes">
    //             <input type="checkbox" ng-model="customAvailabilityHours[12]"/>
    //             <input type="checkbox" ng-model="customAvailabilityHours[13]"/>
    //             <input type="checkbox" ng-model="customAvailabilityHours[14]"/>
    //             <input type="checkbox" ng-model="customAvailabilityHours[15]"/>
    //             <input type="checkbox" ng-model="customAvailabilityHours[16]"/>
    //             <input type="checkbox" ng-model="customAvailabilityHours[17]"/><br/>
    //             <input type="checkbox" ng-model="customAvailabilityHours[18]"/>
    //             <input type="checkbox" ng-model="customAvailabilityHours[19]"/>
    //             <input type="checkbox" ng-model="customAvailabilityHours[20]"/>
    //             <input type="checkbox" ng-model="customAvailabilityHours[21]"/>
    //             <input type="checkbox" ng-model="customAvailabilityHours[22]"/>
    //             <input type="checkbox" ng-model="customAvailabilityHours[23]"/>
    //           </div>
    //         </div>
    //       </div>
    //       <p><input type="submit" /></p>
    //     </form>
    //   </div>
    // </div>
    //
    // <!--_________________________________________________-->







// //the modal that allows you to quickly choose a time for your task
// export function scheduleTasksr(moment, dataSvc) {
//   return {
//     restrict: 'E',
//     template: require('./scheduleTasksr.html'),
//     link(scope, element, attrs, ctrl) {
//       scope.moment = moment;
//       scope.hour = moment().hour();
//       scope.day = moment().day();
//       console.log(scope.hour, scope.day); //testing
//       console.log(scope.task); //testing
//
//       // If one doesn't already exist, build a new schedule object
//       // which can then be assigned to a task
//       if(dataSvc.schedule) {
//         scope.schedule = dataSvc.schedule;
//         scope.scheduleNames = dataSvc.scheduleNames;
//       }
//       else createNewSchedule();
//
//       function createNewSchedule() {
//         scope.scheduleNames = {
//           duration: 'None',
//           startTime: 'Now',
//           softDeadline: 'None',
//           hardDeadline: 'None',
//           availability: 'Anytime'
//         };
//         let now = moment().startOf('hour');
//         scope.schedule = {
//           duration: 0,
//           startTime: {
//               moment: now,
//               top: (now.hour()*60)+5 },
//           softDeadline: '',
//           hardDeadline: '',
//           availability: []
//         };
//         scope.startToday = true;
//         // scope.schedule.availability is defined as an array of 7 elements which
//         // represent days. Each day element contains an array of 24 elements which
//         // represent the hours in each day. Each element in the hours array will
//         // be 'true' if that hour is available to complete the task, or false otherwise
//         for(let i = 0; i < 7; i++){
//           let hourArray = [];
//           for (let j = 0; j < 8; j++) { hourArray.push(false); }
//           for (let j = 8; j < 22; j++) { hourArray.push(true); }
//           for (let j = 22; j < 24; j++) { hourArray.push(false); }
//           scope.schedule.availability.push(hourArray);
//         }
//         console.log('schedule obj intialized: ', scope.schedule);
//         dataSvc.schedule = scope.schedule;
//         dataSvc.scheduleNames = scope.scheduleNames;
//       }
//
// ////////////////////////////////////////////////////////////////////////////////
// ////////////////////////////////  DURATION  ////////////////////////////////////
//       scope.toggleDurationModal = () => {
//         scope.durationModalFlag = !scope.durationModalFlag;
//       };
//       scope.closeDurationModal = () => {
//         scope.durationModalFlag = false;
//         scope.customDurationFlag = false;
//       };
//       scope.setDuration = value => {
//         scope.scheduleNames.duration = value[0];
//         scope.schedule.duration = value[1];
//         // If the user selected a duration template, then set the other schedule values
//         scope.durationTemplate = value[2] ? true : false;  // Referenced in deadline options
//         if(scope.durationTemplate){
//           scope.hour = moment().hour();
//           // Reset the hard deadline option
//           scope.scheduleNames.hardDeadline = 'None';
//           scope.schedule.hardDeadline = '';
//           // Update startTime, softDeadline, and availability fields based on template
//           scope.deadlineType = 'softDeadline';
//           switch(value[2]){
//             case 1: // Duration: Daytime (9am to 5pm)
//                 if(scope.hour < 17) {  // If it's before 5:00 pm
//                   let startName = (scope.hour < 9) ? '9:00 AM' : 'Now',
//                       startTime = (scope.hour < 9) ? moment().hour(9).startOf('hour') : moment().startOf('hour');
//                   scope.setStartTime([startName, startTime]);
//                   scope.setDeadline(['5:00 PM', moment().hour(17).startOf('hour')]);
//                 }
//                 else {  // If it's after 5:00 pm
//                   scope.setStartTime(['9:00 AM Tomorrow', moment().add(1, 'day').hour(9).startOf('hour')]);
//                   scope.setDeadline(['5:00 PM Tomorrow', moment().add(1, 'day').hour(17).startOf('hour')]);
//                 }
//                 scope.setAvailability.daytime();
//             break;
//             case 2: // Duration: Evening (6pm to 10pm)
//                 if(scope.hour < 22) {  // If it's before 10:00 pm
//                   let startName = (scope.hour < 18) ? '6:00 PM' : 'Now',
//                       startTime = (scope.hour < 18) ? moment().hour(18).startOf('hour') : moment().startOf('hour');
//                   scope.setStartTime([startName, startTime]);
//                   scope.setDeadline(['10:00 PM', moment().hour(22).startOf('hour')]);
//                 }
//                 else {  // If it's after 10:00 pm
//                   scope.setStartTime(['6:00 PM Tomorrow', moment().add(1, 'day').hour(18).startOf('hour')]);
//                   scope.setDeadline(['10:00 PM Tomorrow', moment().add(1, 'day').hour(22).startOf('hour')]);
//                 }
//                 scope.setAvailability.evenings();
//             break;
//             case 3: // Duration: All Day (8am - 10pm)
//                 if(scope.hour < 22) {  // If it's before 10:00 pm
//                   let startName = (scope.hour < 8) ? '8:00 AM' : 'Now',
//                       startTime = (scope.hour < 8) ? moment().hour(8).startOf('hour') : moment().startOf('hour');
//                   scope.setStartTime([startName, startTime]);
//                   scope.setDeadline(['10:00 PM', moment().hour(22).startOf('hour')]);
//                 }
//                 else {  // If it's after 10:00 pm
//                   scope.setStartTime(['8:00 AM Tomorrow', moment().add(1, 'day').hour(8).startOf('hour')]);
//                   scope.setDeadline(['10:00 PM Tomorrow', moment().add(1, 'day').hour(22).startOf('hour')]);
//                 }
//                 scope.setAvailability.anytime();
//             break;
//           }
//         }
//         console.log('duration updated: ', scope.schedule);
//         scope.closeDurationModal();
//       };
// ////////////////////////////////////////////////////////////////////////////////
//
// ////////////////////////////////////////////////////////////////////////////////
// ///////////////////////////////  START TIME  ///////////////////////////////////
//       scope.closeStartTimeModal = () => { scope.startTimeModalFlag = false; scope.customDateFlag = false; };
//       scope.toggleStartTimeModal = () => {
//         scope.startTimeModalFlag = !scope.startTimeModalFlag;
//       };
//
//       scope.setStartTime = value => {
//         let starting = scope.schedule.startTime;
//         scope.scheduleNames.startTime = value[0];  //Start Time's name value in string form (eg. 'Tomorrow')
//         starting.moment = value[1];  //Start Time's actual value (It should be a momentJS date object)
//         // If the user chooses 'Someday' as the start time then disable the deadline options and reset them
//         if(!starting.moment){
//           scope.scheduleNames.softDeadline = 'None';
//           scope.scheduleNames.hardDeadline = 'None';
//           scope.schedule.softDeadline = '';
//           scope.schedule.hardDeadline = '';
//         }
//         // Else if the user chooses a valid start time, then set some variables for the deadline modal to use
//         else {
//           scope.startToday = starting.moment.isSame(moment(), 'day') ? true : false;
//           starting.top = starting.moment ? 5+(starting.moment.hour()*60)+(starting.moment.minute()) : undefined;
//           // ...and reset the deadline values if they've already been chosen and they're prior to the new start time
//           if(scope.schedule.softDeadline && scope.schedule.softDeadline.isBefore(starting.moment)){
//             scope.scheduleNames.softDeadline = 'None';
//             scope.schedule.softDeadline = '';
//           }
//           if(scope.schedule.hardDeadline && scope.schedule.hardDeadline.isBefore(starting.moment)){
//             scope.scheduleNames.hardDeadline = 'None';
//             scope.schedule.hardDeadline = '';
//           }
//         }
//         console.log('startTime updated: ', scope.schedule);
//         scope.closeStartTimeModal();  // Close the startTime modal
//       };
// ////////////////////////////////////////////////////////////////////////////////
//
// ////////////////////////////////////////////////////////////////////////////////
// ////////////////////////////////  DEADLINE  ////////////////////////////////////
//       scope.toggleDeadlineModal = (type) => {
//         let starting = scope.schedule.startTime;
//         if(type && starting.moment) {
//           scope.deadlineType = type; // softDeadline or hardDeadline
//           scope.startToday = starting.moment.isSame(moment(), 'day') ? true : false;
//           scope.tempDeadline = starting.moment.clone();
//           scope.deadlineModalFlag = true;
//         } else { scope.deadlineModalFlag = false; scope.customDateFlag = false; }
//       };
//       scope.setDeadline = value => {
//         scope.scheduleNames[scope.deadlineType] = value[0];
//         scope.schedule[scope.deadlineType] = value[1];
//         console.log(`${scope.deadlineType} updated: ${scope.schedule[scope.deadlineType]}`);
//         scope.toggleDeadlineModal();
//       };
// ////////////////////////////////////////////////////////////////////////////////
//
// ////////////////////////////////////////////////////////////////////////////////
// //////////////////////////////  AVAILABILITY  //////////////////////////////////
//       scope.toggleAvailabilityModal = () => {
//         scope.availabilityModalFlag = !scope.availabilityModalFlag;
//       };
//
//       scope.setAvailability = {};
//       // Anytime (8am to 10pm)
//       scope.setAvailability.anytime = () => {
//         scope.scheduleNames.availability = 'Anytime';
//         let arrayOfDays = [];
//         for(let i = 0; i < 7; i++){
//           let arrayOfHours = [];
//           for (let j = 0; j < 8; j++) { arrayOfHours.push(false); }
//           for (let j = 8; j < 22; j++) { arrayOfHours.push(true); }
//           for (let j = 22; j < 24; j++) { arrayOfHours.push(false); }
//           arrayOfDays.push(arrayOfHours);
//         }
//         scope.schedule.availability = arrayOfDays;
//         scope.availabilityModalFlag = false;
//       };
//       // Early Bird (6am to 8am)
//       scope.setAvailability.earlyBird = () => {
//         scope.scheduleNames.availability = 'Early Bird';
//         let arrayOfDays = [];
//         for(let i = 0; i < 7; i++){
//           let arrayOfHours = [];
//           for (let j = 0; j < 6; j++) { arrayOfHours.push(false); }
//           for (let j = 6; j < 8; j++) { arrayOfHours.push(true); }
//           for (let j = 8; j < 24; j++) { arrayOfHours.push(false); }
//           arrayOfDays.push(arrayOfHours);
//         }
//         scope.schedule.availability = arrayOfDays;
//         scope.availabilityModalFlag = false;
//       };
//       // Mornings (6am to 12pm)
//       scope.setAvailability.mornings = () => {
//         scope.scheduleNames.availability = 'Mornings';
//         let arrayOfDays = [];
//         for(let i = 0; i < 7; i++){
//           let arrayOfHours = [];
//           for (let j = 0; j < 6; j++) { arrayOfHours.push(false); }
//           for (let j = 6; j < 12; j++) { arrayOfHours.push(true); }
//           for (let j = 12; j < 24; j++) { arrayOfHours.push(false); }
//           arrayOfDays.push(arrayOfHours);
//         }
//         scope.schedule.availability = arrayOfDays;
//         scope.availabilityModalFlag = false;
//       };
//       // Daytime (9am to 5pm)
//       scope.setAvailability.daytime = () => {
//         scope.scheduleNames.availability = 'Daytime';
//         let arrayOfDays = [];
//         for(let i = 0; i < 7; i++){
//           let arrayOfHours = [];
//           for (let j = 0; j < 9; j++) { arrayOfHours.push(false); }
//           for (let j = 9; j < 17; j++) { arrayOfHours.push(true); }
//           for (let j = 17; j < 24; j++) { arrayOfHours.push(false); }
//           arrayOfDays.push(arrayOfHours);
//         }
//         scope.schedule.availability = arrayOfDays;
//         scope.availabilityModalFlag = false;
//       };
//       // Afternoon (12pm to 6pm)
//       scope.setAvailability.afternoon = () => {
//         scope.scheduleNames.availability = 'Afternoon';
//         let arrayOfDays = [];
//         for(let i = 0; i < 7; i++){
//           let arrayOfHours = [];
//           for (let j = 0; j < 12; j++) { arrayOfHours.push(false); }
//           for (let j = 12; j < 18; j++) { arrayOfHours.push(true); }
//           for (let j = 18; j < 24; j++) { arrayOfHours.push(false); }
//           arrayOfDays.push(arrayOfHours);
//         }
//         scope.schedule.availability = arrayOfDays;
//         scope.availabilityModalFlag = false;
//       };
//       // Evenings (6pm to 10pm)
//       scope.setAvailability.evenings = () => {
//         scope.scheduleNames.availability = 'Evenings';
//         let arrayOfDays = [];
//         for(let i = 0; i < 7; i++){
//           let arrayOfHours = [];
//           for (let j = 0; j < 18; j++) { arrayOfHours.push(false); }
//           for (let j = 18; j < 22; j++) { arrayOfHours.push(true); }
//           for (let j = 22; j < 24; j++) { arrayOfHours.push(false); }
//           arrayOfDays.push(arrayOfHours);
//         }
//         scope.schedule.availability = arrayOfDays;
//         scope.availabilityModalFlag = false;
//       };
//       // 24x7 (12am to 12am the follow day)
//       scope.setAvailability._24x7 = () => {
//         scope.scheduleNames.availability = '24x7';
//         let arrayOfDays = [];
//         for(let i = 0; i < 7; i++){
//           let arrayOfHours = [];
//           for (let j = 0; j < 24; j++) { arrayOfHours.push(true); }
//           arrayOfDays.push(arrayOfHours);
//         }
//         scope.schedule.availability = arrayOfDays;
//         scope.availabilityModalFlag = false;
//       };
//
// ////////////////////////////////////////////////////////////////////////////////
//
// ////////////////////////////////////////////////////////////////////////////////
// /////////////////////////////// CUSTOM MODALS //////////////////////////////////
// scope.openCustomDuration = () => {
//   scope.customDurationFlag = true;
//   scope.durationHours = 0;
//   scope.durationMinutes = 0;
// };
// scope.setCustomDuration = (hours, minutes) => {
//   let str, value = (hours*60)+minutes;
//   if(hours){
//     hours += minutes/60;
//     str = `${hours} Hour`;
//     if(hours !== 1) str += `s`; }
//   else if(minutes) str = `${minutes} Minutes`;
//   else str = `None`;
//   scope.setDuration([str, value]);
// };
// scope.openCustomDate = () => {
//   let minute = moment().minute();
//   while(minute%15 !== 0) {minute--;}
//   scope.customDate = new Date(moment().minute(minute).startOf('minute'));
//   scope.minCustomDate = moment(scope.customDate).toJSON();
//   scope.customDateFlag = true;
// };
// scope.setCustomDate = (value, customStartDate) => {
//   if(customStartDate) scope.setStartTime(value);
//   else scope.setDeadline(value);
// };
// scope.openCustomAvailability = () => {
//   scope.customAvailabilityFlag = true;
//   scope.customAvailabilityDays = [];
//   for (let i = 0; i < 7; i++) { scope.customAvailabilityDays[i] = true; }
//   scope.customAvailabilityHours = [];
//   for (let i = 0; i < 24; i++) { scope.customAvailabilityHours[i] = false; }
//   scope.toggleDays = () => { for (let i = 0; i < 7; i++) { scope.customAvailabilityDays[i] = !scope.customAvailabilityDays[i]; } };
//   scope.toggleHours = (x,y) => { for (let i = x; i < y; i++) { scope.customAvailabilityHours[i] = !scope.customAvailabilityHours[i]; } };
// };
// scope.setCustomAvailability = () => {
//   scope.scheduleNames.availability = 'Custom';
//   let days = scope.customAvailabilityDays,
//       hours = scope.customAvailabilityHours,
//       schedule = scope.schedule.availability;
//   for (let i = 0; i < 7; i++) { if(days[i]) schedule[i] = hours.slice(); }
//   scope.customAvailabilityFlag = false;
//   scope.availabilityModalFlag = false;
// };
// ////////////////////////////////////////////////////////////////////////////////
//
// ////////////////////////////////////////////////////////////////////////////////
// /////////////////////////////////  SUBMIT  /////////////////////////////////////
//       scope.scheduleTasks = () => {
//         let {startTime, softDeadline, hardDeadline} = scope.schedule,
//             scheduled = startTime.moment ? true : false,
//             startsNow = scheduled ? startTime.moment.isSameOrBefore(moment()) : false,
//             active = scheduled ? startsNow : false,
//             pending = scheduled ? !startsNow : false,
//             inactive = !scheduled,
//             taskIds = [],
//             keysToChange = 'schedule,status.active,status.pending,status.scheduled,status.inactive',
//             newValues = [scope.schedule, active, pending, scheduled, inactive];
//
//         if(scope.task){
//           scope.task.schedule = scope.schedule;
//           scope.task.scheduleNames = scope.scheduleNames;
//           scope.task.status.active = active;
//           scope.task.status.pending = pending;
//           scope.task.status.scheduled = scheduled;
//           scope.task.status.inactive = inactive;
//           taskIds.push(scope.task._id);
//         }
//         else for (let i = 0; i < scope.tasks.length; i++) {
//           if(scope.tasks[i].status.editable) {
//             scope.tasks[i].schedule = scope.schedule;
//             scope.tasks[i].status.active = active;
//             scope.tasks[i].status.pending = pending;
//             scope.tasks[i].status.scheduled = scheduled;
//             scope.tasks[i].status.inactive = inactive;
//             taskIds.push(scope.tasks[i]._id);
//           }
//         }
//
//         console.log("-----Sent to Backend-----");
//         console.log("taskIds: ", taskIds);
//         console.log("keysToChange: ", keysToChange);
//         console.log("newValues: ", newValues);
//         dataSvc.editTasks(taskIds, keysToChange, newValues).then(
//           function( res ){ console.log("item(s) saved", res); },
//           function( err ){ console.log("Error while saving: ", err); }
//         );
//         createNewSchedule();
//         scope.closeQuickScheduler(true);
//       };
// ////////////////////////////////////////////////////////////////////////////////
//     }
//   };
// } scheduleTasksr.$inject = [`moment`, `dataSvc`];
