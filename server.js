var express = require('express'),
     app = express(),
     mongoose = require('mongoose'),
     mongoUri = 'mongodb://spencer:longhorsestickmonkey@ds023000.mlab.com:23000/spencer',
    //  mongoUri = 'mongodb://localhost:27017/life',
     bodyParser = require('body-parser'),
     cors = require('cors'),
     corsOptions = {
       origin: 'https://projectlifeapp.herokuapp.com/'
      //  origin: 'http://localhost:8030'
     },
     port = process.env.PORT || 8030;

if (process.env.NODE_ENV === 'production') {
  SESSION_SECRET= process.env.SESSION_SECRET;
} else {
  SESSION_SECRET = require('./config/session.js').secret;
}

//TEMP///////////
// var  session = require('express-session'),
//      sessionConfig = require('./config/session');
// app.use(session(sessionConfig));
/////////////////
app.use(express.static(__dirname + '/public'));

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
