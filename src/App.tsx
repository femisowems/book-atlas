import { useState } from 'react';
import type { Book } from './types/Book';
import { searchBooks } from './services/googleBooksApi';
import SearchBar from './components/SearchBar';
import BookGrid from './components/BookGrid';
import BookDetailsModal from './components/BookDetailsModal';

function App() {
  const [query, setQuery] = useState('');
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [startIndex, setStartIndex] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  const fetchBooks = async (searchQuery: string, index: number, append: boolean = false) => {
    if (!searchQuery) return;

    setLoading(true);
    setError(null);

    try {
      const result = await searchBooks(searchQuery, index);
      setBooks(prev => append ? [...prev, ...result.books] : result.books);
      setTotalItems(result.totalItems);
    } catch (err) {
      setError('Failed to fetch books. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (newQuery: string) => {
    if (newQuery === query && startIndex === 0) return; // Avoid duplicate details

    setQuery(newQuery);
    setStartIndex(0);
    if (!newQuery.trim()) {
      setBooks([]);
      setTotalItems(0);
      return;
    }
    fetchBooks(newQuery, 0, false);
  };

  const handleLoadMore = () => {
    const nextIndex = startIndex + 12;
    setStartIndex(nextIndex);
    fetchBooks(query, nextIndex, true);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-10 transition-colors duration-300">
        <div className="container mx-auto px-4 py-4 flex flex-col items-center">
          <h1 className="text-3xl font-extrabold tracking-tight text-blue-600 dark:text-blue-400 mb-4">
            Book Atlas
          </h1>
          <SearchBar onSearch={handleSearch} />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <BookGrid
          books={books}
          loading={loading}
          onBookClick={setSelectedBook}
          error={error}
        />

        {!loading && books.length > 0 && books.length < totalItems && (
          <div className="flex justify-center mt-8">
            <button
              onClick={handleLoadMore}
              className="px-6 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-full shadow-sm hover:shadow-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-all font-medium text-blue-600 dark:text-blue-400"
            >
              Load More Books
            </button>
          </div>
        )}
      </main>

      <BookDetailsModal
        book={selectedBook}
        onClose={() => setSelectedBook(null)}
      />
    </div>
  );
}

export default App;
