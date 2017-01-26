var mongoose = require('mongoose');

var userSchema = new mongoose.Schema({
    firstName: {type: String, required: true},
    lastName: {type: String, required: true},
    password: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    role: String,
    tasks: [{type: mongoose.Schema.Types.ObjectId, ref: 'Task'}],
    schedule: {},
    /*  Schedule is built on the User object before it is sent to the client
        schedule: {
            <unix>: {
                scheduled: [<taskID>],
                start: [<taskID>],
                soft: [<taskID>],
                hard: [<taskID>]
            }
        }
    */
    changeLog: [{
        date: String,
        user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
        display: String
    }]
});

module.exports = mongoose.model('User', userSchema);
