const { getSubtitles } = require('youtube-transcript');
const youtubedl = require('youtube-dl-exec');
const axios = require('axios');

class YouTubeService {
  static extractVideoId(url) {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  }

  static async getVideoInfo(url) {
    try {
      const videoId = this.extractVideoId(url);
      if (!videoId) {
        throw new Error('Invalid YouTube URL');
      }

      const info = await youtubedl(url, {
        dumpSingleJson: true,
        noCheckCertificates: true,
        noWarnings: true,
        preferFreeFormats: true,
        addHeader: ['referer:youtube.com', 'user-agent:googlebot']
      });

      return {
        videoId,
        title: info.title,
        description: info.description,
        duration: info.duration_string,
        thumbnail: info.thumbnail,
        uploader: info.uploader
      };
    } catch (error) {
      console.error('Error getting video info:', error);
      throw new Error('Failed to get video information');
    }
  }

  static async getTranscript(url) {
    try {
      const videoId = this.extractVideoId(url);
      if (!videoId) {
        throw new Error('Invalid YouTube URL');
      }

      const transcript = await getSubtitles({
        videoID: videoId,
        lang: 'en'
      });

      return transcript.map(item => item.text).join(' ');
    } catch (error) {
      console.error('Error getting transcript:', error);
      // Try alternative languages if English fails
      try {
        const transcript = await getSubtitles({
          videoID: this.extractVideoId(url)
        });
        return transcript.map(item => item.text).join(' ');
      } catch (altError) {
        throw new Error('No transcript available for this video');
      }
    }
  }

  static async downloadVideo(url, outputPath) {
    try {
      const result = await youtubedl(url, {
        output: outputPath,
        format: 'best[height<=720]',
        noCheckCertificates: true,
        noWarnings: true
      });
      
      return result;
    } catch (error) {
      console.error('Error downloading video:', error);
      throw new Error('Failed to download video');
    }
  }
}

module.exports = YouTubeService;