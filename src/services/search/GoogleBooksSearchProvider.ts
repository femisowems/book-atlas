import type { SearchProvider } from './SearchProvider';
import type { Book } from '../../types/Book';

const BASE_URL = 'https://www.googleapis.com/books/v1/volumes';
let hasWarnedInvalidGoogleKey = false;

const isValidGoogleApiKey = (key: string | undefined): key is string => {
    if (!key) return false;
    const normalized = key.trim().toLowerCase();
    if (!normalized) return false;
    return !normalized.includes('your_google_books_api_key_here');
};

const getGoogleApiKey = (): string | null => {
    const key = import.meta.env.VITE_GOOGLE_BOOKS_API_KEY;
    if (isValidGoogleApiKey(key)) return key;

    if (!hasWarnedInvalidGoogleKey) {
        hasWarnedInvalidGoogleKey = true;
        console.warn('Google Books API key is missing or using a placeholder value. Set VITE_GOOGLE_BOOKS_API_KEY in your .env file or disable Google search.');
    }

    return null;
};

interface GoogleBookVolume {
    id: string;
    volumeInfo: {
        title: string;
        authors?: string[];
        description?: string;
        imageLinks?: {
            thumbnail?: string;
            smallThumbnail?: string;
        };
        publishedDate?: string;
        publisher?: string;
        pageCount?: number;
        categories?: string[];
        industryIdentifiers?: Array<{
            type: string;
            identifier: string;
        }>;
        previewLink?: string;
        canonicalVolumeLink?: string;
    };
}

export class GoogleBooksSearchProvider implements SearchProvider {
    async search(query: string): Promise<Book[]> {
        if (!query.trim()) return [];

        try {
            const apiKey = getGoogleApiKey();
            if (!apiKey) return [];
            const url = `${BASE_URL}?q=${encodeURIComponent(query)}&maxResults=20&key=${apiKey}`;

            const response = await fetch(url);
            if (!response.ok) {
                const body = await response.text();
                console.error(`Google Books API error: ${response.status} ${response.statusText}`, body);
                return [];
            }

            const data = await response.json();
            if (!data.items) return [];

            return data.items.map((item: GoogleBookVolume) => this.mapToBook(item));
        } catch (error) {
            console.error('Failed to search Google Books:', error);
            return [];
        }
    }

    async getByIsbn(isbn: string): Promise<Book | null> {
        try {
            const apiKey = getGoogleApiKey();
            if (!apiKey) return null;
            const url = `${BASE_URL}?q=isbn:${isbn}&maxResults=1&key=${apiKey}`;

            const response = await fetch(url);
            if (!response.ok) return null;

            const data = await response.json();
            if (!data.items || data.items.length === 0) return null;

            return this.mapToBook(data.items[0]);
        } catch (error) {
            console.error('Failed to get book by ISBN from Google Books:', error);
            return null;
        }
    }

    private mapToBook(item: GoogleBookVolume): Book {
        const info = item.volumeInfo;
        const isbn13 = info.industryIdentifiers?.find(id => id.type === 'ISBN_13')?.identifier;
        const isbn10 = info.industryIdentifiers?.find(id => id.type === 'ISBN_10')?.identifier;

        return {
            id: item.id,
            googleBooksId: item.id,
            source: 'google',
            title: info.title,
            authors: info.authors || ['Unknown Author'],
            description: info.description || 'No description available.',
            image: info.imageLinks?.thumbnail?.replace('http:', 'https:') || '', // Force HTTPS
            publishedYear: info.publishedDate ? info.publishedDate.split('-')[0] : 'N/A',
            publisher: info.publisher,
            pageCount: info.pageCount,
            subjects: info.categories,
            previewLink: info.previewLink || info.canonicalVolumeLink || '',
            isbn: isbn13 || isbn10,

            // Default NYT Fields (not applicable)
            rank: undefined,
            weeksOnList: undefined,
            buyLinks: []
        };
    }
}
