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


const argv = minimist(process.argv.slice(2))
const env = process.env.NODE_ENV || 'development';

console.log(process.argv)
console.log(argv)

const app = express()
const port = argv['p'] || 80
const upload = multer();

app.use(cors())

app.post('/send', upload.array('files'), send);


app.get("/health", (req, res) => {
  res.json({ success: true });
});


app.get('/download', download);

app.get('/clean-up', cleanUpload);

cron.schedule('*/5 * * * *', cleanUpload, { scheduled: true, timezone: 'America/Toronto' });


const options = {
  key: fs.readFileSync("./.ssl/OPENTOOL.ME.key"),
  cert: fs.readFileSync("./.ssl/OPENTOOL.ME.crt"),
};


if (env === 'production') {
  app.use(express.static('dist'))
  app.get('*', (req, res) => res.sendFile(path.resolve('dist', 'index.html')));
  const server = https.createServer(options, app).listen(443);
}
else {
  const server = http.createServer(app).listen(port);
  ViteExpress.bind(app, server);
}
