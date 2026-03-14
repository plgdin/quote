import React from 'react'
import ReactDOM from 'react-dom/client'
import QuotationMaker from './quote'
import './index.css'

// This file acts as the entry point for Vite.
// It finds the 'root' div in your index.html and injects your React app.

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QuotationMaker />
  </React.StrictMode>,
)