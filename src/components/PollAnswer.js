import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FaCheck, FaStar, FaAlignLeft } from 'react-icons/fa';
import toast from 'react-hot-toast';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  overflow: visible;
`;

const Question = styled.div`
  background: var(--surface);
  color: var(--text-primary);
  padding: 1.5rem;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 600;
  line-height: 1.5;
  border: 1px solid var(--border);
`;

const OptionsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const OptionButton = styled(motion.button).withConfig({
  shouldForwardProp: (prop) => !['initial', 'animate', 'exit', 'transition', 'whileHover', 'whileTap', 'variants'].includes(prop)
})`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.5rem;
  border: 2px solid var(--border);
  border-radius: 12px;
  background: var(--surface);
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1rem;
  font-weight: 500;
  color: var(--text-primary);
  position: relative;
  
  &:hover {
    border-color: var(--primary-purple);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(119, 101, 218, 0.15);
  }
  
  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
    transform: none;
  }
`;

const OptionNumber = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'selected'
})`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${props => props.selected ? 'var(--primary-purple)' : 'var(--border)'};
  color: ${props => props.selected ? 'var(--text-primary)' : 'var(--text-secondary)'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.9rem;
  transition: all 0.3s ease;
`;

const OptionText = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'selected'
})`
  flex: 1;
  text-align: left;
  color: ${props => props.selected ? 'var(--primary-purple)' : 'var(--text-primary)'};
  font-weight: ${props => props.selected ? '600' : '500'};
`;

const SelectedIndicator = styled.div`
  position: absolute;
  right: 1rem;
  color: var(--primary-purple);
  font-size: 1.2rem;
`;

const SubmitButton = styled(motion.button).withConfig({
  shouldForwardProp: (prop) => !['initial', 'animate', 'exit', 'transition', 'whileHover', 'whileTap', 'variants'].includes(prop)
})`
  background: linear-gradient(135deg, var(--primary-purple) 0%, var(--primary-indigo) 100%);
  color: var(--text-primary);
  border: none;
  padding: 1rem 2rem;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 1rem;
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const RatingContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const RatingScale = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin: 1rem 0;
`;

const RatingStar = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'selected'
})`
  font-size: 2rem;
  color: ${props => props.selected ? 'var(--primary-purple)' : 'var(--border)'};
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    color: var(--primary-purple);
    transform: scale(1.1);
  }
`;

const YesNoContainer = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin: 1rem 0;
`;

const YesNoButton = styled(motion.button).withConfig({
  shouldForwardProp: (prop) => !['selected', 'initial', 'animate', 'exit', 'transition', 'whileHover', 'whileTap', 'variants'].includes(prop)
})`
  padding: 1rem 2rem;
  border: 2px solid var(--border);
  border-radius: 12px;
  background: ${props => props.selected ? 'var(--primary-purple)' : 'var(--surface)'};
  color: ${props => props.selected ? 'var(--text-primary)' : 'var(--text-primary)'};
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: var(--primary-purple);
    transform: translateY(-2px);
  }
`;

const TextResponseArea = styled.textarea`
  width: 100%;
  padding: 1rem;
  border: 2px solid var(--border);
  border-radius: 8px;
  font-size: 1rem;
  resize: vertical;
  min-height: 120px;
  transition: all 0.3s ease;
  background: var(--surface);
  color: var(--text-primary);
  
  &:focus {
    border-color: var(--primary-purple);
    outline: none;
    box-shadow: 0 0 0 3px rgba(119, 101, 218, 0.1);
  }
  
  &::placeholder {
    color: var(--text-muted);
  }
`;



