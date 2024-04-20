import { Editor as Internal_Editor_end } from "@monaco-editor/react"
import { useCallback as Internal_useCallback_end, useState as Internal_useState_end, useEffect as Internal_useEffect_end, useCallback } from "react"
import Internal_Button_end from "../components/input/Button"
import _ from "lodash";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Internal_settingUp_end = `
window.Internal_oldconsole_end = {...console}; 
const Internal_console_end = {...console}; 
window.arr = [];
window.console = { 
  info: (l)=>{ Internal_console_end.info(l); arr.push({ level:'info', message:l }); }, 
  log: (l)=>{ Internal_console_end.log(l); arr.push({ level:'log', message:l }); }, 
  debug: (l)=>{ Internal_console_end.debug(l); arr.push({ level:'debug', message:l }); }, 
  warn: (l)=>{ Internal_console_end.warn(l); arr.push({ level:'warn', message:l }); }, 
  error: (l)=>{ Internal_console_end.error(l); arr.push({ level:'error', message: l.message }); } 
};`;

const Internal_wrappingUp_end = `
  window.console = {...window.Internal_oldconsole_end};
  Internal_handleLog_end(...window.arr);
`

const Internal_debug_color = {
  log: 'black',
  info: 'green',
  warn: 'orange',
  debug: 'brown',
  error: 'red'
}

