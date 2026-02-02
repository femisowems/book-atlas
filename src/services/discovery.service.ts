import type { Book, GoogleBookResult, GoogleBooksApiResponse } from '../types/Book';

const BASE_URL = 'https://www.googleapis.com/books/v1/volumes';

// Reusing the mapping logic from googleBooks.service.ts but keeping it self-contained
// to avoid circular deps or tight coupling if we want to change discovery specific mapping later.
const mapGoogleBookToBook = (item: GoogleBookResult): Book => {
    const volumeInfo = item.volumeInfo;
    const isbn13 = volumeInfo.industryIdentifiers?.find(id => id.type === 'ISBN_13')?.identifier;
    const isbn10 = volumeInfo.industryIdentifiers?.find(id => id.type === 'ISBN_10')?.identifier;
    const isbn = isbn13 || isbn10;

    return {
        id: item.id,
        title: volumeInfo.title || 'Untitled',
        authors: volumeInfo.authors || ['Unknown Author'],
        description: volumeInfo.description || 'No description available.',
        image: volumeInfo.imageLinks?.thumbnail || volumeInfo.imageLinks?.smallThumbnail || '',
        publishedYear: volumeInfo.publishedDate
            ? volumeInfo.publishedDate.split('-')[0]
            : 'N/A',
        previewLink: volumeInfo.previewLink || volumeInfo.infoLink || '#',
        isbn,
        publisher: volumeInfo.publisher,
        pageCount: volumeInfo.pageCount,
        subjects: volumeInfo.categories,
    };
};

export const fetchPopularBooks = async (): Promise<Book[]> => {
    try {
        const API_KEY = import.meta.env.VITE_GOOGLE_BOOKS_API_KEY;
        // Popular: Broad search for 'fiction' which usually prioritizes bestsellers by relevance
        const query = 'fiction';

        const response = await fetch(
            `${BASE_URL}?q=${encodeURIComponent(query)}&orderBy=relevance&printType=books&maxResults=6&key=${API_KEY}`
        );

        if (!response.ok) return [];

        const data: GoogleBooksApiResponse = await response.json();
        return (data.items || []).map(mapGoogleBookToBook);
    } catch (error) {
        console.warn('Failed to fetch popular books:', error);
        return [];
    }
};

export const fetchRecentBooks = async (): Promise<Book[]> => {
    try {
        const API_KEY = import.meta.env.VITE_GOOGLE_BOOKS_API_KEY;
        // Recent: Fiction, ordered by newest. Fetch more to client-side filter for actual recent years.
        const query = 'subject:fiction';

        const response = await fetch(
            `${BASE_URL}?q=${encodeURIComponent(query)}&orderBy=newest&printType=books&maxResults=20&key=${API_KEY}`
        );

        if (!response.ok) return [];

        const data: GoogleBooksApiResponse = await response.json();
        const books = (data.items || []).map(mapGoogleBookToBook);

        // Client-side filter: Ensure they are from the last 3 years (e.g. 2023-2026)
        const currentYear = new Date().getFullYear();
        const minYear = currentYear - 3;

        return books
            .filter(b => {
                const year = parseInt(b.publishedYear);
                return !isNaN(year) && year >= minYear;
            })
            .slice(0, 6);
    } catch (error) {
        console.warn('Failed to fetch recent books:', error);
        return [];
    }
};
