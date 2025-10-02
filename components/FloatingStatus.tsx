
import React from 'react';
import type { Status } from '../types';

interface FloatingStatusProps {
    status: Status;
}

const statusColors = {
    ok: 'text-green-400',
    warn: 'text-yellow-400',
    error: 'text-red-400',
    info: 'text-blue-400',
};

const FloatingStatus: React.FC<FloatingStatusProps> = ({ status }) => {
    return (
        <div className="fixed right-4 bottom-4 bg-gradient-to-t from-[#012733] to-[#063047] p-3 rounded-lg border border-[#0c3941] text-[#c8f7ea] shadow-2xl text-sm">
            <div>
                <strong>Status:</strong> <span className={statusColors[status.type]}>{status.message}</span>
            </div>
             <div className="mt-1.5 text-xs">
                Tip: Use <Kbd>execute('var = value')</Kbd> in your button actions.
            </div>
        </div>
    );
};

const Kbd: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <span className="bg-[#021018] rounded px-1.5 py-0.5 border border-[#08303b] text-[#8edfb6] font-mono">
        {children}
    </span>
);


export default FloatingStatus;
