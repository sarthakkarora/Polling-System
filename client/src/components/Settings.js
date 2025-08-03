import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCog, FaTimes, FaVolumeUp, FaVolumeMute, FaEye, FaKeyboard, FaMobile } from 'react-icons/fa';
import { useTheme } from '../contexts/ThemeContext';
import soundEffects from '../utils/soundEffects';

const SettingsOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--overlay);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
`;

const SettingsModal = styled(motion.div)`
  background: var(--surface);
  border-radius: 16px;
  padding: 2rem;
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 40px var(--shadow);
  border: 1px solid var(--border);
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border);
`;

const Title = styled.h2`
  color: var(--text-primary);
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: var(--text-secondary);
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 8px;
  transition: all 0.3s ease;
  
  &:hover {
    background: var(--border);
    color: var(--text-primary);
  }
`;

const Section = styled.div`
  margin-bottom: 2rem;
`;

const SectionTitle = styled.h3`
  color: var(--text-primary);
  margin: 0 0 1rem 0;
  font-size: 1.1rem;
  font-weight: 600;
`;

const SettingItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: var(--background);
  border-radius: 8px;
  margin-bottom: 0.5rem;
  border: 1px solid var(--border);
  transition: all 0.3s ease;
  
  &:hover {
    border-color: var(--primary-purple);
    box-shadow: 0 2px 8px var(--shadow);
  }
`;

const SettingLabel = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-primary);
  font-weight: 500;
`;

const SettingDescription = styled.div`
  color: var(--text-secondary);
  font-size: 0.9rem;
  margin-top: 0.25rem;
`;

const ToggleSwitch = styled.label`
  position: relative;
  display: inline-block;
  width: 50px;
  height: 24px;
  background: var(--border);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:after {
    content: '';
    position: absolute;
    top: 2px;
    left: 2px;
    width: 20px;
    height: 20px;
    background: var(--background);
    border-radius: 50%;
    transition: all 0.3s ease;
    box-shadow: 0 2px 4px var(--shadow);
  }
  
  input:checked + &:after {
    transform: translateX(26px);
  }
  
  input:checked + & {
    background: var(--primary-purple);
  }
  
  input {
    opacity: 0;
    width: 0;
    height: 0;
  }
`;

const VolumeSlider = styled.input`
  width: 100px;
  height: 4px;
  border-radius: 2px;
  background: var(--border);
  outline: none;
  -webkit-appearance: none;
  
  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: var(--primary-purple);
    cursor: pointer;
    box-shadow: 0 2px 4px var(--shadow);
  }
  
  &::-moz-range-thumb {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: var(--primary-purple);
    cursor: pointer;
    border: none;
    box-shadow: 0 2px 4px var(--shadow);
  }
`;

const Settings = ({ isOpen, onClose }) => {
  const { isDarkMode, toggleTheme } = useTheme();
  const [soundEnabled, setSoundEnabled] = useState(soundEffects.isSoundEnabled());
  const [volume, setVolume] = useState(0.3);

  const handleSoundToggle = () => {
    soundEffects.toggle();
    setSoundEnabled(soundEffects.isSoundEnabled());
    soundEffects.play('click');
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    soundEffects.setVolume(newVolume);
    soundEffects.play('click');
  };

  const handleThemeToggle = () => {
    toggleTheme();
    soundEffects.play('click');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <SettingsOverlay
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <SettingsModal
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <Header>
              <Title>
                <FaCog />
                Settings
              </Title>
              <CloseButton onClick={onClose}>
                <FaTimes />
              </CloseButton>
            </Header>

            <Section>
              <SectionTitle>Appearance</SectionTitle>
              <SettingItem>
                <div>
                  <SettingLabel>
                    <FaEye />
                    Dark Mode
                  </SettingLabel>
                  <SettingDescription>
                    Switch between light and dark themes
                  </SettingDescription>
                </div>
                <ToggleSwitch>
                  <input
                    type="checkbox"
                    checked={isDarkMode}
                    onChange={handleThemeToggle}
                  />
                </ToggleSwitch>
              </SettingItem>
            </Section>

            <Section>
              <SectionTitle>Sound & Audio</SectionTitle>
              <SettingItem>
                <div>
                  <SettingLabel>
                    {soundEnabled ? <FaVolumeUp /> : <FaVolumeMute />}
                    Sound Effects
                  </SettingLabel>
                  <SettingDescription>
                    Enable audio feedback for interactions
                  </SettingDescription>
                </div>
                <ToggleSwitch>
                  <input
                    type="checkbox"
                    checked={soundEnabled}
                    onChange={handleSoundToggle}
                  />
                </ToggleSwitch>
              </SettingItem>
              
              {soundEnabled && (
                <SettingItem>
                  <div>
                    <SettingLabel>
                      <FaVolumeUp />
                      Volume
                    </SettingLabel>
                    <SettingDescription>
                      Adjust sound effect volume
                    </SettingDescription>
                  </div>
                  <VolumeSlider
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={volume}
                    onChange={handleVolumeChange}
                  />
                </SettingItem>
              )}
            </Section>

            <Section>
              <SectionTitle>Accessibility</SectionTitle>
              <SettingItem>
                <div>
                  <SettingLabel>
                    <FaKeyboard />
                    Keyboard Navigation
                  </SettingLabel>
                  <SettingDescription>
                    Use Tab, Enter, and Space for navigation
                  </SettingDescription>
                </div>
                <div style={{ color: 'var(--success)', fontSize: '0.9rem' }}>
                  Enabled
                </div>
              </SettingItem>
              
              <SettingItem>
                <div>
                  <SettingLabel>
                    <FaMobile />
                    Mobile Optimized
                  </SettingLabel>
                  <SettingDescription>
                    Responsive design for mobile devices
                  </SettingDescription>
                </div>
                <div style={{ color: 'var(--success)', fontSize: '0.9rem' }}>
                  Enabled
                </div>
              </SettingItem>
            </Section>

            <Section>
              <SectionTitle>About</SectionTitle>
              <div style={{ 
                padding: '1rem', 
                background: 'var(--background)', 
                borderRadius: '8px',
                border: '1px solid var(--border)'
              }}>
                <div style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                  <strong>Live Polling System</strong>
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  Version 2.0.0
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                  Real-time interactive polling with advanced features
                </div>
              </div>
            </Section>
          </SettingsModal>
        </SettingsOverlay>
      )}
    </AnimatePresence>
  );
};

export default Settings; 