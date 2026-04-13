/**
 * Layout — 3-panel SOC intelligence layout.
 * Slim sidebar | Main content | Optional intel panel
 */

import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const fullScreenRoutes = ['/command-center'];

export default function Layout() {
    const { pathname } = useLocation();
    const isFullScreen = fullScreenRoutes.includes(pathname);

    return (
        <div className="min-h-screen bg-soc-950">
            <Sidebar />
            <Topbar />

            <main className="ml-14 pt-10 min-h-screen">
                {isFullScreen ? (
                    <Outlet />
                ) : (
                    <div className="p-4">
                        <Outlet />
                    </div>
                )}
            </main>
        </div>
    );
}
