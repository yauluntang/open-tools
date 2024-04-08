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


const argv = minimist(process.argv.slice(2))
const env = process.env.NODE_ENV || 'development';

console.log(process.argv)
console.log(argv)

const app = express()
const port = argv['p'] || 3002
const upload = multer();

app.use(cors())

app.post('/send', upload.array('files'), send);

app.get('/download', download);

app.use(express.static('dist'))


app.get("/hello", (req, res) => {
  res.send("Hello Vite + React!");
});

const options = {
  key: fs.readFileSync("./.ssl/cert.key"),
  cert: fs.readFileSync("./.ssl/OPENTOOL.ME.crt"),
};




http.createServer(app).listen(80);
https.createServer(options, app).listen(443);

/*
let vite = await createServer({
  server: {
    middlewareMode: true,
    hmr: {
      server,        // <=========  user `server.hmr.server`
    }
  }
})*/