# YouTube Educational Analyzer

A comprehensive web application that analyzes educational YouTube videos to extract key insights and visual references. The application generates educational summaries with clickable numbered references that link to relevant images captured from the video.

## Features

### 🎥 Video Processing
- Extract video information and metadata from YouTube URLs
- Download video transcripts automatically
- Support for multiple languages (fallback mechanism)

### 📝 AI-Powered Analysis
- Generate educational summaries using OpenAI GPT
- Create numbered references naturally integrated into the content
- Context-aware paragraph generation focused on educational content

### 🖼️ Image Extraction
- Capture key frames from videos using FFmpeg
- Optimize images for web display
- Link images to numbered references in the text
- Interactive image gallery with modal viewing

### 🔗 Interactive References
- Clickable numbered references in generated text
- Seamless navigation between text and corresponding images
- Modal popup with image details and context

### 💾 MongoDB Integration
- Store video metadata and analysis results
- Efficient indexing for fast retrieval
- Persistent storage for processed videos

## Technology Stack

### Backend
- **Node.js** with Express.js framework
- **MongoDB** with Mongoose ODM
- **FFmpeg** for video processing and frame extraction
- **OpenAI API** for educational content generation
- **YouTube-DL** for video information and download
- **Sharp** for image optimization

### Frontend
- **React 18** with modern hooks
- **Tailwind CSS** for responsive design
- **Lucide React** for icons
- **React Hot Toast** for notifications
- **Axios** for API communication

### DevOps
- **Docker** with multi-stage builds
- **Docker Compose** for development environment
- Health checks and monitoring

## Installation & Setup

### Prerequisites
- Node.js 16+ 
- MongoDB
- FFmpeg
- OpenAI API key

### Method 1: Docker (Recommended)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd youtube-educational-analyzer
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env and add your OpenAI API key
   ```

3. **Run with Docker Compose**
   ```bash
   docker-compose up --build
   ```

4. **Access the application**
   - Open http://localhost:5000 in your browser

### Method 2: Manual Installation

1. **Install dependencies**
   ```bash
   # Backend dependencies
   npm install
   
   # Frontend dependencies
   cd client && npm install && cd ..
   ```

2. **Set up MongoDB**
   ```bash
   # Start MongoDB service
   sudo systemctl start mongod
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your settings:
   # - MONGODB_URI=mongodb://localhost:27017/youtube-analyzer
   # - OPENAI_API_KEY=your_openai_api_key_here
   ```

4. **Build and start**
   ```bash
   # Build frontend
   cd client && npm run build && cd ..
   
   # Start the server
   npm start
   ```

## Usage

### 1. Submit YouTube Video
- Enter a YouTube URL in the input field
- Click "Analyze Video" to process

### 2. View Analysis Results
- **Educational Summary Tab**: View the AI-generated educational paragraph with numbered references
- **Visual References Tab**: Browse captured images from the video

### 3. Interactive Features
- Click numbered references in the text to view corresponding images
- Use the image modal to see detailed views
- Navigate between different sections seamlessly

## API Endpoints

### Video Management
- `POST /api/videos/process` - Process a new YouTube video
- `GET /api/videos` - Get all processed videos
- `GET /api/videos/:id` - Get specific video details
- `DELETE /api/videos/:id` - Delete a video

### Analysis
- `POST /api/analysis/generate-paragraph/:videoId` - Generate educational paragraph
- `POST /api/analysis/extract-images/:videoId` - Extract images from video
- `POST /api/analysis/full-analysis/:videoId` - Perform complete analysis
- `GET /api/analysis/image/:videoId/:referenceNumber` - Get specific reference image

## Project Structure

```
youtube-educational-analyzer/
├── client/                     # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── services/          # API services
│   │   └── pages/            # Page components
│   └── package.json
├── models/                    # MongoDB schemas
├── routes/                    # Express routes
├── services/                  # Business logic services
│   ├── youtubeService.js     # YouTube processing
│   ├── imageService.js       # Image extraction
│   └── aiService.js          # AI content generation
├── uploads/                   # File storage
│   ├── videos/               # Temporary video files
│   └── images/               # Extracted images
├── server.js                 # Main server file
├── Dockerfile               # Docker configuration
├── docker-compose.yml       # Docker Compose setup
└── README.md
```

## Configuration

### Environment Variables
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/youtube-analyzer

# AI Service
OPENAI_API_KEY=your_openai_api_key_here
```

### Docker Environment
```env
# For Docker Compose
OPENAI_API_KEY=your_openai_api_key_here
```

## Development

### Running in Development Mode
```bash
# Backend (with nodemon)
npm run dev

# Frontend (separate terminal)
cd client && npm start
```

### Building for Production
```bash
# Build frontend
cd client && npm run build

# Start production server
npm start
```

## Features in Detail

### AI-Powered Content Generation
- Uses OpenAI GPT-3.5-turbo for educational content generation
- Intelligent reference placement in generated text
- Context-aware image descriptions
- Educational tone and structure optimization

### Video Processing Pipeline
1. **URL Validation**: Validates YouTube URL format
2. **Metadata Extraction**: Gets video title, description, duration, thumbnail
3. **Transcript Extraction**: Downloads available subtitles/captions
4. **Content Analysis**: Processes transcript for educational insights
5. **Frame Extraction**: Captures key visual moments
6. **Reference Linking**: Associates text references with images

### Image Processing
- Extracts frames at strategic intervals
- Optimizes images for web display (800px width, 85% quality)
- Generates timestamps for each frame
- Creates web-accessible URLs
- Implements lazy loading and error handling

## Troubleshooting

### Common Issues

1. **FFmpeg not found**
   ```bash
   # Ubuntu/Debian
   sudo apt install ffmpeg
   
   # macOS
   brew install ffmpeg
   ```

2. **YouTube download fails**
   - Update youtube-dl: `pip install --upgrade youtube-dl`
   - Some videos may be restricted or require authentication

3. **OpenAI API errors**
   - Verify API key is correct
   - Check API usage limits
   - Ensure sufficient credits

4. **MongoDB connection issues**
   - Verify MongoDB is running
   - Check connection string format
   - Ensure database permissions

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- OpenAI for GPT API
- FFmpeg for video processing
- YouTube-DL for video downloading
- MongoDB for data storage
- React and Tailwind CSS for the frontend