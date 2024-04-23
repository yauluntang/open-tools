
import { useCallback, useState } from 'react';
import Input from '../../components/input/Input';
import Button from '../../components/input/Button';
import SockJS from 'sockjs-client';
import moment from 'moment';


const sock = new SockJS('/api/echo');

//const socket = io;

export const Chat = () => {
  const [message, setMessage] = useState([]);

  const [text, setText] = useState('');
  const [name, setName] = useState('');

  sock.onmessage = useCallback((msg) => {

    console.log(msg);

    const newMessages = [...message];
    const row = JSON.parse(msg.data);
    row.timeStamp = msg.timeStamp;
    newMessages.push(row);
    setMessage(newMessages);
  }, [message, setMessage])
  /*
    socket.on('chat message', useCallback((msg) => {
  
      const newMessages = [...message];
      newMessages.push(msg);
      setMessage(newMessages);
  
  
    }, [message]))*/
  const send = useCallback(() => {
    sock.send(JSON.stringify({ name, text }));
    setText('')
  }, [text, setText])


  return <div style={{ padding: '50px' }}>
    <div style={{ height: '500px', padding: '25px', background: 'white' }}>
      {message.map((m, i) => <div key={i}>[{moment(m.timeStamp).format('hh:mm:ss')}] <b>{m.name}:</b> {m.text}</div>)}

    </div>
    <Input type="string" label="Your Name" value={name} onChange={setName} />
    <Input type="string" label="Text" value={text} onChange={setText} />
    <Button size="large" onClick={send} text="Send" >Send </Button>
  </div>
}