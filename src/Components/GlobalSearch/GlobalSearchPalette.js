import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { apiGlobalSearch } from './api';
import { highlightMatch } from './highlightMatch';
import { useRecents } from './useRecents';

const PREFIXES = [
    { key: '@', label: 'employees' },
    { key: '#', label: 'order number' },
    { key: '+', label: 'phone' },
    { key: '',  label: 'everything' },
];

const GROUPS = [
    { key: 'customers', label: 'Customers', type: 'customer', listPath: '/customers',  qParam: 'query'  },
    { key: 'orders',    label: 'Orders',    type: 'order',    listPath: '/orders',     qParam: 'query'  },
    { key: 'employees', label: 'Employees', type: 'employee', listPath: '/employees',  qParam: 'search' },
    { key: 'products',  label: 'Products',  type: 'product',  listPath: '/items',      qParam: 'query'  },
    { key: 'items',     label: 'Items',     type: 'item',     listPath: '/items',      qParam: 'query'  },
    { key: 'cloths',    label: 'Cloth',     type: 'cloth',    listPath: '/items',      qParam: 'query'  },
];

const detailPath = (type, id) => {
    switch (type) {
        case 'customer': return `/customers/view/${id}`;
        case 'order':    return `/order/details/${id}`;
        case 'employee': return `/employees/view/${id}`;
        case 'product':  return `/items`;
        case 'item':     return `/items`;
        case 'cloth':    return `/items`;
        default: return '/';
    }
};

const detectPrefix = (q) => {
    const t = q.trim();
    if (t.startsWith('@')) return '@';
    if (t.startsWith('#')) return '#';
    if (t.startsWith('+')) return '+';
    return '';
};

