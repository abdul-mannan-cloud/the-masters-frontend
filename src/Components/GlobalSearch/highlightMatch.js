import React from 'react';

const escapeRegex = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export function highlightMatch(text, term) {
    if (text === null || text === undefined) return '';
    const str = String(text);
    if (!term) return str;
    const escaped = escapeRegex(term);
    if (!escaped) return str;
    const parts = str.split(new RegExp(`(${escaped})`, 'ig'));
    const lower = term.toLowerCase();
    return parts.map((part, i) =>
        part.toLowerCase() === lower
            ? <strong key={i} className="bg-primary/15 text-primary font-extrabold rounded px-0.5">{part}</strong>
            : <React.Fragment key={i}>{part}</React.Fragment>
    );
}

export { escapeRegex };
