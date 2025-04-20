import React from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { BrowserRouter as Router } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { theme } from './theme/theme';
import AnimatedBackground from './components/AnimatedBackground';
import AppRoutes from './routes';
import { AnimatePresence } from 'framer-motion';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <Router>
            <AnimatedBackground />
            <AnimatePresence mode="wait">
              <AppRoutes />
            </AnimatePresence>
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
