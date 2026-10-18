import { json } from '@codemirror/lang-json';
import { EditorView, Decoration } from '@codemirror/view';
import { oneDark } from '@codemirror/theme-one-dark';
import CodeMirror, { type ReactCodeMirrorRef } from '@uiw/react-codemirror';
import { useEffect, useMemo, useRef } from 'react';
import type { Theme } from '../hooks/useTheme';

type JsonEditorProps = {
  id: string;
  label: string;
  value: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
  theme: Theme;
  errorLine?: number | null;
  placeholder?: string;
};

export function JsonEditor({
  id,
  label,
  value,
  onChange,
  readOnly = false,
  theme,
  errorLine = null,
  placeholder,
}: JsonEditorProps) {
  const editorRef = useRef<ReactCodeMirrorRef>(null);

  const extensions = useMemo(() => {
    const errorHighlight = EditorView.decorations.of((view) => {
      if (!errorLine || errorLine < 1 || errorLine > view.state.doc.lines) {
        return Decoration.none;
      }
      const line = view.state.doc.line(errorLine);
      return Decoration.set([Decoration.line({ class: 'cm-error-line' }).range(line.from)]);
    });

    return [json(), EditorView.lineWrapping, errorHighlight];
  }, [errorLine]);

  useEffect(() => {
    if (!errorLine) {
      return;
    }
    const view = editorRef.current?.view;
    if (!view || errorLine < 1 || errorLine > view.state.doc.lines) {
      return;
    }
    const line = view.state.doc.line(errorLine);
    view.dispatch({
      effects: EditorView.scrollIntoView(line.from, { y: 'center' }),
    });
  }, [errorLine, value]);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <label htmlFor={id} className="mb-1.5 text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {label}
      </label>
      <div className="editor-shell min-h-64 flex-1" data-testid={id}>
        <CodeMirror
          id={id}
          ref={editorRef}
          value={value}
          theme={theme === 'dark' ? oneDark : undefined}
          extensions={extensions}
          readOnly={readOnly}
          editable={!readOnly}
          placeholder={placeholder}
          height="100%"
          basicSetup={{
            lineNumbers: true,
            foldGutter: true,
            highlightActiveLine: !readOnly,
            autocompletion: false,
          }}
          onChange={onChange}
          className="h-full text-[13px]"
        />
      </div>
    </div>
  );
}