const PollAnswer = ({ poll, socket, onAnswer }) => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [rating, setRating] = useState(null);
  const [textResponse, setTextResponse] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [answerResult, setAnswerResult] = useState(null); // 'correct' | 'incorrect' | null


  const handleOptionSelect = (option) => {
    if (isSubmitting) return;
    
    if (poll.pollType === 'multiple-choice') {
      setSelectedOptions(prev => 
        prev.includes(option) 
          ? prev.filter(item => item !== option)
          : [...prev, option]
      );
    } else {
      setSelectedOption(option);
    }
  };

  const handleRatingSelect = (value) => {
    if (isSubmitting) return;
    setRating(value);
  };

  const handleYesNoSelect = (value) => {
    if (isSubmitting) return;
    setSelectedOption(value);
  };

  const handleSubmit = () => {
    let answer = null;
    
    switch (poll.pollType) {
      case 'multiple-choice':
        if (selectedOptions.length === 0) return;
        answer = selectedOptions;
        break;
      case 'single-choice':
        if (!selectedOption) return;
        answer = selectedOption;
        break;
      case 'rating':
        if (!rating) return;
        answer = rating;
        break;
      case 'yes-no':
        if (!selectedOption) return;
        answer = selectedOption;
        break;
      case 'text':
        if (!textResponse.trim()) return;
        answer = textResponse;
        break;

      default:
        if (!selectedOption) return;
        answer = selectedOption;
    }

    if (!socket || isSubmitting) return;

    setIsSubmitting(true);
    
    try {
      socket.emit('submit-answer', answer);
      onAnswer();
      // Check correctness
      let isCorrect = false;
      if (poll.pollType === 'multiple-choice' && Array.isArray(poll.correctAnswer)) {
        isCorrect =
          selectedOptions.length === poll.correctAnswer.length &&
          selectedOptions.every(opt => poll.correctAnswer.includes(opt));
      } else if (poll.pollType === 'single-choice' && typeof poll.correctAnswer === 'string') {
        isCorrect = selectedOption === poll.correctAnswer;
      }
      setAnswerResult(isCorrect ? 'correct' : 'incorrect');
      toast.success('Answer submitted successfully!');
    } catch (error) {
      toast.error('Failed to submit answer. Please try again.');
      setIsSubmitting(false);
    }
  };

  const getOptionNumber = (index) => {
    return String.fromCharCode(65 + index); // A, B, C, D, etc.
  };

  const renderPollContent = () => {
    switch (poll.pollType) {
      case 'multiple-choice':
        return (
          <OptionsContainer>
            {poll.options.map((option, index) => {
              const isSelected = selectedOptions.includes(option);
              const isCorrect = Array.isArray(poll.correctAnswer) && poll.correctAnswer.includes(option);
              return (
                <OptionButton
                  key={index}
                  onClick={() => handleOptionSelect(option)}
                  selected={isSelected}
                  disabled={isSubmitting}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    borderColor: isSelected ? 'var(--primary-purple)' : isCorrect && answerResult ? 'var(--accent-green)' : 'var(--border)',
                    background: isCorrect && answerResult ? 'rgba(0,255,0,0.08)' : 'var(--surface)'
                  }}
                >
                  <OptionNumber selected={isSelected}>{getOptionNumber(index)}</OptionNumber>
                  <OptionText selected={isSelected}>{option}</OptionText>
                  {isSelected && <SelectedIndicator><FaCheck /></SelectedIndicator>}
                  {answerResult && isCorrect && <span style={{ color: 'var(--accent-green)', marginLeft: 8, fontWeight: 600 }}>&#10003; Correct</span>}
                </OptionButton>
              );
            })}
          </OptionsContainer>
        );

      case 'single-choice':
        return (
          <OptionsContainer>
            {poll.options.map((option, index) => {
              const isSelected = selectedOption === option;
              const isCorrect = poll.correctAnswer === option;
              return (
                <OptionButton
                  key={index}
                  onClick={() => handleOptionSelect(option)}
                  selected={isSelected}
                  disabled={isSubmitting}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    borderColor: isSelected ? 'var(--primary-purple)' : isCorrect && answerResult ? 'var(--accent-green)' : 'var(--border)',
                    background: isCorrect && answerResult ? 'rgba(0,255,0,0.08)' : 'var(--surface)'
                  }}
                >
                  <OptionNumber selected={isSelected}>{getOptionNumber(index)}</OptionNumber>
                  <OptionText selected={isSelected}>{option}</OptionText>
                  {isSelected && <SelectedIndicator><FaCheck /></SelectedIndicator>}
                  {answerResult && isCorrect && <span style={{ color: 'var(--accent-green)', marginLeft: 8, fontWeight: 600 }}>&#10003; Correct</span>}
                </OptionButton>
              );
            })}
          </OptionsContainer>
        );

      case 'rating':
        return (
          <RatingContainer>
            <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
              <div style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                <FaStar style={{ marginRight: '0.5rem' }} />
                Rating Scale: 1 to {poll.ratingScale || 5} Stars
              </div>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                Click on the stars below to rate
              </div>
            </div>
            <RatingScale>
              {Array.from({ length: poll.ratingScale || 5 }, (_, i) => (
                <RatingStar
                  key={i + 1}
                  selected={rating !== null && rating >= i + 1}
                  onClick={() => handleRatingSelect(i + 1)}
                >
                  <FaStar />
                </RatingStar>
              ))}
            </RatingScale>
            {rating && (
              <div style={{ textAlign: 'center', fontWeight: 600, color: 'var(--primary-purple)', fontSize: '1.1rem' }}>
                You rated: {rating} star{rating > 1 ? 's' : ''} out of {poll.ratingScale || 5}
              </div>
            )}
          </RatingContainer>
        );

      case 'yes-no':
        return (
          <YesNoContainer>
            <YesNoButton
              selected={selectedOption === 'Yes'}
              onClick={() => handleYesNoSelect('Yes')}
              disabled={isSubmitting}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Yes
            </YesNoButton>
            <YesNoButton
              selected={selectedOption === 'No'}
              onClick={() => handleYesNoSelect('No')}
              disabled={isSubmitting}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              No
            </YesNoButton>
          </YesNoContainer>
        );

      case 'text':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
              <div style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                <FaAlignLeft style={{ marginRight: '0.5rem' }} />
                Text Response
              </div>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                Please provide your detailed response below
              </div>
            </div>
            <TextResponseArea
              value={textResponse}
              onChange={(e) => setTextResponse(e.target.value)}
              placeholder="Type your detailed response here..."
              disabled={isSubmitting}
            />
            {textResponse && (
              <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
                Character count: {textResponse.length}
              </div>
            )}
          </div>
        );



      default:
        // Only show options for multiple-choice and single-choice
        if (poll.pollType === 'multiple-choice' || poll.pollType === 'single-choice') {
          return (
            <OptionsContainer>
              {poll.options.map((option, index) => (
                <OptionButton
                  key={index}
                  onClick={() => handleOptionSelect(option)}
                  selected={poll.pollType === 'multiple-choice' ? selectedOptions.includes(option) : selectedOption === option}
                  disabled={isSubmitting}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    borderColor: (poll.pollType === 'multiple-choice' ? selectedOptions.includes(option) : selectedOption === option) ? 'var(--primary-purple)' : 'var(--border)',
                    background: (poll.pollType === 'multiple-choice' ? selectedOptions.includes(option) : selectedOption === option) ? 'var(--surface)' : 'var(--surface)'
                  }}
                >
                  <OptionNumber selected={poll.pollType === 'multiple-choice' ? selectedOptions.includes(option) : selectedOption === option}>
                    {getOptionNumber(index)}
                  </OptionNumber>
                  <OptionText selected={poll.pollType === 'multiple-choice' ? selectedOptions.includes(option) : selectedOption === option}>
                    {option}
                  </OptionText>
                  {(poll.pollType === 'multiple-choice' ? selectedOptions.includes(option) : selectedOption === option) && (
                    <SelectedIndicator>
                      <FaCheck />
                    </SelectedIndicator>
                  )}
                </OptionButton>
              ))}
            </OptionsContainer>
          );
        }
        return null;
    }
  };

  const isSubmitDisabled = () => {
    switch (poll.pollType) {
      case 'multiple-choice':
        return selectedOptions.length === 0 || isSubmitting;
      case 'single-choice':
        return !selectedOption || isSubmitting;
      case 'rating':
        return !rating || isSubmitting;
      case 'yes-no':
        return !selectedOption || isSubmitting;
      case 'text':
        return !textResponse.trim() || isSubmitting;

      default:
        return !selectedOption || isSubmitting;
    }
  };

  return (
    <Container>
      <Question>{poll.question}</Question>
      
      {renderPollContent()}
      
      {answerResult && (
        <div style={{ marginTop: 16, fontWeight: 700, color: answerResult === 'correct' ? 'var(--accent-green)' : 'var(--accent-red)', fontSize: 18 }}>
          {answerResult === 'correct' ? 'Correct!' : 'Incorrect!'}
        </div>
      )}

      <SubmitButton
        onClick={handleSubmit}
        disabled={isSubmitDisabled()}
        whileHover={{ scale: !isSubmitDisabled() ? 1.05 : 1 }}
        whileTap={{ scale: 0.95 }}
      >
        {isSubmitting ? (
          <>
            <div style={{ 
              width: '16px', 
              height: '16px', 
              border: '2px solid transparent',
              borderTop: '2px solid white',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
            Submitting...
          </>
        ) : (
          <>
            <FaCheck />
            Submit Answer
          </>
        )}
      </SubmitButton>
    </Container>
  );
};

export default PollAnswer; 