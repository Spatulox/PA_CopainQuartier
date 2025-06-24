import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './app/css/index.css'
import App from './app/App'

import "./app/components/Chat/Chat.css"
import "./app/components/Trocs/Trocs.css"
import "./app/components/shared/footer.css"
import "./app/components/shared/header.css"
import "./app/components/HomePage/Home.css"
import "./app/components/Activity/Activity.css"






createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
