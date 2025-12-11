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
      circle: 'w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16',
      gap: 'gap-2 sm:gap-3',
    },
    md: {
      circle: 'w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-28 lg:h-28',
      gap: 'gap-3 sm:gap-4 md:gap-5',
    },
    lg: {
      circle: 'w-14 h-14 md:w-16 md:h-16 lg:w-20 lg:h-20 xl:w-24 xl:h-24',
      gap: 'gap-2 sm:gap-2.5 md:gap-3 lg:gap-4',
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
          8% {
            transform: scale(1.15);
            opacity: 1;
          }
          12% {
            transform: scale(1);
            opacity: 1;
          }
          30% {
            transform: scale(1);
            opacity: 1;
          }
          33.33% {
            transform: scale(0.95);
            opacity: 0.9;
          }
          36% {
            transform: scale(0);
            opacity: 0;
          }
          100% {
            transform: scale(0);
            opacity: 0;
          }
        }
        
        .crwd-anim-circle {
          animation: bounceLoop 3s cubic-bezier(0.4, 0, 0.2, 1) infinite;
          will-change: transform, opacity;
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
      <div className={`flex items-center justify-center ${currentSize.gap}`}>
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
      <div className={`flex items-center justify-center ${currentSize.gap}`}>
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

