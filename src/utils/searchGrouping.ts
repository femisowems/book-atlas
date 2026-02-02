import type { Book } from '../types/Book';

export interface GroupedBooks {
    topMatch: Book | null;
    related: Book[];
    others: Book[];
}

export const groupSearchResults = (books: Book[]): GroupedBooks => {
    if (books.length === 0) {
        return { topMatch: null, related: [], others: [] };
    }

    // 1. Identify Top Match
    // The list is already sorted by relevance. The first item is the best candidate.
    // We can add a threshold check if we want (e.g. score > 80), but 
    // usually the user wants the "best" result found regardless.
    const topMatch = books[0];

    // 2. Identify Related
    // Items with score >= 50, excluding the top match
    const remainingBooks = books.slice(1);

    const related: Book[] = [];
    const others: Book[] = [];

    remainingBooks.forEach(book => {
        if ((book.relevanceScore || 0) >= 50) {
            related.push(book);
        } else {
            others.push(book);
        }
    });

    // Edge Case: If only 1 result, it's top match. Related/Others empty.

    return {
        topMatch,
        related,
        others
    };
};
