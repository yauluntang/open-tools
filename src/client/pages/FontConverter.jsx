import './ImageConverter.scss';
import fileImage from '../assets/file.svg';
import { useCallback, useEffect, useState } from 'react';
import Button from '../components/input/Button';
import Input from '../components/input/Input';
import Select from 'react-select'
import { formatFileSize } from '../utils/formatFileSize';
import imageConverterImage from '../assets/imageconverter-min.png';
import { FileDragDrop } from '../components/layout/FileDragDrop';

const fileTypeMap = {
  "font/ttf": "TTF"
}

const outputFormat = {
  "WOFF2": "font/woff2",


}
const options = Object.keys(outputFormat).map((typeName) => ({ value: outputFormat[typeName], label: typeName }))

function FontConverter({ croptovideo }) {
  const [files, setFiles] = useState([]);
  const [fileType, setFileType] = useState('font/woff2');
  const [isLoading, setIsLoading] = useState(false);

  const [downloadFiles, setDownloadFiles] = useState([]);



  const submit = useCallback(async (e) => {
    const formData = new FormData();
    for (const file of files) {
      formData.append("files", file.file);
    }
    formData.set("fileType", fileType)

    try {
      setIsLoading(true);
      const response = await fetch("/convertFont", {
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
    setDownloadFiles,
    setIsLoading])


  const handleDownload = (file) => (e) => {
    window.open('/download?file=' + encodeURI(file.path + file.name))
  }

  return <div id="imageConverter">

    <div className='flex content-center justify-center items-center'><img style={{ width: '150px' }} src={imageConverterImage}></img> <h1>Font Converter</h1></div>

    <FileDragDrop allowableFileTypes={fileTypeMap} onChange={setFiles} />


    <div className={`${!isLoading && 'hidden'}`}>Loading...</div>


    <div className={`flex content-center justify-center items-center ${isLoading && 'hidden'}`}>

      <Select className="w-96" options={options} value={
        options.filter(option =>
          option.value === fileType)
      } onChange={(e) => { setFileType(e.value) }} defaultValue={fileType || 'Select'}></Select>
      <div className="p-4">{fileType}</div>
      <Button size="large" onClick={submit}> Send </Button>


    </div>
    <div className="fileList flex">
      {Boolean(downloadFiles) && downloadFiles.length > 0 && downloadFiles.map((file, index) =>
        <div key={index} className="fileBlock">
          <img draggable="false" onMouseDown={() => false} onDragStart={() => false} onDrop={() => false} className="imageBlock" src={fileImage}></img>
          <span className="fileTypeBlock">{fileTypeMap[file.type]}</span>
          <span className="fileNameBlock">{file.name}</span>
          <span className="fileSizeBlock">{formatFileSize(file.size)}</span>

          <Button onClick={handleDownload(file)} >Download</Button>
        </div>)}
    </div>


  </div >
}

export default FontConverter