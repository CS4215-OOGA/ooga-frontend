'use client';
import React from 'react';
import Editor, { useMonaco } from '@monaco-editor/react';

const MonacoOutput = ({ content }: { content: string | undefined }) => {
  return (
    <Editor
      height="100%"
      defaultValue="// Output will appear here..."
      value={content}
      theme="vs-dark"
      options={{
        readOnly: true, // Make the editor read-only
        lineNumbers: 'off', // Turn off line numbers
        glyphMargin: false,
        folding: false,
        minimap: { enabled: false },
        scrollbar: { vertical: 'visible', horizontal: 'visible' },
        scrollBeyondLastLine: false,
        selectable: false,
        selectionHighlight: false,
        hover: { enabled: false },
        contextmenu: false,
        automaticLayout: true // Ensure layout adjusts to container
      }}
    />
  );
};

export default MonacoOutput;
