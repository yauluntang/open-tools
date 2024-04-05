import './ImageConverter.scss';
import fileImage from '../assets/file.svg';
import { useCallback, useEffect, useState } from 'react';

function swap(json) {
  var ret = {};
  for (var key in json) {
    ret[json[key]] = key;
  }
  return ret;
}

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
  "application/pdf": "PDF"
}

const outputFormat = {
  "JPG": "image/jpeg",
  "PNG": "image/png",
  "WEBP": "image/webp",
  "GIF": "image/gif",
  "AVIF": "image/avif",
  "TIF": "image/tiff",
  "PDF": "application/pdf"
}


function ImageConverter() {

  const [files, setFiles] = useState([]);
  const [fileType, setFileType] = useState('image/png');
  const [downloadFiles, setDownloadFiles] = useState([]);


  const dragOverHandler = (ev) => {
    ev.preventDefault();
  }

  const handleFiles = useCallback((thisFiles) => {

    console.log("fileType:", thisFiles.type)
    const thisFilesFiltered = thisFiles.filter(file => fileTypeMap[file.type]);
    setFiles([...files, ...thisFilesFiltered]);

  }, [setFiles, files])


  const dropHandler = useCallback((ev) => {
    ev.preventDefault();
    let listOfFiles = [];
    if (ev.dataTransfer.items) {
      [...ev.dataTransfer.items].forEach((item) => {
        console.log(item)
        if (item.kind === "file") {
          const file = item.getAsFile();
          listOfFiles.push(file)
        }
      });
    } else {
      // Use DataTransfer interface to access the file(s)
      [...ev.dataTransfer.files].forEach((file) => {
        listOfFiles.push(file)
      });
    }
    handleFiles(listOfFiles);
  }, [setFiles, files])


  const submit = useCallback(async (e) => {
    e.preventDefault();
    const formData = new FormData();
    for (const file of files) {
      formData.append("files", file);
    }
    formData.set("fileType", fileType)

    try {
      const response = await fetch("/send", {
        headers: {
          'Accept': 'application/json'
        },
        method: "post",
        body: formData,
      });
      const responseText = await response.json();
      setDownloadFiles(responseText.files)
    }
    catch (error) {
      console.error("Something went wrong!", error);
    }
  }, [files, fileType, setDownloadFiles])


  const handleDownload = (file) => (e) => {
    e.preventDefault();
    window.open('/download?file=' + encodeURI(file.name))
  }

  const handleDelete = useCallback((index) => (e) => {
    e.preventDefault();
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles)
  }, [setFiles, files])

  return <div id="imageConverter"><div
    className="dropZone"
    onDrop={dropHandler}
    onDragOver={dragOverHandler}>
    <p>Drag one or more files to this <i>drop zone</i>.</p>
    <div className="fileList">
      {Boolean(files) && files.length > 0 && files.map((file, index) =>
        <div key={index} className="fileBlock">
          <img draggable="false" onMouseDown={() => false} onDragStart={() => false} onDrop={() => false} className="imageBlock" src={fileImage}></img>
          <span className="fileTypeBlock">{fileTypeMap[file.type]}</span>
          <span className="fileNameBlock">{file.name}</span>
          <span onClick={handleDelete(index)} className="deleteButtonBlock">X</span>
        </div>)}
    </div>
  </div>
    <select onChange={(e) => { setFileType(e.target.value) }} value={fileType}>
      {Object.keys(outputFormat).map((typeName, index) => <option key={index} value={outputFormat[typeName]}>{typeName}
      </option>)}</select>{fileType}
    <div className="fileList">
      {Boolean(downloadFiles) && downloadFiles.length > 0 && downloadFiles.map((file, index) =>
        <div key={index} className="fileBlock">
          <img draggable="false" onMouseDown={() => false} onDragStart={() => false} onDrop={() => false} className="imageBlock" src={fileImage}></img>
          <span className="fileTypeBlock">{fileTypeMap[file.type]}</span>
          <span className="fileNameBlock">{file.name}</span>
          <button onClick={handleDownload(file)} >Download</button>
        </div>)}
    </div>
    <button onClick={submit}> Send </button>
  </div>
}

export default ImageConverter