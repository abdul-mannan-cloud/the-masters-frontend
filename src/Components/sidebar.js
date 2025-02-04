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
} from 'lucide-react';
import Ciseaux from '../resources/ciseaux.png';
import Logo from '../resources/Icons/scissors.png';

const SideBar = () => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const menuItems = [
        { name: 'Dashboard', path: '/home', icon: Home },
        { name: 'Orders', path: '/orders', icon: ClipboardList },
        { name: 'Employees', path: '/employees', icon: Users },
        { name: 'Cloths', path: '/cloths', icon: Shirt },
        { name: 'Customers', path: '/customers', icon: UserPlus },
        { name: 'Place Order', path: '/placeorder', icon: ClipboardList },
        { name: 'Items', path: '/items', icon: Package },
    ];

    const isActive = (path) => location.pathname === path;

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    const toggleMobileSidebar = () => {
        setIsMobileOpen(!isMobileOpen);
    };

    const SidebarContent = (
        <div className="flex flex-col h-full">
            <div className="flex items-center justify-center h-16 px-4 bg-gray-100 border-b border-gray-200">
                <div className="flex items-center w-full justify-center">
                    <img src={Logo} className="w-12 h-12" alt="Logo" />
                    {isExpanded && <img src={Ciseaux} className="h-12 ml-2" alt="Ciseaux"/>}
                </div>
            </div>
            <nav className="flex-grow px-4 py-4 overflow-y-auto">
                <ul className="space-y-2">
                    {menuItems.map((item) => (
                        <li key={item.path}>
                            <button
                                onClick={() => {
                                    navigate(item.path);
                                    if (isMobile) setIsMobileOpen(false);
                                }}
                                className={`flex items-center w-full px-4 py-2 text-base font-medium rounded-md focus:outline-none transition-colors duration-300 ${
                                    isActive(item.path)
                                        ? 'bg-yellow-100 text-yellow-800'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                                }`}
                            >
                                <item.icon className={!isExpanded?"w-4 h-4":"w-6 h-6 "} />
                                {(isExpanded || isMobile)? <span className="whitespace-nowrap ml-4">{item.name}</span>: null}
                            </button>
                        </li>
                    ))}
                </ul>
            </nav>
            <div className="flex items-center justify-center h-16 px-4 border-t border-gray-200">
                <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-2 text-base font-medium text-red-600 rounded-md hover:bg-red-50 focus:outline-none transition-colors duration-300"
                >
                    <LogOut className={!isExpanded?"w-4 h-4":"w-6 h-6 "} />
                    {(isExpanded || isMobile)  && <span className="ml-4">Logout</span>}
                </button>
            </div>
        </div>
    );

    return (
        <>
            {isMobile && (
                <div className="flex items-center justify-between p-4 bg-gray-100 border-b border-gray-200 md:hidden">
                    <button onClick={toggleMobileSidebar} className="text-gray-600 focus:outline-none">
                        <Menu className="w-6 h-6" />
                    </button>
                    <div className="flex items-center w-full justify-center">
                        <img src={Logo} className="w-12 h-12" alt="Logo" />
                        <img src={Ciseaux} className="w-12 h-12 ml-2" alt="Ciseaux" />
                    </div>
                    <div className="w-6" />
                </div>
            )}
            {!isMobile && (
                <div
                    className={`fixed inset-y-0 left-0 z-50 flex flex-col h-screen bg-white border-r border-gray-200 transition-all duration-300 ${
                        isExpanded ? 'w-64' : 'w-20'
                    }`}
                    onMouseEnter={() => setIsExpanded(true)}
                    onMouseLeave={() => setIsExpanded(false)}
                >
                    {SidebarContent}
                </div>
            )}
            {isMobile && (
                <div
                    className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ${
                        isMobileOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
                >
                    {SidebarContent}
                </div>
            )}
            {isMobile && isMobileOpen && (
                <div onClick={toggleMobileSidebar} className="fixed inset-0 z-40 bg-black opacity-50"></div>
            )}
        </>
    );
};

export default SideBar;
