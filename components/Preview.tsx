
import React, { useEffect, useRef, useState } from 'react';
import type { SimulatedState, Status } from '../types';
import { renderDsl } from '../services/dslRenderer';

interface PreviewProps {
    code: string;
    simulatedState: SimulatedState;
    runtimeMode: 'fallback' | 'wasm';
    wasmModule: any;
    updateStatus: (message: string, type: Status['type']) => void;
    executeAction: (action: string) => void;
}

const Preview: React.FC<PreviewProps> = ({
    code,
    simulatedState,
    runtimeMode,
    wasmModule,
    updateStatus,
    executeAction
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [logs, setLogs] = useState<string[]>([]);
    
    const log = (message: string) => setLogs(prev => [...prev, message]);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        setLogs([]);
        container.innerHTML = '';

        const renderAsync = async () => {
            if (runtimeMode === 'wasm' && wasmModule && typeof wasmModule.renderCompose === 'function') {
                try {
                    updateStatus('Rendering with WASM...', 'info');
                    log('WASM Runtime: Rendering...');
                    
                    const stateJson = JSON.stringify(simulatedState);
                    // Assume wasm module appends to a container by ID
                    container.id = `preview-surface-${Date.now()}`;
                    await wasmModule.renderCompose(stateJson, container.id);
                    
                    log('WASM Runtime: Render complete.');
                    updateStatus('WASM render successful', 'ok');
                } catch (e) {
                    const error = e as Error;
                    log(`WASM Error: ${error.message}`);
                    updateStatus(`WASM error, check logs.`, 'error');
                }
            } else {
                updateStatus('Rendering with JS fallback...', 'info');
                log('JS Fallback: Rendering...');
                try {
                    renderDsl(code, simulatedState, container, executeAction, log);
                    log('JS Fallback: Render complete.');
                } catch (e) {
                    const error = e as Error;
                     log(`JS Fallback Error: ${error.message}`);
                    const errBox = document.createElement('pre');
                    errBox.className = 'text-red-400 font-mono text-xs p-2 bg-red-900/20 rounded';
                    errBox.textContent = `DSL Runtime Error:\n${error.message}\n\n${error.stack}`;
                    container.appendChild(errBox);
                }
            }
        };

        renderAsync();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [code, simulatedState, runtimeMode, wasmModule, executeAction, updateStatus]);

    return (
        <div className="h-full flex flex-col gap-3">
             <div ref={containerRef} className="flex-1 bg-gradient-to-b from-white/5 to-transparent rounded-lg p-4 min-h-[200px]">
                 {/* Content is rendered here by useEffect */}
             </div>
             <div className="h-32">
                <h3 className="text-sm font-semibold text-brand-muted mb-2">Logs</h3>
                <div className="log bg-black/30 p-2 rounded-lg h-full overflow-auto font-mono text-xs text-[#9ccfd8] whitespace-pre-wrap">
                    {logs.join('\n')}
                </div>
             </div>
        </div>
    );
};

export default Preview;
