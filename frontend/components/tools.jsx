import moment from 'moment';
import { Map, List, fromJS } from 'immutable';
import { getUSER_ID } from '../lifeApp';


// Takes in an Array and returns a map object with { _id: 'array index') key-value pairs
export function Index(array) {
    if(List.isList(array)) array = array.toJS();
    let newMap = {};
    array.forEach((e,i)=>newMap[e._id] = i);
    return newMap;
}

/* Takes in the entire tasks list (or a subset thereof), and filters it using
    the passed in query object in the following format...
query = {
    rInclude: (array:string) An array of string values representing which key names in the status object to iterate over. Each item must return true for the task to be included in the resulting List.
    rExclude: (array:string) An array of string values representing which key names in the status object to iterate over. Each item must return false for the task to be included in the resulting List.
    include: (array:string) An array of string values representing which key names in the status object to iterate over. Any item may return true for the task to be included in the resulting List.
    exclude: (array:string) An array of string values representing which key names in the status object to iterate over. Any item may return false for the task to be included in the resulting List.
    search: (string) The title of an event must contain the search string for it to be included in the resulting List.
} */
export function filterTasks(list, query) {
    if(!List.isList(list) || list.size === 0) return List();
    if(typeof query !== 'object')  return List();
    if(!query.rInclude) query.rInclude = [];
    if(!query.rExclude) query.rExclude = [];
    if(!query.include) query.include = [];
    if(!query.exclude) query.exclude = [];
    if(!query.search) query.search = '';

    return list.map(
        task => {
            const status = task.get('status');
            const title = task.get('title').toLowerCase();

            return (
                query.rInclude.every(item=>status.get(item)) &&
                query.rExclude.every(item=>!status.get(item)) &&
                (
                    (query.include.length === 0 && query.exclude.length === 0) ||
                    query.include.some(item=>status.get(item)) ||
                    query.exclude.some(item=>!status.get(item))
                ) &&
                (
                    query.search === '' ||
                    title.indexOf(query.search.toLowerCase()) !== -1
                )
            );
        }
    );
}

export function buildOperation(task, TASK, multi) {
    let $set = {};
    let display = [];

    task.forEach( (value, key) => {
        if(value !== TASK.get(key)) {
            if(key === 'schedule') {
                value.forEach( (value, key) => {
                    const VALUE = TASK.getIn(['schedule', key]);
                    if(VALUE !== value) {
                        $set[`schedule.${key}`] = value;

                        if(key === 'startTime') {
                            $set['status.scheduled'] = !!value;
                            $set['status.inactive'] = !value;
                            $set['status.active'] = moment().isSameOrAfter(value);
                            $set['status.pending'] = moment().isBefore(value);
                        }

                        // Format values into readable english for the changeLog
                        let oldDisp, newDisp;
                        if(key === 'duration') {

                            oldDisp =   (VALUE === 0) ? 'None'
                                :   (VALUE < 60) ? `${VALUE} Minutes`
                                :   (VALUE === 60) ? '1 Hour'
                                :   `${VALUE / 60} Hours`;
                            newDisp =   (value === 0) ? 'None'
                                :   (value < 60) ? `${value} Minutes`
                                :   (value === 60) ? '1 Hour'
                                :   `${value / 60} Hours`;
                        }
                        else {
                            oldDisp = VALUE ? moment(VALUE).toString() : 'Someday';
                            newDisp = value ? moment(value).toString() : 'Someday';
                        }

                        if(multi) display.push(`Changed ${key.toUpperCase()} to '${newDisp}'`);
                        else display.push(`Changed ${key.toUpperCase()} from '${oldDisp}' to '${newDisp}'`);
                    }
                });
            }
            else if(key === 'status') {
                value.forEach( (value, key) => {
                    const VALUE = TASK.getIn(['status', key]);
                    if(VALUE !== value) {
                        $set[`status.${key}`] = value;
                        display.push(`Changed ${key.toUpperCase()} STATUS from '${VALUE}' to '${value}'`);
                    }
                });
            }
            else {
                $set[key] = value;
                display.push(`Changed ${key.toUpperCase()} from '${TASK.get(key)}' to '${value}'`);
            }
        }
    });

    const $push = {
        changeLog: {
            date: moment().toJSON(),
            user: getUSER_ID(),
            display: display.join('\n')
        }
    };

    return { $set, $push };
}


