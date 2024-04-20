
import { __dirname, uploadFolder } from '../utils/paths.js';
import _ from 'lodash';
import fs from 'fs';
import ytdl from '@distube/ytdl-core';
import mime from 'mime';

const writeToLocalDisk = (stream, path) => {
  return new Promise((resolve, reject) => {
    const istream = stream;
    const ostream = fs.createWriteStream(path);
    istream.pipe(ostream);
    istream.on("end", () => {
      console.log(`Fetched ${path} from elsewhere`);
      resolve();
    });
    istream.on("error", (err) => {
      console.log(JSON.stringify(err, null, 2));
      resolve();
    });
  });
};

export const youtubedownload = async (req, res) => {
  try {
    const newFileName = 'temp.mp4';
    const timeStamp = new Date().getTime();
    const fullPath = __dirname + uploadFolder + timeStamp + "/";
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
    }
    let outputFileList = [];

    await writeToLocalDisk(ytdl(req.body.url), fullPath + newFileName);




    const stats = fs.statSync(fullPath + newFileName)
    const size = stats.size;
    const type = mime.getType(fullPath + newFileName)
    outputFileList.push({ path: timeStamp + "/", name: newFileName, size, type })

    res.json({ files: outputFileList });
    res.end();

  }
  catch (e) {
    console.error(e)
    res.send(500)
    res.end();
  }
}
