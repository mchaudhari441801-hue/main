import React, { useState, useEffect } from 'react';
import { FileText, Image, Clock, User, ExternalLink, Loader } from 'lucide-react';
import { analysisAPI } from '../services/api';
import toast from 'react-hot-toast';
import ImageModal from './ImageModal';

const AnalysisResult = ({ video, onBack }) => {
  const [analysis, setAnalysis] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [activeTab, setActiveTab] = useState('paragraph');

  useEffect(() => {
    if (video) {
      performAnalysis();
    }
  }, [video]);

  const performAnalysis = async () => {
    setIsLoading(true);
    try {
      const result = await analysisAPI.getFullAnalysis(video._id, 8);
      setAnalysis(result);
      
      if (!result.hasTranscript) {
        toast.error('No transcript available for this video. Some features may be limited.');
      }
    } catch (error) {
      console.error('Error performing analysis:', error);
      toast.error(error.response?.data?.error || 'Failed to analyze video');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReferenceClick = (referenceNumber) => {
    const image = analysis?.images?.find(img => img.referenceNumber === referenceNumber);
    if (image) {
      setSelectedImage({
        ...image,
        reference: analysis.references?.find(ref => ref.number === referenceNumber)
      });
    } else {
      toast.error('Image not found for this reference');
    }
  };

  const renderParagraphWithReferences = (paragraph) => {
    if (!paragraph) return null;

    const parts = paragraph.split(/(\[\d+\])/g);
    
    return parts.map((part, index) => {
      const referenceMatch = part.match(/\[(\d+)\]/);
      if (referenceMatch) {
        const refNumber = parseInt(referenceMatch[1]);
        return (
          <span
            key={index}
            className="reference-link"
            onClick={() => handleReferenceClick(refNumber)}
            title={`Click to view image ${refNumber}`}
          >
            {refNumber}
          </span>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-6xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="loading-spinner h-12 w-12 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Analyzing Video</h2>
          <p className="text-gray-600">
            Extracting transcript, generating educational content, and capturing key frames...
          </p>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="w-full max-w-6xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <p className="text-gray-600">No analysis data available</p>
          <button
            onClick={onBack}
            className="mt-4 bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Video Info Header */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="flex flex-col md:flex-row">
          <div className="md:w-1/3">
            <img
              src={analysis.videoInfo.thumbnail}
              alt={analysis.videoInfo.title}
              className="w-full h-48 md:h-full object-cover"
            />
          </div>
          <div className="md:w-2/3 p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {analysis.videoInfo.title}
            </h1>
            <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>{analysis.videoInfo.duration}</span>
              </div>
              <div className="flex items-center space-x-1">
                <ExternalLink className="h-4 w-4" />
                <a
                  href={video.youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:text-primary-700"
                >
                  Watch on YouTube
                </a>
              </div>
            </div>
            <p className="text-gray-700 text-sm leading-relaxed">
              {analysis.videoInfo.description?.substring(0, 200)}
              {analysis.videoInfo.description?.length > 200 && '...'}
            </p>
          </div>
        </div>
      </div>

      {/* Analysis Tabs */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('paragraph')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'paragraph'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <FileText className="h-4 w-4" />
                <span>Educational Summary</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('images')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'images'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Image className="h-4 w-4" />
                <span>Visual References ({analysis.images?.length || 0})</span>
              </div>
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'paragraph' && (
            <div className="space-y-6">
              {analysis.paragraph ? (
                <>
                  <div className="prose max-w-none">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Educational Summary with Visual References
                    </h3>
                    <div className="text-gray-700 leading-relaxed text-base">
                      {renderParagraphWithReferences(analysis.paragraph)}
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <p className="text-sm text-blue-800">
                      <strong>Tip:</strong> Click on the numbered references in the text above to view the corresponding images from the video.
                    </p>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">
                    {analysis.hasTranscript 
                      ? 'Educational summary will be generated here' 
                      : 'No transcript available for this video'
                    }
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'images' && (
            <div className="space-y-6">
              {analysis.images && analysis.images.length > 0 ? (
                <>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Key Visual Moments
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {analysis.images.map((image, index) => (
                      <div
                        key={index}
                        className="bg-gray-50 rounded-lg overflow-hidden cursor-pointer hover:shadow-md transition-shadow duration-200"
                        onClick={() => setSelectedImage({
                          ...image,
                          reference: analysis.references?.find(ref => ref.number === image.referenceNumber)
                        })}
                      >
                        <div className="aspect-video relative">
                          <img
                            src={image.webUrl || image.path}
                            alt={`Frame at ${image.timestamp}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.src = '/api/placeholder/300/200';
                            }}
                          />
                          <div className="absolute top-2 left-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs">
                            {image.timestamp}
                          </div>
                          {image.referenceNumber && (
                            <div className="absolute top-2 right-2 bg-primary-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium">
                              {image.referenceNumber}
                            </div>
                          )}
                        </div>
                        <div className="p-3">
                          <p className="text-sm text-gray-600">
                            Frame {index + 1} • {image.timestamp}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <Image className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No images extracted yet</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Back Button */}
      <div className="text-center">
        <button
          onClick={onBack}
          className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
        >
          Analyze Another Video
        </button>
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <ImageModal
          image={selectedImage}
          onClose={() => setSelectedImage(null)}
        />
      )}
    </div>
  );
};

export default AnalysisResult;