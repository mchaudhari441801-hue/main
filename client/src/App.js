import React, { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import VideoInput from './components/VideoInput';
import AnalysisResult from './components/AnalysisResult';
import './index.css';

function App() {
  const [currentVideo, setCurrentVideo] = useState(null);
  const [currentView, setCurrentView] = useState('input'); // 'input' or 'analysis'

  const handleVideoProcessed = (video) => {
    setCurrentVideo(video);
    setCurrentView('analysis');
  };

  const handleBackToInput = () => {
    setCurrentVideo(null);
    setCurrentView('input');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-4 py-8">
        {currentView === 'input' && (
          <VideoInput onVideoProcessed={handleVideoProcessed} />
        )}
        
        {currentView === 'analysis' && currentVideo && (
          <AnalysisResult 
            video={currentVideo} 
            onBack={handleBackToInput}
          />
        )}
      </div>
      
      {/* Toast notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#4ade80',
              secondary: '#fff',
            },
          },
          error: {
            duration: 5000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </div>
  );
}

export default App;