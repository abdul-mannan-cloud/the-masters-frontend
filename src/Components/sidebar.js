import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    Home,
    ClipboardList,
    Users,
    Shirt,
    UserPlus,
    Package,
    LogOut,
    Menu,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
import Ciseaux from '../resources/ciseaux.png';
import Logo from '../resources/Icons/scissors.png';
import './sidebar.css';

const SideBar = () => {
    const [isExpanded, setIsExpanded] = useState(localStorage.getItem('sidebarExpanded') === 'true');
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const handleResize = () => {
            const newIsMobile = window.innerWidth < 768;
            setIsMobile(newIsMobile);

            // Close mobile sidebar when resizing to desktop
            if (!newIsMobile && isMobileOpen) {
                setIsMobileOpen(false);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [isMobileOpen]);

    // Save sidebar state to localStorage
    useEffect(() => {
        localStorage.setItem('sidebarExpanded', isExpanded);
    }, [isExpanded]);

    const menuItems = [
        { name: 'Dashboard', path: '/home', icon: Home },
        { name: 'Orders', path: '/orders', icon: ClipboardList },
        { name: 'Employees', path: '/employees', icon: Users },
        // { name: 'Cloths', path: '/cloths', icon: Shirt },
        { name: 'Customers', path: '/customers', icon: UserPlus },
        { name: 'Place Order', path: '/placeorder', icon: ClipboardList },
        { name: 'Items', path: '/items', icon: Package },
    ];

    const isActive = (path) => location.pathname === path;

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    const toggleSidebar = () => {
        setIsExpanded(!isExpanded);
    };

    const toggleMobileSidebar = () => {
        setIsMobileOpen(!isMobileOpen);
    };

    const SidebarContent = (
        <div className="flex flex-col h-full">
            <div className="flex items-center h-16 px-4 bg-gray-100 border-b border-gray-200">
                <div className="flex items-center justify-center w-full">
                    <div className="flex items-center">
                        <img src={Logo} className="w-10 h-10" alt="Logo" />
                        {isExpanded && <img src={Ciseaux} className="h-10 ml-2" alt="Ciseaux"/>}
                    </div>
                </div>
            </div>
            <nav className="flex-grow px-2 py-4 overflow-y-auto sidebar-nav">
                <ul className="space-y-2">
                    {/* Toggle sidebar button as first menu item */}
                    {!isMobile && (
                        <li>
                            <button
                                onClick={toggleSidebar}
                                className={`flex items-center ${!isExpanded && 'justify-center'} w-full px-3 py-2 text-base font-medium rounded-md focus:outline-none transition-colors duration-200 menu-item toggle-button text-gray-600 hover:bg-gray-50 hover:text-gray-800`}
                                data-tooltip="Toggle Sidebar"
                                data-tooltip-enabled={!isExpanded}
                            >
                                {isExpanded ? <ChevronLeft className="w-5 h-5 flex-shrink-0" /> : <ChevronRight className="w-5 h-5 flex-shrink-0" />}
                                {(isExpanded || isMobile) && (
                                    <span className="ml-3 truncate">{isExpanded ? "Collapse Sidebar" : "Expand Sidebar"}</span>
                                )}
                            </button>
                        </li>
                    )}

                    {/* Regular menu items */}
                    {menuItems.map((item) => (
                        <li key={item.path}>
                            <button
                                onClick={() => {
                                    navigate(item.path);
                                    if (isMobile) setIsMobileOpen(false);
                                }}
                                className={`flex items-center ${!isExpanded && 'justify-center'} w-full px-3 py-2 text-base font-medium rounded-md focus:outline-none transition-colors duration-200 menu-item ${
                                    isActive(item.path)
                                        ? 'menu-item-active'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                                }`}
                                data-tooltip={item.name}
                                data-tooltip-enabled={!isExpanded}
                            >
                                <item.icon className="w-5 h-5 flex-shrink-0" />
                                {(isExpanded || isMobile) && (
                                    <span className="ml-3 truncate">{item.name}</span>
                                )}
                            </button>
                        </li>
                    ))}
                </ul>
            </nav>
            <div className="px-2 py-4 border-t border-gray-200">
                <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-3 py-2 text-base font-medium text-red-600 rounded-md hover:bg-red-50 focus:outline-none transition-colors duration-200 menu-item"
                    data-tooltip="Logout"
                    data-tooltip-enabled={!isExpanded}
                >
                    <LogOut className="w-5 h-5 flex-shrink-0" />
                    {(isExpanded || isMobile) && <span className="ml-3">Logout</span>}
                </button>
            </div>
        </div>
    );

    return (
        <>
            {/* Mobile Header */}
            {isMobile && (
                <div className="sticky top-0 z-40 flex items-center justify-between p-4 bg-white border-b border-gray-200 md:hidden">
                    <button onClick={toggleMobileSidebar} className="text-gray-600 focus:outline-none">
                        <Menu className="w-6 h-6" />
                    </button>
                    <div className="flex items-center">
                        <img src={Logo} className="w-8 h-8" alt="Logo" />
                        <img src={Ciseaux} className="h-8 ml-2" alt="Ciseaux" />
                    </div>
                    <div className="w-6" /> {/* Empty div for flex balance */}
                </div>
            )}

            {/* Desktop Sidebar */}
            {!isMobile && (
                <div
                    className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-white border-r border-gray-200 sidebar-transition ${
                        isExpanded ? 'w-64 sidebar-expanded' : 'w-20 sidebar-collapsed'
                    }`}
                >
                    {SidebarContent}
                </div>
            )}

            {/* Mobile Sidebar - Slide Over */}
            {isMobile && (
                <>
                    <div
                        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform sidebar-transition ${
                            isMobileOpen ? 'translate-x-0' : '-translate-x-full'
                        }`}
                    >
                        {SidebarContent}
                    </div>

                    {/* Backdrop */}
                    {isMobileOpen && (
                        <div
                            onClick={toggleMobileSidebar}
                            className="fixed inset-0 z-40 bg-black bg-opacity-50 sidebar-backdrop"
                        />
                    )}
                </>
            )}

            {/* Main content padding adjustment */}
            {!isMobile && (
                <div
                    className={`transition-all duration-300 ease-in-out ${
                        isExpanded ? 'ml-64' : 'ml-20'
                    }`}
                />
            )}
        </>
    );
};

export default SideBar;