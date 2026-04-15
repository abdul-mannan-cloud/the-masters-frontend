import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const TopNavBar = () => {
    const navigate = useNavigate();
    const [name, setName] = useState('');

    useEffect(() => {
        setName(localStorage.getItem('name') || 'Master');
    }, []);

    const initials = name
        ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        : 'MT';

    return (
        <header className="sticky top-0 z-30 flex items-center justify-between w-full px-6 py-3 glass-nav border-b border-outline-variant/10">
            {/* Search */}
            <div className="flex items-center flex-1 max-w-sm">
                <div className="relative w-full">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-[18px]">
                        search
                    </span>
                    <input
                        type="text"
                        placeholder="Search orders, clients…"
                        className="w-full bg-surface-container-low border-none rounded-full py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/15 font-body text-on-surface placeholder:text-stone-400"
                    />
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 ml-4">
                {/* Quick action buttons */}
                <button
                    onClick={() => navigate('/placeorder')}
                    className="flex items-center gap-1.5 bg-primary text-on-primary px-4 py-2 rounded-full font-bold text-xs hover:bg-primary-container transition-all font-label uppercase tracking-wide"
                >
                    <span className="material-symbols-outlined text-[15px]">add</span>
                    New Order
                </button>

                <div className="h-5 w-px bg-outline-variant/30" />

                {/* Avatar with name */}
                <div className="flex items-center gap-2.5 cursor-pointer group">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary text-xs font-bold flex-shrink-0 ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all">
                        {initials}
                    </div>
                    <span className="text-sm font-bold text-on-surface hidden sm:block font-label">{name}</span>
                </div>
            </div>
        </header>
    );
};

export default TopNavBar;
