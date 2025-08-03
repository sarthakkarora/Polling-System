import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { 
  FaTimes, 
  FaPaperPlane, 
  FaComments, 
  FaUsers, 
  FaUserGraduate, 
  FaChalkboardTeacher,
  FaBan
} from 'react-icons/fa';
import { setChatOpen } from '../store/slices/chatSlice';
import { removeUser } from '../store/slices/pollSlice';
import toast from 'react-hot-toast';

const ChatOverlay = styled(motion.div).withConfig({
  shouldForwardProp: (prop) => !['initial', 'animate', 'exit', 'transition', 'whileHover', 'whileTap', 'variants'].includes(prop)
})`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ChatContainer = styled(motion.div).withConfig({
  shouldForwardProp: (prop) => !['initial', 'animate', 'exit', 'transition', 'whileHover', 'whileTap', 'variants'].includes(prop)
})`
  background: var(--surface);
  width: 500px;
  max-width: 90vw;
  height: 600px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid var(--border);
`;

const ChatHeader = styled.div`
  background: linear-gradient(135deg, var(--primary-purple) 0%, var(--primary-indigo) 100%);
  color: white;
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const HeaderTitle = styled.h3`
  font-size: 1.2rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: white;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  transition: background 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
`;

const TabContainer = styled.div`
  display: flex;
  background: var(--surface);
  border-bottom: 1px solid var(--border);
`;

const Tab = styled.button.withConfig({
  shouldForwardProp: (prop) => prop !== 'active'
})`
  flex: 1;
  padding: 1rem;
  background: ${props => props.active ? 'var(--background)' : 'transparent'};
  border: none;
  cursor: pointer;
  font-weight: 600;
  color: ${props => props.active ? 'var(--primary-purple)' : 'var(--text-secondary)'};
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  
  &:hover {
    background: ${props => props.active ? 'var(--background)' : 'var(--border)'};
  }
`;

const ChatContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const MessagesContainer = styled.div`
  flex: 1;
  padding: 1rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const MessageBubble = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'isOwn'
})`
  max-width: 80%;
  padding: 0.75rem 1rem;
  border-radius: 18px;
  word-wrap: break-word;
  align-self: ${props => props.isOwn ? 'flex-end' : 'flex-start'};
  background: ${props => props.isOwn ? 'var(--primary-purple)' : 'var(--surface)'};
  color: ${props => props.isOwn ? 'white' : 'var(--text-primary)'};
  position: relative;
`;

const MessageSender = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'isOwn'
})`
  font-size: 0.8rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
  color: ${props => props.isOwn ? 'rgba(255, 255, 255, 0.8)' : 'var(--text-muted)'};
`;

const MessageText = styled.div`
  font-size: 0.9rem;
  line-height: 1.4;
`;

const MessageTime = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'isOwn'
})`
  font-size: 0.7rem;
  margin-top: 0.25rem;
  opacity: 0.7;
  text-align: ${props => props.isOwn ? 'right' : 'left'};
`;

const InputContainer = styled.div`
  padding: 1rem;
  border-top: 1px solid var(--border);
  display: flex;
  gap: 0.75rem;
  align-items: center;
`;

const MessageInput = styled.input`
  flex: 1;
  padding: 0.75rem 1rem;
  border: 2px solid var(--border);
  border-radius: 25px;
  font-size: 0.9rem;
  outline: none;
  transition: border-color 0.3s ease;
  min-width: 0;
  background: var(--background);
  color: var(--text-primary);
  
  &:focus {
    border-color: var(--primary-purple);
  }
