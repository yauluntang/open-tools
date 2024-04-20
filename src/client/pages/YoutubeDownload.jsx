import axios from "axios";
import Input from "../components/input/Input"
import { useState } from "react";
import Button from "../components/input/Button";
import ytimage from '../assets/youtube.jpg';
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


  return <div style={{
    padding: '30px', display: 'flex', maxWidth: '1000px', alignItems: 'center', justifyContent: 'center', textAlign: 'center', margin: 'auto'
  }}>
    <div style={{ width: '100%', padding: '30px', textAlign: 'center', display: 'flex', flexDirection: 'column' }} className="w-100">
      <div style={{ height: '200px', padding: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <img src={ytimage} style={{ objectFit: 'contain', textAlign: 'center', maxWidth: '400px' }} />
      </div>
      <div style={{ width: '100%', padding: '30px' }}>
        <Input value={url} onChange={setUrl} />
      </div>
      <Button size="large" onClick={submit}> Send </Button>

      <FileDownload downloadFiles={downloadFiles} />
    </div>
  </div >
}