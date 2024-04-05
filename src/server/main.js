import express from 'express';
import multer from 'multer';
import cors from 'cors';
import fs from 'fs';

import mime from 'mime';
import jspdf from 'jspdf';
import { fileURLToPath } from 'url';
import path, { dirname } from 'path';
import ViteExpress from "vite-express";
import { fromFile, toFile, toPdf } from './utils/imageConvert.js';

const uploadFolder = "../../../upload/";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const app = express()
const port = 3002
const upload = multer();

app.use(cors())

app.post('/send', upload.array('files'), async (req, res) => {
  try {
    const timeStamp = new Date().getTime();
    if (res.status(200)) {
      console.log("Your file has been uploaded successfully.");
      console.log(req.files)
      console.log(JSON.stringify(req.body))
      const fileType = req.body.fileType;
      if (!fileType) {
        res.end();
      }

      const fullPath = __dirname + uploadFolder + timeStamp + "/";

      if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
      }
      const outputFileList = [];
      const wholeBuffers = [];

      let firstFileName = null;

      for (const file of req.files) {
        const originalFile = file.originalname;
        if (!firstFileName) {
          firstFileName = originalFile;
        }

        const buffers = await fromFile(file.buffer, file.mimetype)

        wholeBuffers.push(...buffers);

        console.log("number of buffers:", buffers.length)
        if (!buffers) {
          console.error('Invalid Data')
          res.end(400);
        }


        if (fileType !== 'application/pdf') {
          for (const buffer of buffers) {
            let index = 1;
            let suffix = '';
            if (buffers.length > 1) {
              suffix = '_' + index;
            }
            const newFileName = await toFile(buffer, fullPath, originalFile + suffix, fileType)
            if (!newFileName) {
              console.error('Invalid Image Type')
              res.end(400);
            }
            const stats = fs.statSync(fullPath + newFileName)
            const size = stats.size;
            const type = mime.getType(fullPath + newFileName)
            outputFileList.push({ name: timeStamp + "/" + newFileName, size, type })
            index++;
          }
        }

      }


      if (fileType === 'application/pdf') {
        const newFileName = await toPdf(wholeBuffers, fullPath, firstFileName)
        const stats = fs.statSync(fullPath + newFileName)
        const size = stats.size;
        const type = mime.getType(fullPath + newFileName)
        outputFileList.push({ name: timeStamp + "/" + newFileName, size, type })
      }

      res.json({ files: outputFileList });
      res.end();
    }
  }
  catch (e) {
    console.error(e)
  }
});

app.get('/download', async (req, res) => {
  try {
    const fileName = req.query.file;

    const fullPath = __dirname + uploadFolder;
    const file = `${fullPath}${fileName}`;
    res.download(file);
  }
  catch (e) {
    console.error(e)
  }
})


app.get("/hello", (req, res) => {
  res.send("Hello Vite + React!");
});

ViteExpress.listen(app, port, () =>
  console.log(`Server is listening on port ${port}...`),
);
