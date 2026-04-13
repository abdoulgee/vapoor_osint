/**
 * ProtectedRoute — Wraps routes that require authentication and optional role checks.
 */

import { Navigate } from 'react-router-dom';
import useAuthStore from '../stores/authStore';

export default function ProtectedRoute({ children, roles }) {
    const { isAuthenticated, user } = useAuthStore();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (roles && !roles.includes(user?.role)) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-dark-950">
                <div className="glass-card p-8 text-center max-w-md">
                    <div className="text-4xl mb-4">🔒</div>
                    <h2 className="text-xl font-bold text-white mb-2">Access Denied</h2>
                    <p className="text-dark-400">You don't have permission to view this page.</p>
                </div>
            </div>
        );
    }

    return children;
}
