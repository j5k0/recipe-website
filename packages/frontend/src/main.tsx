import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from "react-router-dom";
import './index.css'
import App from './App.tsx'
import { LanguageProvider } from './i18n/LanguageContext.tsx'

const savedTheme = localStorage.getItem("theme");
document.documentElement.classList.toggle("dark", savedTheme === "dark");

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <LanguageProvider>
        <App />
      </LanguageProvider>
    </HashRouter>
  </StrictMode>,
)
