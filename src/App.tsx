import { useState, useEffect } from 'react';
import type { Book } from './types/Book';
import { searchAndEnrichBooks } from './services/bookAggregator.service';
import { fetchPopularBooks, fetchRecentBooks } from './services/discovery.service';
import SearchBar from './components/SearchBar';
import BookGrid from './components/BookGrid';
import BookDetailsModal from './components/BookDetailsModal';
import { groupSearchResults } from './utils/searchGrouping';
import BookCard from './components/BookCard';

function App() {
  const [query, setQuery] = useState('');
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [startIndex, setStartIndex] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  // Discovery State
  const [popularBooks, setPopularBooks] = useState<Book[]>([]);
  const [recentBooks, setRecentBooks] = useState<Book[]>([]);
  const [discoveryLoading, setDiscoveryLoading] = useState(true);

  // Initial Discovery Fetch
  useEffect(() => {
    const loadDiscoveryContent = async () => {
      setDiscoveryLoading(true);
      try {
        const [popular, recent] = await Promise.all([
          fetchPopularBooks(),
          fetchRecentBooks()
        ]);
        setPopularBooks(popular);
        setRecentBooks(recent);
      } catch (e) {
        console.error("Failed to load discovery content", e);
      } finally {
        setDiscoveryLoading(false);
      }
    };

    loadDiscoveryContent();
  }, []);

  const fetchBooks = async (searchQuery: string, index: number, append: boolean = false) => {
    if (!searchQuery) return;

    setLoading(true);
    setError(null);

    try {
      const result = await searchAndEnrichBooks(searchQuery, index);
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
    /* 
       If component state is consistent, we can just check `query` vs `newQuery`.
       However, we want to allow re-searching if the user clears input and types again.
    */
    if (newQuery === query && startIndex === 0 && newQuery !== '') return;

    setQuery(newQuery);
    setStartIndex(0); // Reset pagination
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

  // Group books for search results
  const { topMatch, related, others } = groupSearchResults(books);

  // Determine Mode: Search vs Discovery
  const isSearching = query.trim().length > 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-10 transition-colors duration-300">
        <div className="container mx-auto px-4 py-4 flex flex-col items-center">
          <div
            onClick={() => {
              setQuery('');
              setBooks([]);
              setTotalItems(0);
              setStartIndex(0);
            }}
            className="cursor-pointer mb-4"
          >
            <h1 className="text-3xl font-extrabold tracking-tight text-blue-600 dark:text-blue-400">
              Book Atlas
            </h1>
          </div>
          <SearchBar onSearch={handleSearch} />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">

        {/* VIEW 1: DISCOVERY (Initial State) */}
        {!isSearching && (
          <div className="space-y-12 animate-fade-in">
            {/* Popular Section */}
            <section>
              <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white flex items-center">
                <svg className="w-6 h-6 mr-2 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                Popular Right Now
              </h2>
              <BookGrid books={popularBooks} loading={discoveryLoading} onBookClick={setSelectedBook} />
            </section>

            {/* Recent Section */}
            <section>
              <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white flex items-center">
                <svg className="w-6 h-6 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Recently Added
              </h2>
              <BookGrid books={recentBooks} loading={discoveryLoading} onBookClick={setSelectedBook} />
            </section>
          </div>
        )}

        {/* VIEW 2: SEARCH RESULTS */}
        {isSearching && (
          <>
            {error && (
              <div className="text-center py-20">
                <h2 className="text-2xl font-bold text-red-500 mb-2">Something went wrong</h2>
                <p className="text-gray-600 dark:text-gray-400">{error}</p>
              </div>
            )}

            {!loading && books.length === 0 && !error && (
              <div className="text-center py-20">
                <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-2">No books found</h2>
                <p className="text-gray-600 dark:text-gray-400">Try searching for something else.</p>
              </div>
            )}

            {/* Loading Skeletons for Initial Search */}
            {loading && books.length === 0 && (
              <BookGrid books={[]} loading={true} onBookClick={() => { }} />
            )}

            {/* Results */}
            {books.length > 0 && (
              <div className="space-y-12 animate-fade-in">

                {/* Top Section: Best Match + Related */}
                <div className="flex flex-col lg:flex-row gap-8 items-start">

                  {/* 1. Best Match Section */}
                  {topMatch && (
                    <section className="w-full lg:w-1/3 flex-shrink-0">
                      <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white flex items-center">
                        <span className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-xs font-bold px-2 py-1 rounded uppercase tracking-wider mr-2">
                          Best Match
                        </span>
                        Top Result
                      </h2>
                      <div className="w-full">
                        <BookCard book={topMatch} onClick={setSelectedBook} />
                      </div>
                    </section>
                  )}

                  {/* 2. Related Section */}
                  {related.length > 0 && (
                    <section className="flex-1 w-full">
                      <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
                        Highly Relevant
                      </h2>
                      <BookGrid books={related} loading={false} onBookClick={setSelectedBook} />
                    </section>
                  )}
                </div>

                {/* 3. Others / More Results */}
                {(others.length > 0 || loading) && (
                  <section>
                    {/* Only show header if we have other sections above it */}
                    {(topMatch || related.length > 0) && (
                      <h2 className="text-lg font-semibold mb-4 text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                        Other Results
                      </h2>
                    )}
                    <BookGrid books={others} loading={loading} onBookClick={setSelectedBook} />
                  </section>
                )}
              </div>
            )}

            {/* Load More Button */}
            {!loading && books.length > 0 && books.length < totalItems && (
              <div className="flex justify-center mt-12 pb-8">
                <button
                  onClick={handleLoadMore}
                  className="px-8 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-full shadow-sm hover:shadow-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-all font-medium text-blue-600 dark:text-blue-400"
                >
                  Load More Books
                </button>
              </div>
            )}
          </>
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
