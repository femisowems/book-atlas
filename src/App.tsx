import { useState, useEffect } from 'react';
import type { Book } from './types/Book';
import { getEnrichedOverview, searchBooks } from './services/bookAggregator.service';
import BookGrid from './components/BookGrid';
import BookDetailsModal from './components/BookDetailsModal';
import SearchBar from './components/SearchBar';

const RECENT_SEARCHES_KEY = 'book-atlas-recent-searches';
const RECENT_SEARCH_LIMIT = 6;

function App() {
  // Data State
  const [trendingBooks, setTrendingBooks] = useState<Book[]>([]);
  const [searchResults, setSearchResults] = useState<Book[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // UI State
  const [query, setQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(RECENT_SEARCHES_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as string[];
        if (Array.isArray(parsed)) {
          setRecentSearches(parsed);
        }
      } catch {
        setRecentSearches([]);
      }
    }
  }, []);

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
  const persistRecentSearch = (value: string) => {
    const normalized = value.trim();
    if (!normalized) return;

    const updated = [normalized, ...recentSearches.filter((item) => item.toLowerCase() !== normalized.toLowerCase())]
      .slice(0, RECENT_SEARCH_LIMIT);

    setRecentSearches(updated);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
  };

  const handleSearch = async (newQuery: string) => {
    setQuery(newQuery);
    const normalized = newQuery.trim();

    if (!normalized) {
      setSearchResults([]);
      setSearchLoading(false);
      return;
    }

    setSearchLoading(true);
    try {
      const results = await searchBooks(normalized);
      setSearchResults(results);
      persistRecentSearch(normalized);
    } catch (e) {
      console.error("Search failed", e);
    } finally {
      setSearchLoading(false);
    }
  };

  const isSearching = searchInput.trim().length > 0;
  const editorialResults = searchResults.filter((book) => book.source === 'nyt' || !book.source);
  const broaderResults = searchResults.filter((book) => book.source === 'google');

  const suggestionPool = Array.from(new Set([
    ...trendingBooks.map((book) => book.title),
    ...trendingBooks.flatMap((book) => book.authors),
    ...recentSearches,
  ])).slice(0, 20);

  const spotlightBooks = trendingBooks.slice(0, 4);
  const radarBooks = trendingBooks.slice(4, 8);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-40 transition-colors duration-300">
        <div className="container mx-auto px-4 py-4 flex flex-col items-center">
          <div
            onClick={() => {
              setSearchInput('');
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
          <SearchBar
            query={searchInput}
            onQueryChange={setSearchInput}
            onSearch={handleSearch}
            onSelectSuggestion={setSearchInput}
            suggestions={suggestionPool}
            recentSearches={recentSearches}
          />
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
            <BookGrid books={[]} loading={true} onBookClick={() => { }} emptyTitle="Loading books" emptyDescription="Fetching this week's picks..." />
          </div>
        )}

        {/* VIEW 1: SEARCH RESULTS */}
        {isSearching && (
          <div className="space-y-12 animate-fade-in">
            <section>
              <div className="flex items-center justify-between mb-6 border-b border-gray-200 dark:border-gray-700 pb-2">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center">
                  Search Results: "{searchInput}"
                </h2>
                <span className="text-xs font-semibold text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
                  {searchResults.length} matches
                </span>
              </div>

              {searchResults.length === 0 && !searchLoading && query.trim() ? (
                <div className="text-center py-10 text-gray-500">
                  No reviews found matching your query.
                </div>
              ) : (
                <div className="space-y-12">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">Editorial Picks</h3>
                      <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">NYT Trusted</span>
                    </div>
                    <BookGrid
                      books={editorialResults}
                      loading={searchLoading}
                      onBookClick={setSelectedBook}
                      emptyTitle="No editorial matches yet"
                      emptyDescription="Try a broader title or author query."
                    />
                  </div>

                  {broaderResults.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">Broader Matches</h3>
                        <span className="text-xs font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-300">Google Books</span>
                      </div>
                      <BookGrid
                        books={broaderResults}
                        loading={false}
                        onBookClick={setSelectedBook}
                        emptyTitle="No broader matches"
                        emptyDescription="Enable Google Books integration for expanded discovery."
                      />
                    </div>
                  )}
                </div>
              )}
            </section>
          </div>
        )}

        {/* VIEW 2: TRENDING (Default) */}
        {!isSearching && !loading && !error && (
          <div className="space-y-12 animate-fade-in">

            <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 rounded-2xl p-6 bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg">
                <p className="uppercase tracking-widest text-xs font-semibold opacity-90 mb-2">This Week in Fiction</p>
                <h2 className="text-3xl font-extrabold leading-tight mb-2">Editorially Curated. Built for Fast Discovery.</h2>
                <p className="text-sm md:text-base text-blue-50 max-w-2xl">
                  Explore NYT-driven picks, then jump deeper with enriched metadata and quick preview links.
                </p>
              </div>
              <div className="rounded-2xl p-6 bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700">
                <p className="text-xs uppercase tracking-widest text-gray-500 font-semibold mb-3">Fast Picks</p>
                <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-200">
                  {trendingBooks.slice(0, 3).map((book) => (
                    <li key={`quick-${book.id}`} className="truncate">{book.title}</li>
                  ))}
                </ul>
              </div>
            </section>

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

              {spotlightBooks.length > 0 ? (
                <BookGrid books={spotlightBooks} loading={false} onBookClick={setSelectedBook} emptyTitle="No spotlight picks" emptyDescription="Please check back in a bit." />
              ) : (
                <div className="text-center py-10 text-gray-500">
                  No trending books found right now.
                </div>
              )}
            </section>

            <section>
              <div className="flex items-center justify-between mb-6 border-b border-gray-200 dark:border-gray-700 pb-2">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Critics' Radar</h2>
                <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200">
                  Fresh context
                </span>
              </div>
              <BookGrid
                books={radarBooks}
                loading={false}
                onBookClick={setSelectedBook}
                emptyTitle="No radar books"
                emptyDescription="We're refreshing this list with new editorial picks."
              />
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
