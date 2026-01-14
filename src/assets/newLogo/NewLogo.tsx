// import React from 'react';

// interface NewLogoProps {
//   textColor?: string;
//   className?: string;
//   size?: 'sm' | 'md' | 'lg';
// }

// const NewLogo: React.FC<NewLogoProps> = ({ 
//   textColor = '#000000', 
//   className = '',
//   size = 'md' 
// }) => {
//   const sizeClasses = {
//     sm: {
//       grid: 'w-6 h-6',
//       dot: 'w-2 h-2',
//       text: 'text-base'
//     },
//     md: {
//       grid: 'w-8 h-8 md:w-10 md:h-10',
//       dot: 'w-3 h-3 md:w-4 md:h-4',
//       text: 'text-xl md:text-2xl'
//     },
//     lg: {
//       grid: 'w-12 h-12 md:w-16 md:h-16',
//       dot: 'w-5 h-5 md:w-6 md:h-6',
//       text: 'text-3xl md:text-4xl'
//     }
//   };

//   const currentSize = sizeClasses[size];

//   return (
//     <div className={`flex items-center gap-2 md:gap-3 ${className}`}>
//       <div className={`grid grid-cols-2 gap-1 ${currentSize.grid}`}>
//         <div 
//           className={`${currentSize.dot} rounded-full`}
//           style={{ backgroundColor: '#0000FF' }}
//         />
//         <div 
//           className={`${currentSize.dot} rounded-full`}
//           style={{ backgroundColor: '#FF3366' }}
//         />
//         <div 
//           className={`${currentSize.dot} rounded-full`}
//           style={{ backgroundColor: '#ADFF2F' }}
//         />
//         <div 
//           className={`${currentSize.dot} rounded-full`}
//           style={{ backgroundColor: '#A855F7' }}
//         />
//       </div>
//       <div 
//         className={`font-bold ${currentSize.text} lowercase`}
//         style={{ color: textColor }}
//       >
//         crwd
//       </div>
//     </div>
//   );
// };

// export default NewLogo;







import React from 'react';

interface NewLogoProps {
  textColor?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const NewLogo: React.FC<NewLogoProps> = ({
  textColor = '#000000',
  className = '',
  size = 'md'
}) => {
  const sizeClasses = {
    sm: {
      grid: 'w-2.5 h-2.5',
      dot: 'w-2 h-2',
      text: 'text-lg'
    },
    md: {
      grid: 'w-6 h-6 md:w-7 md:h-7', // ⬇️ smaller logo mark
      dot: 'w-2.5 h-2.5 md:w-3 md:h-3',
      text: 'text-2xl md:text-3xl' // ⬆️ text stays dominant
    },
    lg: {
      grid: 'w-9 h-9 md:w-11 md:h-11',
      dot: 'w-3.5 h-3.5 md:w-4.5 md:h-4.5',
      text: 'text-4xl md:text-5xl'
    }
  };

  const currentSize = sizeClasses[size];

  return (
    <div className={`flex items-center gap-1.5 md:gap-2 ${className}`}>
      <div
        className={`grid grid-cols-2 gap-0.5 mt-0.5 ${currentSize.grid}`} // compact grid
      >
        <div className={`${currentSize.dot} rounded-full`} style={{ backgroundColor: '#0000FF' }} />
        <div className={`${currentSize.dot} rounded-full`} style={{ backgroundColor: '#FF3366' }} />
        <div className={`${currentSize.dot} rounded-full`} style={{ backgroundColor: '#ADFF2F' }} />
        <div className={`${currentSize.dot} rounded-full`} style={{ backgroundColor: '#A855F7' }} />
      </div>

      <div
        className={`font-[800] ${currentSize.text} lowercase leading-none`}
        style={{ color: textColor }}
      >
        crwd
      </div>
    </div>
  );
};

export default NewLogo;
