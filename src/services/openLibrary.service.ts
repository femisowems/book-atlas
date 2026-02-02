import type { Book } from '../types/Book';

const BASE_URL = 'https://openlibrary.org/api/books';

interface OpenLibraryResponse {
    [key: string]: {
        publishers?: Array<{ name: string }>;
        publish_date?: string;
        number_of_pages?: number;
        subjects?: Array<{ name: string }>;
        cover?: {
            medium?: string;
            large?: string;
        };
        title?: string;
        authors?: Array<{ name: string }>;
    };
}

export const fetchOpenLibraryMetadata = async (isbn: string): Promise<Partial<Book> | null> => {
    if (!isbn) return null;

    try {
        const bibkey = `ISBN:${isbn}`;
        const response = await fetch(
            `${BASE_URL}?bibkeys=${bibkey}&jscmd=data&format=json`
        );

        if (!response.ok) {
            return null;
        }

        const data: OpenLibraryResponse = await response.json();
        const bookData = data[bibkey];

        if (!bookData) return null;

        return {
            publisher: bookData.publishers?.[0]?.name,
            publishedYear: bookData.publish_date ? bookData.publish_date.split(' ').pop() : undefined, // Simplify year extraction
            pageCount: bookData.number_of_pages,
            subjects: bookData.subjects?.map(s => s.name).slice(0, 5), // Limit to 5 subjects
            image: bookData.cover?.large || bookData.cover?.medium,
        };
    } catch (error) {
        console.warn(`Failed to fetch Open Library metadata for ISBN ${isbn}:`, error);
        return null; // Fail silently to not disrupt the main flow
    }
};
