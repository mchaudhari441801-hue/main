import React, { useEffect } from 'react';
import { X, Clock, Hash } from 'lucide-react';

const ImageModal = ({ image, onClose }) => {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [onClose]);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-xl max-w-4xl max-h-[90vh] overflow-auto animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-gray-600">
              <Clock className="h-4 w-4" />
              <span className="text-sm">{image.timestamp}</span>
            </div>
            {image.referenceNumber && (
              <div className="flex items-center space-x-2 text-gray-600">
                <Hash className="h-4 w-4" />
                <span className="text-sm">Reference {image.referenceNumber}</span>
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Image */}
        <div className="p-6">
          <div className="mb-6">
            <img
              src={image.webUrl || image.path}
              alt={`Frame at ${image.timestamp}`}
              className="w-full max-h-96 object-contain rounded-lg shadow-lg"
              onError={(e) => {
                e.target.src = '/api/placeholder/800/600';
              }}
            />
          </div>

          {/* Reference Information */}
          {image.reference && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">
                Reference Context
              </h3>
              <p className="text-gray-700 text-sm leading-relaxed">
                {image.reference.description || 'Visual reference from the educational content'}
              </p>
            </div>
          )}

          {/* Image Details */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
            <div>
              <span className="font-medium">Timestamp:</span> {image.timestamp}
            </div>
            <div>
              <span className="font-medium">Reference Number:</span> {image.referenceNumber || 'N/A'}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-xl">
          <div className="flex justify-between items-center">
            <p className="text-xs text-gray-500">
              Click outside or press Escape to close
            </p>
            <button
              onClick={onClose}
              className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageModal;