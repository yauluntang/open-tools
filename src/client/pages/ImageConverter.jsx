import './ImageConverter.scss';
import fileImage from '../assets/file.svg';
import { useCallback, useEffect, useState } from 'react';
import Button from '../components/input/Button';
import Select from 'react-select'
import { DragDropContext, Draggable } from 'react-beautiful-dnd';
import { StrictModeDroppable } from '../utils/StrictModeDroppable';
import { formatFileSize } from '../utils/formatFileSize';

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
  "AVIF": "image/avif",
  "TIF": "image/tiff",
  "PDF": "application/pdf"
}

const options = Object.keys(outputFormat).map((typeName) => ({ value: outputFormat[typeName], label: typeName }))

const grid = 8;

function ImageConverter() {

  const [isLoading, setIsLoading] = useState(false);
  const [files, setFiles] = useState([]);
  const [fileType, setFileType] = useState('image/png');
  const [downloadFiles, setDownloadFiles] = useState([]);
  const [fileSerial, setFileSerial] = useState(0);

  const getListStyle = isDraggingOver => ({
    background: isDraggingOver ? 'lightblue' : 'lightgrey',
    width: '100%',
    height: '200px',
    display: 'flex',
    padding: grid,
    overflowY: 'hidden',
    overflowX: 'auto',

  });

  const getItemStyle = (isDragging, draggableStyle) => ({
    // some basic styles to make the items look a bit nicer
    userSelect: 'none',
    padding: grid * 2,
    margin: `0 ${grid}px 0 0`,

    // change background colour if dragging
    background: isDragging ? 'lightgreen' : 'grey',

    // styles we need to apply on draggables
    ...draggableStyle,
  });


  const dragOverHandler = (ev) => {
    ev.preventDefault();
  }

  const handleFiles = useCallback((thisFiles) => {

    console.log("fileType:", thisFiles.type)
    let serial = fileSerial;
    const thisFilesFiltered = thisFiles.filter(file => fileTypeMap[file.type] && file.size < 10000000).map(file => {
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
  }, [files, fileType, setDownloadFiles, setIsLoading])


  const handleDownload = (file) => (e) => {
    window.open('/download?file=' + encodeURI(file.path + file.name))
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
    <div className="flex content-center justify-center items-center">
      {isLoading ? <div>Loading...</div> : <><Select className="w-96" options={options} defaultValue={options[1]} onChange={(e) => { setFileType(e.value) }} ></Select>
        <div className="p-4">{fileType}</div>
        <Button size="large" onClick={submit}> Send </Button></>}


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

export default ImageConverter