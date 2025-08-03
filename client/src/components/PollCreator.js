import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { 
  FaPlus, 
  FaTrash, 
  FaClock, 
  FaEye, 
  FaEyeSlash,
  FaCheck,
  FaBrain,
  FaWater,
  FaGraduationCap,
  FaStar,
  FaComments,
  FaImage
} from 'react-icons/fa';
import { createPoll } from '../store/slices/pollSlice';
import toast from 'react-hot-toast';

const Container = styled.div`
  padding: 2rem;
  background: var(--background);
  min-height: 100vh;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 3rem;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 800;
  background: linear-gradient(135deg, var(--primary-teal) 0%, var(--primary-cyan) 50%, var(--accent-green) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 1rem;
`;

const Subtitle = styled.p`
  color: var(--text-secondary);
  font-size: 1.1rem;
  max-width: 600px;
  margin: 0 auto;
`;

const FormContainer = styled(motion.div)`
  max-width: 800px;
  margin: 0 auto;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-xl);
  padding: 2.5rem;
  box-shadow: var(--shadow-lg);
`;

const FormSection = styled.div`
  margin-bottom: 2rem;
`;

const SectionTitle = styled.h3`
  font-size: 1.3rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 1rem;
  border: 2px solid var(--border);
  border-radius: var(--radius-md);
  background: var(--surface);
  color: var(--text-primary);
  font-size: 1rem;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: var(--primary-teal);
    box-shadow: 0 0 0 3px rgba(0, 180, 216, 0.1);
  }
  
  &::placeholder {
    color: var(--text-muted);
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 1rem;
  border: 2px solid var(--border);
  border-radius: var(--radius-md);
  background: var(--surface);
  color: var(--text-primary);
  font-size: 1rem;
  min-height: 120px;
  resize: vertical;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: var(--primary-teal);
    box-shadow: 0 0 0 3px rgba(0, 180, 216, 0.1);
  }
  
  &::placeholder {
    color: var(--text-muted);
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 1rem;
  border: 2px solid var(--border);
  border-radius: var(--radius-md);
  background: var(--surface);
  color: var(--text-primary);
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: var(--primary-teal);
    box-shadow: 0 0 0 3px rgba(0, 180, 216, 0.1);
  }
`;

const OptionContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  align-items: center;
`;

const OptionInput = styled.input`
  flex: 1;
  padding: 0.75rem;
  border: 2px solid var(--border);
  border-radius: var(--radius-md);
  background: var(--surface);
  color: var(--text-primary);
  font-size: 1rem;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: var(--primary-teal);
  }
`;

const RemoveButton = styled.button`
  background: var(--error);
  color: white;
  border: none;
  padding: 0.75rem;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: #dc2626;
    transform: scale(1.05);
  }
`;

const AddButton = styled.button`
  background: linear-gradient(135deg, var(--primary-teal) 0%, var(--primary-cyan) 100%);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: var(--radius-md);
  cursor: pointer;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
  }
`;

const ToggleContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const Toggle = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  color: var(--text-primary);
  font-weight: 500;
`;

const ToggleInput = styled.input`
  appearance: none;
  width: 50px;
  height: 25px;
  background: var(--border);
  border-radius: 25px;
  position: relative;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:checked {
    background: var(--primary-teal);
  }
  
  &:checked::before {
    content: '';
    position: absolute;
    width: 21px;
    height: 21px;
    background: white;
    border-radius: 50%;
    top: 2px;
    right: 2px;
    transition: all 0.3s ease;
  }
  
  &:not(:checked)::before {
    content: '';
    position: absolute;
    width: 21px;
    height: 21px;
    background: white;
    border-radius: 50%;
    top: 2px;
    left: 2px;
    transition: all 0.3s ease;
  }
`;

const TimeSlider = styled.div`
  margin: 1rem 0;
`;

const TimeDisplay = styled.div`
  text-align: center;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--primary-teal);
  margin-bottom: 1rem;
`;

const Slider = styled.input`
  width: 100%;
  height: 8px;
  border-radius: 4px;
  background: var(--border);
  outline: none;
  -webkit-appearance: none;
  
  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: var(--primary-teal);
    cursor: pointer;
    box-shadow: var(--shadow-md);
  }
  
  &::-moz-range-thumb {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: var(--primary-teal);
    cursor: pointer;
    border: none;
    box-shadow: var(--shadow-md);
  }
`;

