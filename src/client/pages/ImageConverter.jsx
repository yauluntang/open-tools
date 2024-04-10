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
  const [fileSerial, setFileSerial] = useState(0);


  const [leftCrop, setLeftCrop] = useState(0);
  const [rightCrop, setRightCrop] = useState(0);
  const [topCrop, setTopCrop] = useState(0);
  const [bottomCrop, setBottomCrop] = useState(0);


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


  const getListStyle = isDraggingOver => ({
    background: isDraggingOver ? 'lightblue' : 'lightgrey',
    width: '100%',
    height: '200px',
    display: 'flex',
    padding: grid,
    overflowY: 'hidden',
    overflowX: 'auto',

  });


  const dragOverHandler = (ev) => {
    ev.preventDefault();
  }

  const handleFiles = useCallback((thisFiles) => {

    console.log("fileType:", thisFiles.type)
    let serial = fileSerial;
    const thisFilesFiltered = thisFiles.filter(file => fileTypeMap[file.type] && file.size < 50000000).map(file => {
      serial++;
      return { file, serial, name: file.name, type: file.type, size: file.size }
    });

    setFileSerial(serial);

    setFiles([...files, ...thisFilesFiltered]);

    console.log(thisFilesFiltered);

  }, [setFiles, files, fileSerial, setFileSerial])


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

  const reorder = (list, startIndex, endIndex) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    return result;
  };

  const onDragEnd = useCallback((result) => {
    // dropped outside the list
    if (!result.destination) {
      return;
    }

    const newFiles = reorder(
      files,
      result.source.index,
      result.destination.index
    );

    setFiles(newFiles)
  }, [files, setFiles])


  const submit = useCallback(async (e) => {
    const formData = new FormData();
    for (const file of files) {
      formData.append("files", file.file);
    }
    formData.set("fileType", fileType)
    formData.set("leftCrop", leftCrop)
    formData.set("rightCrop", rightCrop)
    formData.set("topCrop", topCrop)
    formData.set("bottomCrop", bottomCrop)

    try {
      setIsLoading(true);
      const response = await fetch("/send", {
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
    window.open('/download?file=' + encodeURI(file.path + file.name))
  }

  const handleDelete = useCallback((index) => (e) => {
    e.preventDefault();
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles)
  }, [setFiles, files])

  const clearQueue = useCallback(() => {
    setFiles([]);
  }, [setFiles, files])

  const handleUserInputFiles = useCallback((e) => {
    console.log(e.target.files)

    let thisFiles = [];

    for (let i = 0; i < e.target.files.length; i++) {
      thisFiles.push(e.target.files[i])
    }
    handleFiles(thisFiles)

  }, [setFiles, files])

  return <div id="imageConverter">

    <div className='flex content-center justify-center items-center'><img style={{ width: '150px' }} src={imageConverterImage}></img> <h1>Image Converter</h1></div>
    <div
      className="dropZone"
      onDrop={dropHandler}
      onDragOver={dragOverHandler}>
      <p className="absolute p-4 grey select-none">Drag one or more files to this <i>drop zone</i>.</p>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="fileList">
          <StrictModeDroppable droppableId="droppable" direction="horizontal">{(provided, snapshot) => (
            <div {...provided.droppableProps}
              ref={provided.innerRef}
              style={getListStyle(snapshot.isDraggingOver)}>
              {Boolean(files) && files.length > 0 && files.map((file, index) =>


                <Draggable key={`droppable-${file.serial}`} id={`droppable-${file.serial}`} draggableId={`droppable-${file.serial}`} index={index}>
                  {(provided, snapshot) => (

                    <div className="fileBlock" ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}>
                      <img draggable="false" onMouseDown={() => false} onDragStart={() => false} onDrop={() => false} className="imageBlock" src={fileImage}></img>
                      <span className="fileTypeBlock">{fileTypeMap[file.type]}</span>
                      <span className="fileNameBlock">{file.name}</span>
                      <span className="fileSizeBlock">{formatFileSize(file.size)}</span>
                      <span onClick={handleDelete(index)} className="deleteButtonBlock">X</span>
                    </div>

                  )}

                </Draggable>

              )}
            </div>
          )}
          </StrictModeDroppable>
        </div>

      </DragDropContext>
    </div>
    <div className={`${!isLoading && 'hidden'}`}>Loading...</div>


    <div className={`flex content-center justify-center items-center ${isLoading && 'hidden'}`}>

      <input type="file" multiple onChange={handleUserInputFiles}></input>
      <Select className="w-96" options={options} value={
        options.filter(option =>
          option.value === fileType)
      } onChange={(e) => { setFileType(e.value) }} defaultValue={fileType || 'Select'}></Select>
      <div className="p-4">{fileType}</div>
      <Button size="large" onClick={submit}> Send </Button>
      <Button className="ml-4 mr-4" type="danger" size="large" onClick={clearQueue}> Clear Queue </Button>


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

    <div>
      <Input label="Left Crop" type="number" value={leftCrop} onChange={setLeftCrop} />
      <Input label="Right Crop" type="number" value={rightCrop} onChange={setRightCrop} />
      <Input label="Top Crop" type="number" value={topCrop} onChange={setTopCrop} />
      <Input label="Bottom Crop" type="number" value={bottomCrop} onChange={setBottomCrop} />
    </div>
  </div >
}

export default ImageConverter