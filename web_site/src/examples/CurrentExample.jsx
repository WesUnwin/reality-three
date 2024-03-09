import React, { useEffect, useRef, useState } from 'react'
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { vscodeDark } from '@uiw/codemirror-theme-vscode';

const CurrentExample = ({ currentExample }) => {
  const iframeRef= useRef();

  const [showCode, setShowCode] = useState(false);
  const [code, setCode] = useState('');

  const iframeSrc = `https://wesunwin.github.io/three-game-engine/examples/${currentExample.name}.html`;

  const reloadIframe = () => {
    iframeRef.current.src = iframeRef.current.src + '';
  };

  useEffect(() => {
    if (currentExample?.code) {
      setCode('Loading...')
      window.fetch(currentExample.code)
            .then(response => response.text())
            .then(code => setCode(code))
    }
  }, [currentExample?.code])

  return (
    <div className="current-example">
      <h4>{currentExample.label}</h4>

      <div className="current-example-content">
        <div className="current-example-preview">
          <p>
            {currentExample.description}
          </p>

          <iframe
            ref={iframeRef}
            className="current-example-iframe"
            src={iframeSrc}
          />
        </div>

        {currentExample.footer}

        <button onClick={() => setShowCode(!showCode)}>
          {showCode ? 'Hide Code' : 'Show Code'}
        </button>
        &nbsp;
        <button onClick={reloadIframe}>
          Restart Demo
        </button>

        {showCode &&
          <div className="current-example-code">
            <CodeMirror
              theme={vscodeDark}
              value={code}
              extensions={[javascript({ jsx: true })]}
              onChange={() => {}}
            />
          </div>
        }
      </div>
    </div>
  );
};

export default CurrentExample