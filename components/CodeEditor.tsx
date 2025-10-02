
import React, { useEffect, useRef } from 'react';

interface CodeEditorProps {
    value: string;
    onChange: (value: string) => void;
    language: 'javascript' | 'kotlin';
}

const CodeEditor: React.FC<CodeEditorProps> = ({ value, onChange, language }) => {
    const editorRef = useRef<HTMLDivElement>(null);
    const viewRef = useRef<any>(null);

    useEffect(() => {
        const initEditor = () => {
            const cm = (window as any).CodeMirrorLibs;
            if (!cm || !editorRef.current) return;

            if (viewRef.current) {
                viewRef.current.destroy();
            }

            const langExtension = language === 'javascript'
                ? cm.javascript({ jsx: true })
                : cm.StreamLanguage.define(cm.kotlin);

            const state = cm.EditorState.create({
                doc: value,
                extensions: [
                    cm.basicSetup,
                    cm.oneDark,
                    cm.EditorView.lineWrapping,
                    langExtension,
                    cm.EditorView.updateListener.of((update: any) => {
                        if (update.docChanged) {
                            onChange(update.state.doc.toString());
                        }
                    }),
                ],
            });

            viewRef.current = new cm.EditorView({
                state,
                parent: editorRef.current,
            });
        };

        if ((window as any).CodeMirrorLibs) {
            initEditor();
        } else {
            window.addEventListener('codemirror-loaded', initEditor, { once: true });
        }

        return () => {
            window.removeEventListener('codemirror-loaded', initEditor);
            if (viewRef.current) {
                viewRef.current.destroy();
                viewRef.current = null;
            }
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [language]);

    useEffect(() => {
        if (viewRef.current && value !== viewRef.current.state.doc.toString()) {
            viewRef.current.dispatch({
                changes: { from: 0, to: viewRef.current.state.doc.length, insert: value },
            });
        }
    }, [value]);

    return <div ref={editorRef} className="w-full h-full overflow-hidden border border-brand-border-light rounded-lg"></div>;
};

export default CodeEditor;
