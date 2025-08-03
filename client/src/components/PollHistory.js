import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FaTimes, FaHistory } from 'react-icons/fa';
import toast from 'react-hot-toast';
import io from 'socket.io-client';

const Overlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 2rem;
`;

const Modal = styled(motion.div)`
  background: var(--surface);
  border-radius: 20px;
  padding: 2rem;
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
  border: 1px solid var(--border);
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid var(--border);
`;

const Title = styled.h2`
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  color: var(--text-muted);
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  transition: all 0.3s ease;
  
  &:hover {
    background: var(--surface);
    color: var(--text-primary);
  }
`;

const PollContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const QuestionHeader = styled.div`
  background: var(--primary-purple);
  color: white;
  padding: 1rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1.1rem;
`;

const OptionsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const OptionItem = styled.div`
  background: var(--surface);
  border-radius: 8px;
  padding: 1rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  position: relative;
  overflow: hidden;
  border: 1px solid var(--border);
  transition: all 0.3s ease;
  
  &:hover {
    border-color: var(--primary-purple);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
`;

const OptionNumber = styled.div`
  width: 24px;
  height: 24px;
  background: var(--primary-purple);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: 600;
  flex-shrink: 0;
`;

const OptionText = styled.span`
  font-weight: 500;
  color: var(--dark-gray);
  z-index: 2;
  position: relative;
`;

const ProgressBar = styled.div`
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  background: linear-gradient(135deg, var(--primary-purple) 0%, var(--primary-indigo) 100%);
  opacity: ${props => Math.max(0.15, Math.min(0.9, props.percentage / 100 * 0.75 + 0.15))};
  transition: all 0.3s ease;
  width: ${props => props.percentage}%;
  border-radius: 8px;
  
  &::after {
    content: '';
    position: absolute;
    right: 0;
    top: 0;
    height: 100%;
    width: 2px;
    background: var(--primary-purple);
    opacity: 0.8;
  }
`;

const Percentage = styled.span`
  font-weight: 600;
  color: ${props => props.percentage > 0 ? 'var(--primary-purple)' : 'var(--dark-gray)'};
  margin-left: auto;
  z-index: 2;
  position: relative;
  font-size: ${props => props.percentage > 0 ? '1.1rem' : '1rem'};
  transition: all 0.3s ease;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  color: var(--medium-gray);
`;

const EmptyIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
`;

const EmptyText = styled.p`
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
`;

const EmptySubtext = styled.p`
  font-size: 0.9rem;
  opacity: 0.7;
`;

// Helper function to calculate percentages from results
const calculatePercentages = (results, options) => {
  if (!results || !results.counts) return options.map(option => ({ text: option, percentage: 0 }));
  
  const total = results.totalAnswers || 0;
  return options.map(option => ({
    text: option,
    percentage: total > 0 ? Math.round((results.counts[option] || 0) / total * 100) : 0
  }));
};

// Helper function to render different poll types
const renderPollResults = (poll) => {
  const { results, pollType, ratingScale } = poll;
  
  if (!results) return null;
  
  switch (pollType) {
    case 'multiple-choice':
    case 'single-choice':
    case 'yes-no':
      const optionsWithPercentages = calculatePercentages(results, poll.options);
      return (
        <OptionsContainer>
          {optionsWithPercentages.map((option, optionIndex) => (
            <OptionItem key={optionIndex}>
              <ProgressBar percentage={option.percentage} />
              <OptionNumber>{optionIndex + 1}</OptionNumber>
              <OptionText>{option.text}</OptionText>
              <Percentage percentage={option.percentage}>{option.percentage}%</Percentage>
            </OptionItem>
          ))}
        </OptionsContainer>
      );

    case 'rating':
      const maxRating = ratingScale || 5;
      const ratingOptions = Array.from({ length: maxRating }, (_, i) => i + 1);
      const averageRating = results.averageRating || 0;
      
      return (
        <div>
          <div style={{ 
            textAlign: 'center', 
            marginBottom: '2rem',
            padding: '1rem',
            background: 'linear-gradient(135deg, var(--primary-purple) 0%, var(--secondary-purple) 100%)',
            borderRadius: '10px',
            color: 'white'
          }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              Average Rating: {averageRating.toFixed(1)} / {maxRating}
            </div>
            <div style={{ fontSize: '1rem', opacity: 0.9 }}>
              Based on {results.totalAnswers || 0} responses
            </div>
          </div>
          <OptionsContainer>
            {ratingOptions.map((rating) => {
              const percentage = results.percentages ? results.percentages[rating] || 0 : 0;
              const count = results.counts ? results.counts[rating] || 0 : 0;
              
              return (
                <OptionItem key={rating}>
                  <ProgressBar percentage={percentage} />
                  <OptionNumber>{rating}</OptionNumber>
                  <OptionText>{rating} Star{rating > 1 ? 's' : ''}</OptionText>
                  <Percentage percentage={percentage}>
                    {percentage}% ({count} votes)
                  </Percentage>
                </OptionItem>
              );
            })}
          </OptionsContainer>
        </div>
      );

    case 'text':
      const responses = results.responses || [];
      return (
        <div>
          <div style={{ 
            textAlign: 'center', 
            marginBottom: '2rem',
            padding: '1rem',
            background: 'linear-gradient(135deg, var(--primary-purple) 0%, var(--secondary-purple) 100%)',
            borderRadius: '10px',
            color: 'white'
          }}>
            <div style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '0.5rem' }}>
              Text Responses ({results.totalAnswers || 0} total)
            </div>
          </div>
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {responses.length > 0 ? (
              responses.map((response, index) => (
                <div key={index} style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  padding: '1rem',
                  marginBottom: '1rem',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                  <div style={{ 
                    fontSize: '0.9rem', 
                    color: 'var(--text-muted)', 
                    marginBottom: '0.5rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <span>{response.studentName}</span>
                    <span>{new Date(response.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <div style={{ 
                    fontSize: '1rem', 
                    lineHeight: '1.5',
                    color: 'var(--text-primary)'
                  }}>
                    {response.text}
                  </div>
                </div>
              ))
            ) : (
              <div style={{ 
                textAlign: 'center', 
                padding: '2rem',
                color: 'var(--text-muted)',
                fontStyle: 'italic'
              }}>
                No text responses received
              </div>
            )}
          </div>
        </div>
      );

    default:
      return (
        <div style={{ 
          textAlign: 'center', 
          padding: '2rem',
          color: 'var(--medium-gray)',
          fontStyle: 'italic'
        }}>
          Unsupported poll type: {pollType}
        </div>
      );
  }
};

const PollHistory = ({ onClose }) => {
  const [pollHistory, setPollHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPollHistory = async () => {
      try {
        setLoading(true);
        const serverUrl = process.env.REACT_APP_SERVER_URL || 'http://localhost:5001';
    const response = await fetch(`${serverUrl}/api/poll-history`);
        if (response.ok) {
          const data = await response.json();
          setPollHistory(data);
        } else {
          toast.error('Failed to load poll history');
        }
      } catch (error) {
        console.error('Error fetching poll history:', error);
        toast.error('Failed to load poll history');
      } finally {
        setLoading(false);
      }
    };

    fetchPollHistory();

    // Listen for real-time poll history updates
    const socket = io(process.env.REACT_APP_SERVER_URL || 'http://localhost:5001');
    
    socket.on('poll-history-updated', (updatedHistory) => {
      console.log('Poll history updated in real-time:', updatedHistory);
      setPollHistory(updatedHistory);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <Overlay
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <Modal
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <Header>
          <Title>
            <FaHistory />
            View Poll History
          </Title>
          <CloseButton onClick={onClose}>
            <FaTimes />
          </CloseButton>
        </Header>

        <PollContainer>
          {loading ? (
            <EmptyState>
              <EmptyIcon>
                <FaHistory />
              </EmptyIcon>
              <EmptyText>Loading poll history...</EmptyText>
            </EmptyState>
          ) : pollHistory.length === 0 ? (
            <EmptyState>
              <EmptyIcon>
                <FaHistory />
              </EmptyIcon>
              <EmptyText>No poll history available</EmptyText>
              <EmptySubtext>Create some polls to see their results here</EmptySubtext>
            </EmptyState>
          ) : (
            pollHistory.map((poll, pollIndex) => (
                              <div key={poll.id} style={{ marginBottom: '2rem' }}>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    marginBottom: '1rem'
                  }}>
                    <QuestionHeader>
                      {poll.question}
                    </QuestionHeader>
                    <div style={{
                      background: 'var(--primary-purple)',
                      color: 'white',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '20px',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      textTransform: 'uppercase'
                    }}>
                      {poll.pollType === 'multiple-choice' && 'Multiple Choice'}
                      {poll.pollType === 'single-choice' && 'Single Choice'}
                      {poll.pollType === 'rating' && 'Rating Scale'}
                      {poll.pollType === 'yes-no' && 'Yes/No'}
                      {poll.pollType === 'text' && 'Text Response'}
                    </div>
                  </div>
                  {renderPollResults(poll)}
                </div>
            ))
          )}
        </PollContainer>
      </Modal>
    </Overlay>
  );
};

export default PollHistory; 