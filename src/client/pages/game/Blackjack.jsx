import { useCallback, useEffect, useState } from "react";
import Button from "../../components/input/Button";
import { CardImage } from "./CardImage";
import { Chip } from "./Chip";
import { calculateMaxScore, calculateSoftScore, isBlackJack, isSplittable } from "./calculate";



const DrawHandSmall = ({ hand, handWin }) => {

  return <div style={{ height: "100px" }}>
    <div style={{ display: 'flex', position: 'relative', width: `${25 * hand.length + 25}px` }}>
      {hand && hand.map((card, index) => <CardImage height={50} width={25} number={card} key={index} />)}

      <div style={{ position: 'relative' }}>{hand && <Score softScore={calculateSoftScore(hand)} maxScore={calculateMaxScore(hand)} />}</div>

      {calculateMaxScore(hand) > 21 &&
        <div style={{ position: 'absolute', fontSize: '12px', bottom: '2px', left: '2px', padding: '1px', background: 'rgba(255,255,255,0.9)', border: '1px solid black' }}>
          BUSTED
        </div>}

      {isBlackJack(hand) &&
        <div style={{ fontWeight: 'bold', position: 'absolute', fontSize: '12px', bottom: '2px', left: '2px', padding: '1px', background: 'rgba(255,0,0,1)', color: 'white', border: '1px solid black' }}>
          BLACKJACK
        </div>}

      {Boolean(handWin) &&
        <div style={{ fontWeight: 'bold', position: 'absolute', fontSize: '12px', top: '2px', marginLeft: '5px', padding: '1px', background: handWin > 0 ? 'rgba(0,128,0,1)' : 'rgba(255,0,0,1)', color: 'white', border: '1px solid black' }}>
          {handWin > 0 ? '+' + handWin : handWin}
        </div>}
    </div>

  </div>
}

const DrawHand = ({ hand, handWin }) => {
  return <div style={{ display: 'flex', width: `${hand.length * 30 + 80}px` }}>
    <div style={{ position: 'relative', width: `${hand.length * 30 + 50}px`, height: '100px', display: 'flex', alignItems: 'center' }}>
      {hand && hand.map((card, index) =>
        <div style={{ position: 'absolute', left: `${index * 30}px` }} key={index}>
          <CardImage largeForm height={100} number={card} /></div>)}
      {calculateMaxScore(hand) > 21 && <div style={{ position: 'absolute', fontSize: '24px', bottom: '2px', marginLeft: '5px', padding: '5px', background: 'rgba(255,255,255,0.9)', border: '1px solid black' }}>BUSTED</div>}

      {isBlackJack(hand) &&
        <div style={{ fontWeight: 'bold', position: 'absolute', fontSize: '24px', bottom: '2px', marginLeft: '5px', padding: '1px', background: 'rgba(255,0,0,1)', color: 'white', border: '1px solid black' }}>
          BLACKJACK
        </div>}

      {Boolean(handWin) &&
        <div style={{ fontWeight: 'bold', position: 'absolute', fontSize: '24px', top: '2px', marginLeft: '5px', padding: '1px', background: handWin > 0 ? 'rgba(0,128,0,1)' : 'rgba(255,0,0,1)', color: 'white', border: '1px solid black' }}>
          {handWin > 0 ? '+' + handWin : handWin}
        </div>}

    </div >
    {hand && <div style={{ position: 'relative' }}><Score softScore={calculateSoftScore(hand)} maxScore={calculateMaxScore(hand)} /></div>}
  </div>


}

const Score = ({ softScore, maxScore }) => {

  return <>{Boolean(softScore) && Boolean(maxScore) && <div style={{ userSelect: 'none', position: 'absolute', background: 'white', display: 'flex', border: '1px solid black', borderRadius: '4px', padding: '2px', fontSize: '12px', fontWeight: 'bold' }}>
    {(maxScore === softScore) ? <div>{softScore}</div> : <div>
      <div style={{ borderBottom: '1px solid black', textAlign: 'center' }}>{maxScore}</div>
      <div style={{ textAlign: 'center' }}>{softScore}</div>
    </div>}
  </div>}</>
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







    {roomData && roomData.clientList && <div>


      <div style={{ display: 'flex', justifyContent: 'space-between' }}>

        <div >
          DEALER
          <DrawHand hand={roomData.house}></DrawHand> </div>

        <div>


          {roomData.clientList.filter((client) => (client.id !== gameServer.clientId)).map((client, index) => <div style={{ background: `${client.isCurrentPlayer ? 'yellow' : 'white'}`, mragin: '2px', borderRadius: '5px', padding: '5px' }} key={index}>

            <div style={{ display: 'flex' }}>
              <div style={{ fontSize: '12px' }}>{client.name} <b>${client.money}</b></div>
            </div>

            <div style={{ display: 'flex' }}>{client.hands.map((hand, index) => <div style={{ height: '50px' }} key={index}><DrawHandSmall hand={hand.hand} handWin={hand.win}></DrawHandSmall> </div>)}</div>

          </div>)}

        </div></div>

      {player && <div style={{ background: `${player.isCurrentPlayer ? 'yellow' : 'white'}`, border: '1px solid #ddd', padding: '5px', borderRadius: '5px' }}>
        YOU ({player.name}): <b>${player.money}</b>  -${player.bet}  {player.isCurrentPlayer && <span style={{ marginLeft: '20px' }}>Remaining ({player.wait}s) </span>}
        {player.hands.map((hand, index) => <div key={index}>
          <div><DrawHand hand={hand.hand} handWin={hand.win}></DrawHand> </div>

          {<>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div>
                {player.isCurrentPlayer && !hand.stand && <>
                  <Button style={{ margin: '0px 5px', width: '100px' }} type="danger" size="large" onClick={hitCard(index)}  >HIT </Button>
                  <Button style={{ margin: '0px 5px', width: '100px' }} type="primary" size="large" onClick={stand(index)}  >STAND  </Button>
                  {player.hands.length === 1 && hand.hand.length === 2 && <Button style={{ margin: '0px 5px', width: '100px' }} type="info" size="large" onClick={double}  >DOUBLE </Button>}

                  {isSplittable(hand.hand) && player.hands.length < 2 && <Button style={{ margin: '0px 5px', width: '100px' }} type="warn" size="large" onClick={splitHand(index)}  >SPLIT  </Button>}</>}
              </div>

            </div>
          </>}

        </div>)}
        <div style={{ textAlign: 'right' }}>
          <Button type="button" size="large" onClick={leaveGame}  >Leave Game </Button>
        </div>
      </div>}
    </div>}
  </div>
}