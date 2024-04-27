import sockjs from 'sockjs';


const handleGlobalData = async (gameServer, client, msg) => {
  switch (msg.type) {
    case 'RENAME': {
      if (msg.name) {
        client.name = msg.name;
      }
      break;
    }

    case 'ECHO': {
      gameServer.echo({ scope: 'GLOBAL', type: 'MESSAGE', message: msg.message, timeStamp: msg.timeStamp, id: client.id, sender: client.name }, client);
      break;
    }

    case 'MESSAGE': {
      gameServer.send({ scope: 'GLOBAL', type: 'MESSAGE', message: msg.message, timeStamp: msg.timeStamp, id: client.id, sender: client.name });
      break;
    }

    case 'ROOMLIST': {
      gameServer.sendRoomList();
      break;
    }

    default: {
      break;
    }
  }
}

const handleChannelData = async (gameServer, client, msg) => {
  switch (msg.type) {

    case 'JOIN': {
      if (msg.channelName) {
        if (!gameServer.channels.has(msg.channelName)) {
          gameServer.echo({ scope: 'CHANNEL', type: 'ERROR', error: 'Channel does not exist', timeStamp: msg.timeStamp, id: client.id, sender: client.name }, client);
          break;
        }
        client.joinedChannels.add(msg.channelName);
        gameServer.channels.get(msg.channelName).clients.set(client.id, client);
        gameServer.sendChannelInfo(msg.channelName);
      }
      break;
    }

    case 'INFO': {
      if (msg.channelName && gameServer.channels.has(msg.channelName)) {
        gameServer.sendChannelInfo(msg.channelName);
      }
      else {
        gameServer.echo({ scope: 'CHANNEL', type: 'ERROR', error: 'Channel does not exist', timeStamp: msg.timeStamp, id: client.id, sender: client.name }, client);
      }
      break;
    }

    case 'LEAVE': {
      if (msg.channelName) {
        gameServer.channels.get(msg.channelName).clients.delete(client.id);
        gameServer.sendChannelInfo(msg.channelName);
      }
      else {
        gameServer.echo({ scope: 'CHANNEL', type: 'ERROR', error: 'Channel does not exist', timeStamp: msg.timeStamp, id: client.id, sender: client.name }, client);
      }
      break;
    }
    case 'MESSAGE': {
      gameServer.send({ scope: 'CHANNEL', type: 'MESSAGE', message: msg.message, timeStamp: msg.timeStamp, id: client.id, sender: client.name }, msg.channelName);
      break;
    }

    default: {
      break;
    }
  }
}

const handleRoomData = async (gameServer, client, msg) => {


  let originalRoom = client.room;


  switch (msg.type) {



    /*
    case 'CREATE': {
      const roomType = msg.roomType;

      let roomName = msg.roomName;
      if (gameServer.rooms.has(roomName)) {
        roomName += new Date().getTime();
      }
      /*
      if (gameServer.rooms.has(roomName)) {
        gameServer.echo({ scope: 'ROOM', type: 'ERROR', error: 'Room already exist', timeStamp: msg.timeStamp, id: client.id, sender: client.name }, client);
        return;
      }

      const roomTypeOption = gameServer.roomTypeOptions.get(roomType);

      // Check max instances
      const hasRoomType = gameServer.roomsOfType.has(roomType);
      if (hasRoomType && roomTypeOption.maxInstances) {
        const mapRoomType = gameServer.roomsOfType.get(roomType);
        if (mapRoomType.size >= roomTypeOption.maxInstances) {
          gameServer.echo({ error: 'Room already exist', timeStamp: msg.timeStamp, id: client.id, sender: client.name }, client);
          return;
        }
      }
      const newRoom = {
        name: roomName,
        type: roomType,
        capacity: roomTypeOption.capacity,
        clients: new Map(),
        data: {
          clients: [],
          publicData: {},
          privateData: {}
        }
      };
      newRoom.clients.set(client.id, client);
      client.room = roomName;
      gameServer.rooms.set(roomName, newRoom);

      gameServer.sendRoomList();

      gameServer.sendRoomInfo(client.room, client);
      break;
    }*/

    case 'JOIN': {
      const roomName = msg.roomName;

      // Check existence
      if (!gameServer.rooms.has(roomName)) {
        gameServer.echo({ scope: 'ROOM', type: 'ERROR', error: 'Room does not exist', timeStamp: msg.timeStamp, id: client.id, sender: client.name }, client);
        return;
      }
      const room = gameServer.rooms.get(roomName);
      const roomTypeOption = gameServer.roomTypeOptions.get(room.type);

      if (!roomTypeOption) {
        gameServer.echo({ scope: 'ROOM', type: 'ERROR', error: 'Room Type Option is invalid', timeStamp: msg.timeStamp, id: client.id, sender: client.name }, client);
        return;
      }

      // Check capacity
      if (roomTypeOption.capacity && room.clients.size >= roomTypeOption.capacity) {
        gameServer.echo({ scope: 'ROOM', type: 'ERROR', error: 'Room is full', timeStamp: msg.timeStamp, id: client.id, sender: client.name }, client);
        return;
      }

      room.clients.set(client.id, client);
      client.room = roomName;
      originalRoom = roomName;

      gameServer.sendRoomList();

      gameServer.sendRoomInfo(client.room, client);
      break;
    }

    case 'LEAVE': {
      if (client.room) {
        const room = gameServer.rooms.get(client.room);
        const info = gameServer.getRoomInfo(client.room)

        room.clients.delete(client.id);

        /*
        if (room.clients.size === 0) {
          gameServer.rooms.delete(client.room);
        }*/

        gameServer.sendRoomList();

        gameServer.echo({ scope: 'ROOM', type: 'LEAVE', roomType: info.type }, client);

        client.room = null;
      }
      else {
        gameServer.echo({ scope: 'ROOM', type: 'ERROR', error: 'Not in a room', timeStamp: msg.timeStamp, id: client.id, sender: client.name }, client);
      }
      break;
    }

    case 'MESSAGE': {
      gameServer.sendRoom({ scope: 'ROOM', type: 'MESSAGE', message: msg.message, timeStamp: msg.timeStamp, id: client.id, sender: client.name }, client.room);
      break;
    }

    case 'DATA': {
      if (client.room) {
        const room = gameServer.rooms.get(client.room)
        const clientData = { ...room.data.clients }
        clientData[client.id] = { ...clientData[client.id], ...msg.message };
      }
      break;
    }
  }

  const info = gameServer.getRoomInfo(originalRoom);
  if (info) {
    //const customRoomCallback = gameServer.roomReceiveCallback[client.room];
    const customInstance = gameServer.roomInstance[originalRoom];
    const sendRoomFunc = (message) => {
      if (originalRoom) {
        gameServer.sendRoom(message, originalRoom)
      }
    };
    if (originalRoom) {
      const room = gameServer.rooms.get(originalRoom);
      await customInstance.callback({ gameServer, client, msg, sendRoomFunc, info, data: room.data, customInstance });
    }
  }

}


