import type { Book } from '../types/Book';
import BookCard from './BookCard';

interface BookGridProps {
    books: Book[];
    loading: boolean;
    onBookClick: (book: Book) => void;
    error?: string | null;
}

const BookGrid = ({ books, loading, onBookClick, error }: BookGridProps) => {
    if (error) {
        return (
            <div className="text-center py-20">
                <h2 className="text-2xl font-bold text-red-500 mb-2">Something went wrong</h2>
                <p className="text-gray-600 dark:text-gray-400">{error}</p>
            </div>
        );
    }

    if (!loading && books.length === 0) {
        return (
            <div className="text-center py-20">
                <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-2">No books found</h2>
                <p className="text-gray-600 dark:text-gray-400">Try searching for something else.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-4">
            {books.map((book) => (
                <div key={book.id} className="h-full">
                    <BookCard book={book} onClick={onBookClick} />
                </div>
            ))}

            {loading && Array.from({ length: 8 }).map((_, i) => (
                <div key={`skeleton-${i}`} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 animate-pulse h-full flex flex-col">
                    <div className="bg-gray-300 dark:bg-gray-700 h-48 w-full mb-4 rounded"></div>
                    <div className="bg-gray-300 dark:bg-gray-700 h-6 w-3/4 mb-2 rounded"></div>
                    <div className="bg-gray-300 dark:bg-gray-700 h-4 w-1/2 rounded"></div>
                </div>
            ))}
        </div>
    );
};

export default BookGrid;
