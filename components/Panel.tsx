
import React from 'react';

interface PanelProps {
    title: string;
    children: React.ReactNode;
    flex?: boolean;
    className?: string;
}

const Panel: React.FC<PanelProps> = ({ title, children, flex, className }) => {
    return (
        <div className={`bg-gradient-to-b from-[#071020] to-[#071726] border border-brand-border rounded-xl p-3 shadow-lg ${flex ? 'flex flex-col' : ''} ${className}`}>
            <h3 className="mb-2 text-sm font-semibold text-brand-muted uppercase tracking-wider">{title}</h3>
            {children}
        </div>
    );
};

export default Panel;
