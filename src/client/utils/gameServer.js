
import SockJS from 'sockjs-client'

export class GameServer {
  constructor(endpoint) {
    this.endpoint = endpoint;
    this.sock = null;
    this.new_conn();
    this.dataReceiveCallback = {};
    this.dataReceiveCallbackList = [];
    this.clientId = null;
    this.recInterval = null;
    this.onCloseCallback = null;
    this.errorCallback = (e) => {
      console.error(e)
    };
    this.times = 1;
    this.sock.onopen = () => {
      console.log('CONNECTED');
      if (this.initCallback) {
        this.initCallback();
      }
      if (this.recInterval) {
        clearInterval(this.recInterval);
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
        if (item && item.callback) {
          item.callback(message)
        }

      });
    }
    this.sock.onclose = () => {
      console.log('DISCONNECTED');
      this.onCloseCallback();
      this.recInterval = window.setInterval(this.new_conn.bind(this), 2000);
    };

  }

  new_conn = function () {
    try {
      if (this.errorCallback) {
        this.errorCallback('reconnect ' + this.times);
      }
      this.times++;
      this.sock = new SockJS(this.endpoint);
    }
    catch (e) {
      if (this.errorCallback) {
        this.errorCallback(e.message);
      }
    }
  };

  init(initCallback) {
    this.initCallback = initCallback
  }

  setErrorCallback(callback) {
    this.errorCallback = callback;
  }

  setDataReceiveCallback({ scope, type, roomName, channelName, uniqueKey }, callback) {
    const mapKey = JSON.stringify({ scope, type, roomName, channelName, uniqueKey });

    const newCallback = { scope, type, roomName, channelName, uniqueKey, callback };
    this.dataReceiveCallback[mapKey] = newCallback
  }

  setOnCloseCallback(callback) {
    this.onCloseCallback = callback;
  }

  joinRoom(roomName) {
    this.send('ROOM', 'JOIN', { roomName });
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
    try {
      this.sock.send(JSON.stringify({ scope, type, ...sendObject }));
    }
    catch (e) {
      if (errorCallback) {
        this.errorCallback(e.message);
      }
    }
  }

  rename(name) {
    this.send('GLOBAL', 'RENAME', { name })
  }

  end() {
    this.sock.end();
  }
}