import { formatFileSize } from "../../utils/formatFileSize"
import fileImage from '../../assets/file.svg';
import Button from "../input/Button";

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

export const FileDownload = ({ downloadFiles }) => {
  const handleDownload = (file) => (e) => {
    window.open('/api/download?file=' + encodeURI(file.path + file.name))
  }

  return <div className="fileList flex">
    {Boolean(downloadFiles) && downloadFiles.length > 0 && downloadFiles.map((file, index) =>
      <div key={index} className="fileBlock">
        <img draggable="false" onMouseDown={() => false} onDragStart={() => false} onDrop={() => false} className="imageBlock" src={fileImage}></img>
        <span className="fileTypeBlock">{fileTypeMap[file.type]}</span>
        <span className="fileNameBlock">{file.name}</span>
        <span className="fileSizeBlock">{formatFileSize(file.size)}</span>

        <Button onClick={handleDownload(file)} >Download</Button>
      </div>)}
  </div>
}