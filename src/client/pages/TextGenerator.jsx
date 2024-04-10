import { useEffect, useState } from "react";
import Input from "../components/input/Input";
import Button from "../components/input/Button";

function TextGenerator() {

  const [text, setText] = useState('Type Something Here')



  const updateImg = () => {
    var mySVG = document.querySelector('#text-component'), // Inline SVG element
      tgtImage = document.querySelector('#img-component'),    // Where to draw the result
      can = document.querySelector('#can-component'), // Not shown on page
      ctx = can.getContext('2d'),
      loader = new Image; // Not shown on page
    tgtImage.width = mySVG.clientWidth;
    tgtImage.height = mySVG.clientHeight;
    can.width = tgtImage.width
    can.height = tgtImage.height
    console.log(can.width)
    loader.width = can.width = tgtImage.width = mySVG.clientWidth;
    loader.height = can.height = tgtImage.height = mySVG.clientHeight;
    //loader.width = 1000;
    //loader.height = 300

    loader.onload = function () {
      ctx.drawImage(loader, 0, 0, loader.width, loader.height);
      tgtImage.src = can.toDataURL();
    };
    var svgAsXML = (new XMLSerializer).serializeToString(mySVG);
    loader.src = 'data:image/svg+xml,' + encodeURIComponent(svgAsXML);


  }

  const saveSVGImage = () => {
    const mySVG = document.querySelector('#text-component');
    const svgAsXML = (new XMLSerializer).serializeToString(mySVG);
    var save = document.createElement('a');
    save.href = 'data:image/svg+xml,' + encodeURIComponent(svgAsXML);
    save.target = '_blank';
    save.download = 'photo.svg'
    save.click();
  }

  const savePNGImage = () => {
    const myIMG = document.querySelector('#img-component');
    var save = document.createElement('a');
    save.href = myIMG.src;
    save.target = '_blank';
    save.download = 'photo.png'
    save.click();
  }

  useEffect(() => {

    updateImg()

  })


  return <div style={{ userSelect: 'none' }}>
    <Input label="Text" onChange={setText} value={text}></Input>
    <Button onClick={saveSVGImage} size="large">Save SVG</Button>
    <Button onClick={savePNGImage} size="large">Save PNG</Button>

    <div style={{ width: '1000px', height: '300px' }}>
      <svg id="text-component" width="100%" height="100%" viewBox="0 0 1000 300">
        <defs>
          <style type="text/css">@import url(http://fonts.googleapis.com/css?family=Indie+Flower);</style>
        </defs>
        <rect x="1" y="1" width="998" height="298" fill="red" stroke="black"></rect>
        <text x="99" y="99" className="small" font-size="60" style={{ stroke: 'black', strokeWidth: '3', fontFamily: "Indie Flower", fontWeight: "900" }}>{text}</text>
        {/*
        <defs>
          <filter id="shadow" x="-120%" y="-120%" width="360%" height="360%">
            <feGaussianBlur stdDeviation="5 5" result="shadow" />
            <feOffset dx="6" dy="6" />
          </filter>
        </defs>
        <defs>
          <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="10 10" result="glow" />
            <feMerge>
              <feMergeNode in="glow" />
              <feMergeNode in="glow" />
              <feMergeNode in="glow" />
            </feMerge>
          </filter>
        </defs>
        <defs>
          <filter id="whiteOutlineEffect" color-interpolation-filters="sRGB">
            <feMorphology in="SourceAlpha" result="MORPH" operator="dilate" radius="2" />
            <feColorMatrix in="MORPH" result="WHITENED" type="matrix" values="-1 0 0 0 1, 0 -1 0 0 1, 0 0 -1 0 1, 0 0 0 1 0" />
            <feMerge>
              <feMergeNode in="WHITENED" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
</defs>
        <rect x="0" y="0" width="1000" height="300" fill="red"></rect>
        <text x="99" y="99" className="small" font-size="60" style={{ stroke: 'red', strokeWidth: '6', fontFamily: "Roboto, sans-serif", fontWeight: "900" }}>{text}</text>
        <text x="99" y="99" class="small" font-size="60" style={{ filter: 'url(#glow)', fill: 'white' }}>{text}</text>
        <text x="99" y="99" class="small" font-size="60" style={{ stroke: 'red', strokeWidth: '15' }}>{text}</text>
        <text x="99" y="99" className="small" font-size="60" style={{ stroke: 'black', strokeWidth: '3', fontFamily: "Roboto, sans-serif", fontWeight: "900" }}>{text}</text>


        <text x="99" y="99" className="small" fill="white" font-size="60" style={{ fontFamily: "Roboto, sans-serif", fontWeight: "900" }} lengthAdjust="spacing">{text}</text>
*/}



      </svg>
    </div>

    <img id="img-component" style={{ height: "300px", width: "1000px" }} />
    <canvas id="can-component" style={{ height: "300px", width: "1000px" }}></canvas>

  </div>
}
export default TextGenerator;
