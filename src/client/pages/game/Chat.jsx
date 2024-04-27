
import { useCallback, useEffect, useState } from 'react';
import Input from '../../components/input/Input';
import Button from '../../components/input/Button';
import moment from 'moment';
import axios from 'axios';
import SockJS from 'sockjs-client'
import { GameServer } from '../../utils/gameServer';
import { CardImage } from './CardImage';
import { Blackjack } from './Blackjack';


//const socket = io;

//const socket = new Primus(`${window.location.protocol}://${window.location.hostname}`);

const gameServer = new GameServer('/api/echo');

export const Chat = () => {
  const [message, setMessage] = useState([]);

  const [text, setText] = useState('');
  const [name, setName] = useState('');
  const [currentRoom, setCurrentRoom] = useState(null);




  const [rooms, setRooms] = useState(null);


  const [tempname, setTempname] = useState('');

  const [channelInfo, setChannelInfo] = useState(null);

  gameServer.init(() => {
    //gameServer.joinChannel('lobby')
    //gameServer.getChannel('lobby')
  });
  //socket.send('hi', 'hello world')

  gameServer.setDataReceiveCallback({ scope: 'CHANNEL', channelName: 'lobby', uniqueKey: 'chat' }, useCallback(async (msg) => {

    if (msg.type === 'MESSAGE') {
      const row = {};
      row.timeStamp = msg.timeStamp;
      row.text = msg.message.text;
      row.name = msg.message.name;
      const newMessages = [...message];
      newMessages.push(row);
      setMessage(newMessages);
    }
    else if (msg.type === 'INFO') {
      const { channelSize, clientNames } = msg.message;
      setChannelInfo({ channelSize, clientNames })

    }
  }, [message, setMessage]))


  gameServer.setDataReceiveCallback({ scope: 'GLOBAL', uniqueKey: 'chat' }, useCallback(async (msg) => {
    console.log('setDataReceiveCallback', 'ROOMLIST', msg)
    setRooms(msg.message.roomList)
  }), [setRooms, rooms])


  gameServer.setDataReceiveCallback({ scope: 'ROOM', uniqueKey: 'chat' }, useCallback(async (msg) => {
    console.log('setRoomcallback', msg)
    if (msg.type === 'INFO') {
      setCurrentRoom(msg.message);
    }
    else if (msg.type === 'LEAVE') {
      setCurrentRoom(null);
    }

  }), [setCurrentRoom, currentRoom])


  const send = useCallback(() => {
    gameServer.sendChannelMessage('lobby', { name, text })
    setText('')
  }, [text, setText])

  const enterName = useCallback(() => {
    setName(tempname);
    gameServer.rename(tempname)
    gameServer.joinChannel('lobby')
    gameServer.getRoomList();

  }, [tempname, setTempname, setName])

  const createGame = useCallback(() => {
    gameServer.createRoom('Blackjack', 'Blackjack');
  })

  /*
  sock.onopen = () => {
    console.log('open');
    sock.send(JSON.stringify({ type: 'test' }));
  };

  sock.onmessage = useCallback((msg, cb2) => {
    console.log('test', msg, cb2);
    const newMessages = [...message];
    const row = JSON.parse(msg.data);
    row.timeStamp = msg.timeStamp;
    newMessages.push(row);
    setMessage(newMessages);
  }, [message, setMessage])

  sock.onclose = () => {
    console.log('close');
  };

  const joinAs = useCallback(() => {

  })

  const send = useCallback(() => {
    sock.send(JSON.stringify({ type: 'chat', name, text }));
    setText('')
  }, [text, setText])*/

  const exit = useCallback(() => {
    gameServer.leaveChannel('lobby')
    setName('')
  }, [name, setName])



  const joinRoom = (roomName) => () => {
    gameServer.send('ROOM', 'JOIN', { roomName })
  }



  useEffect(() => {
    /*
    const fetch = async () => {
      const responseText = await axios.get("/api/message");
      console.log(responseText.data)
      setMessage(responseText.data);
    }

    fetch();*/
    return () => {
      //gameServer.leaveChannel('lobby') 
    }
  }, [])

  return <div>

    {!name && <>
      <Input type="string" label="Your Name" value={tempname} onChange={setTempname} />
      <Button type="button" size="large" onClick={enterName} > Enter</Button>
    </>}
    {name && <div style={{ padding: '50px' }}>

      {!currentRoom && <><Button type="button" onClick={createGame}> Create Blackjack Game</Button>
        <div style={{ height: '300px', padding: '25px', background: 'white' }}>
          {rooms && rooms.map((room, i) => <div key={i}>
            {room.name} <Button type="button" size="medium" onClick={joinRoom(room.name)}>Join this room</Button> {room.size}/{room.capacity}</div>)}

        </div></>}

      {currentRoom && currentRoom.type === 'Blackjack' && <Blackjack gameServer={gameServer} />}



      <div style={{ height: '500px', padding: '25px', background: 'white' }}>
        {message.map((m, i) => <div key={i}>[{moment(m.timeStamp).format('YY-MM-DD hh:mm:ss')}] <b>{m.name}:</b> {m.text}</div>)}

      </div>
      {channelInfo && <div>{channelInfo?.clientNames.map((v, i) => <div key={i}>{v.name}</div>)}
      </div>}
      <form onSubmit={send}>

        <Input type="string" label="Text" value={text} onChange={setText} />
        <Button type="submit" size="large" onClick={send}  >Send </Button>
        <Button type="button" size="large" onClick={exit}  >Exit </Button>
      </form>
    </div>}</div>
}