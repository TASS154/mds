import React from 'react';
import { motion } from 'framer-motion';

interface ResourceBarProps {
  label: string;
  current: number;
  max: number;
  color: string;
  icon?: React.ReactNode;
  onClick?: (value: number) => void;
}

export default function ResourceBar({ label, current, max, color, icon, onClick }: ResourceBarProps) {
  const percentage = (current / max) * 100;

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!onClick) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newPercentage = (clickX / rect.width) * 100;
    const newValue = Math.round((newPercentage / 100) * max);
    
    onClick(Math.max(0, Math.min(max, newValue)));
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {icon}
          <span className="text-sm font-medium text-gray-300">{label}</span>
        </div>
        <span className="text-sm text-gray-400">
          {current}/{max}
        </span>
      </div>
      
      <div 
        className="relative h-4 bg-gray-700 rounded-full overflow-hidden cursor-pointer group"
        onClick={handleClick}
      >
        <motion.div
          className={`h-full ${color} transition-all duration-300 group-hover:brightness-110`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
        
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-medium text-white drop-shadow-lg">
            {Math.round(percentage)}%
          </span>
        </div>
      </div>
    </div>
  );
}