export const NodeJsMock = ({ level }) => {
  const [Internal_jscode_end, Internal_setJscode_end] = Internal_useState_end('')
  const [Internal_output_end, Internal_setOutput_end] = Internal_useState_end([])
  const [Internal_error_end, Internal_setError_end] = Internal_useState_end([])
  const [Internal_title_end, Internal_setTitle_end] = Internal_useState_end('')
  const [Internal_example_end, Internal_setExample_end] = Internal_useState_end('')
  const [Internal_descriptions_end, Internal_setDescriptions_end] = Internal_useState_end([])
  const [Internal_function_end, Internal_setFunction_end] = Internal_useState_end('')
  const [Internal_testCases_end, Internal_setTestCases_end] = Internal_useState_end('')
  const [Internal_results_end, Internal_setResults_end] = Internal_useState_end([])

  const navigate = useNavigate();

  Internal_useEffect_end(() => {
    if (level) {
      import(`../assets/data/jscode${level}.json`).then((res) => {
        Internal_setTitle_end(res.title)
        Internal_setExample_end(res.example)
        Internal_setJscode_end(res.exampleJs)
        Internal_setDescriptions_end(res.descriptions)
        Internal_setTestCases_end(res.testCases)
        Internal_setFunction_end(res.functionName)
        const savedCode = localStorage.getItem(`jscode-lesson${level}`)
        if (savedCode) {
          Internal_setJscode_end(savedCode);
        }
      })
    }


  }, [level])

  const Internal_clearConsole_end = Internal_useCallback_end((v) => {

    Internal_setOutput_end([])
  }, [Internal_output_end, Internal_setOutput_end]);

  const Internal_handleJscode_end = (v) => {
    localStorage.setItem(`jscode-lesson${level}`, v);
    Internal_setJscode_end(v);
  }
  const Internal_handleLog_end = Internal_useCallback_end((v) => {
    const newline = [...Internal_output_end];
    newline.push(v)
    Internal_setOutput_end(newline)
  }, [Internal_output_end, Internal_setOutput_end]);

  /*
  const Internal_handleRun_end = Internal_useCallback_end(() => {
    Internal_setOutput_end([]);
    try {

      const Internal_sanitized_end =
        Internal_jscode_end
          .replace(/Internal_.*_end/gi, '')
          .replace(/NodeJsMock/gi, '')
          .replace(/eval/gi, '')
          .replace(/import/gi, '')
          .replace(/window/gi, '')
          .replace(/document/gi, '')
      const Internal_tempresults_end = [];
      let Internal_index_end = 1;
      eval(Internal_settingUp_end);
      for (let Internal_testCase_end of Internal_testCases_end) {
        const Internal_tempinput_end = Internal_testCase_end.input.join`,`;
        const Internal_func_end = `${Internal_function_end}(${Internal_tempinput_end});`;
        const Internal_result_end = eval(Internal_sanitized_end + Internal_func_end)
        const Internal_success_end = _.isEqual(Internal_testCase_end.output, Internal_result_end);
        Internal_tempresults_end.push({
          test: Internal_index_end,
          input: Internal_tempinput_end,
          output: Internal_testCase_end.output,
          result: Internal_result_end,
          success: Internal_success_end
        });
        eval(Internal_wrappingUp_end);
        Internal_index_end++;
      }
      Internal_setResults_end(Internal_tempresults_end);

      //Internal_handleLog_end({ message: 'abc', level: 'error' });

    }
    catch (e) {
      console.error(e)
      //Internal_setError_end([e.message])
    }
  }, [
    Internal_setOutput_end,
    Internal_setError_end,
    Internal_setResults_end,
    Internal_function_end,
    Internal_testCases_end,
    Internal_output_end,
    Internal_jscode_end])
*/

  const Internal_Debug_Line = ({ line }) => {
    //console.log(line)
    return <div style={{ color: Internal_debug_color[line.level], fontFamily: 'courier', fontWeight: 'bold' }}>
      {(typeof line.message === 'string' || typeof line.message === 'number' || typeof line.message === 'boolean') ? line.message : JSON.stringify(line.message, null, 2)}</div>
  }

  const Internal_submit_end = Internal_useCallback_end(() => {
    const fetch = async () => {
      const response = await axios.post('/api/runnode', { code: Internal_jscode_end, functionName: Internal_function_end, testCases: Internal_testCases_end })
      const result = response.data.result;
      let Internal_index_end = 0;
      const Internal_tempresults_end = [];
      for (let Internal_testCase_end of Internal_testCases_end) {

        let Internal_tempinput_end;
        if (_.isArray(Internal_testCase_end.input)) {
          Internal_tempinput_end = Internal_testCase_end.input.join`,`;
        }
        else {
          Internal_tempinput_end = Internal_testCase_end.input;
        }



        const Internal_success_end = _.isEqual(Internal_testCase_end.output, result[Internal_index_end]);
        Internal_tempresults_end.push({
          test: Internal_index_end + 1,
          input: Internal_tempinput_end,
          output: Internal_testCase_end.output,
          result: result[Internal_index_end],
          success: Internal_success_end
        });
        Internal_index_end++;
      }

      Internal_setResults_end(Internal_tempresults_end);
    }
    fetch();
  }, [Internal_jscode_end, Internal_results_end])

  const previouslesson = () => {
    navigate(`/nodejs/${level - 1}`)
  }

  const nextlesson = () => {
    navigate(`/nodejs/${level + 1}`)
  }

  return <div style={{ padding: '30px' }}>
    <div style={{ display: 'flex' }}>
      <div style={{ border: '1px solid black', width: '30%' }}>
        <div>{Internal_title_end}</div>
        <div style={{ padding: '20px' }}>
          {Internal_descriptions_end && Internal_descriptions_end.map((d, i) => <p key={i}>{d}</p>)}
        </div>
      </div>
      <div style={{ border: '1px solid black', width: '40%' }}>

        <Internal_Editor_end width="100%" height="600px" language="javascript" value={Internal_jscode_end} onChange={Internal_handleJscode_end} options={{ minimap: { enabled: false } }} />

      </div>
      <div style={{ border: '1px solid black', width: '30%' }}>
        <div >
          {Internal_results_end.map((line, index) => <div style={{ color: 'black', fontFamily: 'courier', fontWeight: 'bold' }} key={index}>
            Test {line.test}: Parameters: {line.input} Result: {line.result}  {line.success ? 'Success' : 'Fail'}</div>)}
        </div>
        <div >

          {Internal_output_end && Internal_output_end.map((line, index) => <Internal_Debug_Line line={line} key={index} />)}

        </div>
      </div>

    </div>
    {/*
    <Internal_Button_end size="large" onClick={Internal_handleRun_end}>Run</Internal_Button_end>*/}

    <Internal_Button_end size="large" onClick={Internal_submit_end}>Submit to Server</Internal_Button_end>

    <Internal_Button_end size="large" onClick={Internal_clearConsole_end}>Clear Console</Internal_Button_end>


    <Internal_Button_end size="large" onClick={previouslesson}>Previous</Internal_Button_end>

    <Internal_Button_end size="large" onClick={nextlesson}>Next</Internal_Button_end>
  </div>
}