const handleIncomingData = async (gameServer, client, msg) => {

  console.log('handleIncomingData', msg);

  msg.connid = client.id;
  msg.timeStamp = new Date().getTime();

  if (msg.scope && msg.type && gameServer.dataReceiveCallback[`${msg.scope}/${msg.type}`]) {
    gameServer.dataReceiveCallback[`${msg.scope}/${msg.type}`](gameServer, client, msg);
  }

  if (msg.scope && gameServer.dataReceiveCallback[`${msg.scope}`]) {
    gameServer.dataReceiveCallback[`${msg.scope}`](gameServer, client, msg);
  }

  switch (msg.scope) {
    case 'GLOBAL': {
      await handleGlobalData(gameServer, client, msg);
      break;
    }
    case 'CHANNEL': {
      await handleChannelData(gameServer, client, msg);
      break;
    }
    case 'ROOM': {
      await handleRoomData(gameServer, client, msg);
      break;
    }
    default:
      break;
  }
}


export class GameServer {

  constructor(server, endpoint) {
    this.socket = sockjs.createServer(server);
    this.socket.installHandlers(server, { prefix: endpoint });
    this.server = server;
    this.customFunction = null;
    this.clients = new Map();
    this.channels = new Map();
    this.rooms = new Map();
    this.roomsOfType = new Map();
    this.roomTypeOptions = new Map();
    this.dataReceiveCallback = {};
    this.roomReceiveCallback = {};
    this.roomInstance = {};
    this.roomIntervalMap = {};
    this.socket.on('connection', (conn) => {
      this.connectionFunction(conn)
    })
  };

  addChannel(channelName) {
    if (!this.channels.has(channelName)) {
      this.channels.set(channelName, {
        clients: new Map(),
        previousMessages: []
      })
      return true;
    }
    else {
      console.error('Channel already exists');
      return false;
    }
  }

  removeChannel(channelName) {
    this.channels.delete(channelName);
  }

  setupRoomType(type, options) {
    this.roomTypeOptions.set(type, options);
  }


  connectionFunction(conn) {

    const client = {
      id: conn.id, connection: conn, joinedChannels: new Set(), name: conn.id, send: (message) => {
        conn.write(JSON.stringify(message));
      }, room: null
    };

    this.clients.set(conn.id, client);

    if (this.customFunction) {
      this.customFunction(conn);
    }

    this.echo({ scope: 'GLOBAL', type: 'CONNECT', message: { id: client.id, timeStamp: new Date().getTime() } }, client)

    conn.on('data', async (message) => {
      try {
        const msg = JSON.parse(message)
        await handleIncomingData(this, client, msg);
      }
      catch (e) {
        console.error(e.message);
        console.error(e)
      }

    });

    conn.on('close', async () => {
      try {
        for (let channelKey of client.joinedChannels) {
          handleIncomingData(this, client, { scope: 'CHANNEL', type: 'LEAVE', channelName: channelKey });
        }

        if (client.room) {
          handleIncomingData(this, client, { scope: 'ROOM', type: 'LEAVE' });
        }
        this.clients.delete(client.id);
      }
      catch (e) {
        console.error(e.message);
        console.error(e)
      }
    });


  }


