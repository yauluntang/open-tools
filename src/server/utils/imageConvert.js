import sharp from 'sharp';
import jimp from 'jimp';
import path from 'path';

import { fromBuffer } from 'pdf2pic';
import { jsPDF } from 'jspdf';

async function fromFile(buffer, type) {
  console.log('fromFile:', type);
  let newBuffers = [];
  switch (type) {
    case 'image/png':
    case 'image/gif':
    case 'image/jpeg':
    case 'image/avif':
    case 'image/webp':
    case 'image/svg+xml':
      const newBuffer = await sharp(buffer).png().toBuffer();
      newBuffers.push(newBuffer);
      break;
    case 'image/tiff':
    case 'image/bmp': {
      let image = await jimp.read(buffer);
      const newBuffer = await image.getBufferAsync(jimp.MIME_PNG);
      newBuffers.push(newBuffer);
    }
    case 'application/pdf': {
      const options = {
        density: 400,
        width: 1000,
        preserveAspectRatio: false,
        format: "png",
      };
      const convert = fromBuffer(buffer, options);
      /*
      const pngPageOutput = await pdfToPng(buffer, // The function accepts PDF file path or a Buffer
        {
          disableFontFace: false, // When `false`, fonts will be rendered using a built-in font renderer that constructs the glyphs with primitive path commands. Default value is true.
          useSystemFonts: false, // When `true`, fonts that aren't embedded in the PDF document will fallback to a system font. Default value is false.
          enableXfa: false, // Render Xfa forms if any. Default value is false.
          viewportScale: 2.0, // The desired scale of PNG viewport. Default value is 1.0.
          strictPagesToProcess: false, // When `true`, will throw an error if specified page number in pagesToProcess is invalid, otherwise will skip invalid page. Default value is false.
          verbosityLevel: 0 // Verbosity level. ERRORS: 0, WARNINGS: 1, INFOS: 5. Default value is 0.
        });
      buffer = pngPageOutput.map(output => output.content);*/
      const newBuffer = await convert(1, { responseType: "buffer" })
      newBuffers.push(newBuffer.buffer);
    }
      break;
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


  const doc = new jsPDF('p', 'mm', [297, 297 * averageAspect]);
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

async function toFile(buffer, filepath, fileName, type) {
  console.log('toFile:', filepath, fileName, type);
  const name = path.parse(fileName).name;
  let extension = null;

  switch (type) {
    case 'image/png':
      extension = '.png'
      await sharp(buffer).png().toFile(filepath + name + extension)

      break;
    case 'image/gif':
      extension = '.gif'
      await sharp(buffer).gif().toFile(filepath + name + extension);

      break;
    case 'image/jpeg':
      extension = '.jpg'
      await sharp(buffer).jpeg().toFile(filepath + name + extension);

      break;
    case 'image/webp':
      extension = '.webp'
      await sharp(buffer).webp().toFile(filepath + name + extension);

      break;
    case 'image/avif':
      extension = '.avif'
      await sharp(buffer).avif().toFile(filepath + name + extension);

      break;
    case 'image/tiff':
      extension = '.tif'
      await sharp(buffer).tiff().toFile(filepath + name + extension);

      break;
  }
  if (extension) {
    return name + extension;
  }
  return null;
}

export { fromFile, toFile, toPdf }
