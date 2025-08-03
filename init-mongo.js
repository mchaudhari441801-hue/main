// MongoDB initialization script
db = db.getSiblingDB('youtube-analyzer');

// Create collections with indexes
db.createCollection('videos');

// Create indexes for better performance
db.videos.createIndex({ "youtubeUrl": 1 }, { unique: true });
db.videos.createIndex({ "videoId": 1 });
db.videos.createIndex({ "createdAt": -1 });

print('Database initialized successfully');