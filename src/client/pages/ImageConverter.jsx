import './ImageConverter.scss';
import fileImage from '../assets/file.svg';
import { useCallback, useEffect, useState } from 'react';
import Button from '../components/input/Button';
import Input from '../components/input/Input';
import Select from 'react-select'
import { DragDropContext, Draggable } from 'react-beautiful-dnd';
import { StrictModeDroppable } from '../utils/StrictModeDroppable';
import { formatFileSize } from '../utils/formatFileSize';
import imageConverterImage from '../assets/imageconverter-min.png';
import { FileDragDrop } from '../components/layout/FileDragDrop';
import { FileDownload } from '../components/layout/FileDownload';

const fileTypeMap = {
  "image/jpeg": "JPG",
  "image/png": "PNG",
  "image/gif": "GIF",
  "image/tiff": "TIF",
  "image/avif": "AVIF",
  "image/svg+xml": "SVG",
  "image/raw": "RAW",
  "image/bmp": "BMP",
  "image/webp": "WEBP",
  "application/pdf": "PDF",
  "video/mp4": "MP4"
}

const outputFormat = {
  "JPG": "image/jpeg",
  "PNG": "image/png",
  "WEBP": "image/webp",
  "AVIF": "image/avif",
  "TIF": "image/tiff",
  "PDF": "application/pdf",
  "MP4": "video/mp4"

}

const options = Object.keys(outputFormat).map((typeName) => ({ value: outputFormat[typeName], label: typeName }))

const grid = 8;

function ImageConverter({ croptovideo }) {

  const [isLoading, setIsLoading] = useState(false);
  const [files, setFiles] = useState([]);
  const [fileType, setFileType] = useState('image/png');
  const [downloadFiles, setDownloadFiles] = useState([]);


  const [leftCrop, setLeftCrop] = useState(0);
  const [rightCrop, setRightCrop] = useState(0);
  const [topCrop, setTopCrop] = useState(0);
  const [bottomCrop, setBottomCrop] = useState(0);
  const [watermark, setWatermark] = useState(null);


  useEffect(() => {

    if (croptovideo) {
      setFileType('video/mp4');
      setBottomCrop(50);
      setTopCrop(0);
      setLeftCrop(0);
      setRightCrop(0);
    }

    else {
      setFileType('image/png');
      setBottomCrop(0);
      setTopCrop(0);
      setLeftCrop(0);
      setRightCrop(0);
    }
  }, [croptovideo])






  const submit = useCallback(async (e) => {
    const formData = new FormData();
    for (const file of files) {
      formData.append("files", file.file);
    }
    if (watermark) {
      formData.set("watermark", true);
      formData.append("files", watermark);
    }

    formData.set("fileType", fileType)
    formData.set("leftCrop", leftCrop)
    formData.set("rightCrop", rightCrop)
    formData.set("topCrop", topCrop)
    formData.set("bottomCrop", bottomCrop)

    try {
      setIsLoading(true);
      const response = await fetch("/api/send", {
        headers: {
          'Accept': 'application/json'
        },
        method: "post",
        body: formData,
      });
      const responseText = await response.json();
      setIsLoading(false);
      setDownloadFiles(responseText.files)
    }
    catch (error) {
      setIsLoading(false);
      console.error("Something went wrong!", error);
    }
  }, [
    files,
    fileType,
    leftCrop,
    rightCrop,
    topCrop,
    bottomCrop,
    setDownloadFiles,
    setIsLoading])


  const handleDownload = (file) => (e) => {
    window.open('/api/download?file=' + encodeURI(file.path + file.name))
  }

  const handleWaterMark = (e) => {
    console.log(e)
    setWatermark(e.target.files[0])
  }

  return <div id="imageConverter">

    <div className='flex content-center justify-center items-center'><img style={{ width: '150px' }} src={imageConverterImage}></img> <h1>Image Converter</h1></div>

    <FileDragDrop allowableFileTypes={fileTypeMap} onChange={setFiles} />

    <label>Water Mark</label>
    <input type="file" onChange={handleWaterMark} />


    <div className={`${!isLoading && 'hidden'}`}>Loading...</div>


    <div className={`flex content-center justify-center items-center ${isLoading && 'hidden'}`}>

      <Select className="w-96" options={options} value={
        options.filter(option =>
          option.value === fileType)
      } onChange={(e) => { setFileType(e.value) }} defaultValue={fileType || 'Select'}></Select>
      <div className="p-4">{fileType}</div>
      <Button size="large" onClick={submit}> Send </Button>


    </div>
    <FileDownload downloadFiles={downloadFiles} />

    <div>
      <Input label="Left Crop" type="number" value={leftCrop} onChange={setLeftCrop} />
      <Input label="Right Crop" type="number" value={rightCrop} onChange={setRightCrop} />
      <Input label="Top Crop" type="number" value={topCrop} onChange={setTopCrop} />
      <Input label="Bottom Crop" type="number" value={bottomCrop} onChange={setBottomCrop} />
    </div>
  </div >
}

export default ImageConverter