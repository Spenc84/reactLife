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
    status: {
        isProject: {type: Boolean, default: false},
        starred: {type: Boolean, default: false},
        active: {type: Boolean, default: false},
        pending: {type: Boolean, default: false},
        inactive: {type: Boolean, default: true},
        completed: {type: Boolean, default: false},
        incomplete: {type: Boolean, default: false},
        scheduled: {type: Boolean, default: false},
        highPriority: {type: Boolean, default: false},
        lowPriority: {type: Boolean, default: false},
        reoccuring: {type: Boolean, default: false},
        behindSchedule: {type: Boolean, default: false},
        pastDue: {type: Boolean, default: false},
        needsAttention: {type: Boolean, default: false},
        multiday: {type: Boolean, default: false},
        carryOver: {type: Boolean, default: false},
        carriedOver: {type: Number, default: 0}
    },
    parentTasks: [String],
    childTasks: [String]
  // prereq: {},
  // context: {},
  // reminders: [{}],
  // priority: Number,
  // creationDate: {
  //   // date: {type: Date, required: true},
  //   // user: {type: Schema.Types.ObjectId, ref: 'Task', required: true}
  // },
  // completionDate: Event.schema,
  // completed: {type: Boolean, default: false},
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
