var mongoose = require('mongoose');

var taskSchema = new mongoose.Schema({
  name: {type: String, required: true},
  // desc: String,
  // schedule: "",
  // color: String,
  // deadline: Date,
  // manHours: Number,
  // users: {},
  // history: [{}],
  // prereq: {},
  // context: {},
  // reminders: [{}],
  // priority: Number,
  // childTasks: [{type: Schema.Types.ObjectId, ref: 'Task', default: null}],
  // parentTask: {type: Schema.Types.ObjectId, ref: 'Task', default: null},
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
  status: {
    starred: {type: Boolean, default: false},
    active: {type: Boolean, default: false},
    pending: {type: Boolean, default: false},
    inactive: {type: Boolean, default: true},
    completed: {type: Boolean, default: false},
    scheduled: {type: Boolean, default: false},
    unscheduled: {type: Boolean, default: true},
    highPriority: {type: Boolean, default: false},
    lowPriority: {type: Boolean, default: false},
    reoccuring: {type: Boolean, default: false},
    behindSchedule: {type: Boolean, default: false},
    pastDue: {type: Boolean, default: false},
    needsAttention: {type: Boolean, default: false},
    multiday: {type: Boolean, default: false},
    carryOver: {type: Boolean, default: false},
    carriedOver: {type: Number, default: 0},
    editable: {type: Boolean, default: false}
  }
});

module.exports = mongoose.model('Task', taskSchema);
