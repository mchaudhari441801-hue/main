const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs-extra');
const Video = require('../models/Video');
const YouTubeService = require('../services/youtubeService');
const ImageService = require('../services/imageService');
const aiService = require('../services/aiService');

// Generate educational paragraph
router.post('/generate-paragraph/:videoId', async (req, res) => {
  try {
    const video = await Video.findById(req.params.videoId);
    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    if (!video.transcript) {
      return res.status(400).json({ error: 'No transcript available for this video' });
    }

    const imageCount = 5; // Default number of references
    const result = await aiService.generateEducationalParagraph(
      video.transcript,
      video.title,
      imageCount
    );

    // Update video with generated content
    video.generatedParagraph = result.paragraph;
    video.references = result.references;
    await video.save();

    res.json({
      videoId: video._id,
      paragraph: result.paragraph,
      references: result.references
    });
  } catch (error) {
    console.error('Error generating paragraph:', error);
    res.status(500).json({ error: error.message || 'Failed to generate paragraph' });
  }
});

// Extract images from video
router.post('/extract-images/:videoId', async (req, res) => {
  try {
    const video = await Video.findById(req.params.videoId);
    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    const { count = 10 } = req.body;
    const videoDir = path.join(__dirname, '..', 'uploads', 'videos');
    const imageDir = path.join(__dirname, '..', 'uploads', 'images', video.videoId);
    const videoPath = path.join(videoDir, `${video.videoId}.mp4`);

    // Ensure directories exist
    await fs.ensureDir(videoDir);
    await fs.ensureDir(imageDir);

    // Download video if not exists
    if (!await fs.pathExists(videoPath)) {
      await YouTubeService.downloadVideo(video.youtubeUrl, videoPath);
    }

    // Extract frames
    const frames = await ImageService.extractFrames(videoPath, imageDir, count);

    // Update frames with web-accessible paths
    const webFrames = frames.map(frame => ({
      ...frame,
      path: `/uploads/images/${video.videoId}/${frame.filename}`,
      webUrl: `${req.protocol}://${req.get('host')}/uploads/images/${video.videoId}/${frame.filename}`
    }));

    // Update video with extracted images
    video.images = webFrames;
    await video.save();

    // Clean up video file to save space
    setTimeout(async () => {
      await ImageService.cleanupFile(videoPath);
    }, 5000);

    res.json({
      videoId: video._id,
      images: webFrames,
      count: webFrames.length
    });
  } catch (error) {
    console.error('Error extracting images:', error);
    res.status(500).json({ error: error.message || 'Failed to extract images' });
  }
});

// Get combined analysis (paragraph + images)
router.post('/full-analysis/:videoId', async (req, res) => {
  try {
    const video = await Video.findById(req.params.videoId);
    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    const { imageCount = 8 } = req.body;
    
    // Generate paragraph if not exists
    let paragraphResult = null;
    if (!video.generatedParagraph && video.transcript) {
      paragraphResult = await aiService.generateEducationalParagraph(
        video.transcript,
        video.title,
        imageCount
      );
      
      video.generatedParagraph = paragraphResult.paragraph;
      video.references = paragraphResult.references;
    }

    // Extract images if not exists
    let imageResult = null;
    if (!video.images || video.images.length === 0) {
      const videoDir = path.join(__dirname, '..', 'uploads', 'videos');
      const imageDir = path.join(__dirname, '..', 'uploads', 'images', video.videoId);
      const videoPath = path.join(videoDir, `${video.videoId}.mp4`);

      await fs.ensureDir(videoDir);
      await fs.ensureDir(imageDir);

      if (!await fs.pathExists(videoPath)) {
        await YouTubeService.downloadVideo(video.youtubeUrl, videoPath);
      }

      const frames = await ImageService.extractFrames(videoPath, imageDir, imageCount);
      const webFrames = frames.map(frame => ({
        ...frame,
        path: `/uploads/images/${video.videoId}/${frame.filename}`,
        webUrl: `${req.protocol}://${req.get('host')}/uploads/images/${video.videoId}/${frame.filename}`
      }));

      video.images = webFrames;
      
      // Clean up video file
      setTimeout(async () => {
        await ImageService.cleanupFile(videoPath);
      }, 5000);
    }

    await video.save();

    // Link references to images
    const linkedReferences = video.references?.map((ref, index) => ({
      ...ref.toObject(),
      imageId: video.images[index]?._id,
      imageUrl: video.images[index]?.webUrl || video.images[index]?.path
    })) || [];

    res.json({
      videoId: video._id,
      videoInfo: {
        title: video.title,
        description: video.description,
        duration: video.duration,
        thumbnail: video.thumbnail
      },
      paragraph: video.generatedParagraph,
      references: linkedReferences,
      images: video.images,
      hasTranscript: !!video.transcript
    });
  } catch (error) {
    console.error('Error performing full analysis:', error);
    res.status(500).json({ error: error.message || 'Failed to perform full analysis' });
  }
});

// Get image by reference number
router.get('/image/:videoId/:referenceNumber', async (req, res) => {
  try {
    const video = await Video.findById(req.params.videoId);
    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    const referenceNumber = parseInt(req.params.referenceNumber);
    const image = video.images?.find(img => img.referenceNumber === referenceNumber);
    
    if (!image) {
      return res.status(404).json({ error: 'Image not found for this reference' });
    }

    res.json({
      image,
      reference: video.references?.find(ref => ref.number === referenceNumber)
    });
  } catch (error) {
    console.error('Error fetching image:', error);
    res.status(500).json({ error: 'Failed to fetch image' });
  }
});

module.exports = router;