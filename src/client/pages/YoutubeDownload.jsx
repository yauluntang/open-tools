import axios from "axios";
import Input from "../components/input/Input"
import { useState } from "react";
import Button from "../components/input/Button";
import fileImage from '../assets/file.svg';
import { FileDownload } from "../components/layout/FileDownload";


export const YoutubeDownload = () => {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState('');
  const [downloadFiles, setDownloadFiles] = useState('');
  const submit = async () => {
    setIsLoading(true);
    const responseText = await axios.post("/api/ytdl", { url });
    setIsLoading(false);
    setDownloadFiles(responseText.data.files)
  }


  return <div style={{ padding: '30px', display: 'flex', width: '50%', alignItems: 'center', justifyContent: 'center', textAlign: 'center', margin: 'auto' }}>
    <div style={{ width: '100%', padding: '30px' }} className="w-100">
      <div>
        <Input value={url} onChange={setUrl} />
      </div>
      <Button size="large" onClick={submit}> Send </Button>

      <FileDownload downloadFiles={downloadFiles} />
    </div>
  </div>
}