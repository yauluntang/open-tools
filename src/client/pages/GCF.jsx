import { useEffect, useState } from "react";
import Input from "../components/input/Input";

function gcd(a, b) {
  if (b === 0) return a;
  return gcd(b, a % b);
}


function GCF() {
  const [valueA, setValueA] = useState(0)
  const [valueB, setValueB] = useState(0)
  const [answerLcm, setAnswerLcm] = useState(0)
  const [answerGcd, setAnswerGcd] = useState(0)


  useEffect(() => {
    if (valueA !== null && valueA !== '' && valueB !== null && valueB !== '') {

      const gcdAnswer = gcd(valueA, valueB);
      setAnswerGcd(gcdAnswer)

      const lcmAnswer = Math.abs(valueA * valueB) / gcdAnswer;
      setAnswerLcm(lcmAnswer);
    }
  }, [valueA, valueB])
  return (
    <>

      <label>Get GCF of a number</label>

      <Input label="Value A" type="number" value={valueA} onChange={(v) => setValueA(Math.floor(v))}></Input>
      <Input label="Value B" type="number" value={valueB} onChange={(v) => setValueB(Math.floor(v))}></Input>

      <div>LCM: {answerLcm}</div>
      <div>GCD: {answerGcd}</div>

    </>
  )
}

export default GCF
