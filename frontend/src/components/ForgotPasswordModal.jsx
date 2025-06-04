import React from 'react';

const Modal = ({ isOpen, onClose, children }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-bgPrimary p-6 rounded-lg shadow-lg text-tBase font-poppins">
                {children}
                <button
                    onClick={onClose}
                    className="mt-4 bg-fgPrimary font-poppins text-tBase px-4 py-2 rounded hover:bg-fgSecondary"
                >
                    Close
                </button>
            </div>
        </div>
    );
};

export default Modal;