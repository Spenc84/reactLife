var mongoose = require('mongoose');

var taskSchema = new mongoose.Schema({
    title: {type: String, required: true},
    schedule: {
        scheduledTime: {type: String, default: ''},
        duration: {type: Number, default: 0},
        startTime: {type: String, default: ''},
        softDeadline: {type: String, default: ''},
        hardDeadline: {type: String, default: ''},
        availability: []
    },
    color: {type: String, default: '#0078ff'},
    description: {type: String, default: ''},
    users: [{
        user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
        securityAccess: Number
    }],
    changeLog: [{
        date: String,
        user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
        display: String
    }],
    is: {
        project: {type: Boolean, default: false},
        starred: {type: Boolean, default: false},
        scheduled: {type: Boolean, default: false}, // True if task has a scheduled date (past, present, or future)
        active: {type: Boolean, default: false},    // True if scheduled and not pending
        pending: {type: Boolean, default: false},   // True if scheduled for a future date or if start conditions have not been met
        inactive: {type: Boolean, default: true},   // True if not scheduled or pending
        completed: {type: Boolean, default: false}
        // highPriority: {type: Boolean, default: false},
        // lowPriority: {type: Boolean, default: false},
        // reoccuring: {type: Boolean, default: false},
        // behindSchedule: {type: Boolean, default: false},
        // pastDue: {type: Boolean, default: false},
        // needsAttention: {type: Boolean, default: false},
        // multiday: {type: Boolean, default: false},
        // carryOver: {type: Boolean, default: false},
        // carriedOver: {type: Number, default: 0}
    },
    parentTasks: [String],
    childTasks: [String]
  // prereq: {},
  // context: {},
  // reminders: [{}],
  // priority: Number,
  // onSchedule: {type: Boolean, default: true},
  // percentCompleted: Number,
  // template: {type: Boolean, default: false},
  // followUp: {
  //   scheduled: Boolean,
  //   date: Date
  // },
  // repeat: {
  //   // value: Boolean,
  //   // dateRange
  // },
  // comments: [Comment],
});

module.exports = mongoose.model('Task', taskSchema);
