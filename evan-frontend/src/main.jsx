import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './styles.css';
import { GoogleOAuthProvider} from "@react-oauth/google"
import { SettingsProvider } from './context/SettingsContext.jsx';


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId="43487209354-ra3dq746db7fvhkml0vu8tpa145mm40b.apps.googleusercontent.com">
       <SettingsProvider>   {/* ✅ ADD THIS */}
        <App />
      </SettingsProvider>
    </GoogleOAuthProvider>
  </StrictMode>,
)
