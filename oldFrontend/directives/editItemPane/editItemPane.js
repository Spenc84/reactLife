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
} editItemPane.$inject = [`moment`, `dataSvc`];
