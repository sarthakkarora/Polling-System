 Interactive Learning Platform
A real-time interactive learning system built with React, Redux, Express.js, and Socket.io. Designed for modern educational environments where educators can create engaging polls and students can participate in real-time learning experiences with instant answer feedback.

**Developed by:** [Sarthak Arora](https://github.com/sarthakkarora)

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
- ✅ Real-time poll participation with **instant answer feedback**
- ✅ **Visual feedback showing correct/incorrect answers immediately**
- ✅ Live result visualization with animated charts and accurate percentages
- ✅ Interactive chat with educators and peers
- ✅ Progress tracking and performance analytics
- ✅ Responsive design optimized for all devices
- ✅ Engaging user experience with modern animations and feedback icons

### Technical Features
- ✅ Real-time communication with Socket.io
- ✅ **Instant answer correctness feedback system**
- ✅ **Accurate percentage calculations for poll results**
- ✅ Advanced Redux state management
- ✅ Modern React with hooks and context
- ✅ Styled-components with CSS-in-JS
- ✅ Framer Motion animations
- ✅ Toast notifications system
- ✅ Responsive design with mobile-first approach
- ✅ Comprehensive error handling and validation
- ✅ Dark/Light theme support
- ✅ **Real-time answer validation and feedback emission**

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
   git clone https://github.com/sarthakkarora/Polling-System.git
   cd Live-Polling-System-main
   ```

2. **Install dependencies**
   ```bash
   # Install frontend dependencies
   npm install
   
   # Install server dependencies
   cd server && npm install && cd ..
   ```

3. **Environment Setup**
   
   Create a `.env` file in the server directory:
   ```env
   PORT=5001
   CLIENT_URL=http://localhost:3000
   NODE_ENV=development
   ```

   Create a `.env` file in the root directory:
   ```env
   REACT_APP_SERVER_URL=http://localhost:5001
   REACT_APP_ENVIRONMENT=development
   ```

4. **Start the development servers**
   ```bash
   # Start both frontend and backend
   npm run dev
   
   # Or start them separately:
   # Terminal 1 - Backend
   cd server && npm start
   
   # Terminal 2 - Frontend (in new terminal)
   npm start
   ```

5. **Access the application**
   - Frontend: http://localhost:3000
   - Backend: http://localhost:5001

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
6. **Instantly see if your answer is correct or incorrect with visual feedback**
7. View real-time results with accurate percentages
8. Engage in the interactive chat system

## 🎨 Key Features Implemented

### Answer Feedback System
- **Real-time Correctness Validation**: Students receive immediate feedback on whether their answer is correct or incorrect
- **Visual Feedback Icons**: Green checkmark for correct answers, red X for incorrect answers
- **Server-side Validation**: Answer correctness is calculated on the server and sent to individual students
- **Enhanced User Experience**: Immediate feedback improves learning outcomes

### Accurate Poll Results
- **Fixed Percentage Calculations**: Poll results now show accurate percentages instead of 0%
- **Multiple Answer Format Support**: Handles both array and string answer formats correctly
- **Real-time Updates**: Results update instantly as students submit answers

## 📁 Project Structure

```
Live-Polling-System-main/
├── src/                   # React components (StudentDashboard, TeacherLogin, etc.)
│   ├── components/        # React components
│   ├── store/             # Redux store and slices
│   ├── styles/            # Global styles and themes
│   ├── contexts/          # React contexts (ThemeContext)
│   ├── utils/             # Utility functions
│   └── App.js             # Main app component
├── public/                # Public assets and index.html
├── server/                # Express.js backend
│   ├── index.js           # Main server file with Socket.io and answer validation
│   └── package.json       # Server dependencies
├── package.json           # Frontend dependencies (React app)
├── vercel.json            # Vercel deployment configuration
└── README.md
```

## 🔧 Configuration

### Environment Variables

**Server (.env)**
```env
PORT=5001
CLIENT_URL=http://localhost:3000
NODE_ENV=development
```

**Client (.env)**
```env
REACT_APP_SERVER_URL=http://localhost:5001
REACT_APP_ENVIRONMENT=development
```

### Customization

- **Time Limits**: Modify the time limit range in `PollCreator.js`
- **UI Colors**: Update the theme colors in `GlobalStyles.js`
- **Socket Events**: Add new events in `server/index.js`
- **Animations**: Customize Framer Motion animations
- **Answer Feedback**: Modify feedback styling in `StudentDashboard.js`

## 🤝 Contributing

This project is maintained by [Sarthak Karora](https://github.com/sarthakkarora). Feel free to:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with modern React and Socket.io for real-time communication
- Inspired by the need for interactive educational tools
- Special thanks to the open-source community for the amazing libraries used

## 📞 Contact

**Sarthak Karora** - [GitHub](https://github.com/sarthakkarora)

Project Link: [https://github.com/sarthakkarora/Polling-System](https://github.com/sarthakkarora/Polling-System)
