import type { Book, GoogleBookResult, GoogleBooksApiResponse } from '../types/Book';

const BASE_URL = 'https://www.googleapis.com/books/v1/volumes';

const JUNK_KEYWORDS = [
    'court', 'division', 'department', 'committee', 'hearings',
    'proceedings', 'catalog', 'records', 'report', 'symposium',
    'legislature', 'bureau', 'administration', 'calendar'
];

const filterJunkResults = (book: Book): boolean => {
    // 1. Must have title and authors
    if (!book.title || !book.authors || book.authors.length === 0 || book.authors[0] === 'Unknown Author') {
        return false;
    }

    const lowerTitle = book.title.toLowerCase();

    // 2. Filter out government/bureaucratic terms
    if (JUNK_KEYWORDS.some(keyword => lowerTitle.includes(keyword))) {
        return false;
    }

    return true;
};

const calculateRelevanceScore = (book: Book, query: string): number => {
    let score = 0;
    const lowerQuery = query.toLowerCase().trim();
    const lowerTitle = book.title.toLowerCase();
    const authors = book.authors.map(a => a.toLowerCase());

    // 1. Exact Title Match (+100)
    if (lowerTitle === lowerQuery) {
        score += 100;
    }
    // 2. Partial Title Match (+70)
    else if (lowerTitle.includes(lowerQuery)) {
        score += 70;
    }
    // 3. Keyword Overlap (+15)
    else {
        // If not a direct substring, do we share words?
        const queryWords = lowerQuery.split(/\s+/);
        const titleWords = lowerTitle.split(/\s+/);
        const hasOverlap = queryWords.some(word => word.length > 3 && titleWords.includes(word));
        if (hasOverlap) score += 15;
    }

    // 4. Author Match (+40)
    const authorMatch = authors.some(author => author.includes(lowerQuery));
    if (authorMatch) {
        score += 40;
    }

    return score;
};

export const searchGoogleBooks = async (
    query: string,
    startIndex: number = 0,
    maxResults: number = 12
): Promise<{ books: Book[]; totalItems: number }> => {
    if (!query.trim()) return { books: [], totalItems: 0 };

    try {
        const API_KEY = import.meta.env.VITE_GOOGLE_BOOKS_API_KEY;

        // Structured Query
        const encodedQuery = encodeURIComponent(query);
        // intitle:{query} OR inauthor:{query} OR {query}
        const structuredQuery = `intitle:${encodedQuery}+OR+inauthor:${encodedQuery}+OR+${encodedQuery}`;

        // Fetch up to 40 to have a good candidate pool
        const fetchLimit = 40;

        const response = await fetch(
            `${BASE_URL}?q=${structuredQuery}&startIndex=${startIndex}&maxResults=${fetchLimit}&orderBy=relevance&printType=books&key=${API_KEY}`
        );

        if (!response.ok) {
            throw new Error(`API Error: ${response.statusText}`);
        }

        const data: GoogleBooksApiResponse = await response.json();

        let books = (data.items || []).map((item: GoogleBookResult) => {
            const volumeInfo = item.volumeInfo;

            const isbn13 = volumeInfo.industryIdentifiers?.find(id => id.type === 'ISBN_13')?.identifier;
            const isbn10 = volumeInfo.industryIdentifiers?.find(id => id.type === 'ISBN_10')?.identifier;
            const isbn = isbn13 || isbn10;

            const book: Book = {
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

            book.relevanceScore = calculateRelevanceScore(book, query);
            return book;
        });

        // Filter Junk
        books = books.filter(filterJunkResults);

        // Sort by Score Descending
        books.sort((a, b) => {
            return (b.relevanceScore || 0) - (a.relevanceScore || 0);
        });

        // Return requested slice
        const returnedBooks = books.slice(0, maxResults);

        return {
            books: returnedBooks,
            totalItems: data.totalItems || 0, // Note: filtering reduces actual totalItems but we keep API count
        };
    } catch (error) {
        console.error('Failed to fetch books from Google:', error);
        throw error;
    }
};