  echo(message, client) {
    client?.connection.write(JSON.stringify(message));
  }


  // Send to Channel
  send(message, channelName) {

    console.log('send 1')

    if (!channelName) {
      this.broadcast(message)
      return;
    }
    message.channelName = channelName;

    console.log('send 2', message)
    for (const [_, client] of this.channels.get(channelName).clients) {
      client?.connection.write(JSON.stringify(message));
    }
  }

  sendRoom(message, roomName, options) {

    if (!this.rooms.has(roomName)) {
      console.error('Room does not exist');
      return;
    }
    message.roomName = roomName;

    for (const [_, client] of this.rooms.get(roomName).clients) {
      if (message.id !== client.id || !options.ignoreSelf) {
        client?.connection.write(JSON.stringify(message));
      }
    }
  }


  intervalCall = (roomName, instance, gameServer) => () => {

    const room = gameServer.rooms.get(roomName);
    const sendRoomFunc = (message) => {
      this.sendRoom(message, room.name)
    };
    instance.ping({ gameServer, data: gameServer.rooms.get(roomName).data, sendRoomFunc, instance })

  }



  setRoomReceiveCallback(roomName, roomType, instance) {
    //this.roomReceiveCallback[roomName] = roomReceiveCallback

    const roomTypeOption = this.roomTypeOptions.get(roomType);
    this.rooms.set(roomName, {
      name: roomName,
      type: roomType,
      capacity: roomTypeOption.capacity,
      clients: new Map(),
      data: {
        clients: [],
        publicData: {},
        privateData: {}
      }
    })
    this.roomInstance[roomName] = instance;



    if (instance.ping) {
      const interval = setInterval(this.intervalCall(roomName, instance, this), 500)

      this.roomIntervalMap[roomName] = interval;
    }

  }

  setDataReceiveCallback(scope, type, dataReceiveCallback) {
    if (scope && type) {
      this.dataReceiveCallback[`${scope}/${type}`] = dataReceiveCallback
    }
    else if (scope) {
      this.dataReceiveCallback[`${scope}`] = dataReceiveCallback
    }
  }

  setConnectionFunction(connectionFunction) {
    this.customFunction = connectionFunction;
  }

  sendRoomList() {
    const roomList = [];
    this.rooms.forEach((room) => {
      const { name, type, capacity } = room;
      const { size } = room.clients;
      roomList.push({ name, type, capacity, size })
    })
    this.send({ scope: 'GLOBAL', type: 'ROOMLIST', message: { roomList }, timeStamp: new Date().getTime() });
  }

  getRoomInfo(roomName) {
    let info = null;
    if (this.rooms.has(roomName)) {
      const room = this.rooms.get(roomName)
      const { name, type, capacity } = room;
      const clientNames = [];
      room.clients.forEach((v) => clientNames.push({ name: v.name, id: v.id }))
      info = { name, type, capacity, clientNames };
    }
    return info;
  }

  sendRoomInfo(roomName, client) {
    const info = this.getRoomInfo(roomName)
    if (info) {
      this.echo({ scope: 'ROOM', type: 'INFO', roomType: info.type, message: info, timeStamp: new Date().getTime() }, client);
    }
    else {
      console.error('sendRoomInfo: Room does not exist')
      return;
    }
  }


  broadcastRoomInfo(roomName, client) {
    const info = this.getRoomInfo(roomName)
    if (info) {
      this.sendRoom({ scope: 'ROOM', type: 'INFO', roomType: info.type, message: info, timeStamp: new Date().getTime(), id: client.id, sender: client.name }, roomName, { ignoreSelf: true });
    }
    else {
      console.error('sendRoomInfo: Room does not exist')
      return;
    }
  }

  sendChannelInfo(channelName) {
    if (this.channels.has(channelName)) {
      const channel = this.channels.get(channelName);
      const channelSize = channel.clients.size;
      const clientNames = [];
      channel.clients.forEach((v) => clientNames.push({ name: v.name, id: v.id }))
      this.send({ scope: 'CHANNEL', type: 'INFO', message: { channelSize, clientNames }, timeStamp: new Date().getTime() }, channelName);
    }
    else {
      console.error('sendChannelInfo: Channel does not exist')
      return;
    }
  }

  broadcast(message, options = {}) {
    console.log('broadcast', message)

    for (const [_, client] of this.clients) {
      if (message.id !== client.id || !options.ignoreSelf) {
        client.connection.write(JSON.stringify(message));
      }
    }
  }
}