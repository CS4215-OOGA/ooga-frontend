import React, { useRef, useEffect } from 'react';
import { Editor, Monaco } from '@monaco-editor/react';
import { editor } from 'monaco-editor';

function MonacoEditor({
  onChange,
  value,
  onBreakpointsChange,
  onRun
}: {
  onChange: (value: string | undefined) => void;
  value: string | undefined;
  onBreakpointsChange: (breakpoints: number[]) => void;
  onRun: () => void;
}) {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const decorationsRef = useRef<{ [line: number]: editor.IModelDeltaDecoration }>({});
  const breakpointsCollectionRef = useRef<editor.IEditorDecorationsCollection | null>(null);

  useEffect(() => {
    const editorInstance = editorRef.current;
    if (editorInstance) {
      editorInstance.addCommand(
        window.monaco.KeyMod.Shift | window.monaco.KeyCode.Enter,
        function () {
          onRun();
        }
      );
    }
  }, [onRun]);

  function handleEditorDidMount(editor: editor.IStandaloneCodeEditor, monaco: Monaco) {
    editorRef.current = editor;
    breakpointsCollectionRef.current = editor.createDecorationsCollection();

    editor.onMouseDown(event => {
      const { target } = event;
      if (target.type === monaco.editor.MouseTargetType.GUTTER_GLYPH_MARGIN) {
        const lineNumber = target.position.lineNumber;
        const existingDecoration = decorationsRef.current[lineNumber];

        if (existingDecoration) {
          delete decorationsRef.current[lineNumber];
        } else {
          decorationsRef.current[lineNumber] = {
            range: new monaco.Range(lineNumber, 1, lineNumber, 1),
            options: { glyphMarginClassName: 'breakpoint-glyph', isWholeLine: true }
          };
        }

        updateBreakpointsCollection();
        onBreakpointsChange(Object.keys(decorationsRef.current).map(Number));
      }
    });
  }

  function updateBreakpointsCollection() {
    const editorInstance = editorRef.current;
    const breakpointsCollection = breakpointsCollectionRef.current;
    if (editorInstance && breakpointsCollection) {
      const decorations = Object.values(decorationsRef.current);
      breakpointsCollection.clear();
      breakpointsCollection.set(decorations);
    }
  }

  function handleEditorChange(value: string | undefined) {
    const lines = value?.split('\n').length || 0;

    Object.keys(decorationsRef.current).forEach(lineNumber => {
      if (parseInt(lineNumber) > lines) {
        delete decorationsRef.current[lineNumber];
      }
    });

    updateBreakpointsCollection();
    onBreakpointsChange(Object.keys(decorationsRef.current).map(Number));
    onChange(value);
  }

  return (
    <Editor
      height="100%"
      value={value}
      defaultLanguage="go"
      theme="vs-dark"
      options={{
        automaticLayout: true,
        minimap: { enabled: false },
        glyphMargin: true
      }}
      onChange={handleEditorChange}
      onMount={handleEditorDidMount}
    />
  );
}

export default MonacoEditor;
