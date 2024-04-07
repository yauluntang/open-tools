import { __dirname, uploadFolder } from '../utils/paths.js';

export const download = async (req, res) => {
  try {
    const fileName = req.query.file;

    const fullPath = __dirname + uploadFolder;
    const file = `${fullPath}${fileName}`;
    res.download(file);
  }
  catch (e) {
    console.error(e)
  }
}