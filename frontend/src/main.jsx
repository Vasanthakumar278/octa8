import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ThemeProvider } from './context/ThemeContext'

console.log('Main.jsx executing...');
const rootProps = document.getElementById('root');
console.log('Root element:', rootProps);

try {
  createRoot(rootProps).render(
    <StrictMode>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </StrictMode>,
  )
  console.log('React full render called');
} catch (e) {
  console.error('Mounting error:', e);
}
