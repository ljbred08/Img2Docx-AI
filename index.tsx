/**
 * index.tsx
 * 
 * The entry point of the React application. 
 * Responsibilities include:
 * - Mounting the root React component (App) into the DOM.
 * - Enabling React Strict Mode for improved developer feedback and best practices.
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Retrieve the root element from the HTML document
const rootElement = document.getElementById('root');

// Ensure the root element exists before attempting to mount the application
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

// Create the React root and render the application
const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);