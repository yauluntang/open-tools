
import SockJS from 'sockjs-client'

export class GameServer {
  constructor(endpoint) {
    this.endpoint = endpoint;
    this.sock = new SockJS(endpoint);
    this.dataReceiveCallback = {};
    this.dataReceiveCallbackList = [];
    this.clientId = null;
    this.sock.onopen = () => {
      if (this.initCallback) {
        this.initCallback();
      }
    }
    this.sock.onmessage = (msg) => {
      const message = JSON.parse(msg.data);
      message.detail = { ...msg }
      console.log(message);






      if (message.scope === 'GLOBAL' && message.type === 'CONNECT') {
        this.clientId = message.message.id;
      }

      Object.values(this.dataReceiveCallback).filter((callback) => {
        return (message.scope === callback.scope || !callback.scope) &&
          (message.type === callback.type || !callback.type) &&
          (message.roomName === callback.roomName || !callback.roomName) &&
          (message.channelName === callback.channelName || !callback.channelName)
      }).forEach(item => {

        console.log(item, message);
        item.callback(message)
      });



    }
  }

  init(initCallback) {
    this.initCallback = initCallback
  }

  setDataReceiveCallback({ scope, type, roomName, channelName, uniqueKey }, callback) {
    const mapKey = JSON.stringify({ scope, type, roomName, channelName, uniqueKey });

    const newCallback = { scope, type, roomName, channelName, uniqueKey, callback };
    this.dataReceiveCallback[mapKey] = newCallback


  }

  sendChannelMessage(channelName, message) {
    this.send('CHANNEL', 'MESSAGE', { channelName, message })
  }
  setName(name) {
    this.send('GLOBAL', 'RENAME', { name });
  }

  getRoomList(channelName) {
    this.send('GLOBAL', 'ROOMLIST', { channelName });
  }

  getChannel(channelName) {
    this.send('CHANNEL', 'INFO', { channelName });
  }

  joinChannel(channelName) {
    this.send('CHANNEL', 'JOIN', { channelName });
  }

  leaveChannel(channelName) {
    this.send('CHANNEL', 'LEAVE', { channelName });
  }

  createRoom(roomName, roomType) {
    this.send('ROOM', 'CREATE', { roomName, roomType });
  }

  sendMessage(message) {
    this.send('GLOBAL', 'MESSAGE', { message })
  }

  send(scope, type, sendObject) {
    this.sock.send(JSON.stringify({ scope, type, ...sendObject }));
  }

  rename(name) {
    this.send('GLOBAL', 'RENAME', { name })
  }

  end() {
    this.sock.end();
  }
}