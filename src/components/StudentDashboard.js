import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaGraduationCap, 
  FaUsers, 
  FaClock, 
  FaCheckCircle, 
  FaTimesCircle,
  FaWater,
  FaBrain,
  FaRocket,
  FaSignOutAlt,
  FaChartLine,
  FaComments,
  FaHistory
} from 'react-icons/fa';
import { io } from 'socket.io-client';
import { setSocket } from '../store/slices/socketSlice';
import { 
  setCurrentPoll, 
  setPollResults, 
  setTimeLeft, 
  setPollError, 
  clearPollError,
  setUserList,
  setChatMessages,
  addChatMessage
} from '../store/slices/pollSlice';
import toast from 'react-hot-toast';

const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, var(--dark-bg) 0%, #0f3460 50%, #16213e 100%);
  padding: 2rem;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="50" cy="50" r="1" fill="%23ffffff" opacity="0.02"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
    pointer-events: none;
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  position: relative;
  z-index: 1;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 800;
  background: linear-gradient(135deg, var(--primary-teal) 0%, var(--primary-cyan) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  color: var(--light-text-primary);
`;

const UserAvatar = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary-teal) 0%, var(--primary-cyan) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 1.2rem;
`;

const LogoutButton = styled(motion.button)`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: var(--light-text-primary);
  padding: 0.75rem 1.5rem;
  border-radius: var(--radius-md);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
    border-color: var(--primary-teal);
  }
`;

const MainContent = styled.div`
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 2rem;
  position: relative;
  z-index: 1;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const PollSection = styled.div`
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-xl);
  padding: 2rem;
  box-shadow: var(--shadow-lg);
`;

const Sidebar = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const SidebarCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  box-shadow: var(--shadow-md);
`;

const CardTitle = styled.h3`
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--light-text-primary);
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
`;

const StatItem = styled.div`
  text-align: center;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: var(--radius-md);
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const StatValue = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--primary-teal);
  margin-bottom: 0.25rem;
`;

const StatLabel = styled.div`
  font-size: 0.875rem;
  color: var(--light-text-secondary);
`;

const PollCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-lg);
  padding: 2rem;
  margin-bottom: 1.5rem;
  box-shadow: var(--shadow-md);
`;

const PollQuestion = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--light-text-primary);
  margin-bottom: 1.5rem;
  line-height: 1.4;
`;

const Timer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--accent-orange);
  font-weight: 600;
  margin-bottom: 1rem;
`;

const OptionsGrid = styled.div`
  display: grid;
  gap: 1rem;
  margin-bottom: 2rem;
