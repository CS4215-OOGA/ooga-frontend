import React from 'react';
import Editor, { OnChange } from '@monaco-editor/react';

function MonacoEditor({
  onChange,
  value
}: {
  onChange: (value: string | undefined) => void;
  value: string | undefined;
}) {
  return (
    <Editor
      height="100%"
      value={value}
      defaultLanguage="go"
      theme="vs-dark"
      options={{
        automaticLayout: true,
        minimap: { autohide: true }
      }}
      onChange={onChange}
    />
  );
}

export default MonacoEditor;
