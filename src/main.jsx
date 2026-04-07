import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BridgeProvider } from '@b1nd/aid-kit/bridge-kit/web'
import { SafeAreaProvider } from '@b1nd/aid-kit/safe-area-provider'
import { AppStateProvider } from '@b1nd/aid-kit/app-state'
import { RouteProvider } from '@b1nd/aid-kit/navigation'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { routes } from './routes'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BridgeProvider>
      <SafeAreaProvider>
        <AppStateProvider>
          <ThemeProvider>
            <RouteProvider routes={routes}>
              <AuthProvider>
                <App />
              </AuthProvider>
            </RouteProvider>
          </ThemeProvider>
        </AppStateProvider>
      </SafeAreaProvider>
    </BridgeProvider>
  </StrictMode>,
)
