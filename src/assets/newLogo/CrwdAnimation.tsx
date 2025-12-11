import React from 'react';

interface CrwdAnimationProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const CrwdAnimation: React.FC<CrwdAnimationProps> = ({ 
  className = '',
  size = 'md'
}) => {
  const sizeClasses = {
    sm: {
      circle: 'w-16 h-16',
      gap: 'gap-3',
    },
    md: {
      circle: 'w-20 h-20 md:w-24 md:h-24',
      gap: 'gap-4',
    },
    lg: {
      circle: 'w-32 h-32 md:w-40 md:h-40',
      gap: 'gap-6',
    }
  };

  const currentSize = sizeClasses[size];

  return (
    <div className={`flex flex-col ${currentSize.gap} ${className}`}>
      <style>{`
        @keyframes bounceLoop {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          6.67% {
            transform: scale(1.2);
            opacity: 1;
          }
          10% {
            transform: scale(1);
            opacity: 1;
          }
          30% {
            transform: scale(1);
            opacity: 1;
          }
          33.33% {
            transform: scale(0);
            opacity: 0;
          }
          100% {
            transform: scale(0);
            opacity: 0;
          }
        }
        
        .crwd-anim-circle {
          animation: bounceLoop 3s cubic-bezier(0.34, 1.56, 0.64, 1) infinite;
        }
        
        .crwd-anim-circle-blue {
          animation-delay: 0s;
        }
        
        .crwd-anim-circle-pink {
          animation-delay: 0.3s;
        }
        
        .crwd-anim-circle-lime {
          animation-delay: 0.6s;
        }
        
        .crwd-anim-circle-purple {
          animation-delay: 0.9s;
        }
      `}</style>
      
      {/* Top row */}
      <div className={`flex ${currentSize.gap}`}>
        <div 
          className={`${currentSize.circle} rounded-full crwd-anim-circle crwd-anim-circle-blue`}
          style={{ backgroundColor: '#0000FF' }}
        />
        <div 
          className={`${currentSize.circle} rounded-full crwd-anim-circle crwd-anim-circle-pink`}
          style={{ backgroundColor: '#FF3366' }}
        />
      </div>
      
      {/* Bottom row */}
      <div className={`flex ${currentSize.gap}`}>
        <div 
          className={`${currentSize.circle} rounded-full crwd-anim-circle crwd-anim-circle-lime`}
          style={{ backgroundColor: '#ADFF2F' }}
        />
        <div 
          className={`${currentSize.circle} rounded-full crwd-anim-circle crwd-anim-circle-purple`}
          style={{ backgroundColor: '#A855F7' }}
        />
      </div>
    </div>
  );
};

export default CrwdAnimation;

