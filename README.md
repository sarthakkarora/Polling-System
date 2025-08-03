# intervue.io poll - Interactive Learning Platform

A cutting-edge real-time interactive learning system built with React, Redux, Express.js, and Socket.io. Designed for modern educational environments where educators can create engaging polls and students can participate in real-time learning experiences.

## 🌊 Features

### Educator Features
- ✅ Create dynamic polls with multiple question types
- ✅ Set customizable time limits (15-600 seconds)
- ✅ View live polling results with advanced visualizations
- ✅ Real-time student engagement monitoring
- ✅ Interactive chat system with students
- ✅ Student management and session control
- ✅ Comprehensive analytics dashboard
- ✅ Modern, responsive UI with ocean-themed design

### Student Features
- ✅ Seamless entry with unique identifier system
- ✅ Real-time poll participation with instant feedback
- ✅ Live result visualization with animated charts
- ✅ Interactive chat with educators and peers
- ✅ Progress tracking and performance analytics
- ✅ Responsive design optimized for all devices
- ✅ Engaging user experience with modern animations

### Technical Features
- ✅ Real-time communication with Socket.io
- ✅ Advanced Redux state management
- ✅ Modern React with hooks and context
- ✅ Styled-components with CSS-in-JS
- ✅ Framer Motion animations
- ✅ Toast notifications system
- ✅ Responsive design with mobile-first approach
- ✅ Comprehensive error handling and validation
- ✅ Dark/Light theme support

## 🛠️ Technology Stack

### Frontend
- **React 18** - Modern React with hooks and context
- **Redux Toolkit** - Advanced state management
- **Socket.io Client** - Real-time communication
- **Styled Components** - CSS-in-JS styling
- **Framer Motion** - Smooth animations
- **React Router** - Navigation system
- **React Icons** - Icon library
- **React Hot Toast** - Notification system

### Backend
- **Express.js** - Web framework
- **Socket.io** - Real-time communication
- **CORS** - Cross-origin resource sharing
- **UUID** - Unique identifier generation

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd intervue-io-poll-platform
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install
   
   # Install server dependencies
   cd server && npm install
   
   # Install client dependencies
   cd ../client && npm install
   
   # Return to root
   cd ..
   ```

3. **Environment Setup**
   
   Create a `.env` file in the server directory:
   ```env
   PORT=5000
   CLIENT_URL=http://localhost:3000
   NODE_ENV=development
   ```

   Create a `.env` file in the client directory:
   ```env
   REACT_APP_SERVER_URL=http://localhost:5000
   REACT_APP_ENVIRONMENT=development
   ```

4. **Start the development servers**
   ```bash
   # Start both frontend and backend
   npm run dev
   
   # Or start them separately:
   # Terminal 1 - Backend
   npm run server
   
   # Terminal 2 - Frontend
   npm run client
   ```

5. **Access the application**
   - Frontend: http://localhost:3000
   - Backend: http://localhost:5000

## 🎯 Usage

### For Educators
1. Open the application in your browser
2. Select "Educator Dashboard"
3. You'll be taken to the Teacher Dashboard
4. Click "Create New Poll" to create an interactive poll
5. Fill in the question details, options, and time limit
6. Click "Launch Poll" to start the interactive session
7. Monitor real-time results and student engagement
8. Use the chat feature to communicate with students

### For Students
1. Open the application in your browser
2. Select "Student Portal"
3. Enter your unique identifier when prompted
4. Wait for the educator to create a poll
5. Select your answer and click "Submit"
6. View real-time results and analytics
7. Engage in the interactive chat system

   ```

## 📁 Project Structure

```
intervue-io-poll-platform/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── store/         # Redux store and slices
│   │   ├── styles/        # Global styles and themes
│   │   ├── contexts/      # React contexts
│   │   ├── utils/         # Utility functions
│   │   └── App.js         # Main app component
│   └── package.json
├── server/                 # Express.js backend
│   ├── index.js           # Main server file
│   └── package.json
├── package.json            # Root package.json
└── README.md
```

## 🔧 Configuration

### Environment Variables

**Server (.env)**
```env
PORT=5000
CLIENT_URL=http://localhost:3000
NODE_ENV=development
```

**Client (.env)**
```env
REACT_APP_SERVER_URL=http://localhost:5000
REACT_APP_ENVIRONMENT=development
```

### Customization

- **Time Limits**: Modify the time limit range in `PollCreator.js`
- **UI Colors**: Update the ocean theme colors in `GlobalStyles.js`
- **Socket Events**: Add new events in `server/index.js`
- **Animations**: Customize Framer Motion animations
