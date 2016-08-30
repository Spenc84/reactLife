import moment from 'moment';

// Takes in an Array and returns a map object with { _id: 'array index') key-value pairs
export function buildMap(array) {
    let newMap = {};
    array.forEach((e,i)=>newMap[e._id] = i);
    return newMap;
}

export function dateMapper(array) {
    array.forEach((e,i)=>e._id = moment(e.date).valueOf());
    return buildMap(array);
}
