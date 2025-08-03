const mongoose = require('mongoose');

const VideoSchema = new mongoose.Schema({
  youtubeUrl: {
    type: String,
    required: true,
    unique: true
  },
  videoId: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: String,
  duration: String,
  thumbnail: String,
  transcript: String,
  generatedParagraph: String,
  images: [{
    filename: String,
    path: String,
    timestamp: String,
    referenceNumber: Number
  }],
  references: [{
    number: Number,
    imageId: mongoose.Schema.Types.ObjectId,
    description: String
  }],
  processedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Video', VideoSchema);