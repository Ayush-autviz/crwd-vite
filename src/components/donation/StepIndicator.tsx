import React from 'react';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps?: number;
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ 
  currentStep, 
  totalSteps = 3 
}) => {
  return (
    <div className="flex items-center justify-center mb-4">
      <div className="flex items-center space-x-2">
        {Array.from({ length: totalSteps }).map((_, index) => (
          <React.Fragment key={index}>
            <div 
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                ${index + 1 <= currentStep 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-300 text-gray-600'}`}
            >
              {index + 1}
            </div>
            
            {index < totalSteps - 1 && (
              <div 
                className={`w-16 h-1 
                  ${index + 1 < currentStep 
                    ? 'bg-blue-600' 
                    : 'bg-gray-300'}`}
              ></div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default StepIndicator;
