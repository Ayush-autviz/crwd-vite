import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { QueryProvider } from './providers/QueryProvider.tsx'

if (navigator.userAgent.includes("ReactSnap")) {
  (window as any).fetch = () =>
    Promise.resolve({
      json: () => Promise.resolve({}),
      text: () => Promise.resolve(""),
      ok: true,
    } as Response);
}

const rootElement = document.getElementById('root')!;
const app = (
  <StrictMode>
    <QueryProvider>
      <App />
    </QueryProvider>
  </StrictMode>
);

if (rootElement.hasChildNodes()) {
  hydrateRoot(rootElement, app);
} else {
  createRoot(rootElement).render(app);
}

// Support for react-snap to wait for page load and API data
(window as any).snapSaveState = () => {
  return new Promise(resolve => {
    // Wait for document to be ready and a small buffer for React Query data
    if (document.readyState === "complete") {
      setTimeout(resolve, 500);
    } else {
      window.addEventListener('load', () => setTimeout(resolve, 500));
    }
  });
};
