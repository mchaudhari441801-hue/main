const express = require('express');
const router = express.Router();
const Video = require('../models/Video');
const YouTubeService = require('../services/youtubeService');

// Get all processed videos
router.get('/', async (req, res) => {
  try {
    const videos = await Video.find().sort({ createdAt: -1 });
    res.json(videos);
  } catch (error) {
    console.error('Error fetching videos:', error);
    res.status(500).json({ error: 'Failed to fetch videos' });
  }
});

// Get a specific video by ID
router.get('/:id', async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }
    res.json(video);
  } catch (error) {
    console.error('Error fetching video:', error);
    res.status(500).json({ error: 'Failed to fetch video' });
  }
});

// Process a new YouTube video
router.post('/process', async (req, res) => {
  try {
    const { youtubeUrl } = req.body;

    if (!youtubeUrl) {
      return res.status(400).json({ error: 'YouTube URL is required' });
    }

    // Check if video already exists
    const existingVideo = await Video.findOne({ youtubeUrl });
    if (existingVideo) {
      return res.json(existingVideo);
    }

    // Get video information
    const videoInfo = await YouTubeService.getVideoInfo(youtubeUrl);
    
    // Get transcript
    let transcript = '';
    try {
      transcript = await YouTubeService.getTranscript(youtubeUrl);
    } catch (transcriptError) {
      console.warn('No transcript available:', transcriptError.message);
    }

    // Create new video record
    const video = new Video({
      youtubeUrl,
      videoId: videoInfo.videoId,
      title: videoInfo.title,
      description: videoInfo.description,
      duration: videoInfo.duration,
      thumbnail: videoInfo.thumbnail,
      transcript
    });

    await video.save();
    res.json(video);
  } catch (error) {
    console.error('Error processing video:', error);
    res.status(500).json({ error: error.message || 'Failed to process video' });
  }
});

// Delete a video
router.delete('/:id', async (req, res) => {
  try {
    const video = await Video.findByIdAndDelete(req.params.id);
    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }
    res.json({ message: 'Video deleted successfully' });
  } catch (error) {
    console.error('Error deleting video:', error);
    res.status(500).json({ error: 'Failed to delete video' });
  }
});

module.exports = router;