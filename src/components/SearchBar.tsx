import { useState, useEffect } from 'react';
import type { ChangeEvent, FormEvent } from 'react';

interface SearchBarProps {
    onSearch: (query: string) => void;
    placeholder?: string;
}

const SearchBar = ({ onSearch, placeholder = "Search for books..." }: SearchBarProps) => {
    const [query, setQuery] = useState('');

    // Debounce logic could be here, or expected to be in parent/service.
    // The Prompt asked to "Debounce search input (300–500ms)". 
    // I will implement it here to trigger onSearch after delay.

    useEffect(() => {
        const timer = setTimeout(() => {
            onSearch(query);
        }, 400);

        return () => clearTimeout(timer);
    }, [query, onSearch]);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setQuery(e.target.value);
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        onSearch(query);
    };

    return (
        <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto mb-8">
            <div className="relative">
                <input
                    type="text"
                    value={query}
                    onChange={handleChange}
                    placeholder={placeholder}
                    className="w-full p-4 pl-12 text-lg rounded-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-shadow"
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
            </div>
        </form>
    );
};

export default SearchBar;
