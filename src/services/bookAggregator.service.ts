import { fetchNYTOverview, fetchNYTList } from './nyt.service';
import { fetchOpenLibraryMetadata } from './openLibrary.service';
import type { Book } from '../types/Book';

// Helper to enrich a list of books with Open Library data
const enrichBooks = async (books: Book[]): Promise<Book[]> => {
    return Promise.all(
        books.map(async (book) => {
            if (!book.isbn) {
                return book;
            }

            // We fail silently if OL fails, just returning the original book
            try {
                const olData = await fetchOpenLibraryMetadata(book.isbn);
                if (!olData) return book;

                return {
                    ...book,
                    publisher: book.publisher || olData.publisher,
                    publishedYear: book.publishedYear !== 'N/A' ? book.publishedYear : (olData.publishedYear || 'N/A'),
                    pageCount: book.pageCount || olData.pageCount,
                    subjects: Array.from(new Set([...(book.subjects || []), ...(olData.subjects || [])])),
                    // If NYT image is missing/placeholder, try Open Library
                    image: book.image || olData.image || '',
                };
            } catch (error) {
                // Silently fail enrichment
                return book;
            }
        })
    );
};

export const getEnrichedOverview = async (): Promise<Book[]> => {
    const nytBooks = await fetchNYTOverview();
    return enrichBooks(nytBooks);
};

export const getEnrichedList = async (listNameEncoded: string): Promise<Book[]> => {
    const nytBooks = await fetchNYTList(listNameEncoded);
    return enrichBooks(nytBooks);
};


import { NYTSearchProvider } from './search/NYTSearchProvider';
import { GoogleBooksSearchProvider } from './search/GoogleBooksSearchProvider';

const nytProvider = new NYTSearchProvider();
const googleProvider = new GoogleBooksSearchProvider();

export const searchBooks = async (query: string): Promise<Book[]> => {
    // 1. Always Search NYT Reviews (Trusted/Editorial)
    const nytResults = await nytProvider.search(query);
    const enrichedNYT = await enrichBooks(nytResults);

    // 2. Check Feature Flag for Google Books
    const enableGoogle = import.meta.env.VITE_ENABLE_GOOGLE_BOOKS_SEARCH === 'true';
    if (!enableGoogle) {
        return enrichedNYT;
    }

    // 3. Search Google Books (Algorithmic/Broad)
    try {
        const googleResults = await googleProvider.search(query);

        // 4. Merge & Deduplicate
        // Filter out Google results that match NYT ISBNs (prefer NYT entry)
        const nytIsbns = new Set(enrichedNYT.map(b => b.isbn).filter(Boolean));
        const uniqueGoogleResults = googleResults.filter(b => !b.isbn || !nytIsbns.has(b.isbn));

        return [...enrichedNYT, ...uniqueGoogleResults];
    } catch (err) {
        console.error('Google Books Search failed', err);
        return enrichedNYT;
    }
};
