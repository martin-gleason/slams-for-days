/**
 * main.jsx — Application entry point
 *
 * This is the bootstrap file that React uses to mount the app into the DOM.
 * It grabs the <div id="root"> element from index.html and renders the App
 * component inside React's StrictMode (which enables extra development
 * warnings for common mistakes like side effects in render).
 *
 * This file should rarely change. If you need to add a global provider
 * (e.g., theme context, router), wrap <App /> here.
 */
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
