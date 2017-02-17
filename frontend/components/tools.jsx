import moment from 'moment';
import { Map, List, fromJS, Iterable } from 'immutable';
import { getUSER_ID } from '../lifeApp';


// Takes in an Array and returns a map object with { _id: 'array index') key-value pairs
export function Index(array) {
    let newMap = {};
    if(List.isList(array)) array.forEach((e,i)=>newMap[e.get('_id')] = i);
    else array.forEach((e,i)=>newMap[e._id] = i);
    return newMap;
}

////////////////////////////////////////////////////////////////////////////////
export function buildFilter(tasks, query, search) {
    let filter = query.length || query.size || search ? {filtered:true} : {filtered:false};
    tasks.forEach(task => {
        if(
            !task.getIn(['is', 'project']) &&
            task.get('title').toLowerCase().indexOf(search.toLowerCase()) !== -1 &&
            query.every(item=>every(task, item))
        ) filter[task.get('_id')] = true;
    });
    return Map(filter);
}

    // Children of buildFilter
    function every(task, item) {
        if(List.isList(item) || Array.isArray(item)) return item.some(item=>some(task, item));
        if(Map.isMap(item) && item.has('search')) return task.get('title').indexOf(item.get('search')) !== -1;
        return item[0] === '!'
            ? !task.getIn(['is', item.slice(1)])
            : task.getIn(['is', item]);
    };

    function some(task, item) {
        if(List.isList(item) || Array.isArray(item)) return item.every(item=>every(task, item));
        if(Map.isMap(item) && item.has('search')) return task.get('title').indexOf(item.get('search')) !== -1;
        return item[0] === '!'
            ? !task.getIn(['is', item.slice(1)])
            : task.getIn(['is', item]);
    };
////////////////////////////////////////////////////////////////////////////////

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
                            $set['is.scheduled'] = !!value;
                            $set['is.inactive'] = !value;
                            $set['is.active'] = moment().isSameOrAfter(value);
                            $set['is.pending'] = moment().isBefore(value);
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
            else if(key === 'is') {
                value.forEach( (value, key) => {
                    const VALUE = TASK.getIn(['is', key]);
                    if(VALUE !== value) {
                        $set[`is.${key}`] = value;
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

export function isStatic(item) {
    return typeof item !== 'object' || Iterable.isIterable(item) || item === null;
}

export function cloneObj(obj1) {
    if(isStatic(obj1)) return obj1;
    let obj = Array.isArray(obj1) ? [] : {};
    for(let key in obj1) obj[key] = cloneObj(obj1[key]);
    return obj;
}

export function mergeObj(obj1, obj2) {
    if(obj2 === undefined) return cloneObj(obj1);
    if(isStatic(obj1) || isStatic(obj2)) return cloneObj(obj2);
    let obj = Array.isArray(obj1) ? [] : {};
    for(let key in obj1) obj[key] = mergeObj(obj1[key], obj2[key]);
    return obj;
}

////////////////////   MUTATOR FUNCTIONS   ////////////////////
////////// TASK //////////
export function applyOperation({pendingTasks, operation, tIndx}) {
    return list => {
        pendingTasks.forEach( taskID => {

            const index = tIndx[taskID];
            list.set(index, list.get(index).withMutations(task => {
                for(let key in operation['$set']) {
                    task.setIn(key.split('.'), operation['$set'][key]);
                }
                for(let key in operation['$pull']) {
                    const path = key.split('.');
                    if( operation['$pull'][key]['$in'] ) {
                        operation['$pull'][key]['$in'].forEach( item => {
                            const i = task.getIn(path).indexOf(item);
                            if(i !== -1) task.removeIn(path.concat(i));
                        });
                    }
                    else {
                        const i = task.getIn(path).indexOf(operation['$pull'][key]);
                        if(i !== -1) task.removeIn(path.concat(i));
                    }
                }
                for(let key in operation['$push']) {
                    const path = key.split('.');
                    if( operation['$push'][key]['$each'] ) task.mergeIn(path, operation['$push'][key]['$each']);
                    else task.updateIn(path, value => value.push(operation['$push'][key]));
                }
                for(let key in operation['$addToSet']) {
                    const path = key.split('.');
                    if( operation['$addToSet'][key]['$each'] ) {
                        operation['$addToSet'][key]['$each'].forEach( item => {
                            const i = task.getIn(path).indexOf(item);
                            if(i === -1) task.updateIn(path, value => value.push(item));
                        });
                    }
                    else {
                        const item = operation['$addToSet'][key];
                        const i = task.getIn(path).indexOf(item);
                        if(i === -1) task.updateIn(path, value => value.push(item));
                    }
                }
            }));

        });
    };
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
export function updateTaskOnParents(list, task, TASKS, tIndx) {
    const oldTask = TASKS.get( tIndx[task.get('_id')] );
    if( oldTask.get('parentTasks') !== task.get('parentTasks') ) {
        removeTaskFromParents(list, oldTask, tIndx);
        addTaskToParents(list, task, tIndx);
    }
}
export function updateTaskOnChildren(list, task, TASKS, tIndx) {
    const oldTask = TASKS.get( tIndx[task.get('_id')] );
    if( oldTask.get('childTasks') !== task.get('childTasks') ) {
        removeTaskFromChildren(list, oldTask, tIndx);
        addTaskToChildren(list, task, tIndx);
    }
}

export function removeTaskFromParents(list, task, tIndx) {
    task.get('parentTasks').forEach( ID => {
        const index = (list.getIn([tIndx[ID], 'childTasks']) || List()).indexOf(task.get('_id'));
        if(index !== -1) list.deleteIn([tIndx[ID], 'childTasks', index]);
    });
}
export function removeTaskFromChildren(list, task, tIndx) {
    task.get('childTasks').forEach( ID => {
        const index = (list.getIn([tIndx[ID], 'parentTasks']) || List()).indexOf(task.get('_id'));
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
