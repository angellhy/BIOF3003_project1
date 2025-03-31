# HeartLen App

## Project Overview
HeartLen is a web-based application designed to process photoplethysmography (PPG) signals captured via a webcam. It calculates heart rate, heart rate variability (HRV), and signal quality using machine learning models. The processed data can be saved to a MongoDB database for further analysis.

## Features
- Real-time PPG signal processing through webcam
- Heart rate and HRV calculation
- Signal quality assessment
- Historical data tracking
- MongoDB integration for data storage
- Customizable signal processing configurations

## Repository Structure
```
/heartlen-app
├── /app
│    ├── /components           # React components
│    │    ├── CameraFeed.tsx      # Webcam capture and display component
│    │    ├── ChartComponent.tsx   # Real-time PPG signal visualization
│    │    ├── MetricsCard.tsx      # Display for heart rate and HRV metrics
│    │    └── SignalCombinationSelector.tsx  # Signal processing configuration UI
│    │
│    ├── /hooks               # Custom React hooks
│    │    ├── usePPGProcessing.ts   # PPG signal processing logic
│    │    ├── useSignalQuality.ts   # Signal quality assessment
│    │    └── useMongoDB.ts         # Database operations
│    │
│    ├── /api                 # Backend API routes
│    │    ├── handle-record     # Save PPG data endpoints
│    │    │    └── route.ts       # POST handler for saving records
│    │    ├── last-access     # Retrieve historical data
│    │    │    └── route.ts       # GET handler for fetching records
│    │    ├── RecordSchema.ts   # Save PPG data endpoints
│    │
│    └── page.tsx             # Main application page
│
├── /public                   # Public assets
│    └── tfjs_model               # ML models for signal processing
│
├── types.ts                    # TypeScript type definitions
│
├── .env.local               # Environment variables
├── .gitignore              # Git ignore rules
├── next.config.js          # Next.js configuration
├── package.json            # Project dependencies and scripts
├── tsconfig.json          # TypeScript configuration
├── HeartLen User Guide.md          # User guide for the application
└── README.md              # Project documentation
```

## Prerequisites
- Node.js (v18 or higher)
- MongoDB Atlas account (or local MongoDB instance)
- Modern web browser with webcam support
- Stable internet connection

## Installation

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/heartlen-app.git
cd heartlen-app
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
Create a `.env.local` file in the root directory with the following variables:
```plaintext
MONGODB_URI=your_mongodb_connection_string
```

### 4. Start Development Server
```bash
npm run dev
```

### 5. Access the Application
Open your browser and navigate to `http://localhost:3000`

## MongoDB Integration

### Setting up MongoDB
1. Create a MongoDB Atlas cluster or use a local MongoDB instance
2. Create a new database named `heartlen`
3. Create a collection named `records`
4. Copy your MongoDB connection string
5. Paste the connection string in your `.env.local` file

### Data Structure
The application stores the following data in MongoDB:
- Heart rate measurements
- HRV calculations
- PPG signal data
- Timestamp information
- Signal quality metrics

## Deployment

### Production Build
1. Create a production build:
```bash
npm run build
```

2. Start the production server:
```bash
npm start
```

### Deployment Platforms
The app can be deployed to:
- Vercel (recommended)
- Netlify
- AWS
- Google Cloud Platform

## Development Guidelines

### Code Style
- Follow TypeScript best practices
- Use meaningful variable and function names
- Include JSDoc comments for functions
- Follow React hooks guidelines
- Implement proper error handling

### Component Structure
- Keep components small and focused
- Use custom hooks for logic separation
- Implement proper prop typing
- Follow React best practices

### Testing
Run tests using:
```bash
npm test
```

## Contributing
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## Support
For support, please open an issue in the GitHub repository or contact the development team.
