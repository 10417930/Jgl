
import React, { useState, useCallback, useEffect } from 'react';
import { useProjectState } from './hooks/useProjectState';
import Header from './components/Header';
import LeftPanel from './components/LeftPanel';
import CenterPanel from './components/CenterPanel';
import RightPanel from './components/RightPanel';
import FloatingStatus from './components/FloatingStatus';
import { exportProjectZip, exportPdf } from './services/projectExporter';

export default function App() {
    const {
        project,
        setProject,
        simulatedState,
        setSimulatedState,
        currentScreenId,
        setCurrentScreenId,
        status,
        updateStatus,
        undo,
        redo,
        saveCurrentScreenCode,
        getCurrentScreen,
        newScreen,
        deleteScreen,
        executeAction,
        snapshot,
    } = useProjectState();

    const [wasmModule, setWasmModule] = useState<any>(null);
    const [runtimeMode, setRuntimeMode] = useState<'fallback' | 'wasm'>('fallback');
    const [composeCode, setComposeCode] = useState('');
    const [kotlinCode, setKotlinCode] = useState('');

    useEffect(() => {
        const screen = getCurrentScreen();
        setComposeCode(screen?.compose || '');
        setKotlinCode(project.files[screen?.id + '_kotlin'] || '');
    }, [currentScreenId, project, getCurrentScreen]);

    const handleSelectScreen = (id: string) => {
        saveCurrentScreenCode(id, composeCode, kotlinCode);
        setCurrentScreenId(id);
    };

    const handleCreateScreen = (name: string) => {
        newScreen(name);
    };

    const handleDeleteScreen = (id: string) => {
        if (window.confirm('Are you sure you want to delete this screen?')) {
            deleteScreen(id);
        }
    };
    
    const handleComposeChange = useCallback((value: string) => {
        setComposeCode(value);
    }, []);

    const handleKotlinChange = useCallback((value: string) => {
        setKotlinCode(value);
    }, []);

    const handleSave = () => {
        saveCurrentScreenCode(currentScreenId, composeCode, kotlinCode);
        snapshot(); // Also save to local storage via snapshot
        updateStatus('Project saved!', 'ok');
    };

    const handleLoadWasm = async () => {
        const glue = prompt('Paste the JS glue code that exposes window.wasmCompose.renderCompose(stateJson, containerId)');
        if (!glue) {
            updateStatus('WASM load cancelled.', 'warn');
            return;
        }

        updateStatus('Loading WASM module...', 'ok');
        try {
            document.querySelectorAll('script[data-glue]').forEach(s => s.remove());
            const script = document.createElement('script');
            script.type = 'module';
            script.textContent = glue;
            script.setAttribute('data-glue', 'true');
            document.body.appendChild(script);

            await new Promise(r => setTimeout(r, 200));

            const globalWasm: any = (window as any).wasmCompose;
            if (globalWasm && typeof globalWasm.renderCompose === 'function') {
                setWasmModule(globalWasm);
                setRuntimeMode('wasm');
                updateStatus('WASM module loaded successfully!', 'ok');
            } else {
                setWasmModule(null);
                setRuntimeMode('fallback');
                updateStatus('Glue code did not expose wasmCompose.renderCompose', 'error');
            }
        } catch (e) {
            const error = e as Error;
            updateStatus(`Error loading WASM: ${error.message}`, 'error');
            console.error(e);
        }
    };
    
    const handleRunExample = () => {
        const screen = getCurrentScreen();
        if (screen) {
            const exampleCode = `// DSL Compose runtime example
render(()=> {
  Column(()=> {
    Text(()=> 'Welcome to Compose DSL');
    Button(()=> execute('counter = (counter||0) + 1'), ()=> 'Clicks: ' + (state.counter||0));
  })
})`;
            setComposeCode(exampleCode);
            updateStatus('Example loaded into editor.', 'ok');
        }
    };

    const handleLoadFullExample = () => {
        if (window.confirm('This will load a full demo and overwrite the current screen and state. Continue?')) {
            const screen = getCurrentScreen();
            if (screen) {
                 const exampleCode = `// Example: Simple form
render(()=> {
  Column(()=> {
    Text(()=> 'User: ' + (state.user.name||'--'));
    Button(()=> execute('user.name = "Jane"; user.age = 30;'), 'Set User to Jane');
    LazyColumn((state.items||[1,2,3]), (item)=> Text(()=> 'Item #' + item));
  })
})`;
                setComposeCode(exampleCode);
                setSimulatedState({ user: { name: 'Initial', age: 25 }, counter: 0, items: [10, 20, 30] });
                updateStatus('Full demo loaded.', 'ok');
            }
        }
    };

    return (
        <div className="bg-gradient-to-b from-[#071020] to-[#071726] text-[#e6eef6] h-screen flex flex-col font-sans">
            <Header
                onExportZip={() => exportProjectZip(project, simulatedState, saveCurrentScreenCode, currentScreenId, composeCode, kotlinCode)}
                onExportPdf={() => exportPdf(project, saveCurrentScreenCode, currentScreenId, composeCode, kotlinCode)}
                onUndo={undo}
                onRedo={redo}
                onLoadWasm={handleLoadWasm}
            />
            <main className="flex-1 grid grid-cols-1 xl:grid-cols-[360px_1fr_420px] gap-3 p-3 overflow-hidden">
                <LeftPanel
                    project={project}
                    currentScreenId={currentScreenId}
                    onSelectScreen={handleSelectScreen}
                    onCreateScreen={handleCreateScreen}
                    onDeleteScreen={handleDeleteScreen}
                    onSave={handleSave}
                    onSaveSnapshot={snapshot}
                    simulatedState={simulatedState}
                />
                <CenterPanel
                    composeCode={composeCode}
                    kotlinCode={kotlinCode}
                    onComposeChange={handleComposeChange}
                    onKotlinChange={handleKotlinChange}
                    runtimeMode={runtimeMode}
                    wasmModule={wasmModule}
                    simulatedState={simulatedState}
                    updateStatus={updateStatus}
                    executeAction={executeAction}
                    currentScreen={getCurrentScreen()}
                />
                <RightPanel
                    onRunExample={handleRunExample}
                    onLoadFullExample={handleLoadFullExample}
                    project={project}
                    setProject={setProject}
                    updateStatus={updateStatus}
                    onExportZip={() => exportProjectZip(project, simulatedState, saveCurrentScreenCode, currentScreenId, composeCode, kotlinCode)}
                />
            </main>
            <FloatingStatus status={status} />
        </div>
    );
}
