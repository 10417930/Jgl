
import React from 'react';
import Panel from './Panel';
import Button from './Button';
import type { Project, Status } from '../types';

interface RightPanelProps {
    onRunExample: () => void;
    onLoadFullExample: () => void;
    onExportZip: () => void;
    project: Project;
    setProject: React.Dispatch<React.SetStateAction<Project>>;
    updateStatus: (message: string, type: Status['type']) => void;
}

const RightPanel: React.FC<RightPanelProps> = ({ onRunExample, onLoadFullExample, onExportZip, project, setProject, updateStatus }) => {
    
    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files || []);
        if (files.length === 0) return;

        let updatedFiles = { ...project.files };
        for (const file of files) {
            try {
                const content = await file.text();
                updatedFiles[file.name] = content;
                updateStatus(`Loaded file: ${file.name}`, 'ok');
            } catch (e) {
                updateStatus(`Failed to read file: ${file.name}`, 'error');
            }
        }
        setProject(p => ({ ...p, files: updatedFiles }));
    };

    return (
        <aside className="flex flex-col gap-4">
            <Panel title="Tools">
                <div className="grid grid-cols-2 gap-2">
                    <Button onClick={onRunExample}>▶️ Run Example</Button>
                    <Button onClick={onLoadFullExample}>📥 Load Demo</Button>
                </div>
            </Panel>
            <Panel title="File Manager">
                <input
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
                />
                <div className="mt-4">
                    <Button onClick={onExportZip} className="w-full">⬇ Download Project (ZIP)</Button>
                </div>
            </Panel>
             <Panel title="WASM Integration Guide" flex>
                <ol className="text-sm text-brand-muted list-decimal list-inside space-y-2">
                    <li>Compile Compose Multiplatform to WASM/Skiko.</li>
                    <li>Expose a JS function: `window.wasmCompose.renderCompose(stateJson, containerId)`.</li>
                    <li>Load the generated JS glue code via the "Load WASM" button.</li>
                    <li>The app will automatically switch to the WASM runtime for rendering.</li>
                </ol>
            </Panel>
        </aside>
    );
};

export default RightPanel;
