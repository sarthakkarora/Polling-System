import React from 'react';
import styled from 'styled-components';


const ResultsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const QuestionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const QuestionTitle = styled.h3`
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--text-primary);
`;



const QuestionBox = styled.div`
  background: var(--surface);
  color: var(--text-primary);
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  font-size: 1.1rem;
  font-weight: 600;
  text-align: center;
  border: 1px solid var(--border);
`;

const OptionsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const OptionItem = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-radius: 8px;
  background: var(--surface);
  color: var(--text-primary);
  border: 2px solid var(--border);
  position: relative;
  transition: all 0.3s ease;
  overflow: hidden;
`;

const OptionNumber = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--primary-purple);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.9rem;
  flex-shrink: 0;
`;

const OptionContent = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const OptionText = styled.span`
  font-weight: 600;
  font-size: 1rem;
  position: relative;
  z-index: 2;
`;

const OptionPercentage = styled.span`
  font-weight: 700;
  font-size: 1rem;
  color: var(--text-primary);
  position: relative;
  z-index: 2;
`;

const ProgressBar = styled.div`
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  background: ${props => props.percentage > 0 ? 'rgba(102, 126, 234, 0.2)' : 'transparent'};
  border-radius: 8px;
  z-index: 0;
  transition: all 0.3s ease;
  min-width: 0;
  max-width: 100%;
`;



const NoResults = styled.div`
  text-align: center;
  padding: 2rem;
  color: var(--medium-gray);
  font-style: italic;
`;

const PollResults = ({ results, poll }) => {
  if (!results || !poll) {
    return <NoResults>No results available</NoResults>;
  }

  const { percentages = {}, counts = {}, totalAnswers = 0, averageRating = 0, responses = [] } = results || {};
  
  // Debug logging
  console.log('PollResults - results:', results);
  console.log('PollResults - poll type:', poll.pollType);

  const renderResults = () => {
    switch (poll.pollType || 'multiple-choice') {
      case 'multiple-choice':
      case 'single-choice':
      case 'yes-no':
        const options = poll.options || [];


        return (
          <OptionsContainer>
            {options.map((option, index) => {
              const percentage = (percentages && percentages[option]) || 0;
              
              return (
                <OptionItem key={index}>
                  <ProgressBar 
                    percentage={percentage}
                    style={{ width: `${percentage}%` }}
                    data-percentage={percentage}
                  />
                  
                  <OptionNumber>
                    {index + 1}
                  </OptionNumber>
                  
                  <OptionContent>
                    <OptionText>{option}</OptionText>
                    <OptionPercentage>
                      {percentage}%
                    </OptionPercentage>
                  </OptionContent>
                </OptionItem>
              );
            })}
          </OptionsContainer>
        );

      case 'rating':
        const maxRating = poll.ratingScale || 5;
        const ratingOptions = Array.from({ length: maxRating }, (_, i) => i + 1);
        
        return (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary-purple)', marginBottom: '0.5rem' }}>
                Average Rating: {averageRating || 0} / {maxRating}
              </div>
              <div style={{ fontSize: '1rem', color: 'var(--medium-gray)' }}>
                Based on {totalAnswers} responses
              </div>
            </div>
            <OptionsContainer>
              {ratingOptions.map((rating) => {
                const percentage = (percentages && percentages[rating]) || 0;
                const count = (counts && counts[rating]) || 0;
                
                return (
                  <OptionItem key={rating}>
                    <ProgressBar 
                      percentage={percentage}
                      style={{ width: `${percentage}%` }}
                    />
                    
                    <OptionNumber>
                      {rating}
                    </OptionNumber>
                    
                    <OptionContent>
                      <OptionText>{rating} Star{rating > 1 ? 's' : ''}</OptionText>
                      <OptionPercentage>
                        {percentage}% ({count} votes)
                      </OptionPercentage>
                    </OptionContent>
                  </OptionItem>
                );
              })}
            </OptionsContainer>
          </div>
        );

      case 'text':
        return (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--dark-gray)', marginBottom: '0.5rem' }}>
                Text Responses ({totalAnswers} total)
              </div>
            </div>
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {responses && responses.length > 0 ? responses.map((response, index) => (
                <div key={index} style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  padding: '1rem',
                  marginBottom: '1rem'
                }}>
                  <div style={{ fontSize: '0.9rem', color: 'var(--medium-gray)', marginBottom: '0.5rem' }}>
                    {response.studentName} • {new Date(response.timestamp).toLocaleTimeString()}
                  </div>
                  <div style={{ fontSize: '1rem', lineHeight: '1.5' }}>
                    {response.text}
                  </div>
                </div>
              )) : (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '2rem',
                  color: 'var(--medium-gray)',
                  fontStyle: 'italic'
                }}>
                  No text responses received
                </div>
              )}
            </div>
          </div>
        );

      default:
        return <NoResults>Unsupported poll type</NoResults>;
    }
  };

  return (
    <ResultsContainer>
      <QuestionHeader>
        <QuestionTitle>Question 1</QuestionTitle>
      </QuestionHeader>
      
      <QuestionBox>
        {poll.question}
      </QuestionBox>
      
      {renderResults()}
    </ResultsContainer>
  );
};

export default PollResults; 