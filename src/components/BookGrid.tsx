import type { Book } from '../types/Book';
import BookCard from './BookCard';

interface BookGridProps {
    books: Book[];
    loading: boolean;
    onBookClick: (book: Book) => void;
    error?: string | null;
    emptyTitle?: string;
    emptyDescription?: string;
}

const BookGrid = ({
    books,
    loading,
    onBookClick,
    error,
    emptyTitle = 'No books found',
    emptyDescription = 'Try searching for something else.',
}: BookGridProps) => {
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
                <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-2">{emptyTitle}</h2>
                <p className="text-gray-600 dark:text-gray-400">{emptyDescription}</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 p-1 sm:p-2">
            {books.map((book) => (
                <div key={book.id} className="h-full">
                    <BookCard book={book} onClick={onBookClick} />
                </div>
            ))}

            {loading && Array.from({ length: 8 }).map((_, i) => (
                <div key={`skeleton-${i}`} className="bg-white dark:bg-gray-800 rounded-xl shadow-md animate-pulse h-full overflow-hidden">
                    <div className="aspect-[2/3] w-full bg-gray-300 dark:bg-gray-700"></div>
                    <div className="p-4 space-y-3">
                        <div className="bg-gray-300 dark:bg-gray-700 h-5 w-11/12 rounded"></div>
                        <div className="bg-gray-300 dark:bg-gray-700 h-4 w-7/12 rounded"></div>
                        <div className="flex gap-2 pt-1">
                            <div className="bg-gray-300 dark:bg-gray-700 h-5 w-20 rounded-full"></div>
                            <div className="bg-gray-300 dark:bg-gray-700 h-5 w-16 rounded-full"></div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default BookGrid;
