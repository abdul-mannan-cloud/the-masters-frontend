import { useCallback, useEffect, useState } from 'react';

const KEY = 'globalSearch.recents';
const CAP = 10;

const read = () => {
    try {
        const raw = localStorage.getItem(KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
};

const write = (list) => {
    try { localStorage.setItem(KEY, JSON.stringify(list)); } catch { /* ignore */ }
};

export function useRecents() {
    const [recents, setRecents] = useState(() => read());

    useEffect(() => {
        const onStorage = (e) => { if (e.key === KEY) setRecents(read()); };
        window.addEventListener('storage', onStorage);
        return () => window.removeEventListener('storage', onStorage);
    }, []);

    const push = useCallback((entry) => {
        if (!entry || !entry.type || !entry.id) return;
        const next = [{ ...entry, ts: Date.now() }, ...read().filter((r) => !(r.type === entry.type && r.id === entry.id))].slice(0, CAP);
        write(next);
        setRecents(next);
    }, []);

    const clear = useCallback(() => { write([]); setRecents([]); }, []);

    return { recents, push, clear };
}