`;

const OptionButton = styled(motion.button)`
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-md);
  padding: 1rem 1.5rem;
  color: var(--light-text-primary);
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: left;
  
  &:hover {
    border-color: var(--primary-teal);
    background: rgba(0, 180, 216, 0.1);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const SubmitButton = styled(motion.button)`
  background: linear-gradient(135deg, var(--primary-teal) 0%, var(--primary-cyan) 100%);
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: var(--radius-md);
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const ResultsSection = styled.div`
  margin-top: 2rem;
`;

const ResultsTitle = styled.h3`
  font-size: 1.3rem;
  font-weight: 600;
  color: var(--light-text-primary);
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ResultsGrid = styled.div`
  display: grid;
  gap: 1rem;
`;

const ResultItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: var(--radius-md);
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const ResultOption = styled.div`
  color: var(--light-text-primary);
  font-weight: 500;
`;

const ResultPercentage = styled.div`
  color: var(--primary-teal);
  font-weight: 600;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
  margin-top: 0.5rem;
`;

const ProgressFill = styled(motion.div)`
  height: 100%;
  background: linear-gradient(90deg, var(--primary-teal) 0%, var(--primary-cyan) 100%);
  border-radius: 4px;
`;

const FeedbackSection = styled(motion.div)`
  background: ${props => props.isCorrect 
    ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(21, 128, 61, 0.1) 100%)'
    : 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(185, 28, 28, 0.1) 100%)'
  };
  border: 2px solid ${props => props.isCorrect ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'};
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  margin: 1rem 0;
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const FeedbackIcon = styled.div`
  font-size: 2rem;
  color: ${props => props.isCorrect ? 'var(--accent-green)' : 'var(--accent-red)'};
`;

const FeedbackContent = styled.div`
  flex: 1;
`;

const FeedbackMessage = styled.h3`
  color: ${props => props.isCorrect ? 'var(--accent-green)' : 'var(--accent-red)'};
  margin: 0 0 0.5rem 0;
  font-size: 1.2rem;
  font-weight: 600;
`;

const FeedbackDetails = styled.div`
  color: var(--light-text-secondary);
  font-size: 0.9rem;
  
  .answer-info {
    margin-top: 0.5rem;
  }
  
  .your-answer {
    color: var(--light-text-primary);
    font-weight: 500;
  }
  
  .correct-answer {
    color: var(--accent-green);
    font-weight: 500;
  }
`;

const ChatSection = styled.div`
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  height: 400px;
  display: flex;
  flex-direction: column;
`;

const ChatMessages = styled.div`
  flex: 1;
  overflow-y: auto;
  margin-bottom: 1rem;
  padding-right: 0.5rem;
`;

const ChatMessage = styled.div`
  margin-bottom: 0.75rem;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: var(--radius-md);
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const MessageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
`;

const MessageSender = styled.span`
  font-weight: 600;
  color: var(--primary-teal);
  font-size: 0.9rem;
`;

const MessageTime = styled.span`
  color: var(--light-text-muted);
  font-size: 0.8rem;
`;

const MessageText = styled.div`
  color: var(--light-text-primary);
  line-height: 1.4;
`;

const ChatInput = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const ChatInputField = styled.input`
  flex: 1;
  padding: 0.75rem;
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-md);
  background: rgba(255, 255, 255, 0.05);
  color: var(--light-text-primary);
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: var(--primary-teal);
  }
  
  &::placeholder {
    color: var(--light-text-muted);
  }
`;

const SendButton = styled.button`
  background: linear-gradient(135deg, var(--primary-teal) 0%, var(--primary-cyan) 100%);
  color: white;
  border: none;
  padding: 0.75rem 1rem;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: var(--shadow-md);
  }
`;

const NoPollMessage = styled.div`
  text-align: center;
  padding: 3rem;
  color: var(--light-text-secondary);
`;

const FloatingElements = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
`;

const FloatingElement = styled(motion.div)`
  position: absolute;
  width: 4px;
  height: 4px;
  background: var(--primary-teal);
  border-radius: 50%;
  opacity: 0.6;
`;

const StudentDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const socket = useSelector(state => state.socket.socket);
  const currentPoll = useSelector(state => state.poll.currentPoll);
  const pollResults = useSelector(state => state.poll.results);
  const timeLeft = useSelector(state => state.poll.timeLeft);
  const pollError = useSelector(state => state.poll.pollError);
  const userList = useSelector(state => state.poll.userList);
  const chatMessages = useSelector(state => state.poll.chatMessages);
  const userName = useSelector(state => state.auth.userName);
  const userType = useSelector(state => state.auth.userType);

  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [answerFeedback, setAnswerFeedback] = useState(null);
  const [chatInput, setChatInput] = useState('');

  useEffect(() => {
    if (!userName || userType !== 'student') {
      navigate('/');
      return;
    }

    // Initialize socket connection
    console.log('Connecting to socket server as student...');
    const newSocket = io(process.env.REACT_APP_SERVER_URL || 'http://localhost:5001', {
      transports: ['websocket', 'polling'],
      timeout: 10000,
    });
    
    newSocket.on('connect', () => {
      console.log('Connected to server as student');
      dispatch(setSocket(newSocket));
      
      // Join room as student
      newSocket.emit('join-room', {
        userType: 'student',
        userName: userName
      });
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      toast.error('Failed to connect to server. Please refresh the page.');
    });

    newSocket.on('poll-created', (poll) => {
      console.log('New poll created:', poll);
      dispatch(setCurrentPoll(poll));
      setSelectedAnswer(null);
      setHasAnswered(false);
      setAnswerFeedback(null);
      toast.success('New poll available!');
    });

    newSocket.on('poll-update', (data) => {
      console.log('Poll update received:', data);
      dispatch(setCurrentPoll(data.poll));
      dispatch(setPollResults(data.results));
      dispatch(setTimeLeft(data.timeLeft));
    });

    newSocket.on('poll-results', (data) => {
      console.log('Poll results received:', data);
      dispatch(setPollResults(data.results));
      dispatch(setTimeLeft(data.timeLeft));
    });

    newSocket.on('answer-feedback', (feedback) => {
      console.log('Answer feedback received:', feedback);
      setAnswerFeedback(feedback);
      toast[feedback.isCorrect ? 'success' : 'error'](feedback.message);
    });

    newSocket.on('timer-update', (data) => {
      dispatch(setTimeLeft(data.timeLeft));
    });

    newSocket.on('poll-ended', (data) => {
      console.log('Poll ended:', data);
      dispatch(setPollResults(data.results));
      toast.success('Poll completed! Check the results.');
    });

    newSocket.on('poll-reset', () => {
      console.log('Poll reset');
      dispatch(setCurrentPoll(null));
      dispatch(setPollResults(null));
      setSelectedAnswer(null);
      setHasAnswered(false);
      setAnswerFeedback(null);
    });

    newSocket.on('user-list-updated', (data) => {
      dispatch(setUserList(data.users));
    });

    newSocket.on('new-message', (message) => {
      dispatch(addChatMessage(message));
    });

    newSocket.on('chat-history', (messages) => {
      dispatch(setChatMessages(messages));
    });

    newSocket.on('kicked-out', (data) => {
      toast.error(data.message);
      navigate('/');
    });

    return () => {
      if (newSocket) {
      newSocket.disconnect();
      }
    };
  }, [dispatch, navigate, userName, userType]);

  const handleAnswerSubmit = () => {
    if (!selectedAnswer || !socket) return;

    socket.emit('submit-answer', selectedAnswer);
    setHasAnswered(true);
    toast.success('Answer submitted successfully!');
  };

  const handleChatSubmit = (e) => {
    e.preventDefault();
    if (!chatInput.trim() || !socket) return;

    socket.emit('send-message', { text: chatInput.trim() });
    setChatInput('');
  };

  const handleLogout = () => {
    if (socket) {
      socket.disconnect();
    }
    navigate('/');
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Generate floating elements
  const floatingElements = Array.from({ length: 15 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    delay: Math.random() * 2,
    duration: 3 + Math.random() * 2
  }));

  return (
    <Container>
      <FloatingElements>
        {floatingElements.map((element) => (
          <FloatingElement
            key={element.id}
            style={{
              left: `${element.x}%`,
              top: `${element.y}%`
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.6, 1, 0.6]
            }}
            transition={{
              duration: element.duration,
              delay: element.delay,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        ))}
      </FloatingElements>

      <Header>
        <Title>Student Portal</Title>
        <UserInfo>
          <UserAvatar>
            {userName ? userName.charAt(0).toUpperCase() : 'S'}
          </UserAvatar>
          <div>
            <div style={{ fontWeight: 600 }}>{userName}</div>
            <div style={{ fontSize: '0.9rem', color: 'var(--light-text-secondary)' }}>
              Student
            </div>
          </div>
          <LogoutButton onClick={handleLogout} whileHover={{ scale: 1.05 }}>
            <FaSignOutAlt />
            Logout
          </LogoutButton>
        </UserInfo>
      </Header>

      <MainContent>
        <PollSection>
          {currentPoll ? (
            <PollCard
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <PollQuestion>{currentPoll.question}</PollQuestion>
              
              {timeLeft > 0 && (
                <Timer>
                  <FaClock />
                  Time remaining: {formatTime(timeLeft)}
                </Timer>
              )}

              {!hasAnswered && currentPoll.isActive && (
                <>
                  <OptionsGrid>
                    {currentPoll.options.map((option, index) => (
                      <OptionButton
                        key={index}
                        onClick={() => setSelectedAnswer(option)}
                        selected={selectedAnswer === option}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        style={{
                          borderColor: selectedAnswer === option ? 'var(--primary-teal)' : 'rgba(255, 255, 255, 0.1)',
                          background: selectedAnswer === option ? 'rgba(0, 180, 216, 0.1)' : 'rgba(255, 255, 255, 0.05)'
                        }}
                      >
                        {option}
                      </OptionButton>
                    ))}
                  </OptionsGrid>

                  <SubmitButton
                    onClick={handleAnswerSubmit}
                    disabled={!selectedAnswer}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <FaCheckCircle />
                    Submit Answer
                  </SubmitButton>
                </>
              )}

              {hasAnswered && answerFeedback && (
                <FeedbackSection
                  isCorrect={answerFeedback.isCorrect}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <FeedbackIcon isCorrect={answerFeedback.isCorrect}>
                    {answerFeedback.isCorrect ? <FaCheckCircle /> : <FaTimesCircle />}
                  </FeedbackIcon>
                  <FeedbackContent>
                    <FeedbackMessage isCorrect={answerFeedback.isCorrect}>
                      {answerFeedback.message}
                    </FeedbackMessage>
                    <FeedbackDetails>
                      <div className="answer-info">
                        <div>Your answer: <span className="your-answer">{answerFeedback.selectedAnswer}</span></div>
                        {!answerFeedback.isCorrect && (
                          <div>Correct answer: <span className="correct-answer">{answerFeedback.correctAnswer}</span></div>
                        )}
                      </div>
                    </FeedbackDetails>
                  </FeedbackContent>
                </FeedbackSection>
              )}

              {hasAnswered && pollResults && (
                <ResultsSection>
                  <ResultsTitle>
                    <FaChartLine />
                    Poll Results
                  </ResultsTitle>
                  <ResultsGrid>
                    {Object.entries(pollResults.percentages || {}).map(([option, percentage]) => (
                      <ResultItem key={option}>
                        <ResultOption>{option}</ResultOption>
                        <div style={{ flex: 1, margin: '0 1rem' }}>
                          <ProgressBar>
                            <ProgressFill
                              initial={{ width: 0 }}
                              animate={{ width: `${percentage}%` }}
                              transition={{ duration: 1 }}
                            />
                          </ProgressBar>
                        </div>
                        <ResultPercentage>{percentage}%</ResultPercentage>
                      </ResultItem>
                    ))}
                  </ResultsGrid>
                </ResultsSection>
              )}
            </PollCard>
          ) : (
            <NoPollMessage>
              <FaBrain size={60} color="var(--light-text-secondary)" />
              <h3>Waiting for Poll</h3>
              <p>Your teacher will create a poll soon. Stay tuned!</p>
            </NoPollMessage>
          )}
        </PollSection>

        <Sidebar>
          <SidebarCard>
            <CardTitle>
              <FaUsers />
              Session Stats
            </CardTitle>
            <StatsGrid>
              <StatItem>
                <StatValue>{userList.length}</StatValue>
                <StatLabel>Connected</StatLabel>
              </StatItem>
              <StatItem>
                <StatValue>{pollResults?.totalAnswers || 0}</StatValue>
                <StatLabel>Responses</StatLabel>
              </StatItem>
            </StatsGrid>
          </SidebarCard>

          <ChatSection>
            <CardTitle>
        <FaComments />
              Live Chat
            </CardTitle>
            <ChatMessages>
              {chatMessages.map((message) => (
                <ChatMessage key={message.id}>
                  <MessageHeader>
                    <MessageSender>{message.sender}</MessageSender>
                    <MessageTime>
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </MessageTime>
                  </MessageHeader>
                  <MessageText>{message.message}</MessageText>
                </ChatMessage>
              ))}
            </ChatMessages>
            <form onSubmit={handleChatSubmit}>
              <ChatInput>
                <ChatInputField
                  type="text"
                  placeholder="Type your message..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                />
                <SendButton type="submit">
                  <FaRocket />
                </SendButton>
              </ChatInput>
            </form>
          </ChatSection>
        </Sidebar>
      </MainContent>
    </Container>
  );
};

export default StudentDashboard; 