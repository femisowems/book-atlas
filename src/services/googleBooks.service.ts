import type { Book, GoogleBookResult, GoogleBooksApiResponse } from '../types/Book';

const BASE_URL = 'https://www.googleapis.com/books/v1/volumes';

export const searchGoogleBooks = async (
    query: string,
    startIndex: number = 0,
    maxResults: number = 12
): Promise<{ books: Book[]; totalItems: number }> => {
    if (!query.trim()) return { books: [], totalItems: 0 };

    try {
        const API_KEY = import.meta.env.VITE_GOOGLE_BOOKS_API_KEY;

        const response = await fetch(
            `${BASE_URL}?q=${encodeURIComponent(query)}&startIndex=${startIndex}&maxResults=${maxResults}&key=${API_KEY}`
        );

        if (!response.ok) {
            throw new Error(`API Error: ${response.statusText}`);
        }

        const data: GoogleBooksApiResponse = await response.json();

        const books = (data.items || []).map((item: GoogleBookResult) => {
            const volumeInfo = item.volumeInfo;

            // Extract ISBN-13, fallback to ISBN-10
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
        });

        return {
            books,
            totalItems: data.totalItems || 0,
        };
    } catch (error) {
        console.error('Failed to fetch books from Google:', error);
        throw error;
    }
};
