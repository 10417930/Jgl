
import React from 'react';
import Button from './Button';

interface HeaderProps {
    onExportZip: () => void;
    onExportPdf: () => void;
    onUndo: () => void;
    onRedo: () => void;
    onLoadWasm: () => void;
}

const Header: React.FC<HeaderProps> = ({ onExportZip, onExportPdf, onUndo, onRedo, onLoadWasm }) => {
    return (
        <header className="flex items-center gap-4 px-4 py-3 bg-gradient-to-r from-[#071020] to-[#081424] shadow-md flex-shrink-0">
            <h1 className="text-lg font-bold">
                <span className="text-brand-accent">Compose Mini-IDE</span>
                <span className="text-[#9de6b8] font-normal"> React Edition</span>
            </h1>
            <div className="ml-auto flex items-center gap-2">
                <Button onClick={onExportZip}>📦 Export ZIP</Button>
                <Button onClick={onExportPdf}>📄 Export PDF</Button>
                <Button onClick={onUndo}>↩ Undo</Button>
                <Button onClick={onRedo}>↪ Redo</Button>
                <Button onClick={onLoadWasm} primary>⚙️ Load WASM</Button>
            </div>
        </header>
    );
};

export default Header;
