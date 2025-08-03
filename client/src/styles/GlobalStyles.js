import { createGlobalStyle } from 'styled-components';

const GlobalStyles = createGlobalStyle`
  :root {
    /* Modern Color Palette - Ocean Theme */
    --primary-teal: #00b4d8;
    --primary-cyan: #48cae4;
    --primary-blue: #90e0ef;
    --primary-light: #caf0f8;
    
    /* Accent Colors */
    --accent-coral: #ff6b6b;
    --accent-orange: #ffa726;
    --accent-yellow: #ffd93d;
    --accent-green: #4ecdc4;
    
    /* Dark Theme Colors */
    --dark-bg: #0a1929;
    --dark-surface: #132f4c;
    --dark-surface-hover: #173a5e;
    --dark-border: #1e4976;
    --dark-text-primary: #ffffff;
    --dark-text-secondary: #b2bac2;
    --dark-text-muted: #637381;
    
    /* Light Theme Colors */
    --light-bg: #f8fafc;
    --light-surface: #ffffff;
    --light-surface-hover: #f1f5f9;
    --light-border: #e2e8f0;
    --light-text-primary: #1e293b;
    --light-text-secondary: #64748b;
    --light-text-muted: #94a3b8;
    
    /* Common Colors */
    --success: #10b981;
    --warning: #f59e0b;
    --error: #ef4444;
    --info: #3b82f6;
    
    /* Shadows */
    --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
    --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    
    /* Border Radius */
    --radius-sm: 0.375rem;
    --radius-md: 0.5rem;
    --radius-lg: 0.75rem;
    --radius-xl: 1rem;
    
    /* Spacing */
    --space-xs: 0.25rem;
    --space-sm: 0.5rem;
    --space-md: 1rem;
    --space-lg: 1.5rem;
    --space-xl: 2rem;
    --space-2xl: 3rem;
    
    /* Typography */
    --font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
    --font-size-xs: 0.75rem;
    --font-size-sm: 0.875rem;
    --font-size-base: 1rem;
    --font-size-lg: 1.125rem;
    --font-size-xl: 1.25rem;
    --font-size-2xl: 1.5rem;
    --font-size-3xl: 1.875rem;
    --font-size-4xl: 2.25rem;
    
    /* Transitions */
    --transition-fast: 150ms ease;
    --transition-normal: 250ms ease;
    --transition-slow: 350ms ease;
  }

  /* Dark Theme */
  [data-theme="dark"] {
    --background: var(--dark-bg);
    --surface: var(--dark-surface);
    --surface-hover: var(--dark-surface-hover);
    --border: var(--dark-border);
    --text-primary: var(--dark-text-primary);
    --text-secondary: var(--dark-text-secondary);
    --text-muted: var(--dark-text-muted);
  }

  /* Light Theme */
  [data-theme="light"] {
    --background: var(--light-bg);
    --surface: var(--light-surface);
    --surface-hover: var(--light-surface-hover);
    --border: var(--light-border);
    --text-primary: var(--light-text-primary);
    --text-secondary: var(--light-text-secondary);
    --text-muted: var(--light-text-muted);
  }

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html {
    font-size: 16px;
    scroll-behavior: smooth;
  }

  body {
    font-family: var(--font-family);
    background: var(--background);
    color: var(--text-primary);
    line-height: 1.6;
    transition: background-color var(--transition-normal), color var(--transition-normal);
  }

  /* Scrollbar Styling */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    background: var(--surface);
  }

  ::-webkit-scrollbar-thumb {
    background: var(--border);
    border-radius: var(--radius-sm);
  }

  ::-webkit-scrollbar-thumb:hover {
    background: var(--text-muted);
  }

  /* Selection */
  ::selection {
    background: var(--primary-teal);
    color: white;
  }

  /* Focus Styles */
  *:focus {
    outline: 2px solid var(--primary-teal);
    outline-offset: 2px;
  }

  /* Button Reset */
  button {
    font-family: inherit;
    border: none;
    background: none;
    cursor: pointer;
  }

  /* Link Reset */
  a {
    text-decoration: none;
    color: inherit;
  }

  /* List Reset */
  ul, ol {
    list-style: none;
  }

  /* Image Reset */
  img {
    max-width: 100%;
    height: auto;
  }

  /* Utility Classes */
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  /* Animation Classes */
  .fade-in {
    animation: fadeIn 0.3s ease-in;
  }

  .slide-up {
    animation: slideUp 0.3s ease-out;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  /* Gradient Text */
  .gradient-text {
    background: linear-gradient(135deg, var(--primary-teal) 0%, var(--primary-cyan) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  /* Glass Effect */
  .glass {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
  }

  /* Responsive Typography */
  @media (max-width: 768px) {
    html {
      font-size: 14px;
    }
  }
`;

export default GlobalStyles; 