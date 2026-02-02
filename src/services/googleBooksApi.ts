import type { Book, GoogleBookResult, GoogleBooksApiResponse } from '../types/Book';

const BASE_URL = 'https://www.googleapis.com/books/v1/volumes';


export const searchBooks = async (
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

        const books = (data.items || []).map((item: GoogleBookResult) => ({
            id: item.id,
            title: item.volumeInfo.title || 'Untitled',
            authors: item.volumeInfo.authors || ['Unknown Author'],
            description: item.volumeInfo.description || 'No description available.',
            image: item.volumeInfo.imageLinks?.thumbnail || item.volumeInfo.imageLinks?.smallThumbnail || '',
            publishedYear: item.volumeInfo.publishedDate
                ? item.volumeInfo.publishedDate.split('-')[0]
                : 'N/A',
            previewLink: item.volumeInfo.previewLink || item.volumeInfo.infoLink || '#',
        }));

        return {
            books,
            totalItems: data.totalItems || 0,
        };
    } catch (error) {
        console.error('Failed to fetch books:', error);
        throw error;
    }
};
