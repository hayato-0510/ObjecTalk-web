import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import Detector from './ObjectDetection/js/Detector.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Detector/>
  </StrictMode>,
)
