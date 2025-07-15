import React from 'react';

interface ControlsProps {
  isAuthenticated: boolean;
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
}

const Controls: React.FC<ControlsProps> = ({ isAuthenticated, setIsAuthenticated }) => {
  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="flex items-center space-x-4 bg-gray-100 p-3 rounded-lg">
        <span className="font-semibold">View Mode:</span>
        <label className="flex items-center cursor-pointer">
          <input 
            type="checkbox" 
            checked={isAuthenticated}
            onChange={() => setIsAuthenticated(!isAuthenticated)}
            className="sr-only peer"
          />
          <div className="relative w-11 h-6 bg-gray-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          <span className="ml-3 text-sm font-medium text-gray-900">
            {isAuthenticated ? 'Owner (Editing Enabled)' : 'Visitor (Editing Disabled)'}
          </span>
        </label>
      </div>
    </div>
  );
};

export default Controls;
