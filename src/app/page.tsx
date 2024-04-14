'use client';
import React, { useState, useEffect, useRef } from 'react';
import MonacoEditor from '../components/MonacoEditor';
import MonacoOutput from '../components/MonacoOutput';
import ReactFlow, { Edge } from 'reactflow';
import DebugFlow from '@/components/ReactFlowStackView';
import StackView from '@/components/ReactFlowStackView';
import HeapView from '@/components/ReactFlowHeapView';

const HomePage = () => {
  const [editorValue, setEditorValue] = useState<string | undefined>('');
  const [output, setOutput] = useState<string | undefined>('');
  const [isSideBySide, setIsSideBySide] = useState(false);
  const [breakpoints, setBreakpoints] = useState<number[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDebugMode, setIsDebugMode] = useState(false);
  const [heaps, setHeaps] = useState([]);
  const [stacks, setStacks] = useState([]);
  const [selectedBreakpoint, setSelectedBreakpoint] = useState(0); // New state

  const defaultCode = 'fmt.Println("Hello, World!")';

  const handleToggleMode = () => {
    setIsDebugMode(!isDebugMode);
  };

  useEffect(() => {
    const editorValue = localStorage.getItem('editorValue') || defaultCode;
    setEditorValue(editorValue);
  }, []);

  const handleRun = async () => {
    // Assuming editorValue is already filled with the code from MonacoEditor
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
      } else {
        setOutput(`Error: ${error}`);
      }
    } catch (error) {
      console.error('Error calling ooga-lang service:', error);
      setOutput(`Error: Unable to call the ooga-lang service`);
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
        {!isDebugMode && (
          <button
            className="bg-[#4CAF50] hover:bg-[#66BB6A] text-white py-1 px-2 rounded text-sm"
            onClick={handleRun}
          >
            Run (Shift + Enter)
          </button>
        )}
        {!isDebugMode && (
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
        {!isDebugMode && (
          <button
            className="bg-[#29B6F6] hover:bg-[#4FC3F7] text-white py-1 px-2 rounded text-sm"
            onClick={handleSaveToFile}
          >
            Save to File
          </button>
        )}

        <button
          className="bg-[#FF6F61] hover:bg-[#E55D5B] text-white py-1 px-2 rounded text-sm"
          onClick={handleToggleMode}
        >
          {isDebugMode ? 'Editor' : 'Debug'}
        </button>
        {isDebugMode && (
          <>
            <div className="mx-4 w-0.5 h-6 bg-gray-400"></div> {/* Divider */}
            <div className="flex overflow-x-scroll space-x-2">{breakpointsButtons()}</div>
          </>
        )}
      </div>

      {!isDebugMode ? (
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
            <MonacoOutput content={output} />
          </div>
        </div>
      ) : (
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
            />
          </div>
          <div
            className={`flex flex-1 ${isSideBySide ? 'h-full w-1/2' : 'w-full'}`}
            style={{ minHeight: isSideBySide ? 'auto' : '50%' }}
          >
            <HeapView data={heaps.length > 0 ? heaps[selectedBreakpoint] : []} />
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;
