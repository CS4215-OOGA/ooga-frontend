'use client';
import React, { useState, useEffect, useRef } from 'react';
import MonacoEditor from '../components/MonacoEditor';
import MonacoOutput from '../components/MonacoOutput';
import StackView from '../components/ReactFlowStackView';
import HeapView from '../components/ReactFlowHeapView';

enum Mode {
  DEBUG = 'DEBUG',
  EDITOR = 'EDITOR',
  GUIDE = 'GUIDE'
}

const HomePage = () => {
  const [editorValue, setEditorValue] = useState<string | undefined>('');
  const [output, setOutput] = useState<string | undefined>('');
  const [isSideBySide, setIsSideBySide] = useState(false);
  const [breakpoints, setBreakpoints] = useState<number[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [modeType, setMode] = useState<Mode>(Mode.EDITOR);
  const [heaps, setHeaps] = useState([]);
  const [stacks, setStacks] = useState([]);
  const [selectedBreakpoint, setSelectedBreakpoint] = useState(0); // New state
  const [isError, setIsError] = useState(false);
  const [selectedElement, setSelectedElement] = useState(null);

  const defaultCode = 'fmt.Println("Hello, World!")';
  const handleStackElementClick = element => {
    console.log(element);
    setSelectedElement(element);
  };
  const setEditorMode = () => {
    setMode(Mode.EDITOR);
  };

  const setDebugMode = () => {
    setMode(Mode.DEBUG);
  };

  const setGuideMode = () => {
    setMode(Mode.GUIDE);
  };

  const GuideView = () => {
    return (
      <div
        className="flex items-center justify-center bg-cover bg-center"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url('/turtleofdoom.jpg')",
          minHeight: `calc(100vh - 64px)` // Adjusting for header height
        }}
      >
        <div className="p-4 w-full max-w-2xl bg-black bg-opacity-40 rounded shadow overflow-auto">
          <h1 className="text-2xl font-bold mb-4">Ooga Academy: Ooga Manual</h1>
          <ol className="list-decimal pl-6 space-y-4">
            <li>
              Welcome fellow Ooga Booga! The Ooga Academy is where you will practice your
              programming skills to overthrow the Source Academy!
            </li>
            <li>
              You can type your code directly in the editor or open an existing file using the "Open
              File" button.
            </li>
            <li>
              The editor supports syntax highlighting and code completion for the Ooga language.
            </li>
            <li>To run your code, click the "Run" button or press Shift + Enter.</li>
            <li>
              The output of your code will be displayed in the output panel on the right side of the
              editor.
            </li>
            <li>You can save your code to a file using the "Save to File" button.</li>
            <li>
              To set breakpoints, put the `breakpoint;` instruction in your program and then run it.
            </li>
            <li>
              Breakpoints will display the heap contents at that point of execution as well as the
              state for each thread.
            </li>
            <li>
              The stack view displays the contents of the operand stash and the runtime stack for
              all threads, with the current thread highlighted in yellow.
            </li>
            <li>
              The heap view displays the contents of the heap at the current breakpoint. Clicking on
              a node in this view will highlight it in blue, its parents recursively in green and
              its children recursively in red.
            </li>
            <li>
              The currently supported list of standard library functions includes the WaitGroup,
              fmt.PrintLn and Mutexes.
            </li>
            <li>Have fun coding!</li>
          </ol>
        </div>
      </div>
    );
  };

  useEffect(() => {
    const editorValue = localStorage.getItem('editorValue') || defaultCode;
    setEditorValue(editorValue);
  }, []);

  const handleRun = async () => {
    setOutput('Running...');
    try {
      const response = await fetch('http://localhost:3001/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: editorValue })
      });
      const { success, output, error, heaps, stacks } = await response.json();
      console.log(heaps);
      console.log(stacks);
      if (success) {
        setOutput(output);
        setHeaps(heaps);
        setStacks(stacks);
        setIsError(false);
      } else {
        console.log(error);
        setOutput(`${error}`);
        setIsError(true);
      }
    } catch (error) {
      console.error('Error calling ooga-lang service:', error);
      setOutput(`Error: Unable to call the ooga-lang service`);
      setIsError(true);
    }
  };

  const handleEditorChange = (value: string | undefined) => {
    // save to local storage
    localStorage.setItem('editorValue', value || '');
    setEditorValue(value);
    console.log(value);
  };

  const handleOpenFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    const file = event.target.files?.[0];
    if (!file) return;
    fileReader.readAsText(file, 'UTF-8');
    fileReader.onload = e => {
      const result = e.target?.result as string;
      handleEditorChange(result);
    };
  };

  const handleSaveToFile = () => {
    const blob = new Blob([editorValue ?? ''], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'booga.ooga';
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const handleBreakpointsChange = (newBreakpoints: number[]) => {
    setBreakpoints(newBreakpoints);
  };

  const handleBreakpointSelection = (index: number) => {
    setSelectedBreakpoint(index);
  };

  const breakpointsButtons = () => {
    return heaps.map((_, index) => (
      <button
        key={index}
        className={`bg-[#8C4CFF] hover:bg-[#A56EFF] text-white px-2 rounded text-sm ${
          selectedBreakpoint === index ? 'font-bold' : ''
        }`}
        onClick={() => handleBreakpointSelection(index)}
      >
        Breakpoint {index + 1}
      </button>
    ));
  };

  useEffect(() => {
    const updateLayout = () => {
      setIsSideBySide(window.innerWidth > 768);
    };
    window.addEventListener('resize', updateLayout);
    updateLayout();
    return () => window.removeEventListener('resize', updateLayout);
  }, []);

  return (
    <div className="flex flex-col h-screen">
      <div className="text-white p-4 flex flex-row bg-[#1e1e1e] space-x-2 whitespace-nowrap">
        {modeType === Mode.EDITOR && (
          <button
            className="bg-[#4CAF50] hover:bg-[#66BB6A] text-white py-1 px-2 rounded text-sm"
            onClick={handleRun}
          >
            Run (Shift + Enter)
          </button>
        )}
        {modeType === Mode.EDITOR && (
          <button
            className="bg-[#FFA726] hover:bg-[#FFB74D] text-white py-1 px-2 rounded text-sm"
            onClick={() => fileInputRef.current?.click()}
          >
            Open File
          </button>
        )}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleOpenFile}
          style={{ display: 'none' }}
        />
        {modeType === Mode.EDITOR && (
          <button
            className="bg-[#29B6F6] hover:bg-[#4FC3F7] text-white py-1 px-2 rounded text-sm"
            onClick={handleSaveToFile}
          >
            Save to File
          </button>
        )}

        <button
          className="bg-[#FF6F61] hover:bg-[#E55D5B] text-white py-1 px-2 rounded text-sm"
          onClick={setEditorMode}
        >
          Editor
        </button>
        <button
          className="bg-[#FF6F61] hover:bg-[#E55D5B] text-white py-1 px-2 rounded text-sm"
          onClick={setDebugMode}
        >
          Debug
        </button>
        <button
          className="bg-[#FF6F61] hover:bg-[#E55D5B] text-white py-1 px-2 rounded text-sm"
          onClick={setGuideMode}
        >
          Guide
        </button>
        {modeType === Mode.DEBUG && (
          <>
            <div className="mx-4 w-0.5 bg-gray-400"></div>
            <div className="flex overflow-x-scroll space-x-2">{breakpointsButtons()}</div>
          </>
        )}
      </div>

      {modeType === Mode.EDITOR ? (
        <div className={`flex flex-1 ${isSideBySide ? 'flex-row' : 'flex-col'}`}>
          <div
            className={`flex flex-1 ${isSideBySide ? 'h-full w-1/2' : 'w-full'}`}
            style={{ minHeight: isSideBySide ? 'auto' : '50%' }}
          >
            <MonacoEditor
              onChange={handleEditorChange}
              value={editorValue}
              onBreakpointsChange={handleBreakpointsChange}
              onRun={handleRun}
            />{' '}
          </div>
          <div
            className={`flex flex-1 ${isSideBySide ? 'h-full w-1/2' : 'w-full'}`}
            style={{ minHeight: isSideBySide ? 'auto' : '50%' }}
          >
            <MonacoOutput content={output} isError={isError} />
          </div>
        </div>
      ) : modeType === Mode.DEBUG ? (
        <div className={`flex flex-1 ${isSideBySide ? 'flex-row' : 'flex-col'}`}>
          <div
            className={`flex flex-1 ${
              isSideBySide
                ? 'h-full w-1/2 border-r-4 border-slate-300'
                : 'w-full border-b-4 border-white'
            }`}
            style={{ minHeight: isSideBySide ? 'auto' : '50%' }}
          >
            <StackView
              data={stacks.length > 0 ? stacks[selectedBreakpoint].stacks : []}
              currentThreadIndex={
                stacks.length > 0 ? stacks[selectedBreakpoint].currentThread : null
              }
              onStackElementClick={handleStackElementClick}
            />
          </div>
          <div
            className={`flex flex-1 ${isSideBySide ? 'h-full w-1/2' : 'w-full'}`}
            style={{ minHeight: isSideBySide ? 'auto' : '50%' }}
          >
            <HeapView
              data={heaps.length > 0 ? heaps[selectedBreakpoint] : []}
              selectedElement={selectedElement}
            />
          </div>
        </div>
      ) : (
        <div className="h-full">
          <GuideView></GuideView>
        </div>
      )}
    </div>
  );
};

export default HomePage;
