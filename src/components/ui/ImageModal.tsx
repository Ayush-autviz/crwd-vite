import React, { useState } from "react";

interface ImageModalProps {
  src: string;
  alt: string;
  children: React.ReactNode;
  fallbackText?: string;
  fallbackColor?: string;
}

const ImageModal: React.FC<ImageModalProps> = ({
  src,
  alt,
  children,
  fallbackText,
  fallbackColor,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasError, setHasError] = useState(!src);

  const handleOpen = () => setIsOpen(true);
  const handleClose = () => setIsOpen(false);

  return (
    <>
      <div onClick={handleOpen} className="cursor-pointer">
        {children}
      </div>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-[1px] flex items-center justify-center z-50 p-4"
          onClick={handleClose}
        >
          <div className="relative w-full h-full flex items-center justify-center">
            {!hasError ? (
              <img
                src={src}
                alt={alt}
                className="rounded-full object-cover"
                style={{
                  width: "40vh",
                  height: "40vh",
                }}
                onError={() => setHasError(true)}
              />
            ) : (
              <div 
                className="rounded-full flex items-center justify-center text-white font-bold"
                style={{ 
                  backgroundColor: fallbackColor || '#e5e7eb', 
                  width: "40vh",
                  height: "40vh",
                  fontSize: 'clamp(3rem, 10vw, 8rem)' 
                }}
              >
                {fallbackText || alt?.charAt(0)?.toUpperCase() || "U"}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ImageModal;
