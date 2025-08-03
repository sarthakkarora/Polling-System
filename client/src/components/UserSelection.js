import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FaGraduationCap, FaChalkboardTeacher, FaWater, FaRocket } from 'react-icons/fa';
import { setUserType } from '../store/slices/authSlice';

const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, var(--dark-bg) 0%, #0f3460 50%, #16213e 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
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
  text-align: center;
  margin-bottom: 4rem;
  position: relative;
  z-index: 1;
`;

const AppBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  background: linear-gradient(135deg, var(--primary-teal) 0%, var(--primary-cyan) 100%);
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 25px;
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 2rem;
  box-shadow: var(--shadow-lg);
  backdrop-filter: blur(10px);
`;

const Title = styled.h1`
  font-size: 3.5rem;
  font-weight: 800;
  background: linear-gradient(135deg, var(--primary-teal) 0%, var(--primary-cyan) 50%, var(--accent-green) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 1.5rem;
  line-height: 1.2;

  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
`;

const Subtitle = styled.p`
  font-size: 1.25rem;
  color: var(--light-text-secondary);
  line-height: 1.7;
  max-width: 700px;
  margin: 0 auto;
  opacity: 0.9;
`;

const RoleSelectionContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
  width: 100%;
  max-width: 800px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const RoleCard = styled(motion.div).withConfig({
  shouldForwardProp: (prop) => prop !== 'selected'
})`
  padding: 2.5rem;
  border: 2px solid ${props => props.selected ? 'var(--primary-teal)' : 'rgba(255, 255, 255, 0.1)'};
  border-radius: 20px;
  background: ${props => props.selected 
    ? 'linear-gradient(135deg, rgba(0, 180, 216, 0.15) 0%, rgba(72, 202, 228, 0.15) 100%)' 
    : 'rgba(255, 255, 255, 0.05)'};
  backdrop-filter: blur(20px);
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
    transition: left 0.5s;
  }
  
  &:hover::before {
    left: 100%;
  }
  
  &:hover {
    border-color: var(--primary-teal);
    transform: translateY(-8px);
    box-shadow: 0 20px 40px rgba(0, 180, 216, 0.2);
  }
`;

const RoleIcon = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary-teal) 0%, var(--primary-cyan) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
  font-size: 2rem;
  color: white;
  box-shadow: var(--shadow-lg);
`;

const RoleTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--light-text-primary);
  margin-bottom: 1rem;
`;

const RoleDescription = styled.p`
  color: var(--light-text-secondary);
  line-height: 1.6;
  font-size: 1rem;
  margin-bottom: 1.5rem;
`;

const RoleFeatures = styled.ul`
  list-style: none;
  padding: 0;
`;

const RoleFeature = styled.li`
  color: var(--light-text-secondary);
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &::before {
    content: '✓';
    color: var(--accent-green);
    font-weight: bold;
  }
`;

const ContinueButton = styled(motion.button)`
  background: linear-gradient(135deg, var(--primary-teal) 0%, var(--primary-cyan) 100%);
  color: white;
  border: none;
  padding: 1.25rem 3.5rem;
  border-radius: 15px;
  font-size: 1.2rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: var(--shadow-xl);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.5s;
  }
  
  &:hover::before {
    left: 100%;
  }
  
  &:hover:not(:disabled) {
    transform: translateY(-3px);
    box-shadow: 0 25px 50px rgba(0, 180, 216, 0.3);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
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

const UserSelection = () => {
  const [selectedRole, setSelectedRole] = useState(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
  };

  const handleContinue = () => {
    if (selectedRole) {
      if (selectedRole === 'teacher') {
        navigate('/teacher/login');
      } else {
        navigate('/student/auth');
      }
    }
  };

  // Generate floating elements
  const floatingElements = Array.from({ length: 20 }, (_, i) => ({
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
        <AppBadge>
          <FaWater />
          intervue.io poll
        </AppBadge>
        <Title>Interactive Learning Platform</Title>
        <Subtitle>
          Experience real-time engagement with our advanced polling system designed for modern education.
          Choose your role to get started with seamless interaction and instant feedback.
        </Subtitle>
      </Header>
      
      <RoleSelectionContainer>
        <RoleCard
          selected={selectedRole === 'student'}
          onClick={() => handleRoleSelect('student')}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <RoleIcon>
            <FaGraduationCap />
          </RoleIcon>
          <RoleTitle>Student Portal</RoleTitle>
          <RoleDescription>
            Join interactive sessions, participate in real-time polls, and track your learning progress with instant feedback.
          </RoleDescription>
          <RoleFeatures>
            <RoleFeature>Real-time poll participation</RoleFeature>
            <RoleFeature>Instant result visualization</RoleFeature>
            <RoleFeature>Progress tracking</RoleFeature>
            <RoleFeature>Interactive chat system</RoleFeature>
          </RoleFeatures>
        </RoleCard>
        
        <RoleCard
          selected={selectedRole === 'teacher'}
          onClick={() => handleRoleSelect('teacher')}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <RoleIcon>
            <FaChalkboardTeacher />
          </RoleIcon>
          <RoleTitle>Educator Dashboard</RoleTitle>
          <RoleDescription>
            Create engaging polls, monitor student responses in real-time, and analyze learning outcomes with comprehensive analytics.
          </RoleDescription>
          <RoleFeatures>
            <RoleFeature>Advanced poll creation</RoleFeature>
            <RoleFeature>Real-time analytics</RoleFeature>
            <RoleFeature>Student management</RoleFeature>
            <RoleFeature>Session control</RoleFeature>
          </RoleFeatures>
        </RoleCard>
      </RoleSelectionContainer>
      
      <ContinueButton
        onClick={handleContinue}
        disabled={!selectedRole}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <FaRocket style={{ marginRight: '0.5rem' }} />
        Launch Platform
      </ContinueButton>
    </Container>
  );
};

export default UserSelection; 