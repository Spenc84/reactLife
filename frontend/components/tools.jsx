import moment from 'moment';
import { Map, List, fromJS } from 'immutable';


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
            const title = task.get("name").toLowerCase();
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
