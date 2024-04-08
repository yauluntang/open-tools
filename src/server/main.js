import express from 'express';
import multer from 'multer';
import cors from 'cors';
//import ViteExpress from "vite-express";
import fs from 'fs';
import http from 'http';
import https from 'https';
import { send } from './api/send.js';
import { download } from './api/download.js';
import minimist from 'minimist';
import ViteExpress from "vite-express";
import { createServer } from 'vite';
import path from 'path';


const argv = minimist(process.argv.slice(2))
const env = process.env.NODE_ENV || 'development';

console.log(process.argv)
console.log(argv)

const app = express()
const port = argv['p'] || 3002
const upload = multer();

app.use(cors())

app.post('/send', upload.array('files'), send);


app.get("/health", (req, res) => {
  res.json({ success: true });
});


app.get('/download', download);

app.use(express.static('dist'))

app.get('*', (req, res) => res.sendFile(path.resolve('dist', 'index.html')));

const options = {
  key: fs.readFileSync("./.ssl/OPENTOOL.ME.key"),
  cert: fs.readFileSync("./.ssl/OPENTOOL.ME.crt"),
};




http.createServer(app).listen(80);
const server = https.createServer(options, app).listen(443);


let vite = await createServer({
  server: {
    middlewareMode: true,
    hmr: {
      server,        // <=========  user `server.hmr.server`
    }
  }
})