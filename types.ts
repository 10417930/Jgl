
export interface Screen {
    id: string;
    name: string;
    compose: string;
    createdAt: number;
}

export interface Project {
    screens: Screen[];
    files: Record<string, string>; // For assets, kotlin files, etc.
}

export type SimulatedState = Record<string, any>;

export interface Status {
    message: string;
    type: 'ok' | 'warn' | 'error' | 'info';
}

export interface Snapshot {
    project: Project;
    simulatedState: SimulatedState;
    currentScreenId: string | null;
}
