import { execSync } from 'child_process';
import { __dirname, uploadFolder } from '../utils/paths.js';
import _ from 'lodash';
import fs from 'fs';

function systemSync(cmd) {
  try {
    return child_process.execSync(cmd).toString();
  }
  catch (error) {
    error.status;  // Might be 127 in your example.
    error.message; // Holds the message you typically want.
    error.stderr;  // Holds the stderr output. Use `.toString()`.
    error.stdout;  // Holds the stdout output. Use `.toString()`.
  }
}

export const runnode = async (req, res) => {
  try {
    const fileName = 'temp.js';
    const fileName2 = 'temp.txt';
    const timeStamp = new Date().getTime();
    const fullPath = __dirname + uploadFolder + timeStamp + "/";
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
    }
    /*
    else {
      fs.mkdirSync(fullPath, { recursive: true });
    }*/
    const file = `${fullPath}${fileName}`;
    const file2 = `${fullPath}${fileName2}`;
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
    }
    else {

    }
    const startCode = `
    import _ from 'lodash';
    const Internal_logging_end = []; 
    const Internal_original_console_end = {...console};
    console.log = (l) => Internal_logging_end.push({level:"log", message: l});
    console.debug = (l) => Internal_logging_end.push({level:"debug", message: l});
    console.result = (l) => Internal_logging_end.push({level:"result", message: l});
    console.info = (l) => Internal_logging_end.push({level:"info", message: l});
    console.warn = (l) => Internal_logging_end.push({level:"warn", message: l});
    console.error = (l) => Internal_logging_end.push({level:"error", message: l.message});
    try{
    `
    let endCode = `;`
    if (req.body.functionName && req.body.testCases) {

      const inputs = req.body.testCases.map(testcase => testcase.input);
      console.log(inputs);
      for (let input of inputs) {
        console.log(input);
        let param;
        if (_.isArray(input)) {
          param = input.map(p => {
            if (typeof p === 'object') {
              return JSON.stringify(p);
            }
            else if (typeof p === 'string') {
              return `"${p}"`
            }
            else {
              return p
            }
          }).join(',')
        }
        else if (typeof input === 'object') {
          param = JSON.stringify(input);
        }
        else if (typeof input === 'string') {
          param = `"${input}"`
        }
        else {
          param = input
        }
        endCode += `console.result(${req.body.functionName}(${param}));`
      }
    }

    endCode += `}catch(e){console.error(e)}
    Internal_original_console_end.log(JSON.stringify(Internal_logging_end)); `;
    const totalCode = startCode + req.body.code + endCode;
    fs.writeFileSync(file, totalCode);
    const prompt = `node --experimental-permission --allow-fs-read=* ${file} > ${file2} `;

    try {
      execSync(prompt, { stdio: 'inherit' });
    }
    catch (e) {
      console.log('Status:', e.status)
      console.log('Message:', e.message)
      console.log('Stderr:', e.stderr)
      console.log('Stdout:', e.stdout)
    }

    const logFile = fs.readFileSync(file2)
    const log = JSON.parse(logFile);

    const result = log.filter(l => l.level === 'result').map(l => l.message);

    res.json({ log, result });
    res.end();

  }
  catch (e) {
    console.error(e)
    res.send(500)
    res.end();
  }
}
