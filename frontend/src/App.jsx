/**
 * App — Root component with React Router configuration.
 * Map-first: CommandCenter is the default route.
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './components/Toast';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Cases from './pages/Cases';
import CaseDetail from './pages/CaseDetail';
import FOITracker from './pages/FOITracker';
import AuditLogs from './pages/AuditLogs';
import UserManagement from './pages/UserManagement';
import CommandCenter from './pages/CommandCenter';

export default function App() {
    return (
        <ToastProvider>
            <BrowserRouter>
                <Routes>
                    {/* Public routes */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />

                    {/* Protected routes inside layout */}
                    <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                        <Route path="/command-center" element={<CommandCenter />} />
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/cases" element={<Cases />} />
                        <Route path="/cases/:id" element={<CaseDetail />} />
                        <Route path="/foi" element={<FOITracker />} />
                        <Route path="/audit-logs" element={
                            <ProtectedRoute roles={['admin']}><AuditLogs /></ProtectedRoute>
                        } />
                        <Route path="/users" element={
                            <ProtectedRoute roles={['admin']}><UserManagement /></ProtectedRoute>
                        } />
                    </Route>

                    {/* Default: map-first command center */}
                    <Route path="*" element={<Navigate to="/command-center" replace />} />
                </Routes>
            </BrowserRouter>
        </ToastProvider>
    );
}
