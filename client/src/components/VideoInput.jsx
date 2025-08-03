import React, { useState } from 'react';
import { Youtube, ArrowRight, AlertCircle } from 'lucide-react';
import { videoAPI } from '../services/api';
import toast from 'react-hot-toast';

const VideoInput = ({ onVideoProcessed }) => {
  const [url, setUrl] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const validateYouTubeUrl = (url) => {
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
    return youtubeRegex.test(url);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!url.trim()) {
      toast.error('Please enter a YouTube URL');
      return;
    }

    if (!validateYouTubeUrl(url)) {
      toast.error('Please enter a valid YouTube URL');
      return;
    }

    setIsProcessing(true);
    
    try {
      const video = await videoAPI.processVideo(url);
      toast.success('Video processed successfully!');
      onVideoProcessed(video);
      setUrl('');
    } catch (error) {
      console.error('Error processing video:', error);
      toast.error(error.response?.data?.error || 'Failed to process video');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-primary-100 p-4 rounded-full">
              <Youtube className="h-8 w-8 text-primary-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            YouTube Educational Analyzer
          </h1>
          <p className="text-gray-600 text-lg">
            Extract educational insights and visual references from YouTube videos
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="youtube-url" className="block text-sm font-medium text-gray-700 mb-2">
              YouTube Video URL
            </label>
            <div className="relative">
              <input
                id="youtube-url"
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                disabled={isProcessing}
              />
              <Youtube className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
          </div>

          <button
            type="submit"
            disabled={isProcessing || !url.trim()}
            className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
          >
            {isProcessing ? (
              <>
                <div className="loading-spinner h-5 w-5"></div>
                <span>Processing Video...</span>
              </>
            ) : (
              <>
                <span>Analyze Video</span>
                <ArrowRight className="h-5 w-5" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">How it works:</p>
              <ul className="space-y-1 text-blue-700">
                <li>• Extracts video transcript and information</li>
                <li>• Generates educational paragraph with numbered references</li>
                <li>• Captures key frames from the video</li>
                <li>• Links references to corresponding images</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoInput;