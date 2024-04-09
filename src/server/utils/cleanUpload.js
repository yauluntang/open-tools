import { __dirname, uploadFolder } from '../utils/paths.js';
import { readdir, rm } from 'fs/promises'

const ONE_HOUR = 60 * 60 * 1000; /* ms */

const getDirectories = async source =>
  (await readdir(source, { withFileTypes: true }))
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name)

export const cleanUpload = async (req, res) => {
  try {
    console.log('clean up scheduled!');
    const fullPath = __dirname + uploadFolder;
    const directories = await getDirectories(fullPath)

    const oneHourBefore = new Date(new Date().getTime() - ONE_HOUR);
    const cleanedDirectory = [];

    for (let directory of directories) {
      let time = parseInt(directory, 10);
      if (time < oneHourBefore) {
        cleanedDirectory.push(time);
        await rm(fullPath + time, { recursive: true })
      }
    }
    console.log('clean up directories: ', cleanedDirectory);
    if (res) {
      res.json({ success: true, cleanedDirectory })
    }
  }
  catch (e) {
    console.error(e);
    res.error();
  }
}