import { useState, useEffect } from 'react';
import type { Book } from './types/Book';
import { getEnrichedOverview, searchBooks } from './services/bookAggregator.service';
import BookGrid from './components/BookGrid';
import BookDetailsModal from './components/BookDetailsModal';
import SearchBar from './components/SearchBar';

function App() {
  // Data State
  const [trendingBooks, setTrendingBooks] = useState<Book[]>([]);
  const [searchResults, setSearchResults] = useState<Book[]>([]);

  // UI State
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  // Load Trending on Mount
  useEffect(() => {
    const loadContent = async () => {
      setLoading(true);
      setError(null);
      try {
        const books = await getEnrichedOverview();
        setTrendingBooks(books);
      } catch (err) {
        console.error("Failed to load NYT content", err);
        setError("Failed to load best sellers. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    loadContent();
  }, []);

  // Handle Search
  const handleSearch = async (newQuery: string) => {
    setQuery(newQuery);
    if (!newQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setSearchLoading(true);
    setSearchResults([]); // Clear previous results immediately
    try {
      const results = await searchBooks(newQuery);
      setSearchResults(results);
    } catch (e) {
      console.error("Search failed", e);
    } finally {
      setSearchLoading(false);
    }
  };

  const isSearching = query.trim().length > 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-10 transition-colors duration-300">
        <div className="container mx-auto px-4 py-4 flex flex-col items-center">
          <div
            onClick={() => {
              setQuery('');
              setSearchResults([]);
            }}
            className="cursor-pointer mb-[-4px]"
          >
            <h1 className="text-3xl font-extrabold tracking-tight text-blue-600 dark:text-blue-400">
              Book Atlas
            </h1>
          </div>
          <p className="text-sm text-gray-500 mt-1 uppercase tracking-widest font-semibold mb-4">
            Curated by The New York Times
          </p>
          <SearchBar onSearch={handleSearch} />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {error && !isSearching && (
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold text-red-500 mb-2">Something went wrong</h2>
            <p className="text-gray-600 dark:text-gray-400">{error}</p>
          </div>
        )}

        {/* Global Loading (Initial) */}
        {loading && !isSearching && (
          <div className="space-y-8 animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 w-1/3 rounded mb-6"></div>
            <BookGrid books={[]} loading={true} onBookClick={() => { }} />
          </div>
        )}

        {/* VIEW 1: SEARCH RESULTS */}
        {isSearching && (
          <div className="space-y-12 animate-fade-in">
            <section>
              <div className="flex items-center justify-between mb-6 border-b border-gray-200 dark:border-gray-700 pb-2">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center">
                  Search Results: "{query}"
                </h2>
                <span className="text-xs font-semibold text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                  All Results
                </span>
              </div>

              {searchResults.length === 0 && !searchLoading ? (
                <div className="text-center py-10 text-gray-500">
                  No reviews found matching your query.
                </div>
              ) : (
                <BookGrid books={searchResults} loading={searchLoading} onBookClick={setSelectedBook} />
              )}
            </section>
          </div>
        )}

        {/* VIEW 2: TRENDING (Default) */}
        {!isSearching && !loading && !error && (
          <div className="space-y-12 animate-fade-in">

            {/* Trending Section */}
            <section>
              <div className="flex items-center justify-between mb-6 border-b border-gray-200 dark:border-gray-700 pb-2">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center">
                  <svg className="w-6 h-6 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                  Trending This Week
                </h2>
                <button className="text-xs font-bold text-white bg-black dark:bg-white dark:text-black px-3 py-1 rounded-full uppercase tracking-wider hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors shadow-sm">
                  NYT Best Sellers
                </button>
              </div>

              {trendingBooks.length > 0 ? (
                <BookGrid books={trendingBooks} loading={false} onBookClick={setSelectedBook} />
              ) : (
                <div className="text-center py-10 text-gray-500">
                  No trending books found right now.
                </div>
              )}
            </section>
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
