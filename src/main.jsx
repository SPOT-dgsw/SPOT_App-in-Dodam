import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BridgeProvider } from '@b1nd/aid-kit/bridge-kit/web'
import { SafeAreaProvider } from '@b1nd/aid-kit/safe-area-provider'
import { AppStateProvider } from '@b1nd/aid-kit/app-state'
import { RouteProvider } from '@b1nd/aid-kit/navigation'
import { registerSW } from 'virtual:pwa-register'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { routes } from './routes'
import './index.css'
import App from './App.jsx'

// 미니앱 환경 감지 (URL에 top/bottom 파라미터가 있으면 App-in-Dodam)
const isAppInDodam = new URLSearchParams(window.location.search).has('top')

const SW_RECOVERY_KEY = 'spot_sw_recovery_v2'

async function recoverServiceWorkerOnce(errorLike) {
  const message = String(errorLike?.message || errorLike || '')
  const isBadPrecache = message.includes('bad-precaching-response')
  const alreadyRecovered = sessionStorage.getItem(SW_RECOVERY_KEY) === '1'

  if (!isBadPrecache || alreadyRecovered) {
    return
  }

  sessionStorage.setItem(SW_RECOVERY_KEY, '1')

  try {
    const registrations = await navigator.serviceWorker.getRegistrations()
    await Promise.all(registrations.map((registration) => registration.unregister()))

    if ('caches' in window) {
      const cacheKeys = await caches.keys()
      await Promise.all(cacheKeys.map((key) => caches.delete(key)))
    }
  } catch (recoveryError) {
    console.error('[PWA] Service worker recovery failed:', recoveryError)
  } finally {
    window.location.reload()
  }
}

// 미니앱 환경에서는 PWA 비활성화
if (!isAppInDodam && 'serviceWorker' in navigator) {
  const updateSW = registerSW({
    immediate: true,
    onNeedRefresh: () => {
      updateSW(true)
    },
    onRegisterError: async (error) => {
      console.error('[PWA] Service worker registration failed:', error)
      await recoverServiceWorkerOnce(error)
    },
  })

  window.addEventListener('unhandledrejection', (event) => {
    recoverServiceWorkerOnce(event.reason)
  })
}

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
