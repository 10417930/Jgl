
import { useState, useEffect, useCallback, useRef } from 'react';
import type { Project, Screen, SimulatedState, Status, Snapshot } from '../types';

const STATE_KEY = 'mini_ide_compose_react_v1';

const defaultScreen: Screen = {
    id: 's_initial',
    name: 'MainScreen',
    compose: `// Welcome to the Compose Mini IDE!
// Use the render() function to define your UI.
render(() => {
  Column(() => {
    Text(() => 'Hello, ' + (state.name || 'World') + '!');
    
    // Buttons can execute actions to modify the state
    Button(
      () => execute('counter = (counter || 0) + 1'), 
      () => 'Clicks: ' + (state.counter || 0)
    );
  })
})`,
    createdAt: Date.now(),
};

const defaultProject: Project = {
    screens: [defaultScreen],
    files: {},
};

const defaultSimulatedState: SimulatedState = {
    name: 'React',
    counter: 0,
};

export function useProjectState() {
    const [project, setProject] = useState<Project>(defaultProject);
    const [simulatedState, setSimulatedState] = useState<SimulatedState>(defaultSimulatedState);
    const [currentScreenId, setCurrentScreenId] = useState<string | null>(defaultScreen.id);
    const [status, setStatus] = useState<Status>({ message: 'Ready', type: 'ok' });

    const history = useRef<Snapshot[]>([]);
    const historyIndex = useRef<number>(-1);

    const updateStatus = useCallback((message: string, type: Status['type']) => {
        setStatus({ message, type });
        setTimeout(() => setStatus(prev => prev.message === message ? { message: 'Ready', type: 'ok' } : prev), 3000);
    }, []);

    const saveToLocal = useCallback((snapshotToSave: Snapshot) => {
        try {
            localStorage.setItem(STATE_KEY, JSON.stringify({
                ...snapshotToSave,
                history: history.current,
                historyIndex: historyIndex.current,
            }));
        } catch (e) {
            console.error("Failed to save to localStorage", e);
            updateStatus('Failed to save state', 'error');
        }
    }, [updateStatus]);

    const snapshot = useCallback(() => {
        const snap: Snapshot = {
            project: JSON.parse(JSON.stringify(project)),
            simulatedState: JSON.parse(JSON.stringify(simulatedState)),
            currentScreenId,
        };
        history.current = history.current.slice(0, historyIndex.current + 1);
        history.current.push(snap);
        historyIndex.current++;
        saveToLocal(snap);
        updateStatus('Snapshot saved', 'ok');
    }, [project, simulatedState, currentScreenId, saveToLocal, updateStatus]);

    const restore = useCallback((snap: Snapshot) => {
        setProject(snap.project);
        setSimulatedState(snap.simulatedState);
        setCurrentScreenId(snap.currentScreenId);
    }, []);

    const undo = useCallback(() => {
        if (historyIndex.current <= 0) {
            updateStatus('Nothing to undo', 'warn');
            return;
        }
        historyIndex.current--;
        restore(history.current[historyIndex.current]);
        updateStatus('Undo successful', 'ok');
    }, [restore, updateStatus]);

    const redo = useCallback(() => {
        if (historyIndex.current >= history.current.length - 1) {
            updateStatus('Nothing to redo', 'warn');
            return;
        }
        historyIndex.current++;
        restore(history.current[historyIndex.current]);
        updateStatus('Redo successful', 'ok');
    }, [restore, updateStatus]);

    useEffect(() => {
        const raw = localStorage.getItem(STATE_KEY);
        if (raw) {
            try {
                const data = JSON.parse(raw);
                if (data.project) setProject(data.project);
                if (data.simulatedState) setSimulatedState(data.simulatedState);
                if (data.currentScreenId) setCurrentScreenId(data.currentScreenId);
                if (data.history) history.current = data.history;
                if (data.historyIndex) historyIndex.current = data.historyIndex;
                updateStatus('Project loaded from storage', 'ok');
            } catch (e) {
                console.warn('Could not load from localStorage', e);
                updateStatus('Failed to load project', 'error');
                snapshot(); // Create an initial snapshot if loading fails
            }
        } else {
            snapshot(); // Create initial snapshot on first load
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const getCurrentScreen = useCallback(() => {
        return project.screens.find(s => s.id === currentScreenId);
    }, [project.screens, currentScreenId]);

    const saveCurrentScreenCode = useCallback((screenId: string | null, composeCode: string, kotlinCode: string) => {
        if (!screenId) return;
        setProject(p => {
            const newScreens = p.screens.map(s => s.id === screenId ? { ...s, compose: composeCode } : s);
            const newFiles = { ...p.files, [screenId + '_kotlin']: kotlinCode };
            return { screens: newScreens, files: newFiles };
        });
    }, []);
    
    const newScreen = useCallback((name: string) => {
        const id = 's_' + Math.random().toString(36).slice(2, 9);
        const screen: Screen = {
            id,
            name: name || `Screen${project.screens.length + 1}`,
            compose: `// New Screen: ${name}\nrender(()=>{\n  Column(()=>{\n    Text(()=> 'This is ${name}')\n  })\n})`,
            createdAt: Date.now()
        };
        setProject(p => ({ ...p, screens: [...p.screens, screen] }));
        setCurrentScreenId(id);
        snapshot();
    }, [project.screens.length, snapshot]);
    
    const deleteScreen = useCallback((id: string) => {
        setProject(p => {
            const newScreens = p.screens.filter(s => s.id !== id);
            return {...p, screens: newScreens};
        });
        if (currentScreenId === id) {
            setCurrentScreenId(project.screens.length > 1 ? project.screens.find(s => s.id !== id)?.id || null : null);
        }
        snapshot();
    }, [currentScreenId, project.screens, snapshot]);
    
    const executeAction = useCallback((actionString: string) => {
        const cmds = String(actionString).split(';').map(s => s.trim()).filter(Boolean);
        let stateChanged = false;

        setSimulatedState(currentState => {
            const newState = JSON.parse(JSON.stringify(currentState));
            cmds.forEach(cmd => {
                const [left, right] = cmd.split('=').map(s => s && s.trim());
                if (!left || !right) return;
                try {
                    const func = new Function('state', `with(state) { return ${right}; }`);
                    const value = func(newState);

                    // Support nested properties
                    const parts = left.split('.');
                    let obj = newState;
                    for (let i = 0; i < parts.length - 1; i++) {
                        obj[parts[i]] = obj[parts[i]] || {};
                        obj = obj[parts[i]];
                    }
                    obj[parts[parts.length - 1]] = value;
                    stateChanged = true;
                } catch (e) {
                    console.error('Execute error:', e);
                    updateStatus(`Action error: ${(e as Error).message}`, 'error');
                }
            });
            return newState;
        });

        if (stateChanged) {
            snapshot();
        }
    }, [snapshot, updateStatus]);


    return {
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
        snapshot,
        getCurrentScreen,
        saveCurrentScreenCode,
        newScreen,
        deleteScreen,
        executeAction,
    };
}
