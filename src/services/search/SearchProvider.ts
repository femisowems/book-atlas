export interface SearchProvider {
    search(query: string): Promise<import('../../types/Book').Book[]>;
    getByIsbn(isbn: string): Promise<import('../../types/Book').Book | null>;
}
