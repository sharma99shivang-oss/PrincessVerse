import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import './styles.css';
import { Toaster } from 'react-hot-toast';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import OfflineIndicator from './components/OfflineIndicator.jsx';
import { PermissionProvider } from "./context/PermissionContext.jsx";
import { ChatProvider } from "./context/ChatContext";

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch((error) => console.warn('Service worker registration failed:', error)));
}
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <ErrorBoundary>
        <AuthProvider>
          <PermissionProvider>
            <ChatProvider>
              <OfflineIndicator />

              <App />

              <Toaster
                position="top-right"
                toastOptions={{
                  style: {
                    borderRadius: "14px",
                    background: "var(--toast-bg, #fff8fc)",
                    color: "var(--ink)",
                  },
                }}
              />
            </ChatProvider>
          </PermissionProvider>
        </AuthProvider>
      </ErrorBoundary>
    </BrowserRouter>
  </React.StrictMode>
);
