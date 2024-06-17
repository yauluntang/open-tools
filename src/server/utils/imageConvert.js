import sharp from 'sharp';
import jimp from 'jimp';
import path from 'path';
import { execSync } from 'child_process';
import { fromBuffer as convertPdfToPng } from 'pdf2pic'
import { jsPDF } from 'jspdf';

import { PDFDocument } from "pdf-lib";

export async function mergePdfs(pdfsToMerge) {
  const mergedPdf = await PDFDocument.create();

  const createInnerPromise = async (arrayBuffer) => {
    const pdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });

    return await mergedPdf.copyPages(pdf, pdf.getPageIndices());
  };

  const outerPromise = pdfsToMerge.map((arrayBuffer) => {
    const innerPromise = createInnerPromise(arrayBuffer);
    return innerPromise;
  });

  const resultOuterPromise = await Promise.all(outerPromise);

  resultOuterPromise.forEach((pageArray) => {
    pageArray.forEach((page) => {
      mergedPdf.addPage(page);
    });
  });

  return (await mergedPdf.save({ updateFieldAppearances: false })).buffer;
}

async function cropImage(sharpBuffer, crops) {
  const image = sharp(sharpBuffer);

  const { width: imageWidth, height: imageHeight } = await image.metadata();

  const dimension = {
    imageWidth,
    imageHeight,
    left: crops.leftCrop,
    top: crops.topCrop,
    width: imageWidth - crops.rightCrop - crops.leftCrop,
    height: imageHeight - crops.topCrop - crops.bottomCrop
  };
  console.log(dimension)
  return sharp(sharpBuffer).extract(dimension).toBuffer();
}

export async function toMp4({ allBuffers, fullPath, fileName, crops, watermarkFile }) {

  return new Promise(async (res, rej) => {



    let i = 0;
    const name = 'tempjpg';
    let fileNames = [];

    let watermarkimage = null;

    /*
    if (watermarkFile) {
      watermarkimage = await sharp(watermarkFile.buffer);
    }*/



    for (let buffer of allBuffers) {
      let suffix = `_${i}`;
      let extension = '.jpg';
      let videofileName = fullPath + name + suffix + extension;

      let newBuffer = await cropImage(buffer, crops);

      let image = null;

      /*
      image = await sharp(buffer).resize({
        width: 1280,
        height: 720,
        fit: 'contain',
      }).jpeg({ quality: 80 }).toFile(fileName)
      */

      if (watermarkFile) {
        newBuffer = await sharp(newBuffer).resize({
          width: 1280,
          height: 720,
          fit: 'contain',
        }).png().toBuffer();
        image = await sharp(newBuffer).composite([{ input: watermarkFile.buffer, gravity: 'southeast' }]).jpeg({ quality: 80 }).toFile(videofileName);
      }
      else {
        image = await sharp(newBuffer).resize({
          width: 1280,
          height: 720,
          fit: 'contain',
        }).jpeg({ quality: 80 }).toFile(videofileName);
      }

      fileNames.push(videofileName)
      i++;
    }

    const prompt = 'ffmpeg -framerate 0.5 -i ' + fullPath + name + '_%d.jpg -c:v libx264 -r 30 ' + fullPath + 'video.mp4';
    console.log(prompt)

    execSync(prompt);

    res('video.mp4');


  })
}


async function fromFile({ file, watermarkFile, fileType, crops }) {
  let { buffer, mimetype } = file;
  buffer = await cropImage(buffer, crops);

  console.log('fromFile:', mimetype);
  let newBuffers = [];
  switch (mimetype) {
    case 'image/png':
    case 'image/gif':
    case 'image/jpeg':
    case 'image/avif':
    case 'image/webp':
    case 'image/svg+xml':
      let newBuffer;

      /*
      if (watermarkFile && fileType === 'video/mp4') {
        newBuffer = await sharp(buffer).resize({
          width: 1280,
          height: 720,
          fit: 'contain',
        }).composite([{ input: watermarkFile.buffer, gravity: 'southeast' }]).png().toBuffer();
      }
      else if (watermarkFile ) {
        newBuffer = await sharp(buffer).composite([{ input: watermarkFile.buffer, gravity: 'southeast' }]).png().toBuffer();
      }

      else {
        
      }*/
      newBuffer = await sharp(buffer).png().toBuffer();
      newBuffers.push(newBuffer);
      break;
    case 'image/tiff':
    case 'image/bmp': {
      let image = await jimp.read(buffer);
      const newBuffer = await image.getBufferAsync(jimp.MIME_PNG);
      newBuffers.push(newBuffer);
    }
    case 'application/pdf': {

      const pdf2picOptions = {
        format: 'png',
        width: 2550,
        height: 3300,
        density: 330,
        savePath: './output/from-buffer-to-base64',
      }
      const convert = convertPdfToPng(buffer, pdf2picOptions)
      const pages = await convert.bulk(-1, { responseType: "buffer" });
      console.log(pages)
      for (const page of pages) {
        const pngBuffer = Buffer.from(page.buffer, 'base64')
        newBuffers.push(pngBuffer);
      }
    }
  }
  console.log(newBuffers)
  return newBuffers;
}

