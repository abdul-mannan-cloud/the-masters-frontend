import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const menuItems = [
    { name: 'Dashboard',  path: '/home',       icon: 'dashboard' },
    { name: 'Orders',     path: '/orders',      icon: 'shopping_cart' },
    { name: 'Employees',  path: '/employees',   icon: 'group' },
    { name: 'Customers',  path: '/customers',   icon: 'person' },
    { name: 'Catalog',    path: '/items',        icon: 'menu_book' },
];

const SideBar = () => {
    const location  = useLocation();
    const navigate  = useNavigate();
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const onResize = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
            if (!mobile) setIsMobileOpen(false);
        };
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    const isActive = (path) => location.pathname.startsWith(path);

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    const NavContent = () => (
        <div className="flex flex-col h-full">
            {/* Brand */}
            <div className="px-8 py-8">
                <div className="text-xl font-bold tracking-widest text-primary uppercase font-headline">
                    The Masters
                </div>
                <div className="text-[10px] uppercase tracking-[0.2em] text-stone-400 mt-1 font-label">
                    Digital Tailor
                </div>
            </div>

            {/* Nav Links */}
            <nav className="flex-1 px-4 space-y-1">
                {menuItems.map((item) => (
                    <button
                        key={item.path}
                        onClick={() => {
                            navigate(item.path);
                            if (isMobile) setIsMobileOpen(false);
                        }}
                        className={
                            isActive(item.path)
                                ? 'sidebar-item-active w-full text-left'
                                : 'sidebar-item w-full text-left'
                        }
                    >
                        <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                        <span className="text-sm">{item.name}</span>
                    </button>
                ))}
            </nav>

            {/* Bottom Section */}
            <div className="p-4 mt-auto space-y-1">
                <button
                    onClick={() => navigate('/placeorder')}
                    className="w-full bg-primary text-on-primary py-3 rounded-full font-bold text-xs uppercase tracking-wider mb-4 transition-all hover:bg-primary-container flex items-center justify-center gap-2"
                >
                    <span className="material-symbols-outlined text-[16px]">add</span>
                    New Custom Order
                </button>

                <button
                    onClick={handleLogout}
                    className="w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-150 cursor-pointer text-error hover:bg-error-container/20"
                >
                    <span className="material-symbols-outlined text-[20px]">logout</span>
                    <span className="text-sm">Logout</span>
                </button>
            </div>
        </div>
    );

    /* ── Mobile header ── */
    if (isMobile) {
        return (
            <>
                {/* Mobile top bar */}
                <div className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 py-3 glass-nav shadow-sm">
                    <button
                        onClick={() => setIsMobileOpen(true)}
                        className="text-primary"
                    >
                        <span className="material-symbols-outlined">menu</span>
                    </button>
                    <span className="text-base font-bold tracking-widest text-primary uppercase font-headline">
                        The Masters
                    </span>
                    <div className="w-6" />
                </div>

                {/* Slide-over */}
                {isMobileOpen && (
                    <>
                        <div
                            className="fixed inset-0 z-40 bg-black/40"
                            onClick={() => setIsMobileOpen(false)}
                        />
                        <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-surface-container-low overflow-y-auto">
                            <button
                                className="absolute top-4 right-4 text-stone-500"
                                onClick={() => setIsMobileOpen(false)}
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                            <NavContent />
                        </aside>
                    </>
                )}

                {/* Spacer so content doesn't go behind the fixed top bar */}
                <div className="h-14" />
            </>
        );
    }

    /* ── Desktop sidebar ── */
    return (
        <aside className="sticky top-0 h-screen w-64 flex-shrink-0 bg-surface-container-low overflow-y-auto border-r border-outline-variant/10">
            <NavContent />
        </aside>
    );
};

export default SideBar;
