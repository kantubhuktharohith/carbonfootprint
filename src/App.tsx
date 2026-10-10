import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { AppLayout } from './components/layout/AppLayout';
import { Dashboard } from './pages/Dashboard';
import { Activities } from './pages/Activities';
import { AddActivity } from './pages/AddActivity';
import { Analytics } from './pages/Analytics';
import { Recommendations } from './pages/Recommendations';
import { Simulator } from './pages/Simulator';

import { Settings } from './pages/Settings';
import { Login } from './pages/Login';
import { Register } from './pages/Register';

export function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Core Platform Workspace Routes */}
          <Route path="/" element={<AppLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="activities" element={<Activities />} />
            <Route path="add-activity" element={<AddActivity />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="recommendations" element={<Recommendations />} />
            <Route path="simulator" element={<Simulator />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          {/* Catch-all redirect to Dashboard */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
