var express = require('express'),
     app = express(),
//     session = require('express-session'),
//     sessionConfig = require('./config/session'),
     mongoose = require('mongoose'),
     mongoUri = 'mongodb://spencer:heroku_15b50tfp@ds015700.mlab.com:15700/heroku_15b50tfp',
//     mongoUri = 'mongodb://localhost:27017/database',
     bodyParser = require('body-parser'),
     cors = require('cors'),
     corsOptions = {
       origin: 'http://localhost:8030'
     },
     port = process.env.PORT || 8030;

// app.use(express.static(__dirname + '/public'));
// app.use(session(sessionConfig));
app.use(bodyParser.json());
app.use(cors(corsOptions));

mongoose.connect(mongoUri);
mongoose.connection.once('open', function(){
  console.log('Connected to mongo at ' + mongoUri);
});

require('./routes/routes')( app );

app.listen(port, function(){
  console.log('listening on ' + port);
});
