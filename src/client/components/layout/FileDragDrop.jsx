import { DragDropContext, Draggable } from "react-beautiful-dnd"
import { StrictModeDroppable } from "../../utils/StrictModeDroppable"
import { useCallback, useEffect, useState } from "react";
import fileImage from '../../assets/file.svg';

import Button from "../input/Button";
import { formatFileSize } from "../../utils/formatFileSize";
import { alphabeticSort, fileNameSort, semanticSort } from "../../utils/semanticSort";

const getFileExtension = (filename) => (/[.]/.exec(filename)) ? /[^.]+$/.exec(filename)[0] : undefined;

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

const FileDragDrop = ({ allowableFileTypes, fileMaxSize = 50000000, onChange }) => {

  const [files, setFiles] = useState([]);
  const [fileSerial, setFileSerial] = useState(0);


  const handleFiles = useCallback((thisFiles) => {


    console.log("fileType:", thisFiles.type)


    let allowableFileTypesExtension = {};
    for (let key in allowableFileTypes) {
      allowableFileTypesExtension[allowableFileTypes[key]] = true;
    }

    let serial = fileSerial;



    const filtered = thisFiles.filter(file => {
      console.log(file.name);
      console.log(getFileExtension(file.name).toUpperCase());
      console.log(allowableFileTypesExtension)
      return (allowableFileTypes[file.type] || allowableFileTypesExtension[getFileExtension(file.name).toUpperCase()]) && file.size < fileMaxSize
    })

    const thisFilesFiltered = filtered.map(file => {
      serial++;
      return { file, serial, name: file.name, type: file.type, size: file.size }
    });
    setFileSerial(serial);
    setFiles([...files, ...thisFilesFiltered]);
    console.log(thisFilesFiltered);
  }, [setFiles, files, fileSerial, setFileSerial])



  const dragOverHandler = (ev) => {
    ev.preventDefault();
  }


  const dropHandler = useCallback((ev) => {
    ev.preventDefault();
    let listOfFiles = [];
    if (ev.dataTransfer.items) {
      [...ev.dataTransfer.items].forEach((item) => {
        console.log(item)
        if (item.kind === "file") {
          const file = item.getAsFile();
          console.log(file)
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

  const getListStyle = isDraggingOver => ({
    background: isDraggingOver ? 'lightblue' : 'lightgrey',
    width: '100%',
    height: '200px',
    display: 'flex',
    padding: 'grid',
    overflowY: 'hidden',
    overflowX: 'auto',
  });

  const getFile = () => {
    document.getElementById('fileInput').click();
  }

  const doSemanticSort = useCallback(() => {
    const newSortFile = [...files];
    newSortFile.sort(fileNameSort(semanticSort));
    setFiles(newSortFile)
  }, [files])

  const doAlphabeticSort = useCallback(() => {
    const newSortFile = [...files];
    newSortFile.sort(fileNameSort(alphabeticSort));
    setFiles(newSortFile)
  }, [files])

  useEffect(() => {
    onChange(files);
  }, [files])





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
    <input id="fileInput" hidden type="file" multiple onChange={handleUserInputFiles} value={null}></input>

    <Button className="ml-4 mr-4" type="primary" size="large" onClick={getFile}> Add Files </Button>
    <Button className="ml-4 mr-4" type="danger" size="large" onClick={clearQueue}> Clear Queue </Button>

    <Button className="ml-4 mr-4" type="primary" size="large" onClick={doSemanticSort}> Sort Semantic </Button>
    <Button className="ml-4 mr-4" type="primary" size="large" onClick={doAlphabeticSort}> Sort Alphabetic </Button>
  </div>
}

export { FileDragDrop }