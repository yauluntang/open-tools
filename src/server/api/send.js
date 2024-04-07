
import fs from 'fs';
import mime from 'mime';
import { fromFile, toFile, toPdf, mergePdfs } from '../utils/imageConvert.js';
import { __dirname, uploadFolder } from '../utils/paths.js';

const handleAllPdf = async (req, res) => {
  console.log('Handle All PDF')
  const timeStamp = new Date().getTime();
  const fullPath = __dirname + uploadFolder + timeStamp + "/";
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }
  const outputFileList = [];
  const buffers = req.files.map(file => file.buffer);
  console.log("Buffers", buffers)
  const arrBuffer = await mergePdfs(buffers);
  const nodeBuffer = Buffer.from(arrBuffer)
  console.log("Results", nodeBuffer);
  let originalFile = req.files[0].originalname;
  const newFileName = originalFile + '_merge.pdf';
  fs.writeFileSync(fullPath + newFileName, nodeBuffer);
  const stats = fs.statSync(fullPath + newFileName)
  const size = stats.size;
  const type = mime.getType(fullPath + newFileName)
  outputFileList.push({ path: timeStamp + "/", name: newFileName, size, type })
  res.json({ files: outputFileList });
  res.end();
}

const handleImageConversion = async (req, res) => {
  console.log('Handle Image Conversion')
  const timeStamp = new Date().getTime();
  const fullPath = __dirname + uploadFolder + timeStamp + "/";
  const fileType = req.body.fileType;

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
      let index = 1;

      for (const buffer of buffers) {
        let suffix = '';
        if (buffers.length > 1) {
          suffix = '_' + index;
        }
        const newFileName = await toFile(buffer, fullPath, originalFile, suffix, fileType);
        console.log(newFileName)
        if (!newFileName) {
          console.error('Invalid Image Type')
          res.end(400);
        }
        const stats = fs.statSync(fullPath + newFileName)
        const size = stats.size;
        const type = mime.getType(fullPath + newFileName)
        outputFileList.push({ path: timeStamp + "/", name: newFileName, size, type })
        index++;
      }
    }
  }
  if (fileType === 'application/pdf') {
    const newFileName = await toPdf(wholeBuffers, fullPath, firstFileName)
    const stats = fs.statSync(fullPath + newFileName)
    const size = stats.size;
    const type = mime.getType(fullPath + newFileName)
    outputFileList.push({ path: timeStamp + "/", name: newFileName, size, type })
  }

  res.json({ files: outputFileList });
  res.end();
}



export const send = async (req, res) => {
  try {
    if (res.status(200)) {
      console.log("Your file has been uploaded successfully.");
      console.log(req.files)
      console.log(JSON.stringify(req.body))
      const allInputPdf = req.files.every(file => file.mimetype === 'application/pdf')
      const fileType = req.body.fileType;
      if (!fileType) {
        res.end();
      }

      if (allInputPdf && fileType === 'application/pdf') {
        handleAllPdf(req, res);
      }
      else {
        handleImageConversion(req, res);
      }


    }
  }
  catch (e) {
    console.error(e)
  }
}