import { createRoot } from 'react-dom/client'
import './index.css'
import '@mantine/core/styles.css'
import '@mantine/notifications/styles.css'
import App from './App.tsx'
import { initRumMonitoring } from './monitoring/rum'
import { registerServiceWorker } from './sw/registerServiceWorker'

initRumMonitoring()
registerServiceWorker()

createRoot(document.getElementById('root')!).render(<App />)
