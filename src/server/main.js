import express from 'express';
import multer from 'multer';
import cors from 'cors';
import ViteExpress from "vite-express";
import { send } from './api/send.js';
import { download } from './api/download.js';
import minimist from 'minimist';

const argv = minimist(process.argv.slice(2))

console.log(process.argv)
console.log(argv)

const app = express()
const port = argv['p'] || 3002
const upload = multer();

app.use(cors())

app.post('/send', upload.array('files'), send);

app.get('/download', download);


app.get("/hello", (req, res) => {
  res.send("Hello Vite + React!");
});

ViteExpress.listen(app, port, () =>
  console.log(`Server is listening on port ${port}...`),
);