////////////////////   MUTATOR FUNCTIONS   ////////////////////
////////// TASK //////////
export function buildTaskList(TASKS, selectedTasks, operation) {
    return TASKS
        .filter( task => selectedTasks.indexOf(task.get('_id')) !== -1 )
        .map( task => task.withMutations( task => {
            for(let key in operation['$set']) {
                task.setIn(key.split('.'), operation['$set'][key]);
            }
            task.update('changeLog', value => value.push(operation['$push']['changeLog']));
        }));
}

////////// TASK LIST //////////
export function addTaskToList(list, task) {
    list.push(task);
}
export function addTaskToParents(list, task, tIndx) {
    task.get('parentTasks').forEach(
        ID => list.updateIn(
            [tIndx[ID], 'childTasks'],
            value => value.push( task.get('_id') )
        )
    );
}
export function addTaskToChildren(list, task, tIndx) {
    task.get('childTasks').forEach(
        ID => list.updateIn(
            [tIndx[ID], 'parentTasks'],
            value => value.push( task.get('_id') )
        )
    );
}

export function updateTaskOnList(list, task, tIndx) {
    list.set( tIndx[ task.get('_id') ], task );
}

export function removeTaskFromParents(list, task, tIndx) {
    task.get('parentTasks').forEach( ID => {
        const index = list.getIn([tIndx[ID], 'childTasks']).indexOf(task.get('_id'));
        if(index !== -1) list.deleteIn([tIndx[ID], 'childTasks', index]);
    });
}
export function removeTaskFromChildren(list, task, tIndx) {
    task.get('childTasks').forEach( ID => {
        const index = list.getIn([tIndx[ID], 'parentTasks']).indexOf(task.get('_id'));
        if(index !== -1) list.deleteIn([tIndx[ID], 'parentTasks', index]);
    });
}
export function removeTasksFromList(TASKS, selectedTasks, tIndx) {

    return TASKS.withMutations( list => {
        selectedTasks.forEach( taskID => {
            const task = TASKS.get( tIndx[taskID] );
            removeTaskFromParents(list, task, tIndx);
            removeTaskFromChildren(list, task, tIndx);
        });
    })
    .filter( task => selectedTasks.indexOf(task.get('_id')) === -1 );
}

////////// SCHEDULE //////////
export function addTaskToSchedule(schedule, task) {
    const taskID = task.get('_id');

    const time = {
        scheduled: task.getIn(['schedule', 'scheduledTime']),
        start: task.getIn(['schedule', 'startTime']),
        soft: task.getIn(['schedule', 'softDeadline']),
        hard: task.getIn(['schedule', 'hardDeadline'])
    };

    for(let key in time) {
        if(time[key]) {
            const date = moment(time[key]).startOf('day').valueOf().toString();
            if( !schedule.has(date) ) schedule.set(date, fromJS({
                date: moment(date).toJSON(),
                start: [],
                soft: [],
                hard: [],
                scheduled: []
            }));
            schedule.updateIn( [date, key], value => value.push(taskID) );
        }
    }
}
export function removeTaskFromSchedule(schedule, task) {
    const taskID = task.get('_id');

    const time = {
        scheduled: task.getIn(['schedule', 'scheduledTime']),
        start: task.getIn(['schedule', 'startTime']),
        soft: task.getIn(['schedule', 'softDeadline']),
        hard: task.getIn(['schedule', 'hardDeadline'])
    };

    for(let key in time) {
        if(time[key]) {
            const unix = `${moment(time[key]).startOf('day').valueOf()}`;
            if(schedule.has(unix)) {
                const index = schedule.getIn([unix, key]).indexOf(taskID);
                if(index !== -1) schedule.deleteIn([unix, key, index]);
                if(
                    schedule.getIn([unix, 'scheduled']).size === 0 &&
                    schedule.getIn([unix, 'start']).size === 0 &&
                    schedule.getIn([unix, 'soft']).size === 0 &&
                    schedule.getIn([unix, 'hard']).size === 0
                ) schedule.delete(unix);
            }
        }
    }
}
