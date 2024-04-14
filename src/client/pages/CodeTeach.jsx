import { useEffect, useState } from "react";
import sanitizeHtml from "sanitize-html";
import TextArea from "../components/input/TextArea";
import Editor from '@monaco-editor/react';


const settings = {
  allowedTags: false,
  nonBooleanAttributes: [
    'abbr', 'accept', 'accept-charset', 'accesskey', 'action',
    'allow', 'alt', 'as', 'autocapitalize', 'autocomplete',
    'blocking', 'charset', 'cite', 'class', 'color', 'cols',
    'colspan', 'content', 'contenteditable', 'coords', 'crossorigin',
    'data', 'datetime', 'decoding', 'dir', 'dirname', 'download',
    'draggable', 'enctype', 'enterkeyhint', 'fetchpriority', 'for',
    'form', 'formaction', 'formenctype', 'formmethod', 'formtarget',
    'headers', 'height', 'hidden', 'high', 'href', 'hreflang',
    'http-equiv', 'id', 'imagesizes', 'imagesrcset', 'inputmode',
    'integrity', 'is', 'itemid', 'itemprop', 'itemref', 'itemtype',
    'kind', 'label', 'lang', 'list', 'loading', 'low', 'max',
    'maxlength', 'media', 'method', 'min', 'minlength', 'name',
    'nonce', 'optimum', 'pattern', 'ping', 'placeholder', 'popover',
    'popovertarget', 'popovertargetaction', 'poster', 'preload',
    'referrerpolicy', 'rel', 'rows', 'rowspan', 'sandbox', 'scope',
    'shape', 'size', 'sizes', 'slot', 'span', 'spellcheck', 'src',
    'srcdoc', 'srclang', 'srcset', 'start', 'step', 'style',
    'tabindex', 'target', 'title', 'translate', 'type', 'usemap',
    'value', 'width', 'wrap', 'class',
    'onauxclick', 'onafterprint', 'onbeforematch', 'onbeforeprint',
    'onbeforeunload', 'onbeforetoggle', 'onblur', 'oncancel',
    'oncanplay', 'oncanplaythrough', 'onchange', 'onclick', 'onclose',
    'oncontextlost', 'oncontextmenu', 'oncontextrestored', 'oncopy',
    'oncuechange', 'oncut', 'ondblclick', 'ondrag', 'ondragend',
    'ondragenter', 'ondragleave', 'ondragover', 'ondragstart',
    'ondrop', 'ondurationchange', 'onemptied', 'onended',
    'onerror', 'onfocus', 'onformdata', 'onhashchange', 'oninput',
    'oninvalid', 'onkeydown', 'onkeypress', 'onkeyup',
    'onlanguagechange', 'onload', 'onloadeddata', 'onloadedmetadata',
    'onloadstart', 'onmessage', 'onmessageerror', 'onmousedown',
    'onmouseenter', 'onmouseleave', 'onmousemove', 'onmouseout',
    'onmouseover', 'onmouseup', 'onoffline', 'ononline', 'onpagehide',
    'onpageshow', 'onpaste', 'onpause', 'onplay', 'onplaying',
    'onpopstate', 'onprogress', 'onratechange', 'onreset', 'onresize',
    'onrejectionhandled', 'onscroll', 'onscrollend',
    'onsecuritypolicyviolation', 'onseeked', 'onseeking', 'onselect',
    'onslotchange', 'onstalled', 'onstorage', 'onsubmit', 'onsuspend',
    'ontimeupdate', 'ontoggle', 'onunhandledrejection', 'onunload',
    'onvolumechange', 'onwaiting', 'onwheel'
  ],
  disallowedTagsMode: 'discard',
  allowedAttributes: false,
  // Lots of these won't come up by default because we don't allow them
  selfClosing: ['img', 'br', 'hr', 'area', 'base', 'basefont', 'input', 'link', 'meta'],
  // URL schemes we permit
  allowedSchemes: ['http', 'https', 'ftp', 'mailto', 'tel'],
  allowedSchemesByTag: {},
  allowedSchemesAppliedToAttributes: ['href', 'src', 'cite'],
  allowProtocolRelative: true,
  enforceHtmlBoundary: false,
  parseStyleAttributes: true
}
const CodeTeach = () => {

  const [code, setCode] = useState('');
  const [css, setCss] = useState('');
  const [title, setTitle] = useState('');
  const [descriptions, setDescriptions] = useState([]);

  useEffect(() => {
    import('../assets/data/lesson1.json').then((res) => {
      setTitle(res.title)
      setCss(res.exampleCss)
      setCode(res.exampleCode)
      setDescriptions(res.descriptions)
    })
  }, [])


  return <div className="flex">
    <div style={{ width: '40%' }}>
      <h2 style={{ height: '30px', marginLeft: '20px' }}>Lesson</h2>
      <h3 style={{ height: '30px', marginLeft: '20px', marginTop: '20px' }}>{title}</h3>
      <div style={{ padding: '20px' }}>
        {descriptions && descriptions.map((d, i) => <p key={i}>{d}</p>)}
      </div>
    </div>
    <div style={{ width: '30%' }}>
      <div className="flex flex-col">
        <div style={{ height: '500px' }}>
          <h2 style={{ height: '30px', marginLeft: '20px' }}>HTML</h2>
          <div style={{ height: '80%', margin: '20px', border: '1px solid black', }}>
            <Editor width="100%" height="100%" language="html" value={code} onChange={setCode} options={{ minimap: { enabled: false } }}></Editor>
          </div>
        </div>
        <div style={{ height: '500px' }}>

          <h2 style={{ height: '30px', marginLeft: '20px' }}>CSS</h2>
          <div style={{ height: '80%', margin: '20px', border: '1px solid black', }}>
            <Editor width="100%" height="100%" language="css" value={css} onChange={setCss} options={{ minimap: { enabled: false } }}></Editor>
          </div>
        </div>
      </div>
    </div>
    <div style={{ width: '30%', height: '1000px' }}>
      <h2 style={{ height: '30px', marginLeft: '20px' }}>Result</h2>

      <html style={{ border: '1px solid black', margin: '20px', height: 'calc( 100% - 100px )' }}>
        <head>
          <style>
            {css}
          </style>
        </head>
        <body style={{ background: 'white', height: '100%', minHeight: '100%' }}>
          <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(code, settings) }}></div>
        </body>
      </html>

    </div>
  </div >
}

export default CodeTeach;