const SubmitButton = styled(motion.button)`
  background: linear-gradient(135deg, var(--primary-teal) 0%, var(--primary-cyan) 100%);
  color: white;
  border: none;
  padding: 1.25rem 3rem;
  border-radius: var(--radius-lg);
  font-size: 1.2rem;
  font-weight: 600;
  cursor: pointer;
  width: 100%;
  margin-top: 2rem;
  transition: all 0.3s ease;
  
  &:hover:not(:disabled) {
    transform: translateY(-3px);
    box-shadow: var(--shadow-xl);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const PollTypeCard = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'selected'
})`
  border: 2px solid ${props => props.selected ? 'var(--primary-teal)' : 'var(--border)'};
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  background: ${props => props.selected ? 'rgba(0, 180, 216, 0.1)' : 'var(--surface)'};
  
  &:hover {
    border-color: var(--primary-teal);
    transform: translateY(-2px);
  }
`;

const PollTypeGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`;

const PollTypeIcon = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary-teal) 0%, var(--primary-cyan) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
  color: white;
  font-size: 1.25rem;
`;

const PollCreator = () => {
  const dispatch = useDispatch();
  const socket = useSelector(state => state.socket.socket);
  const currentPoll = useSelector(state => state.poll.currentPoll);

  const [formData, setFormData] = useState({
    question: '',
    pollType: 'multiple-choice',
    options: ['', ''],
    timeLimit: 60,
    isAnonymous: false,
    ratingScale: 5,
    textResponse: false,
    correctAnswer: [] // default to array for MCQ, will be string for single-choice
  });

  const pollTypes = [
    {
      id: 'multiple-choice',
      name: 'Multiple Choice',
      description: 'Students can select multiple options',
      icon: <FaCheck />
    },
    {
      id: 'single-choice',
      name: 'Single Choice',
      description: 'Students select one option only',
      icon: <FaGraduationCap />
    },
    {
      id: 'yes-no',
      name: 'Yes/No',
      description: 'Simple yes or no question',
      icon: <FaBrain />
    },
    {
      id: 'rating',
      name: 'Rating Scale',
      description: 'Students rate on a scale',
      icon: <FaStar />
    },
    {
      id: 'text',
      name: 'Text Response',
      description: 'Open-ended text answers',
      icon: <FaComments />
    }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData(prev => ({
      ...prev,
      options: newOptions
    }));
  };

  const addOption = () => {
    setFormData(prev => ({
      ...prev,
      options: [...prev.options, '']
    }));
  };

  const removeOption = (index) => {
    if (formData.options.length > 2) {
      const newOptions = formData.options.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        options: newOptions
      }));
    }
  };

  const handleCorrectAnswerChange = (option) => {
    if (formData.pollType === 'multiple-choice') {
      setFormData(prev => ({
        ...prev,
        correctAnswer: prev.correctAnswer.includes(option)
          ? prev.correctAnswer.filter(o => o !== option)
          : [...prev.correctAnswer, option]
      }));
    } else if (formData.pollType === 'single-choice') {
      setFormData(prev => ({
        ...prev,
        correctAnswer: option
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.question.trim()) {
      toast.error('Please enter a question');
      return;
    }
    
    if (formData.pollType !== 'text' && formData.pollType !== 'yes-no') {
      const validOptions = formData.options.filter(option => option.trim() !== '');
      if (validOptions.length < 2) {
        toast.error('Please add at least 2 options');
        return;
      }
    }
    
    if (currentPoll && currentPoll.isActive) {
      toast.error('Please wait for current poll to complete');
      return;
    }

    const pollData = {
      question: formData.question.trim(),
      pollType: formData.pollType,
      options: formData.pollType === 'yes-no' ? ['Yes', 'No'] : formData.options.filter(option => option.trim() !== ''),
      timeLimit: formData.timeLimit,
      isAnonymous: formData.isAnonymous,
      ratingScale: formData.pollType === 'rating' ? formData.ratingScale : null,
      textResponse: formData.pollType === 'text' ? true : false,
      correctAnswer: formData.pollType === 'multiple-choice' ? formData.correctAnswer : formData.pollType === 'single-choice' ? formData.correctAnswer : null
    };

    if (socket) {
    socket.emit('create-poll', pollData);
      toast.success('Poll created successfully!');
      
      // Reset form
      setFormData({
        question: '',
        pollType: 'multiple-choice',
        options: ['', ''],
        timeLimit: 60,
        isAnonymous: false,
        ratingScale: 5,
        textResponse: false,
        correctAnswer: []
      });
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <Container>
        <Header>
        <Title>Create Interactive Poll</Title>
        <Subtitle>Design engaging questions to capture student insights and understanding</Subtitle>
        </Header>

      <FormContainer
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <form onSubmit={handleSubmit}>
          <FormSection>
            <SectionTitle>
              <FaBrain />
              Question Details
            </SectionTitle>
            <TextArea
              placeholder="Enter your question here..."
              value={formData.question}
              onChange={(e) => handleInputChange('question', e.target.value)}
              required
            />
          </FormSection>

          <FormSection>
            <SectionTitle>
              <FaWater />
              Poll Type
            </SectionTitle>
            <PollTypeGrid>
              {pollTypes.map((type) => (
                <PollTypeCard
                  key={type.id}
                  selected={formData.pollType === type.id}
                  onClick={() => handleInputChange('pollType', type.id)}
                >
                  <PollTypeIcon>
                    {type.icon}
                  </PollTypeIcon>
                  <h4 style={{ marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                    {type.name}
                  </h4>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    {type.description}
                  </p>
                </PollTypeCard>
              ))}
            </PollTypeGrid>
          </FormSection>

          {(formData.pollType === 'multiple-choice' || formData.pollType === 'single-choice') && (
            <FormSection>
              <SectionTitle>
                <FaCheck />
                Options
              </SectionTitle>
              {formData.options.map((option, index) => (
                <OptionContainer key={index}>
                    <OptionInput
                    placeholder={`Option ${index + 1}`}
                      value={option}
                      onChange={(e) => handleOptionChange(index, e.target.value)}
                    required
                  />
                  {formData.options.length > 2 && (
                    <RemoveButton onClick={() => removeOption(index)}>
                        <FaTrash />
                    </RemoveButton>
                    )}
                </OptionContainer>
                ))}
              <AddButton onClick={addOption}>
                  <FaPlus />
                  Add Option
              </AddButton>
            </FormSection>
          )}

          {formData.pollType === 'rating' && (
            <FormSection>
              <SectionTitle>
                <FaStar />
                Rating Scale
              </SectionTitle>
              <Select
                value={formData.ratingScale}
                onChange={(e) => handleInputChange('ratingScale', parseInt(e.target.value))}
              >
                <option value={3}>3-point scale</option>
                <option value={5}>5-point scale</option>
                <option value={7}>7-point scale</option>
                <option value={10}>10-point scale</option>
              </Select>
            </FormSection>
          )}

          <FormSection>
            <SectionTitle>
              <FaClock />
              Time Limit
            </SectionTitle>
            <TimeDisplay>{formatTime(formData.timeLimit)}</TimeDisplay>
            <Slider
              type="range"
              min="15"
              max="600"
              value={formData.timeLimit}
              onChange={(e) => handleInputChange('timeLimit', parseInt(e.target.value))}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              <span>15s</span>
              <span>10m</span>
            </div>
          </FormSection>

          <FormSection>
            <SectionTitle>
              <FaEye />
              Settings
            </SectionTitle>
            <ToggleContainer>
              <Toggle>
                <ToggleInput
                  type="checkbox"
                  checked={formData.isAnonymous}
                  onChange={(e) => handleInputChange('isAnonymous', e.target.checked)}
                />
                Anonymous Responses
              </Toggle>
            </ToggleContainer>
          </FormSection>

          {['multiple-choice', 'single-choice'].includes(formData.pollType) && (
            <div style={{ marginTop: '1rem' }}>
              <label style={{ fontWeight: 600, marginBottom: 8, display: 'block' }}>Mark correct answer{formData.pollType === 'multiple-choice' ? 's' : ''}:</label>
              {formData.options.map((option, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
                  {formData.pollType === 'multiple-choice' ? (
                    <input
                      type="checkbox"
                      checked={formData.correctAnswer.includes(option)}
                      onChange={() => handleCorrectAnswerChange(option)}
                      disabled={!option.trim()}
                      style={{ marginRight: 8 }}
                    />
                  ) : (
                    <input
                      type="radio"
                      checked={formData.correctAnswer === option}
                      onChange={() => handleCorrectAnswerChange(option)}
                      disabled={!option.trim()}
                      style={{ marginRight: 8 }}
                    />
                  )}
                  <span>{option || <em style={{ color: '#aaa' }}>Option {idx + 1}</em>}</span>
                </div>
              ))}
            </div>
          )}

          <SubmitButton
            type="submit"
            disabled={currentPoll && currentPoll.isActive}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <FaWater style={{ marginRight: '0.5rem' }} />
            Launch Poll
          </SubmitButton>
        </form>
      </FormContainer>
    </Container>
  );
};

export default PollCreator; 