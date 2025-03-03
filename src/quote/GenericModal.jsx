// GenericModal.jsx
import React from "react";

const GenericModal = ({ modalRef, children }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80">
      <div
        ref={modalRef}
        className="bg-black bg-opacity-100 p-6 max-w-md w-full mx-4 rounded-lg shadow-lg border border-white border-opacity-25"
      >
        {children}
      </div>
    </div>
  );
};

export default GenericModal;
