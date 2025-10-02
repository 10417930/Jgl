
import React, { useState } from 'react';
import type { Project, SimulatedState } from '../types';
import Panel from './Panel';
import Button from './Button';

interface LeftPanelProps {
    project: Project;
    currentScreenId: string | null;
    onSelectScreen: (id: string) => void;
    onCreateScreen: (name: string) => void;
    onDeleteScreen: (id: string) => void;
    onSave: () => void;
    onSaveSnapshot: () => void;
    simulatedState: SimulatedState;
}

const LeftPanel: React.FC<LeftPanelProps> = ({
    project,
    currentScreenId,
    onSelectScreen,
    onCreateScreen,
    onDeleteScreen,
    onSave,
    onSaveSnapshot,
    simulatedState
}) => {
    const [newScreenName, setNewScreenName] = useState('');

    const handleCreate = () => {
        if (newScreenName.trim()) {
            onCreateScreen(newScreenName);
            setNewScreenName('');
        }
    };
    
    const clearStorage = () => {
        if (window.confirm('This will clear all data from localStorage and reload. Are you sure?')) {
            localStorage.clear();
            window.location.reload();
        }
    };

    return (
        <aside className="flex flex-col gap-4">
            <Panel title="Project">
                <div className="flex flex-wrap gap-2 mb-4 border-b border-brand-border pb-3">
                    {project.screens.map(screen => (
                        <button
                            key={screen.id}
                            onClick={() => onSelectScreen(screen.id)}
                            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                                currentScreenId === screen.id
                                ? 'bg-gradient-to-b from-teal-800 to-teal-900 text-brand-accent shadow-inner'
                                : 'bg-[#06111a] border border-[#0e2430] text-[#9fb8c9] hover:bg-slate-800'
                            }`}
                        >
                            {screen.name}
                        </button>
                    ))}
                </div>
                 <div className="flex gap-2 mb-4">
                    <input
                        type="text"
                        value={newScreenName}
                        onChange={(e) => setNewScreenName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                        placeholder="New screen name"
                        className="flex-grow bg-[#071022] text-[#dbeafe] border border-[#122432] px-3 py-1.5 rounded-lg text-sm"
                    />
                    <Button onClick={handleCreate}>Create</Button>
                </div>

                <div className="flex flex-col gap-2 mb-4">
                    {project.screens.map(s => (
                        <div key={s.id} className="flex justify-between items-center p-2 rounded-lg bg-[#071722] border border-[#0f2a32]">
                            <div className="text-sm">
                                <strong className="text-white">{s.name}</strong>
                                <div className="text-xs text-brand-muted">{s.id}</div>
                            </div>
                            <div className="flex gap-2">
                                <Button onClick={() => onSelectScreen(s.id)} small>Edit</Button>
                                <Button onClick={() => onDeleteScreen(s.id)} small warning>Delete</Button>
                            </div>
                        </div>
                    ))}
                </div>
                 
                <div className="border-t border-brand-border pt-3">
                    <h3 className="text-sm font-semibold text-brand-muted mb-2">Quick Actions</h3>
                    <div className="grid grid-cols-2 gap-2">
                        <Button onClick={onSave}>💾 Save</Button>
                        <Button onClick={onSaveSnapshot}>📸 Snapshot</Button>
                        <Button onClick={clearStorage} warning className="col-span-2">🧹 Clear Storage</Button>
                    </div>
                </div>
            </Panel>
            <Panel title="Global State (simulatedState)" flex>
                <div className="bg-[#07111a] border border-[#0e2b34] p-2.5 rounded-lg text-[#bfe8d6] font-mono text-xs whitespace-pre-wrap break-all flex-1 overflow-auto">
                    {JSON.stringify(simulatedState, null, 2)}
                </div>
            </Panel>
        </aside>
    );
};

export default LeftPanel;
