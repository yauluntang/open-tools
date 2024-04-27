import { useEffect, useState } from "react"
import styled from 'styled-components';
const SuitToName = { 0: '♦', 1: '♣', 2: '♥', 3: '♠' };
const SuitToColor = { 0: 'red', 1: 'black', 2: 'red', 3: 'black' }
const StyledDiv = styled.div`
  width: ${props => props.width}px;
  height: ${props => props.height}px;
  background: ${props => props.number !== -1 ? 'white' : 'brown'};
  border: 1px solid grey;
  border-radius: 10px;
  position: relative;
  display: flex;
  user-select:none;
  align-items: center;
  justify-content: center;
  font-family: Arial;
  box-shadow:4px 4px 2px 2px rgba(0,0,0,0.1);
`

export const CardImage = ({ width = 80, height = 120, number, largeForm }) => {

  const [suit, setSuit] = useState('')
  const [rank, setRank] = useState('')
  const [color, setColor] = useState('')

  useEffect(() => {

    let num = ((number - 1) % 13) + 1;
    let rank = num;
    if (num === 1) {
      rank = 'A';
    }
    else if (num === 11) {
      rank = 'J';
    }
    else if (num === 12) {
      rank = 'Q';
    }
    else if (num === 13) {
      rank = 'K';
    }
    let suitNum = Math.floor((number - 1) / 13);
    const suit = SuitToName[suitNum];
    const color = SuitToColor[suitNum];
    setColor(color);
    setSuit(suit);
    setRank(rank)
  }, [number])

  return <>{largeForm ? < StyledDiv width={width} height={height} number={number}>

    {number >= 1 && <>
      <div style={{ fontSize: '60px', color }}>{suit}</div>
      <div style={{ position: 'absolute', top: '2px', left: '5px', color }}>
        <div style={{ fontWeight: 'bold', marginBottom: '-5px' }}>{rank}</div>
        <div>{suit}</div>
      </div>
      <div style={{ position: 'absolute', right: '5px', bottom: '2px', transform: 'rotate(180deg)', color }}>
        <div style={{ fontWeight: 'bold', marginBottom: '-5px' }}>{rank}</div>
        <div>{suit}</div>
      </div></>}




  </StyledDiv > : <div style={{
    border: '1px solid grey',
    color: `${color}`,
    width: `${width}px`,
    height: `${height}px`,
    display: 'flex',
    userSelect: 'none',
    justifyContent: 'center',
    padding: '4px',
    borderRadius: '4px',
    fontWeight: 'bold',
    background: 'white',
    position: 'relative',
    boxShadow: '1px 1px 1px 1px rgba(0,0,0,0.1)'
  }}><div >{rank}</div>
    <div style={{ position: 'absolute', bottom: '4px' }}>{suit}</div></div>
  }</>


}