async function toPdf(buffers, filepath, fileName) {

  let averageAspect = 0;
  for (const buffer of buffers) {
    const image = sharp(buffer);
    const { width: imageWidth, height: imageHeight } = await image.metadata();
    const aspectRatio = imageWidth / imageHeight;
    averageAspect += aspectRatio;
  }
  averageAspect /= buffers.length;

  let orientation = 'p'
  if (averageAspect >= 1) {
    orientation = 'l'
  }
  console.log("Average Aspect:", averageAspect)

  const doc = new jsPDF(orientation, 'mm', [297, 297 * averageAspect]);
  let firstPage = true;
  for (const buffer of buffers) {
    if (!firstPage) {
      doc.addPage();
    }
    const image = sharp(buffer);

    const newBuffer = await sharp(buffer).jpeg().toBuffer();

    let { width: imageWidth, height: imageHeight } = await image.metadata();

    let width = doc.internal.pageSize.getWidth();
    let height = doc.internal.pageSize.getHeight();

    const aspectRatio = imageWidth / imageHeight;

    if (imageHeight > height) {
      const ratio = imageHeight / height;
      imageHeight = height;
      imageWidth = imageWidth / ratio;

      if (imageWidth > width) {
        const ratio2 = imageWidth / width;
        imageWidth = width;
        imageHeight = imageHeight / ratio2;
      }
    }

    const x = (width - imageWidth) / 2
    const y = (height - imageHeight) / 2

    const base64data = new Buffer.from(newBuffer, 'base64').toString('base64');
    doc.addImage(base64data, 'PNG', x, y, imageWidth, imageHeight)
    firstPage = false;
  }

  doc.save(filepath + fileName + '.pdf');
  return fileName + '.pdf';
}


async function toFile({buffer, fullPath, originalFile, suffix, fileType, watermarkFile, crops}) {
  console.log('toFile:', fullPath, originalFile, fileType);
  const name = path.parse(originalFile).name;
  let extension = null;

  //let sharpBuffer = buffer;
  let sharpBuffer = await cropImage(buffer, crops);

  if ( watermarkFile ) {
    console.log( 'WaterMarked')
    sharpBuffer = await sharp(sharpBuffer).composite([{ input: watermarkFile.buffer, gravity: 'southeast' }]).png().toBuffer();
  }

  switch (fileType) {
    case 'image/png':
      extension = '.png'
      await sharp(sharpBuffer).png().toFile(fullPath + name + suffix + extension)

      break;
    case 'image/gif':
      extension = '.gif'
      await sharp(sharpBuffer).gif().toFile(fullPath + name + suffix + extension);

      break;
    case 'image/jpeg':
      extension = '.jpg'
      await sharp(sharpBuffer).jpeg().toFile(fullPath + name + suffix + extension);

      break;
    case 'image/webp':
      extension = '.webp'
      await sharp(sharpBuffer).webp().toFile(fullPath + name + suffix + extension);

      break;
    case 'image/avif':
      extension = '.avif'
      await sharp(sharpBuffer).avif().toFile(fullPath + name + suffix + extension);

      break;
    case 'image/tiff':
      extension = '.tif'
      await sharp(sharpBuffer).tiff().toFile(fullPath + name + suffix + extension);

      break;
  }
  if (extension) {
    return name + suffix + extension;
  }
  return null;
}

export { fromFile, toFile, toPdf }
