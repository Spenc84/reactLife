var mongoose = require('mongoose');

var userSchema = new mongoose.Schema({
  firstName: {type: String, required: true},
  lastName: {type: String, required: true},
  password: {type: String, required: true},
  email: {type: String, required: true, unique: true},
  role: String,
  tasks: [{type: mongoose.Schema.Types.ObjectId, ref: 'Task'}],
  agenda: [{}]
});

module.exports = mongoose.model('User', userSchema);
