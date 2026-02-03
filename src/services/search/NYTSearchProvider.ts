import type { SearchProvider } from './SearchProvider';
import { searchNYTReviews } from '../nyt.service';
import type { Book } from '../../types/Book';

export class NYTSearchProvider implements SearchProvider {
    async search(query: string): Promise<Book[]> {
        // Use the existing review search
        return searchNYTReviews(query);
    }

    async getByIsbn(isbn: string): Promise<Book | null> {
        // NYT API doesn't have a direct "lookup by ISBN" for book details other than reviews
        // We could search reviews by ISBN, but for now we'll return null 
        // as this is primarily for editorial content.
        // If we really needed it, we could try searchNYTReviews(isbn).
        const results = await searchNYTReviews(isbn);
        return results.length > 0 ? results[0] : null;
    }
}
