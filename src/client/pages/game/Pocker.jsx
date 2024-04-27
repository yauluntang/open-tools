
import { Client } from "colyseus.js";
import { useEffect } from "react";
import Button from "../../components/input/Button";

const client = new Client(`ws://${window.location.hostname}`);
const allRooms = [];

export const Pocker = () => {

  /*
  let lobby;

  useEffect(() => {
    const joinRoom = async () => {
      lobby = await client.joinOrCreate("lobby");
    }
    const leaveRoom = async () => {
      lobby.leaveRoom();
    }


    joinRoom();



    return () => leaveRoom();
  }, [])

  const sendMessage = () => {
    lobby.send('Testing');
  }

  return <div>Pocker

    <Button onClick={sendMessage}>Send</Button>
  </div>*/


}