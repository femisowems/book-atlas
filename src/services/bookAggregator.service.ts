import { searchGoogleBooks } from './googleBooks.service';
import { fetchOpenLibraryMetadata } from './openLibrary.service';
import type { Book } from '../types/Book';

export const searchAndEnrichBooks = async (
    query: string,
    startIndex: number = 0,
    maxResults: number = 13
): Promise<{ books: Book[]; totalItems: number }> => {
    // 1. Fetch from Google Books
    const googleResults = await searchGoogleBooks(query, startIndex, maxResults);

    if (googleResults.books.length === 0) {
        return googleResults;
    }

    // 2. Enrich with Open Library data in parallel
    const enrichedBooks = await Promise.all(
        googleResults.books.map(async (book) => {
            if (!book.isbn) {
                return book;
            }

            const olData = await fetchOpenLibraryMetadata(book.isbn);

            if (!olData) {
                return book;
            }

            // 3. Merge data (Prefer Google Books for existing, fill gaps with OL)
            return {
                ...book,
                publisher: book.publisher || olData.publisher,
                // If Google has a year, use it; otherwise fallback to OL year
                publishedYear: book.publishedYear !== 'N/A' ? book.publishedYear : (olData.publishedYear || 'N/A'),
                pageCount: book.pageCount || olData.pageCount,
                // Merge subjects, removing duplicates
                subjects: Array.from(new Set([...(book.subjects || []), ...(olData.subjects || [])])),
                // Prefer Google image, fallback to OL if Google image is missing or default placeholder (if we had one)
                // Assuming empty string means no image in our current logic
                image: book.image || olData.image || '',
            };
        })
    );

    return {
        books: enrichedBooks,
        totalItems: googleResults.totalItems
    };
};
