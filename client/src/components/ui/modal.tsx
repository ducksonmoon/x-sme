import React from "react";

interface ModalProps {
  title?: string;
  children: React.ReactNode;
  onClose: () => void;
}

const Modal: React.FC<ModalProps> = ({ title, children, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg max-w-md w-full p-6 relative animate-fade-in">
        <button
          onClick={onClose}
          className="absolute top-3 left-3 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          aria-label="بستن"
        >
          <span aria-hidden>×</span>
        </button>
        {title && (
          <div className="mb-4 text-lg font-bold text-gray-900 dark:text-white">
            {title}
          </div>
        )}
        <div>{children}</div>
      </div>
    </div>
  );
};

export default Modal;
