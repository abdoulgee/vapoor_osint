/**
 * Layout — Full-height SOC intelligence layout.
 * Sidebar (fixed left) | Topbar (fixed top) | Main content fills rest
 */

import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const fullScreenRoutes = ['/command-center', '/osint'];

export default function Layout() {
    const { pathname } = useLocation();
    const isFullScreen = fullScreenRoutes.includes(pathname);

    return (
        <div className="h-screen w-screen overflow-hidden bg-soc-950 flex flex-col">
            {/* Fixed top bar */}
            <Topbar />

            <div className="flex flex-1 min-h-0">
                {/* Fixed sidebar */}
                <Sidebar />

                {/* Main content area — takes remaining space */}
                <main className="flex-1 min-h-0 min-w-0 overflow-auto">
                    {isFullScreen ? (
                        <Outlet />
                    ) : (
                        <div className="p-4 h-full overflow-auto">
                            <Outlet />
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
