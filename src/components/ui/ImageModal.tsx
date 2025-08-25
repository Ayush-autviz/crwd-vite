import React, { useState } from "react";

interface ImageModalProps {
  src: string;
  alt: string;
  children: React.ReactNode;
}

const ImageModal: React.FC<ImageModalProps> = ({ src, alt, children }) => {
  const [isOpen, setIsOpen] = useState(false);

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
            <img
              src={src}
              alt={alt}
              className="w-[60vw] h-[60vh] rounded-2xl object-contain"
            />
          </div>
        </div>
      )}
    </>
  );
};

export default ImageModal;
