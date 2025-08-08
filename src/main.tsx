
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
// Import styles in the correct order
import './styles/index.css'
import './index.css'

// Get root element
const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error("Root element not found. Please ensure your HTML has a div with id='root'");
}

// Render App with React.StrictMode wrapper
ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Set viewport height for mobile devices
const setViewportHeight = () => {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
};

// Set viewport height once and on resize
setViewportHeight();
window.addEventListener('resize', setViewportHeight);

// Log successful initialization
console.log('Application successfully initialized');
