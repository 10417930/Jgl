
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    primary?: boolean;
    warning?: boolean;
    small?: boolean;
}

const Button: React.FC<ButtonProps> = ({ children, primary, warning, small, className, ...props }) => {
    const baseClasses = "font-semibold rounded-lg cursor-pointer transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-panel";
    
    const sizeClasses = small ? "px-2 py-1 text-xs" : "px-3 py-1.5 text-sm";
    
    let colorClasses = "bg-brand-panel border border-brand-border text-[#d6f6e9] hover:bg-brand-surface hover:border-brand-border-light";
    if (primary) {
        colorClasses = "bg-gradient-to-b from-teal-500 to-blue-600 text-white border-blue-500 shadow-md hover:from-teal-600 hover:to-blue-700 focus:ring-blue-500";
    } else if (warning) {
        colorClasses = "bg-yellow-600/20 border border-yellow-500/50 text-yellow-300 hover:bg-yellow-500/30 focus:ring-yellow-500";
    }
    
    return (
        <button className={`${baseClasses} ${sizeClasses} ${colorClasses} ${className}`} {...props}>
            {children}
        </button>
    );
};

export default Button;
