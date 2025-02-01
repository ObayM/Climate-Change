# Climate Data Visualization Dashboard

An interactive dashboard built with React and Tailwind CSS that visualizes historical climate data (temperature and wind patterns) for cities worldwide, enhanced with AI-powered insights using Google's Gemini AI.

## Features

- Historical climate data visualization (2000-2024)
- Interactive line charts with hover tooltips
- AI-generated environmental insights
- Responsive design for all screen sizes
- Real-time data analysis

## Tech Stack

- React.js
- Next.js
- Tailwind CSS
- Recharts for data visualization
- Google Gemini AI API


## Installation

1. Clone the repository:
```bash
git clone https://github.com/ObayM/Climate-Change
cd Climate-Change
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory and add your Google Gemini AI API key:
```env
GOOGLE_AI_API_KEY=your_api_key_here
```

4. Start the development server:
```bash
npm run dev
```

## API Integration

The dashboard currently uses dummy data for demonstration. To integrate with real climate data:

1. Replace the `generateDummyData` function with your API call
2. Update the data structure to match your API response
3. Adjust the chart configuration if needed

