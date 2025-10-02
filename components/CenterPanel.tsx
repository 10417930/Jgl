
import React, { useState } from 'react';
import CodeEditor from './CodeEditor';
import Preview from './Preview';
import Panel from './Panel';
import type { Status, SimulatedState, Screen } from '../types';
import Button from './Button';

interface CenterPanelProps {
    composeCode: string;
    kotlinCode: string;
    onComposeChange: (value: string) => void;
    onKotlinChange: (value: string) => void;
    runtimeMode: 'fallback' | 'wasm';
    wasmModule: any;
    simulatedState: SimulatedState;
    updateStatus: (message: string, type: Status['type']) => void;
    executeAction: (action: string) => void;
    currentScreen: Screen | undefined;
}

const CenterPanel: React.FC<CenterPanelProps> = ({
    composeCode,
    kotlinCode,
    onComposeChange,
    onKotlinChange,
    runtimeMode,
    wasmModule,
    simulatedState,
    updateStatus,
    executeAction,
    currentScreen
}) => {
    const [previewKey, setPreviewKey] = useState(0);

    const forceRender = () => {
        setPreviewKey(k => k + 1);
        updateStatus('Preview updated', 'ok');
    };

    return (
        <section className="flex flex-col gap-3 overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-[1fr_320px] gap-3">
                <Panel title="Compose DSL (JS Runtime)">
                    <div className="h-48">
                        <CodeEditor
                            value={composeCode}
                            onChange={onComposeChange}
                            language="javascript"
                        />
                    </div>
                </Panel>
                <Panel title="Kotlin (WASM Target)">
                     <div className="h-48 flex flex-col">
                        <div className="flex-grow mb-2">
                             <CodeEditor
                                value={kotlinCode}
                                onChange={onKotlinChange}
                                language="kotlin"
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button small onClick={() => alert('Local compilation requires a Kotlin/WASM environment.')}>🔧 Compile</Button>
                             <Button small onClick={() => alert('Use "Load WASM" in header to link your compiled module.')}>🔗 Link Module</Button>
                        </div>
                    </div>
                </Panel>
            </div>
            <div className="flex-1 flex flex-col min-h-0">
                 <div className="flex items-center gap-4 p-3 bg-brand-panel border-t border-b border-brand-border-light rounded-t-lg">
                    <h3 className="text-sm font-semibold text-brand-muted">
                        Preview Runtime: <span className={runtimeMode === 'wasm' ? 'text-green-400' : 'text-yellow-400'}>{runtimeMode === 'wasm' ? 'WASM (Active)' : 'JS Fallback'}</span>
                    </h3>
                    <Button onClick={forceRender} primary>🔁 Render Preview</Button>
                </div>
                <div className="flex-1 bg-gradient-to-b from-[#0b1220] to-[#071726] border border-t-0 border-brand-border-light rounded-b-lg p-3 overflow-auto min-h-0">
                    <Preview
                        key={previewKey}
                        code={currentScreen?.compose || ''}
                        simulatedState={simulatedState}
                        runtimeMode={runtimeMode}
                        wasmModule={wasmModule}
                        updateStatus={updateStatus}
                        executeAction={executeAction}
                    />
                </div>
            </div>
        </section>
    );
};

export default CenterPanel;
