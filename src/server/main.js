import express from 'express';
import multer from 'multer';
import cors from 'cors';
import fs from 'fs';
import http from 'http';
import https from 'https';
import { send } from './api/send.js';
import { download } from './api/download.js';
import minimist from 'minimist';
import ViteExpress from "vite-express";
import path from 'path';
import cron from 'node-cron';
import { cleanUpload } from './utils/cleanUpload.js';
import { convertFont } from './api/convertFont.js';
import { runnode } from './api/runNode.js';
import bodyParser from 'body-parser';
import { youtubedownload } from './api/ytdl.js';
import { initDb } from './model/init.js';
import { Message } from './model/message.js';
import { message } from './api/message.js';
import sockjs from 'sockjs';
import { GameServer } from './gameserver/gameserver.js';
import { BlackjackGame } from './gameserver/BlackjackGame.js';



const argv = minimist(process.argv.slice(2))
const env = process.env.NODE_ENV || 'development';
let io;

console.log(process.argv)
console.log(argv)

const app = express()
const port = argv['p'] || 80
const upload = multer();

app.use(cors())
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post('/api/send', upload.array('files'), send);
app.post('/api/convertFont', upload.array('files'), convertFont);
app.get("/api/health", (req, res) => {
  res.json({ success: true });
});
app.get('/api/download', download);
app.get('/api/clean-up', cleanUpload);
app.post('/api/runnode', runnode);
app.post('/api/ytdl', youtubedownload);


app.get('/api/message', message);

cron.schedule('*/15 * * * *', cleanUpload, { scheduled: true, timezone: 'America/Toronto' });

const echo = sockjs.createServer();

initDb();



const clients = {};

const broadcast = (message) => {
  // iterate through each client in clients object
  for (var client in clients) {
    // send the message to that client
    clients[client].write(message);
  }
}

echo.on('connection', (conn) => {
  clients[conn.id] = conn;
  conn.on('data', async (message) => {
    const messageObject = JSON.parse(message)
    console.log(message);
    messageObject.timeStamp = new Date().getTime();
    await Message.create(messageObject);
    broadcast(message);
  });

  conn.on('close', () => {
    delete clients[conn.id];
  });
});


const options = {
  key: fs.readFileSync("./.ssl/OPENTOOL.ME.key"),
  cert: fs.readFileSync("./.ssl/OPENTOOL.ME.crt"),
};

let server;


if (env === 'production') {
  app.use(express.static('dist'))
  app.get('*', (req, res) => res.sendFile(path.resolve('dist', 'index.html')));
  server = https.createServer(options, app).listen(443);
  //io = new Socketioserver(server);
  //http.createServer(app).listen(80);

  echo.installHandlers(server, { prefix: '/api/e' });
}
else {
  server = http.createServer(app).listen(port);
  ViteExpress.bind(app, server);
  //io = new Socketioserver(server);

  echo.installHandlers(server, { prefix: '/api/e' });


}
/*
const primus = new Primus(server);
primus.on('connection', (spark) => {

  spark.send('news', { hello: 'world' });

  // listen to hi events
  spark.on('hi', (msg) => {
    console.log(msg); //-> hello world

    // send back the hello to client
    spark.send('hello', 'hello from the server');
  });
});*/



const gameServer = new GameServer(server, '/api/echo');

gameServer.addChannel('lobby');
const blackjackGame = new BlackjackGame();
gameServer.broadcast(message);

gameServer.setupRoomType('Blackjack', { capacity: 10 })

for (let i = 0; i < 10; i++) {
  const blackjackGame = new BlackjackGame();

  gameServer.setRoomReceiveCallback(`Blackjack-${i}`, 'Blackjack', blackjackGame)
}


gameServer.setDataReceiveCallback('chat', async (message) => {
  //console.log(message);
  //await Message.create(message);

});


