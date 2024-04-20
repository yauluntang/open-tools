import { useNavigate, useParams } from "react-router-dom";
import { NodeJsMock } from "./NodeJsMock";
import { useEffect } from "react";

export const NodeJsMockTop = () => {
  let { level } = useParams();
  let navigate = useNavigate();
  useEffect(() => {
    if (!level) {
      navigate('/nodejs/1')
    }
  }, [level])
  return <NodeJsMock level={parseInt(level, 10)} />
}