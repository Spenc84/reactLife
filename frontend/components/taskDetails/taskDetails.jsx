import './taskDetails.styl';
import React, { PureComponent } from 'react';
import moment from 'moment';
import { Map, List, fromJS } from 'immutable';

// import Modal from '../../uiComponents/modal/modal';
// import Accordian from '../../uiComponents/accordian';
// import Select from '../../uiComponents/select/select';
import { Icon, Button, Text, TextArea } from '../../uiComponents/ui';
//
// import OptionPane from './optionPane';

// ----- PLACEHOLDERS -----
let TASK = Map();   // Original state of task
let CALLBACK;       // Callback function to be executed when task is successfully saved.

// PROPS: saveTask
export default class TaskDetails extends PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            task: TASK,
            open: false,
            readOnly: true
        };

        this.open = this.open.bind(this);
        this.close = this.close.bind(this);

        this.toggleEdit = this.toggleEdit.bind(this);
        this.handleFormChange = this.handleFormChange.bind(this);
        this.saveChanges = this.saveChanges.bind(this);
    }

    render() {
        const { task, open, readOnly } = this.state;

        const headerAction = readOnly
            ?   <Button light
                    label={'EDIT'}
                    title={'Edit task'}
                    onClick={this.toggleEdit}
                />
            :   <Button light
                    label={'SAVE'}
                    title={'Save changes'}
                    disabled={TASK === task}
                    onClick={TASK === task ? null : this.saveChanges}
                />

        return (
            <main className={`${open?'':'hidden '}TaskDetails`}>

                <header className="task_details">

                    <Icon i={"arrow_back"} onClick={this.close} size={1.25}/>
                    <span>Task Details</span>
                    {headerAction}

                </header>

                <div className="body">

                    <div className="title row">
                        <span className="label">Title:</span>
                        <Text
                            data-content="title"
                            value={task.get('title') || ""}
                            onChange={this.handleFormChange}
                            readOnly={readOnly}
                        />
                    </div>

                    <div className="description row">
                        <span className="label">Description:</span>
                        <TextArea
                            data-content="description"
                            value={task.get('description') || ""}
                            onChange={this.handleFormChange}
                            readOnly={readOnly}
                        />
                    </div>

                    <div className="color row">
                        <span className="label">Color:</span>
                        <input type="color"
                            data-content="color"
                            value={task.get('color') || '#0078ff'}
                            onChange={this.handleFormChange}
                            disabled={readOnly}
                        />
                    </div>

                </div>

            </main>
        );
    }

    open(task, callback) {
        TASK = task;
        CALLBACK = callback;
        this.setState({
            task: TASK,
            open: true
        });
    }

    close() {
        const { task, readOnly } = this.state;

        if(!readOnly && task !== TASK)
            if(!confirm("Discard changes?")) return;

        TASK = Map();
        CALLBACK = null;

        this.setState({
            task: TASK,
            open: false,
            readOnly: true
        });
    }

    toggleEdit() {
        this.setState({ readOnly: false });
    }

    handleFormChange(e) {
        const { task } = this.state;

        const field = e.target.dataset.content;
        const value = e.target.value;

        this.setState({
            task: task.set(field, value)
        });
    }

    saveChanges() {
        const { task } = this.state;
        const { saveTask } = this.props;

        saveTask(task);

        TASK = task;
        this.setState({ readOnly: true });
    }
}

