'use client';
import React, { useState, useEffect, useRef } from 'react';
import MonacoEditor from '../components/MonacoEditor';
import MonacoOutput from '../components/MonacoOutput';

const HomePage = () => {
  const [editorValue, setEditorValue] = useState<string | undefined>('');
  const [output, setOutput] = useState<string | undefined>('');
  const [isSideBySide, setIsSideBySide] = useState(false);
  const [breakpoints, setBreakpoints] = useState<number[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const editorValue = localStorage.getItem('editorValue') || '';
    setEditorValue(editorValue);
  }, []);

  const handleRun = async () => {
    // Assuming editorValue is already filled with the code from MonacoEditor
    try {
      const response = await fetch('http://localhost:3001/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: editorValue })
      });
      const { success, output, error } = await response.json();

      if (success) {
        setOutput(output);
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
    link.download = 'editorContent.txt';
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const handleBreakpointsChange = (newBreakpoints: number[]) => {
    setBreakpoints(newBreakpoints);
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
      <div className="text-white p-4 flex flex-row bg-[#1e1e1e] space-x-2">
        <button
          className="bg-[#4CAF50] hover:bg-[#66BB6A] text-white py-1 px-2 rounded text-sm"
          onClick={handleRun}
        >
          Run (Shift + Enter)
        </button>
        <button
          className="bg-[#FFA726] hover:bg-[#FFB74D] text-white py-1 px-2 rounded text-sm"
          onClick={() => fileInputRef.current?.click()}
        >
          Open File
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleOpenFile}
          style={{ display: 'none' }}
        />
        <button
          className="bg-[#29B6F6] hover:bg-[#4FC3F7] text-white py-1 px-2 rounded text-sm"
          onClick={handleSaveToFile}
        >
          Save to File
        </button>
      </div>

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
    </div>
  );
};

export default HomePage;
