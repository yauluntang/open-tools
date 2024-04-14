
import ttf2woff2 from 'ttf2woff2';
import { getTtfInfo } from '../utils/fontInfo.js';
import fs from 'fs';
import mime from 'mime';
import { __dirname, uploadFolder } from '../utils/paths.js';
import path from 'path';

export const convertFont = async (req, res) => {
  try {
    if (res.status(200)) {
      console.log("Your file has been uploaded successfully.");
      console.log(req.files)
      console.log(JSON.stringify(req.body))
      const fileType = req.body.fileType;
      if (!fileType) {
        res.end();
      }

      else {

        console.log('Handle Image Conversion')
        const timeStamp = new Date().getTime();
        const fullPath = __dirname + uploadFolder + timeStamp + "/";
        const { fileType } = req.body;

        if (!fs.existsSync(fullPath)) {
          fs.mkdirSync(fullPath, { recursive: true });
        }

        let outputFileList = [];
        for (const file of req.files) {
          const originalFile = file.originalname;
          //fs.writeFileSync(fullPath + 'temp.ttf', file.buffer);
          const info = await getTtfInfo(file.buffer)

          console.log('TTF info', info)
          const output = ttf2woff2(file.buffer)
          const name = path.parse(originalFile).name;
          console.log(name);
          let extension = '.woff2';
          const newFileName = name + extension;
          fs.writeFileSync(fullPath + newFileName, output);

          const stats = fs.statSync(fullPath + newFileName)
          const size = stats.size;
          const type = mime.getType(fullPath + newFileName)
          outputFileList.push({ path: timeStamp + "/", name: newFileName, size, type })
        }

        res.json({ files: outputFileList });
        res.end();
      }


    }
  }
  catch (e) {
    console.error(e)
  }
}