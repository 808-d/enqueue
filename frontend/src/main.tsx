import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { AuthProvider } from "./contexts/authContext.tsx";
import { ToastProvider } from "./contexts/toastContext.tsx";
import { AppThemeProvider } from "./contexts/themeContext.tsx";
import { NotificationProvider } from "./contexts/notificationContext.tsx";
import { WSProvider } from "./contexts/wsContext.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <WSProvider>
            <ToastProvider>
              <App />
            </ToastProvider>
          </WSProvider>
        </NotificationProvider>
      </AuthProvider>
    </AppThemeProvider>
  </StrictMode>,
);
