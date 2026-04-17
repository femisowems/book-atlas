import { useEffect, useMemo, useRef, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';

interface SearchBarProps {
    query: string;
    onQueryChange: (query: string) => void;
    onSearch: (query: string) => void;
    onSelectSuggestion: (query: string) => void;
    suggestions: string[];
    recentSearches: string[];
    placeholder?: string;
}

const SearchBar = ({
    query,
    onQueryChange,
    onSearch,
    onSelectSuggestion,
    suggestions,
    recentSearches,
    placeholder = "Search for books...",
}: SearchBarProps) => {
    const [isFocused, setIsFocused] = useState(false);
    const onSearchRef = useRef(onSearch);

    useEffect(() => {
        onSearchRef.current = onSearch;
    }, [onSearch]);

    const filteredSuggestions = useMemo(() => {
        const normalized = query.trim().toLowerCase();
        const suggestionPool = suggestions.filter((item) => item.trim().length > 0);
        const recentPool = recentSearches.filter((item) => item.trim().length > 0);

        if (!normalized) {
            return Array.from(new Set(recentPool)).slice(0, 5);
        }

        return Array.from(new Set([...suggestionPool, ...recentPool]))
            .filter((item) => item.toLowerCase().includes(normalized))
            .slice(0, 6);
    }, [query, suggestions, recentSearches]);

    useEffect(() => {
        const timer = setTimeout(() => {
            onSearchRef.current(query);
        }, 400);

        return () => clearTimeout(timer);
    }, [query]);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        onQueryChange(e.target.value);
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        onSearch(query);
    };

    const handleSuggestionSelect = (value: string) => {
        onQueryChange(value);
        onSelectSuggestion(value);
        setIsFocused(false);
    };

    return (
        <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto mb-2">
            <div className="relative">
                <input
                    type="text"
                    value={query}
                    onChange={handleChange}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setTimeout(() => setIsFocused(false), 100)}
                    placeholder={placeholder}
                    className="w-full p-4 pl-12 pr-16 text-base sm:text-lg rounded-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-shadow"
                    aria-label="Search books"
                />
                <svg
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                </svg>
                {query.trim().length > 0 && (
                    <button
                        type="button"
                        onClick={() => {
                            onQueryChange('');
                            onSearch('');
                        }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
                        aria-label="Clear search"
                    >
                        Clear
                    </button>
                )}
            </div>

            {isFocused && filteredSuggestions.length > 0 && (
                <div className="mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-lg overflow-hidden">
                    <p className="px-4 pt-3 pb-2 text-xs uppercase tracking-widest text-gray-500 font-semibold">
                        {query.trim() ? 'Suggestions' : 'Recent Searches'}
                    </p>
                    <ul className="pb-2">
                        {filteredSuggestions.map((item) => (
                            <li key={item}>
                                <button
                                    type="button"
                                    onMouseDown={() => handleSuggestionSelect(item)}
                                    className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                >
                                    {item}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </form>
    );
};

export default SearchBar;
