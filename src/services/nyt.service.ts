import type { Book, NYTListResponse, NYTOverviewResponse, NYTBookResult } from '../types/Book';

const BASE_URL = 'https://api.nytimes.com/svc/books/v3';

// Helper to map NYT result to our internal Book model
const mapNYTBookToBook = (item: NYTBookResult): Book => {
    return {
        id: item.primary_isbn13 || item.primary_isbn10 || item.title, // Use ISBN as ID if available
        title: item.title,
        authors: [item.author], // NYT gives single string, so we wrap it
        description: item.description || 'No description available.',
        image: item.book_image || '', // Fallback will be handled by UI or OpenLibrary enrichment
        publishedYear: 'N/A', // NYT lists don't always give pub year, usually just list date
        previewLink: item.book_review_link || item.sunday_review_link || '',
        isbn: item.primary_isbn13 || item.primary_isbn10,
        publisher: item.publisher,
        rank: item.rank,
        rankLastWeek: item.rank_last_week,
        weeksOnList: item.weeks_on_list,
        amazonUrl: item.amazon_product_url,
        buyLinks: item.buy_links,
        source: 'nyt',
    };
};

export const fetchNYTOverview = async (): Promise<Book[]> => {
    try {
        const API_KEY = import.meta.env.VITE_NYT_API_KEY;
        // Fetch "Overview" which gives top 5 from multiple lists (Fiction, Nonfiction, etc.)
        const response = await fetch(`${BASE_URL}/lists/overview.json?api-key=${API_KEY}`);

        if (!response.ok) {
            throw new Error(`NYT API Error: ${response.statusText}`);
        }

        const data: NYTOverviewResponse = await response.json();

        // Flatten the lists into a single stream of trending books
        // We might want to group them by listName later, but for now let's just grab the books.
        // We'll prioritize unique books.
        const allBooks: Book[] = [];
        const seenIds = new Set<string>();

        data.results.lists.forEach(list => {
            list.books.forEach(nytBook => {
                const book = mapNYTBookToBook(nytBook);
                if (!seenIds.has(book.id)) {
                    seenIds.add(book.id);
                    allBooks.push(book);
                }
            });
        });

        return allBooks.slice(0, 8);
    } catch (error) {
        console.error('Failed to fetch NYT Overview:', error);
        return [];
    }
};

export const fetchNYTList = async (listNameEncoded: string): Promise<Book[]> => {
    try {
        const API_KEY = import.meta.env.VITE_NYT_API_KEY;
        const response = await fetch(`${BASE_URL}/lists/current/${listNameEncoded}.json?api-key=${API_KEY}`);

        if (!response.ok) {
            throw new Error(`NYT API Error: ${response.statusText}`);
        }

        const data: NYTListResponse = await response.json();
        return (data.results.books || []).map(mapNYTBookToBook);

    } catch (error) {
        console.error(`Failed to fetch NYT List (${listNameEncoded}):`, error);
        return [];
    }
};

export const searchNYTReviews = async (query: string): Promise<Book[]> => {
    try {
        const API_KEY = import.meta.env.VITE_NYT_API_KEY;
        // Search reviews by title. NYT Reviews API is the closest proxy for "searching" books.
        const response = await fetch(`${BASE_URL}/reviews.json?title=${encodeURIComponent(query)}&api-key=${API_KEY}`);

        if (!response.ok) {
            return [];
        }

        const data = await response.json();
        const results = data.results || [];

        return results.map((item: any) => ({
            id: item.isbn13?.[0] || item.book_title,
            title: item.book_title,
            authors: [item.book_author],
            description: item.summary || 'No review summary available.',
            image: '', // Needs enrichment
            publishedYear: item.publication_dt ? item.publication_dt.split('-')[0] : 'N/A',
            previewLink: item.url, // Link to the NYT Review
            isbn: item.isbn13?.[0],
            publisher: '',
            rank: 0,
            weeksOnList: 0,
            buyLinks: [],
            source: 'nyt'
        }));

    } catch (error) {
        console.error('Failed to search NYT Reviews:', error);
        return [];
    }
}
