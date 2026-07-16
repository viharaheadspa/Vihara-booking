import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import SpaBookingSystem from './spa-booking-system.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <SpaBookingSystem />
  </StrictMode>
)
