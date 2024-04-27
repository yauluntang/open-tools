import { useCallback, useEffect, useState } from "react";
import Button from "../../components/input/Button";
import { CardImage } from "./CardImage";
import { Chip } from "./Chip";
import { calculateMaxScore, calculateSoftScore, isSplittable } from "./calculate";



const DrawHandSmall = ({ hand }) => {

  return <div style={{ height: "200px" }}>
    <div style={{ display: 'flex' }}>
      {hand && hand.map((card, index) => <CardImage height={50} width={25} number={card} key={index} />)}

      {calculateMaxScore(hand) > 21 && <div style={{ position: 'absolute', fontSize: '12px', marginTop: '25px', marginLeft: '10px', padding: '1px', background: 'rgba(255,255,255,0.9)', border: '1px solid black' }}>BUSTED</div>}

    </div>
    {hand && <Score softScore={calculateSoftScore(hand)} maxScore={calculateMaxScore(hand)} />}

  </div>
}

const DrawHand = ({ hand }) => {
  return <div >
    <div style={{ position: 'relative', width: `${hand.length * 30 + 100}px`, height: '100px', display: 'flex', alignItems: 'center' }}>
      {hand && hand.map((card, index) =>
        <div style={{ position: 'absolute', left: `${index * 30}px` }} key={index}>
          <CardImage largeForm height={100} number={card} /></div>)}
      {calculateMaxScore(hand) > 21 && <div style={{ position: 'absolute', fontSize: '30px', marginLeft: '10px', padding: '5px', background: 'rgba(255,255,255,0.9)', border: '1px solid black' }}>BUSTED</div>}
    </div >
    {hand && <Score softScore={calculateSoftScore(hand)} maxScore={calculateMaxScore(hand)} />}
  </div>


}

const Score = ({ softScore, maxScore }) => {

  return <div style={{ display: 'flex' }}>  {(maxScore === softScore) ? <div>{softScore}</div> : <div>{softScore}/{maxScore}</div>}</div>
}

export const Blackjack = ({ gameServer }) => {

  const [roomData, setRoomData] = useState();
  const [player, setPlayer] = useState();
  const [currentRoom, setCurrentRoom] = useState();

  const startGame = () => {
    gameServer.send('ROOM', 'DATA', { data: 'START' });

  }

  const hitCard = (index) => () => {
    gameServer.send('ROOM', 'DATA', { data: 'HIT', index })
  }

  const stand = (index) => () => {
    gameServer.send('ROOM', 'DATA', { data: 'STAND', index })
  }

  const double = () => {
    gameServer.send('ROOM', 'DATA', { data: 'DOUBLE' })
  }

  const splitHand = (index) => () => {
    gameServer.send('ROOM', 'DATA', { data: 'SPLIT', index })

  }

  gameServer.setDataReceiveCallback({ scope: 'ROOM', uniqueKey: 'blackjack' }, useCallback(async (msg) => {
    console.log('setRoomcallback', msg)
    if (msg.type === 'INFO') {
      setCurrentRoom(msg.message);
    }
    if (msg.type === 'DATA') {
      setRoomData(msg.message);

      console.log('gameServer.clientId', gameServer.clientId)
      const { clientList } = msg.message;
      const player = clientList.find((client) => client.id === gameServer.clientId);
      setPlayer(player);

    }



  }), [setCurrentRoom, setRoomData, roomData])



  const leaveGame = () => {
    gameServer.send('ROOM', 'LEAVE');
  }

  return <div>





    {roomData && <Button type="button" size="large" onClick={leaveGame}  >Leave Game </Button>}

    {roomData && roomData.clientList && <div>

      <div style={{ border: '1px solid grey' }}><div><Score softScore={roomData.houseSoftScore} maxScore={roomData.houseMaxScore} /> </div><DrawHand hand={roomData.house}></DrawHand> </div>

      <div style={{ border: '1px solid grey' }}>
        {roomData.clientList.filter((client) => (client.id !== gameServer.clientId || true)).map((client, index) => <div key={index}>

          <div style={{ display: 'flex' }}>
            <div>{client.name} have: {client.money} bet: {client.bet} winnings: {client.win} </div>
            {client.isCurrentPlayer && <div>   Waiting...  ({client.wait}) </div>} </div>

          <div style={{ display: 'flex' }}>{client.hands.map((hand, index) => <div style={{ height: '80px' }} key={index}><DrawHandSmall hand={hand.hand}></DrawHandSmall> </div>)}</div>

        </div>)}

      </div>

      <Chip value={10} />
      <Chip value={20} />
      <Chip value={100} />
      <Chip value={200} />

      {player && <div>
        YOU: have:{player.money}  bet: {player.bet} winnings: {player.win}
        {player.hands.map((hand, index) => <div key={index}>
          <div><DrawHand hand={hand.hand} handWin={hand.win}></DrawHand> </div>
          {player.isCurrentPlayer && !hand.stand && <>
            <Button type="button" size="large" onClick={hitCard(index)}  >HIT </Button>
            <Button type="button" size="large" onClick={stand(index)}  >STAND  </Button>
            {player.hands.length === 1 && hand.hand.length === 2 && <Button type="button" size="large" onClick={double}  >DOUBLE </Button>}

            {isSplittable(hand.hand) && <Button type="button" size="large" onClick={splitHand(index)}  >SPLIT  </Button>}
            <div>({player.wait})</div>
          </>}

        </div>)}
      </div>}
    </div>}
  </div>
}