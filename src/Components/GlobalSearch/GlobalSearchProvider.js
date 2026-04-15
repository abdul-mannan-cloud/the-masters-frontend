import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import GlobalSearchPalette from './GlobalSearchPalette';

const Ctx = createContext(null);

export function GlobalSearchProvider({ children }) {
    const [isOpen, setIsOpen] = useState(false);

    const open = useCallback(() => setIsOpen(true), []);
    const close = useCallback(() => setIsOpen(false), []);
    const toggle = useCallback(() => setIsOpen((v) => !v), []);

    useEffect(() => {
        const onKey = (e) => {
            const isMod = e.ctrlKey || e.metaKey;
            if (isMod && (e.key === 'k' || e.key === 'K')) {
                e.preventDefault();
                setIsOpen((v) => !v);
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, []);

    const value = useMemo(() => ({ isOpen, open, close, toggle }), [isOpen, open, close, toggle]);

    return (
        <Ctx.Provider value={value}>
            {children}
            {isOpen && <GlobalSearchPalette onClose={close} />}
        </Ctx.Provider>
    );
}

export function useGlobalSearch() {
    const ctx = useContext(Ctx);
    if (!ctx) throw new Error('useGlobalSearch must be used within GlobalSearchProvider');
    return ctx;
}