`;

const SendButton = styled.button`
  background: linear-gradient(135deg, var(--primary-purple) 0%, var(--secondary-purple) 100%);
  color: white;
  border: none;
  padding: 0.75rem 1rem;
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  white-space: nowrap;
  flex-shrink: 0;
  
  &:hover {
    transform: translateY(-1px);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const ParticipantsContainer = styled.div`
  flex: 1;
  padding: 1rem;
  overflow-y: auto;
`;

const ParticipantItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  border-radius: 8px;
  margin-bottom: 0.5rem;
  background: var(--surface);
  transition: background 0.3s ease;
  
  &:hover {
    background: var(--border);
  }
`;

const ParticipantInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const ParticipantIcon = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'userType'
})`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${props => props.userType === 'teacher' ? 'var(--primary-purple)' : 'var(--success)'};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
`;

const ParticipantDetails = styled.div`
  display: flex;
  flex-direction: column;
`;

const ParticipantName = styled.div`
  font-weight: 600;
  color: var(--text-primary);
  font-size: 0.9rem;
`;

const ParticipantType = styled.div`
  font-size: 0.7rem;
  color: var(--text-muted);
  text-transform: capitalize;
`;

const KickButton = styled.button`
  background: var(--error);
  color: white;
  border: none;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  
  &:hover {
    background: var(--error);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 2rem;
  color: var(--text-muted);
`;

const Chat = ({ socket }) => {
  const dispatch = useDispatch();
  const { messages, participants } = useSelector((state) => state.chat);
  const { userType } = useSelector((state) => state.auth);
  
  const [activeTab, setActiveTab] = useState('chat');
  const [messageText, setMessageText] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleClose = () => {
    dispatch(setChatOpen(false));
  };

  const handleSendMessage = () => {
    if (!messageText.trim() || !socket) return;

    socket.emit('send-message', { text: messageText.trim() });
    setMessageText('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleKickStudent = (studentId, studentName) => {
    if (!socket || userType !== 'teacher') return;

    console.log(`Attempting to kick student: ${studentName} (ID: ${studentId})`);
    socket.emit('remove-student', studentId);
    dispatch(removeUser({ id: studentId }));
    toast.success(`Removed ${studentName} from the session`);
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const isOwnMessage = (message) => {
    return message.senderId === socket?.id;
  };

  return (
    <ChatOverlay
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={handleClose}
    >
      <ChatContainer
        initial={{ x: 400, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 400, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        onClick={(e) => e.stopPropagation()}
      >
        <ChatHeader>
          <HeaderTitle>
            {activeTab === 'chat' ? (
              <>
                <FaComments />
                Chat
              </>
            ) : (
              <>
                <FaUsers />
                Participants
              </>
            )}
          </HeaderTitle>
          <CloseButton onClick={handleClose}>
            <FaTimes />
          </CloseButton>
        </ChatHeader>

        <TabContainer>
          <Tab
            active={activeTab === 'chat'}
            onClick={() => setActiveTab('chat')}
          >
            <FaComments />
            Chat
          </Tab>
          <Tab
            active={activeTab === 'participants'}
            onClick={() => setActiveTab('participants')}
          >
            <FaUsers />
            Participants
          </Tab>
        </TabContainer>

        <ChatContent>
          {activeTab === 'chat' ? (
            <>
              <MessagesContainer>
                {messages.length === 0 ? (
                  <EmptyState>
                    <FaComments style={{ fontSize: '2rem', marginBottom: '1rem', opacity: 0.5 }} />
                    <p>No messages yet. Start the conversation!</p>
                  </EmptyState>
                ) : (
                  messages.map((message) => (
                    <MessageBubble
                      key={message.id}
                      isOwn={isOwnMessage(message)}
                    >
                      <MessageSender isOwn={isOwnMessage(message)}>
                        {message.sender} ({message.senderType})
                      </MessageSender>
                      <MessageText>{message.message}</MessageText>
                      <MessageTime isOwn={isOwnMessage(message)}>
                        {formatTime(message.timestamp)}
                      </MessageTime>
                    </MessageBubble>
                  ))
                )}
                <div ref={messagesEndRef} />
              </MessagesContainer>

              <InputContainer>
                <MessageInput
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                />
                <SendButton
                  onClick={handleSendMessage}
                  disabled={!messageText.trim()}
                >
                  <FaPaperPlane />
                  Send
                </SendButton>
              </InputContainer>
            </>
          ) : (
            <ParticipantsContainer>
              {participants.length === 0 ? (
                <EmptyState>
                  <FaUsers style={{ fontSize: '2rem', marginBottom: '1rem', opacity: 0.5 }} />
                  <p>No participants connected</p>
                </EmptyState>
              ) : (
                participants.map((participant) => (
                  <ParticipantItem key={participant.id}>
                    <ParticipantInfo>
                      <ParticipantIcon userType={participant.userType}>
                        {participant.userType === 'teacher' ? <FaChalkboardTeacher /> : <FaUserGraduate />}
                      </ParticipantIcon>
                      <ParticipantDetails>
                        <ParticipantName>{participant.name}</ParticipantName>
                        <ParticipantType>{participant.userType}</ParticipantType>
                      </ParticipantDetails>
                    </ParticipantInfo>
                    
                    {userType === 'teacher' && participant.userType === 'student' && (
                      <KickButton
                        onClick={() => handleKickStudent(participant.id, participant.name)}
                        title={`Remove ${participant.name}`}
                      >
                        <FaBan />
                        Kick out
                      </KickButton>
                    )}
                  </ParticipantItem>
                ))
              )}
            </ParticipantsContainer>
          )}
        </ChatContent>
      </ChatContainer>
    </ChatOverlay>
  );
};

export default Chat; 