{/* <div class="edit-item-pane container">

  <!-- ***** HEADER ***** -->
    <div class="edit-item-pane header">
      <!-- 1ST ROW - TOP LAYER: Title -->
      <div class="title row" style="background-color: {{task.color}}">
        <!-- Column 1 of 2 - 'close icon' and 'title' -->
        <div class="title column">
          <!-- close icon -->
          <div ng-click="toggleEditItemPane()">
            <i class="material-icons">close</i>
          </div>
          <!-- title -->
          <div>{{task.name}}</div>
        </div>
        <!-- Column 2 of 2 - save link -->
        <div class="title column">
          <button ng-click="saveTask(task); toggleEditItemPane()" ng-disabled="editItemForm.$invalid" form="editItemForm">SAVE</button>
        </div>
      </div>
    </div>

  <!-- ***** BODY ***** -->
    <div class="edit-item-pane body">
      <form id="editItemForm" name="editItemForm" novalidate>

        <!-- NAME row -->
        <div class="name form row">
          <span class="label">Name:</span>
          <input id="name" name="name" type="text" ng-model="task.name" autocomplete="off" autofocus required />
        </div>
        <!-- DESCRIPTION row -->
        <div class="description form row">
          <textarea ng-model="task.description" placeholder="Add description here..."></textarea>
          <!-- <div contenteditable>{{task.description}}</div> -->
        </div>
        <!-- SCHEDULE row -->
        <div class="togglable form row">
          <div class="title row">
            <span class="label" ng-click="toggleTempSchedule()">Schedule
              <i class="material-icons" ng-if="!tempScheduleFlag">arrow_drop_down</i>
              <i class="material-icons" ng-if="tempScheduleFlag">arrow_drop_up</i>
            </span>
            <button ng-if="tempScheduleFlag" ng-click="editSchedule()">EDIT</button>
          </div>
          <div class="toggleBox" ng-if="tempScheduleFlag" ng-click="toggleTempSchedule()">
            <div class="column">
              <span>Duration:</span>
              <span>Starts:</span>
              <span>Scheduled For:</span>
              <span>Soft Deadline:</span>
              <span>Hard Deadline:</span>
            </div>
            <div class="column">
              <span>{{task.scheduleNames.duration}}</span>
              <span>{{task.scheduleNames.startTime}}</span>
              <span>{{task.scheduleNames.startTime}}</span>
              <span>{{task.scheduleNames.softDeadline}}</span>
              <span>{{task.scheduleNames.hardDeadline}}</span>
            </div>
          </div>
        </div>
        <!-- AVAILABILITY row -->
        <div class="togglable form row">
          <div class="title row">
            <span class="label" ng-click="toggleViewAvailability()">Availability
              <i class="material-icons" ng-if="!viewAvailabilityFlag">arrow_drop_down</i>
              <i class="material-icons" ng-if="viewAvailabilityFlag">arrow_drop_up</i>
            </span>
            <button ng-if="viewAvailabilityFlag && !editAvailabilityFlag" ng-click="editAvailability()">EDIT</button>
            <button ng-if="viewAvailabilityFlag && editAvailabilityFlag" ng-click="saveAvailability()">SAVE</button>
          </div>
          <div class="availability toggleBox" ng-if="viewAvailabilityFlag">
            <div class="ghost" ng-if="!editAvailabilityFlag" ng-click="toggleViewAvailability()"></div>
            <div class="row r1">
              <div class="col r1c1" ng-click="toggleHours(0,24)" ng-if="editAvailabilityFlag"><span>ALL</span></div>
              <div class="col r1c2">
                <div class="row r1c2r1" ng-class="{spacer: !editAvailabilityFlag}">
                  <span ng-click="toggleDays(0)" ng-class="{locked: !tempDayArray[0]}">Sun</span>
                  <span ng-click="toggleDays(1)" ng-class="{locked: !tempDayArray[1]}">Mon</span>
                  <span ng-click="toggleDays(2)" ng-class="{locked: !tempDayArray[2]}">Tue</span>
                  <span ng-click="toggleDays(3)" ng-class="{locked: !tempDayArray[3]}">Wed</span>
                  <span ng-click="toggleDays(4)" ng-class="{locked: !tempDayArray[4]}">Thu</span>
                  <span ng-click="toggleDays(5)" ng-class="{locked: !tempDayArray[5]}">Fri</span>
                  <span ng-click="toggleDays(6)" ng-class="{locked: !tempDayArray[6]}">Sat</span>
                </div>
              </div>
            </div>
            <div class="row r2">
              <div class="col r2c1" ng-if="editAvailabilityFlag">
                <span ng-click="toggleHours(8,17)">D A Y</span><span ng-click="toggleHours(17,22)">E V E N I N G</span>
              </div>
              <div class="col r2c2">
                <span ng-click="toggleHours(0,1)">12am</span><span ng-click="toggleHours(1,2)">1am</span>
                <span ng-click="toggleHours(2,3)">2am</span><span ng-click="toggleHours(3,4)">3am</span>
                <span ng-click="toggleHours(4,5)">4am</span><span ng-click="toggleHours(5,6)">5am</span>
                <span ng-click="toggleHours(6,7)">6am</span><span ng-click="toggleHours(7,8)">7am</span>
                <span ng-click="toggleHours(8,9)">8am</span><span ng-click="toggleHours(9,10)">9am</span>
                <span ng-click="toggleHours(10,11)">10am</span><span ng-click="toggleHours(11,12)">11am</span>
                <span ng-click="toggleHours(12,13)">12pm</span><span ng-click="toggleHours(13,14)">1pm</span>
                <span ng-click="toggleHours(14,15)">2pm</span><span ng-click="toggleHours(15,16)">3pm</span>
                <span ng-click="toggleHours(16,17)">4pm</span><span ng-click="toggleHours(17,18)">5pm</span>
                <span ng-click="toggleHours(18,19)">6pm</span><span ng-click="toggleHours(19,20)">7pm</span>
                <span ng-click="toggleHours(20,21)">8pm</span><span ng-click="toggleHours(21,22)">9pm</span>
                <span ng-click="toggleHours(22,23)">10pm</span><span ng-click="toggleHours(23,24)">11pm</span>
              </div>
              <div class="col r2c3">
                <div class="row r2c3r1">
                  <div class="col r2c3r1c{{$index+1}}" ng-repeat="day in task.schedule.availability track by $index" ng-init="outerIndex = $index" ng-class="{locked: !tempDayArray[$index]}">
                    <div class="row r2c3r1c{{outerIndex+1}}r{{$index+1}}" ng-repeat="hour in day track by $index">
                      <input type="checkbox" ng-model="availabilityGrid[outerIndex][$index]" ng-disabled="!tempDayArray[outerIndex]">
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- COLOR row -->
        <div class="form row">
          <span class="label">Color:</span>
          <input id="color" name="color" type="color" ng-model="task.color" />
        </div>
        <!-- USERS row -->
        <div class="form row">
          <span class="label">Users:</span>
          <input id="users" name="users" type="text" ng-model="task.users" />
        </div>
        <!-- COMMENTS row -->
        <div class="form row">
          <span class="label">Comments:</span>
          <input id="comments" name="comments" type="textbox" ng-model="task.comments" />
        </div>

      </form>
    </div>

</div>

<!-- Overlaid option panes -->
<!-- <quick-scheduler ng-if="quickSchedulerFlag"></quick-scheduler> -->



////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////
//the form that allows you to fully edit an existing task
export function editItemPane(moment, dataSvc) {
    return {
        restrict: 'E',
        template: require('./editItemPane.html'),
        link(scope, element, attrs, ctrl) {
            scope.saveTask = (task) => {
                dataSvc.saveTask(task).then(
                    function(res){ console.log("saved", res); },
                    function(err){ console.log("error", err); }
                );
            };
            scope.toggleTempSchedule = () => {
                if(scope.tempScheduleFlag) scope.tempScheduleFlag = false;
                else {
                    let task = scope.task,
                        schedule = task.schedule,
                        duration;
                    if(schedule.duration >= 60){
                        duration = `${schedule.duration/60} Hour`;
                        if(schedule.duration > 60) duration += `s`;
                    } else duration = schedule.duration ? `${schedule.duration} Minutes` : `None`;
                    task.scheduleNames = {
                        duration,
                        startTime: schedule.startTime.moment ? moment(schedule.startTime.moment).calendar() : `None`,
                        softDeadline: schedule.softDeadline ? moment(schedule.softDeadline).calendar() : `None`,
                        hardDeadline: schedule.hardDeadline ? moment(schedule.hardDeadline).calendar() : `None`,
                        availability: `Custom`
                    };
                    scope.editSchedule = () => {
                        dataSvc.scheduleNames = {};
                        for(let i in task.scheduleNames){ dataSvc.scheduleNames[i] = task.scheduleNames[i]; }
                        dataSvc.schedule = {
                            duration: schedule.duration,
                            startTime: {
                                moment: schedule.startTime.moment ? moment(schedule.startTime.moment) : '',
                                top: schedule.startTime.top },
                            softDeadline: schedule.softDeadline ? moment(schedule.softDeadline) : '',
                            hardDeadline: schedule.hardDeadline ? moment(schedule.hardDeadline) : '',
                            availability: []
                        };
                        for (let i = 0; i < 7; i++) {
                            dataSvc.schedule.availability.push(schedule.availability[i].slice());
                        }
                        scope.openQuickScheduler();
                    };
                    scope.tempScheduleFlag = true;
                }
            };
            scope.toggleViewAvailability = () => {
                scope.editAvailabilityFlag = false;
                if(scope.viewAvailabilityFlag) scope.viewAvailabilityFlag = false;
                else {
                    let {availability} = scope.task.schedule;
                    scope.tempDayArray = [true, true, true, true, true, true, true];
                    scope.availabilityGrid = [];
                    for(let day in availability){ scope.availabilityGrid.push(availability[day].slice()); }
                    scope.viewAvailabilityFlag = true;
                    scope.editAvailability = () => {
                    scope.editAvailabilityFlag = true;
                    scope.toggleDays = (day) => { scope.tempDayArray[day] = !scope.tempDayArray[day]; };
                    scope.toggleHours = (x,y) => {
                        for (let i = 0; i < 7; i++)
                            if(scope.tempDayArray[i])
                            for (let j = x; j < y; j++)
                                scope.availabilityGrid[i][j] = !scope.availabilityGrid[i][j];
                    };
                    scope.saveAvailability = () => {
                        for(let day in scope.availabilityGrid){ availability[day] = scope.availabilityGrid[day].slice(); }
                        let taskIds = scope.task._id,
                            keysToChange = 'schedule.availability',
                            newValues = [scope.availabilityGrid];
                        dataSvc.editTasks(taskIds, keysToChange, newValues).then(
                            function( res ){ console.log("item(s) saved", res); },
                            function( err ){ console.log("Error while saving: ", err); }
                        );
                        scope.editAvailabilityFlag = false;
                    };
                  };
                }
            };
        }
    };
} editItemPane.$inject = [`moment`, `dataSvc`]; */}
