import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import cors from 'cors';
import { PORT, mongoUri, corsOptions } from './config/session';
import webpackDevServer from "./webpackDevServer";

mongoose.Promise = Promise;

const PROD = process.env.NODE_ENV === "production";
const app = express();

if (PROD) {
  server(PORT);
} else {
  server(PORT - 1);
  webpackDevServer(PORT);
}


// if (process.env.NODE_ENV === 'production') {
//   SESSION_SECRET= process.env.SESSION_SECRET;
// } else {
//   SESSION_SECRET = require('./config/session.js').secret;
// }

//TEMP///////////
// var  session = require('express-session'),
//      sessionConfig = require('./config/session');
// app.use(session(sessionConfig));
/////////////////
function server(PORT) {
    app.use(express.static(__dirname + '/public'));
    app.use(bodyParser.json());
    app.use(cors(corsOptions));

    mongoose.connect(mongoUri);
    mongoose.connection.once('open', function(){
      console.log('Connected to mongo at ' + mongoUri);
    });

    require('./backend/routes')( app );

    app.listen(PORT, ()=>{ console.log('listening on ' + PORT); });
}


// ///////////////
//
// import express from "express";
// import serveStatic from "serve-static";
// import API from "./lib/api";
//
// const app  = express();
// const PORT = process.env.PORT || 8080;
//
// app.use(serveStatic(__dirname+"/build"));
// app.use(API);
//
// app.listen(PORT);
//
// ///////////////
