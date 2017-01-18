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
    if(!query.search) query.search = "";

    return list.map(
        task => {
            const status = task.get("status");
            const title = task.get("title").toLowerCase();
            const include = (
                query.rInclude.every(item=>status.get(item)) &&
                query.rExclude.every(item=>!status.get(item)) &&
                (
                    (query.include.length === 0 && query.exclude.length === 0) ||
                    query.include.some(item=>status.get(item)) ||
                    query.exclude.some(item=>!status.get(item))
                ) &&
                (
                    query.search === "" ||
                    title.indexOf(query.search.toLowerCase()) !== -1
                )
            );
            return include;
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
