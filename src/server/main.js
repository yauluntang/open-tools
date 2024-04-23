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
import sockjs from 'sockjs';


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

cron.schedule('*/5 * * * *', cleanUpload, { scheduled: true, timezone: 'America/Toronto' });

const echo = sockjs.createServer();
echo.on('connection', function (conn) {
  conn.on('data', function (message) {
    conn.write(message);
  });
  conn.on('close', function () { });
});


const options = {
  key: fs.readFileSync("./.ssl/OPENTOOL.ME.key"),
  cert: fs.readFileSync("./.ssl/OPENTOOL.ME.crt"),
};


if (env === 'production') {
  app.use(express.static('dist'))
  app.get('*', (req, res) => res.sendFile(path.resolve('dist', 'index.html')));
  const server = https.createServer(options, app).listen(443);
  //io = new Socketioserver(server);
  http.createServer(app).listen(80);

  echo.installHandlers(server, { prefix: '/api/echo' });
}
else {
  const server = http.createServer(app).listen(port);
  ViteExpress.bind(app, server);
  //io = new Socketioserver(server);
  echo.installHandlers(server, { prefix: '/api/echo' });

}

/*
io.on('connection', (socket) => {
  socket.on('chat message', (msg) => {
    io.emit('chat message', msg);
  });
});
*/