
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from '@/components/ui/theme-provider'
import App from './App.tsx'
import { ThemeTest } from './pages/ThemeTest.tsx'
import './index.css'

createRoot(document.getElementById("root")!).render(
  <ThemeProvider defaultTheme="dark" storageKey="dashboard-theme">
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/theme-test" element={<ThemeTest />} />
      </Routes>
    </BrowserRouter>
  </ThemeProvider>
);
