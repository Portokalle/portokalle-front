import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  panelClassName?: string;
  overlayClassName?: string;
  showCloseButton?: boolean;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  panelClassName,
  overlayClassName,
  showCloseButton = true,
}) => {
  if (!isOpen) return null;
  return (
    <div className={overlayClassName ?? "fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"}>
      <div className={panelClassName ?? "bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative"}>
        {showCloseButton && (
          <button
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-2xl font-bold"
            onClick={onClose}
            aria-label="Close"
          >
            &times;
          </button>
        )}
        {children}
      </div>
    </div>
  );
};

export default Modal;
