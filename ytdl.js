import fs from 'fs';
import ytdl from 'ytdl-core';
const args = process.argv.slice(2);
if (args.length >= 2) {
  ytdl(args[0]).pipe(fs.createWriteStream(args[1]));
}
else {
  throw "Need 2 Arguments"
}