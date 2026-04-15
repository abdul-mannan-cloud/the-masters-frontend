import React from 'react';
import { render } from '@testing-library/react';
import { highlightMatch, escapeRegex } from './highlightMatch';

describe('highlightMatch', () => {
    const renderToText = (nodes) => {
        const { container } = render(<div>{nodes}</div>);
        return container.textContent;
    };

    test('returns plain string when no term', () => {
        expect(highlightMatch('hello', '')).toBe('hello');
        expect(highlightMatch('hello', null)).toBe('hello');
    });

    test('returns empty for null/undefined text', () => {
        expect(highlightMatch(null, 'x')).toBe('');
        expect(highlightMatch(undefined, 'x')).toBe('');
    });

    test('preserves original text when wrapping matches', () => {
        expect(renderToText(highlightMatch('John Doe', 'john'))).toBe('John Doe');
    });

    test('matches case-insensitively', () => {
        const { container } = render(<div>{highlightMatch('John JOHN john', 'john')}</div>);
        expect(container.querySelectorAll('strong')).toHaveLength(3);
    });

    test('escapes regex special chars', () => {
        expect(escapeRegex('a.b+c?')).toBe('a\\.b\\+c\\?');
        expect(renderToText(highlightMatch('price: $5.00', '$5.00'))).toBe('price: $5.00');
        const { container } = render(<div>{highlightMatch('price: $5.00 vs $5x00', '$5.00')}</div>);
        expect(container.querySelectorAll('strong')).toHaveLength(1);
    });

    test('coerces non-string text', () => {
        expect(renderToText(highlightMatch(1248, '24'))).toBe('1248');
    });
});
