import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import CharacterDetail from '../Components/CharacterDetail.jsx'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/character/:id" element={<CharacterDetail />} />
        <Route 
          path="/" 
          element={<App />}
        />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