const StatusBadge = ({ children, tone = 'neutral' }) => {
    const map = {
        neutral: 'bg-surface-container-low text-on-surface-variant',
        success: 'bg-primary-fixed text-on-primary-fixed-variant',
        warn:    'bg-tertiary-fixed text-on-tertiary-fixed-variant',
        info:    'bg-secondary-container text-on-secondary-container',
        danger:  'bg-error-container text-on-error-container',
    };
    return <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider ${map[tone] || map.neutral}`}>{children}</span>;
};

const orderTone = (s) => s === 'completed' ? 'success' : s === 'in progress' ? 'info' : 'warn';

const renderRow = (item, term) => {
    switch (item._kind) {
        case 'customer':
            return (
                <div className="flex items-center gap-3 min-w-0">
                    {item.orderNumber && (
                        <span className="font-mono text-[11px] text-stone-400 flex-shrink-0">#{highlightMatch(item.orderNumber, term)}</span>
                    )}
                    <span className="font-bold text-on-surface truncate">{highlightMatch(item.name, term)}</span>
                    {item.phone && <span className="text-xs text-on-surface-variant truncate">{highlightMatch(item.phone, term)}</span>}
                    {item.address && <span className="text-xs text-stone-400 truncate hidden md:inline">{highlightMatch(item.address, term)}</span>}
                </div>
            );
        case 'order':
            return (
                <div className="flex items-center gap-3 min-w-0">
                    <span className="font-mono text-xs text-primary font-bold">#{highlightMatch(String(item._id || '').slice(-6).toUpperCase(), term)}</span>
                    {item.customer?.name && <span className="font-bold text-on-surface truncate">{highlightMatch(item.customer.name, term)}</span>}
                    {item.status && <StatusBadge tone={orderTone(item.status)}>{item.status}</StatusBadge>}
                    {item.total != null && <span className="text-xs font-bold text-on-surface ml-auto flex-shrink-0">Rs. {Number(item.total).toLocaleString()}</span>}
                    {item.date && <span className="text-xs text-stone-400 flex-shrink-0">{new Date(item.date).toLocaleDateString()}</span>}
                </div>
            );
        case 'employee':
            return (
                <div className="flex items-center gap-3 min-w-0">
                    <span className="font-bold text-on-surface truncate">{highlightMatch(item.name, term)}</span>
                    {item.role && <StatusBadge tone="info">{highlightMatch(item.role, term)}</StatusBadge>}
                    {item.phone && <span className="text-xs text-on-surface-variant truncate">{highlightMatch(item.phone, term)}</span>}
                </div>
            );
        case 'product':
            return (
                <div className="flex items-center gap-3 min-w-0">
                    <span className="font-bold text-on-surface truncate">{highlightMatch(item.type || item.name, term)}</span>
                    {item.status && <StatusBadge>{highlightMatch(item.status, term)}</StatusBadge>}
                    {item.price != null && <span className="text-xs font-bold text-on-surface ml-auto">Rs. {Number(item.price).toLocaleString()}</span>}
                </div>
            );
        case 'item':
            return (
                <div className="flex items-center gap-3 min-w-0">
                    <span className="font-bold text-on-surface truncate">{highlightMatch(item.name, term)}</span>
                    {item.price != null && <span className="text-xs font-bold text-on-surface ml-auto">Rs. {Number(item.price).toLocaleString()}</span>}
                </div>
            );
        case 'cloth':
            return (
                <div className="flex items-center gap-3 min-w-0">
                    <span className="font-bold text-on-surface truncate">{highlightMatch(item.name, term)}</span>
                    {item.code && <span className="text-xs font-mono text-stone-400">{highlightMatch(item.code, term)}</span>}
                    {item.color && <span className="w-3.5 h-3.5 rounded-full border border-outline-variant/30 flex-shrink-0" style={{ background: item.color }} title={item.color} />}
                    {item.price != null && <span className="text-xs font-bold text-on-surface ml-auto">Rs. {Number(item.price).toLocaleString()}</span>}
                    {item.quantity != null && <span className="text-[10px] text-stone-400">×{item.quantity}</span>}
                </div>
            );
        default:
            return <span className="font-bold text-on-surface">{highlightMatch(item.label || item.name || '', term)}</span>;
    }
};

const recentLabel = (r) => r.label || '(unknown)';

export default function GlobalSearchPalette({ onClose }) {
    const navigate = useNavigate();
    const [query, setQuery] = useState('');
    const [debounced, setDebounced] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [data, setData] = useState(null); // { term, results: { customers, orders, ... } }
    const [selected, setSelected] = useState(0);
    const inputRef = useRef(null);
    const listRef = useRef(null);
    const abortRef = useRef(null);
    const { recents, push } = useRecents();

    useEffect(() => { inputRef.current?.focus(); }, []);

    // Debounce
    useEffect(() => {
        const t = setTimeout(() => setDebounced(query), 200);
        return () => clearTimeout(t);
    }, [query]);

    // Fetch
    useEffect(() => {
        if (!debounced.trim()) {
            if (abortRef.current) abortRef.current.abort();
            setData(null);
            setLoading(false);
            setError(null);
            return;
        }
        if (abortRef.current) abortRef.current.abort();
        const controller = new AbortController();
        abortRef.current = controller;
        setLoading(true);
        setError(null);
        apiGlobalSearch(debounced, { signal: controller.signal, limit: 5 })
            .then((res) => {
                if (controller.signal.aborted) return;
                setData(res || { term: debounced, results: {} });
                setLoading(false);
                setSelected(0);
            })
            .catch((err) => {
                if (axios.isCancel?.(err) || err.name === 'CanceledError' || err.name === 'AbortError' || controller.signal.aborted) return;
                setError(err);
                setLoading(false);
            });
        return () => controller.abort();
    }, [debounced]);

    const term = data?.term ?? '';

    // Build flat list of visible rows for keyboard nav
    const { groups, flat } = useMemo(() => {
        if (!query.trim()) {
            const flatList = (recents || []).slice(0, 5).map((r) => ({
                _kind: r.type,
                _id: r.id,
                _recent: true,
                name: r.label,
                phone: r.subtitle,
            }));
            return {
                groups: flatList.length ? [{ key: 'recent', label: 'Recent', type: null, items: flatList, listPath: null }] : [],
                flat: flatList,
            };
        }
        const results = data?.results || {};
        const built = [];
        const flatList = [];
        for (const g of GROUPS) {
            const arr = results[g.key];
            if (Array.isArray(arr) && arr.length) {
                const items = arr.map((it) => ({ ...it, _kind: g.type, _group: g }));
                built.push({ ...g, items });
                flatList.push(...items);
            }
        }
        return { groups: built, flat: flatList };
    }, [data, recents, query]);

    useEffect(() => {
        if (selected >= flat.length) setSelected(0);
    }, [flat.length, selected]);

    const activate = useCallback((item) => {
        if (!item) return;
        const id = item._id || item.id;
        push({
            type: item._kind,
            id,
            label: item.name || item.type || item.code || '(item)',
            subtitle: item.phone || item.customer?.name || item.code || '',
        });
        navigate(detailPath(item._kind, id));
        onClose();
    }, [navigate, onClose, push]);

    const onKeyDown = (e) => {
        if (e.key === 'Escape') { e.preventDefault(); onClose(); return; }
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelected((i) => flat.length ? (i + 1) % flat.length : 0);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelected((i) => flat.length ? (i - 1 + flat.length) % flat.length : 0);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            activate(flat[selected]);
        }
    };

    // Auto-scroll selected
    useEffect(() => {
        const el = listRef.current?.querySelector(`[data-row-idx="${selected}"]`);
        if (el && el.scrollIntoView) el.scrollIntoView({ block: 'nearest' });
    }, [selected]);

    const activePrefix = detectPrefix(query);

    const retry = () => setDebounced((d) => d ? d + ' ' : d); // bumps effect; cheap retry

    let rowIdx = -1;

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] px-4 bg-black/40 backdrop-blur-sm font-body" onClick={onClose}>
            <div
                role="dialog"
                aria-modal="true"
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-2xl bg-surface-container-lowest rounded-2xl overflow-hidden flex flex-col"
                style={{ boxShadow: '0 24px 60px rgba(25,28,27,0.25)', maxHeight: '70vh' }}
            >
                {/* Input */}
                <div className="relative border-b border-outline-variant/10">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 text-[20px]">search</span>
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={onKeyDown}
                        placeholder="Search customers, orders, employees…"
                        className="w-full pl-12 pr-12 py-4 bg-transparent text-base font-body text-on-surface placeholder:text-stone-400 focus:outline-none"
                    />
                    {loading && (
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
                    )}
                </div>

                {/* Prefix hints */}
                <div className="flex flex-wrap items-center gap-2 px-4 py-2 border-b border-outline-variant/10 bg-surface-container-low/40">
                    {PREFIXES.map((p) => {
                        const active = activePrefix === p.key;
                        return (
                            <span key={p.label} className={`text-[11px] font-label flex items-center gap-1 px-2 py-0.5 rounded-full transition-colors ${active ? 'bg-primary/10 text-primary font-bold' : 'text-stone-400'}`}>
                                <kbd className={`font-mono text-[10px] ${active ? 'text-primary' : 'text-on-surface-variant'}`}>{p.key || 'none'}</kbd>
                                <span>{p.label}</span>
                            </span>
                        );
                    })}
                </div>

                {/* Body */}
                <div ref={listRef} className="flex-1 overflow-y-auto">
                    {error && (
                        <div className="m-3 p-3 bg-error-container/40 border border-error/30 text-on-error-container rounded-xl flex items-center justify-between text-sm">
                            <span>Search failed.</span>
                            <button onClick={retry} className="text-xs font-bold underline">Retry</button>
                        </div>
                    )}

                    {!query.trim() && groups.length === 0 && (
                        <div className="py-12 text-center text-sm text-stone-400 font-label">
                            Start typing to search… or use <kbd className="font-mono">@</kbd> <kbd className="font-mono">#</kbd> <kbd className="font-mono">+</kbd>
                        </div>
                    )}

                    {query.trim() && !loading && !error && data && flat.length === 0 && (
                        <div className="py-12 text-center">
                            <p className="text-sm text-on-surface font-bold">No matches for "{query}"</p>
                            <p className="text-xs text-stone-400 mt-1 font-label">Try removing the prefix or shortening the search.</p>
                        </div>
                    )}

                    {groups.map((g) => (
                        <div key={g.key} className="py-2">
                            <div className="flex items-center justify-between px-4 py-1.5">
                                <h3 className="text-[10px] font-bold uppercase tracking-widest text-stone-400 font-headline">
                                    {g.label} {g.items.length > 0 && <span className="text-stone-300 ml-1">{g.items.length}</span>}
                                </h3>
                            </div>
                            {g.items.map((item) => {
                                rowIdx += 1;
                                const idx = rowIdx;
                                const isSel = idx === selected;
                                return (
                                    <div
                                        key={`${item._kind}:${item._id || item.id}`}
                                        data-row-idx={idx}
                                        onMouseEnter={() => setSelected(idx)}
                                        onClick={() => activate(item)}
                                        className={`px-4 py-2.5 cursor-pointer transition-colors ${isSel ? 'bg-primary/[0.08]' : 'hover:bg-surface-container-low'}`}
                                    >
                                        {item._recent
                                            ? <div className="flex items-center gap-3 min-w-0">
                                                <span className="material-symbols-outlined text-[16px] text-stone-400">history</span>
                                                <span className="font-bold text-on-surface truncate">{recentLabel(item)}</span>
                                                {item.phone && <span className="text-xs text-stone-400 truncate">{item.phone}</span>}
                                            </div>
                                            : renderRow(item, term)}
                                    </div>
                                );
                            })}
                            {g.listPath && query.trim() && (
                                <button
                                    onClick={() => { navigate(`${g.listPath}?${g.qParam}=${encodeURIComponent(query.replace(/^[@#+]/, '').trim())}`); onClose(); }}
                                    className="px-4 py-1.5 text-[11px] font-bold text-primary hover:underline font-label"
                                >
                                    See all {g.label.toLowerCase()} matching "{query.replace(/^[@#+]/, '').trim()}" →
                                </button>
                            )}
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between gap-4 px-4 py-2 border-t border-outline-variant/10 bg-surface-container-low/40 text-[11px] text-stone-400 font-label">
                    <div className="flex items-center gap-3">
                        <span><kbd className="font-mono px-1.5 py-0.5 bg-surface-container-lowest rounded border border-outline-variant/20">↑</kbd> <kbd className="font-mono px-1.5 py-0.5 bg-surface-container-lowest rounded border border-outline-variant/20">↓</kbd> navigate</span>
                        <span><kbd className="font-mono px-1.5 py-0.5 bg-surface-container-lowest rounded border border-outline-variant/20">↵</kbd> open</span>
                        <span><kbd className="font-mono px-1.5 py-0.5 bg-surface-container-lowest rounded border border-outline-variant/20">esc</kbd> close</span>
                    </div>
                    <span className="hidden sm:inline">Global search</span>
                </div>
            </div>
        </div>
    );
}
