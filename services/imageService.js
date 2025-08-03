const ffmpeg = require('fluent-ffmpeg');
const ffmpegStatic = require('ffmpeg-static');
const path = require('path');
const fs = require('fs-extra');
const sharp = require('sharp');

ffmpeg.setFfmpegPath(ffmpegStatic);

class ImageService {
  static async extractFrames(videoPath, outputDir, count = 10) {
    try {
      // Ensure output directory exists
      await fs.ensureDir(outputDir);

      const frames = [];
      const videoInfo = await this.getVideoInfo(videoPath);
      const duration = videoInfo.duration;
      const interval = duration / (count + 1); // +1 to avoid extracting at the very end

      for (let i = 1; i <= count; i++) {
        const timestamp = interval * i;
        const filename = `frame_${i}_${Math.floor(timestamp)}s.jpg`;
        const outputPath = path.join(outputDir, filename);

        await this.extractSingleFrame(videoPath, timestamp, outputPath);
        
        frames.push({
          filename,
          path: outputPath,
          timestamp: this.formatTimestamp(timestamp),
          referenceNumber: i
        });
      }

      return frames;
    } catch (error) {
      console.error('Error extracting frames:', error);
      throw new Error('Failed to extract frames from video');
    }
  }

  static extractSingleFrame(videoPath, timestamp, outputPath) {
    return new Promise((resolve, reject) => {
      ffmpeg(videoPath)
        .seekInput(timestamp)
        .frames(1)
        .output(outputPath)
        .outputOptions(['-q:v 2']) // High quality
        .on('end', () => {
          // Optimize image with sharp
          sharp(outputPath)
            .resize(800, null, { withoutEnlargement: true })
            .jpeg({ quality: 85 })
            .toFile(outputPath.replace('.jpg', '_optimized.jpg'))
            .then(() => {
              fs.move(outputPath.replace('.jpg', '_optimized.jpg'), outputPath, { overwrite: true })
                .then(() => resolve())
                .catch(reject);
            })
            .catch(reject);
        })
        .on('error', reject)
        .run();
    });
  }

  static getVideoInfo(videoPath) {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(videoPath, (err, metadata) => {
        if (err) {
          reject(err);
        } else {
          resolve({
            duration: metadata.format.duration,
            width: metadata.streams[0].width,
            height: metadata.streams[0].height
          });
        }
      });
    });
  }

  static formatTimestamp(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    } else {
      return `${minutes}:${secs.toString().padStart(2, '0')}`;
    }
  }

  static async cleanupFile(filePath) {
    try {
      await fs.remove(filePath);
    } catch (error) {
      console.error('Error cleaning up file:', error);
    }
  }
}

module.exports = ImageService;