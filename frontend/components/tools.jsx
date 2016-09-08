import moment from 'moment';

// Takes in an Array and returns a map object with { _id: 'array index') key-value pairs
export function buildMap(array) {
    let newMap = {};
    array.forEach((e,i)=>newMap[e._id] = i);
    return newMap;
}

/* Takes in the entire tasks array (or a subset thereof), and filters it using
    the passed in query object in the following format...
query = {
    exclude: (Boolean) indicates whether filtered items should be excluded from the resulting array rather than included
    require: (array:string) An array of string values representing which key names in the status object to iterate over. Each value must be true for the task to be considered for the resulting array.
    include: (array:string) An array of string values representing which key names in the status object to iterate over. Any value may be true for the task to be considered for the resulting array.
} */
export function filterTasks(array, query) {
    if(!query || typeof query !== 'object' || !(query.require || query.include))  return [];
    if(!query.require) query.require = [];
    if(!query.include) query.include = [];
    if(!(query.require.length || query.include.length)) return (query.exclude) ? array : [];

    return array.filter(task=>{
        const { status } = task;

        const passed = query.require.every(item=>status[item]) &&
                            (query.include.some(item=>status[item]) ||
                            query.include.length === 0);

        return (query.exclude) ? !passed : passed;
    });
}
