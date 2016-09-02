import moment from 'moment';

// Takes in an Array and returns a map object with { _id: 'array index') key-value pairs
export function buildMap(array) {
    let newMap = {};
    array.forEach((e,i)=>newMap[e._id] = i);
    return newMap;
}
